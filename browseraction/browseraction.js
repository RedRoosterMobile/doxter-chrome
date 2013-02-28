$(function() {
  var bookings = chrome.extension.getBackgroundPage().unconfirmed_bookings;
  var api_url = chrome.extension.getBackgroundPage().api_base_url;

  if(bookings.length) {
    $("#booking-count").text(bookings.length);
    for(i = 0; i < bookings.length; i++) {
      var url = api_url.match(/(https?:\/\/.+?)\//)[1] + bookings[i].confirmation_link;
      $("#booking-list").append('<li><a href="' + url + '">' + bookings[i].title + '</a></li>');
    }
  }

});
