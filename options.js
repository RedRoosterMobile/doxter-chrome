$(function() {
  
  $("#save").click(function() {
    saveOptions();
  });

  $("#connection-test").click(function() {
    connectionTest(); 
  });

  $("#console-execute").click(function() {
    consoleExecute();
  });

  getCredentials();
  
  $("#api-base-url").attr("value", window.api_base_url);
  $("#username").attr("value", window.api_username);
  $("#password").attr("value", window.api_password);

  function saveOptions() {
    localStorage.setItem("doxter-api-base-url", $("#api-base-url").val());
    localStorage.setItem("doxter-api-username", $("#username").val());
    localStorage.setItem("doxter-api-password", $("#password").val());
    
    showStatus("Saved", true);
    getCredentials();
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
      } 
    });
  }
});
