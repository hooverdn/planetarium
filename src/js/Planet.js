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
import Utils from './Utils.js';
import { moonElements } from './MoonRealOrbit.js';

const sind = Utils.sind;
const cosd = Utils.cosd;
const degrees = Utils.degrees;

let earth;
let moon;

// Determine offsets of sky given latitude, longitude date-time.
// We should be adjusting the north pole for precession.

// Everything here should be in "mathematical" coordinates - x = to right,
// y = horizontally away, z = up.

var secsPerDay = 24 * 60 * 60;
var millisPerDay = secsPerDay * 1000;
var j2000 = new Date( '2000-01-01T11:58:55.816Z' ); // = 12:00:00.000 TDT
var j2000_millis = j2000.getTime();
// Astronomical Unit in KM.
var AU = 149597870.700;

// degrees
var j2000obliquity = 23.43928;

// possibly we should start J2000 on Jan 0 at 00:00:00.000 for this
// one instead of 11:58 on Jan 1.
var julianCenturiesSinceJ2000 = function ( unixtime ) {

	var millisSinceJ2000 = unixtime - j2000_millis;

	var nj = millisSinceJ2000 / millisPerDay;

	// Julian centuries since Jan. 1, 2000 - Julian year = 365.25 days.
	return nj / 36525;

};


let tmp = new Vector3();

class Planet {

	constructor( planetInfoItem	) {

		Object.assign( this, planetInfoItem );
		this.radius = this.diamKM / ( 2 * AU );
		this.eqRadius /= AU;
		this.polarRadius /= AU;
		if ( this.rings ) {

			this.rings.innerRadius /= AU;
			this.rings.outerRadius /= AU;

		}
		this.ecl = new Vector3();

		// Special cases - moon orbit is relative to earth and earth is
		// computed from moon and earth_moon barycenter.
		if ( this.name === 'Moon' ) {

			moon = this;

			// Moon kepler elems are relative to earth
			moon.keplerEclipticCoords = moon_keplerEclipticCoords;
			moon.getPosition = moon_getPosition;

		} else if ( this.name === 'Earth' ) {

			earth = this;
			earth.keplerEclipticCoords = earth_keplerEclipticCoords;

		}

	}

	getName() {

		return this.name;

	}

	getShortName() {

		return this.name;

	}

	getLongName() {

		return this.name;

	}

	solveKeplerEquation( M, e ) {

		// solve M = E - degrees(e) * sind(E)) for E, iteratively
		var e_deg = degrees( e );
		var E = M + e_deg * sind( M );

		// Avoid infinite loop on failure to converge - helps if
		// called with invalid elements.
		for ( let idx = 0; idx < 100; idx ++ ) {

			var dM = M - ( E - e_deg * sind( E ) );
			// paper has just e in the next, but that must be wrong
			var dE = dM / ( 1 - e * cosd( E ) );
			E += dE;
			if ( Math.abs( dE ) < Planet.kepler_eq_tol ) {

				break;

			}

		}

		return E;

	}


	keplerEclipticCoords( unixtime, T ) {

		T = T || julianCenturiesSinceJ2000( unixtime );

		var a = this.a_0 + this.a_dot * T;
		var e = this.e_0 + this.e_dot * T;
		var i = this.i_0 + this.i_dot * T;
		var l = this.l_0 + this.l_dot * T;
		var obar = this.obar_0 + this.obar_dot * T;
		var oMega = this.oMega_0 + this.oMega_dot * T;

		var omega = obar - oMega;
		var M = l - obar;
		if ( this.b ) {

			M += this.b * T * T + this.c * cosd( this.f * T ) + this.s * sind( this.f * T );

		}
		M %= 360;
		M = M <= - 180 ? M + 360 : M;
		M = M > 180 ? M - 360 : M;

		// sind and cosd take degrees, which I think is intended.
		var E = this.solveKeplerEquation( M, e );

		var xpr = a * ( cosd( E ) - e );
		var ypr = a * Math.sqrt( 1 - e * e ) * sind( E );

		// coords in J2000 ecliptic plane, x-axis pointing to spring equinox
		var xecl =
			( cosd( omega ) * cosd( oMega ) - sind( omega ) * sind( oMega ) * cosd( i ) ) * xpr +
			( - sind( omega ) * cosd( oMega ) - cosd( omega ) * sind( oMega ) * cosd( i ) ) * ypr;

		var yecl =
			( cosd( omega ) * sind( oMega ) + sind( omega ) * cosd( oMega ) * cosd( i ) ) * xpr +
			( - sind( omega ) * sind( oMega ) + cosd( omega ) * cosd( oMega ) * cosd( i ) ) * ypr;

		var zecl = sind( omega ) * sind( i ) * xpr + cosd( omega ) * sind( i ) * ypr;
		this.ecl.set( xecl, yecl, zecl );

	}

