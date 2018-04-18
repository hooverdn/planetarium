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

/**
 *  Based on TrackballControls in three.js, but the aim is find how to
 *  rotate the camera horizontally or vertically about its own
 *  position so that the point at the start of a mouse drag will move
 *  to the point where the drag ends.
 *
 *  @author Doguleez / http://www.doguleez.com
 */

import { MOUSE, Vector2, Vector3 } from 'three';
import Utils from '../Utils.js';

var CameraControl = function ( camera, renderer ) {

	this.camera = camera;
	this.renderer = renderer;
	this.enabled = true;
	this.startX = 0;
	this.startY = 0;
	this.startElevation = 0;
	this.startRotation = 0;
	this.enabled = true;
	this.callback = null;
	document.addEventListener( 'mousedown', mousedown, { passive: false } );
	document.addEventListener( 'touchstart', touchstart, { passive: false } );

	let _this = this;
	this.dispose = function () {

		document.removeEventListener( 'mousedown', mousedown, { passive: false } );
		document.removeEventListener( 'mousemove', mousemove, { passive: false } );
		document.removeEventListener( 'mouseup', mouseup, { passive: false } );
		document.removeEventListener( 'touchstart', touchstart, { passive: false } );
		document.removeEventListener( 'touchmove', touchmove, { passive: false } );
		document.removeEventListener( 'touchend', touchend, { passive: false } );

	};

	function mousedown( event ) {

		if ( _this.enabled === false ) return;
		if ( event.button != MOUSE.LEFT ) return;

		event.preventDefault();
		event.stopPropagation();

		_this.startX = event.clientX;
		_this.startY = event.clientY;

		var angles = _this.startCallback();
		_this.startElevation = angles.elevation;
		_this.startRotation = angles.rotation;

		document.addEventListener( 'mousemove', mousemove, { passive: false } );
	    document.addEventListener( 'mouseup', mouseup, { passive: false } );

	}

	function touchstart( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

		case 1:
			_this.startX = event.touches[ 0 ].clientX;
			_this.startY = event.touches[ 0 ].clientY;

			var angles = _this.startCallback();
			_this.startElevation = angles.elevation;
			_this.startRotation = angles.rotation;

			document.addEventListener( 'touchmove', touchmove, { passive: false } );
	        document.addEventListener( 'touchend', touchend, { passive: false } );

			break;

		default:
			break;

		}

	}

	function reportChange( x, y ) {

		if ( _this.changeCallback ) {

			var angles = _this.getAngleChange( x, y );

			_this.startElevation += angles.elevation;
			_this.startElevation = Math.max( Math.min( _this.startElevation, 89 ), - 89 );
			_this.startRotation += angles.rotation;
			_this.startRotation %= 360;
			_this.changeCallback( _this.startElevation, _this.startRotation );

		}

	}

	function mouseup( event ) {

		if ( _this.enabled === false ) return;
		if ( event.button != MOUSE.LEFT ) return;

		event.preventDefault();

		// IE needs the parameter for remove to work.
		document.removeEventListener( 'mousemove', mousemove, { passive: false } );
		document.removeEventListener( 'mouseup', mouseup, { passive: false } );

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;

		document.removeEventListener( 'touchmove', touchmove, { passive: false } );
		document.removeEventListener( 'touchend', touchend, { passive: false } );

	}

	function mousemove( event ) {

		if ( _this.enabled === false ) return;
		if ( event.button != MOUSE.LEFT ) return;

		event.preventDefault();
		event.stopPropagation();

		reportChange( event.clientX, event.clientY );

	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

		case 1:
			event.preventDefault();
			//event.stopPropagation();

			reportChange( event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
			break;

		default:
			break;

		}

	}

	this.disable = function () {

		this.enabled = false;
		document.removeEventListener( 'mousemove', mousemove, { passive: false } );
		document.removeEventListener( 'mouseup', mouseup, { passive: false } );
		document.removeEventListener( 'touchmove', touchmove, { passive: false } );
		document.removeEventListener( 'touchend', touchend, { passive: false } );

	};

	this.enable = function () {

		this.enabled = true;

	};

};

let vtmp = new Vector3();
let v2tmp = new Vector2();

CameraControl.prototype.getAngleChange = function ( currX, currY ) {

	// we have camera helper *object* because we need to find its
	// screen position
	this.camera.helper.position.copy( this.camera.position );

	// point far up directly over the camera, approximates the zenith
	this.camera.helper.position.multiplyScalar( 10000 );
	Utils.toScreenPosition( this.camera.helper, this.camera, this.renderer, vtmp, v2tmp );
	let factor = this.camera.rotation.x > 0 ? 1 : - 1;

	let height = this.renderer.domElement.height * this.camera.zoom;

	let deltaAngle = {
		elevation: ( currY - this.startY ) * this.camera.fov / height,
		rotation: - ( currX - this.startX ) * this.camera.fov / height,
	};
	if ( v2tmp !== null &&
		 v2tmp.y > ( currY + this.startY ) / 2 ) {

		factor *= - 1;

	}

	deltaAngle.rotation *= factor;
	this.startX = currX;
	this.startY = currY;

	return deltaAngle;

};

export default CameraControl;
