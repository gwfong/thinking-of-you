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
var Pushbullet = require('pushbullet');
var fs = require('fs');
var path = require('path');

/**
 * Simple Pushbullet class to encapsulate the nitty gritty.
 */
function SimplePushbullet(configFile) {

	this.configJson = JSON.parse(fs.readFileSync(path.join(__dirname, configFile)));
	this.pushbullet = new Pushbullet(this.configJson.apiKey);
	this.onMessageCallback = null;
	this.pushbulletStream = null;
}

SimplePushbullet.prototype.init = function() {
	console.log('simple push bullet init');
	this.pushbulletStream = this.pushbullet.stream();
	this.pushbulletStream.on('message', SimplePushbullet.prototype._onMessage.bind(this));
}

SimplePushbullet.prototype.selfTestAsync = function() {
	console.log('simple push bullet self test');
	return Promise.resolve(true);
}

SimplePushbullet.prototype.start = function() {
	this.pushbulletStream.connect();
}

SimplePushbullet.prototype.onMessage = function(callback) {
	this.onMessageCallback = callback;
}

SimplePushbullet.prototype._onMessage = function(args) {
	console.log('onMessage');

	if (args.type != 'tickle') {
		return;
	}

	var that = this;
	this.pushbullet.history({
		limit: 1
	},
    function(err, resp) {

		// I'm notified when I send a push. So let's skip my notifications.
		if (resp
			&& resp.pushes.length
			&& resp.pushes[0].sender_iden
			&& resp.pushes[0].sender_iden == that.configJson.iden) {
			return;
		}

		// Notify my message listener.
		var msg = resp.pushes[0].body;
		console.log('msg: ' + msg);
		that.onMessageCallback(JSON.parse(msg));
	});
}

/**
 * @param args {
 *   email: email to send the message to
 *   message: the message to send
 * }
 */
SimplePushbullet.prototype.sendToyMessage = function(args) {
	var jsonMsg = JSON.stringify(args.message);
	console.log('sending toy message: ' + jsonMsg);

	var that = this;
	return new Promise(function(resolve) {
		that.pushbullet.note(args.email, 'TOY message', jsonMsg, function(err, resp) {
			console.log('toy message has been sent');
			resolve();
		});
	});
}

module.exports = SimplePushbullet;
