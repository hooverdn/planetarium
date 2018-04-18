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

let THREE = require( 'three' );

let planetLib = require( '../js/planetlib.umd.js' );
let Star = planetLib.Star;
let unit = planetLib.unit;
let distance = planetLib.distance;
let shellRadius = distance + unit;

let starsByConstellation = require( './starsByConstellation.js' );


function randomInt( n ) {

    return n === 1 ? 0 : Math.floor( n * Math.random() );

}

// Neighbor lists from pages linked from
// https://in-the-sky.org/data/constellations_list.php
// With some extras in case intervening constellations have few bright stars

let constellations = {
    // [ nominative, genitive ]
    And: { abbr: 'And', nom: 'Andromeda', gen: 'Andromedae',
           labelPos: [ { latitude: 36.5, longitude: -2 } ],
           neighbors: [ 'Cas', 'Lac', 'Peg', 'Per', 'Psc', 'Tri' ],
           explan: '&AElig;thiopian Princess<br>To be Eaten by Cetus' },
    Ant: { abbr: 'Ant', nom: 'Antlia', gen: 'Antliae',
           labelPos: [ { latitude: -32, longitude: 147 } ],
           explan: 'Ship\'s Pump', neighbors: [ 'Crt', 'Hya', 'Pyx', 'Vel', ] },
    Aps: { abbr: 'Aps', nom: 'Apus', gen: 'Apodis',
           labelPos: [ { latitude: -80, longitude: -90 } ],
           explan: 'Bird of Paradise',
           neighbors: [ 'Ara', 'Cha', 'Cir', 'Mus', 'Oct', 'Pav', 'Psc', 'TrA', ] },
    Aqr: { abbr: 'Aqr', nom: 'Aquarius', gen: 'Aquarii',
           labelPos: [ { latitude: -16, longitude: -10 } ],
           explan: 'Water Bearer',
           neighbors: [ 'Aql', 'Cap', 'Cet', 'Del', 'Peg', 'Psc', 'PsA', 'Scl', ] },
    Aql: { abbr: 'Aql', nom: 'Aquila', gen: 'Aquilae',
           labelPos: [ { latitude: 5, longitude: 303 } ],
           explan: 'Eagle',
           neighbors: [ 'Aqr', 'Cap', 'Del', 'Equ', 'Her', 'Oph',
                        'Sct', 'Ser', 'Sge', 'Sgr', ] },
    Ara: { abbr: 'Ara', nom: 'Ara', gen: 'Arae',
           labelPos: [ { latitude: -61, longitude: 258 } ],
           explan: 'Altar',
           neighbors: [ 'Aps', 'CrA', 'Nor', 'Pav', 'Sco', 'Tel', 'TrA', ] },
    Ari: { abbr: 'Ari', nom: 'Aries', gen: 'Arietis',
           labelPos: [ { latitude: 20, longitude: 35 } ],
           neighbors: [ 'Cet', 'Per', 'Psc', 'Tau', 'Tri', ]},
    Aur: { abbr: 'Aur', nom: 'Auriga', gen: 'Aurigae',
           labelPos: [ { latitude: 46, longitude: 97 } ],
           explan: 'Charioteer',
           neighbors: [ 'Cam', 'Gem', 'Lyn', 'Per', 'Tau', ] },
    Boo: { abbr: 'Boo', nom: 'Bo\xf6tes', gen: 'Bo\xf6tis',
           labelPos: [ { latitude: 30, longitude: 213 } ],
           explan: 'Ploughman',
           neighbors: [ 'Com', 'CrB', 'CVn', 'Dra', 'Her', 'Ser', 'UMa', 'Vir', ] },
    Cae: { abbr: 'Cae', nom: 'Caelum', gen: 'Caeli',
           labelPos: [ { latitude: -42.4, longitude: 76 } ],
           explan: 'Sky',
           neighbors: [ 'Col', 'Dor', 'Eri', 'For', 'Hor', 'Lep', 'Pic' ] },
    Cam: { abbr: 'Cam', nom: 'Camelopardalis', gen: 'Camelopardalis',
           labelPos: [ { latitude: 72, longitude: 88 } ],
           explan: 'Giraffe',
           neighbors: [ 'Aur', 'Cas', 'Cep', 'Dra', 'Lyn', 'Per', 'UMa', 'UMi' ] },
    Cnc: { abbr: 'Cnc', nom: 'Cancer', gen: 'Cancri',
           labelPos: [ { latitude: 14, longitude: 127 } ],
           neighbors: [ 'CMi', 'Gem', 'Hya', 'Leo', 'LMi', 'Lyn', ] },
    CVn: { abbr: 'CVn', nom: 'Canes Venatici', gen: 'Canum Venaticorum',
           labelPos: [ { latitude: 40, longitude: -175 } ],
           explan: 'Hunting Dogs',
           neighbors: [ 'Boo', 'Com', 'UMa', ] },
    CMa: { abbr: 'CMa', nom: 'Canis Major', gen: 'Canis Majoris',
           labelPos: [ { latitude: -18, longitude: 108 } ],
           explan: 'Orion\'s Larger Hunting Dog',
           neighbors: [ 'Col', 'Lep', 'Mon', 'Ori', 'Pup', ] },
    CMi: { abbr: 'CMi', nom: 'Canis Minor', gen: 'Canis Minoris',
           labelPos: [ { latitude: 4, longitude: 110 } ],
           explan: 'Orion\'s Smaller Hunting Dog',
           neighbors: [ 'Cnc', 'Gem', 'Hya', 'Mon', ] },
    Cap: { abbr: 'Cap', nom: 'Capricornus', gen: 'Capricorni',
           labelPos: [ { latitude: -21, longitude: -32 } ],
           neighbors: [ 'Aqr', 'Aql', 'Mic', 'PsA', 'Sgr', ] },
    Car: { abbr: 'Car', nom: 'Carina', gen: 'Carinae',
           labelPos: [ { latitude: -60, longitude: 118 } ],
           explan: 'Keel',
           neighbors: [ 'Cen', 'Cha', 'Mus', 'Pic', 'Pup', 'Vel', 'Vol' ] },
    Cas: { abbr: 'Cas', nom: 'Cassiopeia', gen: 'Cassiopeiae',
           labelPos: [ { latitude: 67.5, longitude: 7 } ],
           neighbors: [ 'And', 'Cam', 'Cep', 'Lac', 'Per' ],
           explan: '&AElig;thiopian Queen<br>Andromeda\'s Mother',
		   main: [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon', ] },
    Cen: { abbr: 'Cen', nom: 'Centaurus', gen: 'Centauri',
           labelPos: [ { latitude: -55.5, longitude: -147 },
                       { latitude: -44, longitude: -164 } ],
           neighbors: [ 'Ant', 'Car', 'Cir', 'Cru', 'Hya', 'Lib', 'Lup', 'Mus', 'Vel', ] },
    Cep: { abbr: 'Cep', nom: 'Cepheus', gen: 'Cephei',
           labelPos: [ { latitude: 67, longitude: -48 } ],
           neighbors: [ 'Cam', 'Cas', 'Cyg', 'Dra', 'Lac', 'UMi', ],
		   main: [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'iota' ],
           explan: '&AElig;thiopian King<br>Andromeda\'s Father' },
    Cet: { abbr: 'Cet', nom: 'Cetus', gen: 'Ceti',
           labelPos: [ { latitude: -15, longitude: 16 } ],
           explan: 'Sea Monster<br>Coming to Eat Andromeda',
           neighbors: [ 'Aqr', 'Ari', 'Eri', 'For', 'Psc', 'Scl', 'Tau', ] },
    Cha: { abbr: 'Cha', nom: 'Chamaeleon', gen: 'Chamaeleontis',
           labelPos: [ { latitude: -75, longitude: 160 } ],
           neighbors: [ 'Aps', 'Car', 'Men', 'Mus', 'Oct', 'Vol', ] },
    Cir: { abbr: 'Cir', nom: 'Circinus', gen: 'Circini',
           labelPos: [ { latitude: -56, longitude: -124 } ],
           explan: 'Compasses',
           neighbors: [ 'Aps', 'Cen', 'Lup', 'Mus', 'Nor', 'TrA', ] },
    Col: { abbr: 'Col', nom: 'Columba', gen: 'Columbae',
           labelPos: [ { latitude: -30, longitude: 90 } ],
           explan: 'Dove',
           neighbors: [ 'Cae', 'CMa', 'Lep', 'Pic', 'Pup' ] },
    Com: { abbr: 'Com', nom: 'Coma Berenices', gen: 'Comae Berenices',
           labelPos: [ { latitude: 22, longitude: 195 } ],
           explan: 'Berenice\'s Hair',
           neighbors: [ 'Boo', 'CVn', 'Leo', 'UMa', 'Vir', ] },
    CrA: { abbr: 'CrA', nom: 'Corona Australis', gen: 'Coronae Australis',
           labelPos: [ { latitude: -38, longitude: 283 } ],
           explan: 'Southern Crown',
           neighbors: [ 'Ara', 'Sco', 'Sgr', 'Tel' ] },
    CrB: { abbr: 'CrB', nom: 'Corona Borealis', gen: 'Coronae Borealis',
           labelPos: [ { latitude: 32, longitude: -120 } ],
           explan: 'Northern Crown',
		   main: [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta' ],
           neighbors: [ 'Boo', 'Her', 'Ser' ] },
    Crv: { abbr: 'Crv', nom: 'Corvus', gen: 'Corvi',
           labelPos: [ { latitude: -20.5, longitude: 187 } ],
           explan: 'Crow or Raven',
           neighbors: [ 'Crt', 'Hya', 'Vir', ]},
    Crt: { abbr: 'Crt', nom: 'Crater', gen: 'Crateris',
           labelPos: [ { latitude: -13.5, longitude: 175 } ],
           explan: 'Cup',
           neighbors: [ 'Crv', 'Hya', 'Leo', 'Sex', 'Vir', ] },
    Cru: { abbr: 'Cru', nom: 'Crux', gen: 'Crucis',
           labelPos: [ { latitude: -62.5, longitude: 197 } ],
           explan: 'Cross',
           neighbors: [ 'Cen', 'Mus', 'Vel' ] },
    Cyg: { abbr: 'Cyg', nom: 'Cygnus', gen: 'Cygni',
           labelPos: [ { latitude: 31, longitude: -53 } ],
           explan: 'Swan',
		   main: [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'eta' ],
           neighbors: [ 'Cep', 'Dra', 'Lac', 'Lyr', 'Peg', 'Sge', 'Vul', ] },
    Del: { abbr: 'Del', nom: 'Delphinus', gen: 'Delphini',
           labelPos: [ { latitude: 15, longitude: 316.5 } ],
           explan: 'Dolphin',
           neighbors: [ 'Aqr', 'Aql', 'Equ', 'Peg', 'Sge', 'Vul' ] },
    Dor: { abbr: 'Dor', nom: 'Dorado', gen: 'Doradus',
           labelPos: [ { latitude: -65, longitude: 95 } ],
           neighbors: [ 'Cae', 'Hor', 'Hyi', 'Men', 'Pic', 'Ret', 'Vol' ] },
    Dra: { abbr: 'Dra', nom: 'Draco', gen: 'Draconis',
           labelPos: [ { latitude: 66, longitude: -90 },
                       { latitude: 68, longitude: -150 } ],
           explan: 'Dragon',
		   main: [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'xi', 'theta',
				   'eta', 'iota', 'kappa', 'lambda', 'omicron', 'phi', 'chi', 'tau',
				   'nu^1', 'omega' ],
           neighbors: [ 'Boo', 'Cam', 'Cep', 'Cyg', 'Her', 'Lyr', 'UMa', 'UMi', ] },
    Equ: { abbr: 'Equ', nom: 'Equuleus', gen: 'Equulei',
           labelPos: [ { latitude: 6, longitude: 315 } ],
           explan: 'Foal',
           neighbors: [ 'Aql', 'Del', 'Peg', ] },
    Eri: { abbr: 'Eri', nom: 'Eridanus', gen: 'Eridani',
           labelPos: [ { latitude: -17, longitude: 63 },
                       { latitude: -45, longitude: 45 } ],
           neighbors: [ 'Cae', 'Cet', 'For', 'Hor', 'Hyi',
						'Lep', 'Ori', 'Phe', 'Ret', 'Scl', 'Tau', 'Tuc', ],
           explan: 'Mythical River' },
    For: { abbr: 'For', nom: 'Fornax', gen: 'Fornacis',
           labelPos: [ { latitude: -35, longitude: 52 } ],
           explan: 'Furnace',
           neighbors: [ 'Cae', 'Cet', 'Eri', 'Hor', 'Phe', 'Scl' ]},
    Gem: { abbr: 'Gem', nom: 'Gemini', gen: 'Geminorum',
           labelPos: [ { latitude: 29, longitude: 103 } ],
           neighbors: [ 'Aur', 'Cnc', 'CMi', 'Lyn', 'Mon', 'Ori', 'Tau', ] },
    Gru: { abbr: 'Gru', nom: 'Grus', gen: 'Gruis',
           labelPos: [ { latitude: -48, longitude: -14 } ],
           explan: 'Crane',
           neighbors: [ 'Ind', 'Mic', 'Phe', 'PsA', 'Scl', 'Tuc', ] },
    Her: { abbr: 'Her', nom: 'Hercules', gen: 'Herculis',
           labelPos: [ { latitude: 42, longitude: 264 } ],
           neighbors: [ 'Aql', 'Boo', 'CrB', 'Dra', 'Lyr', 'Oph', 'Ser', 'Sge', 'Vul' ] },
    Hor: { abbr: 'Hor', nom: 'Horologium', gen: 'Horologii',
           labelPos: [ { latitude: -50, longitude: 53 } ],
           explan: 'Clock',
           neighbors: [ 'Cae', 'Dor', 'Eri', 'For', 'Hyi', 'Ret' ] },
    Hya: { abbr: 'Hya', nom: 'Hydra', gen: 'Hydrae',
           labelPos: [ { latitude: -3, longitude: 135 },
                       { latitude: -25, longitude: 163 } ],
           neighbors: [ 'Ant', 'Cnc',  'CMi', 'Cen', 'Crv', 'Crt',
						'Leo', 'Lib', 'Lup', 'Mon', 'Pup', 'Sex', 'Vir' ],
           explan: 'Many-Headed<br>Swamp Serpent' },
    Hyi: { abbr: 'Hyi', nom: 'Hydrus', gen: 'Hydri',
           labelPos: [ { latitude: -77, longitude: 28 } ],
           explan: 'Water Snake',
           neighbors: [ 'Dor', 'Eri', 'Hor', 'Men', 'Oct', 'Phe', 'Ret', 'Tuc', ] },
    Ind: { abbr: 'Ind', nom: 'Indus', gen: 'Indi',
           labelPos: [ { latitude: -57, longitude: 322 } ],
           neighbors: [ 'Gru', 'Mic', 'Oct', 'Pav', 'Sgr', 'Tel', 'Tuc', ] },
    Lac: { abbr: 'Lac', nom: 'Lacerta', gen: 'Lacertae',
           labelPos: [ { latitude: 45, longitude: 333.5 } ],
           explan: 'Lizard',
           neighbors: [ 'And', 'Cas', 'Cep', 'Cyg', 'Peg', ] },
    Leo: { abbr: 'Leo', nom: 'Leo', gen: 'Leonis',
           labelPos: [ { latitude: 17, longitude: 160 } ],
           neighbors: [ 'Cnc', 'Com', 'Crt', 'Hya', 'LMi',
						'Lyn', 'Sex', 'UMa', 'Vir', ] },
    LMi: { abbr: 'LMi', nom: 'Leo Minor', gen: 'Leonis Minoris',
           labelPos: [ { latitude: 33, longitude: 156 } ],
           explan: 'Lesser Lion',
           neighbors: [ 'Cnc', 'Leo', 'Lyn', 'UMa' ] },
    Lep: { abbr: 'Lep', nom: 'Lepus', gen: 'Leporis',
           labelPos: [ { latitude: -17, longitude: 75 } ],
           explan: 'Hare',
           neighbors: [ 'Cae', 'CMa', 'Col', 'Eri', 'Mon', 'Ori' ] },
    Lib: { abbr: 'Lib', nom: 'Libra', gen: 'Librae',
           labelPos: [ { latitude: -22.5, longitude: 228 } ],
           neighbors: [ 'Cen', 'Hya', 'Lup', 'Oph', 'Sco', 'Ser', 'Vir', ] },
    Lup: { abbr: 'Lup', nom: 'Lupus', gen: 'Lupi',
           labelPos: [ { latitude: -37, longitude: -125 } ],
           explan: 'Wolf',
           neighbors: [ 'Cen', 'Cir', 'Hya', 'Lib', 'Nor', 'Sco', ] },
    Lyn: { abbr: 'Lyn', nom: 'Lynx', gen: 'Lyncis',
           labelPos: [ { latitude: 35, longitude: 137 } ],
           neighbors: [ 'Aur', 'Cam', 'Cnc', 'Gem', 'Leo', 'LMi', 'UMa', ] },
    Lyr: { abbr: 'Lyr', nom: 'Lyra', gen: 'Lyrae',
           labelPos: [ { latitude: 34, longitude: 278 } ],
           neighbors: [ 'Cyg', 'Dra', 'Her', 'Vul', ],
		   main: [ 'alpha', 'beta', 'gamma', 'delta^2', 'zeta^1' ] },
    Men: { abbr: 'Men', nom: 'Mensa', gen: 'Mensae',
           labelPos: [ { latitude: -73, longitude: 86 } ],
           explan: 'Table',
           neighbors: [ 'Cha', 'Dor', 'Hyi', 'Oct', 'Vol', ] },
    Mic: { abbr: 'Mic', nom: 'Microscopium', gen: 'Microscopii',
           labelPos: [ { latitude: -42, longitude: -49 } ],
           neighbors: [ 'Cap', 'Gru', 'Ind', 'PsA', 'Sgr', 'Tel', ] },
    Mon: { abbr: 'Mon', nom: 'Monoceros', gen: 'Monocerotis',
           labelPos: [ { latitude: -5, longitude: 115 } ],
           explan: 'One-Horned Rhino',
           neighbors: [ 'CMa', 'CMi', 'Gem', 'Hya', 'Lep', 'Ori', 'Pup' ] },
    Mus: { abbr: 'Mus', nom: 'Musca', gen: 'Muscae',
           labelPos: [ { latitude: -71, longitude: -177.5 } ],
           explan: 'Fly',
           neighbors: [ 'Aps', 'Car', 'Cen', 'Cha', 'Cir', 'Cru', 'TrA' ] },
    Nor: { abbr: 'Nor', nom: 'Norma', gen: 'Normae',
           labelPos: [ { latitude: -48, longitude: -118 } ],
           explan: 'Set Square',
           neighbors: [ 'Ara', 'Cir', 'Lup', 'Sco', 'TrA', ] },
    Oct: { abbr: 'Oct', nom: 'Octans', gen: 'Octantis',
           labelPos: [ { latitude: -85, longitude: -50 } ],
           neighbors: [ 'Aps', 'Cha', 'Hyi', 'Ind', 'Men', 'Pav', 'Tuc', ] },
    Oph: { abbr: 'Oph', nom: 'Ophiuchus', gen: 'Ophiuchi',
           labelPos: [ { latitude: -5, longitude: -95 } ],
           explan: 'Snake Handler',
           neighbors: [ 'Aql', 'Her', 'Lib', 'Sco', 'Ser', 'Sgr' ] },
    Ori: { abbr: 'Ori', nom: 'Orion', gen: 'Orionis',
           labelPos: [ { latitude: -3, longitude: 90 } ],
           explan: 'Hunter', neighbors: [ 'Eri', 'Gem', 'Lep', 'Mon', 'Tau', ], },
    Pav: { abbr: 'Pav', nom: 'Pavo', gen: 'Pavonis',
           labelPos: [ { latitude: -69, longitude: -62 } ],
           explan: 'Peacock',
           neighbors: [ 'Aps', 'Ara', 'Ind', 'Tel', 'TrA', 'Tuc' ], },
    Peg: { abbr: 'Peg', nom: 'Pegasus', gen: 'Pegasi',
           labelPos: [ { latitude: 20, longitude: -5 } ],
           explan: 'Flying Horse in Another Myth',
		   neighbors: [ 'And', 'Aqr', 'Cyg', 'Del', 'Equ', 'Lac', 'Psc', 'Vul' ], },
    Per: { abbr: 'Per', nom: 'Perseus', gen: 'Persei',
           labelPos: [ { latitude: 55, longitude: 54 } ],
           neighbors: [ 'And', 'Ari', 'Aur', 'Cam', 'Cas', 'Tau', 'Tri' ],
           explan: 'Andromeda\'s Rescuer' },
    Phe: { abbr: 'Phe', nom: 'Phoenix', gen: 'Phoenicis',
           labelPos: [ { latitude: -52, longitude: 13 } ],
           neighbors: [ 'Eri', 'For', 'Gru', 'Hyi', 'Scl', 'Tuc', ] },
    Pic: { abbr: 'Pic', nom: 'Pictor', gen: 'Pictoris',
           labelPos: [ { latitude: -53.5, longitude: 87 } ],
           explan: 'Painter',
           neighbors: [ 'Cae', 'Car', 'Col', 'Dor', 'Pup', 'Vol' ], },
    Psc: { abbr: 'Psc', nom: 'Pisces', gen: 'Piscium',
           labelPos: [ { latitude: 2, longitude: 25 } ],
           explan: 'Fishes',
		   neighbors: [ 'And', 'Aql', 'Ari', 'Cet', 'Peg', 'Tri', ], },
    PsA: { abbr: 'PsA', nom: 'Piscis Austrinus', gen: 'Piscis Austrini',
           labelPos: [ { latitude: -25, longitude: 341 } ],
           explan: 'Southern Fish',
           neighbors: [ 'Aqr', 'Cap', 'Gru', 'Mic', 'Scl' ] },
    Pup: { abbr: 'Pup', nom: 'Puppis', gen: 'Puppis',
           labelPos: [ { latitude: -32, longitude: 122 } ],
           explan: 'Poopdeck',
		   neighbors: [ 'CMa', 'Car', 'Col', 'Hya', 'Mon', 'Pic', 'Pyx', 'Vel', ] },
    Pyx: { abbr: 'Pyx', nom: 'Pyxis', gen: 'Pyxidis',
           labelPos: [ { latitude: -38, longitude: 138 } ],
           explan: 'Compass',
		   neighbors: [ 'Ant', 'Hya', 'Pup', 'Vel' ], },
    Ret: { abbr: 'Ret', nom: 'Reticulum', gen: 'Reticuli',
           labelPos: [ { latitude: -68, longitude: 62 } ],
           explan: 'Crosshairs',
		   neighbors: [ 'Dor', 'Eri', 'Hor', 'Hyi', ], },
    Sge: { abbr: 'Sge', nom: 'Sagitta', gen: 'Sagittae',
           labelPos: [ { latitude: 15, longitude: 299 } ],
           explan: 'Arrow',
		   neighbors: [ 'Aql', 'Cyg', 'Del', 'Her', 'Vul' ], },
    Sgr: { abbr: 'Sgr', nom: 'Sagittarius', gen: 'Sagittarii',
           labelPos: [ { latitude: -22, longitude: -66 } ],
           explan: 'Archer',
		   neighbors: [ 'Aql', 'Cap', 'CrA', 'Ind', 'Mic', 'Oph',
						'Sco', 'Sct', 'Ser', 'Sco', 'Tel' ], },
    Sco: { abbr: 'Sco', nom: 'Scorpius', gen: 'Scorpii',
           labelPos: [ { latitude: -30, longitude: 255 } ],
           neighbors: [ 'Ara', 'CrA', 'Lib', 'Lup', 'Nor', 'Oph', 'Sgr', ], },
    Scl: { abbr: 'Scl', nom: 'Sculptor', gen: 'Sculptoris',
           labelPos: [ { latitude: -31, longitude: 2 } ],
           neighbors: [ 'Aqr', 'Cet', 'Eri', 'For', 'Gru', 'Phe', 'PsA', ], },
    Sct: { abbr: 'Sct', nom: 'Scutum', gen: 'Scuti',
           labelPos: [ { latitude: -11, longitude: 276 } ],
           explan: 'Shield',
		   neighbors: [ 'Aql', 'Sgr', 'Ser' ], },
    Ser: { abbr: 'Ser', nom: 'Serpens', gen: 'Serpentis',
           labelPos: [ { latitude: 10, longitude: 241 },
                        { latitude: 2, longitude: 280 },
                        { latitude: -15, longitude: 270 } ],
           explan: 'Serpent',
		   neighbors: [ 'Aql', 'Boo', 'CrB', 'Her', 'Lib',
						'Oph', 'Sgr', 'Sct', 'Vir', 'Vul' ], },
    Sex: { abbr: 'Sex', nom: 'Sextans', gen: 'Sextantis',
           labelPos: [ { latitude: -6.5, longitude: 159 } ],
           neighbors: [ 'Crt', 'Hya', 'Leo', ], },
    Tau: { abbr: 'Tau', nom: 'Taurus', gen: 'Tauri', neighbors: [],
           labelPos: [ { latitude: 20, longitude: 80 } ],
           explan: 'Bull, Protecting<br>Pleiades from Orion',
		   neighbors: [ 'Ari', 'Aur', 'Cet', 'Eri', 'Gem', 'Ori', 'Per', ],
		 },
    Tel: { abbr: 'Tel', nom: 'Telescopium', gen: 'Telescopii',
           labelPos: [ { latitude: -57.7, longitude: 290 } ],
           neighbors: [ 'Ara', 'CrA', 'Ind', 'Mic', 'Pav', 'Sgr', ], },
    Tri: { abbr: 'Tri', nom: 'Triangulum', gen: 'Trianguli',
           labelPos: [ { latitude: 34.5, longitude: 27 } ],
		   main: [ 'alpha', 'beta', 'gamma' ],
           neighbors: [ 'And', 'Ari', 'Per', 'Psc', ] },
    TrA: { abbr: 'TrA', nom: 'Triangulum Australe', gen: 'Trianguli Austalis',
           labelPos: [ { latitude: -71, longitude: -141 } ],
           explan: 'Southern Triangle',
		   neighbors: [ 'Aps', 'Ara', 'Cir', 'Nor', ], },
    Tuc: { abbr: 'Tuc', nom: 'Tucana', gen: 'Tucanae',
           labelPos: [ { latitude: -65, longitude: 15 } ],
           neighbors: [ 'Eri', 'Gru', 'Hyi', 'Ind', 'Oct', 'Phe', ], },
    UMa: { abbr: 'UMa', nom: 'Ursa Major', gen: 'Ursae Majoris',
           labelPos: [ { latitude: 50, longitude: 155 } ],
           explan: 'Greater Bear',
           neighbors: [ 'Boo', 'Cam', 'CVn', 'Com', 'Dra', 'Leo', 'LMi', 'Lyn', ], },
    UMi: { abbr: 'UMi', nom: 'Ursa Minor', gen: 'Ursae Minoris',
           labelPos: [ { latitude: 82, longitude: 210 } ],
           explan: 'Lesser Bear, Little Dipper', neighbors: [],
		   main: [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
				   'zeta', 'eta' ],
		   neighbors: [ 'Cam', 'Cep', 'Dra' ],
		 },
    Vel: { abbr: 'Vel', nom: 'Vela', gen: 'Velorum',
           labelPos: [ { latitude: -51, longitude: 140 } ],
           explan: 'Sails',
		   neighbors: [ 'Ant', 'Car', 'Cen', 'Pup', 'Pyx', ],  },
    Vir: { abbr: 'Vir', nom: 'Virgo', gen: 'Virginis',
           labelPos: [ { latitude: -5, longitude: -157 } ],
           neighbors: [ 'Boo', 'Com', 'Crv', 'Crt', 'Hya', 'Leo', 'Lib', 'Ser', ], },
    Vol: { abbr: 'Vol', nom: 'Volans', gen: 'Volantis',
           labelPos: [ { latitude: -73, longitude: 107 } ],
           explan: 'Flying Fish',
		   neighbors: [ 'Car', 'Cha', 'Dor', 'Men', 'Pic', ], },
    Vul: { abbr: 'Vul', nom: 'Vulpecula', gen: 'Vulpeculae',
           labelPos: [ { latitude: 24, longitude: 307 } ],
           explan: 'Fox Cub',
		   neighbors: [ 'Cyg', 'Del', 'Her', 'Lyr', 'Peg', 'Sge' ], },
};


let colorCandidates = [ 0, 1, 2, 3, 4, 5, ];

let noConstellation = { abbr: '', nom: '', gen: '',
                        color: colorCandidates.length };


function compare( const1, const2 ) {

    if ( const1.nom < const2.nom ) {

        return -1;
        
    } else if ( const1.nom === const2.nom ) {

        return 0;

    } else {

        return 1;

    }
        
}


function colorConstellations() {

    let constellationList = [];
    let cstl;
    
    for ( cstl in constellations ) {

        constellations[ cstl ].colors = colorCandidates.slice( 0 );
        constellationList.push( constellations[ cstl ] );

    }

    constellationList.sort( compare );

    let idx, jdx, kdx, colorNo;
    let constellation, neighbors, neighbor;
    
    for ( idx = 0; idx < constellationList.length; idx++ ) {

        constellation = constellationList[ idx ];

        colorNo = constellation.colors[ randomInt( constellation.colors.length ) ];
        constellation.color = colorNo;
        
        neighbors = constellation.neighbors;
        for ( jdx = 0; jdx < neighbors.length; jdx++ ) {

            neighbor = constellations[ neighbors[ jdx ] ];
            kdx = neighbor.colors.indexOf( colorNo );
            if (kdx >= 0 ) {
                
                neighbor.colors.splice( kdx, 1 );
                if ( neighbor.colors.length === 0 ) {

                    return false;

                }

			}

		}

	}

    for ( idx = 0; idx < constellationList.length; idx++ ) {

		constellation = constellationList[ idx ];
	    delete constellation.colors;

    }
    return true;
}

let found = false;
for ( idx = 0; idx < 100 && !found; idx++ ) {

    found = colorConstellations();
    if ( !found ) {

        console.log( 'failed' );

    }
}

if ( found ) {

    constellations[ '' ] = noConstellation;

    // set constellation stars and bounding box

	let allStars = [];
	let mainStars = [];

	//setMain( constellations );
	makeStarList( constellations, allStars, mainStars );

    // for ( let cnstl in constellations ) {
    //     if ( constellations.hasOwnProperty( cnstl ) ) {

    //         box = new THREE.Box3();
    //         constell = constellations[ cnstl ];

	// 		let main = null;
	// 		if ( constell.main ) {

	// 			main = {};
	// 			let cmain = constell.main;
	// 			let len = cmain.length;

	// 			for ( let idx = 0; idx < len; idx ++ ) {

	// 				main[ cmain[ idx ] ] = true;

	// 			}

	// 		}

	// 		let stardata = starsByConstellation[ cnstl ];
    //         constell.stars = stardata;

    //         for (let idx = 0; idx < stardata.length; idx++) {
    //             let star = stardata[idx];
	// 			if ( main ) {

	// 				star.main = !! main[ star.letter ];

	// 			}
    //             spherical.set( shellRadius,
    //                            (90 - star.latitude) * Math.PI/180,
    //                            (star.longitude - 270) * Math.PI/180 );
    //             point.setFromSpherical( spherical );
                    
    //             box.expandByPoint( point );

    //         }

    //         constell.box = { min: { x: box.min.x, y: box.min.y },
    //                          max: { x: box.max.x, y: box.max.y }, };

	// 	}

	// }

    let fs = require( 'fs' );

    let writer = fs.createWriteStream( process.argv[ 2 ] );

	writer.write( '// From "Conservative 7-Color Palette" in http://mkweb.bcgsc.ca/colorblind/\n' );
    writer.write( 'let colors = [\n\n' );
    writer.write( "     'rgb(0,114,178)', // blue\n" );
    writer.write( "     'rgb(230,100,0)', // orange\n" );
    writer.write( "     'rgb(86,180,233)', // sky blue\n" );
    writer.write( "     'rgb(204,121,167)', // reddish purple\n" );
    writer.write( "     'rgb(240,228,66)', // yellow\n" );
    writer.write( "     'rgb(0,158,115)', // bluish green\n" );
    writer.write( "     'green', // for planets\n" );
    writer.write( "     'grey', // for stars without constellation\n\n" );
    writer.write( '];\n\n' );

    writer.write( 'let constellations =\n' );
    writer.write( JSON.stringify( constellations, undefined, '\t' ) );
	writer.write( ';\n\n' );
	writer.write( 'let allStars =\n' );
    writer.write( JSON.stringify( allStars, undefined, '\t' ) );
	writer.write( ';\n\n' );
	writer.write( 'let mainStars =\n' );
    writer.write( JSON.stringify( mainStars, undefined, '\t' ) );
	writer.write( ';\n\n' );
	
	writer.write( 'export { colors, constellations, allStars, mainStars };\n' );

    writer.end( '' );

    writer.on( 'finish', () => { console.log( 'finished ' ); } );
}

// function setMain( constellations ) {

//     for ( let cnstl in constellations ) {

//         if ( constellations.hasOwnProperty( cnstl ) ) {

// 			let constell = constellations( cnstl );
// 			if ( constell.main ) {

// 				let main = constell.main;
// 				let stardata = starsByConstellation[ cnstl ];
// 				for ( let idx = 0; idx < stardata.length; idx ++ ) {

// 					stardata[ idx ].main = main.indexOf( star.letter ) >= 0;

// 				}

// 			}

// 		}

// 	}

// }

function makeStarList( constellations, list, mainStars ) {

	let box;
    let point = new THREE.Vector3();
    let spherical = new THREE.Spherical();
	
    for ( let cnstl in constellations ) {

        if ( constellations.hasOwnProperty( cnstl ) ) {

            box = new THREE.Box3();
			let constell = constellations[ cnstl ];
			let stardata = starsByConstellation[ cnstl ];
			constell.stars = [];
			for ( let idx = 0; idx < stardata.length; idx ++ ) {

				let star = stardata[ idx ];
				star.constell = cnstl;
				if ( constell.main ) {

					star.main = constell.main.indexOf( star.letter ) >= 0;

				}

				list.push( star );

                spherical.set( shellRadius,
                               (90 - star.latitude) * Math.PI/180,
                               (star.longitude - 270) * Math.PI/180 );
                point.setFromSpherical( spherical );
                    
                box.expandByPoint( point );

            }

            constell.box = { min: { x: box.min.x, y: box.min.y },
                             max: { x: box.max.x, y: box.max.y }, };

		}

	}

	list.sort( function ( s1, s2 ) {

		return s1.magnitude - s2.magnitude;

	} );

	for ( let idx = 0; idx < list.length; idx ++ ) {

		let star = list[ idx ];
		star.serialNo = idx;
		constellations[ star.constell ].stars.push( idx );

		if ( isMain( star ) ) {

			mainStars.push( idx );

		}

	}

}

function getWellKnownName( star ) {

	let letter = star.letter || star.desigNo;

	if ( star.constell ) {

		let constellStars = Star.wellKnownStarNames[ star.constell ];
		return constellStars && constellStars[ letter ];

	}
	return undefined;

}

function isMain( star ) {

	if (star.main === undefined ) {

		star.main =
			star.constell !== '' &&
			( star.magnitude <= 3.9 || !! getWellKnownName( star ) );

	}

	return star.main;

}

