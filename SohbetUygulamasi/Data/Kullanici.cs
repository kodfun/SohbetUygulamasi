using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SohbetUygulamasi.Data
{
    public class Kullanici
    {
        public int Id { get; set; }

        [Required, MaxLength(15)]
        public string KullaniciAd { get; set; }

        public string ConnectionId { get; set; }

        public bool BagliMi { get; set; }

        public DateTime? GirisZamani { get; set; }

        public DateTime? CikisZamani { get; set; }
    }
}
