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
	Vector3,
} from 'three';

import { colors } from './constellations.js';
import { distance } from './Star.js';
import { planets } from './DecoratedPlanet.js';
import Geometry from './Geometry.js';
import StarLabel from './StarLabel.js';
import LabeledStar from './LabeledStar.js';
import Viewer from './Viewer.js';
import * as numeric from 'numericjs';

let baseStarScaleFactor = distance / 1000;

let v3tmp = new Vector3();
let v3tmp2 = new Vector3();

/**
 *  A shadow star is a pretend star located at the point in the sphere
 *  of fixed stars on the line from the camera through an associated
 *  planet.  The shadow star of a planet carries its label, whose
 *  location is determined like that of a regular labeled star, except
 *  that the vector has to be recalculated every time the planet moves
 *  significantly.
 *
 *  The shadow star itself has no mesh and never appears or is added
 *  to a group.
 *
 *  Its nominal position is a point in the sphere of fixed stars on
 *  the ray from the camera through its planet, so it needs to be
 *  refreshed every time before we compute the label position in case
 *  the camera or planet has changed position.
 *
 *  <p>Perhaps we can refine things so we only have to recompute label
 *  positions when there has been a significant change.
 */
class ShadowStar {

	/**
	 *  @param {DecoratedPlanet} planet
	 *  @camera camera
	 */
	constructor( planet, camera ) {

		this.planet = planet;
		this.camera = camera;

		this.shortNameLabel = new StarLabel( colors.length - 2, planet.name );

		this.position = new Vector3();
		this.normal = new Vector3();

		// project a position at distance distance from camera
		this.updatePositionEtc();

		this.main = true;

	}

	updatePositionEtc() {

		// project a position at distance distance from camera
		this.planet.mesh.getWorldPosition( v3tmp );
		this.camera.getWorldPosition( v3tmp2 );
		this.position.subVectors( v3tmp, v3tmp2 );
		let ratio = distance / this.position.length();
		this.position.multiplyScalar( ratio );
		this.position.add( v3tmp2 );
		this.radius = this.planet.radius * ratio;
		this.normal.copy( this.position );
		this.normal.normalize();

	}

	getPosition() {

		return this.position;

	}

	static init( camera ) {

		LabeledStar.shadows = [];
		let shadows = LabeledStar.shadows;
		shadows.push( new ShadowStar( planets.jupiter, camera ) );
		shadows.push( new ShadowStar( planets.saturn, camera ) );
		shadows.push( new ShadowStar( planets.earth, camera ) );
		shadows.push( new ShadowStar( planets.venus, camera ) );
		shadows.push( new ShadowStar( planets.mars, camera ) );
		shadows.push( new ShadowStar( planets.mercury, camera ) );
		shadows.push( new ShadowStar( planets.uranus, camera ) );
		shadows.push( new ShadowStar( planets.neptune, camera ) );

	}

	computeLabelVectors( shortName, onscreen ) {

		if ( ! shortName ) return;

		let label = this.shortNameLabel;

		let radius = this.radius + label.labelMesh.radius;

		let xVtr = new Vector3();
		let yVtr = new Vector3();
		Geometry.getOrthonormal( this.normal, xVtr, yVtr );

		let f = Geometry.sumInvDistanceFn(
			this.getPosition(), xVtr, yVtr, radius, onscreen,
			function ( thing ) {

				return thing.getPosition();

			}
		);

		let val = f( [ 0 ] );
		let start = 0;
		let cand = 0;
		for ( let idx = 1; idx < 16; idx ++ ) {

			cand += Math.PI / 2;
			let val2 = f( [ cand ] );
			if ( val2 < val ) {

				start = cand;

			}

		}

		let result = numeric.uncmin( f, [ start ] );

		let theta = result.solution[ 0 ] % ( 2 * Math.PI );

		label.vtr = xVtr.clone();
		label.vtr.multiplyScalar( Math.cos( theta ) );
		let tmp = new Vector3();
		tmp.copy( yVtr );
		tmp.multiplyScalar( Math.sin( theta ) );
		label.vtr.add( tmp );

		label.orthogVtr = label.vtr.clone();
		label.orthogVtr.cross( this.normal );

		label.normal = this.normal.clone();

	}


	setLabelPosition( zoom, onscreen, lookAtPos, up, shortName ) {

		if ( ! shortName ) return;
		//if ( this.planet === Viewer.getViewer().homePlanet ) return;

		this.computeLabelVectors( shortName, onscreen );
		let unitVtr = new Vector3();
		let labelObj = shortName ? this.shortNameLabel : this.letterLabel;
		unitVtr.copy( labelObj.vtr );

		var starScaleFactor = baseStarScaleFactor / Math.max( 1, zoom - 0.2 );
		labelObj.setScaleFactor( starScaleFactor );

		let pos = labelObj.getPosition();
		pos.addVectors(
			this.getPosition(),
			unitVtr.multiplyScalar( this.radius + labelObj.getPositionOffset() )
		);

		labelObj.lookAt( lookAtPos, up );

	}

	setStarLabelVisible( main, visible ) {

		let starLabel = main ? this.shortNameLabel : this.letterLabel;
		if ( starLabel ) {

			let labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
			starLabel.setVisible( visible, labelGroup );

		}

	}

	setLabelVisibility( main ) {

		if ( ! main ) return;

		let visible = ! ( this.planet === Viewer.getViewer().homePlanet );

		this.setStarLabelVisible( main, visible );

	}

	orientLabel( lookAtPos, up, shortName ) {

		if ( this.planet !== Viewer.getViewer().homePlanet ) {

			this.orientLabelInner( lookAtPos, up, shortName );

		}

	}

}

ShadowStar.prototype.orientLabelInner = LabeledStar.prototype.orientLabel;
ShadowStar.prototype.getLabelReach = LabeledStar.prototype.getLabelReach;
ShadowStar.prototype.findNearbyStars = LabeledStar.prototype.findNearbyStars;

export default ShadowStar;
