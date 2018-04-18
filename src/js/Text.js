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

const greekAlpha = {
	Alpha: '\u0391',
	Beta: '\u0392',
	Gamma: '\u0393',
	Delta: '\u0394',
	Epsilon: '\u0395',
	Zeta: '\u0396',
	Eta: '\u0397',
	Theta: '\u0398',
	Iota: '\u0399',
	Kappa: '\u039A',
	Lambda: '\u039B',
	Mu: '\u039C',
	Nu: '\u039D',
	Xi: '\u039E',
	Omicron: '\u039F',
	Pi: '\u03A0',
	Rho: '\u03A1',
	Sigma: '\u03A3',
	Tau: '\u03A4',
	Upsilon: '\u03A5',
	upsih: '\u03D2',
	Phi: '\u03A6',
	Chi: '\u03A7',
	Psi: '\u03A8',
	Omega: '\u03A9',
	alpha: '\u03B1',
	beta: '\u03B2',
	gamma: '\u03B3',
	delta: '\u03B4',
	epsilon: '\u03B5',
	zeta: '\u03B6',
	eta: '\u03B7',
	theta: '\u03B8',
	thetasym:	'\u03D1',
	iota: '\u03B9',
	kappa: '\u03BA',
	lambda: '\u03BB',
	mu: '\u03BC',
	nu: '\u03BD',
	xi: '\u03BE',
	omicron: '\u03BF',
	pi: '\u03C0',
	piv: '\u03D6',
	rho: '\u03C1',
	sigmaf: '\u03C2',
	sigma: '\u03C3',
	tau: '\u03C4',
	upsilon: '\u03C5',
	phi: '\u03C6',
	chi: '\u03C7',
	psi: '\u03C8',
	omega: '\u03C9',
};

const subscripts = {

	'0': '\u2080',
	'1': '\u2081',
	'2': '\u2082',
	'3': '\u2083',
	'4': '\u2084',
	'5': '\u2085',
	'6': '\u2086',
	'7': '\u2087',
	'8': '\u2088',
	'9': '\u2089',

};

const superscripts = {

	'0': '\u2070',
	'1': '\u00B9',
	'2': '\u00B2',
	'3': '\u00B3',
	'4': '\u2074',
	'5': '\u2075',
	'6': '\u2076',
	'7': '\u2077',
	'8': '\u2078',
	'9': '\u2079',

};


class Text {

	/**
	 *	Does a character have an ascender?	If no character in a div has
	 *	one, we can treat it as a few pixels shorter at the top.
	 *
	 *	This covers only the characters we actually use.
	 */
	static charAscends( ch ) {

		// List only chars that can occur in a single-char string.
		return ( //( 'A' <= ch && ch <= 'Z' ) ||
			( '0' <= ch && ch <= '9' ) ||
				ch === greekAlpha.beta || ch === greekAlpha.delta ||
				ch === greekAlpha.zeta || ch === greekAlpha.theta ||
				ch === greekAlpha.lambda || ch === greekAlpha.xi || ch === greekAlpha.chi );

	}

	/**
	 *	Does a character have an descender?	 If no character in a div has
	 *	one, we can treat it as a few pixels shorter at the top;
	 *
	 *	This covers only the characters we actually use.
	 */
	static charDescends( ch ) {

		//ch === 'g' || ch === 'j' || ch === 'p' || ch === 'q' || ch === 'y' ||
		return ch === greekAlpha.beta || ch === greekAlpha.gamma ||
			ch === greekAlpha.zeta || ch === greekAlpha.eta || ch === greekAlpha.mu ||
			ch === greekAlpha.xi || ch === greekAlpha.rho ||
			ch === greekAlpha.phi || ch === greekAlpha.chi || ch === greekAlpha.psi;

	}


	/**
	 *  For simplicity, assume that strings of more than one character have
	 *  both ascenders and descenders - they *will* have ascenders as there
	 *  will either be a numerical identifier or a capitalized name or a Greek
	 *  letter plus a superscript.
	 */
	static stringAscends( strs ) {

		switch ( strs.length ) {

		case 0:
			return false;

		case 1:
			var str = strs[ 0 ];
			return str.length > 1 || Text.charAscends( str );

		default:
			return true;

		}

	}

	static stringDescends( strs ) {

		switch ( strs.length ) {

		case 0:
			return false;

		case 1:
			var str = strs[ 0 ];
			switch ( str.length ) {

			case 0:
				return false;

			case 1:
				return Text.charDescends( str );

			case 2:
				return ! ( Text.isLowerGreek( str.charAt( 0 ) ) &&
						   Text.isSuperscript( str.charAt( 1 ) ) );

			default:
				return true;

			}

		default:
			return true;

		}

	}

	static isLowerGreek( ch ) {

		return greekAlpha.alpha <= ch && ch <= greekAlpha.omega;

	}

	static isSuperscript( ch ) {

		switch ( ch ) {

		case superscripts[ '0' ]:
		case superscripts[ '1' ]:
		case superscripts[ '2' ]:
		case superscripts[ '3' ]:
			return true;

		default:
			return superscripts[ '4' ] <= ch && ch <= superscripts[ '9' ];

		}

	}

}


export { greekAlpha, subscripts, superscripts };
export default Text;
