///////////////////
// Monkey patching
//////////////////

// Those functions are GOLD
Array.prototype.first = function() {
  return this[0];
}
Array.prototype.second = function() {
  return this[1];
}
Array.prototype.last = function() {
  return this[this.length-1];
}
Array.prototype.each = function(callback) {
  for(var i = 0; i < this.length; i++) {
    callback(this[i]);
  }
}
Array.prototype.eachWithIndex = function(callback) {
  for(var i = 0; i < this.length; i++) {
    callback(this[i], i);
  }
}

/////////////
// Singleton
////////////
window.Doxter = {

  //////////////////
  // Google Related
  /////////////////

  Google: {

    API_BASE_URL: "https://www.googleapis.com/calendar/v3/calendars/",

    getAccessToken: function(callback) {

      var self = this;

      if(!self.Google.auth) {
        self.Google.auth = new OAuth2('google', {
          client_id: "329184275271.apps.googleusercontent.com",
          client_secret: "G4wqWbYxp1hegfw7CL1z5ik0",
          api_scope: "https://www.googleapis.com/auth/calendar"
        });
      }

      if(self.Google.auth.hasAccessToken() && !self.Google.auth.isAccessTokenExpired()) {
        self.Google.accessToken = self.Google.auth.getAccessToken();
        callback();
      }
      else {
        self.Google.auth.authorize(function() {
          self.Google.accessToken = self.Google.auth.getAccessToken();
          callback();
        });
      }
    }, // getAccessToken
  }, // Google {}

  ///////////
  // Helpers
  //////////

  connectToDoxter: function(args) {
    var self = this;

    $.ajax({
      url: self.Settings.baseUrl+"/"+args.path,
      method: (args.method ? args.method : "get"),
      async: (args.async === undefined ? "true" : args.async),
      data: (args.data ? args.data : ""),
      headers: {"Authorization": "Basic "+btoa(self.Settings.username+":"+self.Settings.password) }, 
      success: function(data) { args.success(data) },
      error: function(data) { args.error(data) } 
    });
  },

  convertToCamelCase: function(string) {
    str = "";
    parts = string.split('-');
    parts.splice(1).each(function(part) {
      str += (part[0].toUpperCase() + part.substr(1))
    });
    return parts[0]+str;
  },

  stringify: function(parameters) {
    var params = [];
    for(var p in parameters) {
      params.push(encodeURIComponent(p) + '=' +
      encodeURIComponent(parameters[p]));
    }
    return params.join('&');
  },

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
    window.setTimeout(function() {
      notification.close();
    }, 4000);
  },

  //////////
  // Sync
  /////////

  // Start syncing process, check everything
  start: function() {
    if(this.Settings.baseUrl && this.Settings.username && this.Settings.password && this.Settings.doxcalId) {
      this.Google.getAccessToken(this.start_);
    }
    else {
      this.notifyUser("doxter Chrome", "Bitte geben sie auf der Optionsseite ihre Daten ein!", "info48.png");
      chrome.tabs.create({url: "options/options.html"});
    }
  },

  // Actually starts the process, internal function
  start_: function() {
    window.setInterval(function() {
      this.Google.getAccessToken(function() {
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

    var url = "https://www.googleapis.com/calendar/v3/calendars/" + self.Settings.gcalId + "/events";
    var params = {
      "updatedMin": (new Date(parseInt(self.Settings.googleToDoxter))).toISOString(),
    }


    // Get events
    $.ajax({
      async: false,
      url: url + "?" + stringify(params),
      headers: {
        "Authorization": "OAuth " + self.Google.accessToken
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

    var self = this;

    data.items.each(function(item) {
      // Skip if start or end isn't given (cancelled events)
      if(!item.start || !item.end) {
        return;
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
    }); // data.items.each
  }, // sendDataToGoogle

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
      $.ajax({
        async: false,
        url: url,
        headers: {
          "Authorization": "OAuth " + self.Google.accessToken,
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

    $.ajax({
      url: updateUrl,
      headers: {
        "Authorization": "OAuth " + self.Google.accessToken,
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
  },

  fetchCalendars: function() {
    var self = this;

    self.saveSettings();

    Doxter.connectToDoxter({
      path: "calendars",
      success: function(data) {
        Doxter.notifyUser("doxter Chrome", "Kalender erfolgreich geholt! (Ihre Daten sind richtig)", "success48.png");
        calendars = {};
        data.each(function(calendar) {
          calendars[calendar._id] = calendar.name;
        });
        localStorage.setItem("doxter-calendar-ids", JSON.stringify(calendars));
        self.Settings.calendarIds = calendars;
        self.insertDropdownForCalendarIds();
      },
      error: function(data) {
        var message = "Verbindung fehlgeschlagen!";
        if(data.status == 401) {
          message += "Server meldet: falsche Login-Daten";
        }
        else if(data.status == 404) {
          message += "Server meldet: falsche URL";
        }

        self.notifyUser("doxter Chrome", message, "error48.png"); 
      }
    });
  },

  insertDropdownForCalendarIds: function() {
    $("#doxcal-id").html("");
    this.Settings.calendarIds =
      this.Settings.calendarIds instanceof String ? this.Settings.calendarIds : JSON.parse(this.Settings.calendarIds);
    $.each(this.Settings.calendarIds, function(key, value) {
       $("#doxcal-id")
        .append($("<option></option>")
        .attr("value", key)
        .text(value)); 
    });
  },

  fillInValues: function() {
    this._settings.each(function(setting) {
      $('#'+setting.domName).val(setting.value);
    });
  }
}; // Doxter
