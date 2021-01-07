var connection = null;

$('[data-toggle="tooltip"').tooltip();

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
}

function sohbetSayfasiniGoster() {
    $("#girisSayfasi").addClass("d-none");
    $("#sohbetSayfasi").removeClass("d-none");
}

function handleError(err) {
    console.log(err);
}

function kullaniciListesineEkle(takmaAd) {
    $("ul#kullanicilar").append(
        // todo: takma ad olarak özel karakterler kabul etme
        '<li data-takma-ad="' + takmaAd + '">' + takmaAd + "</li>"
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

// EVENTS
$("#takmaAd").on("input", function () {
    girisHataGizle();
});

$("#btnGirisYap").click(function () {
    var takmaAd = $("#takmaAd").val();
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

    connection.start().then(function () {
        $("#btnGirisYap").prop("disabled", false);
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

baglan();