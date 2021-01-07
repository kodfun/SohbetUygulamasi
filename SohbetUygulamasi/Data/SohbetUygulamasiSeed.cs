using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SohbetUygulamasi.Data
{
    public static class SohbetUygulamasiSeed
    {
        public static void BaglantilariKapat(SohbetUygulamasiDbContext context)
        {
            foreach (var kullanici in context.Kullanicilar)
            {
                kullanici.BagliMi = false;
            }
            context.SaveChanges();
        }
    }
}
