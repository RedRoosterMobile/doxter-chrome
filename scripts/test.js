head.scriptPath = '../scripts';

head.load(head.makePaths(['lib/jquery', 'lib/jasmine', 'lib/jasmine-html', 'doxter', 'helper/settings', 'helper/options', 'helper/sync']), function() {

  Doxter.Test = {};

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

    it("should update setting", function() {
      Doxter._settings.push(new Doxter.Setting("foo", "bar"));
      Doxter.fetchSettings(true);

      expect(Doxter.Settings.foo).toBe("bar");
      Doxter.updateSetting("foo", "baz");
      expect(Doxter.Settings.foo).toBe("baz");
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

    it("should fetch Google calendar ids", function() {
      var callback = jasmine.createSpy();

      runs(function() {
        Doxter.fetchGoogleCalendars(callback);
      });

      waitsFor(function() {
        return callback.callCount > 0;
      });

      runs(function() {
        expect(callback).toHaveBeenCalled();
      });
    });

    if(Doxter.Settings.username && Doxter.Settings.password) {
      it("should fetch Doxter calendar ids", function() {
        var callback = jasmine.createSpy();

        runs(function() {
          Doxter.fetchDoxterCalendars(callback);
        });

        waitsFor(function() {
          return callback.callCount > 0;
        });

        runs(function() {
          expect(callback).toHaveBeenCalled();
        });
      });
    }
  }); // Helper functions

  describe("Google", function() {

    it("should connect to Google", function() {
      var callback = jasmine.createSpy();
      runs(function() {
        Doxter.getDataFromGoogle(function(data) {
          callback();
          Doxter.Test.googleData = data;
        });
      });

      waitsFor(function() {
        return callback.callCount > 0;
      }, "Callback function should be called", 2000);

      runs(function() {
        expect(callback).toHaveBeenCalled();
      });
    });

    it("should post to Google", function() {
      var callback = jasmine.createSpy();

      var stub = [{
        starts: 0,
        ends: 0,
        title: "Ein doxter Patient",
        reason: "HIV",
        id: "asdfasdf",
        confirmationLink: "http://ein.link.de?confirmation_token=adjfkdsjf"
      }];

      runs(function() {
        Doxter.sendDataToGoogle(stub, callback);
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
          Doxter.getDataFromDoxter(function(data) {
            callback();
            Doxter.Test.doxterData = data;
          });
        });

        waitsFor(function() {
          return callback.callCount > 0;
        }, "Callback function should be called", 2000);

        runs(function() {
          expect(callback).toHaveBeenCalled();
        });
      });

      it("should post to Doxter", function() {
        var callback = jasmine.createSpy();
        Doxter.Settings.gcalId = "primary";

        // Shrink googleData to 1 item
        Doxter.Test.googleData.items = [Doxter.Test.googleData.items[0]];

        runs(function() {
          Doxter.sendDataToDoxter(Doxter.Test.googleData, callback);
        });

        waitsFor(function() {
          return callback.callCount > 0;
        }, "Callback function should be called in sendDataToDoxter", 2000);

        runs(function() {
          expect(callback).toHaveBeenCalled();
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

