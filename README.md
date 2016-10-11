# homebridge-modelighting
homebridge-plugin for Mode Lighting eDinControl using Remote Control Interface

# Installation

    Install homebridge by following instructions on homebridge github pages:
		https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi#install-homebridge-and-dependencies

	Install this plugin from NPM using: sudo npm install -g homebridge-modelighting
	
	The development version of the plugin can also be installed from Github
		sudo npm install -g homeautomator/homebridge-modelighting homebridge-modelighting
	
    Update your config.json configuration file. See sample-config.json in
	this repository for a sample.

# Getting Your Scene Information
	Scene numbers can be identified by navigating to the eDin Control
	configuration page on NPU and then hovering the mouse over each number
	above the scene name.  It will read 	Rs232: SCENEXXXGO where XXX is
	the scene number.

# Configuration

Configuration sample:
