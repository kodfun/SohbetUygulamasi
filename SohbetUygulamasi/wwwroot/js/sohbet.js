// todo: çıkış yapınca sohbeti temizle

var connection = null;
var takmaAdIzinVerilenKarakterler = "abcçdefgğhıijklmnoöpqrsştuüvwxyzABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZ0123456789";
var aktifOda = "#genel";
var tabIdSayac = 0;
var aktifTakmaAd = null;

$('[data-toggle="tooltip"').tooltip();
$("#takmaAd").focus();

// FUNCTIONS
function girisHataGoster(message) {
    $("#girisHata").text(message);
    $("#girisHata").removeClass("d-none");
}

function girisHataGizle() {
    $("#girisHata").addClass("d-none");
}

function girisSayfasiniGoster() {
    $("#sohbetSayfasi").addClass("d-none");
    $("#girisSayfasi").removeClass("d-none");
    $("#takmaAd").focus();
}

function sohbetSayfasiniGoster() {
    $("#girisSayfasi").addClass("d-none");
    $("#sohbetSayfasi").removeClass("d-none");
    $("#mesaj").focus();
}

function handleError(err) {
    console.log(err);
}

function kullaniciListesineEkle(takmaAd) {
    $("ul#kullanicilar").append(
        '<li class="list-group-item px-0" data-takma-ad="' + takmaAd + '">' +
        '<a href="#" class="d-block" data-dm-gonder="@' + takmaAd + '"><i class="fas fa-user pr-2"></i>' + takmaAd + '</a>' +
        '</li>'
    );
}

function kullaniciListesindenCikar(takmaAd) {
    var li = $('[data-takma-ad="' + takmaAd + '"]');
    li.remove();
}

function kullaniciListesineCokluEkle(takmaAdlar) {
    $.each(takmaAdlar, function (index, takmaAd) {
        kullaniciListesineEkle(takmaAd);
    });
}

function odayaMesajEkle(takmaAd, mesaj, oda) {
    var pano = panoGetir(oda);
    $("<p/>").text(": " + mesaj).prepend($("<strong/>").text(takmaAd)).appendTo(pano);
    if (aktifOda == oda)
        scrollToBottom();
}

// birisinden aktif kullanıcıya mesaj geldi
function dmGelenMesajEkle(takmaAd, mesaj, oda) {
    yeniSekmeYoksa(oda);
    odayaMesajEkle(takmaAd, mesaj, oda);
}

// aktif kullanıcının gönderdiği mesaj ulaştı
function dmGidenMesajEkle(takmaAd, mesaj, oda) {
    yeniSekmeYoksa(oda);
    odayaMesajEkle(takmaAd, mesaj, oda);
}

function panoGetir(oda) {
    return $('.tab-pane[data-oda="' + oda + '"] .mesajlar');
}

function takmaAdGecerliMi(takmaAd) {
    for (var i = 0; i < takmaAd.length; i++) {
        if (!takmaAdIzinVerilenKarakterler.includes(takmaAd[i]))
            return false;
    }
    return true;
}

function scrollToBottom() {
    var tabContent = $(".tab-content")[0];
    tabContent.scrollTop = tabContent.scrollHeight;
}

// alici # ile başlıyorsa sohbet odasıdır, @ ile başlıyorsa kullanıcıdır
function yeniSekme(alici) {
    // sekme başlığını ekle
    var sekmeBaslik =
        '<li class="nav-item" role="presentation">' +
        '<a class="nav-link" id="tab-' + tabIdSayac + '" data-toggle="tab" href="#tabPane-' + tabIdSayac + '" role="tab" aria-controls="' + alici + '" aria-selected="true" data-oda="' + alici + '">' + alici.substring(1) + '</a>' +
        '</li>';
    $("#myTab").append(sekmeBaslik);
    // sekme panosunu ekle
    var pano = '<div class="tab-pane fade h-100 p-3" id="tabPane-' + tabIdSayac + '" role="tabpanel" aria-labelledby="tab-' + tabIdSayac + '" data-oda="' + alici + '">' +
        '<div class="mesajlar"></div>' +
        '</div>';
    $("#myTabContent").append(pano);
    tabIdSayac++;
}

