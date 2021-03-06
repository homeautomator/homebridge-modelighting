# homebridge-modelighting
homebridge-plugin for Mode Lighting eDinControl using Remote Control Interface

# Installation

    Install homebridge by following instructions on homebridge github pages:
		https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi#install-homebridge-and-dependencies

	Install this plugin from NPM using: sudo npm install -g homebridge-modelighting
	
	The latest Github development version of the plugin can also be installed directly
		sudo npm install -g homeautomator/homebridge-modelighting
	
    Update your config.json configuration file. See sample-config.json in
	this repository for a sample.

# Getting Your Scene Information
	Scene numbers can be identified by navigating to the eDin Control
	configuration page on NPU and then hovering the mouse over each number
	above the scene name.  It will read Rs232: $SCNRECALL,XXXXX; where XXXXX is
	the scene number.

# Configuration

Configuration sample:

	"accessories": [
		{
			"accessory": "modelighting",
			"NPU_IP": "192.168.0.1",
			"name": "Living Room",
			"on_scene": "001",
			"off_scene": "002"
		},
		{
			"accessory": "modelighting",
			"NPU_IP": "192.168.0.1",
			"name": "Kitchen",
			"on_scene": "003",
			"off_scene": "004"
		}
	]