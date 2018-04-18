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

	Box2,
	Euler,
	Frustum,
	Quaternion,
	Spherical,
	Vector2,
	Vector3,

} from 'three';

let v3tmp = new Vector3();

class Utils {

	static setLatLong( obj, latitude, longitude ) {

		latitude = Math.PI / 2 - Utils.radians( latitude );
		longitude = Utils.radians( longitude );

		let euler =
            new THREE.Euler( 0, longitude, - latitude );

		obj.setRotationFromEuler( euler );

	}

	static rotate( obj, elevation, rotation ) {

		let euler =
			new THREE.Euler(
				elevation,
				- rotation + Math.PI / 2,
				0,
				'YXZ'
			);

		// assumes center at origin (?)
		obj.setRotationFromEuler( euler );

	}

	/**
	 *  Rotate the object around the given point using the unit quaternion.
	 */
	static rotateAroundQuaternion( obj, q, p ) {

		let pos = p || obj.position.clone();
		obj.position.sub( pos );

		// do we want to premultiply here instead?
		obj.setRotationFromQuaternion( q );
		//obj.quaternion.multiply(q);
		obj.position.add( pos );

	}

	/**
	 *  Rotate the object around the given point using the given angle and axis.
	 */
	static rotateAroundAxisAngle( obj, axis, angle, p ) {

		let pos = p || obj.position.clone();
		obj.position.sub( pos );
		obj.setRotationFromAxisAngle( axis, angle );
		//obj.rotateOnAxis(axis, angle);
		obj.position.add( pos );

	}

	static quaternionToEuler( q, order ) {

		order = order || 'XYZ';
		let euler = new Euler( 0, 0, 0, order );
		euler.setFromQuaternion( q );
		return euler;

	}

	static getQuaternion( ctr, start, end, q ) {

		let v1 = new Vector3().subVectors( start, ctr );
		v1.normalize();

		let v2 = new Vector3().subVectors( end, ctr );
		v2.normalize();

		q = q || new Quaternion();

		return q.setFromUnitVectors( v1, v2 );

	}

	static radians( degrees ) {

		return Math.PI * ( degrees / 180 );

	}

	static degrees( radians ) {

		return 180 * ( radians / Math.PI );

	}


	// cos, sin, etc. in degrees
	static cosd( degrees ) {

		return Math.cos( Utils.radians( degrees ) );

	}

	static sind( degrees ) {

		return Math.sin( Utils.radians( degrees ) );

	}

	static acosd( x ) {

		return Utils.degrees( Math.acos( x ) );

	}

	static asind( y ) {

		return Utils.degrees( Math.asin( y ) );

	}


	static roundTo1( num ) {

		return Math.round( num * 10 ) / 10;

	}

	static roundTo2( num ) {

		return Math.round( num * 100 ) / 100;

	}

	static clamp( x, min, max ) {

		if ( x === undefined ) return undefined;

		return x < min ? min : ( x > max ? max : x );

	}

	/**
	 *  From https://stackoverflow.com/questions/27409074/converting-3d-position-to-2d-screen-position-r69
	 */

	static getWorldCoordinates( obj, vector ) {

		vector = vector || new Vector3();

		obj.updateMatrixWorld();
		vector.setFromMatrixPosition( obj.matrixWorld );

		return vector;

	}

	static getProjectedCoordinates( obj, camera, vector ) {

		vector = Utils.getWorldCoordinates( obj, vector );
		vector.project( camera );

		return vector;

	}

	static toScreenPosition( obj, camera, renderer, vector, vector2 ) {

		vector = vector || new Vector3();
		Utils.getProjectedCoordinates( obj, camera, vector );
		return Utils.projectedCoordinatesToScreen( vector, renderer, vector2 );

	}

	static worldCoordsToScreen( vector, camera, renderer, vector2 ) {

		//camera.updateMatrix();
		//camera.updateMatrixWorld();
		//camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		vector.project( camera );

		return Utils.projectedCoordinatesToScreen( vector, renderer, vector2 );

	}

	static projectedCoordinatesToScreen( vector, renderer, vector2 ) {

		let widthHalf = 0.5 * renderer.context.canvas.width;
		let heightHalf = 0.5 * renderer.context.canvas.height;

		vector2 = vector2 || new Vector2();
		vector2.set( ( vector.x * widthHalf ) + widthHalf,
					 - ( vector.y * heightHalf ) + heightHalf );

		if ( vector2.x >= 0 && vector2.y >= 0 &&
			 vector2.x < 2 * widthHalf && vector2.y < 2 * heightHalf ) {

			return vector2;

		} else {

			return null;

		}

	}

