/////////////
// Settings
////////////

Doxter = window.Doxter || {};

jQuery.extend(Doxter, {
  LOCAL_STORAGE_PREFIX: "doxter-",

  Setting: function(varName, standardValue) {
    this.localStorageName = Doxter.LOCAL_STORAGE_PREFIX + varName;
    this.value = standardValue;
    this.camelCaseName = Doxter.convertToCamelCase(varName);
    this.domName = varName;
    this.fetch = function() {
      var val = localStorage.getItem(this.localStorageName);
      if(val) {
        this.value = val;
      }
      return this;
    };
    this.save = function(value) {
      var val = value || $('#'+this.domName).val();
      if(val) {
        this.value = val;
        this.saveToDisk();
      }
      return this;
    };
    this.saveToDisk = function(value) {
      localStorage.setItem(this.localStorageName, this.value);
    };
  },

  Settings: {},
  _settings: [],

  fetchSettings: function(doNotFetchFromDisk) {
    if(!doNotFetchFromDisk) {
      this.fetchSettingsFromDisk();
    }
    var self = this;
    this._settings.each(function(setting) {
      self.Settings[setting.camelCaseName] = setting.value;
    });
    // Make sure we fetch settings also for bg-page
    if(self.backgroundPage) {
      self.backgroundPage.Doxter.fetchSettings(doNotFetchFromDisk);
    }
  },

  fetchSettingsFromDisk: function() {
    this._settings.each(function(setting) {
      setting.fetch();
    });
  },

  saveSettings: function() {
    this._settings.each(function(setting) {
      setting.save();
    });
    this.fetchSettings();
  },

  updateSetting: function(camelCaseName, value) {
    var self = this;

    this._settings.each(function(setting) {
      if(setting.camelCaseName == camelCaseName) {
        setting.save(value);
        self.Settings[setting.camelCaseName] = value;
      }
    });
  }
});

Doxter._settings = [
    // Base URL of API, eg: http://www.doxter.de/api/v1
    new Doxter.Setting("base-url", "http://www.doxter.de/api/v1"),
    // Doxter username of user managing calendar
    new Doxter.Setting("username", ""),
    // Doxter password of user managing calendar
    new Doxter.Setting("password", ""),
    // Determines how often plugin should sync
    new Doxter.Setting("sync-every", "60"),
    // ID of Google Calendar (use 'primary' for standard Calendar)
    new Doxter.Setting("gcal-id", "primary"),
    // ID of Doxter Calendar
    new Doxter.Setting("doxcal-id", ""),
    // Last synced
    new Doxter.Setting("doxter-to-google", ""),
    new Doxter.Setting("google-to-doxter", ""),
    // Calendar Ids fetched
    new Doxter.Setting("calendar-ids", ""),
    // Calendar Ids fetched
    new Doxter.Setting("google-calendar-ids", ""),
];
