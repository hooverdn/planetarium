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

import Utils from './Utils.js';
import { ssettings } from './SSettings.js';

import Time from './Time.js';
import {

	planets,

} from './DecoratedPlanet.js';

let isMobile = navigator.userAgent.indexOf( 'Mobile' ) >= 0;
let isApple = navigator.userAgent.indexOf( 'Mac OS X' ) >= 0;
let screenfull;
let devicePosition;

var time;

if ( ssettings.get( 'time', 'realtime' ) ) {

	time = new Time( Date.now(), ssettings.get( 'time', 'rate' ) );

} else {

	time = new Time(
		ssettings.get( 'time', 'timeset' ),
		ssettings.get( 'time', 'rate' ),
		ssettings.get( 'time', 'stopped' )
	);

}

import { requestCompassCorrection } from './Orientation.js';


class SettingsControl {

	static updateNumber( section, item, type1, type2 ) {

		var input = document.getElementById( item + '-' + type1 );

		if ( input ) {

			var disp = document.getElementById( item + '-' + type2 );
			if ( disp ) {

				disp.value = input.value;

			}
			ssettings.set( section, item, parseFloat( input.value ) );

		}

	}

	static setNumber( section, item, value ) {

		value = Utils.roundTo2( value || ssettings.get( section, item ) );


		var range = document.getElementById( item + '-range' );
		if ( range ) range.value = value;

		var number = document.getElementById( item + '-number' );
		if ( number ) number.value = value;

	}

	static updateValue( section, item ) {

		ssettings.set( section, item, document.getElementById( item ).value );

	}

	static setValue( section, item, value ) {

		value = value || ssettings.get( section, item );
		if ( typeof value === 'number' ) value = Utils.roundTo2( value );
		var elem = document.getElementById( item );
		if ( elem ) elem.value = value;

	}

	static updateBoolean( section, item ) {

		ssettings.set( section, item, document.getElementById( item ).value === 'true' );

	}

	static setBoolean( section, item, value ) {

		value = value || ssettings.get( section, item );
		var elem = document.getElementById( item );
		if ( elem ) elem.value = value ? 'true' : 'false';

	}

	static geolocate() {

		if ( navigator && navigator.geolocation ) {

			if ( devicePosition ) {

				SettingsControl.successCallback( devicePosition );

			} else {

				navigator.geolocation.getCurrentPosition(
					SettingsControl.successCallback,
					SettingsControl.errorCallback
				);

			}

			return true;

		}

		return false;

	}



	static setLocationValues() {

		var latitude = ssettings.get( 'location', 'latitude' );
		var longitude = ssettings.get( 'location', 'longitude' );
		var altitude = ssettings.get( 'location', 'altitude' );
		if ( latitude == 500 || longitude == 500 ) {

			var altRange = document.getElementById( 'altitude-range' );
			if ( altRange ) altRange.value = altitude;
			let altNumber = document.getElementById( 'altitude-number' );
			if ( altNumber ) altNumber.value = altitude;

			// geolocate
			if ( ! SettingsControl.geolocate() ) {

				// use backup values
				ssettings.set( 'location', 'latitude', 40.0 );
				ssettings.set( 'location', 'longitude', - 100.0 );

			}

		} else {

			var latRange = document.getElementById( 'latitude-range' );
			if ( latRange ) latRange.value = latitude;
			document.getElementById( 'latitude-number' ).value = latitude;
			var longRange = document.getElementById( 'longitude-range' );
			if ( longRange ) longRange.value = longitude;
			document.getElementById( 'longitude-number' ).value = longitude;
			var altRange = document.getElementById( 'altitude-range' );
			if ( altRange ) altRange.value = altitude;
			let altNumber = document.getElementById( 'altitude-number' );
			if ( altNumber ) altNumber.value = altitude;

		}

		SettingsControl.setValue( 'location', 'planet' );

	}

	static successCallback( position ) {

		ssettings.set( 'location', 'latitude', Utils.roundTo1( position.coords.latitude ) );
		ssettings.set( 'location', 'longitude', Utils.roundTo1( position.coords.longitude ) );
		SettingsControl.setNumber( 'location', 'latitude' );
		SettingsControl.setNumber( 'location', 'longitude' );

		// If device is not mobile, there is probably no compass.
		// If an iPhone has a compass, it has a "True North" setting; we
		// assume that is being used.
		if ( isMobile && ! isApple ) {

			requestCompassCorrection();

		}

	}

	static errorCallback() {

		var latitude = ssettings.get( 'location', 'latitude' );
		var longitude = ssettings.get( 'location', 'longitude' );

		if ( latitude == 500 || longitude == 500 ) {

			// fake values, use backup values

			ssettings.set( 'location', 'latitude', 40.0 );
			ssettings.set( 'location', 'longitude', - 100.0 );
			SettingsControl.setNumber( 'location', 'latitude', 40.0 );
			SettingsControl.setNumber( 'location', 'longitude', - 100.0 );

		}
		// otherwise no change

	}