	static screenCoordsToWorld( coords, camera, renderer, vector ) {

		vector = vector || new Vector3();
		vector = Utils.screenCoordinatesToProjected( coords, renderer, vector );

		vector.z = - 1;
		vector.unproject( camera );

		return vector;

	}

	static screenCoordinatesToProjected( coords, renderer, vector ) {

		let widthHalf = 0.5 * renderer.domElement.clientWidth;
		let heightHalf = 0.5 * renderer.domElement.clientHeight;

		vector = vector || new Vector2();
		vector.set(

			( coords.x - widthHalf ) / widthHalf,
			- ( coords.y - heightHalf ) / heightHalf

		);

		return vector;

	}

	/**
	 *  Find a world unit vector that points "up" on the screen.
	 */
	static findScreenUpDirection( camera, renderer, end ) {

		end = end || new Vector3();
		let start = v3tmp;

		Utils.screenCoordsToWorld( { x: 100, y: 200 }, camera, renderer, start );
		Utils.screenCoordsToWorld( { x: 100, y: 100 }, camera, renderer, end );

		return end.sub( start ).normalize();

	}

	static getCameraFrustum( camera, frustum ) {

		frustum = frustum || new Frustum();
		frustum.setFromMatrix(
			new THREE.Matrix4().multiplyMatrices(
				camera.projectionMatrix,
				camera.matrixWorldInverse
			)
		);

		return frustum;

	}

	static makeBox( x, y, w, h, box ) {

		box = box || new Box2();
		box.min.x = x;
		box.min.y = y;
		box.max.x = x + w;
		box.max.y = y + h;
		return box;

	}


	/**
	 *  Return a random integer in [0, n).
	 */
	static randomInt( n ) {

		return n === 1 ? 0 : Math.floor( n * Math.random() );

	}

	static vectorToString( v ) {

		let str = '(';
		str += Utils.roundTo2( v.x );
		str += ', ';
		str += Utils.roundTo2( v.y );
		if ( v.z !== undefined ) {

			str += ', ';
			str += Utils.roundTo2( v.z );

		}
		if ( v.w !== undefined ) {

			str += ', ';
			str += Utils.roundTo2( v.w );

		}
		str += ')';

		return str;

	}


	// For debugging, mainly
	static printWorldOrientationAndPosition( obj, name ) {

		obj.parent.updateMatrixWorld();
		let wpos = obj.getWorldPosition();
		let wq = obj.getWorldQuaternion();
		let yaxis = Utils.yaxis.clone();
		yaxis.applyQuaternion( wq );

		let ws = new Spherical().setFromVector3( yaxis );

		let msg = name ? name + ': ' : '';
		msg += 'world position: (' +
			Utils.roundTo2( wpos.x ) + ', ' +
			Utils.roundTo2( wpos.y ) + ', ' +
			Utils.roundTo2( wpos.z ) + '), ' +
			'axis: RA ' + Utils.degrees( ws.theta ) +
			', D ' + ( 90 - Utils.degrees( ws.phi ) );
		console.log( msg );

	}

	/**
	 *  Convert astronomical coordinates to spherical as used in three.js.
	 *
	 *  @param sph The Spherical object to set.  If undefined, a new
	 *  one will be created and returned.
	 *
	 *  @param dist Distance in whatever units.
	 *  @param decl Declination in degrees.
	 *  @param ra  Right ascendence in degrees.
	 *  @returns The spherical object that has been set.
	 */
	static astroToSpherical( dist, decl, ra, sph ) {

		sph = sph || new Spherical();
		sph.set( dist,
				 Math.PI / 2 - Utils.radians( decl ),
				 Utils.radians( ra ) - Math.PI / 2 );
		return sph;

	}

}

// Constants

Utils.sqrt2 = Math.sqrt( 2 );

Utils.origin = new Vector3( 0, 0, 0 );

Utils.xaxis = new Vector3( 1, 0, 0 );
Utils.yaxis = new Vector3( 0, 1, 0 );
Utils.zaxis = new Vector3( 0, 0, 1 );


export default Utils;
