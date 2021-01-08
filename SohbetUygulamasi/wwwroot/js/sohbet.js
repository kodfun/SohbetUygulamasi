// todo: çıkış yapınca sohbeti temizle

var connection = null;
var takmaAdIzinVerilenKarakterler = "abcçdefgğhıijklmnoöpqrsştuüvwxyzABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZ0123456789";
var aktifOda = "#genel";

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
        '<li class="list-group-item pl-0" data-takma-ad="' + takmaAd + '"><i class="fas fa-user pr-2"></i>' + takmaAd + "</li>"
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

    if (oda == aktifOda) {
        scrollToBottom();
    }
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

// EVENTS
$("#takmaAd").on("input", function () {
    girisHataGizle();
});

$("#frmGiris").submit(function (event) {
    event.preventDefault();

    var takmaAd = $("#takmaAd").val().trim();

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
    aktifOda = $(this).data("oda");
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    scrollToBottom();
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

    connection.start().then(function () {
        $("#btnGirisYap").prop("disabled", false);
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

baglan();