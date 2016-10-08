# homebridge-modelighting
homebridge-plugin for Mode Lighting using Remote Control Interface

# Installation

    Install homebridge using: sudo npm install -g homebridge
    Install this plugin using: sudo npm install -g homebridge-modelighting
    Update your configuration file. See sample-config.json in this repository for a sample.

# Configuration

Configuration sample:

"accessories": [
	{
	"accessory": "modelighting",
	"NPU_IP": "192.168.1.100",
	"name": "Kitchen",
	"on_cmd": "001",
	"off_cmd": "002"
	},

	{
	"accessory": "modelighting",
	"NPU_IP": "192.168.1.100",
	"name": "Living Room",
	"on_cmd": "003",
	"off_cmd": "004"
	},
]