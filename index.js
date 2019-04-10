// Homebridge Plugin for Mode Lighting System using Remote Control Interface
// Need to enhance with more error checking
var request = require('request');

var Service, Characteristic;

module.exports = function (homebridge) {

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-modelighting", "modelighting", ModeLightingAccessory);
}

function ModeLightingAccessory (log, config) {
    this.log = log;

    // Get Room Name from config.json
    this.name = config["name"];

    // Get Mode Lighting On/Off Scene Numbers for Room Name and NPU IP Address from config.json
    this.on_scene = config["on_scene"];
    this.off_scene = config["off_scene"];
    this.NPU_IP = config["NPU_IP"];
}

ModeLightingAccessory.prototype = {

    setPowerState: function (powerOn, callback) {

      var scene;

      var NPU_IP=this.NPU_IP;

      if (powerOn) {
        scene = this.on_scene;
        this.log("setPowerState: Invoking on scene");
      } else {
        scene = this.off_scene;
        this.log("setPowerState: Invoking off scene");
      }

      request.post(
        'http://'+NPU_IP+'/gateway?',
          { json: { contentType: 'text/plain', dataType: 'text', data: '$scnrecall,'+scene+';'} },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
               console.log(body);
            }
          }
        );

        callback(null);

        return(0);
    },

    getPowerState: function (callback) {

      var scene=this.on_scene;

      var NPU_IP=this.NPU_IP;

      request.post(
        'http://'+NPU_IP+'/gateway?',
        { json: { contentType: 'text/plain', dataType: 'text', data: '?scn,'+scene+';'} },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }

	  // Get Light Status & Return through callback
          var pos = body.lastIndexOf(";");
          callback(null,body.substring(pos-5,pos-4));
          }
      );

      return(0);
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {

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
