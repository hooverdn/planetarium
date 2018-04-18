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
	CircleBufferGeometry,
	Color,
	FrontSide,
	Mesh,
	MeshBasicMaterial,
	Spherical,
} from 'three';

import { ssettings } from './SSettings.js';
import Star, { unit, distance } from './Star.js';
//import { constellations } from './constellations.js';
import Utils from './Utils.js';

// Crudely derived from list of B - V and corresponding colors.
function bvToColor( b_v, level ) {

	var min = 1.0 - level / 10;
	var comin = 1.0 - min;
	var r, g, b;
	if ( b_v < - 0.33 ) {

		r = g = min;
		b = 1.0;

	} else if ( b_v <= .20 ) {

		// blue (-0.33) to white (0.20)
		b = 1.0;
		r = g = 1.0 - comin * ( .20 - b_v ) / .53;

	} else if ( b_v <= .60 ) {

		// white (0.20) to yellow (0.68)
		r = g = 1.0;
		b = 1.0 + comin * ( 0.20 - b_v ) / 0.48;

	} else if ( b_v <= 1.64 ) {

		// yellow (0.68) to red
		b = min;
		g = 1.0 + comin * ( 0.68 - b_v ) / 0.94;
		r = 1.0;

	} else {

		b = min;
		g = min;
		r = 1.0;

	}
	return new Color( r, g, b );

}


const starGeom = new CircleBufferGeometry( unit, 32 );


/**
 *  <code>DecoratedStar</code> gives the three.js representation
 *  of an astronomical star.
 *
 *  <p>I would rather have a <code>Star</code> as a component but
 *  there are a lot of issues in ConstellationDisplay if I try this.
 *  DecoratedPlanet already has this problem.
 */
class DecoratedStar extends Star {

	constructor( starData, zoom, colorLevel, baseBrightness, baseRadius ) {

		super( starData );

		this.group = null;

		var material = new MeshBasicMaterial( {
			color: 0xffffff,
			//emissive: color.multiplyScalar(brightness),
			//emissiveIntensity: 1.0,
			lights: false,
			side: FrontSide,
		} );

		this.mesh = new Mesh( starGeom, material );
		this.mesh.star = this;

		var theta = this.longitude * Math.PI / 180;
		var phi = ( 90 - this.latitude ) * Math.PI / 180;
		this.spherical =
			new Spherical( distance, phi, Math.PI / 2 + theta );
		this.mesh.position.setFromSpherical( this.spherical );

		this.updateBrightnessAndRadius( zoom, colorLevel, baseBrightness, baseRadius );

	}

	updateBrightnessAndRadius( zoom, colorLevel, baseBrightness, baseRadius ) {

		zoom = zoom === undefined ? ssettings.get( 'view', 'zoom' ) : zoom;
		baseBrightness = baseBrightness || ssettings.get( 'stars', 'starbrightness' );
		baseRadius = baseRadius || ssettings.get( 'stars', 'starradius' );
		const color = this.getColor( colorLevel );
		let brightness = this.intensity; // brightness as a star

		let intrinsicBrightness = ( color.r + color.g + color.b ) / 3.0;

		brightness *= baseBrightness * zoom * zoom / intrinsicBrightness;

		// zoom doesn't increase radius until brightness goes over 1.0
		let radius = baseRadius / zoom;

		// if brightness is bigger than limit for emissive intensity,
		// increase radius so intensity * area == pi * brightness.
		if ( brightness > 1.0 ) {

			radius *= Math.sqrt( brightness );
			brightness = 1.0;

		}

		this.mesh.scale.set( radius, radius, radius );
		this.mesh.material.color = color.multiplyScalar( Math.min( brightness, 1.0 ) );
		this.radius = radius * unit;

	}


	addToGroup( group ) {

		if ( this.group === group ) {

			return this;

		}

		if ( this.group ) {

			this.group.remove( this.mesh );

		}

		group.add( this.mesh );
		this.mesh.lookAt( Utils.origin );
		this.group = group;
		return this;

	}

	removeFromGroup() {

		if ( this.group ) {

			this.group.remove( this.mesh );
			this.group = null;

		}

	}

	getColor( colorLevel ) {

		colorLevel = colorLevel === undefined ? ssettings.get( 'stars', 'colorlevel' ) : colorLevel;
		return bvToColor( this.b_v, colorLevel );

	}

	setPosition( pos ) {

		this.mesh.position.copy( pos );
		return this;

	}

	getPosition() {

		return this.mesh.position;

	}

}


export default DecoratedStar;
export { bvToColor };
