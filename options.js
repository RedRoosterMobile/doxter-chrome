$(function() {
  
  $("#save").click(function() {
    saveOptions();
  });

  var api_base_url = localStorage.getItem("doxter-api-base-url") ? localStorage.getItem("doxter-api-base-url") : "";
  var username = localStorage.getItem("doxter-api-username") ? localStorage.getItem("doxter-api-username") : "";
  var password = localStorage.getItem("doxter-api-password") ? localStorage.getItem("doxter-api-password") : "";
  
  $("#api-base-url").attr("value", api_base_url);
  $("#username").attr("value", username);
  $("#password").attr("value", password);

  function saveOptions() {
    localStorage.setItem("doxter-api-base-url", $("#api-base-url").val());
    localStorage.setItem("doxter-api-username", $("#username").val());
    localStorage.setItem("doxter-api-password", $("#password").val());

    $("#saved").fadeIn("slow");
    $("#saved").fadeOut("slow");
  }
});
