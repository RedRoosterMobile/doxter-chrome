///////////////////
// Monkey patching
//////////////////

// Those functions are GOLD
Array.prototype.first = function() {
  return this[0];
}
Array.prototype.second = function() {
  return this[1];
}
Array.prototype.last = function() {
  return this[this.length-1];
}
Array.prototype.each = function(callback) {
  for(var i = 0; i < this.length; i++) {
    callback(this[i]);
  }
}
Array.prototype.eachWithIndex = function(callback) {
  for(var i = 0; i < this.length; i++) {
    callback(this[i], i);
  }
}

/////////////
// Singleton
////////////
window.Doxter = {

  //////////////////
  // Google Related
  /////////////////

  Google: {

    API_BASE_URL: "https://www.googleapis.com/calendar/v3",

    getAccessToken: function(callback) {

      var self = this;

      if(!self.auth) {
        self.auth = new OAuth2('google', {
          client_id: "329184275271.apps.googleusercontent.com",
          client_secret: "G4wqWbYxp1hegfw7CL1z5ik0",
          api_scope: "https://www.googleapis.com/auth/calendar"
        });
      }

      if(self.auth.hasAccessToken() && !self.auth.isAccessTokenExpired()) {
        self.accessToken = self.auth.getAccessToken();
        callback();
      }
      else {
        self.auth.authorize(function() {
          self.accessToken = self.auth.getAccessToken();
          callback();
        });
      }
    }, // getAccessToken

    connect: function(args) {
      var self = this;

      var headers = { "Authorization": "OAuth " + self.accessToken };
      if(args.method == "put" || args.method == "post") {
        jQuery.extend(headers, { "content-type": "application/json" });
      }

      $.ajax({
        url: self.API_BASE_URL+"/"+args.path,
        method: (args.method ? args.method : "get"),
        async: (args.async === undefined ? "true" : args.async),
        data: (args.data ? args.data : ""),
        success: function(data) { args.success(data) },
        error: function(data) { args.error(data) },
        headers: headers
      });
    }
  }, // Google {}

  ///////////
  // Helpers
  //////////

  connectToDoxter: function(args) {
    var self = this;

    $.ajax({
      url: self.Settings.baseUrl+"/"+args.path,
      method: (args.method ? args.method : "get"),
      async: (args.async === undefined ? "true" : args.async),
      data: (args.data ? args.data : ""),
      username: self.Settings.username,
      password: self.Settings.password,
      success: function(data) { args.success(data) },
      error: function(data) { args.error(data) } 
    });
  },

  convertToCamelCase: function(string) {
    str = "";
    parts = string.split('-');
    parts.splice(1).each(function(part) {
      str += (part[0].toUpperCase() + part.substr(1))
    });
    return parts[0]+str;
  },

  stringify: function(parameters) {
    var params = [];
    for(var p in parameters) {
      params.push(encodeURIComponent(p) + '=' +
      encodeURIComponent(parameters[p]));
    }
    return params.join('&');
  },

  getLargestDate: function(array, attribute) {
    if(!array) {
      return undefined;
    }
    var largest = 0;
    array.each(function(item) {
      largest = (Date.parse(item[attribute]) > largest ? item[attribute] : largest);
    });
    return largest;
  },

  days: function(val) {
    return val * 1000 // seconds
               * 60   // minutes
               * 60   // hours
               * 24;  // days
  },

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
}; // Doxter
