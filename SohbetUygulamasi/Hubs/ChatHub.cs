using Microsoft.AspNetCore.SignalR;
using SohbetUygulamasi.Data;
using SohbetUygulamasi.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SohbetUygulamasi.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SohbetUygulamasiDbContext db;
        private static List<Kullanici> genelOda = new List<Kullanici>();

        public ChatHub(SohbetUygulamasiDbContext sohbetUygulamasiDbContext)
        {
            db = sohbetUygulamasiDbContext;
        }

        public async Task Katil(string takmaAd)
        {
            if (!ChatUtility.TakmaAdGecerliMi(takmaAd))
                return;

            // bağlı böyle bir kullanıcı var mı?
            if (db.Kullanicilar.Any(x => x.KullaniciAd == takmaAd && x.BagliMi))
            {
                await Clients.Caller.SendAsync("TakmaAdKullanimda");
                return;
            }

            // bağlı olmayan bu isimde bir kullanıcı var mı?
            var kullanici = db.Kullanicilar.FirstOrDefault(x => x.KullaniciAd == takmaAd);

            if (kullanici == null)
            {
                kullanici = new Kullanici()
                {
                    BagliMi = true,
                    KullaniciAd = takmaAd,
                    ConnectionId = Context.ConnectionId,
                    GirisZamani = DateTime.Now
                };
                db.Kullanicilar.Add(kullanici);
            }
            else
            {
                kullanici.GirisZamani = DateTime.Now;
                kullanici.CikisZamani = null;
                kullanici.BagliMi = true;
                kullanici.ConnectionId = Context.ConnectionId;
            }
            db.SaveChanges();

            // kullanıcıyı genel sohbet odasına katalım
            await Groups.AddToGroupAsync(kullanici.ConnectionId, "genel");
            genelOda.Add(kullanici);
            await Clients.Caller.SendAsync("SohbeteGirildi", genelOda.Select(x => x.KullaniciAd));
            await Clients.Others.SendAsync("KullaniciSohbeteGirdi", kullanici.KullaniciAd);
        }

        // alici # ile başlıyorsa sohbet odasıdır, @ ile başlıyorsa kullanıcıdır
        public async Task MesajGonder(string mesaj, string alici)
        {
            mesaj = mesaj.Trim();
            alici = alici.Trim();

            if (string.IsNullOrEmpty(mesaj) || string.IsNullOrEmpty(alici) || mesaj.Length > 400)
                return;

            // alici # ile başlıyorsa mesajı bir odaya gönderiyordur
            if (alici.StartsWith("#"))
            {
                string odaAd = alici.Substring(1);

                // şu an için sadece genel adlı odayı destekliyoruz
                if (odaAd == "genel")
                {
                    var kullanici = OdadakiKullanici();
                    await Clients.Group(odaAd).SendAsync("MesajAlindi", kullanici.KullaniciAd, mesaj, alici);
                }
            }
            // alici @ ile başlıyorsa mesaj bir kullanıcıya gönderiliyordur
            else if (alici.StartsWith("@"))
            {
                var gonderenAd = CallerKullanici().KullaniciAd;
                var aliciAd = alici.Substring(1);
                var aliciKullanici = AdiylaKullanici(aliciAd);
                if (aliciKullanici == null) return;

                await Clients.Caller.SendAsync("DmGonderildi", gonderenAd, mesaj, alici);
                await Clients.Client(aliciKullanici.ConnectionId).SendAsync("DmAlindi", gonderenAd, mesaj, "@" + gonderenAd);
            }
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var kullanici = await GenelOdadanCikarAsync();

            if (kullanici != null)
            {
                kullanici.BagliMi = false;
                kullanici.CikisZamani = DateTime.Now;
                kullanici.ConnectionId = null;
                db.Update(kullanici);
                db.SaveChanges();
            }


            await base.OnDisconnectedAsync(exception);
        }

        private async Task<Kullanici> GenelOdadanCikarAsync()
        {
            var kullanici = OdadakiKullanici();
            if (kullanici != null)
            {
                genelOda.Remove(kullanici);
                await Groups.RemoveFromGroupAsync(kullanici.ConnectionId, "genel");
                await Clients.All.SendAsync("KullaniciSohbettenCikti", kullanici.KullaniciAd);
            }

            return kullanici;


        }

        // şu an için sadece genel odaya destek veriyoruz
        private Kullanici OdadakiKullanici(string odaAd = "genel")
        {
            if (odaAd == "genel")
            {
                return genelOda.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            }

            return null;
        }

        private Kullanici AdiylaKullanici(string aliciAd)
        {
            return db.Kullanicilar.FirstOrDefault(x => x.KullaniciAd == aliciAd && x.BagliMi);
        }

        private Kullanici CallerKullanici()
        {
            return db.Kullanicilar.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId && x.BagliMi);
        }
    }
}
