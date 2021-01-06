using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SohbetUygulamasi.Data
{
    public class SohbetUygulamasiDbContext : DbContext
    {
        public SohbetUygulamasiDbContext(DbContextOptions<SohbetUygulamasiDbContext> options) 
            : base(options) { }

        public DbSet<Kullanici> Kullanicilar { get; set; }
    }
}
