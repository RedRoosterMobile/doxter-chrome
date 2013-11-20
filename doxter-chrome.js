// Get credentials from local storage
getSettings();

start();

// Needed for browseraction popup display
window.unconfirmed_bookings = new Array();

DoxterChrome = {

  // Start syncing process, check everything
  start: function() {
    if(window.api_base_url && window.api_username && window.api_password && window.api_doxcal_id) {
      getAccessToken(start_);
    }
    else {
      notifyUser("doxter Chrome", "Bitte geben sie auf der Optionsseite ihre Daten ein!", "info48.png");
      chrome.tabs.create({url: "options/options.html"});
    }
  },

  // Actually starts the process, internal function
  start_: function() {
    window.setInterval(function() {
      getAccessToken(function() {
        sync();
      });
    }, window.api_sync_every * 1000);

    window.started_syncing = true;
  },

  // Well, what will this function do?
  sync: function() {
    var doxter_data;
    var google_data;

    getDataFromDoxter(function(data) {
      doxter_data = data;
    });
    getDataFromGoogle(function(data) {
      google_data = data;
    });
    
    sendDataToDoxter(google_data);
    sendDataToGoogle(doxter_data);

    window.api_last_synced = Date.now();
  },

  // Receive bookings from Doxter
  getDataFromDoxter: function(callback) {
    var params = {
      "updated": new Date(parseInt(window.api_last_synced)).toISOString()
    }


    // Get bookings
    doxConnect({
      async: false,
      baseUrl: window.api_base_url,
      path: "calendars/"+window.api_doxcal_id + "/events?" + stringify(params),
      username: window.api_username,
      password: window.api_password,
      success: function(data) {
        callback(data);
      },
      error: function(data) {
        notifyUser("doxter Chrome", "Es konnte keine Verbindung zur doxter API aufgebaut werden!", "error48.png");
      }
    });
  },

  // Receive events from Google
  getDataFromGoogle: function(callback) {
    
    var url = "https://www.googleapis.com/calendar/v3/calendars/" + window.api_gcal_id + "/events";
    var params = {
      "updatedMin": (new Date(parseInt(window.api_last_synced))).toISOString(),
    }


    // Get events
    $.ajax({
      async: false,
      url: url + "?" + stringify(params),
      headers: {
        "Authorization": "OAuth " + window.access_token
      },
      success: function(data) {
        callback(data);
      },
      error: function(data) {
        console.log(data);
      }
    });
  },
  
  // Send Google-Data to Doxter
  sendDataToDoxter: function(data) {
    if(!data.items) {
      return;
    }
    for(i = 0; i < data.items.length; i++) {
      // Skip if start or end isn't given (cancelled events)
      if(!data.items[i].start || !data.items[i].end) {
        continue;
      }
      console.log("Saving event from Google to Doxter:");
      console.log(data.items[i]);

      var message = "Created blocking:";
      var params = {
        "starts" : (new Date(data.items[i].start.dateTime)).toISOString(),
        "ends" : (new Date(data.items[i].end.dateTime)).toISOString()
      }
      // If id is found in description, reschedule
      if(data.items[i].description) {
        match = data.items[i].description.match(/DXID:(.*)$/);
        if(match) {
          params.id = match[1];
          message = "Rescheduled Doxter event with ID: " + params.id;
        }
      }
      
      var blocking_id = undefined;

      // Insert blocking
      doxConnect({
        baseUrl: window.api_base_url,
        method: "post",
        async: false,
        path: "calendars/"+window.api_doxcal_id + "/events",
        data: params,
        username: window.api_username,
        password: window.api_password,
        success: function(data) {
          console.log(message);
          if(!params.id) {
            console.log(data);
          }
          blocking_id = data._id;
        },
        error: function(data) {
          console.log(data);
        }
      });

      // Only save blocking ID, if event wasn't already reschelduled
      if(!params.id) {
        addBlockingIdToEvent(blocking_id, data.items[i]);
      }
    }
  },

  // Send Doxter-Data to Google
  sendDataToGoogle: function(data) {
    var bookings = data;

    for(i = 0; i < bookings.length; i++) {
      // If there is no confirmation_token, the booking was rescheduled
      var confirmation_link = bookings[i].confirmation_link;
      if(!confirmation_link.match(/confirmation_token/)) {
        continue;
      }
      
      console.log("Saving booking from Doxter to Google:");
      console.log(bookings[i]);

      notifyUser(
        bookings[i].title,
        'Neue Buchung auf ihrem Doxter Account! Klicken sie auf dieses Fenster zum bestätigen!',
        "info48.png",
        function() {
          chrome.tabs.create({url: "http://www.doxter.de"+confirmation_link});
        }
      );

      var url = "https://www.googleapis.com/calendar/v3/calendars/" + window.api_gcal_id + "/events";
      var params = {
        "start": {
          "dateTime": (new Date(bookings[i].starts)).toISOString()
        },
        "end": {
          "dateTime": (new Date(bookings[i].ends)).toISOString()
        },
        "summary": bookings[i].title,
        "description": bookings[i].reason + "\n\nDXID:"+bookings[i].id
      }

      // Insert event
      $.ajax({
        async: false,
        url: url,
        headers: {
          "Authorization": "OAuth " + window.access_token,
          "Content-Type": "application/json"
        },
        type: "post",
        dataType: "json",
        data: JSON.stringify(params),
        success: function(data) {
          console.log("Created event:");
          console.log(data);
        },
        error: function(data) {
          console.log(data);
        }
      });
    }
  },

  // Update Google Calendar entry with Doxter-ID
  addBlockingIdToEvent: function(blocking_id, event_) {
    var updateUrl = "https://www.googleapis.com/calendar/v3/calendars/" + window.api_gcal_id + "/events/"+event_.id;
    var updateParams = {
      "start" : {
        "dateTime": (new Date(event_.start.dateTime)).toISOString()
      },
      "end" : {
        "dateTime": (new Date(event_.end.dateTime)).toISOString()
      },
      "description": (event_.description ? event_.description+"\n\n" : "") + "DXID:"+blocking_id
    }

    
    $.ajax({
      url: updateUrl,
      headers: {
        "Authorization": "OAuth " + window.access_token,
        "Content-Type": "application/json"
      },
      type: "put",
      dataType: "json",
      data: JSON.stringify(updateParams),
      success: function(data) {
        console.log("Added blocking ID to event:");
        console.log(data);
      },
      error: function(data) {
        console.log(data);
      }
    });
  }
}
