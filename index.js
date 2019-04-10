// Homebridge Plugin for Mode Lighting System using Remote Control Interface
// Need to enhance with more error checking

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

    sceneRequest: function (scene, NPU_IP, callback) {

        var telnet = require('telnet-client');

        var connection = new telnet();

        var params = {
            host: this.NPU_IP,
            port: 26,
            shellPrompt: '!GATRDY;',
            timeout: 1000,
            negotiationMandatory: false
        };

        // Callback handler for close event, though have never seen this for NPU
        connection.on('close', function () {
            console.log('Connection to Mode NPU closed');
        });

        // Callback handler for timeout event, though have never seen this for NPU
        connection.on('timeout', function () {
            console.log('Connection to Mode NPU timed out!');
        });

        // Callback handler for ready event, though have never seen this for NPU
        connection.on('ready', function () {
            console.log('Connection to Mode NPU is ready to receive data');
        });

        // Callback handler for connect event.  As Mode NPU Remote Control
        // does not have a login/password then this event is used to trigger
        // sending data on the connection.

        connection.on('connect', function () {

            scene = '$SCNRECALL,' + scene + ';';

             console.log('Connected to Mode NPU at IP address ' + NPU_IP + '.  Recalling scene: ' + scene);

            // Send scene
            connection.send(scene);

            // Close connection immediately after sending data
            connection.end();
        });

        // Connect to Mode NPU Remote Control Port
        connection.connect(params);
    },

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

        this.sceneRequest(scene, NPU_IP, function (error, stdout, stderr) {
            if (error) {
                this.log('sceneRequest: Scene function failed: %s', stderr);
                return(error);
            } else {
                this.log('sceneRequest: Scene function succeeded!');
                return(0);
                // this.log(stdout);
            }
        }.bind(this));

        callback(null);

        return(0);
    },

    getPowerState: function (callback) {

	this.log('Setting initial power state to off');
	callback(null, 0);
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