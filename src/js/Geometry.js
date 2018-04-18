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

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
	Vector2,
	Vector3,
} from 'three';

import * as numeric from 'numericjs';

// Routimes for basic spherical geometry computations

let v2tmp1 = new Vector2();
let v2tmp2 = new Vector2();
let v3tmp1 = new Vector3();

class Geometry {

	static spheresIntersect( p1, r1, p2, r2 ) {

		let sum = r1 + r2;
		return p1.distanceToSquared( p2 ) <= sum * sum;

	}

	static pointInRectangle( p, r ) {

		v2tmp1.subVectors( p, r[ 0 ] );
		v2tmp2.subVectors( r[ 1 ], r[ 0 ] );
		let dot1 = v2tmp1.dot( v2tmp2 );
		if ( dot1 < 0 ) return false;

		let dot2 = v2tmp2.lengthSq();
		if ( dot1 > dot2 ) return false;

		v2tmp2.subVectors( r[ 3 ], r[ 0 ] );
		dot1 = v2tmp1.dot( v2tmp2 );
		if ( dot1 < 0 ) return false;

		dot2 = v2tmp2.lengthSq();
		if ( dot1 > dot2 ) return false;

		return true;

	}

	static pointOnLineSeg( p, q1, q2 ) {

		v2tmp1.subVectors( p, q1 );
		v2tmp2.subVectors( q2, q1 );

		let dot = v2tmp1.dot( v2tmp2 );
		let normSq = v2tmp2.lengthSq();
		return dot >= 0 && dot <= normSq && v2tmp1.lengthSq() === dot * dot / normSq;

	}

	/**
	 *  Return 0 if p1, p2, p3 are collinear, 1 if they are in
	 *  clockwise order, 2 if counter clockwise.
	 *
	 *  Thanks to https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect
	 */
	static orientation( p, q, r ) {

		let det = ( q.y - p.y ) * ( r.x - q.x ) - ( q.x - p.x ) * ( r.y - q.y );

		return det === 0 ? 0 : ( det > 0 ? 1 : 2 );

	}

	/**
	 *  Determine whether the line segment from p1 to p2 and the line
	 *  segment from q1 to q2 intersect.  The arguments are planar
	 *  points (Vector2's).
	 */
	static lineSegmentsIntersect( p1, p2, q1, q2 ) {

		// special case: parallel lines
		if ( ( p1.x - p2.x ) * ( q1.y - q2.y ) === ( p1.y - p2.y ) * ( q1.x - q2.x ) ) {

			// one endpoint of one line segment must lie in the other
			return Geometry.pointOnLineSeg( p1, q1, q2 ) ||
				Geometry.pointOnLineSeg( p2, q1, q2 ) ||
				Geometry.pointOnLineSeg( q1, p1, p2 ) ||
				Geometry.pointOnLineSeg( q2, p1, p2 );

		} else {

			// the two lines must cross -- check whether the point is on both segments
			// Writing the p's and q's in column format, solve
			// [                       ] [ lambda ]
			// [ (p2 - p1)  (q2 - q1 ) ] [        ] == p1 - q1
			// [                       ] [    mu  ]

			let o1 = Geometry.orientation( p1, p2, q1 );
			let o2 = Geometry.orientation( p1, p2, q2 );
			let o3 = Geometry.orientation( q1, q2, p1 );
			let o4 = Geometry.orientation( q1, q2, p2 );

			return ( o1 !== o2 ) && ( o3 !== o4 );

		}

	}

	/**
	 *  Determine if two planar rectangles intersect.
	 *
	 *  @param {Vector2} p An array of the four vertices of a rectangle
	 *  (quadrilateral) in either clockwise or counterclockwise order.
	 *  @param {Vector2} q An array of
	 */
	static rectanglesIntersect( p, q ) {

		// Two planar rectangles intersect if one is contained in the
		// other, hence all of its vertices are contained in the
		// other, or one of the edges of one crosses one of the edges
		// of the other.

		if ( Geometry.pointInRectangle( p[ 0 ], q ) || Geometry.pointInRectangle( q[ 0 ], p ) ) {

			return true;

		}

		// not all vertices in either contained in the other, so check edges.
		for ( let idx = 0; idx < 4; idx ++ ) {

			for ( let jdx = 0; jdx < 4; jdx ++ ) {

				if (
					Geometry.lineSegmentsIntersect(
						p[ idx ], p[ ( idx + 1 ) % 4 ],
						q[ jdx ], q[ ( jdx + 1 ) % 4 ]
					)
				) return true;

			}

		}

		return false;

	}


