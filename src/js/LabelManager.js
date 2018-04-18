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
	Spherical,
	Vector3
} from 'three';

import { distance } from './Star.js';
import LabeledStar from './LabeledStar.js';
import StarLabel from './StarLabel.js';

import { constellations } from './constellations.js';

import Utils from './Utils.js';
let radians = Utils.radians;

let baseOpacity = 0.9;
let baseStarScaleFactor = distance / 1000;

let labelManager = null;

class LabelManager {

	constructor( camera, renderer ) {

		this.camera = camera;
		this.renderer = renderer;
		this.up = new Vector3();

		this.displayGroups = [];
		this.shortNameGroup = new Group();
		this.commonGroup = new Group();
		this.commonGroup.visible = false;
		LabeledStar.infoTextGroup.add( this.commonGroup );

		//this.planetInfoGroup = planetInfoGroup;
		this.displayGroups.push( LabeledStar.shortNameGroup );
		this.displayGroups.push( LabeledStar.letterGroup );

		this.displayMode = 0;
		this.enabled = true;

	}

	static createLabelManager( camera, renderer ) {

		labelManager = new LabelManager( camera, renderer );
		return labelManager;

	}

	static getLabelManager() {

		return labelManager;

	}

	displayOff() {

		return this.displayMode === this.noDisplay;

	}

	nextDisplayMode() {

		this.displayMode = ( this.displayMode + 1 ) % this.displayModeMax;
		this.setUpDirection();

		for ( var idx = 0; idx < this.displayModeMax - 1; idx ++ ) {

			if ( this.displayMode === idx + 1 ) {

				LabeledStar.setLabelPositionAndVisibility( this.camera, this.up, idx === 0 );
				this.displayGroups[ idx ].visible = true;
				this.commonGroup.visible = true;
				//this.planetInfoGroup.visible = ( idx === 0 );

			} else {

				this.displayGroups[ idx ].visible = false;

			}

		}
		if ( this.displayOff() ) {

			this.commonGroup.visible = false;
			//this.planetInfoGroup.visible = false;

		}

	}

	orientDisplay() {

		if ( this.enabled && ! this.displayOff() ) {

			this.setUpDirection();
			LabeledStar.orientLabels( this.camera, this.up, this.displayMode === 1 );

		}

	}

	updateDisplay( starLabels, planetLabels ) {

		if ( this.enabled && ! this.displayOff() ) {

			this.setUpDirection();
			if ( starLabels ) {

				LabeledStar.setLabelPositionAndVisibility( this.camera, this.up, this.displayMode === 1 );

			} else if ( planetLabels ) {

				LabeledStar.updatePlanetLabels( this.camera, this.up, this.displayMode === 1 );

			}
			LabeledStar.orientLabels( this.camera, this.up, this.displayMode === 1 );

			//this.positionConstellationLabels();
			for ( let constell in constellations ) {

				if ( constellations.hasOwnProperty( constell ) ) {

					var constellation = constellations[ constell ];
					this.orientConstellationLabels( constellation, this.camera.zoom );

				}

			}

		}

	}

	setUpDirection() {

		Utils.findScreenUpDirection( this.camera, this.renderer, this.up );

	}

	orientConstellationLabels( constellation, zoom ) {

		zoom = zoom || this.camera.zoom;
		var starScaleFactor = baseStarScaleFactor / Math.max( 1, zoom - 0.2 );
		var labelObjs = constellation.labelObjs;
		if ( ! labelObjs ) return;
		var labelObj;
		for ( var idx = 0; idx < labelObjs.length; idx ++ ) {

			labelObj = labelObjs[ idx ];

			labelObj.labelMesh.up.copy( this.up );
			labelObj.labelMesh.lookAt( this.camera.position );
			labelObj.setScaleFactor( starScaleFactor );

		}

	}

	addConstellationLabels( zoom ) {

		zoom = zoom || this.camera.zoom;

		var constell;
		var labelObj, labelPos;
		var split = true;

		for ( var cstl in constellations ) {

			if ( cstl !== '' && constellations.hasOwnProperty( cstl ) ) {

				constell = constellations[ cstl ];
				constell.labelObjs = [];

				for ( var idx = 0; idx < constell.labelPos.length; idx ++ ) {

					labelPos = constell.labelPos[ idx ];
					labelObj = new StarLabel(
						constell.color,
						constell.nom.toUpperCase(),
						undefined,
						22,
						baseOpacity - 0.2,
						split,
						'italic'
					);

					let spherical = new Spherical(
						distance * 1.0002,
						radians( 90 - labelPos.latitude ),
						radians( 90 + labelPos.longitude )
					);

					labelObj.getPosition().setFromSpherical( spherical );
					constell.labelPos[ idx ] = labelObj.getPosition().clone();


					this.commonGroup.add( labelObj.labelMesh );

					constell.labelObjs.push( labelObj );

				}
				this.orientConstellationLabels( constell, zoom );

			}

		}

	}

