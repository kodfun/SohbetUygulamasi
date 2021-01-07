using Microsoft.AspNetCore.SignalR;
using SohbetUygulamasi.Data;
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
            var kullanici = genelOda.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (kullanici != null)
            {
                genelOda.Remove(kullanici);
                await Groups.RemoveFromGroupAsync(kullanici.ConnectionId, "genel");
                await Clients.All.SendAsync("KullaniciSohbettenCikti", kullanici.KullaniciAd);
            }

            return kullanici;


        }
    }
}