	getPosition( unixtime, pos ) {

		this.keplerEclipticCoords( unixtime );

		if ( pos ) {

			pos.copy( this.ecl );

		} else {

			pos = this.ecl.clone();

		}
		return pos;

	}

	getRotationDegrees( unixtime ) {

		if ( this.rotationRate ) {

			var millisSinceJ2000 = unixtime - j2000_millis;

			var nj = millisSinceJ2000 / millisPerDay;
			var gmstHours = 24.06570982441908 * nj;

			return ( gmstHours * this.rotationRate + this.rotationAtJ2000 ) % 360;

		}

		return 0;

	}

}

Planet.kepler_eq_tol = 0.000001;


// Planets:
// a in astronomical units = mean distance ctr earth to ctr sun
// Should avg of color components = albedo?
// Orbital poles from https://en.wikipedia.org/wiki/Orbital_pole

const planetInfo = {
	mercury: {
		name: 'Mercury',
		diamKM: 4879, // diam in km
		polarRadius: 2439.7, // km
		eqRadius: 2439.7, // km
		color: 0x635e58, // color in hex; albedo 0.06
		// orbital elements
		a_0: 0.38709927, a_dot: 0.00000037, // a
		e_0: 0.20563593, e_dot: 0.00001906, // e
		i_0: 7.00497902, i_dot: - 0.00594749, // I
		l_0: 252.25032350, l_dot: 149472.67411175, // L
		obar_0: 77.45779628, obar_dot: 0.16047689, // omega_bar
		oMega_0: 48.33076593, oMega_dot: - 0.12534081, // Omega
		// rotation
		celestialPole: { ra: 281.01, decl: 61.41 },
		rotationRate: 360 / 1407.6,
		rotationAtJ2000: 0,
	},
	venus: {
		name: 'Venus',
		diamKM: 12104, // diam in km
		polarRadius: 6051.8,
		eqRadius: 6051.8,
		color: 0xf9d77d, // color in hex; albedo 0.75
		a_0: 0.72333566, a_dot: 0.00000390, // a
		e_0: 0.00677672, e_dot: - 0.00004107, // e
		i_0: 3.39467605, i_dot: - 0.00078890, // I
		l_0: 181.97909950, l_dot: 58517.81538729, // L
		obar_0: 131.60246718, obar_dot: 0.00268329, // omega_bar149597870.700
		oMega_0: 76.67984255, oMega_dot: - 0.27769418, // Omega
		// rotation
		celestialPole: { ra: 272.76, decl: 67.16 },
		rotationRate: - 360 / 5832.5,
		rotationAtJ2000: 0,
	},
	earth: {
		name: 'Earth',
		diamKM: 12756, // diameter in km
		polarRadius: 6356.752,
		eqRadius: 6378.137,
		color: 0x151d65, //0x6b7084,               color in hex; est. albedo 0.30
		// orbital elements undefined
		// rotation
		celestialPole: { ra: 0, decl: 90 }, //     celestial north pole, degrees
		rotationRate: 15, //                       degrees per earth hour
		// initial rotation at epoch
		rotationAtJ2000: 18.697374558 * 15 - 0.2682,
	},
	mars: {
		name: 'Mars',
		polarRadius: 3376.2,
		eqRadius: 3396.2,
		diamKM: 6792, // diameter in km
		color: 0x795b34, // color in hex, albedo 0.12
		a_0: 1.52371034, a_dot: 0.00001847, // a
		e_0: 0.09339410, e_dot: 0.00007882, // e
		i_0: 1.84969142, i_dot: - 0.00813131, // I
		l_0: - 4.55343205, l_dot: 19140.30268499, // L
		obar_0: - 23.94362959, obar_dot: 0.44441088, // omega_bar
		oMega_0: 49.55953891, oMega_dot: - 0.29257343, // Omega
		// rotation
		celestialPole: { ra: 317.68, decl: 52.89 },
		rotationRate: 360 / 24.6,
		rotationAtJ2000: 0,
	},

	// Don't need extra fields for now, since
	// we are just using Table 2, valid 1800-2050.
	jupiter: {
		name: 'Jupiter',
		diamKM: 142984, // diameter in km
		polarRadius: 66854,
		eqRadius: 71492,
		color: 0xc84b90, // color in hex, albedo 0.52
		a_0: 5.20288700, a_dot: - 0.00011607, // a
		e_0: 0.04838624, e_dot: - 0.00013253, // e
		i_0: 1.30439695, i_dot: - 0.00183714, // I
		l_0: 34.39644051, l_dot: 3034.74612775, // L
		obar_0: 14.72847983, obar_dot: 0.21252668, // omega_bar
		oMega_0: 100.47390909, oMega_dot: 0.20469106, // Omega
		b: - 0.00012452, // b
		c: 0.06064060, // c
		s: - 0.35635438, // s
		f: 38.35125000, // f
		// rotation
		celestialPole: { ra: 268.06, decl: 64.50 },
		rotationRate: 360 / 9.9,
		rotationAtJ2000: 0,
	},
	saturn: {
		name: 'Saturn',
		diamKM: 120536, // diameter in km
		polarRadius: 54364,
		eqRadius: 60268,
		color: 0xb89f76, // color in hex; albedo 0.47
		a_0: 9.53667594, a_dot: - 0.00125060, // a
		e_0: 0.05386179, e_dot: - 0.00050991, // e
		i_0: 2.48599187, i_dot: 0.00193609, // I
		l_0: 49.95424423, l_dot: 1222.49362201, // L
		obar_0: 92.59887831, obar_dot: - 0.41897216, // omega_bar
		oMega_0: 113.66242448, oMega_dot: - 0.28867794, // Omega
		// rotation
		celestialPole: { ra: 40.60, decl: 83.54 },
		rotationRate: 360 / 10.7,
		rotationAtJ2000: 0,
		rings: { innerRadius: 74500, outerRadius: 136780 /* A-ring */}, // in KM
	},
	uranus: {
		name: 'Uranus',
		diamKM: 50724, // volumetric mean diameter in km
		polarRadius: 24973,
		eqRadius: 25559,
		color: 0x0087d5, // from http://maps.jpl.nasa.gov/uranus.html
		a_0: 19.18916464, a_dot: - 0.00196176, // a
		e_0: 0.04725744, e_dot: 0.00004397, // e
		i_0: 0.77263783, i_dot: - 0.00242939, // I
		l_0: 313.23810451, l_dot: 428.48202785, // L
		obar_0: 170.95427630, obar_dot: 0.40805281, // omega_bar
		oMega_0: 74.01692503, oMega_dot: 0.04240589, // Omega
		// rotation
		celestialPole: { ra: 257.31, decl: - 15.18 },
		rotationRate: - 360 / 17.2,
		rotationAtJ2000: 0,
		rings: { innerRadius: 26800, outerRadius: 51207 }, // epsilon
		// ring + avg(?) width//97700 }, // in KM
	},
	neptune: {
		name: 'Neptune',
		diamKM: 49266, // volumetric mean diameter in km
		polarRadius: 24341,
		eqRadius: 24764,
		color: 0x2fa0ff,
		a_0: 30.06992276, a_dot: 0.00026291, // a
		e_0: 0.00859048, e_dot: 0.00005105, // e
		i_0: 1.77004347, i_dot: 0.00035372, // I
		l_0: - 55.12002969, l_dot: 218.45945325, // L
		obar_0: 44.96476227, obar_dot: - 0.32241464, // omega_bar
		oMega_0: 131.78422574, oMega_dot: - 0.00508664, // Omega
		// rotation
		celestialPole: { ra: 299.36, decl: 43.46 },
		rotationRate: 360 / 16.1,
		rotationAtJ2000: 0,
	},
	sun: {
		name: 'Sun',
		diamKM: 1391400,
		polarRadius: 695700,
		eqRadius: 695700,
		color: 0xffff00,
		a_0: 0.0, a_dot: 0.0, // a
		e_0: 0.0, e_dot: 0.0, // e
		i_0: 0.0, i_dot: 0.0, // I
		l_0: 0.0, l_dot: 0.0, // L
		obar_0: 0.0, obar_dot: 0.0, // omega_bar - long. of perihelion
		oMega_0: 0.0, oMega_dot: 0.0, // Omega - long of ascending node
		b_v: 0.656,
		luminosity: 382.8e24, // Joules/sec. = watts
		celestialPole: { ra: 286.13, decl: 63.87 },
		rotationRate: 360 / ( 25.05 * 24 ),
		rotationAtJ2000: 0,

	},
	moon: {
		name: 'Moon',
		diamKM: 3474,
		polarRadius: 1736.0,
		eqRadius: 1738.1,
		color: 0x251e25,
		// rotation
		celestialPole: { ra: 270, decl: 66 + 33 / 60 + 33.55 / 3600 },
		// added empirical correction term because I can't get actual
		// synchronous rotation to work
		rotationRate: 360 / 655.719864 - 360 / ( 28 * 365.2425 * 24 ),
		rotationAtJ2000: 210,
	},

};

