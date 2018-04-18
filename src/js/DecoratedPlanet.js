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
	Color,
	DoubleSide,
	FrontSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	//MeshPhongMaterial,
	RingBufferGeometry,
	SphereBufferGeometry,
	Spherical,
	TextureLoader,
	Vector3,
} from 'three';

import { bvToColor } from './DecoratedStar.js';
import { ssettings } from './SSettings.js';
import { time } from './SettingsControl.js';
import Viewer from './Viewer.js';
import Utils from './Utils.js';
const sind = Utils.sind;
const cosd = Utils.cosd;
const acosd = Utils.acosd;
const roundTo2 = Utils.roundTo2;

import { unit } from './Star.js';

import {
	Planet,
	planetInfo,
	j2000obliquity,
	earth_moon,
	julianCenturiesSinceJ2000,
} from './Planet.js';

const tmp = new Vector3();
const tmp2 = new Vector3();
const stmp = new Spherical();
const planetGeom = new SphereBufferGeometry( 1, 180, 180 );

class DecoratedPlanet {

	/**
	 *  Is there a better way to get camera for position?
	 */
	constructor( properties, parent ) {

		this.planet = new Planet( properties );
		this.name = this.planet.getName();

		let material;

		if ( this.name === 'Sun' ) {

			material = new MeshBasicMaterial( {
				side: FrontSide,
			} );

		// } else if ( textures[ this.name ] && textures[ this.name ].normal ) {

		// 	material = new MeshPhongMaterial( {
		// 		side: FrontSide,
		// 		emissive: 0x010101,
		// 		emissiveIntensity: 0.1,
		// 		shininess: 0,
		// 		reflectivity: 0,
		// 	} );


		} else if ( this.name === 'Moon' ) {

			material = new MeshLambertMaterial( {
				side: FrontSide,
				emissive: 0x010101,
				emissiveIntensity: 0.1,
			} );

		} else {

			material = new MeshLambertMaterial( {
				side: FrontSide,
			} );

		}

		this.mesh = new Mesh( planetGeom, material );
		switch ( this.name ) {

		case 'Earth':
		case 'Saturn':
		case 'Moon':
			//this.mesh.castShadow = true;
			//this.mesh.receiveShadow = true;
			break;

		default:
			break;

		}
		this.mesh.planet = this;
		this.group = new Group(); //    rotation group
		this.posGroup = this.group;//new Group(); // position group
		//this.posGroup.add( this.group );
		this.group.add( this.mesh );

		if ( this.planet.rings ) {

			this.ringMesh = this.createRingMesh();
			this.posGroup.add( this.ringMesh );

		}
		this.spherical = new Spherical();

		this.updateColor();
		this.updateRadius();

		this.tryLoadTexture();

		if ( parent ) {

			this.setParent( parent );

		}

	}

	computeOrbitalPole( unixtime, sph ) {

		unixtime = unixtime === undefined ? time.getTime() : unixtime;

		let planet = this.planet;
		if ( this === planets.moon || this === planets.earth || this === planets.sun ) {

			// can't compute for earth and moon, so use the barycenter
			planet = earth_moon;

		}

		sph = sph || new Spherical();

		let T = julianCenturiesSinceJ2000( unixtime );

		// RAAN
		let oMega = planet.oMega_0 + planet.oMega_dot * T;

		// Inclination
		let i = planet.i_0 + planet.i_dot * T;

		// Ascending node
		stmp.set( 1, Math.PI / 2, Utils.radians( oMega ) - Math.PI / 2 );
		tmp.setFromSpherical( stmp );

		tmp2.copy( Utils.yaxis );
		tmp2.applyAxisAngle( tmp, - Utils.radians( i ) );
		this.posGroup.parent.localToWorld( tmp2 );
		sph.setFromVector3( tmp2 );

		return sph;

	}

	getName() {

		return this.name;

	}


	setParent( parent ) {

		if ( this.posGroup.parent ) {

			this.posGroup.parent.remove( this.posGroup );

		}

		parent.add( this.posGroup );
		parent.updateMatrixWorld();

		if ( this.planet.celestialPole ) {

			// I don't know why we need the Math.PI/2 for RA, since we
			// don't need it for data string, below, but we need it to
			// get the Moon's celestial pole in the right place.
			this.northPole = new Spherical();

			// Compute quaternion that will rotate the group so that
			// local y-axis moves to local north pole.
			this.northPole.set(
				1.0,
				Math.PI / 2 - Utils.radians( this.planet.celestialPole.decl ),
				Utils.radians( this.planet.celestialPole.ra ) + Math.PI / 2
			);
			tmp.setFromSpherical( this.northPole );
			parent.worldToLocal( tmp );

			// rotate group so y-axis points to celestial north pole
			// no need to clone since getWorldQuaternion() creates a new quaternion.
			this.q = Utils.getQuaternion( Utils.origin, Utils.yaxis, tmp );

			stmp.setFromVector3( parent.localToWorld( Utils.yaxis.clone().applyQuaternion( this.q ) ) );

		}

		//this.updatePositionAndRotation();

	}

