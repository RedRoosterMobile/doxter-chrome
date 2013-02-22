// Function to connect to the API
function doxConnect(args) {
  $.ajax({
    url: args.baseUrl+"/"+args.path,
    headers: {"Authorization": "Basic "+btoa(args.username+":"+args.password) }, 
    success: function(data) { args.success(data) },
    error: function(data) { args.error(data) } 
  });
}


function showStatus(message, success) {
  $("#status-inner").html(message)
  if(success) {
    $("#status").css("background", "rgb(160, 250, 160)");
  }
  else {
    $("#status").css("background", "rgb(250, 160, 160)");
  }
  $("#status").fadeIn("slow");
  setTimeout(function () {
    $("#status").fadeOut("slow");
  }, 1000);
}


function getSettings() {
  window.api_base_url = localStorage.getItem("doxter-api-base-url") ? localStorage.getItem("doxter-api-base-url") : "";
  window.api_username = localStorage.getItem("doxter-api-username") ? localStorage.getItem("doxter-api-username") : "";
  window.api_password = localStorage.getItem("doxter-api-password") ? localStorage.getItem("doxter-api-password") : "";
  window.api_sync_every = localStorage.getItem("doxter-api-sync-every") ? localStorage.getItem("doxter-api-sync-every") : "";
  window.api_gcal_id = localStorage.getItem("doxter-api-gcal-id") ? localStorage.getItem("doxter-api-gcal-id") : "";
  window.api_doxcal_id = localStorage.getItem("doxter-api-doxcal-id") ? localStorage.getItem("doxter-api-doxcal-id") : "";
  window.api_last_synced = localStorage.getItem("doxter-api-last-synced") ? localStorage.getItem("doxter-api-last-synced") : "0";
}

function getOAuth() {
  window.oauth = ChromeExOAuth.initBackgroundPage({
      'request_url': 'https://www.google.com/o/oauth2/auth',
      'authorize_url': 'https://www.google.com/o/oauth2/auth',
      'access_url': 'https://www.google.com/o/oauth2/token',
      'consumer_key': 'anonymous',
      'consumer_secret': 'anonymous',
      'scope': 'https://www.googleapis.com/auth/calendar',
//'scope' : 'http://www.google.com/calendar/feeds/',
      'app_name': 'doxter Chrome V2'
  });
}

function stringify(parameters) {
  var params = [];
  for(var p in parameters) {
    params.push(encodeURIComponent(p) + '=' +
    encodeURIComponent(parameters[p]));
  }
  return params.join('&');
};
