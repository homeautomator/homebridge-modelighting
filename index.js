// Homebridge Plugin for Mode Lighting System using Remote Control Interface
// Need to enhance with more error checking
var request = require('request');

var Service, Characteristic;

module.exports = function(homebridge) {

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-modelighting", "modelighting",
    ModeLightingAccessory);
}

function ModeLightingAccessory(log, config) {
  this.log = log;

  // Get Room Name from config.json
  this.name = config["name"];

  // Get Mode Lighting On/Off Scene Numbers for Room Name and
  // NPU IP Address from config.json
  this.on_scene = config["on_scene"];
  this.off_scene = config["off_scene"];
  this.NPU_IP = config["NPU_IP"];

  if (!this.name || !this.on_scene || !this.off_scene || !this.NPU_IP) {
    this.log('Invalid entry in config.json');
    this.log('NPU Address is ' + this.NPU_IP + ' Name is ' + this.name +
      ' On Scene is ' + this.on_scene + 'Off Scene is ' + this.off_scene);
  }
}

ModeLightingAccessory.prototype = {

  setPowerState: function(powerOn, callback) {

    var scene;
    var NPU_IP = this.NPU_IP;

    if (powerOn) {
      scene = this.on_scene;
    } else {
      scene = this.off_scene;
    }

    this.log('Recalling Scene: ' + scene);

    request.post(
      'http://' + NPU_IP + '/gateway?', {
        json: {
          contentType: 'text/plain',
          dataType: 'text',
          data: '$scnrecall,' + scene + ';'
        }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
        }
      }
    );

    callback(null);

    return (0);
  },

  getPowerState: function(callback) {

    var scene = this.on_scene;
    var NPU_IP = this.NPU_IP;
    var cntr = 0;

    function getPowerStateRetry() {

      request.post(
        'http://' + NPU_IP + '/gateway?', {
          json: {
            contentType: 'text/plain',
            dataType: 'text',
            timeout: 1500,
            data: '?scn,' + scene + ';'
          }
        },
        function(error, response, body) {

          ++cntr;

          console.log('getPowerStateRetry: Scene: ' + scene + ', Attempt number to get light status: ' + cntr);

          if (error) {

            console.log('getPowerStateRetry: WebServer Response Error is: ' + error);
            console.log('getPowerStateRetry: Error Code is: ' + error.code);

            if (cntr >= 5) {
              // if it fails too many times, just send out light is off
              console.log('getPowerStateRetry: Scene: ' + scene + ', unable to get light status.  Send HomeKit default Off');
              callback(null, 0);
            } else {
              // try again after a delay
              setTimeout(getPowerStateRetry, 500);
            }
          } else {

            if (body != "") {
              // Get Light Status & Return through callback
              var pos = body.lastIndexOf(";");
              callback(null, body.substring(pos - 5, pos - 4));
            } else {
              console.log('getPowerStateRetry: Error - Unexpected body from WebServer. Body is: ' + body);
              callback(null, 0); // Default to Off
            } // Inner else
          } // Outer else
        } // function
      );
    }

    getPowerStateRetry();

    return (0);
  },

  identify: function(callback) {
    this.log("identify: Identify requested!");
    callback(); // success
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Mode Lighting")
      .setCharacteristic(Characteristic.Model, "NPU SW000120.2.3.6.3")
      .setCharacteristic(Characteristic.SerialNumber, "");

    var switchService = new Service.Switch(this.name);

    switchService
      .getCharacteristic(Characteristic.On)
      .on('set', this.setPowerState.bind(this))
      .on('get', this.getPowerState.bind(this));

    return [switchService];
  }
};
