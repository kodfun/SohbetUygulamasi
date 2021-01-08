using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SohbetUygulamasi.Utilities
{
    public static class ChatUtility
    {
        static readonly string takmaAdIzinVerilenKarakterler = "abcçdefgğhıijklmnoöpqrsştuüvwxyzABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZ0123456789";

        public static bool TakmaAdGecerliMi(string takmaAd)
        {
            if (string.IsNullOrWhiteSpace(takmaAd) || takmaAd.Length > 15)
                return false;

            foreach (var c in takmaAd)
                if (!takmaAdIzinVerilenKarakterler.Contains(c))
                    return false;

            return true;
        }
    }
}