// Used internally to compute coords of earth and moon.
let earth_moon = new Planet( {
	name: 'Earth-Moon Barycenter',
	diamKM: 12756, // diameter in km
	color: 0x6b7084, // color in hex; est. albedo 0.30
	a_0: 1.00000261, a_dot: 0.00000562, // a
	e_0: 0.01671123, e_dot: - 0.00004392, // e
	i_0: - 0.00001531, i_dot: - 0.01294668, // I
	l_0: 100.46457166, l_dot: 35999.37244981, // L
	obar_0: 102.93768193, obar_dot: 0.32327364, // omega_bar
	oMega_0: 0.0, oMega_dot: 0.0 // Omega
} );


function moon_keplerEclipticCoords( unixtime, T ) {

	T = T || julianCenturiesSinceJ2000( unixtime );

	var elements = moonElements( T );

	var a = elements.a;
	var e = elements.e;
	var oMega = elements.o;
	var omega = elements.w;
	var i = elements.i;
	var M = elements.M;
	M = M <= - 180 ? M + 360 : M;
	M = M > 180 ? M - 360 : M;

	var E = this.solveKeplerEquation( M, e );

	// coords in own ecliptic plane
	var xpr = a * ( cosd( E ) - e );
	var ypr = a * Math.sqrt( 1 - e * e ) * sind( E );

	// coords in J2000 earth ecliptic plane, x-axis pointing to spring equinox
	var xecl =
        ( cosd( omega ) * cosd( oMega ) - sind( omega ) * sind( oMega ) * cosd( i ) ) * xpr +
        ( - sind( omega ) * cosd( oMega ) - cosd( omega ) * sind( oMega ) * cosd( i ) ) * ypr;

	var yecl =
        ( cosd( omega ) * sind( oMega ) + sind( omega ) * cosd( oMega ) * cosd( i ) ) * xpr +
        ( - sind( omega ) * sind( oMega ) + cosd( omega ) * cosd( oMega ) * cosd( i ) ) * ypr;

	var zecl = sind( omega ) * sind( i ) * xpr + cosd( omega ) * sind( i ) * ypr;
	this.ecl.set( xecl / ( AU * 1000 ), yecl / ( AU * 1000 ), zecl / ( AU * 1000 ) );

}

function earth_keplerEclipticCoords( unixtime, T ) {

	earth_moon.keplerEclipticCoords( unixtime, T );
	moon.keplerEclipticCoords( unixtime, T );

	this.ecl.copy( earth_moon.ecl );
	tmp.copy( moon.ecl );
	this.ecl.sub( tmp.multiplyScalar( 0.0123 ) );

}


// moon.ecl is relative to earth, but getPosition returns ecl relative
// to Sun.
function moon_getPosition( unixtime, pos ) {

	earth.keplerEclipticCoords( unixtime ); // also computes our keplerEclipticCoords
	if ( pos ) {

		pos.copy( this.ecl );

	} else {

		pos = this.ecl.clone();

	}

	pos.add( earth.ecl );
	return pos;

}


export {
	Planet,
	planetInfo,
	j2000obliquity,
	earth_moon,
	julianCenturiesSinceJ2000,
};
