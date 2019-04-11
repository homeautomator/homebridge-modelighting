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

  // Get config.json informatio for NPU IP Address, Room Name,
  // On Scene Number and Off Scene Number
  this.NPU_IP = config["NPU_IP"];
  this.name = config["name"];
  this.on_scene = config["on_scene"];
  this.off_scene = config["off_scene"];

  if (!this.name || !this.on_scene || !this.off_scene || !this.NPU_IP) {
    this.log('Invalid entry in config.json');
    this.log('NPU Address is ' + this.NPU_IP + ' Name is ' + this.name +
      ' On Scene is ' + this.on_scene + 'Off Scene is ' + this.off_scene);
  }
}

function ModeInterface(NPU_IP, cmd, scene, callback) {

  var cntr = 0;

  function ModeInterfaceRetry(NPU_IP, cmd, scene, callback) {

    request.post(
      'http://' + NPU_IP + '/gateway?', {
        json: {
          contentType: 'text/plain',
          dataType: 'text',
          timeout: 1500,
          data: cmd + scene + ';'
        }
      },
      function(error, response, body) {

        ++cntr;

        console.log('NPU: ' + NPU_IP + ' cmd: ' + cmd + ' scene: ' + scene +
          ' attempt number: ' + cntr);

        if (error) {

          console.log('WebServer Response is: ' + error);
          console.log('Error Code is: ' + error.code);

          if (cntr >= 5) {
            // if it fails too many times then return
            console.log('cmd: ' + cmd + ' scene: ' + scene +
              ' - unable to communicate to with Mode NPU WebServer');
            callback(null, 0);
          } else {
            // try again after a delay
            setTimeout(ModeInterfaceRetry, 500, NPU_IP, cmd, scene, callback);
          }
        } // Error
        else {

          if (cmd == "$scnrecall,") {
            callback(null, 0);
          } else if (cmd == "?scn," && body != "") {
            // Get Light Status & Return through callback
            var pos = body.lastIndexOf(";");
            callback(null, body.substring(pos - 5, pos - 4));
          } else {
            console.log('Unexpected body from WebServer. Body is: ' + body);
            callback(null, 0); // Default to Off
          } // Inner else
        } // else
      } // request.post callback function
    ); // request.post function call
  } // ModeInterfaceRetry

  ModeInterfaceRetry(NPU_IP, cmd, scene, callback);

} // ModeInterface

ModeLightingAccessory.prototype = {

  getPowerState: function(callback) {
    ModeInterface(this.NPU_IP, "?scn,", this.on_scene, callback);
  },

  setPowerState: function(powerOn, callback) {
    ModeInterface(this.NPU_IP, "$scnrecall,",
      powerOn ? this.on_scene : this.off_scene, callback);
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
