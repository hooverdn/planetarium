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
	Vector3,
} from 'three';
import { ssettings, } from './SSettings.js';
import { allStars, mainStars } from './constellations.js';
import DecoratedStar from './DecoratedStar.js';
import { distance } from './Star.js';
import StarLabel from './StarLabel.js';
import Geometry from './Geometry.js';
import * as numeric from 'numericjs';

let baseStarScaleFactor = distance / 1000;
let v3tmp = new Vector3();

class LabeledStar extends DecoratedStar {

	constructor( starData, zoom, colorLevel, baseBrightness, baseRadius ) {

		super( starData, zoom, colorLevel, baseBrightness, baseRadius );

		let letter = this.getLetter();
		let colorCode = this.getNameColorCode();

		// normal vector to represent tangent plane at this star
		this.normal = new Vector3();
		this.normal.copy( this.mesh.position );
		this.normal.normalize();

		if ( letter ) {

			this.letterLabel = new StarLabel( colorCode, letter, starData.letterLabel );

		}
		if ( this.isMain() ) {

			let shortName = this.getShortName() || letter;
			this.shortNameLabel = new StarLabel( colorCode, shortName, starData.shortNameLabel );

		}

	}

	setLabelPosition( zoom, lookAtPos, up, shortName ) {

		let unitVtr = v3tmp;
		let labelObj = shortName ? this.shortNameLabel : this.letterLabel;
		unitVtr.copy( labelObj.vtr );

		var starScaleFactor = baseStarScaleFactor / Math.max( 1, zoom - 0.2 );
		labelObj.setScaleFactor( starScaleFactor );

		let pos = labelObj.getPosition();
		pos.addVectors(
			this.mesh.position,
			unitVtr.multiplyScalar( this.radius + labelObj.getPositionOffset() )
		);

		labelObj.lookAt( lookAtPos, up );

	}

	orientLabel( lookAtPos, up, shortName ) {

		let labelObj = shortName ? this.shortNameLabel : this.letterLabel;

		labelObj.lookAt( lookAtPos, up );

	}

	intersectsStarOrLabel( otherStar, starLabel, main ) {

		if ( otherStar.index !== this.index ) {

			if ( starLabel.intersectsStar( otherStar ) ) {

				return true;

			}

			let otherLabel = main ? otherStar.shortNameLabel : otherStar.letterLabel;
			if ( otherStar.index < this.index && starLabel.intersects( otherLabel ) ) {

				return true;

			}

		}

		return false;

	}

	/**
	 *  A label is visible if:
	 *  <ul>
	 *    <li>It does not intersect any constellation label.</li>
	 *    <li>It does not intersect (or perhaps come too close to)
	 *         any star of the given class.</li>
	 *    <li>It does not intersect any label of a star in the
	 *        class that has a lower serial number.</li>
	 */
	setLabelVisibility( main, zoom ) {

		if ( main && ! this.shortNameLabel ) return false;

		let visible = true;
		let starList = main ? mainStars : allStars;
		let starLabel = main ? this.shortNameLabel : this.letterLabel;

		if ( starLabel.minZoom !== undefined ) {

			visible = starLabel.minZoom <= zoom;

			let labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
			starLabel.setVisible( visible, labelGroup );

			return visible;

		}
		if ( main ) {

			// check planets first
			for ( let idx = 0; idx < LabeledStar.shadows.length && visible; idx ++ ) {

				visible = visible && ! this.intersectsStarOrLabel( LabeledStar.shadows[ idx ], starLabel, main );

			}

		}

		for ( let idx = 0; idx < starList.length && visible; idx ++ ) {

			let star = starList[ idx ];
			//if ( frustum.containsPoint( star.mesh.position ) ) {

			visible = visible && ! this.intersectsStarOrLabel( star, starLabel, main );

			//}

		}

		let labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
		starLabel.setVisible( visible, labelGroup );

		return visible;

	}

