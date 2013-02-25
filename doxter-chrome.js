// Get credentials and oauth from local storage
getSettings();
getOAuth();

// Sync every 60 seconds
if(window.api_base_url && window.api_username && window.api_password) {
  if(window.access_token) {
   
    var interval = window.api_sync_every ? window.api_sync_every : 60;
    window.api_gcal_id = window.api_gcal_id ? window.api_gcal_id : 'primary';
    
    window.setInterval(function() {
      syncToGcal();
    }, interval * 1000);

    window.setInterval(function() {
      syncFromGcal();
    }, interval * 1000);
  }
  else {
    alert("Go to options page and authorize Gcal!");
  }
}
else {
  alert("Go to options page and set base url, username and password!");
}


function syncFromGcal() {
  //window.oauth.authorize(function() {
  var url = "https://www.googleapis.com/calendar/v3/calendars/" + window.api_gcal_id + "/events";
  var params = {
    "timeMin": new Date(window.api_last_synced),
  }
    
  window.oauth.sendSignedRequest(url, function(text, xhr) {
    console.log(JSON.parse(text));
    
    // window.api_last_synced = (new Date()).getTime();
  });
  //});
}


function syncToGcal() {

  var params = {
    "from": new Date(window.api_last_synced).toISOString()
  }

  doxConnect({
    baseUrl: window.api_base_url,
    path: "calendars/"+window.api_doxcal_id + "/events?" + stringify(params),
    username: window.api_username,
    password: window.api_password,
    success: function(data) {
      var events = data;
      for(i = 0; i < events.length; i++) {
        console.log(events[i]);    
        // window.oauth.signedRequest()

        // window.api_last_synced = (new Date()).getTime();
      }
    } 
  });
}

function refreshData() {
  getSettings();
  getOAuth();
}

