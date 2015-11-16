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

var PIN_LED = 3;
var FADE_DELAY = 50;
var FADE_AMT = 0.02;
var LED_MAX_VAL = 0.5;
var LED_MIN_VAL = 0.0;
var DISABLE_DELAY = 200;

var led = null;
var isThinkingOfYou = false;

function _init() {
	console.log('init LED heart');
	led = new MRAA.Pwm(PIN_LED, false, -1);
	led.period_ms(1000);
}

function l() {
	if (!led) {
		throw new Error('error: led was not initialized');
	}
	return led;
}

/**
 * @return Promise
 */
function _fadeIn(lightVal) {

	return new Promise(function(resolve) {
		(function fadeIn() {
			if (lightVal < LED_MAX_VAL) {
				Promise.delay(FADE_DELAY).then(function() {
					lightVal += FADE_AMT;
					l().write(lightVal);
					fadeIn(lightVal);
				})
			} else {
				resolve();
			}
		})();
	});
}

function _fadeOut(lightVal) {

	return new Promise(function(resolve) {
		(function fadeOut() {
			if (lightVal > LED_MIN_VAL) {
				Promise.delay(FADE_DELAY).then(function() {
					lightVal -= FADE_AMT;
					l().write(lightVal);
					fadeOut(lightVal);
				})
			} else {
				resolve();
			}
		})();
	});
}

function _selfTestAsync() {
	console.log('led heart self test');
	return _pulseHeartNTimes(2);
}

function _pulseHeartNTimes(nTimes) {
	return new Promise(function(resolve) {
		var i = 0;
		_pulseHeart({
			shouldContinue: function() {
				return ++i < nTimes;
			},
			done: function() {
				resolve();
			}
		});
	});
}

/**
 * @param args {
 *   shouldContinue: function which when called returns true to contnue or false to stop
 *   done: function which if exists is called after the pulsing has stopped.
 * }
 */
function _pulseHeart(args) {
	(function pulseOnce() {
		console.log('pulse heart');
		l().enable(true);
		_fadeIn(LED_MIN_VAL).then(function() {
			_fadeOut(LED_MAX_VAL).then(function() {

				// Continue to pulse if not signaled to stop; otherwise stop
				if (args.shouldContinue()) {
					setTimeout(pulseOnce, 0);
				} else {
					Promise.delay(DISABLE_DELAY).then(function() {
						l().enable(false);
						if (args.done) {
							args.done();
						}
					});
				}
			});
		});
	})();
}

function _start() {
	// Nothing to do
}

function _startThinkingOfYou() {
	console.log('led heart: start thinking of you');

	if (!isThinkingOfYou) {
		isThinkingOfYou = true;
		_pulseHeart({
			shouldContinue: function() {
				return isThinkingOfYou;
			}});
	}
}

function _stopThinkingOfYou() {
	console.log('led heart: stop thinking of you');
	isThinkingOfYou = false;
}

exports.init = _init;
exports.selfTestAsync = _selfTestAsync;
exports.start = _start;
exports.startThinkingOfYou = _startThinkingOfYou;
exports.stopThinkingOfYou = _stopThinkingOfYou;