	isMain() {

		if ( this.main === undefined ) {

			this.main =
				this.constell !== '' &&
				( this.magnitude <= 3.9 || !! this.getWellKnownName() );

		}

		return this.main;

	}


	getLabelReach( label ) {

		return this.radius + 2 * label.labelMesh.radius;

	}


	findNearbyStars( label, candidates, nearbyStars ) {

		nearbyStars = nearbyStars || [];
		let labelReach = this.getLabelReach( label );
		let len = candidates.length;
		for ( let idx = 0; idx < len; idx ++ ) {

			let star1 = candidates[ idx ];
			if ( this !== star1 ) {

				let dist = this.mesh.position.distanceToSquared( star1.mesh.position );
				let maxDist =
					Math.pow( labelReach + star1.getLabelReach( label ), 2 );

				if ( maxDist > dist ) {

					nearbyStars.push( star1 );

				}

			}

		}

		return nearbyStars;

	}


	computeLabelVectors( shortName ) {

		let label;
		label = shortName ? this.shortNameLabel : this.letterLabel;
		// Should never happen, but if we don't have such a label, just return.
		if ( ! label ) return;

		label.normal = this.normal.clone();
		if ( label.vtr ) {

			//console.log( 'Already have label.vtr = ' + JSON.stringify( label.vtr ) );
			// we already have the necessary vectors
			return;

		}

		// start by getting an orthonormal basis for the tangent plane
		// at this star's position.
		let xVtr = new Vector3();
		let yVtr = new Vector3();
		Geometry.getOrthonormal( this.normal, xVtr, yVtr );

		let nearbyStars = [];

		this.findNearbyStars( label, shortName ? mainStars : allStars, nearbyStars );

		if ( nearbyStars.length === 0 ) {

			// no nearby stars, so any label vectors will do;
			// just use our original orthonormal basis
			label.vtr = xVtr;
			label.orthogVtr = yVtr;
			return;

		}

		// The "over 4" is to take account of relative shrinkage of
		// the label during zoom - and it just seems to work better.
		let radius = this.radius + label.labelMesh.radius / 4;

		// function to minimize to find a good direction from star to label
		let f = Geometry.sumInvDistanceFn(
			this.getPosition(), xVtr, yVtr, radius, nearbyStars,
			function ( star ) {

				return star.getPosition();

			}
		);

		// look for a good place to start the optimization
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

		label.vtr = xVtr;
		label.vtr.multiplyScalar( Math.cos( theta ) );
		let tmp = new Vector3();
		tmp.copy( yVtr );
		tmp.multiplyScalar( Math.sin( theta ) );
		label.vtr.add( tmp );

		label.orthogVtr = label.vtr.clone();
		label.orthogVtr.cross( this.normal );

	}


	// computeInitialLabelVector( shortName, labelVtr, orthogVtr, nearbyStars ) {

	// 	// let constell = constellations[ this.constell ];
	// 	// let neighbors = constell.neighbors;

	// 	labelVtr.set( 0, 0, 0 );

	// 	this.sumGradients( shortName, labelVtr, nearbyStars );

	// 	// there were no stars close enough, improvise a vector that
	// 	// is not collinear with normal
	// 	if ( nearbyStars.length === 0 ) {

	// 		if ( this.normal.x === 0 ) {

	// 			labelVtr.x = 1.0;

	// 		} else {

	// 			labelVtr.x = this.normal.y;
	// 			labelVtr.y = - this.normal.x;

	// 		}

	// 	}

	// 	// project labelVtr onto tangent plane
	// 	labelVtr.projectOnPlane( this.normal );
	// 	labelVtr.normalize();

	// 	orthogVtr.copy( labelVtr );
	// 	orthogVtr.cross( this.normal );

	// 	return nearbyStars;

	// }

	setStarLabelVisible( main, visible ) {

		let starLabel = main ? this.shortNameLabel : this.letterLabel;

		if ( starLabel ) {

			let labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
			starLabel.setVisible( visible, labelGroup );

		}

	}