	static setViewValues() {

		SettingsControl.setNumber( 'view', 'elevation' );
		SettingsControl.setNumber( 'view', 'rotation' );
		SettingsControl.setNumber( 'view', 'zoom' );
		SettingsControl.setBoolean( 'view', 'lines' );

	}

	static updateTimeRate( section, item ) {

		var val;
		if ( typeof item === 'number' ) {

			val = item;

		} else {

			val = parseInt( document.getElementById( item ).value );

		}
		time.setRate( val );
		if ( val != 1 ) {

			ssettings.set( 'time', 'realtime', false );

		}
		ssettings.set( 'time', 'rate', val );

	}

	static toggleTimeStopped() {

		if ( time.stopped ) {

			time.start();

		} else {

			time.stop();
			ssettings.set( 'time', 'realtime', false );

		}
		ssettings.set( 'time', 'stopped', time.stopped );
		SettingsControl.setTimeValues();

	}

	static intToString( number, minDigits ) {

		var str = '' + number;
		for ( var ct = minDigits - str.length; ct > 0; ct -- ) {

			str = '0' + str;

		}
		return str;

	}

	static realTime() {

		time.setRate( 1 );
		time.start();
		time.setTime( Date.now() );
		ssettings.set( 'time', 'realtime', true );
		ssettings.set( 'time', 'rate', 1 );
		ssettings.set( 'time', 'stopped', false );
		SettingsControl.setTimeValues();
		//refresh();
		//console.log( 'realTime refresh' );

	}

	static changeTime( timeMod ) {

		time.incrementTime( timeMod );
		ssettings.set( 'time', 'realtime', false );
		ssettings.set( 'time', 'timeset', time.getTime() );
		SettingsControl.setTimeValues();
		//refresh();
		//console.log( 'changeTime refresh' );

	}

	static enableOptionElement( elem, enabled ) {

		if ( enabled ) {

			elem.style = {};
			elem.className = 'option';
			elem.onclick = SettingsControl.realTime;

		} else {

			elem.style.color = 'grey';
			elem.className = 'nonoption';
			elem.onclick = null;

		}

	}

	static setTimeValues() {

		if ( document.getElementById( 'real-time' ) ) {

			SettingsControl.enableOptionElement(
				document.getElementById( 'real-time' ),
				! ( ssettings.get( 'time', 'realtime' ) &&
					time.getRate() == 1 && ! time.stopped ) );
			document.getElementById( 'time-rate' ).value = time.getRate();

			var datetime = new Date( time.getTime() );

			document.getElementById( 'datetime-year' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCFullYear(), 4 );
			document.getElementById( 'datetime-month' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCMonth() + 1, 2 );
			document.getElementById( 'datetime-date' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCDate(), 2 );
			document.getElementById( 'datetime-hours' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCHours(), 2 );
			document.getElementById( 'datetime-minutes' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCMinutes(), 2 );
			document.getElementById( 'datetime-seconds' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCSeconds(), 2 );
			document.getElementById( 'datetime-millis' ).innerHTML =
				SettingsControl.intToString( datetime.getUTCMilliseconds(), 3 );

			document.getElementById( 'toggle-clock' ).value =
				time.stopped ? 'Start Clock' : 'Stop Clock';
			document.getElementById( 'clock-state' ).innerHTML =
				time.stopped ? 'Clock is Stopped' : 'Clock is Started';

		}

	}

	static setStarValues() {

		SettingsControl.setNumber( 'stars', 'starradius' );
		SettingsControl.setNumber( 'stars', 'starbrightness' );
		SettingsControl.setNumber( 'stars', 'colorlevel' );

	}

	static setPlanetValues() {

		SettingsControl.setNumber( 'planets', 'planetmag' );
		SettingsControl.setValue( 'planets', 'planetcolor' );
		SettingsControl.setNumber( 'planets', 'sunmoonmag' );
		SettingsControl.setNumber( 'planets', 'sunbrightness' );

	}


	static setPlanetLocations( unixtime, fromPosition, homePlanet ) {

		// Mobile does not have table of planet data.
		if ( isMobile ) return;

		let sunMagElem = document.getElementById( 'sun_mag' );
		if ( sunMagElem === null ) return; // should never happen
		if ( homePlanet === planets.earth ) {

			sunMagElem.innerHTML = 'Sun/Moon Magnification';

		} else if ( homePlanet === planets.moon ) {

			sunMagElem.innerHTML = 'Sun/Earth Magnification';

		} else {

			sunMagElem.innerHTML = 'Sun Magnification';

		}

		for ( let planetName in planets ) {

			if ( planets.hasOwnProperty( planetName ) ) {

				let element = document.getElementById( planetName + '-location' );
				let element2 = document.getElementById( planetName + '-hp' );
				if ( element ) {

					// element and element2 don't exist on mobile page
					let planet = planets[ planetName ];
					if ( planet !== homePlanet ) {

						element.style.display = 'block';
						element.innerHTML
							= planet.getDataString( unixtime, fromPosition );
						element2.style.display = 'block';

					} else {

						element.style.display = 'none';
						element2.style.display = 'none';

						let elementGeo = document.getElementById( 'geolocate' );
						elementGeo.style.display =
							planetName === 'earth' ? 'block' : 'none';

					}

				}

			}

		}

	}


