//////////
// Sync
/////////

Doxter = window.Doxter || {};

jQuery.extend(Doxter, {

  readyToSync: function() {
    return this.Settings.gcalId && this.Settings.doxcalId && this.Settings.username && this.Settings.password;
  },

  // Start syncing process, check everything
  start: function() {
    var self = this;

    if(this.readyToSync()) {
      this.Google.getAccessToken(function() {
        self.notifyUser("doxter Chrome", "Sync gestartet!", "doxter-icon-48.png");
        self.start_();
      });
    }
    else {
      this.notifyUser("doxter Chrome", "Bitte geben sie auf der Optionsseite ihre Daten ein!", "info48.png");
      chrome.tabs.create({url: "options/options.html"});
    }
  },

  // Stop syncing process
  stop: function() {
    if(this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
    }
  },

  // Actually starts the process, internal function
  start_: function() {
    var self = this;

    this.stop();
    this.sync();

    this.syncIntervalId = window.setInterval(function() {
      // refresh token from time to time
      self.Google.getAccessToken(function() {
        self.sync();
      });
    }, Doxter.Settings.syncEvery * 1000);
  },

  sync: function() {
    var self = this;

    // NOTE: Order is important here, because we dont
    // want to sync back events which we just fetched
    self.getDataFromDoxter(function(doxterData) {
      self.getDataFromGoogle(function(googleData) {
        self.sendDataToGoogle(doxterData);
        self.sendDataToDoxter(googleData);
      });
    });
  },

  // Receive bookings from Doxter
  getDataFromDoxter: function(callback) {

    console.log("Getting data from Doxter now");

    var self = this;

    var params = (function() {
      var timestamp = (self.Settings.doxterToGoogle ? parseInt(self.Settings.doxterToGoogle) : 0);
      return "?" + Doxter.stringify({
        "updated": new Date(timestamp).toISOString()
      });
    })();

    // Get bookings
    self.connectToDoxter({
      async: false,
      path: "calendars/" + self.Settings.doxcalId + "/events" + params,
      success: function(data) {
        callback(data);
        // NOTE: Although this looks kinda unnecessary
        // undefined + 1000 = NaN
        // & !!NaN = true
        // WTF JAVASCRIPT
        var largestDate = self.getLargestDate(data, "updated_at");
        if(largestDate) {
          self.updateSetting("doxterToGoogle", largestDate + 1000);
        }
      },
      error: function(data) {
        self.notifyUser("doxter Chrome", "Es konnte keine Verbindung zur doxter API aufgebaut werden!", "error48.png");
      }
    });
  },

  // Receive events from Google
  getDataFromGoogle: function(callback) {

    console.log("Getting data from Google now");

    var self = this;

    var params = (function() {
      if(self.Settings.googleToDoxter) {
        return "?" + Doxter.stringify({
          "updatedMin": new Date(parseInt(self.Settings.googleToDoxter)).toISOString()
        });
      }
      else {
        return "";
      }
    })();

    // Get events
    self.Google.connect({
      async: false,
      path: "calendars/" + self.Settings.gcalId + "/events" + params,
      success: function(data) {
        callback(data);
        self.updateSetting("googleToDoxter", self.getLargestDate(data.items, "updated"));
      },
      error: function(data) {
        console.log(data);
      }
    });
  },

  // Send Google-Data to Doxter
  sendDataToDoxter: function(data, callback) {

    console.log("Sending data to Doxter now");

    var self = this;

    data.items.each(function(item) {
      // Skip if start or end isn't given (cancelled events)
      if(!item.start || !item.end) {
        return;
      }

      var message = "Created blocking:";
      var params = {
        "starts" : (new Date(item.start.dateTime)).toISOString(),
        "ends" : (new Date(item.end.dateTime)).toISOString()
      }
      // If id is found in description, reschedule
      if(item.description) {
        //match = item.description.match(/DXID:(.*)$/);
        match = item.description.match(/DXID/);
        if(match) {
          return;
          //params.id = match[1];
          //message = "Rescheduled Doxter event with ID: " + params.id;
        }
      }

      console.log("Saving event from Google to Doxter:");
      console.log(item);

      var blockingId = undefined;

      // Insert blocking
      self.connectToDoxter({
        method: "post",
        async: false,
        path: "calendars/" + self.Settings.doxcalId + "/events",
        data: params,
        success: function(data) {
          // For testing
          if(callback) {
            callback();
          }
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
      if(!params.id && !callback) {
        self.addBlockingIdToEvent(blockingId, item);
      }
    });
  },

  // Send Doxter-Data to Google
  sendDataToGoogle: function(data, callback) {

    console.log("Sending data to Google now");

    var self = this;

    data.each(function(booking) {
      // If there is no confirmation_token, the booking was rescheduled
      var confirmationLink = booking.confirmation_link;
      if(confirmationLink && !confirmationLink.match(/confirmation_token/)) {
        return;
      }

      console.log("Saving booking from Doxter to Google:");
      console.log(booking);

      self.notifyUser(
        booking.title,
        'Neue Buchung auf ihrem Doxter Account! Klicken sie auf dieses Fenster zum bestaetigen!',
        "info48.png",
        function() {
          chrome.tabs.create({url: confirmationLink});
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
        method: "post",
        dataType: "json",
        data: JSON.stringify(params),
        success: function(data) {
          // For testing
          if(callback) {
            callback();
          }
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
  // Not tested, because it needs real Google Event ID
  addBlockingIdToEvent: function(blockingId, event_) {

    var self = this;

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
      path: "calendars/" + self.Settings.gcalId + "/events/"+event_.id,
      method: "put",
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
