//////////////
// Background
/////////////

head.scriptPath = 'scripts';

head.load(head.makePaths(['lib/jquery', 'doxter', 'helper/settings', 'helper/options', 'helper/sync']), function() {
  Doxter.fetchSettings();
  if(Doxter.environment == "production") {
    Doxter.start();
  }
}); // require

