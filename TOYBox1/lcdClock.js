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
var fs = require('fs');
var path = require('path');

var LCD = require('jsupm_i2clcd');
var SimpleDate = require('./simpleDate');

var REPEATEDLY_DISPLAY_TIME = 60*1000; // minute
var I2C_BUS_LCD = 6;
var LCD_ADDRESS = 0x3E;
var RGB_ADDRESS = 0x62;
var COLOR_WHITE = [255, 255, 255];
var COLOR_BLACK = [0, 0, 0];
var COLS = 16;
var QUICK_MESSAGE_DELAY = 2000;

var lcd = null;
var displayDateTimeIntervalId = null;
var setColorTimeoutId = null;
var isThinkingOfYou = false;

function _init() {
	console.log('lcd clock init');
	lcd = new LCD.Jhd1313m1(
		I2C_BUS_LCD,
		LCD_ADDRESS,
		RGB_ADDRESS);
}

function l() {
	if (!lcd) {
		throw new Error('error: LCD is not initialized');
	}
	return lcd;
}

function _turnOffLight() {
	l().setColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
}

function _turnOnLight() {
	l().setColor(COLOR_WHITE[0], COLOR_WHITE[1], COLOR_WHITE[2]);
}

function _resetText() {
	l().clear();
	l().home();
}

function _resetLcd() {
	_resetText();
	_turnOffLight();
}

function _selfTestAsync() {
	console.log('lcd clock self test');
	return new Promise(function(resolve) {
		l().setCursor(0, 0);
		_writeRow1('row 1');
		_writeRow2('row 2');
		for (var r = 0; r < 255; r += 25) {
			for (var g = 0; g < 255; g += 25) {
				for (var b = 0; b < 255; b += 25) {
					l().setColor(r, g, b);
				}
			}
		}
		_resetLcd();
		resolve();
	});
}

function _start() {
	_resetText();
	_turnOnLight();
	_repeatedlyDisplayDateTime();
}

function _writeRow1(msg, col) {
	l().setCursor(0, (col || 0));
	l().write(msg);
}

function _writeRow2(msg, col) {
	l().setCursor(1, (col || 0));
	l().write(msg);
}

function _displayDateTime() {
	var datetime = SimpleDate.getDateAndTime();
    l().clear();
	_writeRow1(datetime.date, 2);
	_writeRow2(datetime.time, 4);
}

function _repeatedlyDisplayDateTime() {
	// Display the datetime now and then establish a timer to do it every so often.
	_displayDateTime();
	displayDateTimeIntervalId = setInterval(_displayDateTime, REPEATEDLY_DISPLAY_TIME);
}

function _stopDisplayTime() {
	if (displayDateTimeIntervalId) {
		clearInterval(displayDateTimeIntervalId);
		displayDateTimeIntervalId = null;
	}
	_resetLcd();
}

function _startThinkingOfYou(msg1, msg2) {
	if (!isThinkingOfYou) {
		isThinkingOfYou = true;
		console.log('lcd clock: start thinking of you');

		_stopDisplayTime();
		_resetText();
		_writeMessage(msg1, msg2);

		(function randomizeColor() {
			_setRandomColor();
			if (isThinkingOfYou) {
				setColorTimeoutId = setTimeout(randomizeColor, 1000);
			}
		})();
	}
}

function _writeMessage(msg1, msg2) {
	_writeMessageOnRow(0, msg1);
	_writeMessageOnRow(1, msg2);
}

function _writeMessageOnRow(row, msg) {
	if (msg) {
		l().setCursor(row, Math.floor((COLS - msg.length) / 2));
		l().write(msg);
	}
}

function _setRandomColor() {
	l().setColor(
		Math.floor(Math.random() * 256),
		Math.floor(Math.random() * 256),
		Math.floor(Math.random() * 256))
}

function _stopThinkingOfYou() {
	console.log('lcd clock: stop thinking of you');
	if (isThinkingOfYou) {
		isThinkingOfYou = false;

		clearTimeout(setColorTimeoutId);
		_resetText();
		_turnOnLight();
		_repeatedlyDisplayDateTime();
	}
}

function _displayQuickMessage(msg1, msg2) {
	_stopDisplayTime();
	_resetText();
	_turnOnLight();
	_writeMessage(msg1, msg2);
	Promise.delay(QUICK_MESSAGE_DELAY).then(function() {
		_repeatedlyDisplayDateTime();
	});
}

exports.init = _init;
exports.selfTestAsync = _selfTestAsync;
exports.start = _start;
exports.COLOR_BLACK = COLOR_BLACK;
exports.COLOR_WHITE = COLOR_WHITE;
exports.startThinkingOfYou = _startThinkingOfYou;
exports.stopThinkingOfYou = _stopThinkingOfYou;
exports.displayQuickMessage = _displayQuickMessage;
