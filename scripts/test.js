head.scriptPath = '../scripts';

head.load(head.makePaths(['lib/jquery', 'lib/jasmine', 'lib/jasmine-html', 'doxter', 'helper/settings', 'helper/options', 'helper/sync']), function() {

  describe("Helper functions", function() {

    it("should convert to camel case", function() {
      expect(Doxter.convertToCamelCase("your-mum")).toBe("yourMum");
      expect(Doxter.convertToCamelCase("a-longer-string-yo")).toBe("aLongerStringYo");
    });

    it("should stringify object", function() {
      expect(Doxter.stringify({your: "mum"})).toBe("your=mum");
      expect(Doxter.stringify({an: "other", test: "case"})).toBe("an=other&test=case");
    });
  }); // Helper functions

  describe("Settings", function() {
    Doxter.fetchSettings();

    it("should create Settings for each _setting", function() {
      expect(Object.keys(Doxter.Settings).length).toBe(Doxter._settings.length);

    });

    it("should contain right value", function() {
      expect(Doxter.Settings[Object.keys(Doxter.Settings)[1]]).toBe(Doxter._settings[1].value);
    });
  }); // Helper functions

  describe("Option-Page Helpers", function() {
    Doxter.fetchSettings();

    it("should fill values in all fields", function() {
      Doxter.fillInValues();
      expect($("#username").val()).toBe(Doxter.Settings.username);
      expect($("#password").val()).toBe(Doxter.Settings.password);
      expect($("#base-url").val()).toBe(Doxter.Settings.baseUrl);
    });
  }); // Helper functions

  describe("Google", function() {

    it("should connect to Google", function() {
      var callback = jasmine.createSpy();
      runs(function() {
        Doxter.getDataFromGoogle(callback);
      });

      waitsFor(function() {
        return callback.callCount > 0;
      }, "Callback function should be called", 2000);

      runs(function() {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  if(Doxter.Settings.username && Doxter.Settings.password) {
    describe("Doxter", function() {

      it("should connect to Doxter", function() {
        var callback = jasmine.createSpy();
        runs(function() {
          Doxter.getDataFromDoxter(callback);
        });

        waitsFor(function() {
          return callback.callCount > 0;
        }, "Callback function should be called", 2000);

        runs(function() {
          expect(callback).toHaveBeenCalled();
        });
      });

      it("should post to Doxter and add blocking_id", function() {
        var callback = jasmine.createSpy();
        var stub = {
          items: [
            {
              start: { dateTime: 0 },
              end: { dateTime: 0 }
            }
          ]
        };

        runs(function() {
          Doxter.sendDataToDoxter(stub, callback);
        });

        waitsFor(function() {
          return callback.callCount > 1;
        }, "Callback function should be called", 2000);

        waitsFor(function() {
          return callback.callCount > 1;
        }, "Callback function should be called", 2000);

        runs(function() {
          expect(callback).toHaveBeenCalled();
          // 
          expect(callback.callCount).toBe(2);
        });
      }); // it
    }); // describe
  } // if

  $(function() {
    Doxter.Google.getAccessToken(function() {

      var jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 250;

      var htmlReporter = new jasmine.HtmlReporter();
      jasmineEnv.addReporter(htmlReporter);
      jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
      };
      jasmineEnv.execute();
    });
  });
}); // require

