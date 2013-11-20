Doxter = window.Doxter || {};
Doxter.Helper = {
  // Helper function to connect to the Doxter-API
  doxConnect: function(args) {
    $.ajax({
      url: args.baseUrl+"/"+args.path,
      method: (args.method ? args.method : "get"),
      async: (args.async === undefined ? "true" : args.async),
      data: (args.data ? args.data : ""),
      headers: {"Authorization": "Basic "+btoa(args.username+":"+args.password) }, 
      success: function(data) { args.success(data) },
      error: function(data) { args.error(data) } 
    });
  },


  // Get settings from local storage
  getSettings: function() {
    // Base URL of API, eg: http://www.doxter.de/api/v1
    window.api_base_url = localStorage.getItem("doxter-api-base-url") ? localStorage.getItem("doxter-api-base-url") : "http://localhost:3000/api/v1";
    // Doxter username of user managing calendar
    window.api_username = localStorage.getItem("doxter-api-username") ? localStorage.getItem("doxter-api-username") : "";
    // Doxter password of user managing calendar
    window.api_password = localStorage.getItem("doxter-api-password") ? localStorage.getItem("doxter-api-password") : "";
    // Determines how often plugin should sync
    window.api_sync_every = localStorage.getItem("doxter-api-sync-every") ? parseInt(localStorage.getItem("doxter-api-sync-every")) : 60;
    // ID of Google Calendar (use 'primary' for standard Calendar)
    window.api_gcal_id = localStorage.getItem("doxter-api-gcal-id") ? localStorage.getItem("doxter-api-gcal-id") : "primary";
    // ID of Doxter Calendar
    window.api_doxcal_id = localStorage.getItem("doxter-api-doxcal-id") ? localStorage.getItem("doxter-api-doxcal-id") : "";
    // Last synced Doxter->Google
    window.api_last_synced_dtog = localStorage.getItem("doxter-api-last-synced-dtog") ? parseInt(localStorage.getItem("doxter-api-last-synced-dtog")) : Date.now();
    // Last synced Google->Doxter
    window.api_last_synced_gtod = localStorage.getItem("doxter-api-last-synced-gtod") ? parseInt(localStorage.getItem("doxter-api-last-synced-gtod")) : Date.now();
    // Last synced
    window.api_last_synced = localStorage.getItem("doxter-api-last-synced") ? parseInt(localStorage.getItem("doxter-api-last-synced")) : Date.now();
    // Available calendar IDs for logged in user
    window.api_calendar_ids = localStorage.getItem("doxter-api-calendar-ids") ? JSON.parse(localStorage.getItem("doxter-api-calendar-ids")) : null;
  },

  // Stores access_token in global variable
  getAccessToken: function(callback) {
    if(!window.googleAuth) {
      window.googleAuth = new OAuth2('google', {
        client_id: "329184275271.apps.googleusercontent.com",
        client_secret: "G4wqWbYxp1hegfw7CL1z5ik0",
        api_scope: "https://www.googleapis.com/auth/calendar"
      });
    }

    if(window.googleAuth.hasAccessToken() && !window.googleAuth.isAccessTokenExpired()) {
      window.access_token = window.googleAuth.getAccessToken();
      callback();
    }
    else {
      window.googleAuth.authorize(function() {
        window.access_token = window.googleAuth.getToken();
        callback();
      });
    }
  },

  // Helper function to append JS-Object to URL
  stringify: function(parameters) {
    var params = [];
    for(var p in parameters) {
      params.push(encodeURIComponent(p) + '=' +
      encodeURIComponent(parameters[p]));
    }
    return params.join('&');
  },

  // Helper function to show desktop notification
  notifyUser: function(title, text, image_, callback) {
    var image = chrome.extension.getURL("img/"+image_);
    var notification = webkitNotifications.createNotification(image, title, text);
    notification.onclick = function() {
      if(callback) {
        callback();
      }
      notification.close();
    };
    notification.show();
  }
}
