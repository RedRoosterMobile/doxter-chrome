head.scriptPath = 'scripts';

head.load(head.makePaths(['lib/jquery', 'doxter', 'helper/settings', 'helper/options', 'helper/sync']), function() {
  Doxter.fetchSettings();
  Doxter.start();
}); // require

