/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
 * Copyright 2015 Gary Fong
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs');
var path = require('path');

var PIN_STOP_SEND_TOY_BUTTON = 4;
var PIN_STOP_SEND_TOY_BUTTON_LED = 5;

console.log('starting app');
var Promise = require('bluebird');
var StepperFlower = require('./stepperFlower');
var LCDClock = require('./lcdClock');
var LEDHeart = require('./ledHeart');
var SimpleLedButton = require('./simpleLedButton');
var SimplePushbullet = require('./simplePushbullet');
var ELPicture = require('./elPicture');

var TOY_MESSAGES_JSON = 'toyMessages.json';

var btnStopSendToy = null;
var simplePushbullet = null;
var toyMessages = null;
var isThinkingOfYou = false;

function initComponents() {
    console.log('initializing components...');
    
    console.log('LCD clock');
    LCDClock.init();
    
    console.log('stepper flower');
    StepperFlower.init();
    
    console.log('led heart');
    LEDHeart.init();
    
    btnStopSendToy = new SimpleLedButton('btnStopSendToy', PIN_STOP_SEND_TOY_BUTTON, PIN_STOP_SEND_TOY_BUTTON_LED);
    btnStopSendToy.init({
        onClick: btnStopSendToy_onClick,
		thisObj: this
    });

	ELPicture.init();

	simplePushbullet = new SimplePushbullet('simplePushbulletConfig.json');
	simplePushbullet.init();

	simplePushbullet.onMessage(simplePushbullet_onMessage);

	loadToyMessages();
}

function loadToyMessages() {
	toyMessages = JSON.parse(fs.readFileSync(path.join(__dirname, TOY_MESSAGES_JSON)));
}

function runSelfTestsAsync() {
    console.log('running self tests...');

	return new Promise(function(resolve) {

		console.log('LCD clock');
		LCDClock.selfTestAsync().then(function() {
			console.log('LED heart');
			return LEDHeart.selfTestAsync();
		}).then(function() {
			console.log('stepper flower');
			return StepperFlower.selfTestAsync();
		}).then(function() {
			console.log('stop send toy button');
			return btnStopSendToy.selfTestAsync();
		}).then(function() {
			console.log('el picture');
			return ELPicture.selfTestAsync();
		});

		resolve();
	});
}

function startApp() {

    process.on('exit', function() {
        console.log('exiting app');
    });
    
    LCDClock.start();
    StepperFlower.start();
    LEDHeart.start();
    btnStopSendToy.start();
	simplePushbullet.start();
    
    startMainLoop();
	console.log('application has been started');
}

function startMainLoop() {
    setInterval(function() {}, 100);
}

function btnStopSendToy_onClick() {
    console.log('on click');
	if (isThinkingOfYou) {
		isThinkingOfYou = false;
		stopThinkingOfYou();
		btnStopSendToy.turnOffLed();
	} else {
		sendToyMessage();
	}
}

function sendToyMessage() {
	console.log('sending toy message');

	var msg = {};
	var rand = Math.floor(Math.random() * 3);
	switch(rand) {
	case 0:
		msg.type = 'heart';
		break;
	case 1:
		msg.type = 'flower';
		break;
	case 2:
		msg.type = 'message';
		msg.message = toyMessages.messages[Math.floor(Math.random() * toyMessages.messages.length)];
		break;
	}
	simplePushbullet.sendToyMessage({
		email: 'carternator1@gmail.com',
		message: msg
	}).then(function() {
		LCDClock.displayQuickMessage('TOY message sent')
	});
}

function simplePushbullet_onMessage(msg) {

	// Stop previous TOY messages, if any.
	stopThinkingOfYou();

	Promise.delay(1000).then(function() {
		isThinkingOfYou = true;
		btnStopSendToy.turnOnLed();

		// Start new TOY message.
		switch(msg.type) {
		case 'heart':
			LEDHeart.startThinkingOfYou();
			break;
		case 'flower':
			StepperFlower.startThinkingOfYou();
			break;
		case 'message':
			LCDClock.startThinkingOfYou(msg.message.r1, msg.message.r2);
			break;
		case 'picture':
			ELPicture.startThinkingOfYou();
			break;
		}
	});
}

function stopThinkingOfYou() {
	LEDHeart.stopThinkingOfYou();
	StepperFlower.stopThinkingOfYou();
	LCDClock.stopThinkingOfYou();
	ELPicture.stopThinkingOfYou();
}

function exitApp() {
    console.log('exiting app');
    
    console.log('done');
}

initComponents();
runSelfTestsAsync().then(function() {
	startApp();
});