	// constellationHasOnscreenStar( constellation, frustum ) {

	// 	let stars = constellation.stars;
	// 	for ( let idx = 0; idx < stars.length; idx ++ ) {

	// 		let star = allStars[ stars[ idx ] ];
	// 		if ( star.letter && frustum.containsPoint( star.getPosition() ) ) {

	// 			return true;

	// 		}

	// 	}
	// 	return false;

	// }

	// positionConstellationLabels() {

	// 	let frustum = LabeledStar.getCameraFrustum( this.camera );

	// 	for ( let constell in constellations ) {

	// 		if ( constellations.hasOwnProperty( constell ) && constell !== '' ) {

	// 			let constellation = constellations[ constell ];
	// 			if ( frustum.intersectsBox( constellation.box ) ) { // &&

	// 				//this.constellationHasOnscreenStar( constellation, frustum ) ) {

	// 				for ( var idx = 0; idx < constellation.labelPos.length; idx ++ ) {

	// 					let pos = constellation.labelPos[ idx ];
	// 					//let pos = constellation.labelObjs[ 0 ].getPosition();
	// 					let f = LabelManager.constellationDistanceFunction(
	// 						constell, frustum, this.camera.zoom
	// 					);
	// 					let result = numeric.uncmin( f, [ pos.x, pos.y, pos.z ] );
	// 					let soln = result.solution;
	// 					pos.set( soln[ 0 ], soln[ 1 ], soln[ 2 ] );
	// 					pos.multiplyScalar( distance / pos.length() );
	// 					constellation.labelObjs[ idx ].getPosition().copy( pos );

	// 					if ( constellation.labelObjs[ idx ].parent !== this.commonGroup ) {

	// 						constellation.labelObjs[ idx ].setVisible( true, this.commonGroup );

	// 					}

	// 				}

	// 			} else {

	// 				// remove labels
	// 				let len = constellation.labelObjs.length;
	// 				for ( let idx = 0; idx < len; idx ++ ) {

	// 					constellation.labelObjs[ idx ].setVisible( false, this.commonGroup );

	// 				}

	// 			}

	// 		}

	// 	}

	// }

	// static constellationDistanceFunction( constell, frustum, zoom ) {

	// 	return function ( position ) {

	// 		let pos = new Vector3( position[ 0 ], position[ 1 ], position[ 2 ] );
	// 		pos.multiplyScalar( distance / pos.length() );
	// 		let val = 0;

	// 		for ( let constell2 in constellations ) {

	// 			if ( constellations.hasOwnProperty( constell2 ) && constell2 !== '' ) {

	// 				let isConstell = constell === constell2;
	// 				let constellation = constellations[ constell2 ];
	// 				if ( frustum.intersectsBox( constellation.box ) ) {

	// 					let starList = constellation.stars;
	// 					let len = starList.length;
	// 					for ( let idx = 0; idx < len; idx ++ ) {

	// 						let star = allStars[ starList[ idx ] ];
	// 						let pos2 = star.getPosition();
	// 						if ( star.letter && frustum.containsPoint( pos2 ) ) {

	// 							let distSq = zoom * pos.distanceToSquared( pos2 );
	// 							if ( isConstell ) {

	// 								val += 1.0e16 / distSq;
	// 								val += pos.distanceToSquared( pos2 ) * 1.0e-16;

	// 							} else {

	// 								val += 1.0e18 / distSq;

	// 							}
	// 							if ( isNaN( val ) ) val = Infinity;

	// 						}

	// 						// off-screen label penalty
	// 						let planes = frustum.planes;
	// 						let len = planes.length;
	// 						let penalty = 0;
	// 						for ( let idx = 0; idx < len; idx ++ ) {

	// 							let dist = planes[ idx ].distanceToPoint( pos );
	// 							if ( dist < 0 ) penalty -= dist;

	// 						}

	// 						val += penalty * 1.0e-8;

	// 					}

	// 				}

	// 			}

	// 		}

	// 		return val;

	// 	};

	// }

}

Object.assign(
	LabelManager.prototype,
	{

		noDisplay: 0,
		shortNames: 1,
		all: 2,
		greekOrBright: 3,
		bsNos: 4,
		greekLettersBright: 5,
		greekLetters: 6,
		displayModeMax: 3,

	}
);


export default LabelManager;
