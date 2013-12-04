//////////
// Tests
/////////

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

    it("should give largest date", function() {
      var testObj = [{foo: "2013-06-12T08:45:00+02:00"}, {foo: "2012-06-12T08:45:00+02:00"}, {foo: "2014-06-12T08:45:00+02:00"}];

      expect(Doxter.getLargestDate(undefined, "foo")).toBe(undefined);
      expect(Doxter.getLargestDate(testObj, "foo")).toBe(Date.parse("2014-06-12T08:45:00+02:00"));
    });

    it("should give days", function() {
      expect(Doxter.days(2)).toBe(172800000);
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

    it("should output errorMessage", function() {
      spyOn(Doxter, "notifyUser");

      Doxter.errorMessage(400);
      expect(Doxter.notifyUser).toHaveBeenCalled();
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
        confirmation_link: "http://ein.link.de?confirmation_token=adjfkdsjf"
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
            Doxter.Test.oldDoxterToGoogle = Doxter.Settings.doxterToGoogle;
          });
        });

        waitsFor(function() {
          return callback.callCount > 0;
        }, "Callback function should be called", 2000);

        runs(function() {
          if(Doxter.Test.doxterData.length) {
            expect(Doxter.Settings.doxterToGoogle).not.toBe(Doxter.Test.oldDoxterToGoogle);
          }
          else {
            expect(Doxter.Settings.doxterToGoogle).toBe(Doxter.Test.oldDoxterToGoogle);
          }
          expect(callback).toHaveBeenCalled();
        });
      });

      it("should post to Doxter", function() {
        var callback = jasmine.createSpy();
        Doxter.Settings.gcalId = "primary";

        var stub = {"items":[{
          "summary":"fdkajslkdfj",
          "start":{"dateTime":"2013-11-16T06:00:00+01:00"},
          "end":{"dateTime":"2013-11-16T09:00:00+01:00"},
          "sequence":0,
        }]};

        runs(function() {
          Doxter.sendDataToDoxter(stub, callback);
        });

        waitsFor(function() {
          return callback.callCount > 0;
        }, "Callback function should be called in sendDataToDoxter", 2000);

        runs(function() {
          expect(callback).toHaveBeenCalled();
        });
      }); // it
    }); // describe

    if(Doxter.readyToSync()) {
      describe("Plugin functionality", function() {
        it("should start syncing", function() {

          spyOn(Doxter, "sendDataToDoxter");
          spyOn(Doxter, "sendDataToGoogle");

          runs(function() {
            Doxter.start();
          });

          waitsFor(function() {
            return Doxter.sendDataToDoxter.callCount > 0;
          }, "sendDataToDoxter should be called", 2000);

          waitsFor(function() {
            return Doxter.sendDataToGoogle.callCount > 0;
          }, "sendDataToGoogle should be called", 2000);

          runs(function() {
            expect(Doxter.sendDataToDoxter).toHaveBeenCalled();
            expect(Doxter.sendDataToGoogle).toHaveBeenCalled();
          });
        });
      })
    } // if
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

