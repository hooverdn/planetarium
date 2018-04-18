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
	CanvasTexture,
	Color,
	FrontSide,
	//Line3,
	Mesh,
	MeshBasicMaterial,
	PlaneBufferGeometry,
	Vector2,
	Vector3,
} from 'three';

import Text from './Text.js';
import Geometry from './Geometry.js';
import { colors } from './constellations.js';

let log2 = Math.log2;
if ( ! log2 ) {

	var log_2 = Math.log( 2 );
	log2 = function ( x ) {

		return Math.log( x ) / log_2;

	};

}

let v3tmp = new Vector3();

let stringAscends = Text.stringAscends;
let stringDescends = Text.stringDescends;

let baseOpacity = 0.9;
let baseFontSize = 24;

const geometry = new PlaneBufferGeometry( 1, 1 );
function createLabelPlane( colorIndex, label, fontSize, opacity, split, fontData ) {

	if ( ! label ) return null;

	let labels = split ? label.split( ' ' ) : [ label ];

	fontSize = fontSize || baseFontSize;
	opacity = opacity || baseOpacity;
	//color.multiplyScalar( opacity );

	let textureData = getTextureData( labels, fontSize, fontData, opacity, colorIndex );
	let texture = textureData.texture;
	let material = textureData.materials[ colorIndex ];
	let mesh = new Mesh( geometry, material );
	let width = textureData.width;
	let height = textureData.height;
	//if ( ! width || ! height ) {

	//console.log( 'textureData height ' + height + ', width ' + width );

	//}
	mesh.radius = Math.sqrt( width * width + height * height ) / 2;
	mesh.width = width;
	mesh.height = height;
	mesh.scale.set( texture.image.width, texture.image.height, 1 );
	mesh.scaleFactor = 1;

	return mesh;

}


let textureCache = {};

// function getTextureData( labels, font, opacity, colorIndex ) {

// 	let key = JSON.stringify( { labels: labels, font: font, opacity: opacity } );

// 	let textureData = textureCache[ key ];

// 	if ( ! textureData ) {

// 		// yes, we need a new canvas each time we create the
// 		// textureData for a set of labels

// 		let canvas = StarLabel.createCanvas();
// 	    let context = canvas.getContext( '2d' );

// 		context.font = font;

// 		let ascends = stringAscends( labels );
// 		let descends = stringDescends( labels );

// 		let coascent = ascends ? 0 : fontSize / 8;
// 		let codescent = descends ? 0 : fontSize / 8;
// 		let descent = descends ? fontSize / 8 : 0;
// 		let lineHeight = fontSize /* * 8 / 6 */ - coascent - codescent;

// 		let height = labels.length * lineHeight;
// 		let width = 0;
// 		let metrics;
// 		let idx;
// 		for ( idx = 0; idx < labels.length; idx ++ ) {

// 			metrics = context.measureText( ' ' + labels[ idx ] + ' ' );
// 			width = Math.max( width, metrics.width );

// 		}

// 		canvas.width = Math.pow( 2, Math.ceil( log2( width ) ) );
// 		canvas.height = Math.pow( 2, Math.ceil( log2( height ) ) );
// 		let htOffset = ( canvas.height - height ) / 2;

// 		// font has to be repeated for some reason
// 		context.font = font;
// 		context.textAlign = 'center';
// 		context.fillStyle = 'rgb(' +
//             Math.round( 255 * opacity ) + ',' +
//             Math.round( 255 * opacity ) + ',' +
//             Math.round( 255 * opacity ) + ')';

// 		for ( idx = 0; idx < labels.length; idx ++ ) {

// 			context.fillText(
// 				labels[ idx ],
// 				canvas.width / 2,
// 				htOffset + ( idx + 1 ) * lineHeight - descent - fontSize / 4
// 			);

// 		}

// 		textureData = {

// 			texture: new CanvasTexture( canvas ),
// 			width: width,
// 			height: height,
// 			materials: []

// 		};

// 		textureCache[ key ] = textureData;

// 	}

// 	let material = textureData.materials[ colorIndex ];

// 	if ( ! material ) {

// 		let texture = textureData.texture;
// 		let color = new Color( colors[ colorIndex ] );

// 		let material = new MeshBasicMaterial(

// 			{ alphaMap: texture,
// 			  transparent: true,
// 			  color: color,
// 			  side: FrontSide }

// 		);

// 		textureData.materials[ colorIndex ] = material;

// 	}

// 	return textureData;

// }


