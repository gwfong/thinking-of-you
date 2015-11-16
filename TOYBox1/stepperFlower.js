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
var GroveMD = require('jsupm_grovemd');

var I2C_BUS_STEPPER = 6;
var STEPS_PER_ROTATION = 24;

var stepper = null;
var isThinkingOfYou = false;

function _init() {
	console.log('stepper flow init');
    stepper = new GroveMD.GroveMD(
        I2C_BUS_STEPPER,
        GroveMD.GROVEMD_DEFAULT_I2C_ADDR);
    stepper.configStepper(STEPS_PER_ROTATION);
 }

function s() {
	if (!stepper) {
		throw new Error('error: stepper is not initialized');
	}
	return stepper;
}

function _selfTestAsync() {
	console.log('stepper flower self test');
	return new Promise(function(resolve) {
		_rotateBackAndForthNTimes(2);
		resolve();
	});
}

function _start() {
	// Nothing to do
}

function _rotateForward(nSteps) {
	s().setStepperSteps(nSteps);
	s().enableStepper(GroveMD.GroveMD.STEP_DIR_CW, 20);
}

function _rotateBackward(nSteps) {
	s().setStepperSteps(nSteps);
	s().enableStepper(GroveMD.GroveMD.STEP_DIR_CCW, 20);
}

function _rotateBackAndForth(args) {
	(function rotateOnce() {
		console.log('rotate flower back and forth');
		_rotateForward(1);
		_rotateBackward(2);
		if (args.shouldContinue()) {
			setTimeout(rotateOnce, 0);
		}
	})();
}

function _rotateBackAndForthNTimes() {
	var i = 0;
	_rotateBackAndForth({
		shouldContinue: function() {
			return ++i < 2;
		}
	});
}

function _startThinkingOfYou() {
	console.log('stepper flower: start thinking of you');
	if (!isThinkingOfYou) {
		isThinkingOfYou = true;

		_rotateBackAndForth({
			shouldContinue: function() {
				return isThinkingOfYou;
			}
		});
	}
}

function _stopThinkingOfYou() {
	console.log('stepper flower: stop thinking of you');
	if (isThinkingOfYou) {
		isThinkingOfYou = false;
	}
}

exports.init = _init;
exports.selfTestAsync = _selfTestAsync;
exports.start = _start;
exports.startThinkingOfYou = _startThinkingOfYou;
exports.stopThinkingOfYou = _stopThinkingOfYou;
