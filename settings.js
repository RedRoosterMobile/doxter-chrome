Doxter = window.Doxter || {};
jQuery.extend(Doxter, {
  Setting: function(varName, localStorageName, standardValue) {
    this.localStorageName = localStorageName;
    this.value = standardValue;
    this.fetch = function(refresh) {
      var val = localStorage.getItem(localStorageName);
      if(val) {
        this.value = val;
      }
    }
  },
  Settings: [
    // Base URL of API, eg: http://www.doxter.de/api/v1
    new Doxter.Setting("baseUrl", "doxter-base-url", "http://www.doxter.de/api/v1"),
    // Doxter username of user managing calendar
    new Doxter.Setting("username", "doxter-username", ""),
    // Doxter password of user managing calendar
    new Doxter.Setting("password", "doxter-password", ""),
    // Determines how often plugin should sync
    new Doxter.Setting("syncEvery", "doxter-sync-every", "60"),
    // ID of Google Calendar (use 'primary' for standard Calendar)
    new Doxter.Setting("gcalId", "doxter-gcal-id", "primary"),
    // ID of Doxter Calendar
    new Doxter.Setting("doxcalId", "doxter-doxcal-id", ""),
    // Last synced
    lastSynced: {
      new Doxter.Setting("doxterToGoogle", "doxter-doxter-to-google", ""),
      new Doxter.Setting("googleToDoxter", "doxter-google-to-doxter", "")
    }
    new Doxter.Setting("calendarIds", "doxter-calendar-ids", "");
  ],

  fetchSettings = function() {
  