	/**
	 *  This is really, "does the nearest point to c on the line
	 *  through p1 and p2 lie in the segment between them, and is its
	 *  squared distance to c less than rsq", since we tackle the
	 *  endpoint cases beforehand.
	 */
	static circleIntersectsLineSeg( c, rsq, p1, p2 ) {

		v2tmp1.subVectors( c, p1 );
		v2tmp2.subVectors( p2, p1 );
		let dot1 = v2tmp1.dot( v2tmp2 );
		if ( dot1 < 0 ) return false;

		let dot2 = v2tmp2.lengthSq();
		if ( dot1 > dot2 ) return false;

		let dot3 = v2tmp1.lengthSq();

		return dot3 * ( 1 - dot1 / ( dot2 * dot3 ) ) <= rsq;

	}

	static circleIntersectsRectangle( c, r, p1, p2, p3, p4 ) {

		if ( Geometry.pointInRectangle( c, [ p1, p2, p3, p4 ] ) ) return true;

		let rsq = r * r;

		if ( c.distanceToSquared( p1 ) <= rsq ||
			 c.distanceToSquared( p2 ) <= rsq ||
			 c.distanceToSquared( p3 ) <= rsq ||
			 c.distanceToSquared( p4 ) <= rsq ) {

			return true;

		}

		if ( Geometry.circleIntersectsLineSeg( c, rsq, p1, p2 ) ||
			 Geometry.circleIntersectsLineSeg( c, rsq, p2, p3 ) ||
			 Geometry.circleIntersectsLineSeg( c, rsq, p3, p4 ) ||
			 Geometry.circleIntersectsLineSeg( c, rsq, p4, p1 ) ) {

			return true;

		}

		return false;

	}

	// what is relation of the following to projecting q onto tangent
	// plane of p and finding polar coords?

	/**
	 *  Act as if s2 is in the tangent plane at s1 of the sphere
	 *  containing s1 and return approximate &theta; value of s2 in polar
	 *  coordinates centered at s1.
	 */
	static findAngle( p, q ) {

		var s1 = new THREE.Spherical();
		var s2 = new THREE.Spherical();
		s1.setFromVector3( p );
		s2.setFromVector3( q );

		return Geometry.findAngleSpherical( s1, s2 );

	}


	/**
	 *  Act as if s2 is in the tangent plane at s1 of the sphere
	 *  containing s1 and return approximate &theta; value of s2 in polar
	 *  coordinates centered at s1.
	 */
	static findAngleSpherical( s1, s2 ) {

		var dphi = s2.phi - s1.phi;
		var dtheta = s2.theta - s1.theta;

		return Math.atan2( dphi, Math.sin( s1.phi ) * dtheta );

	}

	/**
	 *  Return a THREE.Vector3 approximating the position of q in the
	 *  tangent plane of p, with p at the origin and north as the y-axis,
	 *  with an angle by which to rotate the result around the origin.
	 *
	 *  <p>We return a Vector3 with z-coordinate 0 because we want to use
	 *  some Line3 stuff&mdash;there is no Line2.
	 */
	static findVectorInTangentPlane( p, q ) {

		var s1 = new THREE.Spherical();
		var s2 = new THREE.Spherical();
		s1.setFromVector3( p );
		s2.setFromVector3( q );

		var dphi = s2.phi - s1.phi;
		var dtheta = s2.theta - s1.theta;

		return new THREE.Vector3( s1.radius * dtheta * Math.sin( s1.phi ),
								  s2.radius * dphi,
								  0 );

	}

	static rotateVector2( v, angle, target ) {

		target = target || new THREE.Vector2();

		target.set(
			Math.cos( angle ) * v.x - Math.sin( angle ) * v.y,
			Math.sin( angle ) * v.x + Math.cos( angle ) * v.y
		);

	}


	/**
	 *  Find the side of the Box2 box that is closest to p and return it
	 *  as a line.
	 *
	 *  <p>If the nearest point is a corner, use the line representing the
	 *  long side, which we assume is the
	 *
	 *  <p>Since there is no THREE.Line2, we are returning this as a THREE.Line3.
	 *
	 *  <p>Should we use Vector3 with z === 0 instead of Vector2?
	 */
	static findNearSideOfBox( p, box ) {

		// just give up if p is inside the box, at least for now.
		if ( box.containsPoint( p ) ) {

			return null;

		}

		var p2 = box.clampPoint( p );

		if ( p2.x === box.min.x || p2.x === box.max.x ) {

			// on one of the long sides
			return new THREE.Line3(
				new THREE.Vector3( p2.x, box.min.y, 0 ),
				new THREE.Vector3( p2.x, box.max.y, 0 )
			);

		} else {

			// on a short side
			return new THREE.Line3(
				new THREE.Vector3( box.min.x, p2.y, 0 ),
				new THREE.Vector3( box.max.x, p2.y, 0 )
			);

		}

	}


