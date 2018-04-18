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

import { ssettings } from './SSettings.js';

// make this into a class Compass or Orientation?

let compassHeading = 0;

/**
 *  Flag indicating that we should set alpha adjustment, either
 *  because we just opened the page or because the user pressed the
 *  "Use Compass" button.
 */
let needAlphaAdjustment = true;
let alphaAdjustment = 0;
/** Compass correction as returned by a call to NOAA. */
let compassCorrection = undefined;
let noDOC = false;
let isApple = navigator.userAgent.indexOf( 'Mac OS X' ) >= 0;

function setNoDOC( val ) {

	noDOC = val;

}

function getCompassCorrection() {

	if ( compassCorrection === undefined ) {

		compassCorrection = ssettings.get( 'compass', 'correction' );
		compassCorrection =
			( compassCorrection === undefined || compassCorrection === 500 ) ?
				0 : compassCorrection;

	}

	return compassCorrection;

}


function requestCompassCorrection() {

	//if ( !useCompass ) { return; }

	let httpRequest = new XMLHttpRequest();

	httpRequest.onreadystatechange = handleCompassCorrection;

	httpRequest.open( 'POST', 'https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination', true );
	httpRequest.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
	httpRequest.send( 'browserRequest=true&lat1=37.4&lat1Hemisphere=N&lon1=122&lon1Hemisphere=W&model=WMM&startYear=2017&startMonth=7&startDay=27&resultFormat=xml' );

	function handleCompassCorrection() {

		if ( httpRequest.readyState === XMLHttpRequest.DONE ) {

			if ( httpRequest.status === 200 ) {

				let doc = httpRequest.responseXML;
				let xpathResult =
                    doc.evaluate( '//declination', doc, null, XPathResult.NUMBER_TYPE, null );
				if ( xpathResult && ! xpathResult.invalidIteratorState && xpathResult.resultType === XPathResult.NUMBER_TYPE ) {

					setCompassCorrection( xpathResult.numberValue );

					console.log( 'Compass correction: ' + compassCorrection );
					return;

				}

			}

			// log any error
			console.log( 'Compass correction request failed:' +
                         ' status: ' + httpRequest.status +
                         ', responseText ' + httpRequest.responseText );

			clearCompassCorrection();

		}

	}

}

function setCompassCorrection( angle ) {

	compassCorrection = angle;
	ssettings.set( 'compass', 'correction', compassCorrection );
	setDirectionFromCompass();

}

function clearCompassCorrection() {

	setCompassCorrection( 500 );

}

let lastTrueAlpha = - 1000;
let lastBeta = - 1000;

function setTrueNorth() {

	alphaAdjustment = lastTrueAlpha;
	needAlphaAdjustment = false;

}

function setDirectionFromCompass() {

	needAlphaAdjustment = true;

}

/**
 *  Get compass direction in case DeviceOrientationEvents are relative.
 */
function absoluteOrientationHandler( e ) {

	if ( needAlphaAdjustment ) console.log( 'noDOC ' + noDOC );
	if ( noDOC || ! needAlphaAdjustment ) return;

	e.stopPropagation();
	e.preventDefault();

	compassHeading = 360 - e.alpha + getCompassCorrection();

}

/**
 *  Indicates that we should orient the view once even if we are not
 *  using DOC; for example if the user pressed the orient button or
 *  "one of the buttons to orient using compass or to manually set
 *  north.
 */
let doOrient = false;

function deviceOrientationHandler( e ) {

	if ( noDOC && ! doOrient ) return;

	doOrient = false;

	// we can't really tell if we are going to get device
	// orientation events until we get them

	let rawAlpha = 360 - e.alpha;

	if ( isApple && e.webkitCompassHeading && needAlphaAdjustment ) {

		alphaAdjustment = e.alpha - e.webkitCompassHeading + getCompassCorrection();
		needAlphaAdjustment = false;

	} else if ( needAlphaAdjustment ) {

		if ( e.absolute ) {

			alphaAdjustment = getCompassCorrection();

		} else {

			alphaAdjustment = compassHeading - rawAlpha;

		}
		needAlphaAdjustment = false;

	}

	let trueAlpha = rawAlpha + alphaAdjustment;

	trueAlpha = trueAlpha % 360;
	if ( trueAlpha > 180 ) trueAlpha -= 360;
	if ( trueAlpha < - 180 ) trueAlpha += 360;

	if ( Math.abs( trueAlpha - lastTrueAlpha ) > 1 ||
	     Math.abs( e.beta - lastBeta ) > 1 ) {

		lastTrueAlpha = e.alpha;
		lastBeta = e.beta;

		let alt = e.beta;
		if ( alt < 0 ) alt = 0;
		if ( alt > 89 ) alt = 89;
		ssettings.set( 'view', 'rotation', trueAlpha );
		ssettings.set( 'view', 'elevation', alt );

	}

}

export {
	requestCompassCorrection,
	setTrueNorth,
	setDirectionFromCompass,
	setNoDOC,
	doOrient,
	absoluteOrientationHandler,
	deviceOrientationHandler,
};
