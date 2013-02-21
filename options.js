$(function() {
  
  window.backgroundPage = chrome.extension.getBackgroundPage();
  
  $("#save").click(function() {
    saveOptions();
  });

  $("#connection-test").click(function() {
    connectionTest(); 
  });

  $("#console-execute").click(function() {
    consoleExecute();
  });

  // Get credentials from local storage
  getSettings();

  if(window.backgroundPage.oauth.hasToken()) {
    $("#gcal-auth").addClass("authorized").text("GCal is authorized");
  }
  else {
    $("#gcal-auth").click(function() {
      authorizeGcal();
    });
  }
  
  $("#api-base-url").attr("value", window.api_base_url);
  $("#username").attr("value", window.api_username);
  $("#password").attr("value", window.api_password);
  $("#sync-every").attr("value", window.api_sync_every);
  $("#gcal-id").attr("value", window.api_gcal_id);
  $("#doxcal-id").attr("value", window.api_doxcal_id);

  function saveOptions() {
    localStorage.setItem("doxter-api-base-url", $("#api-base-url").val());
    localStorage.setItem("doxter-api-username", $("#username").val());
    localStorage.setItem("doxter-api-password", $("#password").val());

    
    localStorage.setItem("doxter-api-sync-every", $("#sync-every").val());
    localStorage.setItem("doxter-api-gcal-id", $("#gcal-id").val());
    localStorage.setItem("doxter-api-doxcal-id", $("#doxcal-id").val());

    showStatus("Saved", true);
    getSettings();
  }

  function connectionTest() {
    doxConnect({
      baseUrl: window.api_base_url,
      path: "calendars",
      username: window.api_username,
      password: window.api_password,
      success: function(data) {
        showStatus("Success", true); 
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

  function authorizeGcal() {
    window.backgroundPage.oauth.authorize(function() {
      $("#gcal-auth").addClass("authorized");
    });
  }    
});
