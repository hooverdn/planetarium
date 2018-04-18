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

	BackSide,
	Group,
	CylinderBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	Vector3,

} from 'three';

import { unit, distance } from './Star.js';

let radius = distance * 1.2;


/**
 *  A class to help manage lines of longitude and latitude and the ecliptic.
 */
class Bands {

	/**
	 *  Instead of isMobile it should be something about physical screen size.
	 */
	constructor( parent, isMobile ) {

		this.parent = parent;
		this._bandGroup = new Group();
		this.visible = false;
		this.bandWidth = isMobile ? 1400 * unit : 700 * unit;
		this.bandGeom = new CylinderBufferGeometry( 1, 1, 1400 * unit, 128, 1, true );

		this._createBands();
		this._createEcliptic();

	}

	setVisible( visible ) {

		if ( visible && ! this.visible ) {

			this.parent.add( this._bandGroup );
			this.parent.add( this._eclipticMesh );
			// For debugging
			// this.parent.add( this._earthEcliptic );

		} else if ( ! visible && this.visible ) {

			this.parent.remove( this._bandGroup );
			this.parent.remove( this._eclipticMesh );
			// For debugging
			//this.parent.remove( this._earthEcliptic );

		}
		this.visible = visible;

	}

	static _zoomBand( zoom, band ) {

		band.scale.copy( band.bands_baseScale );
		band.scale.y /= zoom;

	}

	setZoom( zoom ) {

		let bands = this._bandGroup.children;
		let len = bands.length;

		for ( let idx = 0; idx < len; idx ++ ) {

			Bands._zoomBand( zoom, bands[ idx ] );

		}

		Bands._zoomBand( zoom, this._eclipticMesh );

	}

	_createBands() {

		var bandMaterial = new MeshBasicMaterial( {
			color: 0x080808,
			transparent: false,
			side: BackSide,
		} );
		// Equator and 0, and 180 degree meridians are special and get
		// a special color.
		var specialBandMaterial = new MeshBasicMaterial( {
			color: 0x111100,
			transparent: false,
			side: BackSide,
		} );

		// lines of longitude
		// 0 and 180 degrees
		let band = this._createBand( radius,
									 Math.PI / 2, 0,
									 specialBandMaterial );
		band.bands_baseScale = band.scale.clone();
		this._bandGroup.add( band );

		for ( var idx = 15; idx < 180; idx += 15 ) {

			band = this._createBand( radius,
									 Math.PI / 2, idx * Math.PI / 180,
									 bandMaterial );
			band.bands_baseScale = band.scale.clone();
			this._bandGroup.add( band );

		}

		// lines of latitude
		for ( var idx = 1; idx < 18; idx ++ ) {

			var phi = idx * Math.PI / 18;
			band = this._createBand( radius * Math.sin( phi ), 0, 0,
									 idx == 9 ? specialBandMaterial : bandMaterial,
									 new Vector3( 0, radius * Math.cos( phi ), 0 ) );
			band.scale.y /= Math.sin( phi );
			band.bands_baseScale = band.scale.clone();
			this._bandGroup.add( band );

		}

		// For debugging
		// var earthEclipticMaterial = new MeshBasicMaterial( {
		// 	color: 0x001100,
		// 	transparent: false,
		// 	side: BackSide,
		// } );
		// this._earthEcliptic = this._createBand( radius, 0, 0, earthEclipticMaterial );
		// this._earthEcliptic.rotation.x = Utils.radians( j2000obliquity );

	}

	_createBand( radius, phi, theta, material, position ) {

		var mesh = new Mesh( this.bandGeom, material );
		mesh.rotation.set( 0, theta - Math.PI / 2, phi );
		mesh.scale.set( radius, 1, radius );
		if ( position ) {

			mesh.position.copy( position );

		} else {

			mesh.position.set( 0, - 300 * unit, 0 );

		}
		return mesh;

	}

	_createEcliptic() {

		var eclipticMaterial = new MeshBasicMaterial( {
			color: 0x110011,
			transparent: false,
			side: BackSide,
		} );

		this._eclipticMesh = this._createBand( radius, 0, 0, eclipticMaterial );
		this._eclipticMesh.bands_baseScale = this._eclipticMesh.scale.clone();

	}

	orientBands( phi, theta ) {

		this._bandGroup.rotation.set( 0, theta + Math.PI / 2, phi );

	}

	orientEcliptic( phi, theta ) {

		this._eclipticMesh.rotation.set( 0, theta - Math.PI / 2, - phi );

	}

}

Bands.prototype.setPlanet = function () {

	const sph = new THREE.Spherical();

	return function ( planet ) {

		this.orientBands( planet.northPole.phi, planet.northPole.theta );
		planet.computeOrbitalPole( undefined, sph );
		this.orientEcliptic( sph.phi, sph.theta );

	};

}();

export default Bands;
