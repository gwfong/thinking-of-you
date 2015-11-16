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

function SimpleButton(name, pin) {
	this.name = name;
	this.pin = pin;
	this.btn = null;
	this.lastClicked = 0;
}

/**
 * @param args {
 *   onClick: event handler for click event
 *   thisObj: 'this' object to set to; defaults to this simple button instance
 * }
 */
SimpleButton.prototype.init = function(args) {
	console.log('button ' + this.name + ' init');
	this.btn = new MRAA.Gpio(this.pin);
	this.btn.dir(MRAA.DIR_IN);

	this.btn.isr(MRAA.EDGE_FALLING, SimpleButton.prototype.onClick.bind(this, args.onClick, args.thisObj || this ));
}

SimpleButton.prototype.selfTestAsync = function() {
	console.log('button ' + this.name + ' self test');
	return Promise.resolve(true);
}

SimpleButton.prototype.start = function() {
	// Nothing to do
}

SimpleButton.prototype.onClick = function(callback, thisObj) {
	var lastLastClicked = this.lastClicked;
	this.lastClicked = Date.now();
	if ((this.lastClicked - lastLastClicked) >= BUTTON_MULTI_CLICK_DELAY) {
		callback.call(thisObj);
	}
}

module.exports = SimpleButton;