function getTextureData( labels, fontSize, fontStyle, opacity, colorIndex ) {

	fontStyle = fontStyle || '';
	if ( fontStyle ) fontStyle += ' ';
	let font = fontStyle + fontSize + 'px sans-serif';
	let key = JSON.stringify( { labels: labels, font: font, opacity: opacity } );

	let textureData = textureCache[ key ];

	if ( ! textureData ) {

		// yes, we need a new canvas each time we create the
		// textureData for a set of labels

		let canvas = StarLabel.createCanvas();
	    let context = canvas.getContext( '2d' );

		context.font = font;

		let ascends = stringAscends( labels );
		let descends = stringDescends( labels );

		//let coascent = ascends ? 0 : fontSize / 8;
		let codescent = descends ? 0 : fontSize / 8;
		let ascent = ascends ? fontSize / 8 : 0;
		let descent = descends ? fontSize / 8 : 0;

		// I don't understand why we need toadd ascent instead of
		// subtracting coascent here, but if we don't, the top gets
		// lopped off capital letters.
		let lineHeight = fontSize + ascent - codescent;

		let height = labels.length * lineHeight;
		let width = 0;
		let metrics;
		let idx;
		for ( idx = 0; idx < labels.length; idx ++ ) {

			metrics = context.measureText( ' ' + labels[ idx ] + ' ' );
			width = Math.max( width, metrics.width );

		}

		canvas.width = width;//Math.pow( 2, Math.ceil( log2( width ) ) );
		canvas.height = height;//Math.pow( 2, Math.ceil( log2( height ) ) );
		// removing the "/2" below is empirical - seems to make the
		// space above or below a label more balanced; I suppose the
		// "right" thing would be shift a label a bit toward the star
		// when it is above or below.
		let htOffset = ( canvas.height - height ); // / 2;

		// font has to be repeated for some reason
		context.font = font;
		context.textAlign = 'center';
		context.fillStyle = 'rgb(' +
            Math.round( 255 * opacity ) + ',' +
            Math.round( 255 * opacity ) + ',' +
            Math.round( 255 * opacity ) + ')';

		for ( idx = 0; idx < labels.length; idx ++ ) {

			context.fillText(
				labels[ idx ],
				canvas.width / 2,
				htOffset + ( idx + 1 ) * lineHeight - descent - fontSize / 4
			);

		}

		textureData = {

			texture: new CanvasTexture( canvas ),
			width: width,
			height: height,
			materials: []

		};

		textureCache[ key ] = textureData;

	}

	let material = textureData.materials[ colorIndex ];

	if ( ! material ) {

		let texture = textureData.texture;
		let color = new Color( colors[ colorIndex ] );

		let material = new MeshBasicMaterial(

			{ alphaMap: texture,
			  transparent: true,
			  color: color,
			  side: FrontSide }

		);

		textureData.materials[ colorIndex ] = material;

	}

	return textureData;

}

class StarLabel {

	constructor( colorIndex, label, labelData, fontSize, opacity, split, fontInfo ) {

		this.labelMesh = createLabelPlane( colorIndex, label, fontSize,
										   opacity, split, fontInfo );
		this.label = label;
		this.isCircle = label.length <= 2;
		this.scaleFactor = 1.0;

		if ( labelData ) {

			let vtr = labelData.vtr;
			this.vtr = new Vector3( vtr.x, vtr.y, vtr.z );
			let orthogVtr = labelData.orthogVtr;
			this.orthogVtr = new Vector3( orthogVtr.x, orthogVtr.y, orthogVtr.z );

			this.minZoom = labelData.minZoom;

		}
		this.setScaleFactor( StarLabel.baseStarScaleFactor );

	}

	setScaleFactor( scaleFactor ) {

		let oldFactor = this.scaleFactor;
		this.labelMesh.scale.multiplyScalar( scaleFactor / oldFactor );
		this.labelMesh.width *= scaleFactor / oldFactor;
		this.labelMesh.height *= scaleFactor / oldFactor;
		this.labelMesh.radius *= scaleFactor / oldFactor;

		this.scaleFactor = scaleFactor;

	}

	getPosition() {

		return this.labelMesh.position;

	}

	getPositionOffset() {

		return this.labelMesh.radius;

	}

	intersectsStar( star ) {

		return this.intersectsDisk( star.getPosition(), star.radius );

	}

	intersects( starLabel ) {

		if ( starLabel.isCircle ) {

			return this.intersectsDisk(
				starLabel.labelMesh.position,
				starLabel.labelMesh.radius
			);

		} else {

			return this.intersectsRectangularLabel( starLabel );

		}

	}

	getLocalRectangle( p1, p2, p3, p4 ) {

		let mesh = this.labelMesh;
		p1.set( mesh.width / 2, mesh.height / 2 );
		p2.set( mesh.width / 2, - mesh.height / 2 );
		p3.set( - mesh.width / 2, - mesh.height / 2 );
		p4.set( - mesh.width / 2, mesh.height / 2 );

	}

	intersectsDisk( center, radius ) {

		let mesh = this.labelMesh;

		let dsq = mesh.position.distanceToSquared( center );
		let sumOfRadiiSq = ( mesh.radius + radius ) * ( mesh.radius + radius );

		if ( dsq > sumOfRadiiSq ) return false;

		if ( this.isCircle ) {

			return true;

		} else {

			// project position onto star's tangent plane
			let p1 = new Vector2();
			let p2 = new Vector2();
			let p3 = new Vector2();
			let p4 = new Vector2();
			this.getLocalRectangle( p1, p2, p3, p4 );

			v3tmp.subVectors( center, mesh.position );
			let c = new Vector2( v3tmp.dot( this.vtr ),
								 v3tmp.dot( this.orthogVtr ) );

			return Geometry.circleIntersectsRectangle( c, radius, p1, p2, p3, p4 );

		}

	}