	static initStars( group, zoom, colorLevel, baseBrightness, baseRadius ) {

		zoom = zoom || ssettings.get( 'view', 'zoom' );
		baseBrightness = baseBrightness || ssettings.get( 'stars', 'starbrightness' );
		// what is this 1000 in terms of distance?
		baseRadius = baseRadius || 1000 * ssettings.get( 'stars', 'starradius' );
		colorLevel = colorLevel || ssettings.get( 'stars', 'colorlevel' );

		StarLabel.baseStarScaleFactor = baseStarScaleFactor;

		LabeledStar.infoTextGroup = new Group();
		LabeledStar.infoTextGroup.name = 'infoTextGroup';
		group.add( LabeledStar.infoTextGroup );

		LabeledStar.letterGroup = new Group();
		LabeledStar.letterGroup.name = 'letterGroup';
		LabeledStar.infoTextGroup.add( LabeledStar.letterGroup );
		LabeledStar.shortNameGroup = new Group();
		LabeledStar.shortNameGroup.name = 'letterGroup';
		LabeledStar.infoTextGroup.add( LabeledStar.shortNameGroup );

		for ( let idx = 0; idx < allStars.length; idx ++ ) {

			let star = new LabeledStar(
				allStars[ idx ],
				zoom,
				colorLevel,
				baseBrightness,
				baseRadius
			);
			star.stardata = allStars[ idx ];
			star.index = idx;
			allStars[ idx ] = star;

			if ( star.radius >= .01 ) {

				star.addToGroup( group );

			}

		}

		for ( let idx = 0; idx < mainStars.length; idx ++ ) {

			mainStars[ idx ] = allStars[ mainStars[ idx ] ];

		}

		for ( let idx = 0; idx < allStars.length; idx ++ ) {

			let star = allStars[ idx ];

			// main first because it comes first when cycling through labels
			if ( star.main ) star.computeLabelVectors( true );
			star.computeLabelVectors( false );

		}

	}

	// Could perhaps be in DecoratedStar, but is a mate with initStars,
	// which is better herere.
	static updateStars( group, zoom, colorLevel, baseBrightness, baseRadius ) {

		zoom = zoom || ssettings.get( 'view', 'zoom' );
		baseBrightness = baseBrightness || ssettings.get( 'stars', 'starbrightness' );
		// what is this 1000 in terms of distance?
		baseRadius = baseRadius || 1000 * ssettings.get( 'stars', 'starradius' );
		colorLevel = colorLevel || ssettings.get( 'stars', 'colorlevel' );

		for ( let idx = 0; idx < allStars.length; idx ++ ) {

			allStars[ idx ].updateBrightnessAndRadius(
				zoom,
				colorLevel,
				baseBrightness,
				baseRadius
			);

			// should it be brightness instead of radius?
			if ( allStars[ idx ].radius < .01 ) {

				allStars[ idx ].removeFromGroup();

			} else {

				allStars[ idx ].addToGroup( group );

			}

		}

	}


	// static findOnscreenStars( frustum, candidates, onscreenStars ) {

	// 	onscreenStars = onscreenStars || [];

	// 	// It might make sense to have this one loop for short
	// 	// candidate lists, like mainStars and to loop through
	// 	// constellations whose box intersects the frustum when the
	// 	// candidate list is longer, as for allStars.

	// 	let len = candidates.length;
	// 	for ( let idx = 0; idx < len; idx ++ ) {

	// 		let star = candidates[ idx ];
	// 		if ( frustum.containsPoint( star.getPosition() ) ) {

	// 			onscreenStars.push( star );

	// 		}

	// 	}

	// }

