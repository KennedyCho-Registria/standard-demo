/* Locale Javascript Code */
window.addEventListener('DOMContentLoaded', function () {
  $('.nav-wrap').on('click', '.nav-dropdown', function() {
    $('.language-select').slideToggle(10);
  });
  $('.language-select .langauge').each(function () {
    var newUrl =  $(this).attr('href') + window.location.search;
   // console.log("newUrl = " + newUrl + "window.location serach = " + window.location.search);
    $(this).attr('href', newUrl);
    // console.log("this attr href value = " + $(this).attr('href', newUrl));
  });

  $('.mobile-menu-wrap').on('click', '.mobile-menu-dropdown', function() {
    $('.menu-select').slideToggle(10);
  });
  $('.menu-select .menu').each(function () {
    var newUrl =  $(this).attr('href') + window.location.search;
    $(this).attr('href', newUrl);
  });
});