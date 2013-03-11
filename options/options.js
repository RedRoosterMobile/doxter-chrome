$(function() {
  
  window.background_page = chrome.extension.getBackgroundPage();
  
  $("#save").click(function() {
    saveOptions(true);
    if(!window.background_page.started_syncing) {
      window.background_page.start();
    }
  });

  $(".autosave").bind('input', function() { 
    saveOptions(false);
  });

  $("#fetch-calendars").click(function() {
    fetchCalendars(); 
  });

  // Get credentials from local storage
  getSettings();
  
  $("#api-base-url").attr("value", window.api_base_url);
  $("#username").attr("value", window.api_username);
  $("#password").attr("value", window.api_password);
  $("#sync-every").attr("value", window.api_sync_every);
  $("#gcal-id").attr("value", window.api_gcal_id);
  $("#doxcal-id").attr("value", window.api_doxcal_id);
  if(window.api_calendar_ids) {
    insertDropdownForCalendarIds();
  }
  else {
    $("#doxcal-id").val("placeholder");
  }


  function saveOptions(verbose) {
    localStorage.setItem("doxter-api-base-url", $("#api-base-url").val());
    localStorage.setItem("doxter-api-username", $("#username").val());
    localStorage.setItem("doxter-api-password", $("#password").val());

    
    localStorage.setItem("doxter-api-sync-every", $("#sync-every").val());
    localStorage.setItem("doxter-api-gcal-id", $("#gcal-id").val());
    localStorage.setItem("doxter-api-doxcal-id", $("#doxcal-id").val());

    if(verbose) {
      notifyUser("doxter Chrome", "Daten gespeichert", "success48.png");
    }
    getSettings();
    background_page.getSettings();
  }

  function fetchCalendars() {
    doxConnect({
      baseUrl: window.api_base_url,
      path: "calendars",
      username: window.api_username,
      password: window.api_password,
      success: function(data) {
        notifyUser("doxter Chrome", "Kalender erfolgreich geholt! (Ihre Daten sind richtig)", "success48.png");
        calendars = {};
        for(i = 0; i < data.length; i++) {
          calendars[data[i].id] = data[i].name;
        }
        localStorage.setItem("doxter-api-calendar-ids", JSON.stringify(calendars));
        window.api_calendar_ids = calendars;
        insertDropdownForCalendarIds();
      },
      error: function(data) {
        var message = "Verbindung fehlgeschlagen!";
        if(data.status == 401) {
          message += " Server meldet: falsche Login-Daten";
        }
        else if(data.status == 404) {
          message += " Server meldet: falsche URL";
        }

        notifyUser("doxter Chrome", message, "error48.png"); 
      }
    });
  }

  function insertDropdownForCalendarIds() {
    $("#doxcal-id").html("");
    $.each(window.api_calendar_ids, function(key, value) {
       $("#doxcal-id")
        .append($("<option></option>")
        .attr("value", key)
        .text(value)); 
    });
  }
});
