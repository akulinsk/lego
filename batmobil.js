require("./lego_constants");

//
//const dualShock = require('dualshock-controller');
const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();
const readline = require('readline');

const FORWARD=1;
const BACKWARD=-1;

const NO_TURN = 1;
const SLOW_TURN = 2;
const FAST_TURN = 4;

var speed = 50;
/*
var controller = dualShock(
    {
        //you can use a ds4 by uncommenting this line.
        //config: "dualshock4-generic-driver",
        //if the above configuration doesn't work for you,
        //try uncommenting the following line instead.
        //config: "dualshock4-alternate-driver"
        //if using ds4 comment this line.
        //config: "dualShock3",
        //smooths the output from the acelerometers (moving averages) defaults to true
        accelerometerSmoothing: true,
        //smooths the output from the analog sticks (moving averages) defaults to false
        analogStickSmoothing: false
    });
*/
//make sure you add an error event handler
//controller.on('error', err => console.log(err));

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    await hub.connect(); // Connect to the Hub
    await hub.sleep(3000); // Sleep for 3 seconds before starting
    if (hub.uuid == BATMOBIL_UUID) {
        console.log("Batmobil hub connected hub.");
        console.log("Setting up key controls.");
        setupKeystrokes(hub);
        console.log("Setting up monitoring thread.");
        setInterval(function(arg){ console.log("Battery level: " + hub.batteryLevel);}, 10000, 'funky');
    }
    else {
        console.log("Unknown HUB detected - it sucks ! (UUID: "+ hub.uuid +")");
    }
});

function setupKeystrokes(hub) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
        var divider = key.shift?SLOW_TURN:FAST_TURN;
        if (key.ctrl && key.name === 'c') {
            process.exit();
        }
        else if (["0","1","2","3","4","5","6","7","8","9"].includes(key.name)) {
            speed = 10 * (parseInt(key.name)+1);
            console.log("Setting speed to " + speed);
        } else {
            switch(key.name) {
                case 'up':
                    moveVehicle(hub, speed, FORWARD, 1, 1);
                    break;
                case 'down':
                    moveVehicle(hub, speed, BACKWARD, 1, 1);
                    break;
                case 'left':
                    moveVehicle(hub, speed, FORWARD, 1, divider);
                    break;
                case 'right':
                    moveVehicle(hub, speed, FORWARD, divider, 1);
                    break;
                case 's':
                case 'space':
                    moveVehicle(hub, 0);
                    break;
                default:
                console.log(`You pressed the "${str}" key`);
                console.log();
                console.log(key);
                console.log();
            }
        }
    });

    function moveVehicle(hub, speed, direction, dividerA, dividerB) {
        hub.setMotorSpeed("A", direction*Math.round(speed/dividerA));
        hub.setMotorSpeed("B", -direction*Math.round(speed/dividerB));
    }



    console.log('*****************Batmobil Controller*****************');
    console.log('* For speed press 1...9                             *');
    console.log('* Arrows for directions                             *');
    console.log('* Shift to change turn angle                        *');
    console.log('*****************************************************');
}

console.log("Scanning for PoweredUP compliant bricks.");
poweredUP.scan();