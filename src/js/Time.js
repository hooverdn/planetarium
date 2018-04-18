/*
 * (MIT License)
 * Copyright 2017,2018  Douglas N. Hoover
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


// If clockStarted is 0, clock is stopped; if clockStarted is
// undefined, clock is started now.
var Time = function ( baseTime, rate, stopped ) {

	this.baseTime = baseTime || Date.now();
	this.rate = rate;
	this.clockStarted = Date.now();
	this.stopped = !! stopped;

};

Time.prototype = {};

Time.prototype.constructor = Time;

Time.prototype.setRate = function ( rate ) {

	if ( ! this.stopped ) {

		var now = Date.now();
		this.baseTime += this.rate * ( now - this.clockStarted );
		this.clockStarted = now;

	}
	this.rate = rate;

};

Time.prototype.stop = function () {

	if ( ! this.stopped ) {

		this.baseTime += this.rate * ( Date.now() - this.clockStarted );
		this.stopped = true;

	}

};

Time.prototype.start = function () {

	if ( this.stopped ) {

		this.clockStarted = Date.now();
		this.stopped = false;

	}

};

Time.prototype.getRate = function () {

	return this.rate;

};

Time.prototype.increment = function ( timeChange ) {

	this.baseTime += timeChange;

};

Time.prototype.getTime = function () {

	return this.baseTime +
        ( this.stopped ? 0 : this.rate * ( Date.now() - this.clockStarted ) );

};

Time.prototype.setTime = function ( newTime ) {

	this.baseTime = newTime;
	this.clockStarted = Date.now();

};

Time.prototype.incrementTime = function ( timeMod ) {

	var years = timeMod.years || 0;
	var months = timeMod.months || 0;
	var days = timeMod.days || 0;
	var hours = timeMod.hours || 0;
	var minutes = timeMod.minutes || 0;
	var seconds = timeMod.seconds || 0;
	var millis = timeMod.millis || 0;

	if ( ! ( years || months || days || hours || minutes || seconds || millis ) ) {

		return;

	}

	millis += seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 24 * 3600000;
	this.baseTime += millis;

	if ( months || years ) {

		var date = new Date( this.getTime() );
		months += date.getUTCMonth();
		years += date.getUTCFullYear();

		// normalize months and years
		years += months / 12;
		months = ( months + 12 ) % 12; // because we want -1 -> 11

		date.setUTCFullYear( years );
		date.setUTCMonth( months );
		this.setTime( date.getTime() );

	}

};


export default Time;