	updateColor() {

		let color;

		switch ( this.name ) {

		case 'Sun':

			// always use color level 5 for sun because it doesn't refresh with stars
			color = bvToColor( 0.656, 5 );
			break;

			//case 'Moon':
			//case 'Earth':
			//	break;
			// 	// Earth here should be "home planet", or maybe we should
			// 	// *add* the home planet.  Using own color should mean
			// 	// using a texture if there is one.
			// 	color = this.color;
			// 	break;

		default:

			let colorType = ssettings.get( 'planets', 'planetcolor' );
			switch ( colorType ) {

			case 'green':
				this.mesh.material.map = null;
				this.mesh.material.needsUpdate = true;
				color = 0x00ff00;
				break;

			case 'blue':
				this.mesh.material.map = null;
				this.mesh.material.needsUpdate = true;
				color = 0x1010ff;
				break;

			case 'white':
				this.mesh.material.map = null;
				this.mesh.material.needsUpdate = true;
				color = 0xffffff;
				break;

			case 'natural':
				if ( this.textureOrOwnColor() ) return; // successfully set texture
				// no texture
				color = this.color;
				break;

			}

		}

		this.mesh.material.color = new Color( color );

	}

	textureOrOwnColor() {

		if ( this.textureData ) {

			if ( ! this.mesh.material.texture ) {

				this.mesh.material.map = this.textureData.texture;
				if ( this.textureData.normal ) {

					this.mesh.material.normalMap = this.textureData.normal;

				}
				this.mesh.material.needsUpdate = true;
				this.mesh.rotation.y = Utils.radians( this.textureData.rotationDegrees );
				this.mesh.material.color = null;

			}

			return true;

		}

		return false;

	}

	updateRadius() {

		this.radius = this.planet.radius * unit;
		this.eqRadius = this.planet.eqRadius * unit;
		this.polarRadius = this.planet.polarRadius * unit;
		let startRadius = this.eqRadius;

		// home planet does not get magnified.
		if ( this !== Viewer.getViewer().homePlanet ) {

			switch ( this.name ) {

			case 'Sun':
				this.radius *= ssettings.get( 'planets', 'sunmoonmag' );
				this.eqRadius *= ssettings.get( 'planets', 'sunmoonmag' );
				this.polarRadius *= ssettings.get( 'planets', 'sunmoonmag' );
				break;

			case 'Moon':
				if ( Viewer.getViewer().homePlanet &&
					 Viewer.getViewer().homePlanet.name === 'Earth' ) {

					this.radius *= ssettings.get( 'planets', 'sunmoonmag' );
					this.eqRadius *= ssettings.get( 'planets', 'sunmoonmag' );
					this.polarRadius *= ssettings.get( 'planets', 'sunmoonmag' );

				} else {

					this.radius *= ssettings.get( 'planets', 'planetmag' );
					this.eqRadius *= ssettings.get( 'planets', 'planetmag' );
					this.polarRadius *= ssettings.get( 'planets', 'planetmag' );

				}
				break;

			case 'Earth':
				if ( Viewer.getViewer().homePlanet &&
					 Viewer.getViewer().homePlanet.name === 'Moon' ) {

					this.radius *= ssettings.get( 'planets', 'sunmoonmag' );
					this.eqRadius *= ssettings.get( 'planets', 'sunmoonmag' );
					this.polarRadius *= ssettings.get( 'planets', 'sunmoonmag' );

				} else {

					this.radius *= ssettings.get( 'planets', 'planetmag' );
					this.eqRadius *= ssettings.get( 'planets', 'planetmag' );
					this.polarRadius *= ssettings.get( 'planets', 'planetmag' );

				}
				break;

			default:

				this.radius *= ssettings.get( 'planets', 'planetmag' );
				this.eqRadius *= ssettings.get( 'planets', 'planetmag' );
				this.polarRadius *= ssettings.get( 'planets', 'planetmag' );

			}

		}



		// I thought of scaling the group instead of the mesh, but
		// then the camera does not see the stars.
		this.mesh.scale.set( this.eqRadius, this.polarRadius, this.eqRadius );

		if ( this.ringMesh ) {

			this.ringMesh.scale.set(
				this.eqRadius / startRadius,
				this.eqRadius / startRadius,
				this.eqRadius / startRadius
			);

		}

	}

