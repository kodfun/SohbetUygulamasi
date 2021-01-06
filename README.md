https://docs.microsoft.com/en-us/ef/core/dbcontext-configuration/
https://docs.microsoft.com/en-us/ef/core/miscellaneous/connection-strings
https://docs.microsoft.com/en-us/aspnet/core/data/ef-mvc/intro?view=aspnetcore-5.0#create-the-database-context

Geliştirmek İstediğimiz Uygulama:
Özel mesajlaşmanın ve genel sohbet odasının bulunduğu bir chat uygulaması

Kullanacağımız teknolojiler:
ASP.NET CORE 3.1 SignalR
Bootstrap 4
JQuery
JavaScript/Html

Veritabanı: mssql server localdb
Erişim Yöntemi: Entity Framework Core

Kullanıcılar takma isimlerle bağlanacak ve bu onların kullanıcı adı olacak.
Eğer bağlantıları koparsa bu isim boşa düşecek ve başka birisi aynı adla bağlanabilecek.

Sohbet odasında son yazılan mesajları yeni gelenler görebilecek (son 5dakika içinde yazılan ya da son 50 mesaj gibi)

Önce veritabanını modelleyelim, sonra arayüzü basitçe oluşturalım, sonra da eş zamanlı mesajlaşma sistemini oluşturabiliriz.