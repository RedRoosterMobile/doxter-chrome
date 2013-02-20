// Function to connect to the API
function doxConnect(args) {
  $.ajax({
    url: args.baseUrl+"/"+args.path,
    headers: {"Authorization": "Basic "+btoa(args.username+":"+args.password) }, 
    success: function(data) { args.success(data) },
    error: function(data) { args.error(data) } 
  });
}


function showStatus(message, success) {
  $("#status-inner").html(message)
  if(success) {
    $("#status").css("background", "rgb(160, 250, 160)");
  }
  else {
    $("#status").css("background", "rgb(250, 160, 160)");
  }
  $("#status").fadeIn("slow");
  setTimeout(function () {
    $("#status").fadeOut("slow");
  }, 1000);
}


function getCredentials() {
    window.api_base_url = localStorage.getItem("doxter-api-base-url") ? localStorage.getItem("doxter-api-base-url") : "";
    window.api_username = localStorage.getItem("doxter-api-username") ? localStorage.getItem("doxter-api-username") : "";
    window.api_password = localStorage.getItem("doxter-api-password") ? localStorage.getItem("doxter-api-password") : "";
}
