///////////////
// Option Page
///////////////

Doxter = window.Doxter || {};

jQuery.extend(Doxter, {
  fetchGoogleCalendars: function(callback) {
    var self = this;

    self.saveSettings();

    self.Google.getAccessToken(function() {
      self.Google.connect({
        path: "users/me/calendarList",
        success: function(data) {
          // for testing
          if(callback) {
            callback();
          }
          Doxter.notifyUser("doxter Chrome", "Google Kalender erfolgreich geholt!", "success48.png");
          calendars = {};
          data.items.each(function(calendar) {
            calendars[calendar.id] = calendar.summary;
          });
          localStorage.setItem("doxter-google-calendar-ids", JSON.stringify(calendars));
          self.Settings.googleCalendarIds = calendars;
          self.insertDropdownForCalendarIds($("#gcal-id"), self.Settings.googleCalendarIds);
        },
        error: function(data) {
          self.errorMessage(data.status);
        }
      }); // Google.connect
    }); // getAccessToken
  }, // fetchGoogleCalendars

  fetchDoxterCalendars: function(callback) {
    var self = this;

    self.saveSettings();

    self.connectToDoxter({
      path: "calendars",
      success: function(data) {
        // for testing
        if(callback) {
          callback();
        }
        Doxter.notifyUser("doxter Chrome", "Kalender erfolgreich geholt! (Ihre Daten sind richtig)", "success48.png");
        calendars = {};
        data.each(function(calendar) {
          calendars[calendar._id] = calendar.name;
        });
        localStorage.setItem("doxter-calendar-ids", JSON.stringify(calendars));
        self.Settings.calendarIds = calendars;
        self.insertDropdownForCalendarIds($("#doxcal-id"), self.Settings.calendarIds);
      },
      error: function(data) {
        self.errorMessage(data.status);
      }
    }); // connectToDoxter
  }, // fetchDoxterCalendars

  errorMessage: function(statusCode) {
    var message = "Verbindung fehlgeschlagen!";
    if(statusCode == 401) {
      message += "Server meldet: falsche Login-Daten";
    }
    else if(statusCode == 404) {
      message += "Server meldet: falsche URL";
    }

    self.notifyUser("doxter Chrome", message, "error48.png"); 
  },

  insertDropdownForCalendarIds: function($el, ids) {
    $el.html("");
    var idsObject = (typeof ids === "string" ? JSON.parse(ids) : ids);
    $.each(idsObject, function(key, value) {
       $el.append($("<option></option>")
        .attr("value", key)
        .text(value));
    });
  },

  fillInValues: function() {
    this._settings.each(function(setting) {
      $('#'+setting.domName).val(setting.value);
    });
  }
}); // jQuery.extend
