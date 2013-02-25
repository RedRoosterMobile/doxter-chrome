// Get credentials and oauth from local storage
getSettings();
getAccessToken();

// Sync every 60 seconds
if(window.api_base_url && window.api_username && window.api_password) {
   
  var interval = window.api_sync_every ? window.api_sync_every : 60;
  window.api_gcal_id = window.api_gcal_id ? window.api_gcal_id : 'primary';
  
  window.setInterval(function() {
 //   syncToGcal();
 //   syncFromGcal();
  }, interval * 1000);

}
else {
  alert("Go to options page and set base url, username and password!");
}

// Sync events from Google to Doxter
function syncFromGcal() {
  var url = "https://www.googleapis.com/calendar/v3/calendars/" + window.api_gcal_id + "/events";
  var params = {
    "timeMin": (new Date(window.api_last_synced)).toISOString(),
  }

  // Get events
  $.ajax({
    url: url + "?" + stringify(params),
    headers: {
      "Authorization": "OAuth " + window.access_token
    },
    success: function(data) {
      console.log(data);
      for(i = 0; i < data.items.length; i++) {
        console.log("Saving event from Google to Doxter:");
        console.log(data.items[i]);

        var params = {
          "starts" : (new Date(data.items[i].start.dateTime)).toISOString(),
          "ends" : (new Date(data.items[i].end.dateTime)).toISOString()
        }

        // Insert blocking
        doxConnect({
          baseUrl: window.api_base_url,
          method: "post",
          path: "calendars/"+window.api_doxcal_id + "/events",
          data: params,
          username: window.api_username,
          password: window.api_password,
          success: function(data) {
            console.log("Created blocking: ");
            console.log(data);
          },
          error: function(data) {
            console.log(data);
          }
        });
      }

    },
    error: function(data) {
      console.log(data);
    }
  });
    

    // window.api_last_synced = (new Date()).getTime();
}

// Sync bookings from Doxter to Google
function syncToGcal() {

  var params = {
    "from": new Date(window.api_last_synced).toISOString()
  }

  // Get bookings
  doxConnect({
    baseUrl: window.api_base_url,
    path: "calendars/"+window.api_doxcal_id + "/events?" + stringify(params),
    username: window.api_username,
    password: window.api_password,
    success: function(data) {
      var events = data;
      for(i = 0; i < events.length; i++) {
        console.log("Saving bookig from Doxter to Google:");
        console.log(events[i]);

        var url = "https://www.googleapis.com/calendar/v3/calendars/" + window.api_gcal_id + "/events";
        var params = {
          "start": {
            "dateTime": (new Date(events[i].starts)).toISOString()
          },
          "end": {
            "dateTime": (new Date(events[i].ends)).toISOString()
          }
          "summary": events[i].title,
          "description": events[i].reason
        }
        
        // Insert event
        $.ajax({
          url: url,
          headers: {
            "Authorization": "OAuth " + window.access_token
          },
          method: "post",
          data: params,
          success: function(data) {
            console.log("Created blocking: ");
            console.log(data);
          },
          error: function(data) {
            console.log(data);
          }
        });

        // window.api_last_synced = (new Date()).getTime();
      }
    } 
  });
}

function refreshData() {
  getSettings();
  getOAuth();
}

