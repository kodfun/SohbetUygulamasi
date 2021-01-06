

$("#btnGirisYap").click(function () {
    $("#girisSayfasi").addClass("d-none");
    $("#sohbetSayfasi").removeClass("d-none");
});

$("#btnCikisYap").click(function () {
    $("#sohbetSayfasi").addClass("d-none");
    $("#girisSayfasi").removeClass("d-none");
});

$('[data-toggle="tooltip"').tooltip();