function yeniSekmeYoksa(alici) {
    var sLink = sekmeLink(alici);

    // sekme önceden oluşmamışsa
    if (!sLink)
        yeniSekme(alici);
}

function sekmeLink(alici) {
    return $('#myTab > li > a[data-oda="' + alici + '"]')[0];
}

function sekmePano(oda) {
    return $('#myTabContent > .tab-pane[data-oda="' + alici + '"]')[0];
}

function sekmeGoster(alici) {
    aktifOda = alici;
    var slink = sekmeLink(alici);
    $(slink).tab('show');
}

// EVENTS
$("#takmaAd").on("input", function () {
    girisHataGizle();
});

$("#frmGiris").submit(function (event) {
    event.preventDefault();

    var takmaAd = aktifTakmaAd = $("#takmaAd").val().trim();

    if (!takmaAd) {
        girisHataGoster("Takma adı girmediniz.")
        return;
    }

    if (!takmaAdGecerliMi(takmaAd)) {
        girisHataGoster("Takma ad harf ve rakamlardan oluşabilir.")
        return;
    }

    if (takmaAd.length > 15) {
        girisHataGoster("Takma ad uzunluğu en fazla 15 olmalıdır.")
        return;
    }

    connection.invoke("katil", takmaAd).catch(handleError);
});

$("#btnCikisYap").click(function () {
    $("#kullanicilar").html(""); // kullanıcı listesini temizle
    // https://docs.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest#stop--
    connection.stop();
    connection = null;
    baglan();
    girisSayfasiniGoster();
});

$("#frmMesaj").submit(function (event) {
    event.preventDefault();

    var mesaj = $("#mesaj").val().trim();
    $("#mesaj").val("");
    // aktifOda # ile başlıyorsa odadır @ ile başlıyorsa kullanıcıdır.
    connection.invoke("MesajGonder", mesaj, aktifOda).catch(handleError);
});

$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
});

$('body').on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    scrollToBottom();
    aktifOda = $(this).data("oda");
});

$("body").on("dblclick", "[data-dm-gonder]", function (event) {
    event.preventDefault();
    var alici = $(this).data("dm-gonder");
    if (alici == "@" + aktifTakmaAd) return;

    yeniSekmeYoksa(alici);
    sekmeGoster(alici);
});


function baglan() {
    connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

    connection.on("TakmaAdKullanimda", function () {
        girisHataGoster("Takma ad kullanımda.");
    });

    connection.on("SohbeteGirildi", function (kullanicilar) {
        kullaniciListesineCokluEkle(kullanicilar);
        sohbetSayfasiniGoster();
    });

    connection.on("KullaniciSohbeteGirdi", function (takmaAd) {
        kullaniciListesineEkle(takmaAd);
    });

    connection.on("KullaniciSohbettenCikti", function (takmaAd) {
        kullaniciListesindenCikar(takmaAd);
    });

    connection.on("MesajAlindi", function (takmaAd, mesaj, oda) {
        odayaMesajEkle(takmaAd, mesaj, oda);
    });

    connection.on("DmAlindi", function (takmaAd, mesaj, oda) {
        dmGelenMesajEkle(takmaAd, mesaj, oda);
    });

    connection.on("DmGonderildi", function (takmaAd, mesaj, oda) {
        dmGidenMesajEkle(takmaAd, mesaj, oda);
    });

    connection.start().then(function () {
        $("#btnGirisYap").prop("disabled", false);
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

baglan();


// todo: ismi çift tıklayınca adres çubuğunda # olmasın
// sekme kapatmayı mümkün kıl
// kullanıcı listesinde kendisini farklı renk görsün
// yeni mesaj geldiğinde sekme başlığında okunmamış yeni mesaj sayısı görünsün