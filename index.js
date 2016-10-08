// Experimental Plugin - Working Version

var Service, Characteristic;

module.exports = function (homebridge) {

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    console.log("Inside module.exports");
    homebridge.registerAccessory("homebridge-modelighting", "modelighting", ModeLightingAccessory);
}

function ModeLightingAccessory(log, config) {
    this.log = log;

    // Get Room Name from config.json
    this.name = config["name"];

    // Get Mode Lighting On/Off Scene Numbers for Room Name from config.json
    this.on_cmd = config["on_cmd"];
    this.off_cmd = config["off_cmd"];

    this.NPU_IP = config["NPU_IP"];
}

ModeLightingAccessory.prototype = {

    sceneRequest: function (scene, NPU_IP, callback) {
        
        var telnet = require('telnet-client');

        var connection = new telnet();

        this.log ("Inside sceneRequest with parameters: " + NPU_IP + " scene: " + scene);

        var params = {
            host: this.NPU_IP,
            port: 22,
            shellPrompt: 'EVORDY',
            timeout: 1000,
            negotiationMandatory: false
        };

        // Callback handler for close event
        connection.on('close', function () {
            console.log('Connection to Mode NPU closed');
        });

        // Callback handler for timeout event
        connection.on('timeout', function () {
            console.log('Connection to Mode NPU timed out!');
        });

        // Callback handler for ready event
        connection.on('ready', function () {
            console.log('Connection to Mode NPU is ready to receive data');
        });

        // Callback handler for connect event.  As Mode NPU Remote Control
        // does not have a login/password then this event is used to trigger
        // sending data on the connection.

        connection.on('connect', function () {

            scene = 'SCENE' + scene + 'GO';

            console.log('Connected to Mode NPU and invoking ' + scene);

            connection.send(scene);

            // Close connection immediately after sending data
            connection.end();

            callback(); // success
        });

        // Connect to Mode NPU Remote Control Port
        this.log('Initiating connection to Mode NPU');

        connection.connect(params);
    },

    setPowerState: function (powerOn, callback) {

        var scene;

        var NPU_IP=this.NPU_IP;

        if (powerOn) {
            scene = this.on_cmd;
            this.log("Setting power state to on");
        } else {
            scene = this.off_cmd;
            this.log("Setting power state to off");
        }

        this.sceneRequest(scene, NPU_IP, function (error, stdout, stderr) {
            if (error) {
                this.log('Scene function failed: %s', stderr);
                callback(error);
            } else {
                this.log('Scene function succeeded!');
                callback();
                // this.log(stdout);
            }
        }.bind(this));
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
			.setCharacteristic(Characteristic.Model, "NPU 1.3.0.99")
			.setCharacteristic(Characteristic.SerialNumber, "");

        var switchService = new Service.Switch(this.name);

        switchService
			.getCharacteristic(Characteristic.On)
			.on('set', this.setPowerState.bind(this));

        return [switchService];
    }
};