	static setLabelPositionAndVisibility( camera, up, main ) {

		let starList = main ? mainStars : allStars;

		//let frustum = LabeledStar.getCameraFrustum( camera );
		camera.getWorldPosition( v3tmp );

		if ( main ) {

			for ( let idx = 0; idx < LabeledStar.shadows.length; idx ++ ) {

				LabeledStar.shadows[ idx ].updatePositionEtc();

			}

			let onscreen = LabeledStar.shadows.concat( mainStars );
			//LabeledStar.findOnscreenStars( frustum, LabeledStar.shadows, onscreen );
			//LabeledStar.findOnscreenStars( frustum, mainStars, onscreen );

			// do planets first
			for ( let idx = 0; idx < LabeledStar.shadows.length; idx ++ ) {

				let shadow = LabeledStar.shadows[ idx ];
				//if ( frustum.containsPoint( shadow.planet.mesh.getWorldPosition( v3tmp2 ) ) ) {

				shadow.setLabelPosition( camera.zoom, onscreen, v3tmp, up, main );
				shadow.setLabelVisibility( main );

				// } else {

				// 	shadow.setStarLabelVisible( main, false );

				//}

			}

		}

		// list constellations that might be visible
		// let constellationVisibility = {};
		// for ( let constell in constellations ) {

		// 	if ( constellations.hasOwnProperty( constell ) ) {

		// 		constellationVisibility[ constell ] =
		// 			frustum.intersectsBox( constellations[ constell ].box );

		// 	}

		// }

		for ( let idx = 0; idx < starList.length; idx ++ ) {

			let star = starList[ idx ];

			if ( ! main || star.main /* && frustum.containsPoint( star.mesh.position ) */ ) {

				star.setLabelPosition( camera.zoom, v3tmp, up, main );
				star.setLabelVisibility( main, camera.zoom );

			} else {

				star.setStarLabelVisible( main, false );

			}

		}

	}


	// Assuming: zoom has not changed, camera world pos may have
	// changed, up may have changed.
	static orientLabels( camera, up, main ) {

		//let frustum = LabeledStar.getCameraFrustum( camera );
		camera.getWorldPosition( v3tmp );

		let starList = LabeledStar.shadows;

		if ( main ) {

			for ( let idx = 0; idx < starList.length; idx ++ ) {

				let shadow = starList[ idx ];
				if ( ( ! main || shadow.main ) /* &&
					 frustum.containsPoint( shadow.planet.mesh.getWorldPosition( v3tmp2 ) ) */ ) {

					shadow.orientLabel( v3tmp, up, main );

				}

			}

		}

		starList = main ? mainStars : allStars;

		for ( let idx = 0; idx < starList.length; idx ++ ) {

			let star = starList[ idx ];
			if ( ( ! main || star.main ) /* && frustum.containsPoint( star.mesh.position ) */ ) {

				star.orientLabel( v3tmp, up, main );

			}

		}

	}

	static updatePlanetLabels( camera, up, main ) {

		if ( ! main ) return; // nothing to do

		let starList = mainStars;

		camera.getWorldPosition( v3tmp );

		for ( let idx = 0; idx < LabeledStar.shadows.length; idx ++ ) {

			LabeledStar.shadows[ idx ].updatePositionEtc();

		}

		let onscreen = LabeledStar.shadows.concat( mainStars );


		// do planets first
		let shadowLen = LabeledStar.shadows.length;
		for ( let idx = 0; idx < shadowLen; idx ++ ) {

			let shadow = LabeledStar.shadows[ idx ];

			shadow.setLabelPosition( camera.zoom, onscreen, v3tmp, up, main );
			shadow.setLabelVisibility( main );

		}

		let starLen = starList.length;
		for ( let idx = 0; idx < starLen; idx ++ ) {

			let star = starList[ idx ];
			let starLabel = star.shortNameLabel;
			let visible = starLabel.minZoom <= camera.zoom;
			for ( let jdx = 0; ( jdx < shadowLen ) && visible; jdx ++ ) {

				let shadow = LabeledStar.shadows[ jdx ];
				if ( shadow.shortNameLabel.labelMesh.parent ) {

					visible = visible &&
						! star.intersectsStarOrLabel( shadow, starLabel, main );

				}

			}

		}

	}

}

export default LabeledStar;
