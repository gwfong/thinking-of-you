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

var Promise = require('bluebird');
var MRAA = require('mraa');

var BUTTON_MULTI_CLICK_DELAY = 750;
var BLINK_DELAY = 500;
var HIGH = 1;
var LOW = 0;

/**
 * @param name
 * @param btnPin
 * @param ledPin
 */
function SimpleLedButton(name, btnPin, ledPin) {
	this.name = name;
	this.btnPin = btnPin;
	this.ledPin = ledPin;
	this.lastClicked = 0;
	this.btn = null;
	this.led = null;
}

/**
 * @param args {
 *   onClick: event handler for click event
 *   thisObj: 'this' object to set to; defaults to this simple button instance
 * }
 */
SimpleLedButton.prototype.init = function(args) {
	console.log('button ' + this.name + ' init');
	this.btn = new MRAA.Gpio(this.btnPin);
	this.btn.dir(MRAA.DIR_IN);

	this.led = new MRAA.Gpio(this.ledPin);

	this.btn.isr(MRAA.EDGE_FALLING, SimpleLedButton.prototype.onClick.bind(this, args.onClick, args.thisObj || this ));
}

SimpleLedButton.prototype.selfTestAsync = function() {
	console.log('simple led button self test');
	return this.blinkNTimes(2);
}

SimpleLedButton.prototype.start = function() {
	// Nothing to do
}

SimpleLedButton.prototype.onClick = function(callback, thisObj) {
	var lastLastClicked = this.lastClicked;
	this.lastClicked = Date.now();
	if ((this.lastClicked - lastLastClicked) >= BUTTON_MULTI_CLICK_DELAY) {
		callback.call(thisObj);
	}
}

SimpleLedButton.prototype.turnOnLed = function() {
	this.led.write(HIGH);
}

SimpleLedButton.prototype.turnOffLed = function() {
	this.led.write(LOW);
}

SimpleLedButton.prototype.blink = function(args) {

	var that = this;

	(function blinkOnce() {
		that.turnOnLed();
		Promise.delay(BLINK_DELAY).then(function() {
			that.turnOffLed();

			if (args.shouldContinue()) {
				setTimeout(blinkOnce, BLINK_DELAY);
			} else {
				if (args.done) {
					args.done();
				}
			}
		});
	})();
}

SimpleLedButton.prototype.blinkNTimes = function(nTimes) {
	var that = this;
	return new Promise(function(resolve) {
		var i = 0;
		that.blink({
			shouldContinue: function() {
				return ++i < nTimes;
			},
			done: function() {
				resolve();
			}
		});
	});
}

module.exports = SimpleLedButton;
