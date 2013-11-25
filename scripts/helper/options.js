///////////////
// Option Page
///////////////

Doxter = window.Doxter || {};

jQuery.extend(Doxter, {
  fetchGoogleCalendars: function() {
    var self = this;

    self.saveSettings();

    self.Google.getAccessToken(function() {
      $.ajax({
        url: self.Google.API_BASE_URL + "calendars/list",
        headers: {
          "Authorization": "OAuth " + self.Google.accessToken
        },
        success: function(data) {
          Doxter.notifyUser("doxter Chrome", "Google Kalender erfolgreich geholt!", "success48.png");
          calendars = {};
          data.each(function(calendar) {
            calendars[calendar._id] = calendar.name;
          });
          localStorage.setItem("doxter-google-calendar-ids", JSON.stringify(calendars));
          self.Settings.googleCalendarIds = calendars;
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
    });
  },

  fetchDoxterCalendars: function() {
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
}); // jQuery.extend
