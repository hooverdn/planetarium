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

import { greekAlpha, subscripts, superscripts } from './Text.js';
import Utils from './Utils.js';
import { colors, constellations } from './constellations.js';

// These belong somewhere else, DecoratedStar, mayube
const unit = 10000;	 // stands for 1 AU; might it just as well be 1.0?
const distance = 500000.0 * unit;


class Star {

	constructor( values ) {

		if ( values ) {

			Object.assign( this, values );

			if ( this.magnitude ) {

				this.intensity = Math.pow( 10, - ( this.magnitude + 1.44 ) / 2.5 );

			} else {

				console.log( 'star without magnitude: ' +
							 this.letter + ' ' + this.constell );

			}

		}

	}

	getGreekLetter() {

		//let superscript = '';
		let letter = this.letter;
		if ( ! letter ) return undefined;

		let idx = letter.indexOf( '^' );
		if ( idx !== - 1 ) {

			const superscript = letter.slice( idx + 1 );
			letter = letter.slice( 0, idx );
			// XXX: can letter be non-greek here?
			letter = greekAlpha[ letter ] || letter;
			if ( ! letter ) return undefined;
			for ( let jdx = 0; jdx < superscript.length; jdx ++ ) {

				letter += superscripts[ superscript.charAt( jdx ) ];

			}

		} else if ( letter === 'L$_{2}' ) {

			// HACK (special case)
			letter = 'L' + subscripts[ '2' ];

		} else {

			letter = greekAlpha[ letter ] || letter;

		}

		return letter;

	}

	getLongName() {

		let longName = '';

		longName += this.getGreekLetter() || this.desigNo || ( 'Bright Star #' + this.bsNo );
		longName += ' ' + this.getConstellationName( 'gen' ); // genitive form of constell

		let starName = this.getCommonName();
		if ( starName ) {

			longName += ' (' + starName + ')';

		}

		return longName;

	}

	getShortName() {

		let shortName = this.getGreekLetter() || this.desigNo;
		// || ( 'BS' + this.bsNo );

		let starName = this.getWellKnownName();
		if ( starName ) {

			shortName += ' ' + starName;
			//shortName += '&thinsp;(' + starName + ')';

		}

		return shortName;

	}

	getBrightStarNumber() {

		let number = ( '000' + this.bsNo );
		return number.substring( number.length - 4 );

	}

	getLabel() {

		return this.getGreekLetter() || this.desigNo;

	}

	getLetter() {

		return this.getGreekLetter() || this.desigNo || this.getBrightStarNumber();

	}

	getDataString() {

		let data = this.getLongName();

		data += '; RA: ' + Utils.roundTo2( this.longitude ) + '&deg;, D: ' +
			Utils.roundTo2( this.latitude ) + '&deg;';
		if ( this.magnitude ) {

			data += '; mag: ' + this.magnitude;

		}
		return data;

	}

	// Get the star's common name, if there is one.
	getCommonName() {

		let letter = this.letter || this.desigNo;
		if ( this.constell ) {

			let constellStars = this.starNames[ this.constell ];
			return constellStars && constellStars[ letter ];

		}
		return undefined;

	}

	getWellKnownName() {

		let letter = this.letter || this.desigNo;
		if ( this.constell ) {

			let constellStars = Star.wellKnownStarNames[ this.constell ];
			return constellStars && constellStars[ letter ];

		}

		return undefined;

	}


	getConstellationName( idx ) {

		if ( this.constell ) {

			let name = constellations[ this.constell ][ idx ];
			return name ? name : this.constell;

		} else {

			return '';

		}

	}

	getNameColorCode() {

		if ( this.constell ) {

			return constellations[ this.constell ].color;

		} else {

			return colors.length - 1;

		}

	}


	getConstellationColor() {

		if ( this.constell ) {

			return constellations[ this.constell ].color;

		} else {

			return colors[ colors.length - 1 ];

		}

	}

}