	updatePositionAndRotation( unixtime ) {

		// rotation
		let rotation = Utils.radians( this.planet.getRotationDegrees( unixtime ) );
		this.group.setRotationFromAxisAngle( Utils.yaxis,
											 rotation );

		if ( this.q ) {

			this.group.quaternion.premultiply( this.q );

		}

		// position
		this.planet.getPosition( unixtime, tmp );
		this.posGroup.position.set( tmp.x, tmp.z, - tmp.y );
		this.posGroup.position.multiplyScalar( unit );

	}

	static updatePlanetPositionsAndRotations( unixtime ) {

		for ( let planetName in planets ) {

			if ( planets.hasOwnProperty( planetName ) ) {

				planets[ planetName ].updatePositionAndRotation( unixtime );

			}

		}

	}

	static updatePlanetRadii() {

		for ( let planetName in planets ) {

			if ( planets.hasOwnProperty( planetName ) ) {

				planets[ planetName ].updateRadius();

			}

		}

	}

	static updatePlanetColors() {

		for ( let planetName in planets ) {

			if ( planets.hasOwnProperty( planetName ) ) {

				planets[ planetName ].updateColor();

			}

		}

	}

	static setPlanetParent( group ) {

		for ( let planetName in planets ) {

			if ( planets.hasOwnProperty( planetName ) ) {

				planets[ planetName ].setParent( group );

			}

		}

	}

	getPosition( pos ) {

		pos = pos || new Vector3();
		pos.copy( this.group.position );
		return pos;

	}

	/**
	 *  Return a data string showing name, RA, declination, and
	 *  distance of this planet from <code>fromPosition</code>, which
	 *  is probably the location of the camera.
	 *
	 *  @param fromPosition Position from which to measure RA,
	 *  declination, and distance, in <i>Solar System-local</i>
	 *  coordinates.
	 */
	getDataString( unixtime, fromPosition ) {

		// home planet
		if ( this === Viewer.getViewer().homePlanet ) {

			return this.name;

		}

		this.updatePositionAndRotation( unixtime );
		tmp.subVectors( this.posGroup.position, fromPosition );

		// We have to undo the permutation of coordinates we did above
		// for mesh position, but I don't quite understand why the signs
		// are as they are.
		let xeq = tmp.x;
		let yeq = - cosd( j2000obliquity ) * tmp.z - sind( j2000obliquity ) * tmp.y;
		let zeq = - sind( j2000obliquity ) * tmp.z + cosd( j2000obliquity ) * tmp.y;
		tmp.y = yeq;
		tmp.z = zeq;

		let distance = tmp.length();
		let ra = acosd( xeq / Math.sqrt( xeq * xeq + yeq * yeq ) );
		if ( yeq < 0 ) ra *= - 1;
		if ( ra < 0 ) ra += 360;
		let decl = 90 - acosd( zeq / tmp.length() );


		return this.name + '; RA: ' + roundTo2( ra ) + '&deg;, D: ' + roundTo2( decl ) +
			'&deg;, dist. ' + roundTo2( distance / unit ) + ' AU';

	}

	/**
	 *  A rough distance from where we are, for computing label sizes.
	 */
	distance() {

		this.posGroup.position.distanceTo( Viewer.getViewer().homePlanet.posGroup.position );

	}

	tryLoadTexture() {

		const textureRecord = textures[ this.name ];
		if ( textureRecord ) {

			const loader = new TextureLoader();
			const self = this;
			loader.load(
				textureRecord.path,

				// onload
				function ( texture ) {

					self.textureData = { texture: texture,
										 rotationDegrees: textureRecord.rotationDegrees };
					self.updateColor();


					if ( textureRecord.normal ) {

						console.log( 'try loading normal map' );
						loader.load( textureRecord.normal,
									 function ( normalMap ) {

										 console.log( 'loaded normal map' );
										 self.textureData.normal = normalMap;
										 self.updateColor();

									 },
									 function ( progress ) {

										 console.log( 'Loading for ' + self.name +
													  ', total ' + progress.total +
													  ', loaded ' + progress.total );

									 },
									 // onerror
									 function ( error ) {

										 console.log( 'error loading ' +
													  textureRecord.normal + ': ' +
													  JSON.stringify( error ) );

									 }

								   );

					}

				},

				// onprogress
				function ( progress ) {

					console.log( 'Loading for ' + self.name +
								 ', total ' + progress.total +
								 ', loaded ' + progress.total );

				},

				// onerror
				function ( error ) {

					console.log( 'error ' + JSON.stringify( error ) );

				}
			);

		}
		return !! textureRecord;

	}

