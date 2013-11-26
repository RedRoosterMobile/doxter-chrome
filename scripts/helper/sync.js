//////////
// Sync
/////////

Doxter = window.Doxter || {};

jQuery.extend(Doxter, {
  // Start syncing process, check everything
  start: function() {
    if(this.Settings.baseUrl && this.Settings.username && this.Settings.password && this.Settings.doxcalId) {
      this.getAccessToken(this.start_);
    }
    else {
      this.notifyUser("doxter Chrome", "Bitte geben sie auf der Optionsseite ihre Daten ein!", "info48.png");
      chrome.tabs.create({url: "options/options.html"});
    }
  },

  // Actually starts the process, internal function
  start_: function() {
    window.setInterval(function() {
      getAccessToken(function() {
        sync();
      });
    }, Doxter.Settings.syncEvery * 1000);

    this.startedSyncing = true;
  },

  // Well, what will this function do?
  sync: function() {
    var doxterData;
    var googleData;

    this.getDataFromDoxter(function(data) {
      doxterData = data;
    });
    this.getDataFromGoogle(function(data) {
      googleData = data;
    });

    this.sendDataToDoxter(googleData);
    this.sendDataToGoogle(doxterData);
  },

  // Receive bookings from Doxter
  getDataFromDoxter: function(callback) {

    var self = this;

    var params = {
      "updated": new Date(parseInt(self.Settings.doxterToGoogle)).toISOString()
    };

    // Get bookings
    self.connectToDoxter({
      async: false,
      path: "calendars/" + self.Settings.doxcalId + "/events?" + stringify(params),
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

    var self = this;

    var url = self.GOOGLE_API_BASE_URL + "/calendars/" + self.Settings.gcalId + "/events";
    var params = {
      "updatedMin": (new Date(parseInt(self.Settings.googleToDoxter))).toISOString(),
    }

    // Get events
    self.Google.connect({
      async: false,
      path: "/calendars/" + self.Settings.gcalId + "/events" + "?" + stringify(params),
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

    var self = this;

    if(!data.items) {
      return;
    }
    data.items.each(function(item) {
      // Skip if start or end isn't given (cancelled events)
      if(!item.start || !item.end) {
        continue;
      }
      console.log("Saving event from Google to Doxter:");
      console.log(item);

      var message = "Created blocking:";
      var params = {
        "starts" : (new Date(item.start.dateTime)).toISOString(),
        "ends" : (new Date(item.end.dateTime)).toISOString()
      }
      // If id is found in description, reschedule
      if(item.description) {
        match = item.description.match(/DXID:(.*)$/);
        if(match) {
          params.id = match[1];
          message = "Rescheduled Doxter event with ID: " + params.id;
        }
      }

      var blockingId = undefined;

      // Insert blocking
      self.connectToDoxter({
        method: "post",
        async: false,
        path: "calendars/" + self.Settings.doxcalId + "/events",
        data: params,
        success: function(data) {
          console.log(message);
          if(!params.id) {
            console.log(data);
          }
          blockingId = data._id;
        },
        error: function(data) {
          console.log(data);
        }
      });

      // Only save blocking ID, if event wasn't already reschelduled
      if(!params.id) {
        addBlockingIdToEvent(blockingId, item);
      }
    });
  },

  // Send Doxter-Data to Google
  sendDataToGoogle: function(data) {

    var self = this;

    data.each(function(booking) {
      // If there is no confirmation_token, the booking was rescheduled
      var confirmationLink = booking.confirmationLink;
      if(!confirmationLink.match(/confirmation_token/)) {
        continue;
      }

      console.log("Saving booking from Doxter to Google:");
      console.log(booking);

      notifyUser(
        booking.title,
        'Neue Buchung auf ihrem Doxter Account! Klicken sie auf dieses Fenster zum bestätigen!',
        "info48.png",
        function() {
          chrome.tabs.create({url: "http://www.doxter.de"+confirmationLink});
        }
      );

      var url = "https://www.googleapis.com/calendar/v3/calendars/" + self.Settings.gcalId + "/events";
      var params = {
        "start": {
          "dateTime": (new Date(booking.starts)).toISOString()
        },
        "end": {
          "dateTime": (new Date(booking.ends)).toISOString()
        },
        "summary": booking.title,
        "description": booking.reason + "\n\nDXID:"+booking.id
      }

      // Insert event
      self.Google.connect({
        async: false,
        path: "calendars/" + self.Settings.gcalId + "/events",
        //headers: {
        // "Content-Type": "application/json"
        //},
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
    });
  },

  // Update Google Calendar entry with Doxter-ID
  addBlockingIdToEvent: function(blockingId, event_) {

    var self = this;

    var updateUrl = "https://www.googleapis.com/calendar/v3/calendars/" + self.Settings.gcalId + "/events/"+event_.id;
    var updateParams = {
      "start" : {
        "dateTime": (new Date(event_.start.dateTime)).toISOString()
      },
      "end" : {
        "dateTime": (new Date(event_.end.dateTime)).toISOString()
      },
      "description": (event_.description ? event_.description+"\n\n" : "") + "DXID:"+blockingId
    }

    self.Google.connect({
      url: "calendars/" + self.Settings.gcalId + "/events/"+event_.id,
      //headers: {
      //  "Content-Type": "application/json"
      //},
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
}); // jQuery.extend
