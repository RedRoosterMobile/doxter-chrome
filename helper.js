// Helper function to connect to the Doxter-API
function doxConnect(args) {
  $.ajax({
    url: args.baseUrl+"/"+args.path,
    method: (args.method ? args.method : "get"),
    async: (args.async === undefined ? "true", args.async)
    data: (args.data ? args.data : ""),
    headers: {"Authorization": "Basic "+btoa(args.username+":"+args.password) }, 
    success: function(data) { args.success(data) },
    error: function(data) { args.error(data) } 
  });
}


// Helper to show status in options page
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


// Get settings from local storage
function getSettings() {
  // Base URL of API, eg: http://www.doxter.de/api/v1
  window.api_base_url = localStorage.getItem("doxter-api-base-url") ? localStorage.getItem("doxter-api-base-url") : "";
  // Doxter username of user managing calendar
  window.api_username = localStorage.getItem("doxter-api-username") ? localStorage.getItem("doxter-api-username") : "";
  // Doxter password of user managing calendar
  window.api_password = localStorage.getItem("doxter-api-password") ? localStorage.getItem("doxter-api-password") : "";
  // Determines how often plugin should sync
  window.api_sync_every = localStorage.getItem("doxter-api-sync-every") ? localStorage.getItem("doxter-api-sync-every") : "";
  // ID of Google Calendar (use 'primary' for standard Calendar)
  window.api_gcal_id = localStorage.getItem("doxter-api-gcal-id") ? localStorage.getItem("doxter-api-gcal-id") : "";
  // ID of Doxter Calendar
  window.api_doxcal_id = localStorage.getItem("doxter-api-doxcal-id") ? localStorage.getItem("doxter-api-doxcal-id") : "";
  // Last synced Doxter->Google
  window.api_last_synced_dtog = localStorage.getItem("doxter-api-last-synced-dtog") ? localStorage.getItem("doxter-api-last-synced-dtog") : "0";
  // Last synced Google->Doxter
  window.api_last_synced_gtod = localStorage.getItem("doxter-api-last-synced-gtod") ? localStorage.getItem("doxter-api-last-synced-gtod") : "0";
}

// Stores access_token in global variable
function getAccessToken() {
  var googleAuth = new OAuth2('google', {
    client_id: "329184275271.apps.googleusercontent.com",
    client_secret: "G4wqWbYxp1hegfw7CL1z5ik0",
    api_scope: "https://www.googleapis.com/auth/calendar"
  });

  if(googleAuth.hasAccessToken()) {
    if(!googleAuth.isAccessTokenExpired()) {
      window.access_token = googleAuth.getAccessToken();
    }
    else {
      googleAuth.authorize(function() {
        window.access_token = googleAuth.getAccessToken();
      });
    }
  }
  else {
    googleAuth.authorize(function() {
      window.access_token = googleAuth.getToken();
    });
  }
}

// Helper function to append JS-Object to URL
function stringify(parameters) {
  var params = [];
  for(var p in parameters) {
    params.push(encodeURIComponent(p) + '=' +
    encodeURIComponent(parameters[p]));
  }
  return params.join('&');
};
