$(function() {
  Doxter.backgroundPage = chrome.extension.getBackgroundPage();

  $("#save").click(function() {
    Doxter.saveSettings(true);
    Doxter.notifyUser("doxter Chrome", "Erfolgreich gespeichert!", "success48.png");
    if(!Doxter.backgroundPage.startedSyncing) {
      Doxter.backgroundPage.Doxter.start();
    }
  });

  $("#fetch-calendars").click(function() {
    Doxter.fetchCalendars(); 
  });

  // Get credentials from local storage
  Doxter.fetchSettings();
  Doxter.fillInValues();

  if(Doxter.Settings.calendarIds) {
    Doxter.insertDropdownForCalendarIds();
  }
  else {
    $("#doxcal-id").val("placeholder");
  }

});

Doxter = window.Doxter || {};
jQuery.extend(Doxter, {
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
        localStorage.setItem("calendar-ids", JSON.stringify(calendars));
        self.Settings.calendarIds = calendars;
        self.insertDropdownForCalendarIds();
      },
      error: function(data) {
        var message = "Verbindung fehlgeschlagen!";
        if(data.status == 401) {
          message += " Server meldet: falsche Login-Daten";
        }
        else if(data.status == 404) {
          message += " Server meldet: falsche URL";
        }

        self.notifyUser("doxter Chrome", message, "error48.png"); 
      }
    });
  },

  insertDropdownForCalendarIds: function() {
    $("#doxcal-id").html("");
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
});
