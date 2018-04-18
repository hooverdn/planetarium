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


import {
	Group,
	PerspectiveCamera,
} from 'three';

import { ssettings } from './SSettings.js';
import { planets } from './DecoratedPlanet.js';
import Utils from './Utils.js';

let viewer;
//let camera;

/**
 *  A class representing the person viewing the stars.  It has a
 *  camera, location (planet, latitude, longitude, altitude) and
 *  direction of view ( elevation (altitude) and rotation (azimuth)).
 */
class Viewer {

	constructor( fov, aspect, near, far ) {

		this.camera = new PerspectiveCamera( fov, aspect, near, far );
		// CameraControl needs this helper
		var cameraHelper = new THREE.Object3D();
		cameraHelper.visible = false;
		this.camera.helper = cameraHelper;

		// We get snapback problems dragging the view if we don't put the
		// camera up a bit (!?)
		this.camera.position.set( 0, .5 * this.camera.near, 0 );

		this.cameraGroup = new Group();
		this.cameraGroup.name = 'cameraGroup';
		this.cameraInnerGroup = new Group();
		this.cameraGroup.add( this.cameraInnerGroup );
		this.cameraInnerGroup.add( this.camera );
		this.cameraInnerGroup.add( this.camera.helper );

	}

	static createViewer( fov, aspect, near, far ) {

		if ( ! viewer ) {

			viewer = new Viewer( fov, aspect, near, far );

		}
		//camera = viewer.camera;
		return viewer;

	}

	static getViewer() {

		return viewer;

	}

	getZoom() {

		return this.camera.zoom;

	}

	setZoom( zoom ) {

		this.camera.zoom = zoom;
		return zoom;

	}

	setHomePlanet( planetName ) {

		let planet = planets[ planetName ];
		planet = planet || planets.earth;
		let oldHomePlanet = this.homePlanet;
		this.homePlanet = planet;

		planet.updateRadius();
		planet.updateColor();

		switch ( planet.name ) {

		case 'Earth':
			planets.moon.updateRadius();
			break;

		case 'Moon':
			planets.earth.updateRadius();
			break;

		default:
			break;

		}

		planet.group.add( this.cameraGroup );
		this.setAltitude( ssettings.get( 'location', 'altitude' ) );
		planet.group.updateMatrixWorld();
		if ( oldHomePlanet ) {

			oldHomePlanet.updateRadius();
			oldHomePlanet.updateColor();
			switch ( oldHomePlanet.name ) {

			case 'Earth':
				planets.moon.updateRadius();
				break;

			case 'Moon':
				planets.earth.updateRadius();
				break;

			default:
				break;

			}

		}
		this.setCameraPosition();
		this.camera.updateProjectionMatrix();

	}

	setLatLong( latitude, longitude ) {

		Utils.setLatLong( this.cameraGroup, latitude, longitude );

	}

	rotate( elevation, rotation ) {

		Utils.rotate( this.camera, elevation, rotation );

	}

	rotateDegrees( elevation, rotation ) {

		this.rotate( Utils.radians( elevation ), Utils.radians( rotation ) );

	}

	updateProjectionMatrix() {

		this.camera.updateProjectionMatrix();

	}

	/**
     *  Set position of group so camera is still on earth, and
     *  update camera position to take account of rotation of
     *  earth.
     */
	setCameraPosition() {

		this.setLatLong(
			ssettings.get( 'location', 'latitude' ),
			ssettings.get( 'location', 'longitude' )
		);
		this.setAltitude( ssettings.get( 'location', 'altitude' ) );

	}

	setAltitude( alt ) {

		if ( this.homePlanet ) {

			this.cameraInnerGroup.position.set(
				0,
				alt * this.homePlanet.eqRadius * 1.001,
				0
			);

		}

	}

	displayDirectionText( font ) {

		var material = new THREE.MeshBasicMaterial( {
			color: 0x444444,
			transparent: true,
			opacity: 0.5,
		} );

		let sqrt2 = Math.sqrt( 2 );

		// Zenith marker
		// var tgPlus = new THREE.TextGeometry( '+', {
		//     font: font,
		//     size: 0.15,
		//     height: 0.1,
		// });
		// var tmPlus = new THREE.Mesh(tgPlus, material);
		// var bBox = new THREE.Box3().setFromObject( tmPlus );
		// console.log( 'zenith bbox ' + JSON.stringify( bBox ) );
		// tmPlus.position.x = - 0.5 * ( bBox.max.x - bBox.min.x );
		// tmPlus.position.y = 5;
		// tmPlus.position.z = - 0.5 * ( bBox.max.z - bBox.min.z );
		// tmPlus.lookAt(camera.position);
		// cameraInnerGroup.add(tmPlus);

		var tgE = new THREE.TextGeometry( 'E', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmE = new THREE.Mesh( tgE, material );
		tmE.position.x = - 0.035;
		tmE.position.y = 0;
		tmE.position.z = - 5;
		tmE.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmE );

		var tgNE = new THREE.TextGeometry( 'NE', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmNE = new THREE.Mesh( tgNE, material );
		tmNE.position.x = - 5 / sqrt2;
		tmNE.position.y = 0;
		tmNE.position.z = - 5 / sqrt2;
		tmNE.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmNE );

		var tgN = new THREE.TextGeometry( 'N', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmN = new THREE.Mesh( tgN, material );
		tmN.position.x = - 5;
		tmN.position.y = 0;
		tmN.position.z = 0.04;
		tmN.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmN );

		var tgNW = new THREE.TextGeometry( 'NW', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmNW = new THREE.Mesh( tgNW, material );
		tmNW.position.x = - 5 / sqrt2;
		tmNW.position.y = 0;
		tmNW.position.z = 5 / sqrt2;
		tmNW.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmNW );

		var tgW = new THREE.TextGeometry( 'W', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmW = new THREE.Mesh( tgW, material );
		tmW.position.x = 0.055;
		tmW.position.y = 0;
		tmW.position.z = 5;
		tmW.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmW );

		var tgSW = new THREE.TextGeometry( 'SW', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmSW = new THREE.Mesh( tgSW, material );
		tmSW.position.x = 5 / sqrt2;
		tmSW.position.y = 0;
		tmSW.position.z = 5 / sqrt2;
		tmSW.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmSW );

		var tgS = new THREE.TextGeometry( 'S', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmS = new THREE.Mesh( tgS, material );
		tmS.position.x = 5;
		tmS.position.y = 0;
		tmS.position.z = - 0.03;
		tmS.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmS );

		var tgSE = new THREE.TextGeometry( 'SE', {
			font: font,
			size: 0.1,
			height: 0.1
		} );
		var tmSE = new THREE.Mesh( tgSE, material );
		tmSE.position.x = 5 / sqrt2;
		tmSE.position.y = 0;
		tmSE.position.z = - 5 / sqrt2;
		tmSE.lookAt( this.camera.position );
		this.cameraInnerGroup.add( tmSE );

		var nameGeom = new THREE.TextGeometry(
			'\u0394\u039F\u0393\u039F\u03A5\u039B\u0397\u03A3', {
				font: font,
				size: 0.065,
				height: 0.03
			} );
		var nameMesh = new THREE.Mesh( nameGeom, material );
		nameMesh.position.x = - 0.22;
		nameMesh.position.y = - 0.15;
		nameMesh.position.z = - 5;
		nameMesh.lookAt( this.camera.position );
		this.cameraInnerGroup.add( nameMesh );

	}

	onWindowResize() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

	}

}

export default Viewer;
export { viewer };
