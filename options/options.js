$(function() {
  
  window.backgroundPage = chrome.extension.getBackgroundPage();
  
  $("#save").click(function() {
    saveOptions(true);
  });

  $(".autosave").bind('input', function() { 
    saveOptions(false);
  });

  $("#connection-test").click(function() {
    connectionTest(); 
  });

  $("#console-execute").click(function() {
    consoleExecute();
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
      showStatus("Saved", true);
    }
    getSettings();
    backgroundPage.getSettings();
  }

  function connectionTest() {
    doxConnect({
      baseUrl: window.api_base_url,
      path: "calendars",
      username: window.api_username,
      password: window.api_password,
      success: function(data) {
        showStatus("Success", true); 
        calendars = {};
        for(i = 0; i < data.length; i++) {
          calendars[data[i].id] = data[i].name;
        }
        localStorage.setItem("doxter-api-calendar-ids", JSON.stringify(calendars));
        window.api_calendar_ids = calendars;
        insertDropdownForCalendarIds();
      },
      error: function(data) { showStatus("Error", false); }
    });
  }

  function consoleExecute() {
    $("span.msg-to-hide").hide();
    $("img.spinner").fadeIn();
    
    doxConnect({
      baseUrl: window.api_base_url,
      path: $("#console-input").val(),
      username: window.api_username,
      password: window.api_password,
      success: function(data) {
        showStatus("Success", true);
        $("#console-output").html("");
        $("#console-output").jsonEditor(data);
      },
      error: function(data) {
        showStatus("Error", false);
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