	/**
	 *  Given a point p and a line (infinitely extended), we want to find
	 *  an angle &alpha; such that if:
	 *
	 *  <ol>
	 *    <li>We drop a perpendicular from the point p to the line.
	 *
	 *    <li>And we choose any point q in the plane of p and the line, of
	 *        distance d from p, so that the line (p, q) forms an angle at
	 *        least &alpha;.
	 *
	 *   <li>Then the circle or radius radius about q will not touch the line.
	 *  </ol>
	 */
	static findAngleToLine( p, dist, radius, line ) {

		var nearest = line.closestPointToPoint( p );
		var d = p.distanceTo( nearest );
		nearest.sub( p );
		var angleToNearest = Math.atan2( nearest.y, nearest.x );

		var angle = Math.acos( Math.max( Math.min( ( d - radius ) / dist, 1 ), - 1 ) );
		return { left: angle - angleToNearest, right: angle + angleToNearest };

	}

	/**
	 *  It is probably desirable bump up ("adjust") the distances described
	 *  below by a factor of, say, 1.1 to allow for the approximations
	 *  involved and allow a little space between labels and between labels and stars.
	 *
	 *  @param p - the point at which we want to put a new label
	 *  @param d - the distance from p that the label as to go.
	 *             <ol>
	 *                <li>For a circular label (sprite) attached to a star,
	 *                    this will be the radius of the star plus
	 *                    the radius of the label.
	 *                <li>For a rectangle label, it will be the radius
	 *                    of the star plus the width of the label.
	 *             </ol>
	 *  @param r - the distance that the label needs to be from the obstructing
	 *             label at point q.  For a circular label, for is the radius
	 *             of the label.  For a rectangular label, it is half the height of
	 *             the label.
	 *
	 *  @param q - the point where an obstructing label is located, usually the
	 *             center of a star.
	 *  @param h - the height of the obstruction.  For a circular label
	 *             max of 2*radius of star and 2*radius of label.  For a,
	 *             rectangular label, max of the height of the label and 2*radius of star.
	 *  @param w - for a circular label, 2*radius of label + radius of star.  For
	 *             a rectangular label, width of label + radius of star.
	 *  @param angle - the angle that the obstructing label makes with q, in local
	 *             polar coordinates in the tangent plane at q.
	 */
	static findExcludedAngles( p, d, r, q, w, h, angle ) {

		if ( p.distanceTo( q ) > d + r + w + h ) {

			return null;

		}

		// 1. rotate p by (pi/2 - angle) around q, so long axis of q's
		// label is straight up.
		var p2 = new THREE.Vector3( p.x, p.y, p.z ).sub( q );
		var n = new THREE.Vector3( q.x, q.y, q.z ).normalize();

		p2.applyAxisAngle( n, Math.PI / 2 - angle );
		p2.add( q );

		// First, put p into local polar coordinates at q.
		var s1 = new THREE.Spherical();
		var s2 = new THREE.Spherical();
		s1.setFromVector3( p );
		s2.setFromVector3( q );

		p2 = new THREE.Vector2(
			s2.radius * Math.sin( s2.phi ) * ( s1.theta - s2.theta ),
			s2.radius * ( s1.phi - s2.phi )
		);
		var box = new THREE.Box2(
			new THREE.Vector2( - h / 2, 0 ),
			new THREE.Vector2( h / 2, w )
		);

		var line = Geometry.findNearSideOfBox( p2, box );

		if ( line ) {

			var interval = Geometry.findAngleToLine(
				new THREE.Vector3( p2.x, p2.y, 0 ),
				d, r, line
			);

			interval.left -= Math.PI / 2 - angle;
			interval.right -= Math.PI / 2 - angle;

			return interval;

		} else {

			// all angles excluded
			return { left: 0, right: 2 * Math.PI };

		}

	}


	// Functions to help minimize a sum of distances from other stars
	// along a circle of a given radius.

	static distanceFn( xVtr, yVtr, radius, pos ) {

		let tmp1 = new Vector3();
		let tmp2 = new Vector3();

		return function ( theta ) {

			tmp1.copy( xVtr );
			tmp1.multiplyScalar( Math.cos( theta ) );

			tmp2.copy( yVtr );
			tmp2.multiplyScalar( Math.sin( theta ) );

			tmp1.add( tmp2 );
			tmp1.multiplyScalar( radius );

			return pos.distanceTo( tmp1 );

		};

	}

	static sumInvDistanceFn( center, xVtr, yVtr, radius, entities, posFn ) {

		let tmp1 = new Vector3();
		let tmp2 = new Vector3();

		return function ( theta ) {

			// theta will be an array
			theta = theta[ 0 ];
			tmp1.copy( xVtr );
			tmp1.multiplyScalar( Math.cos( theta ) );

			tmp2.copy( yVtr );
			tmp2.multiplyScalar( Math.sin( theta ) );

			tmp1.add( tmp2 );
			tmp1.multiplyScalar( radius );

			tmp1.add( center );

			let val = 0;

			for ( let idx = 0; idx < entities.length; idx ++ ) {

				let pos = posFn( entities[ idx ] );
				let increm = 1 / tmp1.distanceToSquared( pos );

				// if, by chance, tmp1 coincided with the position,
				// use Infinity instead of NaN.
				val += isNaN( increm ) ? Infinity : increm;

			}

			return val * 1.0e21;

		};

	}

