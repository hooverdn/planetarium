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

import CameraControl from './CameraControl.js';
import ZoomControl from './ZoomControl.js';

import {
	ssettings,
} from '../SSettings.js';


class Controls {

	constructor( camera, renderer ) {

		let cameraControl = new CameraControl( camera, renderer );

		cameraControl.startCallback = function () {

			let angles = {};
			angles.elevation = ssettings.get( 'view', 'elevation' );
			angles.rotation = ssettings.get( 'view', 'rotation' );
			return angles;

		};

		cameraControl.changeCallback = function ( elevation, rotation ) {

			if ( elevation > 89 ) {

				elevation = 89;

			} else if ( elevation < - 89 ) {

				elevation = - 89;

			} else {

				elevation = Math.round( elevation * 10 ) / 10;

			}
			rotation = ( Math.round( rotation * 10 ) / 10 );
			if ( rotation > 180 ) {

				rotation -= 360;

			} else if ( rotation < - 180 ) {

				rotation += 360;

			}
			ssettings.set( 'view', 'elevation', elevation );
			ssettings.set( 'view', 'rotation', rotation );

		};

		let zoomControl = new ZoomControl( renderer.domElement );

		zoomControl.zoomCallback = function ( scale ) {

			var zoom = scale * ssettings.get( 'view', 'zoom' );
			zoom = Math.max( Math.min( zoom, 50 ), 0.5 );
			ssettings.set( 'view', 'zoom', zoom );

		};

		this._cameraControl = cameraControl;
		this._zoomControl = zoomControl;

	}

	enable() {

		this._cameraControl.enable();
		this._zoomControl.enable();

	}

	disable() {

		this._cameraControl.disable();
		this._zoomControl.disable();

	}

}


export default Controls;
