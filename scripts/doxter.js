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

  environment: "production",

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

        // Weird fix
        if($.isEmptyObject(self.auth.get())) {
          self.auth.setSource({
            clientId: "329184275271.apps.googleusercontent.com",
            clientSecret: "G4wqWbYxp1hegfw7CL1z5ik0",
            apiScope: "https://www.googleapis.com/auth/calendar"
          });
        }
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
    if(!array || !array.length) {
      return undefined;
    }
    var largest = 0;
    array.each(function(item) {
      var ts = Date.parse(item[attribute]);
      largest = (ts > largest ? ts : largest);
    });
    return Math.max(largest, Date.now()-Doxter.days(7));
  },

  days: function(val) {
    return val * 1000 // seconds
               * 60   // minutes
               * 60   // hours
               * 24;  // days
  },
  //https://developer.chrome.com/extensions/notifications
  notifyUser: function(title, text, image_, callback) {
    var image = chrome.extension.getURL("img/"+image_);
    // has to be unique identifier
    var id = title+text;
    var options = {
        type: "basic",
        title: title,
        message: text,
        iconUrl: image
    }
    //WTF documentation is kinda weird regarding this callback, but it's mandatory. 
    var creationCallback = function(notificationId){return notificationId};
    chrome.notifications.create(id, options,creationCallback);
    chrome.notifications.onClicked.addListener(callback)
  }
}; // Doxter