	/**
	 *  Given a vector, set two other vectors to be orthogonal to it
	 *  and each other and normalized.
	 */
	static getOrthonormal( normal, v1, v2 ) {

		if ( normal.x === 0 ) {

			v1.set( 1, 0, 0 );

		} else {

			v1.set( normal.y, - normal.x, 0 );
			v1.normalize();

		}

		v2.copy( v1 );
		v2.cross( normal );
		v2.normalize();

	}

	/**
	 *  Find the signed angle from u to v, where u and v are vectors in the plane orthogonal to normal.  Positive if (u x v).normal > 0.
	 */
	static signedAngle( u, v, normal ) {

		let theta = u.angleTo( v );
		v3tmp1.crossVectors( u, v );

		if ( v3tmp1.dot( normal ) > 0 ) theta *= - 1;

		return theta;

	}


	// Below are functions relating to preventing constellation labels
	// from overlapping.

	static pushAwayFunction( sigmaSquared ) {

		return function ( dSquared ) {

			return Math.exp( - dSquared / sigmaSquared );

		};

	}

	static pointToLineDistanceSquared( pt, line ) {

		line.closestPointToPoint( pt, true, v3tmp1 );
		return pt.distanceToSquared( v3tmp1 );

	}

	static lineDistanceSquared( line1, line2 ) {

		if ( line1.start === line1.end ) {

			return Geometry.pointToLineDistanceSquared( line1.start, line2 );

		} else if ( line2.start === line2.end ) {

			return Geometry.pointToLineDistanceSquared( line2.start, line1 );

		} else if ( Geometry.lineSegmentsIntersect(
			line1.start, line1.end,
			line2.start, line2.end
		) ) {

			return 0;

		} else {

			// Assuming that the shortest distance between points on
			// nonintersectiong line segments is the distance between
			// one of the endpoints and the other line.  Seems
			// obvious, but what is the mathematical proof?

			return Math.min(
				Geometry.pointToLineDistanceSquared( line1.start, line2 ),
				Geometry.pointToLineDistanceSquared( line1.end, line2 ),
				Geometry.pointToLineDistanceSquared( line2.start, line1 ),
				Geometry.pointToLineDistanceSquared( line2.end, line1 )
			);

		}

	}

	static pushFunctionLine( line1, r1, r2 ) {

		if ( line1.start === line1.end ) {

			return Geometry.pushFunctionLine( line1.start, r1, r2 );

		}

		let sigma = r1 + r2;
		let sigmaSquared = sigma * sigma;

		let pushAway = Geometry.pushAwayFunction( sigmaSquared );

		return function ( line2 ) {

			if ( Geometry.lineDistanceSquared( line1, line2 ) >
				 2.5 * sigmaSquared ) {

				// if it's far enough away, we don't want to bother
				// with computing the push, but will there be
				// differentiability problems?

				return 0;

			}

			let start = line2.start;
			let delta = new Vector3().subVectors( line2.end, start );
			let u = new Vector3();
			let v = new Vector3();

			function coeff( t ) {

				u.copy( delta );
				u.multiplyScalar( t );
				v.addvectors( start, u );
				let dSquared = Geometry.pointToLineDistanceSquared( v, line1 );
				return pushAway( dSquared );

			}

			// this will integrate the push over all of line2
			let sol = numeric.dopri( 0, 1, coeff );

			return sol.y[ sol.y.length - 1 ];

		};

	}

	static pushFunctionPoint( pt, r1, r2 ) {

		let sigma = r1 + r2;
		let sigmaSquared = sigma * sigma;

		let pushAway = Geometry.pushAwayFunction( sigmaSquared );

		return function ( line2 ) {

			if ( Geometry.pointToLineDistanceSquared( pt, line2 ) >
				 2.5 * sigmaSquared ) {

				// if it's far enough away, we don't want to bother
				// with computing the push, but will there be
				// differentiability problems?

				return 0;

			}

			let start = line2.start;
			let delta = new Vector3().subVectors( line2.end, start );
			let u = new Vector3();
			let v = new Vector3();

			function coeff( t ) {

				u.copy( delta );
				u.multiplyScalar( t );
				v.addvectors( start, u );

				let dSquared = pt.distanceTo( v );

				return pushAway( dSquared );

			}

			// this will integrate the push over all of line2
			let sol = numeric.dopri( 0, 1, coeff );

			return sol.y[ sol.y.length - 1 ];

		};

	}

}

export default Geometry;
