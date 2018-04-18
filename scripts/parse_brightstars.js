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

let LineByLineReader = require('line-by-line');
let lr = new LineByLineReader(process.argv[2]); // 'brightstar_2017.txt'

// list of stars
let stars = [];

let starsByConstellation = {};

let parseLetter = function( letterIn ) {

    let start = (letterIn.startsWith('$\\') && 2) || (letterIn.startsWith('$') && 1) || 0;
    let end = letterIn.charAt(letterIn.length - 1) == '$' ? letterIn.length - 1 : letterIn.length;
    letterIn = letterIn.slice(start, end);
    let idx = letterIn.indexOf( '^' );
	let superscript = '';
	let letter = letterIn;

    if ( idx != -1 ) {

		letter = letterIn.slice( 0, idx);
		superscript = letterIn.slice( idx + 1 );
		if ( superscript.charAt( 0 ) === '{' ) {

			superscript = superscript.slice( 1, -1 );

		}
		if ( superscript.length > 0 ) {

			superscript = '^' + superscript;

		}

	} else if ( letterIn === 'L$_2' ) {

		// special case - generalize if more appear
		letter = 'L_2';

	}
    if ( letter == 'o' ) letter = 'omicron';

    return letter + superscript;
};

let parseBsNo = function(text) {
    let idx = text.indexOf('\\hspace');
    if (idx != -1) {
        text = text.substr(0, idx);
    }
    return text;
};


let parseLine = function(line) {
    // leave off line end marker
    if (line.endsWith('\\\\')) {
        line = line.substr(0, line.length - 2);
    }
    let star = {};
    let parts = line.split('&');
    star.desigNo = parts[0].trim();
    star.letter = parseLetter(parts[1].trim());
    star.constell = parts[2].trim();
    star.bsNo = parseBsNo(parts[3].trim());
    star.rtAscen = parts[4].trim();
    star.decl = parts[5].trim();
    star.notes = parts[6].trim();
    star.v = parts[7].trim();
    star.b_v = parts[8].trim();
    star.v_i = parts[9].trim();
    star.unk = parts[10].trim();
    star.spectralType = parts[11].trim();

    return star;
};

// rtAscen of form "hours min sec", hours and min integers, sec a
// float, separated by single space, end spaces already trimmed.
// Do we need to return (360 - degrees)?
let parseRtAscen = function(rtAscen) {
    let parts = rtAscen.split(' ');
    let hours = parseInt(parts[0]);
    let min = parseInt(parts[1]);
    let sec = parseFloat(parts[2]);

    let degrees = hours * 15 + min/4 + sec/240;
    return degrees;
};

// decl of form 'sdd mm ss' or 's d mm ss' where s is sign, '+' or '-',
// degrees, min, and sec all integers.  Parse sec as float just in case.
// Return float value in degrees.
let parseDecl = function(decl) {
    let s = decl.charAt(0);
    let sgn = s == '-' ? -1 : 1;
    decl = decl.substr(1).trim();
    let parts = decl.split(' ');
    let degrees = parseInt(parts[0]);
    let min = parseInt(parts[1]);
    let sec = parseFloat(parts[2]);
    let lat = sgn * (degrees + min/60 + sec/3600);
    
    return lat;
};


// Sirius, magnitude -1.44, as brightness 1.
// For brighter objects, increase size of disk.
// mag of the form either unsigned float or '$-$ufloat'.
let parseMagnitude = function(mag) {
    let sgn = 1;
    if (mag.startsWith('$-$')) {
        sgn = -1;
        mag = mag.substring(3);
    }
    mag = sgn * parseFloat(mag);
    return mag;
};

let parseB_V = function(b_v) {
    let sgn = b_v.startsWith('$-$') ? -1 : +1;

    return sgn * parseFloat(b_v.substring(3));
};

let processStarData = function(star) {
    let stardatum = {};
    stardatum.longitude = parseRtAscen(star.rtAscen);
    stardatum.latitude = parseDecl(star.decl);
    stardatum.magnitude = parseMagnitude(star.v);
    stardatum.b_v = parseB_V(star.b_v);
    if (star.letter) stardatum.letter = star.letter;
    stardatum.constell = star.constell;
    stardatum.desigNo = star.desigNo;
    stardatum.bsNo = star.bsNo;

    return stardatum;
};

lr.on('error', function (err) {
	// 'err' contains error object
    console.error( JSON.stringify( err ) );
});

lr.on('line', function (line) {

    if ( line.startsWith( '//' ) ) return; // commented out
    
    let star = parseLine(line);
    let stardatum = processStarData(star);
    
    stars.push(star);

    if ( !starsByConstellation.hasOwnProperty( stardatum.constell ) ) {

        starsByConstellation[ stardatum.constell ] = [];

    }

    insert( stardatum, starsByConstellation[ stardatum.constell ] );
    
});

lr.on('end', function () {

	// All lines are read, file is closed now.
    
    let fs = require('fs');

    // starsByConstellation.js
    fs.open( process.argv[ 3 ], 'w', function ( err, fd ) {

        if (err) { console.log(err); return; }

        fs.write( fd, 'let starsByConstellation = ', function ( err ) {

            if (err) { console.log(err); return; }
                
            fs.write( fd, JSON.stringify( starsByConstellation, undefined, 4 ), function (err) {
                if (err) console.log(err);

                fs.write( fd, ';\n\nmodule.exports = starsByConstellation;', function (err) {

                    if (err) console.log(err);

                    fs.close( fd, function ( err ) {

                        if (err) console.log(err);
                        console.log('Done writing ' + process.argv[ 3 ] + '.');

                    });
                });
            });
        });
    });
});


/**
 *  Merge the new star datum into the old, summing brightness and
 *  making a weighted average of the B-V's.
 */
function mergeStarTo( newDatum, oldDatum ) {
    console.log('');
    console.log( oldDatum.constell + ' ' + oldDatum.letter );
    console.log( 'oldDatum mag ' + oldDatum.magnitude + ', b_v ' + oldDatum.b_v );
    console.log( 'newDatum mag ' + newDatum.magnitude + ', b_v ' + newDatum.b_v );

    let oldBrightness = Math.pow(10, -(oldDatum.magnitude + 1.44)/2.5);
    let newBrightness = Math.pow(10, -(newDatum.magnitude + 1.44)/2.5);
    let combinedBrightness = oldBrightness + newBrightness;

    oldDatum.magnitude = - Math.log10( combinedBrightness ) * 2.5 - 1.44;

    oldDatum.b_v =
        ( oldBrightness * oldDatum.b_v + newBrightness * newDatum.b_v ) /
        combinedBrightness;

    console.log( 'combined mag ' + oldDatum.magnitude + ', b_v ' + oldDatum.b_v );
}
    


function insert( stardatum, starList ) {

    // First, is there already a star in the list with the same letter
    // and so close that we won't be able to separate them visually?
    // If so, merge it with that - no need to insert.
    
    let idx;
    let stardatum1;
    for ( idx = 0; idx < starList.length; idx++ ) {

        stardatum1 = starList[ idx ];
        if ( stardatum.letter && stardatum.letter == stardatum1.letter &&
             stardatum.latitude - stardatum1.latitude < 0.01 &&
             stardatum.longitude - stardatum1.longitude < 0.01 ) {

            mergeStarTo( stardatum, stardatum1 );
            return;
        }
    }   
    
    for ( idx = 0; idx < starList.length; idx++ ){

        if ( stardatum.magnitude < starList[ idx ].magnitude ) {

            starList.splice( idx, 0, stardatum );
            return;

        }
        
    }

    starList.push( stardatum );

}
