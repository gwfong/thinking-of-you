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

var PIN_EL = 6;
var HIGH = 1;
var LOW = 0;
var BLINK_DELAY = 500;
var el = null;
var isThinkingOfYou = false;

function _init() {
	console.log('el picture: init');
	el = new MRAA.Gpio(PIN_EL);
	el.dir(MRAA.DIR_OUT);
}

function _start() {
	// Nothing to do
}

function _selfTestAsync() {
	console.log('el picture: self test');
	return _blinkNTimes(2);
}

function _startThinkingOfYou() {
	console.log('el picture: start thinking of you');
	if (!isThinkingOfYou) {
		isThinkingOfYou = true;
		_blink({
			shouldContinue: function() {
				return isThinkingOfYou;
			}
		});
	}
}

function _stopThinkingOfYou() {
	console.log('el picture: stop thinking of you');
	isThinkingOfYou = false;
}

function _turnOnEl() {
	el.write(HIGH);
}

function _turnOffEl() {
	el.write(LOW);
}

/**
 * @param args {
 *   shouldContinue: function which when called returns true to contnue or false to stop
 *   done: function which if exists is called after the blinking has stopped.
 * }
 */
function _blink(args) {
	(function blinkOnce() {
		_turnOnEl();
		Promise.delay(BLINK_DELAY).then(function() {
			_turnOffEl();

			// Continue to pulse if not signaled to stop; otherwise stop
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

function _blinkNTimes(nTimes) {
	return new Promise(function(resolve) {
		var i = 0;
		_blink({
			shouldContinue: function() {
				return ++i < nTimes;
			},
			done: function() {
				resolve();
			}});
	});
}


exports.init = _init;
exports.start = _start;
exports.selfTestAsync = _selfTestAsync;
exports.startThinkingOfYou = _startThinkingOfYou;
exports.stopThinkingOfYou = _stopThinkingOfYou;
