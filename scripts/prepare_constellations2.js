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

LocalStorage = require( 'node-localstorage' ).LocalStorage;
localStorage = new LocalStorage( './localstorage.txt' );
let THREE = require( 'three' );
let numeric = require( 'numericjs' );
let planetLib = require( '../js/planetlib2.umd.js' );
let Star = planetLib.Star;
let LabeledStar = planetLib.LabeledStar;
let StarLabel = planetLib.StarLabel
let defaultSettings = planetLib.defaultSettings;
let allStars = planetLib.allStars;
let mainStars = planetLib.mainStars;
let constellations = planetLib.constellations;

let Canvas = require( 'canvas' );
StarLabel.createCanvas = function () {

	return new Canvas();

};

let allStars2 = allStars.slice( 0 );
let mainStars2 = mainStars.slice( 0 );

let zoom = defaultSettings.view.zoom;
let colorlevel = defaultSettings.stars.colorlevel;
let baseBrightness = defaultSettings.stars.starbrightness;
let baseRadius = 1000 * defaultSettings.stars.starradius;
let group = new THREE.Group();
LabeledStar.initStars(
	group,
	zoom,
	colorlevel,
	baseBrightness,
	baseRadius
);

let len = allStars.length;
for ( let idx = 0; idx < len; idx ++ ) {

	let starData = allStars2[ idx ];
	let star = allStars[ idx ];

	let letterLabel = star.letterLabel;
	createLabelData( starData, 'letterLabel', letterLabel );

	let shortNameLabel = star.shortNameLabel;
	if ( shortNameLabel ) {

		createLabelData( starData, 'shortNameLabel', shortNameLabel );

	}

}

function createLabelData( starData, labelName, label ) {

	if ( label.vtr ) {

		starData[ labelName ] = {};
		starData[ labelName ].vtr = new THREE.Vector3().copy( label.vtr );
		starData[ labelName ].orthogVtr = new THREE.Vector3().copy( label.orthogVtr );

	}
	return starData;

}

let up = new THREE.Vector3( 0, 1, 0 );
let tmp = new THREE.Vector3();
let found = true;
LabeledStar.shadows = [];

// find min zoom at which each label will become visible
for ( let tenZoom = 5; tenZoom < 500 && found; tenZoom ++ ) {

	zoom = tenZoom / 10;
	LabeledStar.updateStars( group, zoom, colorlevel, baseBrightness, baseRadius );
	
	found = false;
	for ( let idx = 0; idx < allStars.length; idx ++ ) {

		let star = allStars[ idx ];
		let starData = allStars2[ idx ];
		if ( star.main ) {

			star.setLabelPosition( zoom, tmp, up, true );

			if ( typeof starData.shortNameLabel.minZoom === 'undefined' ) {

				found = true;
				if ( star.setLabelVisibility( true, zoom ) ) {

					starData.shortNameLabel.minZoom = zoom;

				}

			}

		}
		if ( star.letterLabel.vtr ) {

			if ( star.getLabel() || zoom >= 1.8 ) {

				star.setLabelPosition( zoom, tmp, up, false );

				if ( typeof starData.letterLabel.minZoom === 'undefined' ) {

					found = true;
					if ( star.setLabelVisibility( false, zoom ) ) {

						starData.letterLabel.minZoom = zoom;

					}

				}

			}

		}

	}

}


let fs = require( 'fs' );

let writer = fs.createWriteStream( process.argv[ 2 ] );

writer.write( '// From "Conservative 7-Color Palette" in http://mkweb.bcgsc.ca/colorblind/\n' );
writer.write( '// but with the orange more orange, sky blue lighter.\n' );
writer.write( 'let colors = [\n\n' );
writer.write( "     'rgb(0,114,178)', // blue\n" );
writer.write( "     'rgb(230,100,0)', // orange\n" );
writer.write( "     'rgb(96,190,243)', // sky blue\n" );
writer.write( "     'rgb(204,121,167)', // reddish purple\n" );
writer.write( "     'rgb(240,228,66)', // yellow\n" );
writer.write( "     'rgb(0,158,115)', // bluish green\n" );
// old colors - we might want to switch between colorblind-friendly and non.
// writer.write( "     'hsl(0,100%,65%)',\n" );
// writer.write( "     'hsl(60,100%,65%)',\n" );
// writer.write( "     'hsl(120,100%,65%)',\n" );
// writer.write( "     'hsl(180,100%,65%)',\n" );
// writer.write( "     'hsl(240,100%,65%)',\n" );
// writer.write( "     'hsl(300,100%,65%)',\n" );
writer.write( "     'green', // for planets\n" );
writer.write( "     'grey', // for stars without constellation\n\n" );
writer.write( '];\n\n' );

writer.write( 'let constellations =\n' );
writer.write( JSON.stringify( constellations, undefined, '\t' ) );
writer.write( ';\n\n' );
writer.write( 'let allStars =\n' );
writer.write( JSON.stringify( allStars2, undefined, '\t' ) );
writer.write( ';\n\n' );
writer.write( 'let mainStars =\n' );
writer.write( JSON.stringify( mainStars2, undefined, '\t' ) );
writer.write( ';\n\n' );
	
writer.write( 'export { colors, constellations, allStars, mainStars };\n' );

writer.end( '' );

writer.on( 'finish', () => { console.log( 'finished ' ); } );