	static initValues( window, isMobileIn ) {

		screenfull = window.screenfull;
		isMobile = isMobileIn;

		// initialize controls from settings
		SettingsControl.setLocationValues();
		SettingsControl.setViewValues();
		SettingsControl.setTimeValues();
		SettingsControl.setStarValues();
		SettingsControl.setPlanetValues();

	}

	static toggleFullScreen() {

		if ( screenfull.enabled ) {

			screenfull.toggle();

		}

	}

	static showFullScreenMenu() {

		var menu = document.querySelector( '#fullscreen' );

		//menu.style.alignSelf = "center";
		menu.style.left = '0';
		menu.style.right = '0';
		menu.style.top = '0';
		menu.style.bottom = '0';
		menu.style.margin = 'auto';
		menu.style.height = '180px';
		menu.style.width = '200px';
		menu.style.display = 'block';

	}

	static dismissFullScreenMenu( event ) {

		event.preventDefault();
		event.stopPropagation();

		var menu = document.querySelector( '#fullscreen' );
		menu.style.display = 'none';

	}

	static requestFullScreen( event ) {

		SettingsControl.dismissFullScreenMenu( event );

		if ( screenfull.enabled ) {

			screenfull.request();

		}

	}

	static restoreLocationDefaults() {

		ssettings.restoreDefaults( 'location' );
		SettingsControl.setLocationValues();

	}

	static restoreViewDefaults() {

		ssettings.restoreDefaults( 'view' );
		SettingsControl.setViewValues();

	}

	static restoreTimeDefaults() {

		ssettings.restoreDefaults( 'time' );

		time.setRate( ssettings.get( 'time', 'rate' ) );

		if ( ssettings.get( 'time', 'realtime' ) ) {

			time.setTime( Date.now() );

		} else {

			time.setTime( 'time', 'timeset' );

		}

		SettingsControl.setTimeValues();

	}

	static restoreStarDefaults() {

		ssettings.restoreDefaults( 'stars' );
		SettingsControl.setStarValues();

	}

	static restorePlanetDefaults() {

		ssettings.restoreDefaults( 'planets' );
		SettingsControl.setPlanetValues();

	}

	static restoreAllDefaults() {

		SettingsControl.restoreLocationDefaults();
		SettingsControl.restoreViewDefaults();
		SettingsControl.restoreTimeDefaults();
		SettingsControl.restoreStarDefaults();
		SettingsControl.restorePlanetDefaults();

	}


	// static initRangeAndNumber( section, id ) {

	// 	let range = document.getElementById( id + '-range' );
	// 	let number = document.getElementById( id + '-number' );

	// 	number.addEventListener(

	// 		'input',
	// 		function () {

	// 			updateNumber( section, id, 'number', 'range' );

	// 		},
	// 		false

	// 	);
	// 	number.addEventListener(

	// 		'change',
	// 		function () {

	// 			updateNumber( section, id, 'number', 'range' );

	// 		},
	// 		false

	// 	);

	// 	range.addEventListener(

	// 		'input',
	// 		function () {

	// 			updateNumber( section, id, 'range', 'number' );

	// 		},
	// 		false

	// 	);
	// 	range.addEventListener(

	// 		'change',
	// 		function () {

	// 			updateNumber( section, id, 'range', 'number' );

	// 		},
	// 		false

	// 	);

	// }

	// function addListenerById( id, eventType, handler ) {

	// 	let elem = document.getElementById( 'id' );
	// 	elem.addEventListener( 'click', handler, false );

	// }

	// function initControls() {

	// 	initRangeAndNumber( 'location', 'latitude' );
	// 	initRangeAndNumber( 'location', 'longitude' );
	// 	initRangeAndNumber( 'view', 'elevation' );
	// 	initRangeAndNumber( 'view', 'rotation' );
	// 	initRangeAndNumber( 'view', 'zoom' );

	// 	addListenerById( 'lines', 'click', function () {

	// 		updateBoolean( 'view', 'lines' );

	// 	} );

	// 	addListenerById( 'restoreView', restoreViewDefaults );
	// 	addListenerById(
	// }


}

export default SettingsControl;
export { time };
