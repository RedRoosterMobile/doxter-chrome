var api_base_url = localStorage.getItem("doxter-api-base-url");
var username = localStorage.getItem("doxter-api-username");
var password = localStorage.getItem("doxter-api-password");


// Sync every 60 seconds
if(api_base_url && username && password) {
  window.setInterval(function() {
    syncToGcal(api_base_url, username, password);
  }, 60 * 1000);
}
else {
  alert("Go to options page and set base url, username and password!");
}


function syncFromGcal() {

}


function syncToGcal() {

}


