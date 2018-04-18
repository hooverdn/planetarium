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

import * as THREE from 'three';
import { webgl, getWebGLErrorMessage } from 'Detector';
import { ssettings, } from './SSettings.js';
import SettingsControl, { time, } from './SettingsControl.js';
import Bands from './Bands.js';
import Viewer from './Viewer.js';

import Utils from './Utils.js';
import DecoratedPlanet, {
	j2000obliquity,
	planetMeshes,
} from './DecoratedPlanet.js';

import { unit, distance } from './Star.js';
import LabeledStar from './LabeledStar';
import ShadowStar from './ShadowStar.js';

import LabelManager from './LabelManager.js';
import { initContextMenu } from './ContextMenu.js';
import Controls from './controls/Controls.js';

const xaxis = Utils.xaxis;

let disablePPointerEvents = false;
let disableMouseEvents = false;

let settingsElem = null;

const pos = new THREE.Vector3();

function isInElem( elem, pageX, pageY ) {

	if ( ! elem ) return false;

	let domRect = elem.getBoundingClientRect();
	return domRect.x <= pageX && pageX <= domRect.x + domRect.width &&
        domRect.y <= pageY && pageY <= domRect.y + domRect.height;

}

let controls = null;
let refreshObj = {};

// once everything is loaded, we run our Three.js stuff.
function init( window, isMobile, isApple ) {

	SettingsControl.initValues( window, isMobile );

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	var scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	//var shellRadius = distance * 1.5;//0003; // + 5 * unit;

	// 45 for mobile so the labels come out a bit bigger without zoom
	var fov = isMobile ? 45 : 60;
	var viewer = Viewer.createViewer(
		fov,
		window.innerWidth / window.innerHeight,
		0.00001,
		1.3 * distance
	);

	// Create a render and set the size.
	// Use logarithmic depth buffer to fix problem of lines in
	// front of stars or sun.
	var renderer = new THREE.WebGLRenderer(
		{ antialias: true, logarithmicDepthBuffer: true }
	);
	renderer.setClearColor( new THREE.Color( 0x000000, 1.0 ), 0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.physicallyCorrectLights = true;
	//renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.BasicShadowMap;

	var group = new THREE.Group();
	group.name = 'group';
	scene.add( group );

	var solarSystem = new THREE.Group();
	solarSystem.name = 'solarSystem';
	group.add( solarSystem );
	//var planetInfoGroup = new THREE.Group();
	//planetInfoGroup.name = 'planetInfoGroup';
	//planetInfoGroup.visible = false;
	//solarSystem.add( planetInfoGroup );
	var pointLight = new THREE.PointLight(
		0xffffff,
		ssettings.get( 'planets', 'sunbrightness' ),
		distance - unit,
		2
	);
	// pointLight.castShadow = true;
	// pointLight.shadow.mapSize.width = 512; // default 512
	// pointLight.shadow.mapSize.height = 512; // default 512
	// pointLight.shadow.camera.near = camera.near;
	// pointLight.shadow.camera.far = camera.far;//500 * unit;
	scene.add( pointLight );
	// var shadowHelper = new THREE.CameraHelper( pointLight.shadow.camera );
	// scene.add( shadowHelper );

	// The solarSystem is in Earth's ecliptic plane because
	// star positions are in Earth equatorial coordinates.
	solarSystem.rotateOnAxis( xaxis, Utils.radians( j2000obliquity ) );

	LabeledStar.initStars( group );
	DecoratedPlanet.init( solarSystem );
	// has to happen after initStars
	ShadowStar.init( viewer.camera );

	var unixtime = time.getTime();
	addPlanets( unixtime );

	let bands = new Bands( group, isMobile );
	bands.setVisible( ssettings.get( 'view', 'lines' ) );

	viewer.setHomePlanet( ssettings.get( 'location', 'planet' ) );
	bands.setPlanet( viewer.homePlanet );

	viewer.setLatLong(
		ssettings.get( 'location', 'latitude' ),
		ssettings.get( 'location', 'longitude' )
	);
	viewer.rotateDegrees(
		ssettings.get( 'view', 'elevation' ),
		ssettings.get( 'view', 'rotation' )
	);
	viewer.setZoom( ssettings.get( 'view', 'zoom' ) );
	viewer.updateProjectionMatrix();

	controls = new Controls( viewer.camera, renderer );

	// add the output of the renderer to the html element
	var webglDiv = document.getElementById( 'WebGL-output' );
	// this helps with iOS
	webglDiv.style.width = '100%';
	webglDiv.style.height = '100%';

	webglDiv.appendChild( renderer.domElement );

	let labelManager = LabelManager.createLabelManager( viewer.camera, renderer );
	labelManager.addConstellationLabels();

	// start with short name labels on mobile
	// this has to be done *after* render.domElement has been added to the page
	if ( isMobile ) labelManager.nextDisplayMode();

	refresh();

	var options1 = { passive: false };
	//var options = { capture: true, passive: false };
	if ( ! disableMouseEvents ) {

		// "options1" is needed for IE.
		document.addEventListener( 'mousedown', onDocumentMouseDown, options1 );
		document.addEventListener( 'mousemove', onDocumentMouseMove, options1 );
		document.addEventListener( 'mouseout', onDocumentMouseOut, options1 );
		// Mac OS X m ay be more likely to get the click event, maybe.
		//document.addEventListener( 'mouseup', onDocumentMouseUp, options1 );
		document.addEventListener( 'click', onDocumentMouseUp, options1 );

	} else {

		document.addEventListener( 'click', function ( ev ) {

			if ( ! disablePPointerEvents ) {

				ev.stopPropagation();
				ev.preventDefault();

			}

		}, options1 );

	}

	document.addEventListener( 'touchstart', onDocumentTouchStart, options1 );
	document.addEventListener( 'touchmove', onDocumentTouchMove, options1 );
	document.addEventListener( 'touchend', onDocumentTouchEnd, options1 );

	window.addEventListener( 'resize', onWindowResize );

	// call the render function
	var refreshTurnedOn = true;
	refreshSeries();


	function addPlanets( unixtime ) {

		refreshPlanets( unixtime );

	}


	function refreshPlanets( unixtime ) {

		unixtime = unixtime || time.getTime();

		// planets
		DecoratedPlanet.updatePlanetPositionsAndRotations( unixtime );

		getPositionInSolarSystem( viewer.camera, pos );
		SettingsControl.setPlanetLocations( unixtime, pos, viewer.homePlanet );

	}

	function redraw() {

		// only remove existing stars on case-by-case basis
		LabeledStar.updateStars( group );
		labelManager.updateDisplay();
		var unixtime = time.getTime();
		redrawPlanets( unixtime );

		viewer.setCameraPosition();

	}

	function getPositionInSolarSystem( obj, local = new THREE.Vector3() ) {

		obj.parent.updateMatrixWorld();
		obj.getWorldPosition( local );
		solarSystem.updateMatrixWorld();
		solarSystem.worldToLocal( local );

		return local;

	}

	function render() {

		renderer.render( scene, viewer.camera );

	}

	function refresh( starLabels, planetLabels ) {

		if ( ! ( isMobile && disablePPointerEvents ) ) {

			var timeNow = time.getTime();
			refreshPlanets( timeNow );
			if ( starLabels ) LabeledStar.updateStars( group );
			labelManager.updateDisplay( starLabels, planetLabels );
			render();

		}

	}
	refreshObj.refresh = refresh;

	function refreshSeries() {

		if ( document.hidden ) {

			refreshTurnedOn = false;

		}

		if ( refreshTurnedOn ) {

			// XXX Restore!!
			var timeNow = time.getTime();
			ssettings.set( 'time', 'timeset', timeNow );
			// setting time will trigger a refresh
			// smaller interval with bigger zoom because so no visible jerk
			setTimeout( refreshSeries, 5000 / viewer.getZoom() );

		}

	}

	document.addEventListener( 'visibilitychange', function ( /* ev */ ) {

		if ( ! document.hidden && ! refreshTurnedOn ) {

			refreshTurnedOn = true;
			refreshSeries();

		} else if ( document.hidden ) {

			refreshTurnedOn = false;

		}

	}, false );

	loadFont();
	// sprites on background don't appear
	// if we load the milky way texture as it stands
	//loadMilkyWayTexture();

	// var shellMesh;
	// function loadMilkyWayTexture() {
	//     // var loader = new THREE.TextureLoader();
	//     // //var image = 'images/2000px-MessierStarChart.svg.png';
	//     // var image = 'images/MilkyWayRev.png';
	//     // var texture = loader.load( image, function (texture) {
	//     //     if (texture) {
	//     //         render();
	//     //     }
	//     // } );

	//     var shellGeom =
	//         new THREE.SphereBufferGeometry(shellRadius, 180, 180);
	//     var shellMaterial =
	//         new THREE.MeshBasicMaterial({
	//             //map: texture,
	//             color: 0x000000,
	//             transparent: true,
	//             opacity: 0.0,
	//             side: THREE.BackSide,
	//         });
	//     shellMesh = new THREE.Mesh(shellGeom, shellMaterial);
	//     shellMesh.rotateOnAxis(yaxis, Math.PI);
	//     scene.add(shellMesh);
	//     cameraControl.shellMesh = shellMesh;

	// }


	function loadFont() {

		var loader = new THREE.FontLoader();
		loader.load(
			'js/three.js/fonts/helvetiker_regular.typeface.json',
			function ( font ) {

				if ( font ) {

					redraw();
					viewer.displayDirectionText( font );
					render();

				}

			}
		);

	}


	function onWindowResize() {

		viewer.onWindowResize();
		renderer.setSize( window.innerWidth, window.innerHeight );

		render();

	}

	var downX = 0;
	var downY = 0;
	function onDocumentMouseDown( event ) {

		if ( disablePPointerEvents || event.button !== 0 ) return;

		if ( event.button == 0 && event.buttons == 1 ) {

			// &&
			//( !contextMenu || !contextMenu.menuOn() ) ) {

			downX = event.clientX;
			downY = event.clientY;

		}

	}


	function onDocumentTouchStart( event ) {

		if ( disablePPointerEvents ) return;
		event.preventDefault();

		var touches = event.changedTouches || event.touches;

		switch ( touches.length ) {

		case 1:
			if ( isInElem( settingsElem, touches[ 0 ].pageX, touches[ 0 ].pageY ) )
				return;

			downX = touches[ 0 ].pageX;
			downY = touches[ 0 ].pageY;

			break;

		default:
			break;

		}

	}

	function onDocumentMouseMove( event ) {

		if ( disablePPointerEvents || event.buttons !== 0 ) return;

		var rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		raycaster.setFromCamera( mouse, viewer.camera );

		let msg = document.getElementById( 'msg' );
		if ( msg === null ) return; // nothing to do

		msg.innerHTML = '';

		var displayed = {};

		var intersections = raycaster.intersectObjects( planetMeshes );
		var unixtime = time.getTime();
		if ( intersections.length > 0 ) {

			getPositionInSolarSystem( viewer.camera, pos );

		}
		for ( var idx = 0; idx < intersections.length; idx ++ ) {

			if ( ! displayed[ intersections[ idx ] ] ) {

				var planet = intersections[ idx ].object.planet;
				var text = planet.getDataString( unixtime, pos );

				if ( msg.innerHTML != '' ) {

					msg.innerHTML += '<br>';

				}
				msg.innerHTML += text;
				// for debugging: + ' ' +  intersections[idx].distance;

				displayed[ intersections[ idx ] ] = true;

			}

		}

		intersections = raycaster.intersectObjects( group.children );

		for ( var idx = 0; idx < intersections.length; idx ++ ) {

			if ( ! displayed[ intersections[ idx ] ] &&
                intersections[ idx ].object.star ) {

				if ( msg.innerHTML != '' ) {

					msg.innerHTML += '<br>';

				}
				msg.innerHTML += intersections[ idx ].object.star.getDataString();
				// for debugging:  + ' ' +  intersections[idx].distance;
				displayed[ intersections[ idx ] ] = true;

				// for debugging:
				// } else {
				//     if (msg.innerHTML != '') {
				//         msg.innerHTML += '<br>';
				//     }
				//     //msg.innerHTML += "other object " + intersections[idx].distance;

			}

		}

		if ( msg.innerHTML != '' ) {

			var msgWidth = msg.offsetWidth + 4;
			var msgHeight = msg.offsetHeight + 4;

			if ( window.innerWidth - ( event.clientX + 0 ) < msgWidth ) {

				msg.style.left = ( window.innerWidth - msgWidth ) + 'px';

			} else {

				msg.style.left = ( event.clientX + 8 ) + 'px';

			}
			if ( event.clientY < msgHeight + 16 ) {

				msg.style.top = ( event.clientY + 16 ) + 'px';

			} else {

				msg.style.top = ( event.clientY - 16 - msgHeight ) + 'px';

			}
			msg.style.opacity = 0.8;
			msg.style.display = '';

		} else {

			msg.style.display = 'none';

		}

	}

	function onDocumentMouseOut() {

		let msg = document.getElementById( 'msg' );
		if ( msg === null ) return;
		msg.style.display = 'none';

	}

	function onDocumentMouseUp( event ) {

		if ( disablePPointerEvents || event.button !== 0 ) return;
		mouseUp( event, event.clientX, event.clientY );

	}

	function onDocumentTouchMove( ev ) {

		if ( disablePPointerEvents ) return;

		var touches = ev.changedTouches || ev.touches;

		if ( touches.length === 1 &&
             isInElem( settingsElem, touches[ 0 ].pageX, touches[ 0 ].pageY ) ) {

			return;

		}

	}

	function onDocumentTouchEnd( event ) {

		if ( disablePPointerEvents ) return;

		var touches = event.changedTouches || event.touches;

		switch ( touches.length ) {

		case 1:

			if ( isInElem( settingsElem, touches[ 0 ].pageX, touches[ 0 ].pageY ) )
				return;
			mouseUp( event, touches[ 0 ].pageX, touches[ 0 ].pageY );
			break;

		default:
			break;

		}

	}

	function mouseUp( event, posX, posY ) {

		// if ( isApple && ! isMobile ) {

		// 	if ( ! event.ctrlKey ) {

		// 		labelManager.nextDisplayMode();
		// 		refresh();

		// 	}

		// } else {

		var dist = Math.sqrt(
			( downX - posX ) * ( downX - posX ) +
				( downY - posY ) * ( downY - posY )
		);

		if ( dist < 5 ) {

			labelManager.nextDisplayMode();
			refresh();

		} else {

			refresh();

		}

		// }

	}

	initContextMenu(
		function () {

			controls.disable();
			disablePPointerEvents = true;
			//console.log( 'opened context menu' );

		},
		function () {

			controls.enable();
			disablePPointerEvents = false;
			//console.log( 'closed context menu' );

		}
	);

	ssettings.addListener( 'location', 'planet', function () {

		viewer.setHomePlanet( ssettings.get( 'location', 'planet' ) );
		bands.setPlanet( viewer.homePlanet );
		refresh();

	} );
	ssettings.addListener( 'location', 'latitude', function ( e ) {

		viewer.setLatLong( e, ssettings.get( 'location', 'longitude' ) );
		viewer.updateProjectionMatrix();
		refresh();

	} );
	ssettings.addListener( 'location', 'longitude', function ( e ) {

		viewer.setLatLong( ssettings.get( 'location', 'latitude' ), e );
		viewer.updateProjectionMatrix();
		refresh();

	} );
	ssettings.addListener( 'location', 'altitude', function ( val ) {

		SettingsControl.setNumber( 'location', 'altitude', val );
		viewer.setAltitude( val );
		viewer.updateProjectionMatrix();
		refresh();

	} );
	ssettings.addListener( 'location', 'restore', function ( /* e */ ) {

		viewer.setCameraPosition();
		viewer.updateProjectionMatrix();
		refresh();

	} );
	ssettings.addListener( 'view', 'elevation', function ( elev ) {

		SettingsControl.setNumber( 'view', 'elevation', elev );
		viewer.rotateDegrees(
			elev,
			ssettings.get( 'view', 'rotation' )
		);
		refresh();

	} );
	ssettings.addListener( 'view', 'rotation', function ( rot ) {

		SettingsControl.setNumber( 'view', 'rotation', rot );
		viewer.rotateDegrees(
			ssettings.get( 'view', 'elevation' ),
			rot
		);
		refresh();

	} );
	ssettings.addListener( 'view', 'zoom', function ( val ) {

		SettingsControl.setNumber( 'view', 'zoom', val );
		viewer.setZoom( val );
		viewer.updateProjectionMatrix();
		bands.setZoom( val );
		//redraw();
		//render();
		refresh( true, true );

	} );
	ssettings.addListener( 'view', 'lines', function ( val ) {

		SettingsControl.setBoolean( 'view', 'lines', val );
		bands.setVisible( val );
		render();

	} );
	ssettings.addListener( 'view', 'restore', function () {

		viewer.rotateDegrees(
			ssettings.get( 'view', 'elevation' ),
			ssettings.get( 'view', 'rotation' )
		);
		bands.setVisible( ssettings.get( 'view', 'lines' ) );

		viewer.setZoom( ssettings.get( 'view', 'zoom' ) );
		viewer.updateProjectionMatrix();
		//redraw();
		refresh( true, true );

	} );

	function redrawStars() {

		refresh( true );

	}

	ssettings.addListener( 'view', 'zoom', redrawStars );
	ssettings.addListener( 'stars', 'starradius', redrawStars );
	ssettings.addListener( 'stars', 'starbrightness', redrawStars );
	ssettings.addListener( 'stars', 'colorlevel', redrawStars );
	ssettings.addListener( 'stars', 'restore', redrawStars );

	function redrawPlanets() {

		DecoratedPlanet.updatePlanetRadii();
		refreshPlanets( false, true );
		render();

	}
	function updatePlanetColor() {

		DecoratedPlanet.updatePlanetColors();
		refreshPlanets();
		render();

	}

	ssettings.addListener( 'planets', 'planetmag', redrawPlanets );
	ssettings.addListener( 'planets', 'planetcolor', updatePlanetColor );
	ssettings.addListener( 'planets', 'sunmoonmag', redrawPlanets );
	ssettings.addListener( 'planets', 'sunbrightness',
		function ( val ) {

			pointLight.intensity = val;
			refresh( false, true );

		} );
	ssettings.addListener( 'planets', 'restore', redrawPlanets );

	function timeUpdate() {

		SettingsControl.setTimeValues(); refresh( false, true );

	}
	ssettings.addListener( 'time', 'realtime', timeUpdate );
	ssettings.addListener( 'time', 'rate', timeUpdate );
	ssettings.addListener( 'time', 'timeset', timeUpdate );
	ssettings.addListener( 'time', 'restore', timeUpdate );

}

if ( ! webgl ) {

	var warning = getWebGLErrorMessage();
	document.getElementById( 'WebGL-output' ).appendChild( warning );

}

export {
	init,
	ssettings,
	SettingsControl,
	controls,
	refreshObj,
	disableMouseEvents,
	disablePPointerEvents,
};
export {
	setTrueNorth,
	setDirectionFromCompass,
	setNoDOC,
	doOrient,
	absoluteOrientationHandler,
	deviceOrientationHandler,
} from './Orientation.js';
export {
	dismissContextMenu
} from './ContextMenu.js';