Star.prototype.starNames = {
	And: {
		alpha: 'Alpheratz',
		beta: 'Mirach',
	},
	Aql: {
		alpha: 'Altair',
	},
	Ari: {
		alpha: 'Hamal',
	},
	Aur: {
		alpha: 'Capella',
	},
	Boo: {
		alpha: 'Arcturus',
		beta: 'Nekkar',
		gamma: 'Seginus',
	},
	CMa: {
		alpha: 'Sirius',
		beta: 'Mirzam',
	},
	CMi: {
		alpha: 'Procyon',
		beta: 'Gomeisa',
	},
	CVn: {
		alpha: 'Cor Caroli',
	},
	Cas: {
		alpha: 'Schedar',
	},
	Car: {
		alpha: 'Canopus',
	},
	Cen: {
		alpha: 'Rigil Kentaurus',
	},
	Cep: {
		alpha: 'Alderamin',
	},
	Cet: {
		alpha: 'Menkar',
		omicron: 'Mira',
	},
	CrB: {
		alpha: 'Alphecca',
	},
	Cru: {
		alpha: 'Acrux',
		beta: 'Mimosa',
		gamma: 'Gacrux',
	},
	Cyg: {
		alpha: 'Deneb',
		beta: 'Albireo',
		gamma: 'Sadr',
	},
	Eri: {
		alpha: 'Achernar',
	},
	Gem: {
		'alpha^1': 'Castor',
		beta: 'Pollux',
	},
	Her: {
		alpha: 'Ras Algethi',
	},
	Hya: {
		alpha: 'Alphard',
	},
	Leo: {
		alpha: 'Regulus',
		beta: 'Denebola',
		gamma: 'Algieba',
		delta: 'Zosma',
	},
	Lyr: {
		alpha: 'Vega',
		beta: 'Sheliak',
		gamma: 'Sulafat',
		eta: 'Aladfar',
		mu: 'Alathfar',
	},
	Ori: {
		alpha: 'Betelgeuse',
		beta: 'Rigel',
		gamma: 'Bellatrix',
		delta: 'Mintaka',
		epsilon: 'Alnilam',
		zeta: 'Alnitak',
	},
	Peg: {
		alpha: 'Markab',
		beta: 'Scheat',
		gamma: 'Algenib',
		epsilon: 'Enif',
		zeta: 'Homam',
		theta: 'Biham',
		eta: 'Matar',
	},
	Per: {
		alpha: 'Mirfak',
		beta: 'Algol',
	},
	PsA: {
		alpha: 'Fomalhaut',
	},
	Sco: {
		alpha: 'Antares',
	},
	Tau: {
		alpha: 'Aldebaran',
		beta: 'Elnath',
		eta: 'Alcyone',
		'20': 'Maia',
		'21': 'Asterope',
		'22': 'Sterope',
		'23': 'Merope',
		'27': 'Atlas',
		'28': 'Pleione',
	},
	UMa: {
		alpha: 'Dubhe',
		beta: 'Merak',
		gamma: 'Phecda',
		delta: 'Megrez',
		epsilon: 'Alioth',
		eta: 'Alkaid',
		zeta: 'Mizar',
		xi: 'Alula Australis',
		iota: 'Talitha',
		nu: 'Alula Borealis',
		chi: 'Al Kaphrah',
		'80': 'Alcor',
	},
	UMi: {
		alpha: 'Polaris',
		beta: 'Kochab',
		gamma: 'Pherkad',
		delta: 'Yildun',
	},
	Vir: {
		alpha: 'Spica',
	},
};

Star.wellKnownStarNames = {

	And: {
		alpha: 'Alpheratz',
	},
	Aql: {
		alpha: 'Altair',
	},
	Ari: {
		alpha: 'Hamal',
	},
	Aur: {
		alpha: 'Capella',
	},
	Boo: {
		alpha: 'Arcturus',
	},
	CMa: {
		alpha: 'Sirius',
	},
	CMi: {
		alpha: 'Procyon',
	},
	CVn: {
		'alpha^2': 'Cor Caroli',
	},
	Car: {
		alpha: 'Canopus',
	},
	Cen: {
		alpha: 'Rigil Kentaurus',
	},
	Cet: {
		omicron: 'Mira',
	},
	CrB: {
		alpha: 'Alphecca',
	},
	Cyg: {
		alpha: 'Deneb',
		beta: 'Albireo',
	},
	Eri: {
		alpha: 'Achernar',
	},
	Gem: {
		'alpha^1': 'Castor',
		beta: 'Pollux',
	},
	Her: {
		alpha: 'Ras Algethi',
	},
	Leo: {
		alpha: 'Regulus',
		beta: 'Denebola',
	},
	Lyr: {
		alpha: 'Vega',
	},
	Ori: {
		alpha: 'Betelgeuse',
		beta: 'Rigel',
		gamma: 'Bellatrix',
	},
	Per: {
		beta: 'Algol',
	},
	PsA: {
		alpha: 'Fomalhaut',
	},
	Sco: {
		alpha: 'Antares',
	},
	Tau: {
		alpha: 'Aldebaran',
		beta: 'Elnath',
		eta: 'Alcyone',
		'20': 'Maia',
		'21': 'Asterope',
		'22': 'Sterope',
		'23': 'Merope',
		'27': 'Atlas',
		'28': 'Pleione',
	},
	UMi: {
		alpha: 'Polaris',
	},
	Vir: {
		alpha: 'Spica',
	},
};

Star.prototype.starExplan = {

	Aql: {

		alpha: 'Summer Triangle',

	},
	CMa: {

		alpha: 'Dog Star',

	},
	Cyg: {

		alpha: 'Tail, Summer Triangle',

	},
	Lyr: {

		alpha: 'Summer Triangle',

	},
	Ori: {

		gamma: 'Xena Warrior Princess',

	},

};

Star.prototype.starGroups = {

	'Guard Stars': [ 5563, 5735 ],
	'Pointer Stars': [ 4301, 4295 ],
	'Hyades': [ 1412, 1394, 1346, 1376, 1373, 1389, 1409 ],
	'Pleiades': [ 27, 1165, 1156, 1142, 1145, 1149 ],
	'Belt': [ 1948, 1903, 1852 ],
	'Sword': [ 1899, 1890, 1931 ],
	'The Kids': [ 1605, 1612, 1641 ],
	'Horse and Rider': [ 5054, 5062 ],
};


export default Star;
export { unit, distance };
