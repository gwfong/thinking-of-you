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

var PIN_STOP_TOY_BUTTON = 8;
var PIN_SEND_TOY_BUTTON = 4;

console.log('starting app');
var Promise = require('bluebird');
var StepperFlower = require('./stepperFlower');
var LCDClock = require('./lcdClock');
var LEDHeart = require('./ledHeart');
var SimpleButton = require('./simpleButton');
var SimplePushbullet = require('./simplePushbullet');

var TOY_MESSAGES_JSON = 'toyMessages.json';

var btnStopToy = null;
var btnSendToy = null;
var simplePushbullet = null;
var toyMessages = null;

function initComponents() {
    console.log('initializing components...');
    
    console.log('LCD clock');
    LCDClock.init();
    
    console.log('stepper flower');
    StepperFlower.init();
    
    console.log('led heart');
    LEDHeart.init();
    
    btnStopToy = new SimpleButton('btnStopToy', PIN_STOP_TOY_BUTTON);
    btnStopToy.init({
        onClick: btnStopToy_onClick,
		thisObj: this
    });

    btnSendToy = new SimpleButton('btnSendToy', PIN_SEND_TOY_BUTTON);
    btnSendToy.init({
        onClick: btnSendToy_onClick,
		thisObj: this
    });

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
			console.log('stop toy button');
			return btnStopToy.selfTestAsync();
		}).then(function() {
			console.log('send toy button');
			return btnSendToy.selfTestAsync();
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
    btnStopToy.start();
	btnSendToy.start();
	simplePushbullet.start();
    
    startMainLoop();
	console.log('application has been started');
}

function startMainLoop() {
    setInterval(function() {}, 100);
}

function btnStopToy_onClick() {
    console.log('btn stop: on click');
	stopThinkingOfYou();
}

function btnSendToy_onClick() {
    console.log('btn send: on click');
	sendToyMessage();
}

function sendToyMessage() {

	console.log('choosing message to send');
	var msg = {};
	var rand = Math.floor(Math.random() * 4);
	console.log('rand: ' + rand);
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
	case 3:
		msg.type = 'picture';
		break;
	}

	console.log('sending toy message');
	simplePushbullet.sendToyMessage({
		email: 'gwfong65@gmail.com',
		message: msg
	}).then(function() {
		LCDClock.displayQuickMessage('TOY message sent');
	});
}

function simplePushbullet_onMessage(msg) {

	// Stop previous TOY messages, if any.
	stopThinkingOfYou();

	Promise.delay(1000).then(function() {

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
		}
	});
}

function stopThinkingOfYou() {
	LEDHeart.stopThinkingOfYou();
	StepperFlower.stopThinkingOfYou();
	LCDClock.stopThinkingOfYou();
}

function exitApp() {
    console.log('exiting app');
    
    console.log('done');
}

initComponents();
runSelfTestsAsync().then(function() {
	startApp();
});
