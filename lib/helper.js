Doxter = window.Doxter || {};
jQuery.extend(Doxter, {
  // Helper function to connect to the Doxter-API
  connectToDoxter: function(args) {
    var self = this;

    $.ajax({
      url: self.Settings.baseUrl+"/"+args.path,
      method: (args.method ? args.method : "get"),
      async: (args.async === undefined ? "true" : args.async),
      data: (args.data ? args.data : ""),
      headers: {"Authorization": "Basic "+btoa(self.Settings.username+":"+self.Settings.password) }, 
      success: function(data) { args.success(data) },
      error: function(data) { args.error(data) } 
    });
  },

  // Stores google related stuff
  Google: {},

  // Stores access_token in global variable
  getAccessToken: function(callback) {

    var self = this;

    if(!self.Google.auth) {
      self.Google.auth = new OAuth2('google', {
        client_id: "329184275271.apps.googleusercontent.com",
        client_secret: "G4wqWbYxp1hegfw7CL1z5ik0",
        api_scope: "https://www.googleapis.com/auth/calendar"
      });
    }

    if(self.Google.auth.hasAccessToken() && !self.Google.auth.isAccessTokenExpired()) {
      self.Google.accessToken = self.Google.auth.getAccessToken();
      callback();
    }
    else {
      self.Google.auth.authorize(function() {
        self.Google.accessToken = self.Google.auth.getToken();
        callback();
      });
    }
  },

  // I like to cAmeLcAs3
  convertToCamelCase: function(string) {
    str = "";
    parts = string.split('-');
    parts.splice(1).each(function(part) {
      str += (part[0].toUpperCase() + part.substr(1))
    });
    return parts[0]+str;
  },

  // Helper function to append JS-Object to URL
  stringify: function(parameters) {
    var params = [];
    for(var p in parameters) {
      params.push(encodeURIComponent(p) + '=' +
      encodeURIComponent(parameters[p]));
    }
    return params.join('&');
  },

  // Helper function to show desktop notification
  notifyUser: function(title, text, image_, callback) {
    var image = chrome.extension.getURL("img/"+image_);
    var notification = webkitNotifications.createNotification(image, title, text);
    notification.onclick = function() {
      if(callback) {
        callback();
      }
      notification.close();
    };
    notification.show();
    window.setTimeout(function() {
      notification.close();
    }, 4000);
  }
});
