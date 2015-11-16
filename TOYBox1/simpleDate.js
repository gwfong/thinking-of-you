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

var monthNames = [{
	full: 'January',
	abbreviated: 'Jan'
}, {
	full: 'February',
	abbreviated: 'Fed'
}, {
	full: 'March',
	abbreviated: 'Mar'
}, {
	full: 'April',
	abbreviated: 'Apr'
}, {
	full: 'May',
	abbreviated: 'May'
}, {
	full: 'June',
	abbreviated: 'Jun'
}, {
	full: 'July',
	abbreviated: 'Jul'
}, {
	full: 'August',
	abbreviated: 'Aug'
}, {
	full: 'September',
	abbreviated: 'Sep'
}, {
	full: 'October',
	abbreviated: 'Oct'
}, {
	full: 'November',
	abbreviated: 'Nov'
}, {
	full: 'December',
	abbreviated: 'Dec'
}];

/**
 *
 */
function _get12Hour(hour) {
	if (hour < 1) {
		return {
			hour: 12,
			meridiem: 'am'
		}
	} else if (hour < 13) {
		return {
			hour: hour,
			meridiem: hour < 12 ? 'am' : 'pm'
		}
	} else {
		return {
			hour: hour - 12,
			meridiem: 'pm'
		}
	}
}

/**
 * Return an object that contains the date and the time.
 * @return object that has date and time properties
 * {
 *   date: date in short word format
 *   time: time in 12-hour format
 * }
 */
function _getDateAndTime() {
	var now = new Date();
	var hour = _get12Hour(now.getHours());
	function padIf(n) {
		return n < 10 ? ('0' + n) : n;
	}
	return {
		date: '' + monthNames[now.getMonth()].abbreviated + ' ' + now.getDate() + ', ' + now.getFullYear(),
		time: '' + padIf(hour.hour) + ':' + padIf(now.getMinutes()) + ' ' + hour.meridiem
	};
}

exports.getDateAndTime = _getDateAndTime;
