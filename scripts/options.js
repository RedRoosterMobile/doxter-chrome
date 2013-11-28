head.scriptPath = '../scripts';

head.load(head.makePaths(['lib/jquery', 'doxter', 'helper/settings', 'helper/options']), function() {
  $(function() {
    Doxter = window.Doxter;
    Doxter.backgroundPage = chrome.extension.getBackgroundPage();

    $("#save").click(function() {
      Doxter.saveSettings();
      Doxter.notifyUser("doxter Chrome", "Erfolgreich gespeichert!", "success48.png");
      if(!Doxter.backgroundPage.startedSyncing) {
        Doxter.backgroundPage.Doxter.start();
      }
    });

    $("#fetch-doxter-calendars").click(function() {
      Doxter.fetchDoxterCalendars(); 
    });

    $("#fetch-google-calendars").click(function() {
      Doxter.fetchGoogleCalendars(); 
    });

    // Get credentials from local storage
    Doxter.fetchSettings();

    if(Doxter.Settings.calendarIds) {
      Doxter.insertDropdownForCalendarIds($("#doxcal-id"), Doxter.Settings.calendarIds);
    }
    else {
      $("#doxcal-id").val("placeholder");
    }

    if(Doxter.Settings.googleCalendarIds) {
      Doxter.insertDropdownForCalendarIds($("#gcal-id"), Doxter.Settings.googleCalendarIds);
    }

    Doxter.fillInValues();
  }); // $(function(){})
}); // require

