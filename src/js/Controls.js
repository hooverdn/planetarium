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

import { Spherical, Vector3 } from 'three';
import Utils from './Utils.js';
import { ControlManager } from './controls/ControlManager.js';
import { CameraRotationControl } from './controls/controls/CameraRotationControl.js';
import { ScalarMouseControl } from './controls/controls/ScalarControl.js';
import { MOUSE_BUTTONS } from './controls/utils/PointerUtils.js';

const noflags = ControlManager.noflags;
const tmp = new Vector3();
const stmp = new Spherical();
//const euler = new Euler( 0, 0, 0, 'YXZ' );
//const euler2 = new Euler();

class Controls {

	constructor( camera, renderer, settings ) {

		this._camera = camera;
		this._settings = settings;
		this._controlManager = new ControlManager( camera, renderer.domElement );

		this._cameraRotationControl =
			new CameraRotationControl( camera, null, rotationCallback, null );
		this._controlManager.addMouseControl(
			MOUSE_BUTTONS.LEFT,
			noflags,
			this._cameraRotationControl
		);

		this._cameraZoomControl = new ScalarMouseControl( camera, null, zoomCallback, null );
		this._controlManager.addMouseControl(
			MOUSE_BUTTONS.MIDDLE,
			noflags,
			this._cameraZoomControl
		);
		// XXX: add wheel to CameraZoomControl !!
		//this._controlManager.addWheelControl( noflags, cameraZoomControl );

		this._latLongControl =
			new ScreenMoveControl( camera, null, latLongCallback, null );
		this._controlManager.addMouseControl(
			MOUSE_BUTTONS.LEFT,
			ControlManager.shiftKey,
			this._latLongControl
		);
		this._controlManager.addTouchControl(
			MOUSE_BUTTONS.LEFT,
			ControlManager.shiftKey,
			this._latLongControl
		);

		this._cameraDistanceControl = new CameraZoomControl( camera, altitudeCallback );
		this._controlManager.addMouseControl(
			MOUSE_BUTTONS.MIDDLE,
			ControlManager.shiftKey,
			this._cameraDistanceControl
		);
		// XXX: add wheel to CameraZoomControl !!
		//this._controlManager.addWheelControl( noflags, cameraZoomControl );

		const self = this;

		function rotationCallback( q ) {

			console.log( 'q ' + JSON.stringify( startPos, endPos ) );
			console.log( 'camera.quaternion ' + JSON.stringify( camera.quaternion ) );
			// clone for safety?
			//q.multiply( this._camera.quaternion );
			tmp.set( 1, 0, 0 );
			tmp.applyQuaternion( this._camera.quaternion );
			console.log( 'vector before ' + JSON.stringify( tmp ) );
			stmp.setFromVector3( tmp );
			console.log( 'spherical before ' + stmp.radius + ' ' +
						 Utils.roundTo2( 90 - Utils.degrees( stmp.phi ) ) + ' ' +
						 Utils.roundTo2( Utils.degrees( stmp.theta ) ) );

			tmp.applyQuaternion( q );
			console.log( 'vector after ' + JSON.stringify( tmp ) );
			stmp.setFromVector3( tmp );
			console.log( 'spherical after ' + stmp.radius + ' ' +
						 Utils.roundTo2( 90 - Utils.degrees( stmp.phi ) ) + ' ' +
						 Utils.roundTo2( Utils.degrees( stmp.theta ) ) );
			tmp.setFromSpherical( stmp );
			console.log( 'vector third ' + JSON.stringify( tmp ) );
			let elevation = Utils.degrees( Math.PI / 2 - stmp.phi );
			let rotation = Utils.degrees( stmp.theta );

			// elevation %= 360;
			// if ( elevation < - 180 ) {

			// 	elevation += 360;

			// } else if ( elevation > 180 ) {

			// 	elevation -= 360;

			// }
			//elevation = Math.min( 89, Math.max( - 89, elevation ) );

			console.log( 'elevation ' + elevation + ', rotation ' + rotation );
			settings.set( 'view', 'elevation', elevation );
			settings.set( 'view', 'rotation', rotation );

		}

		function zoomCallback( factor ) {

			console.log( 'zoomCallback ' + Utils.roundTo2( factor ) );
			self._settings.set(
				'view', 'zoom',
				Math.min( 50, Math.max( 0.5, self._camera.zoom * factor ) )
			);

		}

		function latLongCallback( q ) {

			q.conjugate();

			// clone q for safety?
			let cameraGroup = this._camera.parent.parent;
			euler2.setFromQuaternion( q );
			console.log(
				'q as euler2 1 (' +
					Utils.roundTo2( Utils.degrees( euler2.x ) ) + ', ' +
					Utils.roundTo2( Utils.degrees( euler2.y ) ) + ', ' +
					Utils.roundTo2( Utils.degrees( euler2.z ) ) + ')'
			);

			q.multiply( cameraGroup.quaternion );
			euler2.setFromQuaternion( q );

			console.log(
				'q as euler2 2 (' +
					Utils.roundTo2( Utils.degrees( euler2.x ) ) + ', ' +
					Utils.roundTo2( Utils.degrees( euler2.y ) ) + ', ' +
					Utils.roundTo2( Utils.degrees( euler2.z ) ) + ')'
			);

			let latitude = Utils.degrees( euler2.z ) + 90;
			let longitude = Utils.degrees( euler2.x );

			console.log( '1 lat ' + Utils.roundTo2( latitude ) +
						 ', long ' + Utils.roundTo2( longitude ) );
			latitude %= 360;
			if ( latitude < - 180 ) {

				latitude += 360;

			} else if ( latitude > 180 ) {

				latitude -= 360;

			}
			latitude = Math.min( 90, Math.max( - 90, latitude ) );
			console.log( '2 lat ' + Utils.roundTo2( latitude ) +
						 ', long ' + Utils.roundTo2( longitude ) );

			settings.set( 'location', 'latitude', latitude );
			settings.set( 'location', 'longitude', longitude );

		}

		function altitudeCallback( factor ) {

			//let cameraInnerGroup = self._camera.parent.position;
			let altitude = self._settings.get( 'location', 'altitude' );
			altitude *= factor;
			self._settings.set(
				'location', 'altitude',
				Math.min( 10, Math.max( 1, altitude ) )
			);

		}

	}

	enable() {

		this._controlManager.enable();

	}

	disable() {

		this._controlManager.disable();

	}

}

export default Controls;