	/**
	 *  For it to be "global" maybe we should use world positions.
	 */
	getGlobalRectangle( p1, p2, p3, p4 ) {

		let mesh = this.labelMesh;
		let center = mesh.position;

		let tmp1 = new Vector3().copy( this.vtr ).multiplyScalar( mesh.width / 2 );
		let tmp2 = new Vector3().copy( this.orthogVtr ).multiplyScalar( mesh.height / 2 );
		p1.addVectors( tmp1, tmp2 );
		p1.add( center );

		tmp2.multiplyScalar( - 1 );
		p2.addVectors( tmp1, tmp2 );
		p2.add( center );

		tmp1.multiplyScalar( - 1 );
		p3.addVectors( tmp1, tmp2 );
		p3.add( center );

		tmp2.multiplyScalar( - 1 );
		p4.addVectors( tmp1, tmp2 );
		p4.add( center );

	}

	intersectsRectangularLabel( rectLabel ) {

		let mesh = this.labelMesh;
		let center = rectLabel.labelMesh.position;
		let radius = rectLabel.labelMesh.radius;

		let dsq = mesh.position.distanceToSquared( center );
		let sumOfRadiiSq = ( mesh.radius + radius ) * ( mesh.radius + radius );

		if ( dsq > sumOfRadiiSq ) return false;


		if ( this.isCircle ) {

			return rectLabel.intersectsDisk( mesh.position, mesh.radius );

		} else {

			let p1 = new Vector3();
			let p2 = new Vector3();
			let p3 = new Vector3();
			let p4 = new Vector3();
			rectLabel.getGlobalRectangle( p1, p2, p3, p4 );

			let q1 = new Vector2();
			let q2 = new Vector2();
			let q3 = new Vector2();
			let q4 = new Vector2();

			this.localizeVector( p1, q1 );
			this.localizeVector( p2, q2 );
			this.localizeVector( p3, q3 );
			this.localizeVector( p4, q4 );

			let r1 = new Vector2();
			let r2 = new Vector2();
			let r3 = new Vector2();
			let r4 = new Vector2();
			this.getLocalRectangle( r1, r2, r3, r4 );

			return Geometry.rectanglesIntersect( [ q1, q2, q3, q4 ],
												 [ r1, r2, r3, r4 ] );

		}

	}


	/**
	 *  Return in q the coordinates of the projection of p onto the
	 *  plane of <code>this.vtr</code> and
	 *  <code>this.orthogVtr</code>, in terms of that basis.
	 */
	localizeVector( p, q ) {

		let p_rel = new Vector3().copy( p );
		p_rel.sub( this.labelMesh.position );

		q = q || new Vector2();

		q.set( p_rel.dot( this.vtr ), p_rel.dot( this.orthogVtr ) );

		return q;

	}

	setVisible( visible, group ) {

		let parent = this.labelMesh.parent;
		if ( ! visible ) {

			if ( parent ) {

				parent.remove( this.labelMesh );

			}
			// if no parent, we are already non-visible

		} else {

			if ( parent && parent !== group ) {

				parent.remove( this.labelMesh );
				group.add( this.labelMesh );

			} else if ( ! parent ) {

				group.add( this.labelMesh );

			}

		}

	}

	lookAt( lookAtPos, up ) {

		if ( ! this.isCircle ) {

			// long short name
			this.labelMesh.up.copy( this.orthogVtr );

			if ( this.orthogVtr.dot( up ) < 0 ) {

				this.labelMesh.up.multiplyScalar( - 1 );

			}

		} else {

			this.labelMesh.up.copy( up );

		}
		this.labelMesh.lookAt( lookAtPos );

	}

	// setLineSegmentAndRadius() {

	// 	if ( this.isCircle ) {

	// 		if ( ! this.segment ) {

	// 			let pt = new Vector3();
	// 			this.segment = new Line3( pt, pt );

	// 		}

	// 		this.labelMesh.getWorldPosition( this.segment.start );
	// 		this.segmentRadius = this.labelMesh.radius;

	// 	} else {

	// 		// should this be some kind of world radius that takes scaling
	// 		// into account?
	// 		this.segmentRadius = this.labelMesh.radius / 2;

	// 		let segmentLength = this.labelMesh.width - this.segmentRadius;

	// 		this.segment = this.segment || new Line3();

	// 		// take half of segment radius off each end.
	// 		let start = this.segment.start.copy( this.labelMesh.position );
	// 		let end = this.segment.end.copy( this.labelMesh.position );
	// 		start.x -= segmentLength / 2;
	// 		end.x -= segmentLength / 2;

	// 	}

	// }

	// On node, set this function to something suitable before
	// creating labels.
	static createCanvas() {

		return document.createElement( 'canvas' );

	}

}

export default StarLabel;
export { createLabelPlane };
