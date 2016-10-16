// Homebridge Plugin for Mode Lighting System using Remote Control Interface
// Need to enhance with more error checking

var Service, Characteristic;

module.exports = function (homebridge) {

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-modelighting", "modelighting", ModeLightingAccessory);
}

function ModeLightingAccessory(log, config) {
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
            port: 22,                       // Mode NPU Remote Control Port
            shellPrompt: '',                // No Shell Prompt
            negotiationMandatory: false     // Disable telnet negotiations
        };

        // Callback handler for error event
        connection.on('error', function () {
            console.log('Error connecting to Mode NPU');
            connection.end();
            callback();
        });

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

            scene = 'SCENE' + scene + 'GO';
            console.log('Invoking ' + scene);

            connection.send(scene, null, function () {
                console.log('Scene Sent to NPU Remote Control');
            });

            // Close connection immediately after sending data
            connection.end();

            callback(); // success
        });

        // Callback handler for connect event
        connection.on('connect', function () {
            console.log('Connected to Mode NPU.');
        });

        // Connect to Mode NPU Remote Control Port
        this.log("Connecting to Mode NPU at IP address " + NPU_IP + "with scene: " + scene);
        connection.connect(params);
    },

    setPowerState: function (powerOn, callback) {

        var scene;
       
        var NPU_IP = this.NPU_IP;

        if (powerOn) {
            scene = this.on_scene;
            this.log("Invoking On scene");
        } else {
            scene = this.off_scene;
            this.log("Invoking Off scene");
        }

        this.sceneRequest(scene, NPU_IP, callback);
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

        return [informationService, switchService];
    }
};