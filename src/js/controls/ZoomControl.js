// This is OrbitControl cut down to cover just zoom.

/*
The MIT License

Copyright © 2010-2018 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish

import { MOUSE, Vector2, EventDispatcher } from 'three';

let ZoomControl = function ( domElement ) {


	this.domElement = domElement || document;

	// Set to false to disable this control
	this.enabled = true;

	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Mouse button
	this.mouseButton = MOUSE.MIDDLE;

	this.active = false;

	//
	// public methods
	//

	this.dispose = function () {

		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	};

	//
	// internals
	//

	var scope = this;

	var zoomChanged = false;

	var zoomStart = new Vector2();
	var zoomEnd = new Vector2();
	var zoomDelta = new Vector2();

	function getZoomScale( rate ) {

		rate = rate || scope.zoomSpeed;
		return Math.pow( 0.95, rate );

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownZoom( event ) {

		zoomStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveZoom( event ) {

		zoomEnd.set( event.clientX, event.clientY );

		zoomDelta.subVectors( zoomEnd, zoomStart );

		if ( scope.zoomCallback && zoomDelta.y !== 0 ) {

			var scale = getZoomScale();
			scope.zoomCallback( zoomDelta.y < 0 ? 1 / scale : scale );

		}

		zoomStart.copy( zoomEnd );

	}

	function handleMouseUp( event ) {}

	function handleMouseWheel( event ) {

		if ( scope.zoomCallback && event.deltaY !== 0 ) {

			var scale = getZoomScale();
			scope.zoomCallback( event.deltaY > 0 ? 1 / scale : scale );

		}

	}


	function handleTouchStartZoom( event ) {

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		zoomStart.set( 0, distance );

	}

	function handleTouchMoveZoom( event ) {

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		zoomEnd.set( 0, distance );

		zoomDelta.subVectors( zoomEnd, zoomStart );

		if ( scope.zoomCallback && zoomDelta.y !== 0 ) {

			var scale = getZoomScale( 1.5 );
			scope.zoomCallback( zoomDelta.y > 0 ? 1 / scale : scale );

		}

		zoomStart.copy( zoomEnd );

	}

	function handleTouchEnd( event ) {
	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.enableZoom === false ) return;
		if ( event.button !== scope.mouseButton ) return;

		event.preventDefault();

		handleMouseDownZoom( event );
		scope.active = true;

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.enableZoom === false ) return;
		//if ( event.button !== scope.mouseButton ) return;
		if ( scope.active === false ) return;

		event.preventDefault();

		handleMouseMoveZoom( event );

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.active = false;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false ||
             scope.enableZoom === false ||
             scope.active ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

		case 2:

			if ( scope.enableZoom === false ) return;

			handleTouchStartZoom( event );

		    	scope.active = true;

			break;

		default:

			scope.active = false;

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.active === false ) return;
		if ( scope.enableZoom === false ) return;

		switch ( event.touches.length ) {

		case 2:
			    event.preventDefault();
			    event.stopPropagation();
			handleTouchMoveZoom( event );
			break;

		default:
				//scope.active = false;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.active = false;

	}

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

};

ZoomControl.prototype = Object.create( EventDispatcher.prototype );
ZoomControl.prototype.constructor = ZoomControl;

ZoomControl.prototype.enable = function () {

	this.enabled = true;

};
ZoomControl.prototype.disable = function () {

	this.enabled = false;

};


export default ZoomControl;