	createRingMesh() {

		const ringGeom = new RingBufferGeometry(
			this.planet.rings.innerRadius * unit,
			this.planet.rings.outerRadius * unit,
			180, 1
		);

		var uvs = ringGeom.attributes.uv.array;

		// loop and initialization taken from RingBufferGeometry
		var phiSegments = ringGeom.parameters.phiSegments || 8;
		var thetaSegments = ringGeom.parameters.thetaSegments || 8;

		for ( var c = 0, j = 0; j <= phiSegments; j ++ ) {

			for ( var i = 0; i <= thetaSegments; i ++ ) {

				uvs[ c ++ ] = i / thetaSegments,
				uvs[ c ++ ] = j / phiSegments;

			}

		}

		const material = this.createRingMaterial();

		const mesh = new Mesh( ringGeom, material );
		//mesh.castShadow = true;
		//mesh.receiveShadow = true;
		mesh.rotation.x = Math.PI / 2;

		return mesh;

	}

	createRingMaterial() {

		const material = new MeshLambertMaterial( {
			side: DoubleSide,
			transparent: true,
			opacity: 1.0,
		} );

		const loader = new TextureLoader();
		const rings = textures[ this.name ].rings;

		material.map = loader.load( rings.map );
		material.alphaMap = loader.load( rings.alphaMap );
		// 	function ( texture ) {

		// 		material.map = texture;

		// 		loader.load(
		// 			rings.alphaMap,
		// 			function ( alpha ) {

		// 				material.alphaMap = alpha;
		// 				material.needsUpdate = true;

		// 			}
		// 		);

		// 	}

		// );

		return material;

	}

	getShortName() {

		return this.name;

	}

}


var textures = {
	'Mercury': { path: 'images/mercurymap.jpg', rotationDegrees: 0 },
	// no suitable image of venus clouds
	'Earth': { path: 'images/land_ocean_ice_cloud_2048.jpg',
			   rotationDegrees: 0 },
	'Moon': { path: 'images/moon_color.jpg', rotationDegrees: 180 },
	'Mars': { path: 'images/mars_1k_color.jpg',
			  normal: 'images/mars_1k_normal.jpg',
			  rotationDegrees: 0 },
	'Jupiter': { path: 'images/jupiter2_4k.jpg', rotationDegrees: 0 },
	'Saturn': {
		path: 'images/saturnmap.jpg', rotationDegrees: 0,
		rings: {
			map: 'images/saturnringcolor.jpg',
			alphaMap: 'images/saturnringpattern.gif'
		},
	},
	'Uranus': {
		path: 'images/uranusmap.jpg', rotationDegrees: 0,
		rings: {
			map: 'images/uranusringcolour.jpg',
			alphaMap: 'images/uranusringtrans.gif'
		},
	},
	'Neptune': { path: 'images/neptunemap.jpg', rotationDegrees: 0 },
};

const planets = {};
const planetMeshes = [];

DecoratedPlanet.init = function ( parent ) {

	planets.mercury = new DecoratedPlanet( planetInfo.mercury, parent );
	planets.venus = new DecoratedPlanet( planetInfo.venus, parent );
	planets.earth = new DecoratedPlanet( planetInfo.earth, parent );
	planets.mars = new DecoratedPlanet( planetInfo.mars, parent );
	planets.jupiter = new DecoratedPlanet( planetInfo.jupiter, parent );
	planets.saturn = new DecoratedPlanet( planetInfo.saturn, parent );
	planets.uranus = new DecoratedPlanet( planetInfo.uranus, parent );
	planets.neptune = new DecoratedPlanet( planetInfo.neptune, parent );
	planets.sun = new DecoratedPlanet( planetInfo.sun, parent );
	planets.moon = new DecoratedPlanet( planetInfo.moon, parent );

	planetMeshes.push( planets.sun.mesh );
	planetMeshes.push( planets.mercury.mesh );
	planetMeshes.push( planets.venus.mesh );
	planetMeshes.push( planets.earth.mesh );
	planetMeshes.push( planets.mars.mesh );
	planetMeshes.push( planets.jupiter.mesh );
	planetMeshes.push( planets.saturn.mesh );
	planetMeshes.push( planets.uranus.mesh );
	planetMeshes.push( planets.neptune.mesh );
	planetMeshes.push( planets.moon.mesh );

};


export default DecoratedPlanet;
export {
	j2000obliquity,
	planets,
	planetMeshes,
};
