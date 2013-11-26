///////////////
// Option Page
///////////////

Doxter = window.Doxter || {};

jQuery.extend(Doxter, {
  fetchGoogleCalendars: function() {
    var self = this;

    self.saveSettings();

    self.Google.getAccessToken(function() {
      self.Google.connect({
        path: "users/me/calendarList",
        success: function(data) {
          Doxter.notifyUser("doxter Chrome", "Google Kalender erfolgreich geholt!", "success48.png");
          calendars = {};
          data.items.each(function(calendar) {
            calendars[calendar.id] = calendar.summary;
          });
          localStorage.setItem("doxter-google-calendar-ids", JSON.stringify(calendars));
          self.Settings.googleCalendarIds = calendars;
          self.insertDropdownForCalendarIds();
        },
        error: function(data) {
          self.errorMessage(data.status);
        }
      });
    });
  },

  fetchDoxterCalendars: function() {
    var self = this;

    self.saveSettings();

    self.connectToDoxter({
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
        self.errorMessage(data.status);
      }
    });
  },

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
}); // jQuery.extend
