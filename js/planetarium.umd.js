(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three'), require('Detector'), require('numericjs')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three', 'Detector', 'numericjs'], factory) :
	(factory((global.DOGULEAN = {}),global.THREE,global.Detector,global.numeric));
}(this, (function (exports,THREE$1,Detector,numeric) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

function deepCopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}
var SSettings = function () {
	function SSettings(defaults$$1, source) {
		classCallCheck(this, SSettings);
		this.source = source;
		var settingsJSON = source ? localStorage.getItem(source) : null;
		this.settings = settingsJSON && JSON.parse(settingsJSON) || {};
		if (defaults$$1) {
			this.defaults = deepCopy(defaults$$1);
			SSettings.reconcile(this.settings, this.defaults);
			localStorage.setItem(source, JSON.stringify(this.settings));
		}
		this.listeners = {};
	}
	createClass(SSettings, [{
		key: 'addListener',
		value: function addListener(section, item, listener) {
			if (!this.listeners[section]) {
				this.listeners[section] = {};
			}
			if (!this.listeners[section][item]) {
				this.listeners[section][item] = [listener];
			} else {
				this.listeners[section][item].push(listener);
			}
		}
	}, {
		key: 'fireListeners',
		value: function fireListeners(section, item, val) {
			if (!this.listeners[section]) {
				return;
			}
			var listeners = this.listeners[section][item];
			if (listeners) {
				for (var idx = 0; idx < listeners.length; idx++) {
					listeners[idx](val);
				}
			}
		}
	}, {
		key: 'get',
		value: function get$$1(section, item, defaultVal) {
			var sec = this.settings[section];
			return sec ? sec[item] : defaultVal;
		}
	}, {
		key: 'set',
		value: function set$$1(section, item, value) {
			if (!this.settings[section] || this.settings[section][item] !== value) {
				if (!this.settings[section]) {
					this.settings[section] = {};
				}
				this.settings[section][item] = value;
				if (this.source) {
					localStorage.setItem(this.source, JSON.stringify(this.settings));
				}
				this.fireListeners(section, item, value);
			}
		}
	}, {
		key: 'restoreDefaults',
		value: function restoreDefaults(section) {
			if (section) {
				if (this.defaults.hasOwnProperty(section)) {
					this.settings[section] = deepCopy(this.defaults[section]);
					localStorage.setItem(this.source, JSON.stringify(this.settings));
					this.fireListeners(section, 'restore');
				}
			} else {
				this.settings = deepCopy(this.defaults);
				localStorage.setItem(this.source, JSON.stringify(this.settings));
			}
		}
	}], [{
		key: 'reconcile',
		value: function reconcile(settings, defaults$$1) {
			var section;
			for (section in settings) {
				if (settings.hasOwnProperty(section)) {
					if (!defaults$$1.hasOwnProperty(section)) {
						delete settings[section];
					} else {
						var settingsSection = settings[section];
						var defaultsSection = defaults$$1[section];
						if ((typeof settingsSection === 'undefined' ? 'undefined' : _typeof(settingsSection)) === 'object' && (typeof defaultsSection === 'undefined' ? 'undefined' : _typeof(defaultsSection)) === 'object') {
							this.reconcile(settingsSection, defaultsSection);
						} else if ((typeof settingsSection === 'undefined' ? 'undefined' : _typeof(settingsSection)) !== (typeof defaultsSection === 'undefined' ? 'undefined' : _typeof(defaultsSection))) {
							settings[section] = deepCopy(defaultsSection);
						}
					}
				}
			}
			for (section in defaults$$1) {
				if (!settings.hasOwnProperty(section) && defaults$$1.hasOwnProperty(section)) {
					settings[section] = deepCopy(defaults$$1[section]);
				}
			}
		}
	}]);
	return SSettings;
}();
var defaultSettings = {
	location: {
		planet: 'earth',
		latitude: 500,
		longitude: 500,
		altitude: 1
	},
	view: {
		elevation: 25,
		rotation: 0,
		zoom: 1,
		lines: true
	},
	planets: {
		planetmag: 40,
		planetcolor: 'natural',
		sunmoonmag: 5,
		sunbrightness: 1.2
	},
	stars: {
		starradius: 1,
		starbrightness: 20,
		colorlevel: 5
	},
	time: {
		realtime: true,
		rate: 1,
		timeset: 0,
		stopped: false
	},
	compass: {
		correction: 500
	}
};
var ssettings = new SSettings(defaultSettings, 'settings');

var v3tmp = new THREE$1.Vector3();
var Utils = function () {
	function Utils() {
		classCallCheck(this, Utils);
	}
	createClass(Utils, null, [{
		key: 'setLatLong',
		value: function setLatLong(obj, latitude, longitude) {
			latitude = Math.PI / 2 - Utils.radians(latitude);
			longitude = Utils.radians(longitude);
			var euler = new THREE.Euler(0, longitude, -latitude);
			obj.setRotationFromEuler(euler);
		}
	}, {
		key: 'rotate',
		value: function rotate(obj, elevation, rotation) {
			var euler = new THREE.Euler(elevation, -rotation + Math.PI / 2, 0, 'YXZ');
			obj.setRotationFromEuler(euler);
		}
	}, {
		key: 'rotateAroundQuaternion',
		value: function rotateAroundQuaternion(obj, q, p) {
			var pos = p || obj.position.clone();
			obj.position.sub(pos);
			obj.setRotationFromQuaternion(q);
			obj.position.add(pos);
		}
	}, {
		key: 'rotateAroundAxisAngle',
		value: function rotateAroundAxisAngle(obj, axis, angle, p) {
			var pos = p || obj.position.clone();
			obj.position.sub(pos);
			obj.setRotationFromAxisAngle(axis, angle);
			obj.position.add(pos);
		}
	}, {
		key: 'quaternionToEuler',
		value: function quaternionToEuler(q, order) {
			order = order || 'XYZ';
			var euler = new THREE$1.Euler(0, 0, 0, order);
			euler.setFromQuaternion(q);
			return euler;
		}
	}, {
		key: 'getQuaternion',
		value: function getQuaternion(ctr, start, end, q) {
			var v1 = new THREE$1.Vector3().subVectors(start, ctr);
			v1.normalize();
			var v2 = new THREE$1.Vector3().subVectors(end, ctr);
			v2.normalize();
			q = q || new THREE$1.Quaternion();
			return q.setFromUnitVectors(v1, v2);
		}
	}, {
		key: 'radians',
		value: function radians(degrees) {
			return Math.PI * (degrees / 180);
		}
	}, {
		key: 'degrees',
		value: function degrees(radians) {
			return 180 * (radians / Math.PI);
		}
	}, {
		key: 'cosd',
		value: function cosd(degrees) {
			return Math.cos(Utils.radians(degrees));
		}
	}, {
		key: 'sind',
		value: function sind(degrees) {
			return Math.sin(Utils.radians(degrees));
		}
	}, {
		key: 'acosd',
		value: function acosd(x) {
			return Utils.degrees(Math.acos(x));
		}
	}, {
		key: 'asind',
		value: function asind(y) {
			return Utils.degrees(Math.asin(y));
		}
	}, {
		key: 'roundTo1',
		value: function roundTo1(num) {
			return Math.round(num * 10) / 10;
		}
	}, {
		key: 'roundTo2',
		value: function roundTo2(num) {
			return Math.round(num * 100) / 100;
		}
	}, {
		key: 'clamp',
		value: function clamp(x, min, max) {
			if (x === undefined) return undefined;
			return x < min ? min : x > max ? max : x;
		}
	}, {
		key: 'getWorldCoordinates',
		value: function getWorldCoordinates(obj, vector) {
			vector = vector || new THREE$1.Vector3();
			obj.updateMatrixWorld();
			vector.setFromMatrixPosition(obj.matrixWorld);
			return vector;
		}
	}, {
		key: 'getProjectedCoordinates',
		value: function getProjectedCoordinates(obj, camera, vector) {
			vector = Utils.getWorldCoordinates(obj, vector);
			vector.project(camera);
			return vector;
		}
	}, {
		key: 'toScreenPosition',
		value: function toScreenPosition(obj, camera, renderer, vector, vector2) {
			vector = vector || new THREE$1.Vector3();
			Utils.getProjectedCoordinates(obj, camera, vector);
			return Utils.projectedCoordinatesToScreen(vector, renderer, vector2);
		}
	}, {
		key: 'worldCoordsToScreen',
		value: function worldCoordsToScreen(vector, camera, renderer, vector2) {
			vector.project(camera);
			return Utils.projectedCoordinatesToScreen(vector, renderer, vector2);
		}
	}, {
		key: 'projectedCoordinatesToScreen',
		value: function projectedCoordinatesToScreen(vector, renderer, vector2) {
			var widthHalf = 0.5 * renderer.context.canvas.width;
			var heightHalf = 0.5 * renderer.context.canvas.height;
			vector2 = vector2 || new THREE$1.Vector2();
			vector2.set(vector.x * widthHalf + widthHalf, -(vector.y * heightHalf) + heightHalf);
			if (vector2.x >= 0 && vector2.y >= 0 && vector2.x < 2 * widthHalf && vector2.y < 2 * heightHalf) {
				return vector2;
			} else {
				return null;
			}
		}
	}, {
		key: 'screenCoordsToWorld',
		value: function screenCoordsToWorld(coords, camera, renderer, vector) {
			vector = vector || new THREE$1.Vector3();
			vector = Utils.screenCoordinatesToProjected(coords, renderer, vector);
			vector.z = -1;
			vector.unproject(camera);
			return vector;
		}
	}, {
		key: 'screenCoordinatesToProjected',
		value: function screenCoordinatesToProjected(coords, renderer, vector) {
			var widthHalf = 0.5 * renderer.domElement.clientWidth;
			var heightHalf = 0.5 * renderer.domElement.clientHeight;
			vector = vector || new THREE$1.Vector2();
			vector.set((coords.x - widthHalf) / widthHalf, -(coords.y - heightHalf) / heightHalf);
			return vector;
		}
	}, {
		key: 'findScreenUpDirection',
		value: function findScreenUpDirection(camera, renderer, end) {
			end = end || new THREE$1.Vector3();
			var start = v3tmp;
			Utils.screenCoordsToWorld({ x: 100, y: 200 }, camera, renderer, start);
			Utils.screenCoordsToWorld({ x: 100, y: 100 }, camera, renderer, end);
			return end.sub(start).normalize();
		}
	}, {
		key: 'getCameraFrustum',
		value: function getCameraFrustum(camera, frustum) {
			frustum = frustum || new THREE$1.Frustum();
			frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
			return frustum;
		}
	}, {
		key: 'makeBox',
		value: function makeBox(x, y, w, h, box) {
			box = box || new THREE$1.Box2();
			box.min.x = x;
			box.min.y = y;
			box.max.x = x + w;
			box.max.y = y + h;
			return box;
		}
	}, {
		key: 'randomInt',
		value: function randomInt(n) {
			return n === 1 ? 0 : Math.floor(n * Math.random());
		}
	}, {
		key: 'vectorToString',
		value: function vectorToString(v) {
			var str = '(';
			str += Utils.roundTo2(v.x);
			str += ', ';
			str += Utils.roundTo2(v.y);
			if (v.z !== undefined) {
				str += ', ';
				str += Utils.roundTo2(v.z);
			}
			if (v.w !== undefined) {
				str += ', ';
				str += Utils.roundTo2(v.w);
			}
			str += ')';
			return str;
		}
	}, {
		key: 'printWorldOrientationAndPosition',
		value: function printWorldOrientationAndPosition(obj, name) {
			obj.parent.updateMatrixWorld();
			var wpos = obj.getWorldPosition();
			var wq = obj.getWorldQuaternion();
			var yaxis = Utils.yaxis.clone();
			yaxis.applyQuaternion(wq);
			var ws = new THREE$1.Spherical().setFromVector3(yaxis);
			var msg = name ? name + ': ' : '';
			msg += 'world position: (' + Utils.roundTo2(wpos.x) + ', ' + Utils.roundTo2(wpos.y) + ', ' + Utils.roundTo2(wpos.z) + '), ' + 'axis: RA ' + Utils.degrees(ws.theta) + ', D ' + (90 - Utils.degrees(ws.phi));
			console.log(msg);
		}
	}, {
		key: 'astroToSpherical',
		value: function astroToSpherical(dist, decl, ra, sph) {
			sph = sph || new THREE$1.Spherical();
			sph.set(dist, Math.PI / 2 - Utils.radians(decl), Utils.radians(ra) - Math.PI / 2);
			return sph;
		}
	}]);
	return Utils;
}();
Utils.sqrt2 = Math.sqrt(2);
Utils.origin = new THREE$1.Vector3(0, 0, 0);
Utils.xaxis = new THREE$1.Vector3(1, 0, 0);
Utils.yaxis = new THREE$1.Vector3(0, 1, 0);
Utils.zaxis = new THREE$1.Vector3(0, 0, 1);

var Time = function Time(baseTime, rate, stopped) {
	this.baseTime = baseTime || Date.now();
	this.rate = rate;
	this.clockStarted = Date.now();
	this.stopped = !!stopped;
};
Time.prototype = {};
Time.prototype.constructor = Time;
Time.prototype.setRate = function (rate) {
	if (!this.stopped) {
		var now = Date.now();
		this.baseTime += this.rate * (now - this.clockStarted);
		this.clockStarted = now;
	}
	this.rate = rate;
};
Time.prototype.stop = function () {
	if (!this.stopped) {
		this.baseTime += this.rate * (Date.now() - this.clockStarted);
		this.stopped = true;
	}
};
Time.prototype.start = function () {
	if (this.stopped) {
		this.clockStarted = Date.now();
		this.stopped = false;
	}
};
Time.prototype.getRate = function () {
	return this.rate;
};
Time.prototype.increment = function (timeChange) {
	this.baseTime += timeChange;
};
Time.prototype.getTime = function () {
	return this.baseTime + (this.stopped ? 0 : this.rate * (Date.now() - this.clockStarted));
};
Time.prototype.setTime = function (newTime) {
	this.baseTime = newTime;
	this.clockStarted = Date.now();
};
Time.prototype.incrementTime = function (timeMod) {
	var years = timeMod.years || 0;
	var months = timeMod.months || 0;
	var days = timeMod.days || 0;
	var hours = timeMod.hours || 0;
	var minutes = timeMod.minutes || 0;
	var seconds = timeMod.seconds || 0;
	var millis = timeMod.millis || 0;
	if (!(years || months || days || hours || minutes || seconds || millis)) {
		return;
	}
	millis += seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 24 * 3600000;
	this.baseTime += millis;
	if (months || years) {
		var date = new Date(this.getTime());
		months += date.getUTCMonth();
		years += date.getUTCFullYear();
		years += months / 12;
		months = (months + 12) % 12;
		date.setUTCFullYear(years);
		date.setUTCMonth(months);
		this.setTime(date.getTime());
	}
};

var greekAlpha = {
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
	thetasym: '\u03D1',
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
	omega: '\u03C9'
};
var subscripts = {
	'0': '\u2080',
	'1': '\u2081',
	'2': '\u2082',
	'3': '\u2083',
	'4': '\u2084',
	'5': '\u2085',
	'6': '\u2086',
	'7': '\u2087',
	'8': '\u2088',
	'9': '\u2089'
};
var superscripts = {
	'0': '\u2070',
	'1': '\xB9',
	'2': '\xB2',
	'3': '\xB3',
	'4': '\u2074',
	'5': '\u2075',
	'6': '\u2076',
	'7': '\u2077',
	'8': '\u2078',
	'9': '\u2079'
};
var Text = function () {
	function Text() {
		classCallCheck(this, Text);
	}
	createClass(Text, null, [{
		key: 'charAscends',
		value: function charAscends(ch) {
			return (
				'0' <= ch && ch <= '9' || ch === greekAlpha.beta || ch === greekAlpha.delta || ch === greekAlpha.zeta || ch === greekAlpha.theta || ch === greekAlpha.lambda || ch === greekAlpha.xi || ch === greekAlpha.chi
			);
		}
	}, {
		key: 'charDescends',
		value: function charDescends(ch) {
			return ch === greekAlpha.beta || ch === greekAlpha.gamma || ch === greekAlpha.zeta || ch === greekAlpha.eta || ch === greekAlpha.mu || ch === greekAlpha.xi || ch === greekAlpha.rho || ch === greekAlpha.phi || ch === greekAlpha.chi || ch === greekAlpha.psi;
		}
	}, {
		key: 'stringAscends',
		value: function stringAscends(strs) {
			switch (strs.length) {
				case 0:
					return false;
				case 1:
					var str = strs[0];
					return str.length > 1 || Text.charAscends(str);
				default:
					return true;
			}
		}
	}, {
		key: 'stringDescends',
		value: function stringDescends(strs) {
			switch (strs.length) {
				case 0:
					return false;
				case 1:
					var str = strs[0];
					switch (str.length) {
						case 0:
							return false;
						case 1:
							return Text.charDescends(str);
						case 2:
							return !(Text.isLowerGreek(str.charAt(0)) && Text.isSuperscript(str.charAt(1)));
						default:
							return true;
					}
				default:
					return true;
			}
		}
	}, {
		key: 'isLowerGreek',
		value: function isLowerGreek(ch) {
			return greekAlpha.alpha <= ch && ch <= greekAlpha.omega;
		}
	}, {
		key: 'isSuperscript',
		value: function isSuperscript(ch) {
			switch (ch) {
				case superscripts['0']:
				case superscripts['1']:
				case superscripts['2']:
				case superscripts['3']:
					return true;
				default:
					return superscripts['4'] <= ch && ch <= superscripts['9'];
			}
		}
	}]);
	return Text;
}();

var colors=['rgb(0,114,178)',
'rgb(230,100,0)',
'rgb(96,190,243)',
'rgb(204,121,167)',
'rgb(240,228,66)',
'rgb(0,158,115)',
'green',
'grey'];var constellations={'And':{'abbr':'And','nom':'Andromeda','gen':'Andromedae','labelPos':[{'latitude':36.5,'longitude':-2}],'neighbors':['Cas','Lac','Peg','Per','Psc','Tri'],'explan':'&AElig;thiopian Princess<br>To be Eaten by Cetus','color':4,'stars':[56,58,61,225,317,336,411,440,559,570,604,669,694,735,746,799,902,914,1059,1071,1127,1148,1233,1316,1467],'box':{'min':{'x':2765639230.0682635,'y':1994682959.5135384},'max':{'x':4454136523.611826,'y':3757255969.2288876}}},'Ant':{'abbr':'Ant','nom':'Antlia','gen':'Antliae','labelPos':[{'latitude':-32,'longitude':147}],'explan':'Ship\'s Pump','neighbors':['Crt','Hya','Pyx','Vel'],'color':3,'stars':[691,901,946,1028,1268,1416],'box':{'min':{'x':-3951644788.2401485,'y':-3025240924.5033665},'max':{'x':-3207683228.385484,'y':-2335818130.4780874}}},'Aps':{'abbr':'Aps','nom':'Apus','gen':'Apodis','labelPos':[{'latitude':-80,'longitude':-90}],'explan':'Bird of Paradise','neighbors':['Ara','Cha','Cir','Mus','Oct','Pav','Psc','TrA'],'color':3,'stars':[417,444,650,980,1355,1360,1427],'box':{'min':{'x':-964871312.0767547,'y':-4910082780.895108},'max':{'x':-265309690.70585945,'y':-4702604101.845918}}},'Aqr':{'abbr':'Aqr','nom':'Aquarius','gen':'Aquarii','labelPos':[{'latitude':-16,'longitude':-10}],'explan':'Water Bearer','neighbors':['Aql','Cap','Cet','Del','Peg','Psc','PsA','Scl'],'color':4,'stars':[156,164,227,339,350,375,397,442,493,534,543,610,639,651,695,781,803,823,876,885,899,979,1006,1039,1055,1140,1161,1212,1260,1277,1278,1402],'box':{'min':{'x':3310370869.3289375,'y':-2005613568.4410412},'max':{'x':4878442131.200668,'y':127977090.22178088}}},'Aql':{'abbr':'Aql','nom':'Aquila','gen':'Aquilae','labelPos':[{'latitude':5,'longitude':303}],'explan':'Eagle','neighbors':['Aqr','Cap','Del','Equ','Her','Oph','Sct','Ser','Sge','Sgr'],'color':3,'stars':[11,117,171,219,248,268,365,448,523,526,715,765,844,1094,1102,1113,1154,1238,1301,1333,1350,1425],'box':{'min':{'x':1257932441.573596,'y':-929859321.1375039},'max':{'x':3200694855.681703,'y':1315322411.9049454}}},'Ara':{'abbr':'Ara','nom':'Ara','gen':'Arae','labelPos':[{'latitude':-61,'longitude':258}],'explan':'Altar','neighbors':['Aps','CrA','Nor','Pav','Sco','Tel','TrA'],'color':2,'stars':[140,141,194,233,325,340,392,552,1208],'box':{'min':{'x':-763032058.6599082,'y':-4360188990.961968},'max':{'x':111865565.44796576,'y':-3823943167.4716654}}},'Ari':{'abbr':'Ari','nom':'Aries','gen':'Arietis','labelPos':[{'latitude':20,'longitude':35}],'neighbors':['Cet','Per','Psc','Tau','Tri'],'color':5,'stars':[49,104,330,759,964,1070,1296,1386,1418],'box':{'min':{'x':2961213590.9288926,'y':1307018105.9645355},'max':{'x':4089420866.9471674,'y':2330436728.950121}}},'Aur':{'abbr':'Aur','nom':'Auriga','gen':'Aurigae','labelPos':[{'latitude':46,'longitude':97}],'explan':'Charioteer','neighbors':['Cam','Gem','Lyn','Per','Tau'],'color':3,'stars':[5,41,107,112,181,206,357,369,500,704,721,983,994,1051,1089,1097,1124,1264,1271,1276,1389],'box':{'min':{'x':-1380584926.0528045,'y':2461363157.10958},'max':{'x':1115774648.7545671,'y':4130936812.8478236}}},'Boo':{'abbr':'Boo','nom':'Boötes','gen':'Boötis','labelPos':[{'latitude':30,'longitude':213}],'explan':'Ploughman','neighbors':['Com','CrB','CVn','Dra','Her','Ser','UMa','Vir'],'color':5,'stars':[2,81,109,183,272,280,311,399,535,538,615,718,871,897,910,1016,1041,1054,1108,1162,1216,1285,1354,1358,1362],'box':{'min':{'x':-4266230577.504822,'y':1118308429.7108912},'max':{'x':-2208346210.784242,'y':3927687793.868626}}},'Cae':{'abbr':'Cae','nom':'Caelum','gen':'Caeli','labelPos':[{'latitude':-42.4,'longitude':76}],'explan':'Sky','neighbors':['Col','Dor','Eri','For','Hor','Lep','Pic'],'color':0,'stars':[834,1163,1180],'box':{'min':{'x':1256996702.4296243,'y':-3530412169.0243793},'max':{'x':1335350785.3716762,'y':-3016819274.836862}}},'Cam':{'abbr':'Cam','nom':'Camelopardalis','gen':'Camelopardalis','labelPos':[{'latitude':72,'longitude':88}],'explan':'Giraffe','neighbors':['Aur','Cas','Cep','Dra','Lyn','Per','UMa','UMi'],'color':1,'stars':[528,668,784,821,940,1169,1202,1306,1339,1371],'box':{'min':{'x':-432946543.8516856,'y':4033678314.006494},'max':{'x':1260038162.675379,'y':4738402895.566244}}},'Cnc':{'abbr':'Cnc','nom':'Cancer','gen':'Cancri','labelPos':[{'latitude':14,'longitude':127}],'neighbors':['CMi','Gem','Hya','Leo','LMi','Lyn'],'color':3,'stars':[296,482,533,672,971,1215,1230,1272,1273,1325],'box':{'min':{'x':-3604533739.96232,'y':793424725.015444},'max':{'x':-2569524788.6932087,'y':2675413273.520367}}},'CVn':{'abbr':'CVn','nom':'Canes Venatici','gen':'Canum Venaticorum','labelPos':[{'latitude':40,'longitude':-175}],'explan':'Hunting Dogs','neighbors':['Boo','Com','UMa'],'color':1,'stars':[154,658,1003,1092,1147,1254,1300,1365],'box':{'min':{'x':-3890132700.2964454,'y':2918105588.467712},'max':{'x':-3274362689.8155093,'y':3767091381.6056633}}},'CMa':{'abbr':'CMa','nom':'Canis Major','gen':'Canis Majoris','labelPos':[{'latitude':-18,'longitude':108}],'explan':'Orion\'s Larger Hunting Dog','neighbors':['Col','Lep','Mon','Ori','Pup'],'color':2,'stars':[0,22,37,47,88,179,180,284,286,457,485,521,558,574,744,772,775,814,819,860,919],'box':{'min':{'x':-1576016592.712486,'y':-2693267057.8853574},'max':{'x':-395643747.32343996,'y':-1044823775.2703589}}},'CMi':{'abbr':'CMi','nom':'Canis Minor','gen':'Canis Minoris','labelPos':[{'latitude':4,'longitude':110}],'explan':'Orion\'s Smaller Hunting Dog','neighbors':['Cnc','Gem','Hya','Mon'],'color':5,'stars':[7,153,731,927,1209,1282],'box':{'min':{'x':-2357976216.8219743,'y':150172991.7824693},'max':{'x':-1855608671.497127,'y':1036928460.2101957}}},'Cap':{'abbr':'Cap','nom':'Capricornus','gen':'Capricorni','labelPos':[{'latitude':-21,'longitude':-32}],'neighbors':['Aqr','Aql','Mic','PsA','Sgr'],'color':2,'stars':[143,184,314,354,387,561,588,595,692,703,884,896,1185,1224,1450],'box':{'min':{'x':2776224154.0107465,'y':-2258480645.7977977},'max':{'x':4148711643.5224805,'y':-1078200295.2530942}}},'Car':{'abbr':'Car','nom':'Carina','gen':'Carinae','labelPos':[{'latitude':-60,'longitude':118}],'explan':'Keel','neighbors':['Cen','Cha','Mus','Pic','Pup','Vel','Vol'],'color':5,'stars':[1,28,40,65,120,160,228,232,252,269,273,356,475,719,805,893,1104,1221,1463],'box':{'min':{'x':-2507435138.807383,'y':-4702192184.8323345},'max':{'x':-321142931.8809287,'y':-3977683820.0524616}}},'Cas':{'abbr':'Cas','nom':'Cassiopeia','gen':'Cassiopeiae','labelPos':[{'latitude':67.5,'longitude':7}],'neighbors':['And','Cam','Cep','Lac','Per'],'explan':'&AElig;thiopian Queen<br>Andromeda\'s Mother','main':['alpha','beta','gamma','delta','epsilon'],'color':5,'stars':[63,72,74,108,244,271,352,486,609,738,855,878,904,1001,1118,1123,1198,1243,1302],'box':{'min':{'x':1285150661.7131271,'y':3737822830.1184015},'max':{'x':3255131477.583401,'y':4784795680.525747}}},'Cen':{'abbr':'Cen','nom':'Centaurus','gen':'Centauri','labelPos':[{'latitude':-55.5,'longitude':-147},{'latitude':-44,'longitude':-164}],'neighbors':['Ant','Car','Cir','Cru','Hya','Lib','Lup','Mus','Vel'],'color':2,'stars':[3,10,20,53,64,75,79,95,98,122,190,198,259,276,418,435,447,461,467,501,542,618,645,681,741,767,802,1143,1430,1456],'box':{'min':{'x':-3752439986.3421125,'y':-4459654418.267701},'max':{'x':-1856854001.0624502,'y':-2732829837.287404}}},'Cep':{'abbr':'Cep','nom':'Cepheus','gen':'Cephei','labelPos':[{'latitude':67,'longitude':-48}],'neighbors':['Cam','Cas','Cyg','Dra','Lac','UMi'],'main':['alpha','beta','gamma','delta','epsilon','zeta','iota'],'explan':'&AElig;thiopian King<br>Andromeda\'s Father','color':0,'stars':[89,212,217,254,262,285,554,613,625,646,659,674,780,804,929,1019,1035,1165,1167,1179,1190,1251,1295,1384,1431],'box':{'min':{'x':-119764749.1957587,'y':4178778970.964412},'max':{'x':2437309915.893088,'y':4993053235.224957}}},'Cet':{'abbr':'Cet','nom':'Cetus','gen':'Ceti','labelPos':[{'latitude':-15,'longitude':16}],'explan':'Sea Monster<br>Coming to Eat Andromeda','neighbors':['Aqr','Ari','Eri','For','Psc','Scl','Tau'],'color':2,'stars':[51,93,274,275,279,306,322,376,506,563,653,683,709,761,830,928,967,991,1012,1027,1060,1072,1077,1183,1204,1240,1413,1458],'box':{'min':{'x':3203474611.648912,'y':-1835712032.6125362},'max':{'x':4922710617.074367,'y':884327999.801083}}},'Cha':{'abbr':'Cha','nom':'Chamaeleon','gen':'Chamaeleontis','labelPos':[{'latitude':-75,'longitude':160}],'neighbors':['Aps','Car','Men','Mus','Oct','Vol'],'color':0,'stars':[540,580,652,742,846,1391],'box':{'min':{'x':-915678476.6997281,'y':-4933333099.643914},'max':{'x':-614004095.6368452,'y':-4871357909.028405}}},'Cir':{'abbr':'Cir','nom':'Circinus','gen':'Circini','labelPos':[{'latitude':-56,'longitude':-124}],'explan':'Compasses','neighbors':['Aps','Cen','Lup','Mus','Nor','TrA'],'color':5,'stars':[207,555,873],'box':{'min':{'x':-1671290844.8437688,'y':-4533390296.266253},'max':{'x':-1592140464.7819924,'y':-4279765522.535107}}},'Col':{'abbr':'Col','nom':'Columba','gen':'Columbae','labelPos':[{'latitude':-30,'longitude':90}],'explan':'Dove','neighbors':['Cae','CMa','Lep','Pic','Pup'],'color':4,'stars':[106,197,438,443,491,768,776,1046],'box':{'min':{'x':-413519770.2055973,'y':-3398173651.3565726},'max':{'x':745444389.5679513,'y':-2755767709.263004}}},'Com':{'abbr':'Com','nom':'Coma Berenices','gen':'Comae Berenices','labelPos':[{'latitude':22,'longitude':195}],'explan':'Berenice\'s Hair','neighbors':['Boo','CVn','Leo','UMa','Vir'],'color':0,'stars':[648,751,1031,1038,1107,1153],'box':{'min':{'x':-4689188602.643612,'y':1568377312.8823962},'max':{'x':-4202714382.894524,'y':2360557820.9070807}}},'CrA':{'abbr':'CrA','nom':'Corona Australis','gen':'Coronae Australis','labelPos':[{'latitude':-38,'longitude':283}],'explan':'Southern Crown','neighbors':['Ara','Sco','Sgr','Tel'],'color':4,'stars':[573,581,952,1392],'box':{'min':{'x':558633440.430604,'y':-3451841874.9414315},'max':{'x':1197641918.6801329,'y':-3069748601.9593806}}},'CrB':{'abbr':'CrB','nom':'Corona Borealis','gen':'Coronae Borealis','labelPos':[{'latitude':32,'longitude':-120}],'explan':'Northern Crown','main':['alpha','beta','gamma','delta','epsilon','theta'],'neighbors':['Boo','Her','Ser'],'color':3,'stars':[67,344,410,597,598,942,1005,1033,1465],'box':{'min':{'x':-2682852657.2856927,'y':2181767025.877927},'max':{'x':-1863202542.9920871,'y':2970435765.0013614}}},'Crv':{'abbr':'Crv','nom':'Corvus','gen':'Corvi','labelPos':[{'latitude':-20.5,'longitude':187}],'explan':'Crow or Raven','neighbors':['Crt','Hya','Vir'],'color':0,'stars':[100,105,163,178,525,711],'box':{'min':{'x':-4752278476.517847,'y':-2099354877.384781},'max':{'x':-4531225020.649239,'y':-1402731414.1562026}}},'Crt':{'abbr':'Crt','nom':'Crater','gen':'Crateris','labelPos':[{'latitude':-13.5,'longitude':175}],'explan':'Cup','neighbors':['Crv','Hya','Leo','Sex','Vir'],'color':2,'stars':[309,549,565,853,989,995,1241,1443],'box':{'min':{'x':-4902001754.609177,'y':-1947365259.0905886},'max':{'x':-4506733224.585921,'y':-629288738.5276163}}},'Cru':{'abbr':'Cru','nom':'Crux','gen':'Crucis','labelPos':[{'latitude':-62.5,'longitude':197}],'explan':'Cross','neighbors':['Cen','Mus','Vel'],'color':4,'stars':[12,18,24,130,320,530,546,599,725],'box':{'min':{'x':-2681138212.4125977,'y':-4520846437.997736},'max':{'x':-2134656000.2480915,'y':-4203366600.266388}}},'Cyg':{'abbr':'Cyg','nom':'Cygnus','gen':'Cygni','labelPos':[{'latitude':31,'longitude':-53}],'explan':'Swan','main':['alpha','beta','gamma','delta','epsilon','eta'],'neighbors':['Cep','Dra','Lac','Lyr','Peg','Sge','Vul'],'color':3,'stars':[19,70,91,146,185,213,367,377,385,404,405,456,481,489,505,514,633,635,647,687,808,827,883,917,1009,1013,1025,1045,1081,1105,1160,1197,1252,1265,1421,1435,1438,1441,1448,1464],'box':{'min':{'x':989038145.690682,'y':2347148472.922069},'max':{'x':3229273590.9070435,'y':4175288202.708353}}},'Del':{'abbr':'Del','nom':'Delphinus','gen':'Delphini','labelPos':[{'latitude':15,'longitude':316.5}],'explan':'Dolphin','neighbors':['Aqr','Aql','Equ','Peg','Sge','Vul'],'color':1,'stars':[338,391,531,680,828,1184],'box':{'min':{'x':3052370982.7036257,'y':881035318.1924126},'max':{'x':3204745164.0683756,'y':1393980605.8547757}}},'Dor':{'abbr':'Dor','nom':'Dorado','gen':'Doradus','labelPos':[{'latitude':-65,'longitude':95}],'neighbors':['Cae','Hor','Hyi','Men','Pic','Ret','Vol'],'color':1,'stars':[231,383,670,747,998,1043,1170,1423],'box':{'min':{'x':-67886630.90926298,'y':-4663108225.968432},'max':{'x':1360218093.951752,'y':-3909953185.034402}}},'Dra':{'abbr':'Dra','nom':'Draco','gen':'Draconis','labelPos':[{'latitude':66,'longitude':-90},{'latitude':68,'longitude':-150}],'explan':'Dragon','main':['alpha','beta','gamma','delta','epsilon','zeta','xi','theta','eta','iota','kappa','lambda','omicron','phi','chi','tau','nu^1','omega'],'neighbors':['Boo','Cam','Cep','Cyg','Her','Lyr','UMa','UMi'],'color':4,'stars':[71,118,129,188,202,230,304,347,372,412,423,437,520,638,848,935,939,957,975,1024,1056,1065,1083,1110,1122,1137,1150,1178,1245,1269,1318,1343],'box':{'min':{'x':-2023532878.6211572,'y':3912369457.739056},'max':{'x':792667963.0186477,'y':4871062712.404648}}},'Equ':{'abbr':'Equ','nom':'Equuleus','gen':'Equulei','labelPos':[{'latitude':6,'longitude':315}],'explan':'Foal','neighbors':['Aql','Del','Peg'],'color':0,'stars':[470,867,986],'box':{'min':{'x':3645338442.7922854,'y':463688248.8489345},'max':{'x':3767228397.832151,'y':885664047.6296228}}},'Eri':{'abbr':'Eri','nom':'Eridanus','gen':'Eridani','labelPos':[{'latitude':-17,'longitude':63},{'latitude':-45,'longitude':45}],'neighbors':['Cae','Cet','For','Hor','Hyi','Lep','Ori','Phe','Ret','Scl','Tau','Tuc'],'explan':'Mythical River','color':3,'stars':[8,126,152,167,290,305,307,355,360,370,409,445,459,478,495,519,536,566,577,632,657,662,673,726,762,822,825,870,888,1008,1018,1036,1242,1274,1275,1299],'box':{'min':{'x':1069970280.9317547,'y':-4200397273.57188},'max':{'x':3552383036.1226044,'y':-96762963.30306052}}},'For':{'abbr':'For','nom':'Fornax','gen':'Fornacis','labelPos':[{'latitude':-35,'longitude':52}],'explan':'Furnace','neighbors':['Cae','Cet','Eri','Hor','Phe','Scl'],'color':5,'stars':[406,849,981,1139,1248,1298],'box':{'min':{'x':2390306612.558905,'y':-2674204927.850266},'max':{'x':3728160065.7817082,'y':-2012716786.9374013}}},'Gem':{'abbr':'Gem','nom':'Gemini','gen':'Geminorum','labelPos':[{'latitude':29,'longitude':103}],'neighbors':['Aur','Cnc','CMi','Lyn','Mon','Ori','Tau'],'color':4,'stars':[16,23,43,150,187,234,245,287,310,315,324,396,516,551,593,606,607,643,809,886,1084,1114,1128,1176,1220,1256,1433],'box':{'min':{'x':-2288901408.490865,'y':1114149734.349768},'max':{'x':-103915780.59551921,'y':2791527183.622843}}},'Gru':{'abbr':'Gru','nom':'Grus','gen':'Gruis','labelPos':[{'latitude':-48,'longitude':-14}],'explan':'Crane','neighbors':['Ind','Mic','Phe','PsA','Scl','Tuc'],'color':3,'stars':[30,55,176,282,453,499,578,585,688,863,1395],'box':{'min':{'x':2935809629.3380876,'y':-3975259087.125598},'max':{'x':3585660077.162255,'y':-3028675237.370496}}},'Her':{'abbr':'Her','nom':'Hercules','gen':'Herculis','labelPos':[{'latitude':42,'longitude':264}],'neighbors':['Aql','Boo','CrB','Dra','Lyr','Oph','Ser','Sge','Vul'],'color':1,'stars':[127,128,132,196,201,266,278,358,378,416,426,434,439,468,469,617,623,649,734,777,806,807,937,945,972,1067,1080,1142,1146,1158,1294,1328,1352,1398,1429],'box':{'min':{'x':-2228796302.154855,'y':1100770264.2978587},'max':{'x':983384691.2071823,'y':3767521711.2646747}}},'Hor':{'abbr':'Hor','nom':'Horologium','gen':'Horologii','labelPos':[{'latitude':-50,'longitude':53}],'explan':'Clock','neighbors':['Cae','Dor','Eri','For','Hyi','Ret'],'color':4,'stars':[431,1207,1257,1340,1428,1462],'box':{'min':{'x':1642935312.624685,'y':-4340316955.552185},'max':{'x':2335605579.42503,'y':-3361966362.9129786}}},'Hya':{'abbr':'Hya','nom':'Hydra','gen':'Hydrae','labelPos':[{'latitude':-3,'longitude':135},{'latitude':-25,'longitude':163}],'neighbors':['Ant','Cnc','CMi','Cen','Crv','Crt','Leo','Lib','Lup','Mon','Pup','Sex','Vir'],'explan':'Many-Headed<br>Swamp Serpent','color':4,'stars':[48,169,191,192,221,251,299,329,419,458,462,579,600,698,713,724,757,816,845,947,988,1098,1130,1131,1182,1192,1200,1255,1270,1310],'box':{'min':{'x':-4580334449.108047,'y':-2856558579.491676},'max':{'x':-3151197912.799524,'y':553322619.8767488}}},'Hyi':{'abbr':'Hyi','nom':'Hydrus','gen':'Hydri','labelPos':[{'latitude':-77,'longitude':28}],'explan':'Water Snake','neighbors':['Dor','Eri','Hor','Men','Oct','Phe','Ret','Tuc'],'color':0,'stars':[135,147,224,564,583,976,1196,1291,1414,1437],'box':{'min':{'x':747205442.7006415,'y':-4908690721.601072},'max':{'x':2070671879.9770923,'y':-4393481172.502069}}},'Ind':{'abbr':'Ind','nom':'Indus','gen':'Indi','labelPos':[{'latitude':-57,'longitude':322}],'neighbors':['Gru','Mic','Oct','Pav','Sgr','Tel','Tuc'],'color':2,'stars':[193,346,795,797,903,985,1417],'box':{'min':{'x':1482673855.0318425,'y':-4684803429.711691},'max':{'x':2483634159.0306597,'y':-3670385550.6649694}}},'Lac':{'abbr':'Lac','nom':'Lacerta','gen':'Lacertae','labelPos':[{'latitude':45,'longitude':333.5}],'explan':'Lizard','neighbors':['And','Cas','Cep','Cyg','Peg'],'color':1,'stars':[381,602,736,817,890,906,1082,1203],'box':{'min':{'x':2793571312.8915453,'y':3067049944.7683773},'max':{'x':3644366104.559645,'y':3957044477.870981}}},'Leo':{'abbr':'Leo','nom':'Leo','gen':'Leonis','labelPos':[{'latitude':17,'longitude':160}],'neighbors':['Cnc','Com','Crt','Hya','LMi','Lyn','Sex','UMa','Vir'],'color':5,'stars':[21,50,62,96,166,242,267,277,295,427,455,512,541,706,707,727,787,818,847,862,898,955,982,1061,1116,1138,1320,1338,1370,1410,1420,1466],'box':{'min':{'x':-4976023373.700085,'y':-326798600.38937116},'max':{'x':-3509813719.284007,'y':2200179150.776356}}},'LMi':{'abbr':'LMi','nom':'Leo Minor','gen':'Leonis Minoris','labelPos':[{'latitude':33,'longitude':156}],'explan':'Lesser Lion','neighbors':['Cnc','Leo','Lyn','UMa'],'color':2,'stars':[402,624,880,923,977,1189,1205,1336,1342],'box':{'min':{'x':-4351046358.038039,'y':1961399639.58333},'max':{'x':-3251913661.0297813,'y':3278416941.1886373}}},'Lep':{'abbr':'Lep','nom':'Lepus','gen':'Leporis','labelPos':[{'latitude':-17,'longitude':75}],'explan':'Hare','neighbors':['Cae','CMa','Col','Eri','Mon','Ori'],'color':1,'stars':[99,133,210,229,303,318,362,382,700,769,843,1096],'box':{'min':{'x':-120624120.09158088,'y':-1908873772.8509407},'max':{'x':1075565677.6205199,'y':-1026705589.2523016}}},'Lib':{'abbr':'Lib','nom':'Libra','gen':'Librae','labelPos':[{'latitude':-22.5,'longitude':228}],'neighbors':['Cen','Hya','Lup','Oph','Sco','Ser','Vir'],'color':3,'stars':[102,124,220,326,345,464,592,861,925,950,1015,1091,1119,1164,1225,1396,1400],'box':{'min':{'x':-3554144043.5153327,'y':-2487461671.1571083},'max':{'x':-2372224811.722481,'y':-385046048.9202687}}},'Lup':{'abbr':'Lup','nom':'Lupus','gen':'Lupi','labelPos':[{'latitude':-37,'longitude':-125}],'explan':'Wolf','neighbors':['Cen','Cir','Hya','Lib','Nor','Sco'],'color':1,'stars':[78,110,131,214,249,258,264,302,312,452,496,545,553,630,679,728,732,743,755,837,921,931,1093],'box':{'min':{'x':-2833434835.618112,'y':-3948880466.391568},'max':{'x':-1882317033.1740658,'y':-2516005586.8267136}}},'Lyn':{'abbr':'Lyn','nom':'Lynx','gen':'Lyncis','labelPos':[{'latitude':35,'longitude':137}],'neighbors':['Aur','Cam','Cnc','Gem','Leo','LMi','UMa'],'color':0,'stars':[199,414,661,754,832,1030,1106,1313,1332,1397],'box':{'min':{'x':-3187867686.388871,'y':2818897337.853175},'max':{'x':-237482128.27790797,'y':4285957435.2056923}}},'Lyr':{'abbr':'Lyr','nom':'Lyra','gen':'Lyrae','labelPos':[{'latitude':34,'longitude':278}],'neighbors':['Cyg','Dra','Her','Vul'],'main':['alpha','beta','gamma','delta^2','zeta^1'],'color':0,'stars':[4,223,294,557,640,729,740,750,826,1286],'box':{'min':{'x':360568294.0837267,'y':2702267658.5064993},'max':{'x':1295680730.8294704,'y':3471415091.8925214}}},'Men':{'abbr':'Men','nom':'Mensa','gen':'Mensae','labelPos':[{'latitude':-73,'longitude':86}],'explan':'Table','neighbors':['Cha','Dor','Hyi','Oct','Vol'],'color':5,'stars':[1191,1246,1394],'box':{'min':{'x':-55721835.699074045,'y':-4858323127.809721},'max':{'x':365921977.6803181,'y':-4824137498.073335}}},'Mic':{'abbr':'Mic','nom':'Microscopium','gen':'Microscopii','labelPos':[{'latitude':-42,'longitude':-49}],'neighbors':['Cap','Gru','Ind','PsA','Sgr','Tel'],'color':4,'stars':[973,996,1040,1206,1322],'box':{'min':{'x':2429142090.0150676,'y':-3468500449.347921},'max':{'x':3232760526.749738,'y':-2656875001.3165693}}},'Mon':{'abbr':'Mon','nom':'Monoceros','gen':'Monocerotis','labelPos':[{'latitude':-5,'longitude':115}],'explan':'One-Horned Rhino','neighbors':['CMa','CMi','Gem','Hya','Lep','Ori','Pup'],'color':0,'stars':[484,510,605,771,786,865,879,970,1090,1101,1173,1219,1292,1454],'box':{'min':{'x':-2673049064.0196776,'y':-833247863.4893094},'max':{'x':-340415358.78966284,'y':857784537.0750576}}},'Mus':{'abbr':'Mus','nom':'Musca','gen':'Muscae','labelPos':[{'latitude':-71,'longitude':-177.5}],'explan':'Fly','neighbors':['Aps','Car','Cen','Cha','Cir','Cru','TrA'],'color':1,'stars':[113,182,327,337,428,550,1034],'box':{'min':{'x':-1964199841.3595128,'y':-4761441345.816703},'max':{'x':-1509725259.372326,'y':-4596573518.43469}}},'Nor':{'abbr':'Nor','nom':'Norma','gen':'Normae','labelPos':[{'latitude':-48,'longitude':-118}],'explan':'Set Square','neighbors':['Ara','Cir','Lup','Sco','TrA'],'color':4,'stars':[515,857,1004,1121],'box':{'min':{'x':-1657091867.8923724,'y':-4079378965.0132937},'max':{'x':-1280232723.015061,'y':-3549039158.467012}}},'Oct':{'abbr':'Oct','nom':'Octans','gen':'Octantis','labelPos':[{'latitude':-85,'longitude':-50}],'neighbors':['Aps','Cha','Hyi','Ind','Men','Pav','Tuc'],'color':4,'stars':[373,594,717,1029,1194,1217,1305,1369,1381,1382,1409],'box':{'min':{'x':-432255083.34137356,'y':-4999059480.605247},'max':{'x':1127313554.818841,'y':-4870975182.622167}}},'Oph':{'abbr':'Oph','nom':'Ophiuchus','gen':'Ophiuchi','labelPos':[{'latitude':-5,'longitude':-95}],'explan':'Snake Handler','neighbors':['Aql','Her','Lib','Sco','Ser','Sgr'],'color':4,'stars':[59,86,94,119,125,211,216,226,240,364,380,413,472,529,608,636,690,702,739,788,793,815,839,874,960,1049,1063,1066],'box':{'min':{'x':-2201567462.559423,'y':-2491035599.961436},'max':{'x':472792402.1053396,'y':1086341416.9108434}}},'Ori':{'abbr':'Ori','nom':'Orion','gen':'Orionis','labelPos':[{'latitude':-3,'longitude':90}],'explan':'Hunter','neighbors':['Eri','Gem','Lep','Mon','Tau'],'color':5,'stars':[6,9,26,29,31,57,73,123,208,246,255,316,348,363,390,548,568,589,590,622,753,785,789,811,850,856,868,959,963,993,1000,1159,1262,1373,1460],'box':{'min':{'x':-371154900.6747619,'y':-839413863.105511},'max':{'x':1475996524.446872,'y':1732862787.6106818}}},'Pav':{'abbr':'Pav','nom':'Pavo','gen':'Pavonis','labelPos':[{'latitude':-69,'longitude':-62}],'explan':'Peacock','neighbors':['Aps','Ara','Ind','Tel','TrA','Tuc'],'color':5,'stars':[45,265,301,328,498,517,629,634,730,760,798,1172],'box':{'min':{'x':-116792358.45117787,'y':-4777997075.7157545},'max':{'x':1646567381.0201383,'y':-4177966836.7737265}}},'Peg':{'abbr':'Peg','nom':'Pegasus','gen':'Pegasi','labelPos':[{'latitude':20,'longitude':-5}],'explan':'Flying Horse in Another Myth','neighbors':['And','Aqr','Cyg','Del','Equ','Lac','Psc','Vul'],'color':2,'stars':[82,87,92,138,161,260,289,292,388,503,562,596,619,686,737,813,908,922,924,938,956,1032,1053,1175,1177,1193,1227,1312,1390],'box':{'min':{'x':3639886419.8230767,'y':547323349.4599098},'max':{'x':4905434069.3279505,'y':2742545966.037149}}},'Per':{'abbr':'Per','nom':'Perseus','gen':'Persei','labelPos':[{'latitude':55,'longitude':54}],'neighbors':['And','Ari','Aur','Cam','Cas','Tau','Tri'],'explan':'Andromeda\'s Rescuer','color':0,'stars':[35,60,142,157,159,177,237,389,393,403,421,477,487,504,522,539,572,587,641,663,665,720,766,1103,1111,1133,1235,1368],'box':{'min':{'x':1316943438.09848,'y':2644727790.624574},'max':{'x':2885279247.7452517,'y':4143582389.156424}}},'Phe':{'abbr':'Phe','nom':'Phoenix','gen':'Phoenicis','labelPos':[{'latitude':-52,'longitude':13}],'neighbors':['Eri','For','Gru','Hyi','Scl','Tuc'],'color':2,'stars':[84,236,257,454,474,476,480,770,783,944,984,1021,1211,1213,1259],'box':{'min':{'x':2646427070.809631,'y':-4210728616.934166},'max':{'x':3677445725.4295044,'y':-3306165889.609824}}},'Pic':{'abbr':'Pic','nom':'Pictor','gen':'Pictoris','labelPos':[{'latitude':-53.5,'longitude':87}],'explan':'Painter','neighbors':['Cae','Car','Col','Dor','Pup','Vol'],'color':3,'stars':[218,436,895,1002,1166,1377],'box':{'min':{'x':-492386890.37441576,'y':-4413129740.216965},'max':{'x':765163189.0955572,'y':-3805137087.508556}}},'Psc':{'abbr':'Psc','nom':'Pisces','gen':'Piscium','labelPos':[{'latitude':2,'longitude':25}],'explan':'Fishes','neighbors':['And','Aql','Ari','Cet','Peg','Tri'],'color':0,'stars':[333,359,415,532,591,667,678,682,778,831,841,872,887,900,948,949,968,1014,1078,1117,1181,1218,1261,1348,1378,1405,1411],'box':{'min':{'x':4106934118.6614056,'y':-515434541.18607837},'max':{'x':4990892855.408853,'y':2513763800.4263735}}},'PsA':{'abbr':'PsA','nom':'Piscis Austrinus','gen':'Piscis Austrini','labelPos':[{'latitude':-25,'longitude':341}],'explan':'Southern Fish','neighbors':['Aqr','Cap','Gru','Mic','Scl'],'color':0,'stars':[17,614,621,696,752,852,892,1210,1385],'box':{'min':{'x':3498811126.834769,'y':-2843133993.2770486},'max':{'x':4198827615.8520255,'y':-2266219674.0286565}}},'Pup':{'abbr':'Pup','nom':'Puppis','gen':'Puppis','labelPos':[{'latitude':-32,'longitude':122}],'explan':'Poopdeck','neighbors':['CMa','Car','Col','Hya','Mon','Pic','Pyx','Vel'],'color':1,'stars':[66,115,137,162,204,222,243,483,620,796,800,810,835,866,881,882,1136,1152,1455,1461],'box':{'min':{'x':-2657264424.7501407,'y':-3865675050.554519},'max':{'x':-606108019.6014386,'y':-1260982666.5471976}}},'Pyx':{'abbr':'Pyx','nom':'Pyxis','gen':'Pyxidis','labelPos':[{'latitude':-38,'longitude':138}],'explan':'Compass','neighbors':['Ant','Hya','Pup','Vel'],'color':5,'stars':[351,497,524,997],'box':{'min':{'x':-3469810126.2493997,'y':-2894356319.7761526},'max':{'x':-2631441530.2884154,'y':-2195040532.5158744}}},'Ret':{'abbr':'Ret','nom':'Reticulum','gen':'Reticuli','labelPos':[{'latitude':-68,'longitude':62}],'explan':'Crosshairs','neighbors':['Dor','Eri','Hor','Hyi'],'color':5,'stars':[241,422,838,891,932,992,1280],'box':{'min':{'x':929458116.7252333,'y':-4522367491.131734},'max':{'x':1390168217.7357998,'y':-4297511555.167087}}},'Sge':{'abbr':'Sge','nom':'Sagitta','gen':'Sagittae','labelPos':[{'latitude':15,'longitude':299}],'explan':'Arrow','neighbors':['Aql','Cyg','Del','Her','Vul'],'color':0,'stars':[288,349,791,794,1446],'box':{'min':{'x':2025539321.353907,'y':1504988418.668847},'max':{'x':2347732710.204673,'y':1672373362.6063986}}},'Sgr':{'abbr':'Sgr','nom':'Sagittarius','gen':'Sagittarii','labelPos':[{'latitude':-22,'longitude':-66}],'explan':'Archer','neighbors':['Aql','Cap','CrA','Ind','Mic','Oph','Sco','Sct','Ser','Sco','Tel'],'color':5,'stars':[34,52,101,116,134,151,168,189,205,235,291,384,429,471,492,494,586,684,774,824,911,915,943,966,1069,1073,1144,1174,1307,1321],'box':{'min':{'x':-218620450.65176025,'y':-3521027385.031225},'max':{'x':2390434554.73056,'y':-1331475372.941806}}},'Sco':{'abbr':'Sco','nom':'Scorpius','gen':'Scorpii','labelPos':[{'latitude':-30,'longitude':255}],'neighbors':['Ara','CrA','Lib','Lup','Nor','Oph','Sgr'],'color':0,'stars':[15,25,39,76,77,83,97,114,136,155,158,170,172,239,308,334,450,473,513,716,1086],'box':{'min':{'x':-2282895171.9359255,'y':-3426592682.662334},'max':{'x':-186577198.10539395,'y':-1669448933.6464465}}},'Scl':{'abbr':'Scl','nom':'Sculptor','gen':'Sculptoris','labelPos':[{'latitude':-31,'longitude':2}],'neighbors':['Aqr','Cet','Eri','For','Gru','Phe','PsA'],'color':1,'stars':[712,779,801,941,1279,1287,1303,1314,1363,1407],'box':{'min':{'x':3809725729.4423285,'y':-3059117950.641266},'max':{'x':4420334760.808344,'y':-2110392902.8860674}}},'Sct':{'abbr':'Sct','nom':'Scutum','gen':'Scuti','labelPos':[{'latitude':-11,'longitude':276}],'explan':'Shield','neighbors':['Aql','Sgr','Ser'],'color':1,'stars':[433,637,974,987,1075,1349],'box':{'min':{'x':635774300.0833274,'y':-1256407953.7925205},'max':{'x':1043293676.7071136,'y':-412109236.3256107}}},'Ser':{'abbr':'Ser','nom':'Serpens','gen':'Serpentis','labelPos':[{'latitude':10,'longitude':241},{'latitude':2,'longitude':280},{'latitude':-15,'longitude':270}],'explan':'Serpent','neighbors':['Aql','Boo','CrB','Her','Lib','Oph','Sgr','Sct','Vir','Vul'],'color':0,'stars':[103,215,298,300,341,361,407,430,567,655,723,820,954,1050,1234,1319,1347],'box':{'min':{'x':-3267449316.835421,'y':-1328460970.855878},'max':{'x':1229318075.220128,'y':1552440535.133793}}},'Sex':{'abbr':'Sex','nom':'Sextans','gen':'Sextantis','labelPos':[{'latitude':-6.5,'longitude':159}],'neighbors':['Crt','Hya','Leo'],'color':3,'stars':[877,1250,1283],'box':{'min':{'x':-4616828110.970741,'y':-709426994.1751325},'max':{'x':-4423111661.577264,'y':-39948302.195737824}}},'Tau':{'abbr':'Tau','nom':'Taurus','gen':'Tauri','neighbors':['Ari','Aur','Cet','Eri','Gem','Ori','Per'],'labelPos':[{'latitude':20,'longitude':80}],'explan':'Bull, Protecting<br>Pleiades from Orion','color':1,'stars':[13,27,144,165,256,261,297,331,335,342,368,371,395,424,449,465,601,603,626,666,676,677,685,693,699,708,714,722,763,875,933,953,962,1188,1331,1356,1359,1399,1415,1422,1426,1453],'box':{'min':{'x':107697528.53971148,'y':39802862.42589022},'max':{'x':3077595267.059268,'y':2395038860.891601}}},'Tel':{'abbr':'Tel','nom':'Telescopium','gen':'Telescopii','labelPos':[{'latitude':-57.7,'longitude':290}],'neighbors':['Ara','CrA','Ind','Mic','Pav','Sgr'],'color':0,'stars':[283,569,912,1064,1074,1099,1326],'box':{'min':{'x':189947232.9978765,'y':-4160693292.930192},'max':{'x':1608894270.7693765,'y':-3593640092.3090515}}},'Tri':{'abbr':'Tri','nom':'Triangulum','gen':'Trianguli','labelPos':[{'latitude':34.5,'longitude':27}],'main':['alpha','beta','gamma'],'neighbors':['And','Ari','Per','Psc'],'color':2,'stars':[173,263,527,1226,1304],'box':{'min':{'x':3165711239.6115994,'y':2474518362.7842746},'max':{'x':3817472136.0541825,'y':2954716260.0137777}}},'TrA':{'abbr':'TrA','nom':'Triangulum Australe','gen':'Trianguli Austalis','labelPos':[{'latitude':-71,'longitude':-141}],'explan':'Southern Triangle','neighbors':['Aps','Ara','Cir','Nor'],'color':0,'stars':[42,139,148,441,582,1085],'box':{'min':{'x':-1161800541.893291,'y':-4702085041.148923},'max':{'x':-533447626.8244962,'y':-4474009953.1833725}}},'Tuc':{'abbr':'Tuc','nom':'Tucana','gen':'Tucanae','labelPos':[{'latitude':-65,'longitude':15}],'neighbors':['Eri','Gru','Hyi','Ind','Oct','Phe'],'color':1,'stars':[149,508,642,764,889,905,1335,1379],'box':{'min':{'x':1704998224.6072142,'y':-4681312683.476717},'max':{'x':2595997739.970414,'y':-4246684903.7972}}},'UMa':{'abbr':'UMa','nom':'Ursa Major','gen':'Ursae Majoris','labelPos':[{'latitude':50,'longitude':155}],'explan':'Greater Bear','neighbors':['Boo','Cam','CVn','Com','Dra','Leo','LMi','Lyn'],'color':3,'stars':[33,36,38,68,80,85,174,186,195,203,238,247,270,281,313,343,353,401,507,851,869,920,1011,1022,1048,1109,1156,1231,1317,1346],'box':{'min':{'x':-4127863604.926723,'y':2723098970.7207837},'max':{'x':-1373504211.4346642,'y':4691033179.045548}}},'UMi':{'abbr':'UMi','nom':'Ursa Minor','gen':'Ursae Minoris','labelPos':[{'latitude':82,'longitude':210}],'explan':'Lesser Bear, Little Dipper','neighbors':['Cam','Cep','Dra'],'main':['alpha','beta','gamma','delta','epsilon','zeta','eta'],'color':3,'stars':[46,54,175,628,664,701,758,958,1042,1120,1401],'box':{'min':{'x':-1459144606.5381937,'y':4562862601.253566},'max':{'x':41967826.73756032,'y':4999676317.166277}}},'Vel':{'abbr':'Vel','nom':'Vela','gen':'Velorum','labelPos':[{'latitude':-51,'longitude':140}],'explan':'Sails','neighbors':['Ant','Car','Cen','Pup','Pyx'],'color':0,'stars':[32,44,69,90,111,293,321,323],'box':{'min':{'x':-3085412677.4098325,'y':-4100060124.5549626},'max':{'x':-1819705734.9026806,'y':-3250176585.882421}}},'Vir':{'abbr':'Vir','nom':'Virgo','gen':'Virginis','labelPos':[{'latitude':-5,'longitude':-157}],'neighbors':['Boo','Com','Crv','Crt','Hya','Leo','Lib','Ser'],'color':1,'stars':[14,121,145,250,253,319,374,446,460,537,556,584,612,644,782,792,907,961,969,1010,1023,1026,1047,1076,1095,1125,1126,1129,1157,1267,1297],'box':{'min':{'x':-4994544863.119093,'y':-1578915367.6635463},'max':{'x':-3474477086.0364647,'y':1182991958.3433788}}},'Vol':{'abbr':'Vol','nom':'Volans','gen':'Volantis','labelPos':[{'latitude':-73,'longitude':107}],'explan':'Flying Fish','neighbors':['Car','Cha','Dor','Men','Pic'],'color':2,'stars':[394,398,479,502,511,749,1364],'box':{'min':{'x':-1428355726.0555725,'y':-4772456348.469699},'max':{'x':-361232506.8034971,'y':-4574650959.344818}}},'Vul':{'abbr':'Vul','nom':'Vulpecula','gen':'Vulpeculae','labelPos':[{'latitude':24,'longitude':307}],'explan':'Fox Cub','neighbors':['Cyg','Del','Her','Lyr','Peg','Sge'],'color':5,'stars':[833,965,1044,1155,1308,1309,1412],'box':{'min':{'x':1727957325.4600263,'y':1813278209.2872565},'max':{'x':3255394466.468545,'y':2356988398.0973563}}},'':{'abbr':'','nom':'','gen':'','color':6,'stars':[200,209,332,366,379,386,400,408,420,425,432,451,463,466,488,490,509,518,544,547,560,571,575,576,611,616,627,631,654,656,660,671,675,689,697,705,710,733,745,748,756,773,790,812,829,836,840,842,854,858,859,864,894,909,913,916,918,926,930,934,936,951,978,990,999,1007,1017,1020,1037,1052,1057,1058,1062,1068,1079,1087,1088,1100,1112,1115,1132,1134,1135,1141,1145,1149,1151,1168,1171,1186,1187,1195,1199,1201,1214,1222,1223,1228,1229,1232,1236,1237,1239,1244,1247,1249,1253,1258,1263,1266,1281,1284,1288,1289,1290,1293,1311,1315,1323,1324,1327,1329,1330,1334,1337,1341,1344,1345,1351,1353,1357,1361,1366,1367,1372,1374,1375,1376,1380,1383,1387,1388,1393,1403,1404,1406,1408,1419,1424,1432,1434,1436,1439,1440,1442,1444,1445,1447,1449,1451,1452,1457,1459],'box':{'min':{'x':-4313143125.110174,'y':-4809213920.17315},'max':{'x':4943611345.851839,'y':4989867746.463536}}}};var allStars=[{'longitude':101.47833333333334,'latitude':-16.741666666666667,'magnitude':-1.44,'b_v':0.01,'letter':'alpha','constell':'CMa','desigNo':'9','bsNo':'2491','serialNo':0,'main':true,'letterLabel':{'vtr':{'x':0.09906445310108586,'y':0.945456342432145,'z':-0.3103200584664376},'orthogVtr':{'x':-0.9766637928172868,'y':0.15210349742116155,'z':0.1516323246277069},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.49530196554720873,'y':0.8535900820679635,'z':-0.1614308976629911},'orthogVtr':{'x':-0.8475623239582664,'y':-0.4340589143977189,'z':0.3053374622255455},'minZoom':0.5}},{'longitude':96.085,'latitude':-52.70583333333334,'magnitude':-0.62,'b_v':0.16,'letter':'alpha','constell':'Car','desigNo':'','bsNo':'2326','serialNo':1,'main':true,'letterLabel':{'vtr':{'x':0.8196003290674551,'y':0.3023832691973763,'z':-0.4866412016075361},'orthogVtr':{'x':-0.5693241658192916,'y':0.5250601366744561,'z':-0.6325992784453439},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.35220046098521385,'y':-0.5829600773888011,'z':0.7321969567354443},'orthogVtr':{'x':0.9337181268857939,'y':0.1651706293077994,'z':-0.31763048143865247},'minZoom':0.5}},{'longitude':214.115,'latitude':19.091944444444444,'magnitude':-0.05,'b_v':1.24,'letter':'alpha','constell':'Boo','desigNo':'16','bsNo':'5340','serialNo':2,'main':true,'letterLabel':{'vtr':{'x':-0.5687311360181468,'y':-0.028364258714444812,'z':-0.8220342838051757},'orthogVtr':{'x':0.2538418936620449,'y':0.9445691322537455,'z':-0.20821490680418092},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.622075516116867,'y':0.36911802969830054,'z':0.6904881841129347},'orthogVtr':{'x':-0.03021364430780127,'y':-0.8699237075345503,'z':0.49225997071363004},'minZoom':0.5}},{'longitude':220.20125,'latitude':-60.907222222222224,'magnitude':-0.01,'b_v':0.71,'letter':'alpha^1','constell':'Cen','desigNo':'','bsNo':'5459','serialNo':3,'main':true,'letterLabel':{'vtr':{'x':0.5923995126204298,'y':0.03728156142049416,'z':0.8047812762640091},'orthogVtr':{'x':0.7149455209035455,'y':-0.4847938381480676,'z':-0.5038132954117264},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.28280703921205746,'y':0.21550048678401207,'z':0.9346548661233},'orthogVtr':{'x':0.8843666993872364,'y':-0.4358606664108826,'z':-0.16709584223069993},'minZoom':0.5}},{'longitude':279.3829166666667,'latitude':38.80083333333333,'magnitude':0.03,'b_v':0,'letter':'alpha','constell':'Lyr','desigNo':'3','bsNo':'7001','main':true,'serialNo':4,'letterLabel':{'vtr':{'x':-0.7486273409774766,'y':0.5691157816475318,'z':-0.34009459187219054},'orthogVtr':{'x':0.6507027230082988,'y':0.5324102605090857,'z':-0.5414104549916197},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8083169677752271,'y':0.514684744911472,'z':-0.28587286153476604},'orthogVtr':{'x':0.5748744288938971,'y':0.585194900670748,'z':-0.5718971229450879},'minZoom':0.5}},{'longitude':79.49625,'latitude':46.013888888888886,'magnitude':0.08,'b_v':0.8,'letter':'alpha','constell':'Aur','desigNo':'13','bsNo':'1708','serialNo':5,'main':true,'letterLabel':{'vtr':{'x':-0.8523896483595395,'y':0.43099654193929826,'z':0.2960977342126537},'orthogVtr':{'x':-0.5073492162191481,'y':-0.5445640232079982,'z':-0.6678673501746695},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5593417107458488,'y':0.6202904573511278,'z':0.5498878059559386},'orthogVtr':{'x':-0.8192119325599392,'y':-0.3123263406362702,'z':-0.4809823972830669},'minZoom':0.5}},{'longitude':78.845,'latitude':-8.1825,'magnitude':0.18,'b_v':-0.03,'letter':'beta','constell':'Ori','desigNo':'19','bsNo':'1713','serialNo':6,'main':true,'letterLabel':{'vtr':{'x':-0.5942548849157258,'y':-0.8042764765715853,'z':0.0006935325468922766},'orthogVtr':{'x':0.7811472648500817,'y':-0.5769596894891231,'z':0.23859268078013415},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.40677782886948916,'y':-0.8889451470035021,'z':0.21049542408125282},'orthogVtr':{'x':0.8932310538540355,'y':0.4353385575396593,'z':0.11233265219916307},'minZoom':0.5}},{'longitude':115.05458333333333,'latitude':5.1786111111111115,'magnitude':0.4,'b_v':0.43,'letter':'alpha','constell':'CMi','desigNo':'10','bsNo':'2943','serialNo':7,'main':true,'letterLabel':{'vtr':{'x':-0.703551729690673,'y':-0.660252698384417,'z':0.26283328922599997},'orthogVtr':{'x':0.5719610683689417,'y':-0.7456000010627181,'z':-0.3419666280290134},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5162821740832589,'y':-0.8418824807773035,'z':0.15711971640795672},'orthogVtr':{'x':0.7453705231657224,'y':-0.5320590905800618,'z':-0.40166641299313915},'minZoom':0.5}},{'longitude':24.590833333333332,'latitude':-57.14833333333333,'magnitude':0.45,'b_v':-0.16,'letter':'alpha','constell':'Eri','desigNo':'','bsNo':'472','serialNo':8,'main':true,'letterLabel':{'vtr':{'x':-0.6818810300740364,'y':-0.21228433399405747,'z':-0.6999811585791939},'orthogVtr':{'x':-0.5401177073002078,'y':-0.49920406071364065,'z':0.6775456944205155},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3715252740939797,'y':-0.031190530384590187,'z':0.9278987668510619},'orthogVtr':{'x':0.7865480580507813,'y':0.5415685399897382,'z':-0.2967249043641735},'minZoom':0.5}},{'longitude':89.03,'latitude':7.408888888888889,'magnitude':0.45,'b_v':1.5,'letter':'alpha','constell':'Ori','desigNo':'58','bsNo':'2061','serialNo':9,'main':true,'letterLabel':{'vtr':{'x':0.6239320199227923,'y':-0.7762337443858403,'z':-0.09038809983511308},'orthogVtr':{'x':0.781298286652227,'y':0.6171168569713084,'z':0.0934867483451448},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9801199405117997,'y':0.19819336564445922,'z':0.009181068873923483},'orthogVtr':{'x':-0.19769441171107252,'y':-0.9716436748602493,'z':-0.12971310142881892},'minZoom':0.5}},{'longitude':211.26833333333335,'latitude':-60.45666666666667,'magnitude':0.61,'b_v':-0.23,'letter':'beta','constell':'Cen','desigNo':'','bsNo':'5267','serialNo':10,'main':true,'letterLabel':{'vtr':{'x':-0.8567001800667283,'y':0.47451757013288504,'z':0.20223223558280215},'orthogVtr':{'x':0.29738306001063874,'y':0.13402468494372816,'z':0.9453045538049858},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6375959155112411,'y':0.08359016022479007,'z':-0.7658225209779197},'orthogVtr':{'x':-0.6448591562744831,'y':0.48594467344819914,'z':0.5899274895411173},'minZoom':0.5}},{'longitude':297.9091666666667,'latitude':8.915555555555557,'magnitude':0.76,'b_v':0.22,'letter':'alpha','constell':'Aql','desigNo':'53','bsNo':'7557','serialNo':11,'main':true,'letterLabel':{'vtr':{'x':0.8800605183143216,'y':0.03971209794979233,'z':-0.4731980910578085},'orthogVtr':{'x':0.10800479270685567,'y':-0.9871193344885941,'z':0.11802704872674227},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8311800107016378,'y':0.26706047463108945,'z':-0.48766637437888083},'orthogVtr':{'x':0.3087253487379169,'y':-0.9511363383524971,'z':0.005322115374183742},'minZoom':0.5}},{'longitude':186.89625,'latitude':-63.19583333333333,'magnitude':0.77,'b_v':-0.24,'letter':'alpha^1','constell':'Cru','desigNo':'','bsNo':'4730','serialNo':12,'main':true,'letterLabel':{'vtr':{'x':-0.1629117487091052,'y':0.1409513157431798,'z':0.9765206033273481},'orthogVtr':{'x':0.8792283002364928,'y':-0.42834777921126566,'z':0.20850845572308246},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8775548236397607,'y':-0.426916512672733,'z':0.21826548676769875},'orthogVtr':{'x':0.1716979129482917,'y':-0.14522873191042077,'z':-0.9743861873594533},'minZoom':0.5}},{'longitude':69.23166666666667,'latitude':16.543055555555558,'magnitude':0.87,'b_v':1.54,'letter':'alpha','constell':'Tau','desigNo':'87','bsNo':'1457','serialNo':13,'main':true,'letterLabel':{'vtr':{'x':-0.894302798322292,'y':0.3927656882697355,'z':-0.21437728198416667},'orthogVtr':{'x':-0.2910018927571219,'y':-0.8744487689663436,'z':-0.3881459118231423},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9374543375983303,'y':0.026484558279327275,'z':-0.34709931300828695},'orthogVtr':{'x':0.07509301960492303,'y':-0.958240107489507,'z':-0.2759292206438323},'minZoom':0.5}},{'longitude':201.52916666666667,'latitude':-11.252222222222223,'magnitude':0.98,'b_v':-0.24,'letter':'alpha','constell':'Vir','desigNo':'67','bsNo':'5056','serialNo':14,'main':true,'letterLabel':{'vtr':{'x':-0.26251220389700936,'y':0.9534272553151475,'z':-0.14853892293725443},'orthogVtr':{'x':0.3141740648487536,'y':0.2300030244910327,'z':0.9210826595378879},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.3064650374225172,'y':-0.25743031273714095,'z':-0.9164108330446957},'orthogVtr':{'x':-0.2714722473036038,'y':0.9463902770722321,'z':-0.17506645140367483},'minZoom':0.5}},{'longitude':247.62083333333334,'latitude':-26.46944444444444,'magnitude':1.06,'b_v':1.87,'letter':'alpha','constell':'Sco','desigNo':'21','bsNo':'6134','serialNo':15,'main':true,'letterLabel':{'vtr':{'x':0.5615369892687866,'y':0.6096363975742544,'z':0.5594816104534915},'orthogVtr':{'x':0.7540000883698856,'y':-0.6554973008741134,'z':-0.04251064907710689},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5108524599475728,'y':0.651333646768343,'z':0.5610652767307605},'orthogVtr':{'x':0.7892209372186993,'y':-0.614082835851983,'z':-0.005708149229346177},'minZoom':0.5}},{'longitude':116.59625,'latitude':27.982499999999998,'magnitude':1.16,'b_v':0.99,'letter':'beta','constell':'Gem','desigNo':'78','bsNo':'2990','serialNo':16,'main':true,'letterLabel':{'vtr':{'x':-0.5199507248985696,'y':-0.8230116833766279,'z':-0.22869851924098925},'orthogVtr':{'x':0.7571931495607775,'y':-0.32015837283400655,'z':-0.5693480047936508},'minZoom':0.8},'shortNameLabel':{'vtr':{'x':-0.7372652475864422,'y':0.3506440028273661,'z':0.5774848378810516},'orthogVtr':{'x':-0.5478413792016997,'y':-0.8104926884009207,'z':-0.20729550232223518},'minZoom':0.5}},{'longitude':344.6533333333333,'latitude':-29.529166666666665,'magnitude':1.17,'b_v':0.15,'letter':'alpha','constell':'PsA','desigNo':'24','bsNo':'8728','serialNo':17,'main':true,'letterLabel':{'vtr':{'x':0.5438454311776086,'y':0.7703707837896937,'z':-0.3328077560251476},'orthogVtr':{'x':0.013371736128634404,'y':-0.4044890787060753,'z':-0.9144450677216303},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.46179087167006316,'y':-0.8690653596949596,'z':-0.1774107984889142},'orthogVtr':{'x':-0.28756885641886903,'y':-0.04252011156508381,'z':0.9568156525321045},'minZoom':0.5}},{'longitude':192.18875,'latitude':-59.784166666666664,'magnitude':1.25,'b_v':-0.24,'letter':'beta','constell':'Cru','desigNo':'','bsNo':'4853','serialNo':18,'main':true,'letterLabel':{'vtr':{'x':0.7857863706813247,'y':-0.38809783418649946,'z':0.4815805755543094},'orthogVtr':{'x':0.3749138678330463,'y':-0.3203895364194582,'z':-0.8699368578577354},'minZoom':1.3},'shortNameLabel':{'vtr':{'x':0.2502715744355738,'y':-0.023456139933132725,'z':0.9678914962582204},'orthogVtr':{'x':0.833897336409946,'y':-0.5027118393739741,'z':-0.22780702114209153},'minZoom':0.5}},{'longitude':310.50708333333336,'latitude':45.343611111111116,'magnitude':1.25,'b_v':0.09,'letter':'alpha','constell':'Cyg','desigNo':'50','bsNo':'7924','main':true,'serialNo':19,'letterLabel':{'vtr':{'x':-0.5157253189264945,'y':-0.27786316671347033,'z':0.8104439869615467},'orthogVtr':{'x':-0.7249862908457569,'y':0.6455966690915913,'z':-0.23999962279877485},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.16987500537557623,'y':0.5199027698978634,'z':-0.8371640176221008},'orthogVtr':{'x':0.8733385420584454,'y':-0.47297368680585655,'z':-0.11651473101932087},'minZoom':0.5}},{'longitude':220.19958333333332,'latitude':-60.906388888888884,'magnitude':1.35,'b_v':0.9,'letter':'alpha^2','constell':'Cen','desigNo':'','bsNo':'5460','serialNo':20,'main':true,'letterLabel':{'vtr':{'x':-0.7963066102278041,'y':0.47359469669642285,'z':0.3763028644171174},'orthogVtr':{'x':0.4774579267603024,'y':0.11016080499160272,'z':0.8717215869859802}},'shortNameLabel':{'vtr':{'x':-0.697990378859526,'y':0.48566410882763633,'z':0.5262507049080252},'orthogVtr':{'x':0.6122742198870353,'y':0.0236159499498228,'z':0.7902927094246093}}},{'longitude':152.32541666666665,'latitude':11.881111111111112,'magnitude':1.36,'b_v':-0.09,'letter':'alpha','constell':'Leo','desigNo':'32','bsNo':'3982','serialNo':21,'main':true,'letterLabel':{'vtr':{'x':0.13082770916038106,'y':0.9727928095719953,'z':0.19120214476012157},'orthogVtr':{'x':-0.4814986503470944,'y':-0.10623992765998679,'z':0.8699839811655886},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.14120647434754907,'y':-0.9748622199125563,'z':-0.17234959759018295},'orthogVtr':{'x':0.47855780358548305,'y':0.08518465103138297,'z':-0.8739141856361528},'minZoom':0.5}},{'longitude':104.82833333333333,'latitude':-28.996944444444445,'magnitude':1.5,'b_v':-0.21,'letter':'epsilon','constell':'CMa','desigNo':'21','bsNo':'2618','serialNo':22,'main':true,'letterLabel':{'vtr':{'x':0.684532591400945,'y':-0.6957290001404625,'z':0.21766095119120293},'orthogVtr':{'x':0.6937648037047092,'y':0.530062274603728,'z':-0.4875698741539395},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6579289962760476,'y':-0.7151911693270199,'z':0.23586230554254003},'orthogVtr':{'x':0.7190437451287087,'y':0.5034942382105038,'z':-0.47902989956797604},'minZoom':0.5}},{'longitude':113.9275,'latitude':31.847777777777775,'magnitude':1.58,'b_v':0.03,'letter':'alpha^1','constell':'Gem','desigNo':'66','bsNo':'2891','serialNo':23,'main':true,'letterLabel':{'vtr':{'x':-0.8133618287975075,'y':0.24522283858855898,'z':0.5275493293425212},'orthogVtr':{'x':-0.4687723484648418,'y':-0.8132872336948553,'z':-0.3446974917572321},'minZoom':0.6},'shortNameLabel':{'vtr':{'x':0.13443214634927408,'y':0.8462920076159572,'z':0.5154782593604509},'orthogVtr':{'x':-0.9291033189360569,'y':-0.07321340657156529,'z':0.3625007859856178},'minZoom':0.5}},{'longitude':188.03666666666666,'latitude':-57.211111111111116,'magnitude':1.59,'b_v':1.6,'letter':'gamma','constell':'Cru','desigNo':'','bsNo':'4763','serialNo':24,'main':true,'letterLabel':{'vtr':{'x':-0.8423487484084875,'y':0.5387056010881999,'z':0.01564804814843824},'orthogVtr':{'x':0.0539411869463548,'y':0.05538475624974933,'z':0.9970069594170214},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7424559710821775,'y':0.5124378478744959,'z':0.4314702574571923},'orthogVtr':{'x':0.4015223488162867,'y':-0.17515321274358026,'z':0.8989444673986565},'minZoom':0.5}},{'longitude':263.69958333333335,'latitude':-37.115,'magnitude':1.62,'b_v':-0.23,'letter':'lambda','constell':'Sco','desigNo':'35','bsNo':'6527','serialNo':25,'main':true,'letterLabel':{'vtr':{'x':0.6984752310322908,'y':0.5301382611182119,'z':0.4807138189535919},'orthogVtr':{'x':0.7102634859176675,'y':-0.5956858407641795,'z':-0.3750788712859689},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8562537906043222,'y':0.361058788903064,'z':0.3694130439380586},'orthogVtr':{'x':0.5090887092337226,'y':-0.7110026355395747,'z':-0.48508137295357046},'minZoom':0.5}},{'longitude':81.5175,'latitude':6.364166666666667,'magnitude':1.64,'b_v':-0.22,'letter':'gamma','constell':'Ori','desigNo':'24','bsNo':'1790','serialNo':26,'main':true,'letterLabel':{'vtr':{'x':0.9794591582460568,'y':0.1228158462925561,'z':0.15992506128611964},'orthogVtr':{'x':-0.13845105531620197,'y':0.9862196115303018,'z':0.09056590481439804},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8915059549856704,'y':0.4157799249268612,'z':0.17984489498704606},'orthogVtr':{'x':-0.4286327911106803,'y':0.9026848333141252,'z':0.037868484116981856},'minZoom':0.5}},{'longitude':81.85,'latitude':28.620555555555555,'magnitude':1.65,'b_v':-0.13,'letter':'beta','constell':'Tau','desigNo':'112','bsNo':'1791','serialNo':27,'main':true,'letterLabel':{'vtr':{'x':0.41599600289269284,'y':-0.8202557799065248,'z':-0.3925911118546137},'orthogVtr':{'x':0.9008114451774631,'y':0.3126226599492291,'z':0.3013400284123555},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9918437769823691,'y':0.0843825350093122,'z':-0.0955275344953006},'orthogVtr':{'x':-0.027565490141757867,'y':-0.8737459927056573,'z':-0.48560074545252735},'minZoom':0.5}},{'longitude':138.34625,'latitude':-69.78944444444444,'magnitude':1.67,'b_v':0.07,'letter':'beta','constell':'Car','desigNo':'','bsNo':'3685','serialNo':28,'main':true,'letterLabel':{'vtr':{'x':-0.9652615694410214,'y':0.26047433154113664,'z':0.020572437105373206},'orthogVtr':{'x':-0.040501618814915305,'y':-0.22694359936811218,'z':0.9730653737438287},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9641898264455185,'y':0.26521308146273825,'z':0},'orthogVtr':{'x':-0.060895460794161395,'y':-0.22138720854420457,'z':0.9732828195070905},'minZoom':0.5}},{'longitude':84.27541666666667,'latitude':-1.1919444444444445,'magnitude':1.69,'b_v':-0.18,'letter':'epsilon','constell':'Ori','desigNo':'46','bsNo':'1903','serialNo':29,'main':true,'letterLabel':{'vtr':{'x':-0.45944721512128,'y':0.8858540774733517,'z':-0.06458180812842962},'orthogVtr':{'x':-0.8825888973776028,'y':-0.46349739618616365,'z':-0.07878452864892678},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.45726536818002494,'y':0.886996449126358,'z':-0.06438697306457263},'orthogVtr':{'x':-0.8837212729815315,'y':-0.46130747022430524,'z':-0.0789438382342337},'minZoom':0.5}},{'longitude':332.33208333333334,'latitude':-46.87555555555556,'magnitude':1.73,'b_v':-0.07,'letter':'alpha','constell':'Gru','desigNo':'','bsNo':'8425','serialNo':30,'main':true,'letterLabel':{'vtr':{'x':-0.7696744219845948,'y':-0.6384365936744852,'z':0},'orthogVtr':{'x':-0.20265266706271168,'y':0.2443102039114251,'z':0.9482849892290439},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7696744219845948,'y':-0.6384365936744852,'z':0},'orthogVtr':{'x':-0.20265266706271168,'y':0.2443102039114251,'z':0.9482849892290439},'minZoom':0.5}},{'longitude':85.41083333333333,'latitude':-1.9344444444444444,'magnitude':1.74,'b_v':-0.2,'letter':'zeta','constell':'Ori','desigNo':'50','bsNo':'1948','serialNo':31,'main':true,'letterLabel':{'vtr':{'x':-0.8951790430942976,'y':0.437199187176882,'z':-0.08666805372599358},'orthogVtr':{'x':-0.4384747455238876,'y':-0.898730995607637,'z':-0.004742896991076426},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9143404946780865,'y':0.3955353303429322,'z':-0.08679436757266923},'orthogVtr':{'x':-0.3969723938125825,'y':-0.9178302316793275,'z':-0.0007644384736877965},'minZoom':0.5}},{'longitude':122.51791666666666,'latitude':-47.388888888888886,'magnitude':1.75,'b_v':-0.15,'letter':'gamma^2','constell':'Vel','desigNo':'','bsNo':'3207','serialNo':32,'main':true,'letterLabel':{'vtr':{'x':-0.9282612062147136,'y':0.2361399754722983,'z':0.28734829914364757},'orthogVtr':{'x':0.0766714052456414,'y':-0.6345015672229161,'z':0.7691093919653575},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8963879764662336,'y':0.4432703414923798,'z':0},'orthogVtr':{'x':-0.25305328883914463,'y':-0.5117281809492451,'z':0.8210348968406088},'minZoom':0.5}},{'longitude':193.69875,'latitude':55.865,'magnitude':1.76,'b_v':-0.02,'letter':'epsilon','constell':'UMa','desigNo':'77','bsNo':'4905','serialNo':33,'main':true,'letterLabel':{'vtr':{'x':-0.5830335945593834,'y':-0.2604674223051241,'z':-0.7695638696904167},'orthogVtr':{'x':0.6023684938969196,'y':0.49703130917031246,'z':-0.6245895254203371},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8351244383941966,'y':0.5500610624255982,'z':0},'orthogVtr':{'x':0.07309683455018091,'y':-0.11097850233740249,'z':0.9911309826645975},'minZoom':0.5}},{'longitude':276.3333333333333,'latitude':-34.374722222222225,'magnitude':1.79,'b_v':-0.03,'letter':'epsilon','constell':'Sgr','desigNo':'20','bsNo':'6879','serialNo':34,'main':true,'letterLabel':{'vtr':{'x':0.5313105318784509,'y':0.724252158420144,'z':0.4395087368173703},'orthogVtr':{'x':0.8422703870608289,'y':-0.39583121233519925,'z':-0.36592109316305893},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5313105318784509,'y':0.724252158420144,'z':0.4395087368173703},'orthogVtr':{'x':0.8422703870608289,'y':-0.39583121233519925,'z':-0.36592109316305893},'minZoom':0.5}},{'longitude':51.39541666666667,'latitude':49.92194444444444,'magnitude':1.79,'b_v':0.48,'letter':'alpha','constell':'Per','desigNo':'33','bsNo':'1017','serialNo':35,'main':true,'letterLabel':{'vtr':{'x':-0.8330231097761479,'y':0.5335414425597509,'z':0.1463079890167856},'orthogVtr':{'x':-0.3803933976422074,'y':-0.36034898432097573,'z':-0.8517332167580753},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4031346524553388,'y':0.3455555189101077,'z':0.8473923738979952},'orthogVtr':{'x':-0.8222585301355165,'y':0.5432395832233372,'z':0.16965159839717123},'minZoom':0.5}},{'longitude':166.19833333333332,'latitude':61.656388888888884,'magnitude':1.81,'b_v':1.06,'letter':'alpha','constell':'UMa','desigNo':'50','bsNo':'4301','serialNo':36,'main':true,'letterLabel':{'vtr':{'x':0.8858160418042799,'y':0.4640365719231601,'z':0},'orthogVtr':{'x':-0.05255638269708577,'y':0.10032676239146202,'z':0.9935654821831548},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8858160418042799,'y':0.4640365719231601,'z':0},'orthogVtr':{'x':-0.05255638269708577,'y':0.10032676239146202,'z':0.9935654821831548},'minZoom':0.5}},{'longitude':107.27583333333334,'latitude':-26.421944444444446,'magnitude':1.83,'b_v':0.67,'letter':'delta','constell':'CMa','desigNo':'25','bsNo':'2693','serialNo':37,'main':true,'letterLabel':{'vtr':{'x':0.8455001554565023,'y':0.31842159614997995,'z':-0.42864574444210846},'orthogVtr':{'x':-0.4630330813478463,'y':0.8370197624200189,'z':-0.2915446499180768},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.952982224257529,'y':0.2550170920379736,'z':0.16368006298162438},'orthogVtr':{'x':-0.14524127357133643,'y':-0.8584641392305573,'z':0.4918783326255741},'minZoom':0.5}},{'longitude':207.05708333333334,'latitude':49.22638888888889,'magnitude':1.85,'b_v':-0.1,'letter':'eta','constell':'UMa','desigNo':'85','bsNo':'5191','serialNo':38,'main':true,'letterLabel':{'vtr':{'x':0.7930993457414804,'y':0.6090922982475118,'z':0},'orthogVtr':{'x':0.18094184127556104,'y':-0.23560445000831615,'z':0.9548563207164148},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7930993457414804,'y':0.6090922982475118,'z':0},'orthogVtr':{'x':0.18094184127556104,'y':-0.23560445000831615,'z':0.9548563207164148},'minZoom':0.5}},{'longitude':264.64458333333334,'latitude':-43.007222222222225,'magnitude':1.86,'b_v':0.41,'letter':'theta','constell':'Sco','desigNo':'','bsNo':'6553','serialNo':39,'main':true,'letterLabel':{'vtr':{'x':0.029675230508051695,'y':-0.7308424782338271,'z':-0.6819007645569347},'orthogVtr':{'x':-0.9972266866061409,'y':0.024935181415850674,'z':-0.07012255163851752},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.008345635054840983,'y':-0.7301422237024771,'z':-0.6832442341815504},'orthogVtr':{'x':-0.9976332162476846,'y':0.04055643512446984,'z':-0.05552604262231551},'minZoom':0.5}},{'longitude':125.71791666666667,'latitude':-59.566111111111105,'magnitude':1.86,'b_v':1.2,'letter':'epsilon','constell':'Car','desigNo':'','bsNo':'3307','serialNo':40,'main':true,'letterLabel':{'vtr':{'x':0.32305269472362197,'y':0.3148902709980039,'z':-0.8924578834110942},'orthogVtr':{'x':-0.8989927299703536,'y':0.39677546267861896,'z':-0.18542196114974938},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9459117728760037,'y':0.32442397866769274,'z':0},'orthogVtr':{'x':-0.1334237236862995,'y':-0.38901893606668153,'z':0.9115165260922203},'minZoom':0.5}},{'longitude':90.20333333333333,'latitude':44.947222222222216,'magnitude':1.9,'b_v':0.08,'letter':'beta','constell':'Aur','desigNo':'34','bsNo':'2088','serialNo':41,'main':true,'letterLabel':{'vtr':{'x':0.07141228735095546,'y':-0.7058218957923925,'z':-0.7047806301505014},'orthogVtr':{'x':0.9974437209796198,'y':0.05231249270560334,'z':0.04867675610860968},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9999936797223834,'y':0.0035553502341494586,'z':0},'orthogVtr':{'x':-0.0025163111198794386,'y':0.70774889965139,'z':0.7064595977270002},'minZoom':0.5}},{'longitude':252.63333333333333,'latitude':-69.05722222222222,'magnitude':1.91,'b_v':1.45,'letter':'alpha','constell':'TrA','desigNo':'','bsNo':'6217','serialNo':42,'main':true,'letterLabel':{'vtr':{'x':0.14493390969381817,'y':0.3248273943785071,'z':0.9346022285882557},'orthogVtr':{'x':0.9836724823480424,'y':-0.14915502418442234,'z':-0.10070365550358659},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9935382453259911,'y':0.11349781969073673,'z':0},'orthogVtr':{'x':0.03871880399038905,'y':0.33893701819605776,'z':0.9400119956223533},'minZoom':0.5}},{'longitude':99.68041666666667,'latitude':16.38277777777778,'magnitude':1.93,'b_v':0,'letter':'gamma','constell':'Gem','desigNo':'24','bsNo':'2421','serialNo':43,'main':true,'letterLabel':{'vtr':{'x':0.431877393381495,'y':0.8818377216980235,'z':0.1893255124816638},'orthogVtr':{'x':-0.8873872177153166,'y':0.37789983787288856,'z':0.2640750620015341},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5009530349369066,'y':0.8490585582289244,'z':0.16776656843877658},'orthogVtr':{'x':-0.850305953093372,'y':0.4467052938707314,'z':0.27826995267516036},'minZoom':0.5}},{'longitude':131.29666666666665,'latitude':-54.77361111111111,'magnitude':1.93,'b_v':0.04,'letter':'delta','constell':'Vel','desigNo':'','bsNo':'3485','serialNo':44,'main':true,'letterLabel':{'vtr':{'x':-0.799233867769039,'y':0.05493778007290562,'z':0.5985040224857333},'orthogVtr':{'x':0.46509784667668025,'y':-0.5741863920079391,'z':0.6737907540547143},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.2444717688043749,'y':-0.5408709854861076,'z':0.804793222708136},'orthogVtr':{'x':0.8918095854104751,'y':-0.20041644020818408,'z':-0.4055969845354827},'minZoom':0.5}},{'longitude':306.7554166666667,'latitude':-56.677499999999995,'magnitude':1.94,'b_v':-0.12,'letter':'alpha','constell':'Pav','desigNo':'','bsNo':'7790','serialNo':45,'main':true,'letterLabel':{'vtr':{'x':-0.49179262674904634,'y':0.24641161813884732,'z':0.8351175526364345},'orthogVtr':{'x':0.8062725334092532,'y':0.49098659017907614,'z':0.32993449370162664},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.49179262674904634,'y':0.24641161813884732,'z':0.8351175526364345},'orthogVtr':{'x':0.8062725334092532,'y':0.49098659017907614,'z':0.32993449370162664},'minZoom':0.5}},{'longitude':43.403333333333336,'latitude':89.33805555555556,'magnitude':1.97,'b_v':0.64,'letter':'alpha','constell':'UMi','desigNo':'1','bsNo':'424','main':true,'serialNo':46,'letterLabel':{'vtr':{'x':-0.7996600936417151,'y':0.011478462041795087,'z':0.6003432181228325},'orthogVtr':{'x':-0.6003942729402802,'y':-0.0013089392449307556,'z':-0.7997030722077825},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.20127166378615144,'y':-0.009465507622016353,'z':-0.9794897250723011},'orthogVtr':{'x':0.9794994975492934,'y':-0.006623637841050855,'z':0.20133768083106604},'minZoom':0.5}},{'longitude':95.86791666666667,'latitude':-17.965833333333332,'magnitude':1.98,'b_v':-0.24,'letter':'beta','constell':'CMa','desigNo':'2','bsNo':'2294','serialNo':47,'main':true,'letterLabel':{'vtr':{'x':0.9833028005324751,'y':0.11715691930452915,'z':-0.13924747295395906},'orthogVtr':{'x':-0.15381133229076543,'y':0.9439983973855187,'z':-0.2919059776580675},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9537198446763494,'y':0.3006966209828767,'z':0},'orthogVtr':{'x':-0.2845360809222419,'y':-0.9024634397784965,'z':0.32341762245829425},'minZoom':0.5}},{'longitude':142.11166666666668,'latitude':-8.735277777777776,'magnitude':1.99,'b_v':1.44,'letter':'alpha','constell':'Hya','desigNo':'30','bsNo':'3748','serialNo':48,'main':true,'letterLabel':{'vtr':{'x':-0.19110257815854442,'y':0.9815700711722813,'z':0},'orthogVtr':{'x':-0.5958140304922717,'y':-0.11599945910547448,'z':0.7947010548349561},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.19110257815854442,'y':0.9815700711722813,'z':0},'orthogVtr':{'x':-0.5958140304922717,'y':-0.11599945910547448,'z':0.7947010548349561},'minZoom':0.5}},{'longitude':32.04083333333333,'latitude':23.544444444444448,'magnitude':2.01,'b_v':1.15,'letter':'alpha','constell':'Ari','desigNo':'13','bsNo':'617','serialNo':49,'main':true,'letterLabel':{'vtr':{'x':-0.6212169584405323,'y':0.6108448943925894,'z':-0.4908747350805504},'orthogVtr':{'x':-0.10100413573412143,'y':-0.6835934262684247,'z':-0.7228403642072014},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5775393638988735,'y':0.1454946360286973,'z':-0.8032929689933563},'orthogVtr':{'x':0.25012122668175796,'y':-0.9051313541855538,'z':-0.34376824116465204},'minZoom':0.5}},{'longitude':155.23375,'latitude':19.7525,'magnitude':2.01,'b_v':1.13,'letter':'gamma^1','constell':'Leo','desigNo':'41','bsNo':'4057','serialNo':50,'main':true,'letterLabel':{'vtr':{'x':-0.5167344101987305,'y':-0.47819017750493564,'z':0.7101547038880812},'orthogVtr':{'x':-0.051466879258296155,'y':-0.8106285772254263,'z':-0.5832944969094882},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5167344101987305,'y':-0.47819017750493564,'z':0.7101547038880812},'orthogVtr':{'x':-0.051466879258296155,'y':-0.8106285772254263,'z':-0.5832944969094882},'minZoom':0.5}},{'longitude':11.116666666666667,'latitude':-17.890833333333333,'magnitude':2.04,'b_v':1.02,'letter':'beta','constell':'Cet','desigNo':'16','bsNo':'188','serialNo':51,'main':true,'letterLabel':{'vtr':{'x':-0.31250994152188344,'y':-0.9499144890199268,'z':0},'orthogVtr':{'x':0.17429403994867,'y':-0.05734055103019811,'z':0.9830227102391504},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.31250994152188344,'y':-0.9499144890199268,'z':0},'orthogVtr':{'x':0.17429403994867,'y':-0.05734055103019811,'z':0.9830227102391504},'minZoom':0.5}},{'longitude':284.0875,'latitude':-26.27361111111111,'magnitude':2.05,'b_v':-0.13,'letter':'sigma','constell':'Sgr','desigNo':'34','bsNo':'7121','serialNo':52,'main':true,'letterLabel':{'vtr':{'x':0.4396305518338518,'y':0.8402526088007674,'z':0.31733347018202734},'orthogVtr':{'x':0.871256931015612,'y':-0.31309619974536235,'z':-0.37799752626474886},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4396305518338518,'y':0.8402526088007674,'z':0.31733347018202734},'orthogVtr':{'x':0.871256931015612,'y':-0.31309619974536235,'z':-0.37799752626474886},'minZoom':0.5}},{'longitude':211.92958333333334,'latitude':-36.45527777777778,'magnitude':2.06,'b_v':1.01,'letter':'theta','constell':'Cen','desigNo':'5','bsNo':'5288','serialNo':53,'main':true,'letterLabel':{'vtr':{'x':-0.7126805692185824,'y':0.6700223668479708,'z':-0.20774126740183477},'orthogVtr':{'x':0.16157962440823403,'y':0.44497432010673843,'z':0.8808461156306701},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6565606893473991,'y':0.7542732006399724,'z':0},'orthogVtr':{'x':0.3208576475156805,'y':0.2792920629508523,'z':0.9050117753948623},'minZoom':0.5}},{'longitude':222.66791666666666,'latitude':74.08388888888888,'magnitude':2.07,'b_v':1.47,'letter':'beta','constell':'UMi','desigNo':'7','bsNo':'5563','main':true,'serialNo':54,'letterLabel':{'vtr':{'x':-0.6051383939608832,'y':-0.27152295120620196,'z':0.748386805818166},'orthogVtr':{'x':-0.7701617024024167,'y':-0.03843414350460066,'z':-0.6366896958218179},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.40086452679549545,'y':0.09211021189766608,'z':-0.9114951124505225},'orthogVtr':{'x':0.8936717265584548,'y':0.25829751311777055,'z':-0.36692402465252366},'minZoom':0.5}},{'longitude':340.92625,'latitude':-46.7925,'magnitude':2.07,'b_v':1.61,'letter':'beta','constell':'Gru','desigNo':'','bsNo':'8636','serialNo':55,'main':true,'letterLabel':{'vtr':{'x':0.01446434388132009,'y':-0.28165154050421637,'z':-0.9594077300541646},'orthogVtr':{'x':-0.7623063028556438,'y':-0.6240254741872373,'z':0.17170121779403175},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.607815253982452,'y':0.6702763051310694,'z':0.4257819768450624},'orthogVtr':{'x':0.460305044121401,'y':0.1395172300572451,'z':-0.8767292677181191},'minZoom':0.5}},{'longitude':17.679583333333333,'latitude':35.71277777777778,'magnitude':2.07,'b_v':1.58,'letter':'beta','constell':'And','desigNo':'43','bsNo':'337','serialNo':56,'main':true,'letterLabel':{'vtr':{'x':0.22092559125845343,'y':-0.613176721306223,'z':-0.7584234909173457},'orthogVtr':{'x':0.593908900239206,'y':-0.5322429720893013,'z':0.6033155367452461},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.22092559125845343,'y':-0.613176721306223,'z':-0.7584234909173457},'orthogVtr':{'x':0.593908900239206,'y':-0.5322429720893013,'z':0.6033155367452461},'minZoom':0.5}},{'longitude':87.14666666666666,'latitude':-9.664722222222222,'magnitude':2.07,'b_v':-0.17,'letter':'kappa','constell':'Ori','desigNo':'53','bsNo':'2004','serialNo':57,'main':true,'letterLabel':{'vtr':{'x':-0.9598350110597857,'y':-0.2805650575960254,'z':0},'orthogVtr':{'x':0.27624010587440107,'y':-0.9450390128726717,'z':0.1749075986203753},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9598350110597857,'y':-0.2805650575960254,'z':0},'orthogVtr':{'x':0.27624010587440107,'y':-0.9450390128726717,'z':0.1749075986203753},'minZoom':0.5}},{'longitude':2.3241666666666667,'latitude':29.186944444444446,'magnitude':2.07,'b_v':-0.04,'letter':'alpha','constell':'And','desigNo':'21','bsNo':'15','serialNo':58,'main':true,'letterLabel':{'vtr':{'x':-0.4364404360434407,'y':0.7439568600959752,'z':-0.5060117944300794},'orthogVtr':{'x':0.22042279723245026,'y':-0.45685357901350726,'z':-0.8617996274092785},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.1740373970442645,'y':-0.24201397795323265,'z':0.9545366514206299},'orthogVtr':{'x':-0.4569217090307962,'y':0.8388183574627857,'z':0.2959836397502587},'minZoom':0.5}},{'longitude':263.93666666666667,'latitude':12.54861111111111,'magnitude':2.08,'b_v':0.16,'letter':'alpha','constell':'Oph','desigNo':'55','bsNo':'6556','serialNo':59,'main':true,'letterLabel':{'vtr':{'x':0.9034349567923479,'y':0.42872517869330773,'z':0},'orthogVtr':{'x':0.41614269632639755,'y':-0.8769204085959105,'z':0.24049085904079032},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9034349567923479,'y':0.42872517869330773,'z':0},'orthogVtr':{'x':0.41614269632639755,'y':-0.8769204085959105,'z':0.24049085904079032},'minZoom':0.5}},{'longitude':47.32875,'latitude':41.02194444444444,'magnitude':2.09,'b_v':0,'letter':'beta','constell':'Per','desigNo':'26','bsNo':'936','serialNo':60,'main':true,'letterLabel':{'vtr':{'x':-0.777021013494673,'y':0.6288613214602122,'z':0.02778098196656762},'orthogVtr':{'x':-0.36707534448327445,'y':-0.41682213595477546,'z':-0.8315738081797575},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.03903867140605305,'y':0.6270912108995559,'z':0.777966962889414},'orthogVtr':{'x':-0.8584765262222687,'y':0.4194804737566631,'z':-0.29504946375520125},'minZoom':0.5}},{'longitude':31.245416666666667,'latitude':42.41277777777778,'magnitude':2.1,'b_v':1.37,'letter':'gamma^1','constell':'And','desigNo':'57','bsNo':'603','serialNo':61,'main':true,'letterLabel':{'vtr':{'x':-0.5943437411592428,'y':0.1033891449392583,'z':-0.7975375866086587},'orthogVtr':{'x':0.49831867699780175,'y':-0.7310300088587071,'z':-0.4661261871030192},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7301292297046023,'y':-0.6833090866737863,'z':0},'orthogVtr':{'x':0.2616816662110068,'y':0.27961201907691374,'z':0.9237639440662115},'minZoom':0.5}},{'longitude':177.48791666666668,'latitude':14.474166666666667,'magnitude':2.14,'b_v':0.09,'letter':'beta','constell':'Leo','desigNo':'94','bsNo':'4534','serialNo':62,'main':true,'letterLabel':{'vtr':{'x':-0.10380628561488078,'y':-0.5432148425601668,'z':-0.8331517808233833},'orthogVtr':{'x':0.23129429930607012,'y':0.8015272296897971,'z':-0.551413680619472},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.009009860641267645,'y':0.13339968889382017,'z':0.9910213647617577},'orthogVtr':{'x':-0.25336065250126966,'y':-0.9590270007225551,'z':0.1267895565463938},'minZoom':0.5}},{'longitude':14.444583333333334,'latitude':60.81111111111111,'magnitude':2.15,'b_v':-0.05,'letter':'gamma','constell':'Cas','desigNo':'27','bsNo':'264','main':true,'serialNo':63,'letterLabel':{'vtr':{'x':0.05226210131108247,'y':0.11003589421694342,'z':0.9925526559082031},'orthogVtr':{'x':-0.8799010110123007,'y':0.4751147199997771,'z':-0.006341424056540472},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.1820476118645495,'y':0.03843063322762533,'z':0.9825384233932728},'orthogVtr':{'x':-0.862447554016088,'y':0.4861738183060794,'z':0.1407808046764707},'minZoom':0.5}},{'longitude':190.6225,'latitude':-49.05555555555555,'magnitude':2.2,'b_v':-0.02,'letter':'gamma','constell':'Cen','desigNo':'','bsNo':'4819','serialNo':64,'main':true,'letterLabel':{'vtr':{'x':0.6902656113193603,'y':-0.5058656981597112,'z':0.5173328534466932},'orthogVtr':{'x':0.3296557759670291,'y':-0.4165972700092301,'z':-0.8472153114719024},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5611971344140907,'y':-0.3592954154641456,'z':0.7456303244583472},'orthogVtr':{'x':0.5198050799327835,'y':-0.5480512698463552,'z':-0.6553186129630918},'minZoom':0.5}},{'longitude':139.38958333333332,'latitude':-59.34916666666667,'magnitude':2.21,'b_v':0.19,'letter':'iota','constell':'Car','desigNo':'','bsNo':'3699','serialNo':65,'main':true,'letterLabel':{'vtr':{'x':-0.1098917601382312,'y':-0.31428423330734945,'z':0.9429470938224123},'orthogVtr':{'x':0.9154995392676084,'y':-0.4014055675351512,'z':-0.027095459999414456},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.3749348718043143,'y':-0.1819615322405963,'z':0.9090180651063744},'orthogVtr':{'x':0.842401001453918,'y':-0.47622579701068246,'z':0.2521300121187004},'minZoom':0.5}},{'longitude':121.05,'latitude':-40.05333333333333,'magnitude':2.21,'b_v':-0.27,'letter':'zeta','constell':'Pup','desigNo':'','bsNo':'3165','serialNo':66,'main':true,'letterLabel':{'vtr':{'x':0.870097608221878,'y':-0.49109196691907003,'z':-0.04193843337710885},'orthogVtr':{'x':0.29505637704267124,'y':0.5871421618722591,'z':-0.7537942797066205},'minZoom':1.3},'shortNameLabel':{'vtr':{'x':-0.8523635308934403,'y':0.5229497214865566,'z':0},'orthogVtr':{'x':-0.342935161028797,'y':-0.5589551207544341,'z':0.7549600309371016},'minZoom':0.5}},{'longitude':233.8575,'latitude':26.656666666666666,'magnitude':2.22,'b_v':0.03,'letter':'alpha','constell':'CrB','desigNo':'5','bsNo':'5793','main':true,'serialNo':67,'letterLabel':{'vtr':{'x':-0.8496669138370874,'y':-0.26325908816067556,'z':-0.4569034778061657},'orthogVtr':{'x':0.014987654438802567,'y':0.8540573324233396,'z':-0.5199629247824813},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8013164363493386,'y':-0.5451640118526185,'z':-0.24634968848601058},'orthogVtr':{'x':-0.2829319053967115,'y':0.7081775728911635,'z':-0.6468647943446661},'minZoom':0.5}},{'longitude':201.15708333333333,'latitude':54.83444444444444,'magnitude':2.23,'b_v':0.06,'letter':'zeta','constell':'UMa','desigNo':'79','bsNo':'5054','serialNo':68,'main':true,'letterLabel':{'vtr':{'x':-0.5980610111263226,'y':-0.19529605981676298,'z':-0.7772917573154936},'orthogVtr':{'x':0.5948326264211196,'y':0.5418186502986709,'z':-0.5938069524125491},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.12647794714620775,'y':-0.1655986473159673,'z':0.9780492916478204},'orthogVtr':{'x':-0.8339701165930153,'y':-0.5516204209404761,'z':0.014448385075308892},'minZoom':0.5}},{'longitude':137.16,'latitude':-43.50388888888889,'magnitude':2.23,'b_v':1.67,'letter':'lambda','constell':'Vel','desigNo':'','bsNo':'3634','serialNo':69,'main':true,'letterLabel':{'vtr':{'x':-0.48929472573906574,'y':-0.2255314584843075,'z':0.8424525105890974},'orthogVtr':{'x':0.6911771475234759,'y':-0.6893734533748765,'z':0.21688336156401722},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7913395153833449,'y':0.6113769470570942,'z':0},'orthogVtr':{'x':-0.301524375942658,'y':-0.3902799323449887,'z':0.8699221948664039},'minZoom':0.5}},{'longitude':305.71416666666664,'latitude':40.31333333333333,'magnitude':2.23,'b_v':0.67,'letter':'gamma','constell':'Cyg','desigNo':'37','bsNo':'7796','main':true,'serialNo':70,'letterLabel':{'vtr':{'x':-0.009199262344616765,'y':0.6946530518725178,'z':-0.7192861121254268},'orthogVtr':{'x':0.8954268319071885,'y':-0.31446863761186367,'z':-0.31515117746756777},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8238494606465346,'y':-0.5668086680639368,'z':0},'orthogVtr':{'x':-0.3509215067781444,'y':-0.5100601144226535,'z':0.7852978898199755},'minZoom':0.5}},{'longitude':269.25333333333333,'latitude':51.487500000000004,'magnitude':2.24,'b_v':1.52,'letter':'gamma','constell':'Dra','desigNo':'33','bsNo':'6705','main':true,'serialNo':71,'letterLabel':{'vtr':{'x':0.9686918575008403,'y':-0.14835518821637902,'z':0.19906487219209448},'orthogVtr':{'x':-0.24813351342894624,'y':-0.6047543271689122,'z':0.7567707468473419},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9686918575008403,'y':-0.14835518821637902,'z':0.19906487219209448},'orthogVtr':{'x':-0.24813351342894624,'y':-0.6047543271689122,'z':0.7567707468473419},'minZoom':0.5}},{'longitude':10.377916666666666,'latitude':56.63305555555556,'magnitude':2.24,'b_v':1.17,'letter':'alpha','constell':'Cas','desigNo':'18','bsNo':'168','main':true,'serialNo':72,'letterLabel':{'vtr':{'x':0.2937722767928105,'y':-0.07727345022094809,'z':0.9527469041035604},'orthogVtr':{'x':-0.7880451563322698,'y':0.5445435842651799,'z':0.2871534718872112},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8392948226929826,'y':-0.5436765588111696,'z':0},'orthogVtr':{'x':0.053865755648076996,'y':0.0831546791988478,'z':0.9950797855929937},'minZoom':0.5}},{'longitude':83.22541666666666,'latitude':-0.2875,'magnitude':2.25,'b_v':-0.18,'letter':'delta','constell':'Ori','desigNo':'34','bsNo':'1852','serialNo':73,'main':true,'letterLabel':{'vtr':{'x':0.3391549985397663,'y':0.9400589715967979,'z':0.035538948857020684},'orthogVtr':{'x':-0.9333053393415882,'y':0.34097500142691606,'z':-0.11259303690014583},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.595345077086022,'y':0.8006987290011652,'z':0.06667671681596801},'orthogVtr':{'x':-0.7947636181075881,'y':0.5990462144556402,'z':-0.09743933640426095},'minZoom':0.5}},{'longitude':2.5304166666666665,'latitude':59.24611111111111,'magnitude':2.28,'b_v':0.38,'letter':'beta','constell':'Cas','desigNo':'11','bsNo':'21','main':true,'serialNo':74,'letterLabel':{'vtr':{'x':-0.7071198387773645,'y':0.4051222729339193,'z':-0.5795321195415566},'orthogVtr':{'x':0.4888874514287271,'y':-0.31201957438499417,'z':-0.8146366337430027},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.37396522383063246,'y':0.2457963750420647,'z':0.8942785658739036},'orthogVtr':{'x':-0.7740668045603731,'y':0.44840206605536354,'z':-0.4469409012777578},'minZoom':0.5}},{'longitude':205.25208333333333,'latitude':-53.55472222222222,'magnitude':2.29,'b_v':-0.17,'letter':'epsilon','constell':'Cen','desigNo':'','bsNo':'5132','serialNo':75,'main':true,'letterLabel':{'vtr':{'x':0.7259893837279772,'y':-0.5940507974914871,'z':-0.346472314498576},'orthogVtr':{'x':-0.4292580151723884,'y':0.002171294822112174,'z':-0.9031792966454983},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.831571148638672,'y':0.5554182430851186,'z':0},'orthogVtr':{'x':0.14075671787600824,'y':0.21074069319833938,'z':0.9673551088421755},'minZoom':0.5}},{'longitude':252.825,'latitude':-34.32361111111111,'magnitude':2.29,'b_v':1.14,'letter':'epsilon','constell':'Sco','desigNo':'26','bsNo':'6241','serialNo':76,'main':true,'letterLabel':{'vtr':{'x':0.4943523341702596,'y':0.6276872805469638,'z':0.6013521826184499},'orthogVtr':{'x':0.8343516778089135,'y':-0.5367153135329896,'z':-0.12567398281520242},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.265428785032153,'y':0.8213447008679818,'z':0.504916272695227},'orthogVtr':{'x':0.9327778474205357,'y':0.0862990863065392,'z':0.34996850581755},'minZoom':0.5}},{'longitude':240.34291666666667,'latitude':-22.67027777777778,'magnitude':2.29,'b_v':-0.12,'letter':'delta','constell':'Sco','desigNo':'7','bsNo':'5953','serialNo':77,'main':true,'letterLabel':{'vtr':{'x':-0.2585904844777753,'y':-0.8048875333242913,'z':-0.5341226638485652},'orthogVtr':{'x':-0.8512739750225965,'y':0.4512225173301013,'z':-0.26782617367149564},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8513690561726946,'y':-0.07236641034696989,'z':-0.519551568994945},'orthogVtr':{'x':-0.2582772723350585,'y':0.9198960833159742,'z':0.2951000618351213},'minZoom':0.5}},{'longitude':220.77541666666667,'latitude':-47.46222222222222,'magnitude':2.3,'b_v':-0.15,'letter':'alpha','constell':'Lup','desigNo':'','bsNo':'5469','serialNo':78,'main':true,'letterLabel':{'vtr':{'x':0.3332675187023436,'y':0.30337449197124555,'z':0.892690695929543},'orthogVtr':{'x':0.7917155538606733,'y':-0.6041878197550032,'z':-0.09024167681721623},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7868020491573539,'y':-0.19598045148802545,'z':0.5852642121950894},'orthogVtr':{'x':0.3447075466083076,'y':-0.647047654005225,'z':-0.6800779666755981},'minZoom':0.5}},{'longitude':219.15625,'latitude':-42.23361111111111,'magnitude':2.33,'b_v':-0.16,'letter':'eta','constell':'Cen','desigNo':'','bsNo':'5440','serialNo':79,'main':true,'letterLabel':{'vtr':{'x':-0.7449907773079569,'y':0.6657354468484807,'z':0.04224992941461095},'orthogVtr':{'x':0.3396450169540376,'y':0.32404306258913146,'z':0.8829707560537595},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.698633857436444,'y':0.10442291465817505,'z':-0.707818188617505},'orthogVtr':{'x':-0.426943472908413,'y':0.7330098542973225,'z':0.5295430336090935},'minZoom':0.5}},{'longitude':165.72166666666666,'latitude':56.288333333333334,'magnitude':2.34,'b_v':0.03,'letter':'beta','constell':'UMa','desigNo':'48','bsNo':'4295','serialNo':80,'main':true,'letterLabel':{'vtr':{'x':-0.3488698324732783,'y':-0.07181571191421623,'z':0.9344155090281417},'orthogVtr':{'x':-0.7674547934259226,'y':-0.5503479297654642,'z':-0.3288317141798253},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8397456372591867,'y':0.5429799855465783,'z':0},'orthogVtr':{'x':-0.0743255317271327,'y':0.11494814296331897,'z':0.990587017764095},'minZoom':0.5}},{'longitude':221.43791666666667,'latitude':27.00111111111111,'magnitude':2.35,'b_v':0.97,'letter':'epsilon','constell':'Boo','desigNo':'36','bsNo':'5506','serialNo':81,'main':true,'letterLabel':{'vtr':{'x':0.6578288227547292,'y':0.7307048185443846,'z':0.18256973492105752},'orthogVtr':{'x':0.3479862855040558,'y':-0.5098503752876178,'z':0.7867389274213941},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5621380515562963,'y':0.8270434154217606,'z':0},'orthogVtr':{'x':0.4876823002101613,'y':-0.33147567939807543,'z':0.8076446297904236},'minZoom':0.5}},{'longitude':326.26125,'latitude':9.955833333333333,'magnitude':2.38,'b_v':1.52,'letter':'epsilon','constell':'Peg','desigNo':'8','bsNo':'8308','serialNo':82,'main':true,'letterLabel':{'vtr':{'x':0.20653218072314375,'y':-0.978439808228254,'z':0},'orthogVtr':{'x':-0.5352489089157243,'y':-0.11298203881158857,'z':0.8371043330496524},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.20653218072314375,'y':-0.978439808228254,'z':0},'orthogVtr':{'x':-0.5352489089157243,'y':-0.11298203881158857,'z':0.8371043330496524},'minZoom':0.5}},{'longitude':265.925,'latitude':-39.03722222222222,'magnitude':2.39,'b_v':-0.17,'letter':'kappa','constell':'Sco','desigNo':'','bsNo':'6580','serialNo':83,'main':true,'letterLabel':{'vtr':{'x':0.39998392512719494,'y':0.6970264406380721,'z':0.5951193163486317},'orthogVtr':{'x':0.9148585622979106,'y':-0.3427454521604445,'z':-0.21344640079779437},'minZoom':0.6},'shortNameLabel':{'vtr':{'x':0.014520728947160784,'y':0.7753678169522729,'z':0.6313429312707237},'orthogVtr':{'x':0.9983699103041921,'y':-0.04609829020597257,'z':0.03365218921980525},'minZoom':1.5}},{'longitude':6.786666666666667,'latitude':-42.21083333333333,'magnitude':2.4,'b_v':1.08,'letter':'alpha','constell':'Phe','desigNo':'','bsNo':'99','serialNo':84,'main':true,'letterLabel':{'vtr':{'x':0.6611265707850558,'y':0.7399198720112803,'z':-0.1242185187675447},'orthogVtr':{'x':-0.14822124892687327,'y':-0.03349409579493699,'z':-0.9883868710750043},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.43540823249858934,'y':0.5676664622737385,'z':-0.6986948251433328},'orthogVtr':{'x':-0.5191122733127238,'y':-0.475771015363408,'z':-0.7100453426621203},'minZoom':0.5}},{'longitude':178.68625,'latitude':53.597500000000004,'magnitude':2.41,'b_v':0.04,'letter':'gamma','constell':'UMa','desigNo':'64','bsNo':'4554','serialNo':85,'main':true,'letterLabel':{'vtr':{'x':-0.5979323228601743,'y':-0.45194888546726475,'z':-0.6619812249633168},'orthogVtr':{'x':0.5389567797685244,'y':0.3846165133578347,'z':-0.7493969089834871},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5979323228601743,'y':-0.45194888546726475,'z':-0.6619812249633168},'orthogVtr':{'x':0.5389567797685244,'y':0.3846165133578347,'z':-0.7493969089834871},'minZoom':0.5}},{'longitude':257.84583333333336,'latitude':-15.745277777777776,'magnitude':2.43,'b_v':0.06,'letter':'eta','constell':'Oph','desigNo':'35','bsNo':'6378','serialNo':86,'main':true,'letterLabel':{'vtr':{'x':-0.6059425802878801,'y':-0.7200524072115156,'z':-0.3381687748195679},'orthogVtr':{'x':-0.7692655542865083,'y':0.6386608416921193,'z':0.01851583855472974},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8012427469690219,'y':0.5983394190837971,'z':0},'orthogVtr':{'x':0.5629795414108746,'y':0.7538919547338656,'z':0.33867529661956813},'minZoom':0.5}},{'longitude':346.15625,'latitude':28.178055555555556,'magnitude':2.44,'b_v':1.66,'letter':'beta','constell':'Peg','desigNo':'53','bsNo':'8775','serialNo':87,'main':true,'letterLabel':{'vtr':{'x':-0.17812701752718116,'y':0.6520269367571797,'z':-0.7369746531393871},'orthogVtr':{'x':0.48553278840994174,'y':-0.5931910133590886,'z':-0.6421700188025631},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.17812701752718116,'y':0.6520269367571797,'z':-0.7369746531393871},'orthogVtr':{'x':0.48553278840994174,'y':-0.5931910133590886,'z':-0.6421700188025631},'minZoom':0.5}},{'longitude':111.19708333333334,'latitude':-29.338055555555556,'magnitude':2.45,'b_v':-0.08,'letter':'eta','constell':'CMa','desigNo':'31','bsNo':'2827','serialNo':88,'main':true,'letterLabel':{'vtr':{'x':0.05934200084443192,'y':-0.8649199901758096,'z':0.4983893433151002},'orthogVtr':{'x':0.9471672462278838,'y':-0.1088626330885491,'z':-0.301700405684373},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6112642722487334,'y':-0.550297372248953,'z':0.568795913811029},'orthogVtr':{'x':0.7259498983148629,'y':-0.6760994485906581,'z':0.12604079003262564},'minZoom':0.5}},{'longitude':319.74916666666667,'latitude':62.66,'magnitude':2.45,'b_v':0.26,'letter':'alpha','constell':'Cep','desigNo':'5','bsNo':'8162','main':true,'serialNo':89,'letterLabel':{'vtr':{'x':-0.8721260700208393,'y':0.19410421502551115,'z':0.44913213167099986},'orthogVtr':{'x':-0.3413621520620074,'y':0.4162358901417056,'z':-0.8427452550430272},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9301974736436859,'y':-0.36705947750589996,'z':0},'orthogVtr':{'x':-0.10892502420152642,'y':-0.27603641518072125,'z':0.9549550966390374},'minZoom':0.5}},{'longitude':140.66416666666666,'latitude':-55.08583333333333,'magnitude':2.47,'b_v':-0.14,'letter':'kappa','constell':'Vel','desigNo':'','bsNo':'3734','serialNo':90,'main':true,'letterLabel':{'vtr':{'x':-0.5741812426353962,'y':0.5699937030963088,'z':-0.5877270446697425},'orthogVtr':{'x':-0.6887312131791723,'y':0.051866628025596634,'z':0.7231591587541433},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7723068222524117,'y':0.554253256449704,'z':-0.31039571520444764},'orthogVtr':{'x':-0.45560614098579033,'y':-0.14278058827126094,'z':0.8786562171344086},'minZoom':0.5}},{'longitude':311.73,'latitude':34.03666666666666,'magnitude':2.48,'b_v':1.02,'letter':'epsilon','constell':'Cyg','desigNo':'53','bsNo':'7949','main':true,'serialNo':91,'letterLabel':{'vtr':{'x':0.5995955017062655,'y':0.24935453094326906,'z':-0.7604653524202625},'orthogVtr':{'x':0.5798597883989118,'y':-0.7902734376657105,'z':0.1980669571584063},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7122649020572885,'y':-0.7019107559350558,'z':0},'orthogVtr':{'x':-0.4340862231927434,'y':-0.4404895902113871,'z':0.7858359063759202},'minZoom':0.5}},{'longitude':346.40833333333336,'latitude':15.299722222222222,'magnitude':2.49,'b_v':0,'letter':'alpha','constell':'Peg','desigNo':'54','bsNo':'8781','serialNo':92,'main':true,'letterLabel':{'vtr':{'x':0.270920112935987,'y':-0.9626018348241147,'z':0},'orthogVtr':{'x':-0.21819489484434337,'y':-0.06141000714390538,'z':0.973971148898391},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.270920112935987,'y':-0.9626018348241147,'z':0},'orthogVtr':{'x':-0.21819489484434337,'y':-0.06141000714390538,'z':0.973971148898391},'minZoom':0.5}},{'longitude':45.799166666666665,'latitude':4.157500000000001,'magnitude':2.54,'b_v':1.63,'letter':'alpha','constell':'Cet','desigNo':'92','bsNo':'911','serialNo':93,'main':true,'letterLabel':{'vtr':{'x':0.6987336115512482,'y':0.16457124297336076,'z':0.6961951206915722},'orthogVtr':{'x':-0.16814377209941775,'y':0.9836972539267983,'z':-0.06377604974483726},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.10370097188315137,'y':-0.9946085201879632,'z':0},'orthogVtr':{'x':0.7111589811271185,'y':0.07414764302680302,'z':0.6991101705709971},'minZoom':0.5}},{'longitude':249.53125,'latitude':-10.601111111111111,'magnitude':2.54,'b_v':0.04,'letter':'zeta','constell':'Oph','desigNo':'13','bsNo':'6175','serialNo':94,'main':true,'letterLabel':{'vtr':{'x':-0.9390605314906363,'y':0.07158581128296088,'z':-0.33621539200263284},'orthogVtr':{'x':0.004067718971027215,'y':0.9803215590093581,'z':0.19736538349932214},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4718836438413884,'y':0.8816608342639326,'z':0},'orthogVtr':{'x':0.8118971947334694,'y':0.4345446591095146,'z':0.3898639306518603},'minZoom':0.5}},{'longitude':209.16,'latitude':-47.37388888888889,'magnitude':2.55,'b_v':-0.18,'letter':'zeta','constell':'Cen','desigNo':'','bsNo':'5231','serialNo':95,'main':true,'letterLabel':{'vtr':{'x':0.38047317447051393,'y':-0.615383034706431,'z':-0.6903215802101463},'orthogVtr':{'x':-0.7109894602505554,'y':0.2826993859457919,'z':-0.643875022499317},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3699599097775538,'y':-0.6111524701574728,'z':-0.6997301789817298},'orthogVtr':{'x':-0.7165162344542031,'y':0.29173254950218297,'z':-0.6336375977832487},'minZoom':0.5}},{'longitude':168.75916666666666,'latitude':20.427500000000002,'magnitude':2.56,'b_v':0.13,'letter':'delta','constell':'Leo','desigNo':'68','bsNo':'4357','serialNo':96,'main':true,'letterLabel':{'vtr':{'x':-0.15463047668329993,'y':0.10684878934281687,'z':0.9821775561967754},'orthogVtr':{'x':-0.36232004328953243,'y':-0.9310032601057631,'z':0.04423930269695242},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3549952452445842,'y':0.9348681061271358,'z':0},'orthogVtr':{'x':-0.170776971346756,'y':0.06484873366417357,'z':0.9831733660956151},'minZoom':0.5}},{'longitude':241.61416666666668,'latitude':-19.851944444444445,'magnitude':2.56,'b_v':-0.07,'letter':'beta^1','constell':'Sco','desigNo':'8','bsNo':'5984','serialNo':97,'main':true,'letterLabel':{'vtr':{'x':-0.6893588635449375,'y':0.7203268019032713,'z':-0.07690029721553507},'orthogVtr':{'x':0.5699446540772626,'y':0.6048201362890873,'z':0.5561975314831948},'minZoom':1.4},'shortNameLabel':{'vtr':{'x':0.18862332207429217,'y':0.868520481063568,'z':0.45835948374912694},'orthogVtr':{'x':0.874341920434378,'y':-0.3610405417318849,'z':0.32430839242466575},'minZoom':0.5}},{'longitude':182.31791666666666,'latitude':-50.819722222222225,'magnitude':2.58,'b_v':-0.13,'letter':'delta','constell':'Cen','desigNo':'','bsNo':'4621','serialNo':98,'main':true,'letterLabel':{'vtr':{'x':0.629374979098493,'y':-0.49271730992487567,'z':0.6009299361699043},'orthogVtr':{'x':0.4532285529210353,'y':-0.395415640340928,'z':-0.7988932032448881},'minZoom':1.6},'shortNameLabel':{'vtr':{'x':-0.7754151591979097,'y':0.6314517644967668,'z':0},'orthogVtr':{'x':0.016134323171568633,'y':0.019812754471599033,'z':0.9996735158920855},'minZoom':0.5}},{'longitude':83.37583333333333,'latitude':-17.810833333333335,'magnitude':2.58,'b_v':0.21,'letter':'alpha','constell':'Lep','desigNo':'11','bsNo':'1865','serialNo':99,'main':true,'letterLabel':{'vtr':{'x':0.21213214480777626,'y':0.9367626910987641,'z':-0.27834441561607487},'orthogVtr':{'x':-0.9710499051909263,'y':0.1700468928348433,'z':-0.1677681014552791},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.21213214480777626,'y':0.9367626910987641,'z':-0.27834441561607487},'orthogVtr':{'x':-0.9710499051909263,'y':0.1700468928348433,'z':-0.1677681014552791},'minZoom':0.5}},{'longitude':184.17708333333334,'latitude':-17.63888888888889,'magnitude':2.58,'b_v':-0.11,'letter':'gamma','constell':'Crv','desigNo':'4','bsNo':'4662','serialNo':100,'main':true,'letterLabel':{'vtr':{'x':0.02013977464450649,'y':-0.28284724155761953,'z':-0.9589535063914799},'orthogVtr':{'x':-0.31021278857511886,'y':0.9100430009624664,'z':-0.27493592381439885},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.01577291239497082,'y':-0.2700144238699138,'z':-0.9627270776999987},'orthogVtr':{'x':-0.31046545693983973,'y':0.9139327308723135,'z':-0.2614156909739963},'minZoom':0.5}},{'longitude':285.93083333333334,'latitude':-29.853611111111114,'magnitude':2.6,'b_v':0.06,'letter':'zeta','constell':'Sgr','desigNo':'38','bsNo':'7194','serialNo':101,'main':true,'letterLabel':{'vtr':{'x':-0.22044742833959508,'y':-0.8639573679919885,'z':-0.45274783006748337},'orthogVtr':{'x':-0.9459034693093672,'y':0.07607272848486153,'z':0.31540381533737327},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.22044742833959508,'y':-0.8639573679919885,'z':-0.45274783006748337},'orthogVtr':{'x':-0.9459034693093672,'y':0.07607272848486153,'z':0.31540381533737327},'minZoom':0.5}},{'longitude':229.48791666666668,'latitude':-9.446388888888889,'magnitude':2.61,'b_v':-0.07,'letter':'beta','constell':'Lib','desigNo':'27','bsNo':'5685','serialNo':102,'main':true,'letterLabel':{'vtr':{'x':0.12054413200235724,'y':-0.9862736451816914,'z':-0.11284240807345983},'orthogVtr':{'x':-0.7581854492788139,'y':-0.018093855949386214,'z':-0.65178787721065},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.24811593340282506,'y':0.9687303461705145,'z':0},'orthogVtr':{'x':0.7265084630270757,'y':0.1860768852153682,'z':0.6614838213732691},'minZoom':0.5}},{'longitude':236.28291666666667,'latitude':6.371666666666666,'magnitude':2.63,'b_v':1.17,'letter':'alpha','constell':'Ser','desigNo':'24','bsNo':'5854','serialNo':103,'main':true,'letterLabel':{'vtr':{'x':-0.6287107968808918,'y':-0.7066028733504679,'z':-0.32470773513770285},'orthogVtr':{'x':-0.5480784591245845,'y':0.6988536155606662,'z':-0.4595798370918873},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.48838071566609115,'y':0.7604546153722599,'z':-0.428010577584836},'orthogVtr':{'x':0.6761298248387373,'y':0.6398380846498442,'z':0.36531587071349286},'minZoom':0.5}},{'longitude':28.9025,'latitude':20.892777777777777,'magnitude':2.64,'b_v':0.17,'letter':'beta','constell':'Ari','desigNo':'6','bsNo':'553','serialNo':104,'main':true,'letterLabel':{'vtr':{'x':0.5664506324805454,'y':-0.6368061199094168,'z':0.5230790060863689},'orthogVtr':{'x':0.10100413660603266,'y':0.6835934252882447,'z':0.7228403650123275},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5664506324805454,'y':-0.6368061199094168,'z':0.5230790060863689},'orthogVtr':{'x':0.10100413660603266,'y':0.6835934252882447,'z':0.7228403650123275},'minZoom':0.5}},{'longitude':188.8275,'latitude':-23.493333333333336,'magnitude':2.65,'b_v':0.89,'letter':'beta','constell':'Crv','desigNo':'9','bsNo':'4786','serialNo':105,'main':true,'letterLabel':{'vtr':{'x':-0.4026500610278373,'y':0.9153539907348845,'z':0},'orthogVtr':{'x':0.1288262626724313,'y':0.05666868015225205,'z':0.9900466932097978},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4026500610278373,'y':0.9153539907348845,'z':0},'orthogVtr':{'x':0.1288262626724313,'y':0.05666868015225205,'z':0.9900466932097978},'minZoom':0.5}},{'longitude':85.07083333333334,'latitude':-34.06583333333333,'magnitude':2.65,'b_v':-0.12,'letter':'alpha','constell':'Col','desigNo':'','bsNo':'1956','serialNo':106,'main':true,'letterLabel':{'vtr':{'x':-0.02333833078925704,'y':0.8262678033988714,'z':-0.5627937805114545},'orthogVtr':{'x':-0.9971904853585842,'y':-0.05932097512075227,'z':-0.045740111729576455},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.20370475076799321,'y':0.8018278476604408,'z':-0.5617619399984077},'orthogVtr':{'x':-0.9764414556379033,'y':-0.20810949939658654,'z':0.05703086859442564},'minZoom':0.5}},{'longitude':90.22875,'latitude':37.21222222222222,'magnitude':2.65,'b_v':-0.08,'letter':'theta','constell':'Aur','desigNo':'37','bsNo':'2095','serialNo':107,'main':true,'letterLabel':{'vtr':{'x':-0.6329160660562275,'y':-0.6178030299096625,'z':-0.46662262007145533},'orthogVtr':{'x':0.7742138875212132,'y':-0.5025672635377644,'z':-0.3847323771005679},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9999861796168233,'y':0.005257430489351338,'z':0},'orthogVtr':{'x':-0.004186989151050134,'y':0.7963835743974419,'z':0.604777373544847},'minZoom':0.5}},{'longitude':21.74375,'latitude':60.32555555555556,'magnitude':2.66,'b_v':0.16,'letter':'delta','constell':'Cas','desigNo':'37','bsNo':'403','main':true,'serialNo':108,'letterLabel':{'vtr':{'x':-0.8656941604572497,'y':0.39263212331907926,'z':-0.3105054529121332},'orthogVtr':{'x':0.19777383793338674,'y':-0.30155512536415263,'z':-0.9327111103636049},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.2114830656245003,'y':-0.09343712468129017,'z':-0.9729051426965306},'orthogVtr':{'x':0.8624475539850219,'y':-0.486173818327079,'z':-0.14078080479426622},'minZoom':0.5}},{'longitude':208.87958333333333,'latitude':18.310555555555556,'magnitude':2.68,'b_v':0.58,'letter':'eta','constell':'Boo','desigNo':'8','bsNo':'5235','serialNo':109,'main':true,'letterLabel':{'vtr':{'x':0.549321848372093,'y':0.5901764057218907,'z':0.591554999159214},'orthogVtr':{'x':0.08475831562249794,'y':-0.7436334301578007,'z':0.6631932972253116},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3535190049073685,'y':0.9354273425388548,'z':0},'orthogVtr':{'x':0.4289088228696161,'y':-0.1620942785842924,'z':0.8886859211863538},'minZoom':0.5}},{'longitude':224.92125,'latitude':-43.20333333333333,'magnitude':2.68,'b_v':-0.18,'letter':'beta','constell':'Lup','desigNo':'','bsNo':'5571','serialNo':110,'main':true,'letterLabel':{'vtr':{'x':0.8257278928536244,'y':-0.5573669441512125,'z':0.08669219417601949},'orthogVtr':{'x':-0.2275402268293813,'y':-0.46976513948818843,'z':-0.8529631638564918},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3890523907499315,'y':-0.722770470259076,'z':-0.5711751785339036},'orthogVtr':{'x':-0.7630460963230304,'y':0.09455180607630964,'z':-0.6393908123001867},'minZoom':0.5}},{'longitude':161.88166666666666,'latitude':-49.51305555555555,'magnitude':2.69,'b_v':0.9,'letter':'mu','constell':'Vel','desigNo':'','bsNo':'4216','serialNo':111,'main':true,'letterLabel':{'vtr':{'x':0.32346406725502275,'y':-0.4790767853063652,'z':0.8160002640779946},'orthogVtr':{'x':0.7173434775313975,'y':-0.43822728386646786,'z':-0.5416411938896262},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7765479425524097,'y':0.6300581662970643,'z':0},'orthogVtr':{'x':-0.12721619582277918,'y':-0.1567942142645694,'z':0.9794037032263747},'minZoom':0.5}},{'longitude':74.53416666666666,'latitude':33.19222222222222,'magnitude':2.69,'b_v':1.49,'letter':'iota','constell':'Aur','desigNo':'3','bsNo':'1577','serialNo':112,'main':true,'letterLabel':{'vtr':{'x':0.9260217446818398,'y':-0.3774701688562969,'z':0},'orthogVtr':{'x':0.30444343464124735,'y':0.7468702529728835,'z':0.5911844215877662},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9260217446818398,'y':-0.3774701688562969,'z':0},'orthogVtr':{'x':0.30444343464124735,'y':0.7468702529728835,'z':0.5911844215877662},'minZoom':0.5}},{'longitude':189.56166666666667,'latitude':-69.23166666666667,'magnitude':2.69,'b_v':-0.18,'letter':'alpha','constell':'Mus','desigNo':'','bsNo':'4798','serialNo':113,'main':true,'letterLabel':{'vtr':{'x':0.7168757793208876,'y':-0.3075022284067615,'z':-0.6257247769970004},'orthogVtr':{'x':-0.6031783843262899,'y':0.1765690204783742,'z':-0.7778169564163755},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.2631174914418726,'y':-0.15834638165752496,'z':-0.9516804133286056},'orthogVtr':{'x':-0.8991686337905364,'y':0.3172706461111492,'z':-0.3013886280593118},'minZoom':0.5}},{'longitude':262.98875,'latitude':-37.308055555555555,'magnitude':2.7,'b_v':-0.18,'letter':'upsilon','constell':'Sco','desigNo':'34','bsNo':'6508','serialNo':114,'main':true,'letterLabel':{'vtr':{'x':-0.972662017251303,'y':-0.11034067867635858,'z':-0.20433681710809343},'orthogVtr':{'x':-0.2109559957486518,'y':0.7876975562987245,'z':0.5788178708874775},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9349649064501423,'y':-0.2163749165350753,'z':-0.2811094434577319},'orthogVtr':{'x':-0.34119562666065334,'y':0.7653916651389542,'z':0.5456749428766755},'minZoom':0.5}},{'longitude':109.44041666666666,'latitude':-37.12972222222222,'magnitude':2.71,'b_v':1.62,'letter':'pi','constell':'Pup','desigNo':'','bsNo':'2773','serialNo':115,'main':true,'letterLabel':{'vtr':{'x':-0.9154495598892836,'y':0.40243273139559266,'z':0},'orthogVtr':{'x':-0.3025557648590337,'y':-0.6882505327577371,'z':0.6593718323596},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9154495598892836,'y':0.40243273139559266,'z':0},'orthogVtr':{'x':-0.3025557648590337,'y':-0.6882505327577371,'z':0.6593718323596},'minZoom':0.5}},{'longitude':275.5283333333333,'latitude':-29.819166666666668,'magnitude':2.72,'b_v':1.38,'letter':'delta','constell':'Sgr','desigNo':'19','bsNo':'6859','serialNo':116,'main':true,'letterLabel':{'vtr':{'x':0.9959130607356146,'y':0.07144426628130528,'z':-0.05525298427909674},'orthogVtr':{'x':0.03422134105610644,'y':-0.8646525388591184,'z':-0.5012034385963473},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9858222191716766,'y':0.16778888010241674,'z':0.0012016244870299648},'orthogVtr':{'x':0.14549390679643323,'y':-0.8512198234615841,'z':-0.5042383714386884},'minZoom':0.5}},{'longitude':296.7729166666667,'latitude':10.656944444444445,'magnitude':2.72,'b_v':1.51,'letter':'gamma','constell':'Aql','desigNo':'50','bsNo':'7525','serialNo':117,'main':true,'letterLabel':{'vtr':{'x':-0.4332156969230664,'y':0.9008329246503679,'z':0.02870891508445144},'orthogVtr':{'x':0.7850816192985642,'y':0.3928124421154732,'z':-0.4789000275201728},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5541437287857026,'y':0.8257010901161864,'z':0.10555774546862416},'orthogVtr':{'x':0.7049494427747791,'y':0.5329345950450194,'z':-0.46800320568958675},'minZoom':0.5}},{'longitude':246.05791666666667,'latitude':61.475,'magnitude':2.73,'b_v':0.91,'letter':'eta','constell':'Dra','desigNo':'14','bsNo':'6132','main':true,'serialNo':118,'letterLabel':{'vtr':{'x':0.9794137707863328,'y':0.1476453118477724,'z':0.13765728271134367},'orthogVtr':{'x':-0.056506724195837105,'y':-0.4541446763926105,'z':0.8891341872995925},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9008310398143355,'y':0.33555532991991277,'z':-0.27551054112204393},'orthogVtr':{'x':0.38851998917979835,'y':-0.3397780831200172,'z':0.8565063176877425},'minZoom':0.5}},{'longitude':243.81625,'latitude':-3.7380555555555555,'magnitude':2.73,'b_v':1.58,'letter':'delta','constell':'Oph','desigNo':'1','bsNo':'6056','serialNo':119,'main':true,'letterLabel':{'vtr':{'x':-0.6536635959628765,'y':0.7070057368528404,'z':-0.2699384955319519},'orthogVtr':{'x':0.6155068700887325,'y':0.7041963408279014,'z':0.35391920891379497},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6536635959628765,'y':0.7070057368528404,'z':-0.2699384955319519},'orthogVtr':{'x':0.6155068700887325,'y':0.7041963408279014,'z':0.35391920891379497},'minZoom':0.5}},{'longitude':160.89625,'latitude':-64.4863888888889,'magnitude':2.74,'b_v':-0.22,'letter':'theta','constell':'Car','desigNo':'','bsNo':'4199','serialNo':120,'main':true,'letterLabel':{'vtr':{'x':0.5534749463353199,'y':-0.36643352938457646,'z':0.7479250980692369},'orthogVtr':{'x':0.7266449804242919,'y':-0.22638667432796203,'z':-0.6486417702483444},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5534749463353199,'y':-0.36643352938457646,'z':0.7479250980692369},'orthogVtr':{'x':0.7266449804242919,'y':-0.22638667432796203,'z':-0.6486417702483444},'minZoom':0.5}},{'longitude':190.63708333333332,'latitude':-1.5455555555555553,'magnitude':2.74,'b_v':0.37,'letter':'gamma^1','constell':'Vir','desigNo':'29','bsNo':'4825','serialNo':121,'main':true,'letterLabel':{'vtr':{'x':0.18648111290931943,'y':-0.14123741597965106,'z':0.9722534581350136},'orthogVtr':{'x':0.00016221280074675548,'y':-0.9896082641054964,'z':-0.14378962862847047},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.18648111290931943,'y':-0.14123741597965106,'z':0.9722534581350136},'orthogVtr':{'x':0.00016221280074675548,'y':-0.9896082641054964,'z':-0.14378962862847047},'minZoom':0.5}},{'longitude':200.39666666666668,'latitude':-36.80416666666667,'magnitude':2.75,'b_v':0.07,'letter':'iota','constell':'Cen','desigNo':'','bsNo':'5028','serialNo':122,'main':true,'letterLabel':{'vtr':{'x':-0.6585823690303975,'y':0.642709745632611,'z':-0.39139934347309996},'orthogVtr':{'x':-0.05512968420478037,'y':0.4775197865183034,'z':0.8768897145040505},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6238645406922863,'y':0.7815324912419205,'z':0},'orthogVtr':{'x':0.21808955441518096,'y':0.17409172519341348,'z':0.960275490405836},'minZoom':0.5}},{'longitude':84.0725,'latitude':-5.899722222222222,'magnitude':2.75,'b_v':-0.21,'letter':'iota','constell':'Ori','desigNo':'44','bsNo':'1899','serialNo':123,'main':true,'letterLabel':{'vtr':{'x':-0.09239635368942739,'y':-0.9913323959474472,'z':0.09339697302371305},'orthogVtr':{'x':0.9904094645051605,'y':-0.08182155295376267,'z':0.11132980773735297},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.2326834501703418,'y':-0.9645678089268748,'z':0.12436781737585534},'orthogVtr':{'x':0.9671124058625897,'y':0.2429889457664268,'z':0.0751662601304206},'minZoom':0.5}},{'longitude':222.9625,'latitude':-16.113611111111112,'magnitude':2.75,'b_v':0.15,'letter':'alpha^2','constell':'Lib','desigNo':'9','bsNo':'5531','serialNo':124,'main':true,'letterLabel':{'vtr':{'x':0.629357616034993,'y':-0.6715028171063999,'z':0.39114314228542857},'orthogVtr':{'x':-0.33110401784026905,'y':-0.6870617967367517,'z':-0.6467736983171912},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.36719309196613714,'y':0.9301447377759807,'z':0},'orthogVtr':{'x':0.6090074816482691,'y':0.2404177878290558,'z':0.7558499683084047},'minZoom':0.5}},{'longitude':266.08458333333334,'latitude':4.561111111111111,'magnitude':2.76,'b_v':1.17,'letter':'beta','constell':'Oph','desigNo':'60','bsNo':'6603','serialNo':125,'main':true,'letterLabel':{'vtr':{'x':-0.36655740839574624,'y':0.9251067417772472,'z':-0.09906150952049933},'orthogVtr':{'x':0.9279021949853663,'y':0.371286562755561,'z':0.03382018418785403},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5058528604508725,'y':0.8564358578285546,'z':-0.10310434035062697},'orthogVtr':{'x':0.8599300556918199,'y':0.5100919689526793,'z':0.01806882751709213},'minZoom':0.5}},{'longitude':77.17791666666666,'latitude':-5.0649999999999995,'magnitude':2.78,'b_v':0.16,'letter':'beta','constell':'Eri','desigNo':'67','bsNo':'1666','serialNo':126,'main':true,'letterLabel':{'vtr':{'x':0.2871388546684993,'y':0.9576432404475723,'z':-0.021695671566820333},'orthogVtr':{'x':-0.9320325888816279,'y':0.2740894664814304,'z':-0.23704475869872096},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6860571671289237,'y':0.7218935938413895,'z':0.09052735830564687},'orthogVtr':{'x':-0.6931515216954829,'y':0.6863492192621516,'z':-0.2201493065841254},'minZoom':0.5}},{'longitude':247.74333333333334,'latitude':21.4525,'magnitude':2.78,'b_v':0.95,'letter':'beta','constell':'Her','desigNo':'27','bsNo':'6148','serialNo':127,'main':true,'letterLabel':{'vtr':{'x':0.7016093499834298,'y':0.7123966067131058,'z':-0.01534257994867489},'orthogVtr':{'x':0.6192547536800622,'y':-0.598943086354284,'z':0.5077309615860056},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7016093499834298,'y':0.7123966067131058,'z':-0.01534257994867489},'orthogVtr':{'x':0.6192547536800622,'y':-0.598943086354284,'z':0.5077309615860056},'minZoom':0.5}},{'longitude':258.8616666666667,'latitude':14.37138888888889,'magnitude':2.78,'b_v':1.16,'letter':'alpha^1','constell':'Her','desigNo':'64','bsNo':'6406','serialNo':128,'main':true,'letterLabel':{'vtr':{'x':0.9821370749070109,'y':0.06667152474572158,'z':0.17595929609196825},'orthogVtr':{'x':0.019694452016880894,'y':-0.9664101597410952,'z':0.2562489643080439},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9077981312851233,'y':0.3260013674406777,'z':-0.26386674906483853},'orthogVtr':{'x':0.3753447191348016,'y':0.9122043616917962,'z':-0.1643153806802019},'minZoom':0.5}},{'longitude':262.70708333333334,'latitude':52.288888888888884,'magnitude':2.79,'b_v':0.95,'letter':'beta','constell':'Dra','desigNo':'23','bsNo':'6536','main':true,'serialNo':129,'letterLabel':{'vtr':{'x':-0.4317234521994162,'y':-0.5752323904213437,'z':0.6947823816355487},'orthogVtr':{'x':-0.8986576988135291,'y':0.20799204509200298,'z':-0.3862041552619792},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.597348483026398,'y':-0.5241559859827367,'z':0.6069887084489516},'orthogVtr':{'x':-0.7982139992770549,'y':0.31529905830793736,'z':-0.5132649561272014},'minZoom':0.5}},{'longitude':184.02125,'latitude':-58.846111111111114,'magnitude':2.79,'b_v':-0.19,'letter':'delta','constell':'Cru','desigNo':'','bsNo':'4656','serialNo':130,'main':true,'letterLabel':{'vtr':{'x':-0.6259221952506832,'y':0.34786165750127107,'z':-0.6980069288574677},'orthogVtr':{'x':-0.5847208776530348,'y':0.3829247206063499,'z':0.7151714155258261},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5651766278021367,'y':0.30838305543460276,'z':-0.7651635580103274},'orthogVtr':{'x':-0.6436244857500177,'y':0.4153780994850372,'z':0.6428130022107704},'minZoom':0.5}},{'longitude':234.07833333333335,'latitude':-41.22416666666667,'magnitude':2.8,'b_v':-0.22,'letter':'gamma','constell':'Lup','desigNo':'','bsNo':'5776','serialNo':131,'main':true,'letterLabel':{'vtr':{'x':-0.3572057056580623,'y':0.7516489668057773,'z':0.5544618242450363},'orthogVtr':{'x':0.8232200785694506,'y':-0.02709095098304895,'z':0.5670756409994544},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.767475735898203,'y':0.07460630215510483,'z':0.6367219915208312},'orthogVtr':{'x':0.4650464586706134,'y':-0.7484276776042558,'z':-0.4728507192273501},'minZoom':0.5}},{'longitude':250.48666666666668,'latitude':31.571666666666665,'magnitude':2.81,'b_v':0.65,'letter':'zeta','constell':'Her','desigNo':'40','bsNo':'6212','serialNo':132,'main':true,'letterLabel':{'vtr':{'x':-0.9524868259996144,'y':-0.05958618893308637,'z':-0.2986943795681648},'orthogVtr':{'x':0.1085350651584231,'y':0.8498997227180606,'z':-0.5156458095968791},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.878596605478763,'y':0.477564660377205,'z':0},'orthogVtr':{'x':0.3835088250783258,'y':-0.7055579690901453,'z':0.5959101722075498},'minZoom':0.5}},{'longitude':82.24916666666667,'latitude':-20.746666666666666,'magnitude':2.81,'b_v':0.81,'letter':'beta','constell':'Lep','desigNo':'9','bsNo':'1829','serialNo':133,'main':true,'letterLabel':{'vtr':{'x':0.7326293717622132,'y':-0.5965130533389569,'z':0.3277596388018812},'orthogVtr':{'x':0.6688407296654139,'y':0.7202003781778203,'z':-0.18429187071914338},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7326293717622132,'y':-0.5965130533389569,'z':0.3277596388018812},'orthogVtr':{'x':0.6688407296654139,'y':0.7202003781778203,'z':-0.18429187071914338},'minZoom':0.5}},{'longitude':277.2625,'latitude':-25.410555555555554,'magnitude':2.82,'b_v':1.03,'letter':'lambda','constell':'Sgr','desigNo':'22','bsNo':'6913','serialNo':134,'main':true,'letterLabel':{'vtr':{'x':-0.8962501667564826,'y':0.34460851342083637,'z':0.27925008695944675},'orthogVtr':{'x':0.4285992445909479,'y':0.8349352280027036,'z':0.3452330409681881},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8962501667564826,'y':0.34460851342083637,'z':0.27925008695944675},'orthogVtr':{'x':0.4285992445909479,'y':0.8349352280027036,'z':0.3452330409681881},'minZoom':0.5}},{'longitude':6.661666666666667,'latitude':-77.15583333333333,'magnitude':2.82,'b_v':0.62,'letter':'beta','constell':'Hyi','desigNo':'','bsNo':'98','serialNo':135,'main':true,'letterLabel':{'vtr':{'x':-0.5292778700866889,'y':-0.09757075145192651,'z':-0.8428196038878099},'orthogVtr':{'x':-0.8192146361644299,'y':-0.19974307479969702,'z':0.5375779794258168},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.975302640453505,'y':-0.22087272245440648,'z':0},'orthogVtr':{'x':0.005695910282131196,'y':-0.02515130105799081,'z':0.9996674290288488},'minZoom':0.5}},{'longitude':249.24375,'latitude':-28.250833333333333,'magnitude':2.82,'b_v':-0.21,'letter':'tau','constell':'Sco','desigNo':'23','bsNo':'6165','serialNo':136,'main':true,'letterLabel':{'vtr':{'x':0.7463956620367082,'y':-0.6586032562040196,'z':-0.09557858866004627},'orthogVtr':{'x':-0.5877394993443125,'y':-0.5849770209838039,'z':-0.5588954873958198},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7463956620367082,'y':-0.6586032562040196,'z':-0.09557858866004627},'orthogVtr':{'x':-0.5877394993443125,'y':-0.5849770209838039,'z':-0.5588954873958198},'minZoom':0.5}},{'longitude':122.0725,'latitude':-24.355555555555558,'magnitude':2.83,'b_v':0.46,'letter':'rho','constell':'Pup','desigNo':'15','bsNo':'3185','serialNo':137,'main':true,'letterLabel':{'vtr':{'x':-0.6412181406149445,'y':-0.4333271652606411,'z':0.633298400434969},'orthogVtr':{'x':0.5956837127951603,'y':-0.8013460869043455,'z':0.054821194018975034},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8704148150767133,'y':0.1344415242859408,'z':0.4736069322155704},'orthogVtr':{'x':0.0915305371888795,'y':-0.901029111459448,'z':0.4239913926773898},'minZoom':0.5}},{'longitude':3.535,'latitude':15.280833333333334,'magnitude':2.83,'b_v':-0.19,'letter':'gamma','constell':'Peg','desigNo':'88','bsNo':'39','serialNo':138,'main':true,'letterLabel':{'vtr':{'x':0.26401778852395114,'y':-0.9645178107961108,'z':0},'orthogVtr':{'x':0.05736794296301493,'y':0.015703346546562746,'z':0.9982295948465119},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.26401778852395114,'y':-0.9645178107961108,'z':0},'orthogVtr':{'x':0.05736794296301493,'y':0.015703346546562746,'z':0.9982295948465119},'minZoom':0.5}},{'longitude':239.175,'latitude':-63.48277777777778,'magnitude':2.83,'b_v':0.32,'letter':'beta','constell':'TrA','desigNo':'','bsNo':'5897','serialNo':139,'main':true,'letterLabel':{'vtr':{'x':-0.9625973329967419,'y':0.2666585152780899,'z':0.04795425671662842},'orthogVtr':{'x':0.14514562982785023,'y':0.35808635334948374,'z':0.9223377416579817},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9169203387063422,'y':0.0657813505441085,'z':-0.3936113646571195},'orthogVtr':{'x':-0.3269831369003767,'y':0.4415941735870615,'z':0.8355097929029617},'minZoom':0.5}},{'longitude':263.2991666666667,'latitude':-49.88805555555555,'magnitude':2.84,'b_v':-0.14,'letter':'alpha','constell':'Ara','desigNo':'','bsNo':'6510','serialNo':140,'main':true,'letterLabel':{'vtr':{'x':-0.7509106133882644,'y':0.4656390867527179,'z':0.4683091837546595},'orthogVtr':{'x':0.6561108714620902,'y':0.44528746508919637,'z':0.6092927028807208},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9952033256719873,'y':0.097828117488871,'z':0},'orthogVtr':{'x':0.06259844663647139,'y':0.6368126452152557,'z':0.7684732196847525},'minZoom':0.5}},{'longitude':261.68958333333336,'latitude':-55.544444444444444,'magnitude':2.84,'b_v':1.48,'letter':'beta','constell':'Ara','desigNo':'','bsNo':'6461','serialNo':141,'main':true,'letterLabel':{'vtr':{'x':-0.07898996053558018,'y':0.5653022087528693,'z':0.8210931731013935},'orthogVtr':{'x':0.9935157995821587,'y':-0.022923215975235438,'z':0.1113592481564801},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.09014611699500513,'y':0.5655240554284653,'z':0.8197903514450905},'orthogVtr':{'x':0.9925657335791476,'y':-0.01657117326148378,'z':0.120576368917074},'minZoom':0.5}},{'longitude':58.80916666666667,'latitude':31.934166666666666,'magnitude':2.84,'b_v':0.27,'letter':'zeta','constell':'Per','desigNo':'44','bsNo':'1203','serialNo':142,'main':true,'letterLabel':{'vtr':{'x':-0.6456874824509024,'y':-0.37581599960279016,'z':-0.6647179924214264},'orthogVtr':{'x':0.6244340868877412,'y':-0.7609073860285066,'z':-0.1763576508687349},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7815998319358312,'y':-0.17307942342438348,'z':-0.599287256584823},'orthogVtr':{'x':0.44264201854206264,'y':-0.8308196127061891,'z':-0.33735265607928233},'minZoom':0.5}},{'longitude':327.00125,'latitude':-16.047222222222224,'magnitude':2.85,'b_v':0.18,'letter':'delta','constell':'Cap','desigNo':'49','bsNo':'8322','serialNo':143,'main':true,'letterLabel':{'vtr':{'x':0.49832120737345337,'y':-0.1602989025650589,'z':-0.8520447383314456},'orthogVtr':{'x':-0.3194306258884279,'y':-0.9475710967872024,'z':-0.008549372960962837},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5896493514358546,'y':0.2977289027072996,'z':-0.7507803559257418},'orthogVtr':{'x':-0.051706796699129975,'y':-0.9137528233186321,'z':-0.4029667294608126},'minZoom':0.5}},{'longitude':57.132083333333334,'latitude':24.158055555555553,'magnitude':2.85,'b_v':-0.09,'letter':'eta','constell':'Tau','desigNo':'25','bsNo':'1165','serialNo':144,'main':true,'letterLabel':{'vtr':{'x':-0.6370648834150435,'y':0.7708101804720645,'z':-2.2036173090745034e-15},'orthogVtr':{'x':-0.5907206520335547,'y':-0.488223161619562,'z':-0.6424073907725927},'minZoom':2.7},'shortNameLabel':{'vtr':{'x':0.13939309775118403,'y':-0.908097557965385,'z':-0.39487768931231476},'orthogVtr':{'x':0.857538406556173,'y':-0.08870746912454451,'z':0.5067137912102034},'minZoom':0.5}},{'longitude':195.76208333333332,'latitude':10.865555555555556,'magnitude':2.85,'b_v':0.93,'letter':'epsilon','constell':'Vir','desigNo':'47','bsNo':'4932','serialNo':145,'main':true,'letterLabel':{'vtr':{'x':0.19559353906031787,'y':0.9806850500939942,'z':0},'orthogVtr':{'x':0.26162073868474217,'y':-0.05217916411188158,'z':0.9637592665819796},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.19559353906031787,'y':0.9806850500939942,'z':0},'orthogVtr':{'x':0.26162073868474217,'y':-0.05217916411188158,'z':0.9637592665819796},'minZoom':0.5}},{'longitude':296.3804166666667,'latitude':45.174166666666665,'magnitude':2.86,'b_v':0,'letter':'delta','constell':'Cyg','desigNo':'18','bsNo':'7528','main':true,'serialNo':146,'letterLabel':{'vtr':{'x':0.8885080660688013,'y':-0.45367168188511847,'z':0.06881439955566375},'orthogVtr':{'x':-0.33531987638112426,'y':-0.5395759835283126,'z':0.7722812560869269},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9147625443781863,'y':-0.40399193977447984,'z':0},'orthogVtr':{'x':-0.25513817897037816,'y':-0.5777116491315293,'z':0.7753410604949336},'minZoom':0.5}},{'longitude':29.83,'latitude':-61.48527777777778,'magnitude':2.86,'b_v':0.29,'letter':'alpha','constell':'Hyi','desigNo':'','bsNo':'591','serialNo':147,'main':true,'letterLabel':{'vtr':{'x':0.2275782897226278,'y':-0.15264345074015662,'z':0.9617214248383267},'orthogVtr':{'x':0.8813067154475092,'y':0.452322885602703,'z':-0.13675701249723016},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9045685747384146,'y':-0.42632815247847955,'z':0},'orthogVtr':{'x':0.10123783009165363,'y':-0.21480298484449617,'z':0.9713962010736035},'minZoom':0.5}},{'longitude':230.14208333333335,'latitude':-68.7425,'magnitude':2.87,'b_v':0.01,'letter':'gamma','constell':'TrA','desigNo':'','bsNo':'5671','serialNo':148,'main':true,'letterLabel':{'vtr':{'x':0.003492856485760268,'y':-0.28694370062043895,'z':-0.9579410799354091},'orthogVtr':{'x':-0.9726236661484544,'y':0.2216147365420496,'z':-0.06992934001789201},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.970296749329168,'y':0.24191779232055202,'z':0},'orthogVtr':{'x':0.06732914851488798,'y':0.2700473301795528,'z':0.9604900963691171},'minZoom':0.5}},{'longitude':334.92125,'latitude':-60.17166666666667,'magnitude':2.87,'b_v':1.39,'letter':'alpha','constell':'Tuc','desigNo':'','bsNo':'8502','serialNo':149,'main':true,'letterLabel':{'vtr':{'x':-0.4527735049126842,'y':-0.4255466423234413,'z':-0.7835216706998783},'orthogVtr':{'x':-0.7694388222546887,'y':-0.25752634509536826,'z':0.5845032766282315},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8874676190353084,'y':-0.46087007405970815,'z':0},'orthogVtr':{'x':-0.09716569923280424,'y':0.18710568683803486,'z':0.9775225260041158},'minZoom':0.5}},{'longitude':96.00458333333333,'latitude':22.503055555555555,'magnitude':2.87,'b_v':1.62,'letter':'mu','constell':'Gem','desigNo':'13','bsNo':'2286','serialNo':150,'main':true,'letterLabel':{'vtr':{'x':-0.8175170664702316,'y':0.49602596320835624,'z':0.29261594258196094},'orthogVtr':{'x':-0.5677375824601412,'y':-0.7794061346634131,'z':-0.2649530424647957},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9947104369520906,'y':-0.00486136487277003,'z':0.1026036731806176},'orthogVtr':{'x':-0.034803205690852754,'y':-0.9238463324922138,'z':-0.38117803034058284},'minZoom':0.5}},{'longitude':287.7008333333333,'latitude':-20.994444444444447,'magnitude':2.88,'b_v':0.38,'letter':'pi','constell':'Sgr','desigNo':'41','bsNo':'7264','serialNo':151,'main':true,'letterLabel':{'vtr':{'x':0.9581610102010178,'y':0.14152181056906898,'z':-0.24879520828146487},'orthogVtr':{'x':0.036733926185446755,'y':-0.9228265620468167,'z':-0.383460239200696},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8987954170053992,'y':0.42256676703000784,'z':-0.11663672565661948},'orthogVtr':{'x':0.3340489502640644,'y':-0.8325110292889228,'z':-0.4419690995304705},'minZoom':0.5}},{'longitude':44.73125,'latitude':-40.23527777777778,'magnitude':2.88,'b_v':0.13,'letter':'theta^1','constell':'Eri','desigNo':'','bsNo':'897','serialNo':152,'main':true,'letterLabel':{'vtr':{'x':-0.43285119930758353,'y':0.3332661359971586,'z':-0.8375998578411471},'orthogVtr':{'x':-0.720081739083991,'y':-0.6868121300171979,'z':0.09885032675219119},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7658503105040733,'y':-0.643018897001336,'z':0},'orthogVtr':{'x':0.34547239195781315,'y':-0.41146557260653316,'z':0.8434126563874441},'minZoom':0.5}},{'longitude':112.02458333333334,'latitude':8.252777777777778,'magnitude':2.89,'b_v':-0.1,'letter':'beta','constell':'CMi','desigNo':'3','bsNo':'2845','serialNo':153,'main':true,'letterLabel':{'vtr':{'x':0.3093421877703524,'y':-0.9124355347611679,'z':-0.2678970059006887},'orthogVtr':{'x':0.875543614059147,'y':0.3832198985348917,'z':-0.29422081715465764},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6889744025524909,'y':0.7049482266391818,'z':-0.16841101622432803},'orthogVtr':{'x':-0.6225620305493572,'y':0.6945819559175602,'z':0.36051688536322013},'minZoom':0.5}},{'longitude':194.21083333333334,'latitude':38.22416666666667,'magnitude':2.89,'b_v':-0.12,'letter':'alpha^2','constell':'CVn','desigNo':'12','bsNo':'4915','serialNo':154,'main':true,'letterLabel':{'vtr':{'x':0.04146529040224206,'y':0.3434798116612307,'z':-0.9382442372181262},'orthogVtr':{'x':0.6467713689089689,'y':0.7065286068916891,'z':0.2872353112054783},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6195840312650281,'y':-0.7823637520220383,'z':0.06342387344978982},'orthogVtr':{'x':-0.19012680544810118,'y':0.07118997750486825,'z':-0.9791750532733952},'minZoom':0.5}},{'longitude':239.97833333333332,'latitude':-26.163055555555555,'magnitude':2.89,'b_v':-0.18,'letter':'pi','constell':'Sco','desigNo':'6','bsNo':'5944','serialNo':155,'main':true,'letterLabel':{'vtr':{'x':0.7842332993112,'y':0.2222728756137654,'z':0.5792865448272188},'orthogVtr':{'x':0.42815704294985335,'y':-0.8695849394954365,'z':-0.24597475393860152},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7842332993112,'y':0.2222728756137654,'z':0.5792865448272188},'orthogVtr':{'x':0.42815704294985335,'y':-0.8695849394954365,'z':-0.24597475393860152},'minZoom':0.5}},{'longitude':323.1195833333333,'latitude':-5.493333333333333,'magnitude':2.9,'b_v':0.83,'letter':'beta','constell':'Aqr','desigNo':'22','bsNo':'8232','serialNo':156,'main':true,'letterLabel':{'vtr':{'x':-0.27153746239909726,'y':0.825825033947767,'z':0.4942473265674064},'orthogVtr':{'x':0.5406543714133473,'y':0.5557416606425467,'z':-0.6315410179061238},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.11937138481954064,'y':-0.9928496726525446,'z':0},'orthogVtr':{'x':-0.593119056598899,'y':0.07131134259219077,'z':0.8019504206102341},'minZoom':0.5}},{'longitude':59.75833333333333,'latitude':40.059444444444445,'magnitude':2.9,'b_v':-0.2,'letter':'epsilon','constell':'Per','desigNo':'45','bsNo':'1220','serialNo':157,'main':true,'letterLabel':{'vtr':{'x':-0.8663719782446879,'y':0.0058764129549648825,'z':-0.4993646594255234},'orthogVtr':{'x':0.3174965456768465,'y':-0.7653545786883107,'z':-0.5598466864813159},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.33196220226452633,'y':-0.5718863940210736,'z':-0.7501646809876212},'orthogVtr':{'x':0.8609329575942773,'y':-0.50867289654743,'z':0.00680638274109871},'minZoom':0.5}},{'longitude':245.56375,'latitude':-25.633333333333333,'magnitude':2.9,'b_v':0.3,'letter':'sigma','constell':'Sco','desigNo':'20','bsNo':'6084','serialNo':158,'main':true,'letterLabel':{'vtr':{'x':-0.893336751539196,'y':0.4064489412253217,'z':-0.19169952145535446},'orthogVtr':{'x':0.2506899310465979,'y':0.8047655257461893,'z':0.5380585535444182},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.893336751539196,'y':0.4064489412253217,'z':-0.19169952145535446},'orthogVtr':{'x':0.2506899310465979,'y':0.8047655257461893,'z':0.5380585535444182},'minZoom':0.5}},{'longitude':46.51875,'latitude':53.57361111111111,'magnitude':2.91,'b_v':0.72,'letter':'gamma','constell':'Per','desigNo':'23','bsNo':'915','serialNo':159,'main':true,'letterLabel':{'vtr':{'x':-0.8956497258911741,'y':0.26261389035040317,'z':-0.35895057195398256},'orthogVtr':{'x':0.17567085257771725,'y':-0.5325598160365149,'z':-0.8279612272913336},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.02476389395179157,'y':-0.4621100006416107,'z':-0.8864767886771515},'orthogVtr':{'x':0.9123789944374332,'y':-0.3728811611878922,'z':0.16889111918779953},'minZoom':0.6}},{'longitude':146.88458333333332,'latitude':-65.15361111111112,'magnitude':2.92,'b_v':0.27,'letter':'upsilon','constell':'Car','desigNo':'','bsNo':'3890','serialNo':160,'main':true,'letterLabel':{'vtr':{'x':0.5391134902714206,'y':-0.3969974028148143,'z':0.7427985640573488},'orthogVtr':{'x':0.7651778951483239,'y':-0.13765938837271394,'z':-0.6289297906517317},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7132896617592628,'y':-0.4188059741705378,'z':0.5619781262882244},'orthogVtr':{'x':0.606101002344996,'y':-0.03403822921252664,'z':-0.7946590299672349},'minZoom':0.5}},{'longitude':340.95625,'latitude':30.313055555555557,'magnitude':2.93,'b_v':0.85,'letter':'eta','constell':'Peg','desigNo':'44','bsNo':'8650','serialNo':161,'main':true,'letterLabel':{'vtr':{'x':0.5260238689069874,'y':-0.8504698050725402,'z':0},'orthogVtr':{'x':-0.23956020728763355,'y':-0.1481703245923617,'z':0.9595084481100207},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5260238689069874,'y':-0.8504698050725402,'z':0},'orthogVtr':{'x':-0.23956020728763355,'y':-0.1481703245923617,'z':0.9595084481100207},'minZoom':0.5}},{'longitude':102.5925,'latitude':-50.63611111111111,'magnitude':2.94,'b_v':1.21,'letter':'tau','constell':'Pup','desigNo':'','bsNo':'2553','serialNo':162,'main':true,'letterLabel':{'vtr':{'x':-0.5556002718545825,'y':0.5779358461567378,'z':-0.5977445069945934},'orthogVtr':{'x':-0.8198709627572822,'y':-0.26125620530756893,'z':0.5094671722650403},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9313769277336682,'y':0.3140320602920549,'z':-0.18417622972066947},'orthogVtr':{'x':-0.3367745182504649,'y':-0.5510431128263399,'z':0.7635014156266019},'minZoom':0.5}},{'longitude':187.69291666666666,'latitude':-16.61277777777778,'magnitude':2.94,'b_v':-0.01,'letter':'delta','constell':'Crv','desigNo':'7','bsNo':'4757','serialNo':163,'main':true,'letterLabel':{'vtr':{'x':0.0366582833134307,'y':-0.5079034218551519,'z':-0.8606336528002725},'orthogVtr':{'x':-0.31120879431914295,'y':0.8125848354228876,'z':-0.4928031773225334},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.04249639177333346,'y':0.28807456944023047,'z':0.9566645698091225},'orthogVtr':{'x':0.31046545714992146,'y':-0.913932734468593,'z':0.261415678151581},'minZoom':0.5}},{'longitude':331.67041666666665,'latitude':-0.23416666666666666,'magnitude':2.95,'b_v':0.97,'letter':'alpha','constell':'Aqr','desigNo':'34','bsNo':'8414','serialNo':164,'main':true,'letterLabel':{'vtr':{'x':-0.4573699784205302,'y':0.25936717972807033,'z':0.850612349381027},'orthogVtr':{'x':0.12655621472040948,'y':0.9657701397189963,'z':-0.22643224536887838},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4573699784205302,'y':0.25936717972807033,'z':0.850612349381027},'orthogVtr':{'x':0.12655621472040948,'y':0.9657701397189963,'z':-0.22643224536887838},'minZoom':0.5}},{'longitude':84.67291666666667,'latitude':21.151666666666664,'magnitude':2.97,'b_v':-0.15,'letter':'zeta','constell':'Tau','desigNo':'123','bsNo':'1910','serialNo':165,'main':true,'letterLabel':{'vtr':{'x':-0.024370935642562652,'y':0.9325893324674784,'z':0.36011552932880986},'orthogVtr':{'x':-0.9959462099973309,'y':0.008550245077558302,'z':-0.08954350954182204},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9723962978746425,'y':-0.2333354663991084,'z':0},'orthogVtr':{'x':0.21667541529170006,'y':0.9029676239175655,'z':0.371081169779383},'minZoom':0.5}},{'longitude':146.71041666666667,'latitude':23.692777777777778,'magnitude':2.97,'b_v':0.81,'letter':'epsilon','constell':'Leo','desigNo':'17','bsNo':'3873','serialNo':166,'main':true,'letterLabel':{'vtr':{'x':-0.4604281787200303,'y':-0.887656612572752,'z':-0.008463474252521974},'orthogVtr':{'x':0.4495444925993306,'y':-0.22493665425033682,'z':-0.8644728166624298},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.036919078548366846,'y':-0.7523513974424039,'z':-0.6577266578188856},'orthogVtr':{'x':0.6424339189558512,'y':0.5220135391308642,'z':-0.5610530498438596},'minZoom':0.5}},{'longitude':59.711666666666666,'latitude':-13.459722222222222,'magnitude':2.97,'b_v':1.59,'letter':'gamma','constell':'Eri','desigNo':'34','bsNo':'1231','serialNo':167,'main':true,'letterLabel':{'vtr':{'x':-0.8291804147483839,'y':-0.42111756642268533,'z':-0.36758650008934407},'orthogVtr':{'x':0.2680865545923288,'y':-0.8766310301882688,'z':0.3995593024294001},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4287181159681156,'y':-0.9034383083757016,'z':0},'orthogVtr':{'x':0.7586905416546572,'y':-0.3600294304608457,'z':0.5429249222551882},'minZoom':0.5}},{'longitude':271.73291666666665,'latitude':-30.422222222222224,'magnitude':2.98,'b_v':0.98,'letter':'gamma','constell':'Sgr','desigNo':'10','bsNo':'6746','serialNo':168,'main':true,'letterLabel':{'vtr':{'x':0.11304878233054655,'y':-0.8551913319332376,'z':-0.5058337262380157},'orthogVtr':{'x':-0.9932471838051012,'y':-0.11062991615819695,'z':-0.03494357614878228},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9884856947791573,'y':-0.14161875028444126,'z':-0.053293158893423696},'orthogVtr':{'x':-0.14905041610190325,'y':0.8506087949996682,'z':0.5042307520660178},'minZoom':0.5}},{'longitude':199.96916666666667,'latitude':-23.263333333333332,'magnitude':2.99,'b_v':0.92,'letter':'gamma','constell':'Hya','desigNo':'46','bsNo':'5020','serialNo':169,'main':true,'letterLabel':{'vtr':{'x':-0.4159612289763575,'y':0.909382348623767,'z':0},'orthogVtr':{'x':0.2853178504715944,'y':0.13050744157357536,'z':0.9495059409483381},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4159612289763575,'y':0.909382348623767,'z':0},'orthogVtr':{'x':0.2853178504715944,'y':0.13050744157357536,'z':0.9495059409483381},'minZoom':0.5}},{'longitude':267.2025,'latitude':-40.13194444444444,'magnitude':2.99,'b_v':0.51,'letter':'iota^1','constell':'Sco','desigNo':'','bsNo':'6615','serialNo':170,'main':true,'letterLabel':{'vtr':{'x':0.7546826027928971,'y':-0.5190869555601467,'z':-0.4012516686682269},'orthogVtr':{'x':-0.6550280395352366,'y':-0.5613412769785933,'z':-0.505800591322971},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8187145873722285,'y':-0.4578910184247872,'z':-0.34647112386147416},'orthogVtr':{'x':-0.5729869003385321,'y':-0.6122835224947433,'z':-0.5447888582945422},'minZoom':0.5}},{'longitude':286.55375,'latitude':13.890555555555554,'magnitude':2.99,'b_v':0.01,'letter':'zeta','constell':'Aql','desigNo':'17','bsNo':'7235','serialNo':171,'main':true,'letterLabel':{'vtr':{'x':0.7411290087424101,'y':-0.6696790224526558,'z':-0.047516305489249004},'orthogVtr':{'x':-0.6117432597758706,'y':-0.7027783064879574,'z':0.3631429966951173},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6554964394333265,'y':-0.7551982639613463,'z':0},'orthogVtr':{'x':-0.7027278572612212,'y':-0.6099532140197271,'z':0.3662384951586297},'minZoom':0.5}},{'longitude':253.265,'latitude':-38.075833333333335,'magnitude':3,'b_v':-0.2,'letter':'mu^1','constell':'Sco','desigNo':'','bsNo':'6247','serialNo':172,'main':true,'letterLabel':{'vtr':{'x':-0.8440606069901793,'y':-0.2618261013142624,'z':-0.46798374373256196},'orthogVtr':{'x':-0.4859863043656155,'y':0.74237685286249,'z':0.4611875110007173},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8529883998270865,'y':-0.24791782924550995,'z':-0.45929025648561345},'orthogVtr':{'x':-0.4701401770365988,'y':0.7471365664573215,'z':0.4698458949468009},'minZoom':0.5}},{'longitude':32.64791666666667,'latitude':35.06916666666667,'magnitude':3,'b_v':0.14,'letter':'beta','constell':'Tri','desigNo':'4','bsNo':'622','main':true,'serialNo':173,'letterLabel':{'vtr':{'x':0.2250170999525783,'y':0.4095277405321302,'z':0.8841121730094997},'orthogVtr':{'x':-0.6888019948894808,'y':0.7086340524109573,'z':-0.15293656070376493},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.16499713332918203,'y':0.4689048603196927,'z':0.867700511675383},'orthogVtr':{'x':-0.7055897033176922,'y':0.6708229442038313,'z':-0.22834129740753079},'minZoom':0.5}},{'longitude':167.66041666666666,'latitude':44.40333333333333,'magnitude':3,'b_v':1.14,'letter':'psi','constell':'UMa','desigNo':'52','bsNo':'4335','serialNo':174,'main':true,'letterLabel':{'vtr':{'x':0.5230471920686184,'y':0.6436314070158262,'z':0.5587130272080308},'orthogVtr':{'x':-0.4892025539455595,'y':-0.3100833063732071,'z':0.8151866070549747},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7080055632763842,'y':0.7062068552270573,'z':0},'orthogVtr':{'x':-0.1078221975634615,'y':0.10809682057684354,'z':0.9882759994524626},'minZoom':0.5}},{'longitude':230.17833333333334,'latitude':71.77166666666666,'magnitude':3,'b_v':0.06,'letter':'gamma','constell':'UMi','desigNo':'13','bsNo':'5735','main':true,'serialNo':175,'letterLabel':{'vtr':{'x':0.5534647288831828,'y':-0.09263202576763262,'z':0.8277053229769938},'orthogVtr':{'x':-0.8084235455570928,'y':-0.2987742583488886,'z':0.5071344136784358},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.029283113643217697,'y':-0.23930324979967255,'z':0.9705031962289841},'orthogVtr':{'x':-0.9792927725579283,'y':-0.20144652959298975,'z':-0.020123651029238656},'minZoom':0.5}},{'longitude':328.74583333333334,'latitude':-37.281666666666666,'magnitude':3,'b_v':-0.08,'letter':'gamma','constell':'Gru','desigNo':'','bsNo':'8353','serialNo':176,'main':true,'letterLabel':{'vtr':{'x':-0.02253492547858521,'y':0.5456237177757128,'z':0.8377272442354278},'orthogVtr':{'x':0.732684341861716,'y':0.5791211259465054,'z':-0.35748059621903405},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6650478245446343,'y':-0.7468007706667484,'z':0},'orthogVtr':{'x':-0.3082945973320172,'y':0.27454531292391327,'z':0.9108124463397501},'minZoom':0.5}},{'longitude':56.044583333333335,'latitude':47.841944444444444,'magnitude':3.01,'b_v':-0.13,'letter':'delta','constell':'Per','desigNo':'39','bsNo':'1122','serialNo':177,'main':true,'letterLabel':{'vtr':{'x':-0.597912459967755,'y':-0.2656017252803976,'z':-0.7562780003037138},'orthogVtr':{'x':0.7084927481863175,'y':-0.6163892856128226,'z':-0.3436601145741441},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.42819644288608383,'y':-0.3941710073786607,'z':-0.8131894141230547},'orthogVtr':{'x':0.822258530096829,'y':-0.5432395832708634,'z':-0.16965159843249702},'minZoom':0.5}},{'longitude':182.75708333333333,'latitude':-22.716944444444444,'magnitude':3.02,'b_v':1.33,'letter':'epsilon','constell':'Crv','desigNo':'2','bsNo':'4630','serialNo':178,'main':true,'letterLabel':{'vtr':{'x':-0.37068795167685836,'y':0.9072362273846082,'z':0.19877844501494263},'orthogVtr':{'x':0.11701817489434273,'y':-0.16669829285203433,'z':0.9790395425643513},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.3865595515976045,'y':0.9222644485551088,'z':0},'orthogVtr':{'x':0.04092094625795949,'y':0.017151677765752327,'z':0.9990151631017284},'minZoom':0.5}},{'longitude':105.93875,'latitude':-23.860000000000003,'magnitude':3.02,'b_v':-0.08,'letter':'omicron^2','constell':'CMa','desigNo':'24','bsNo':'2653','serialNo':179,'main':true,'letterLabel':{'vtr':{'x':-0.3888663761279889,'y':0.8741197247482096,'z':-0.29102860396050384},'orthogVtr':{'x':-0.8864036219623739,'y':-0.2688714434147187,'z':0.3768245823829316},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7033548009233042,'y':0.7004111741384098,'z':-0.12131039180628193},'orthogVtr':{'x':-0.6649965891108531,'y':-0.5880487508870794,'z':0.4604109067464377},'minZoom':0.5}},{'longitude':95.24625,'latitude':-30.072222222222223,'magnitude':3.02,'b_v':-0.16,'letter':'zeta','constell':'CMa','desigNo':'1','bsNo':'2282','serialNo':180,'main':true,'letterLabel':{'vtr':{'x':0.32445465211184166,'y':0.8044635672469423,'z':-0.4975616019100631},'orthogVtr':{'x':-0.9425857227735307,'y':0.3189763896796696,'z':-0.09892531551844702},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.06272149180563864,'y':0.8602644410666411,'z':-0.5059754004909474},'orthogVtr':{'x':-0.9948892805328593,'y':0.09408857336069862,'z':0.036642323121737035},'minZoom':0.5}},{'longitude':75.80708333333334,'latitude':43.847500000000004,'magnitude':3.03,'b_v':0.54,'letter':'epsilon','constell':'Aur','desigNo':'7','bsNo':'1605','serialNo':181,'main':true,'letterLabel':{'vtr':{'x':0.4203006580111701,'y':0.5891936030039465,'z':0.6900711956418739},'orthogVtr':{'x':-0.8899887485177066,'y':0.41588507120261314,'z':0.18697495838396078},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4203006580111701,'y':0.5891936030039465,'z':0.6900711956418739},'orthogVtr':{'x':-0.8899887485177066,'y':0.41588507120261314,'z':0.18697495838396078},'minZoom':0.5}},{'longitude':191.84291666666667,'latitude':-68.20361111111112,'magnitude':3.04,'b_v':-0.18,'letter':'beta','constell':'Mus','desigNo':'','bsNo':'4844','serialNo':182,'main':true,'letterLabel':{'vtr':{'x':-0.7361066006867353,'y':0.33631053637178876,'z':0.587403009483897},'orthogVtr':{'x':0.571037161443254,'y':-0.15737163491127837,'z':0.805698907021837},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6605414812121257,'y':0.3144788323188235,'z':0.6817536326426727},'orthogVtr':{'x':0.6569789333927235,'y':-0.1974175077664548,'z':0.7276022324769499},'minZoom':0.5}},{'longitude':218.19541666666666,'latitude':38.23222222222223,'magnitude':3.04,'b_v':0.19,'letter':'gamma','constell':'Boo','desigNo':'27','bsNo':'5435','serialNo':183,'main':true,'letterLabel':{'vtr':{'x':0.7828497919043951,'y':0.5442490859366824,'z':0.301561164230958},'orthogVtr':{'x':0.07772927045542471,'y':-0.5664073618561523,'z':0.8204516201151784},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7079721211394164,'y':0.7062403809535074,'z':0},'orthogVtr':{'x':0.3430322315171603,'y':-0.34387336538092816,'z':0.8741166951397006},'minZoom':0.5}},{'longitude':305.49833333333333,'latitude':-14.725,'magnitude':3.05,'b_v':0.79,'letter':'beta','constell':'Cap','desigNo':'9','bsNo':'7776','serialNo':184,'main':true,'letterLabel':{'vtr':{'x':0.12457957771186379,'y':-0.9148185550492218,'z':-0.3841704571603438},'orthogVtr':{'x':-0.8179709018207811,'y':-0.31384638581295915,'z':0.4821037750180364},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.11091053902186143,'y':-0.9199291378885706,'z':-0.3760707826958532},'orthogVtr':{'x':-0.8199361680900829,'y':-0.2985346274953618,'z':0.4884483150180349},'minZoom':0.5}},{'longitude':292.8566666666667,'latitude':27.997222222222224,'magnitude':3.05,'b_v':1.09,'letter':'beta','constell':'Cyg','desigNo':'6','bsNo':'7417','main':true,'serialNo':185,'letterLabel':{'vtr':{'x':-0.47929949766038493,'y':0.8323889932061437,'z':-0.27820955327192654},'orthogVtr':{'x':0.8078637341466803,'y':0.2945593442516372,'z':-0.5104811257672777},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4356524730102571,'y':-0.8468777610838089,'z':0.3049671794500555},'orthogVtr':{'x':-0.8322131602942618,'y':-0.24986936802731025,'z':0.49496116489545905},'minZoom':0.5}},{'longitude':155.84125,'latitude':41.41083333333333,'magnitude':3.06,'b_v':1.6,'letter':'mu','constell':'UMa','desigNo':'34','bsNo':'4069','serialNo':186,'main':true,'letterLabel':{'vtr':{'x':-0.7272369210849935,'y':-0.5881676321473015,'z':0.3538153432301308},'orthogVtr':{'x':-0.05349795747715594,'y':-0.4653362895753993,'z':-0.8835157645169509},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7291969749213334,'y':-0.622281940869275,'z':0.28466991030585653},'orthogVtr':{'x':0.0027097248910238625,'y':-0.41862180063815546,'z':-0.9081566194338306},'minZoom':0.5}},{'longitude':101.25208333333333,'latitude':25.112222222222222,'magnitude':3.06,'b_v':1.38,'letter':'epsilon','constell':'Gem','desigNo':'27','bsNo':'2473','serialNo':187,'main':true,'letterLabel':{'vtr':{'x':0.9777213474894891,'y':0.17956540625073977,'z':-0.10870709057528961},'orthogVtr':{'x':-0.11333276914238627,'y':0.8874948995784276,'z':0.44666372883948746},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9231911079453973,'y':0.3843412262697688,'z':0},'orthogVtr':{'x':-0.3413232018317736,'y':0.8198614234668974,'z':0.45970177093648384},'minZoom':0.5}},{'longitude':288.13875,'latitude':67.69222222222223,'magnitude':3.07,'b_v':0.99,'letter':'delta','constell':'Dra','desigNo':'57','bsNo':'7310','main':true,'serialNo':188,'letterLabel':{'vtr':{'x':-0.188712194481516,'y':-0.335720112887972,'z':0.9228649486552503},'orthogVtr':{'x':-0.9748965592424284,'y':0.17712795284886584,'z':-0.13491622251176605},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.49048172600162004,'y':-0.26147365555941227,'z':0.8312997076306894},'orthogVtr':{'x':-0.8634021484958369,'y':0.2751614677354745,'z':-0.42287456372597376},'minZoom':0.5}},{'longitude':274.7029166666667,'latitude':-36.75472222222222,'magnitude':3.1,'b_v':1.58,'letter':'eta','constell':'Sgr','desigNo':'','bsNo':'6832','serialNo':189,'main':true,'letterLabel':{'vtr':{'x':-0.5350377550842286,'y':-0.696596222632424,'z':-0.4780045012849434},'orthogVtr':{'x':-0.8422703870037784,'y':0.39583121241259234,'z':0.36592109321065724},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5350377550842286,'y':-0.696596222632424,'z':-0.4780045012849434},'orthogVtr':{'x':-0.8422703870037784,'y':0.39583121241259234,'z':0.36592109321065724},'minZoom':0.5}},{'longitude':174.14916666666667,'latitude':-63.11666666666667,'magnitude':3.11,'b_v':-0.04,'letter':'lambda','constell':'Cen','desigNo':'','bsNo':'4467','serialNo':190,'main':true,'letterLabel':{'vtr':{'x':0.32404130085511307,'y':-0.11489231342426767,'z':-0.9390404632688338},'orthogVtr':{'x':-0.8322616387494225,'y':0.437335383034912,'z':-0.34070269651388585},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8330889882411564,'y':0.43762826193726534,'z':-0.33829608632837405},'orthogVtr':{'x':-0.3219082752354686,'y':0.11377163658856984,'z':0.9399101430684129},'minZoom':0.5}},{'longitude':134.07958333333335,'latitude':5.878055555555556,'magnitude':3.11,'b_v':0.98,'letter':'zeta','constell':'Hya','desigNo':'16','bsNo':'3547','serialNo':191,'main':true,'letterLabel':{'vtr':{'x':-0.7172411653220852,'y':0.01472200775141029,'z':0.6966694863815873},'orthogVtr':{'x':-0.08186730970285355,'y':-0.9946331664648376,'z':-0.06326616607751365},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7165704986353806,'y':-0.2174874068346349,'z':0.6627412378551586},'orthogVtr':{'x':0.08754350984514898,'y':-0.9706755900981789,'z':-0.2238862047370141},'minZoom':0.5}},{'longitude':162.6225,'latitude':-16.285555555555558,'magnitude':3.11,'b_v':1.23,'letter':'nu','constell':'Hya','desigNo':'','bsNo':'4232','serialNo':192,'main':true,'letterLabel':{'vtr':{'x':0.04691780181733873,'y':0.6350141672105337,'z':-0.7710743980411626},'orthogVtr':{'x':-0.3982756959058755,'y':0.7198048195098253,'z':0.5685573778090638},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.29271107608776015,'y':0.9562009338708812,'z':0},'orthogVtr':{'x':-0.2741259491770635,'y':-0.08391510479117761,'z':0.9580256881606359},'minZoom':0.5}},{'longitude':309.6975,'latitude':-47.22916666666667,'magnitude':3.11,'b_v':1,'letter':'alpha','constell':'Ind','desigNo':'','bsNo':'7869','serialNo':193,'main':true,'letterLabel':{'vtr':{'x':-0.7975236189186269,'y':-0.5826325522159095,'z':-0.15651002001569184},'orthogVtr':{'x':-0.41931180904055,'y':0.3488155113344531,'z':0.8381559197736572},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8609409981089529,'y':-0.5087048238174668,'z':0},'orthogVtr':{'x':-0.26579487148754743,'y':0.44983591905713854,'z':0.8526433792723296},'minZoom':0.5}},{'longitude':255.01833333333335,'latitude':-56.01583333333333,'magnitude':3.12,'b_v':1.55,'letter':'zeta','constell':'Ara','desigNo':'','bsNo':'6285','serialNo':194,'main':true,'letterLabel':{'vtr':{'x':-0.9112865582849683,'y':-0.10112741902875622,'z':-0.39916168880507474},'orthogVtr':{'x':-0.3855868543713384,'y':0.5497397161610278,'z':0.741018908133395},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8091400870181996,'y':0.41312253382043634,'z':0.4178780822560123},'orthogVtr':{'x':0.5695724125649231,'y':0.37652394672053385,'z':0.7306278015453324},'minZoom':0.5}},{'longitude':135.09958333333333,'latitude':47.971944444444446,'magnitude':3.12,'b_v':0.22,'letter':'iota','constell':'UMa','desigNo':'9','bsNo':'3569','serialNo':195,'main':true,'letterLabel':{'vtr':{'x':0.8403299374867219,'y':0.5420056786859148,'z':0.00868564538665919},'orthogVtr':{'x':-0.2625931731950377,'y':0.39300460178279284,'z':0.881244692675598},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8584325776097534,'y':0.5092996235682962,'z':-0.060888448259634735},'orthogVtr':{'x':-0.1954561028552232,'y':0.4345534100469383,'z':0.8791815771916662},'minZoom':0.5}},{'longitude':258.9379166666667,'latitude':24.81972222222222,'magnitude':3.12,'b_v':0.08,'letter':'delta','constell':'Her','desigNo':'65','bsNo':'6410','serialNo':196,'main':true,'letterLabel':{'vtr':{'x':-0.9466026103174238,'y':-0.320606649104188,'z':-0.03398344730046826},'orthogVtr':{'x':-0.2713214466033814,'y':0.8491225561333309,'z':-0.4531838007681286},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9236633508822771,'y':0.3832049245989975,'z':0},'orthogVtr':{'x':0.34134710117948175,'y':-0.8227707606297725,'z':0.45445619367445156},'minZoom':0.5}},{'longitude':87.89458333333333,'latitude':-35.7625,'magnitude':3.12,'b_v':1.15,'letter':'beta','constell':'Col','desigNo':'','bsNo':'2040','serialNo':197,'main':true,'letterLabel':{'vtr':{'x':0.691512504744288,'y':-0.5737274852089428,'z':0.43891596974603647},'orthogVtr':{'x':0.721749094806624,'y':0.5738311543436606,'z':-0.3870349473244522},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9089882457630996,'y':-0.353285365414091,'z':0.22120085815555782},'orthogVtr':{'x':0.41575433748359464,'y':-0.7305031632811646,'z':0.541768824591993},'minZoom':0.5}},{'longitude':225.07666666666665,'latitude':-42.17333333333333,'magnitude':3.13,'b_v':-0.21,'letter':'kappa','constell':'Cen','desigNo':'','bsNo':'5576','serialNo':198,'main':true,'letterLabel':{'vtr':{'x':-0.3253876850769428,'y':0.7266060708783717,'z':0.6051169078475356},'orthogVtr':{'x':0.7875471344943193,'y':-0.1459391870000444,'z':0.5987246985447923},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.39710058924705455,'y':0.7370171269490597,'z':0.5469157856593607},'orthogVtr':{'x':0.7539355122751464,'y':-0.07784846256216613,'z':0.65231959974166},'minZoom':0.5}},{'longitude':140.52916666666667,'latitude':34.3175,'magnitude':3.14,'b_v':1.55,'letter':'alpha','constell':'Lyn','desigNo':'40','bsNo':'3705','serialNo':199,'main':true,'letterLabel':{'vtr':{'x':-0.327103750923894,'y':-0.8151359751318231,'z':-0.47807580798175836},'orthogVtr':{'x':0.6974989223574541,'y':0.13306887456126348,'z':-0.7041220973192002},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5419482029530622,'y':-0.8125915746637409,'z':-0.214445979448085},'orthogVtr':{'x':0.5475342508685982,'y':-0.14781378865522463,'z':-0.8236245066832043},'minZoom':0.5}},{'longitude':142.93875,'latitude':-57.11194444444445,'magnitude':3.16,'b_v':1.54,'constell':'','desigNo':'','bsNo':'3803','serialNo':200,'main':false,'letterLabel':{'vtr':{'x':-0.8608418922291039,'y':0.2781332171487003,'z':0.42613747793632273},'orthogVtr':{'x':0.26682303211531166,'y':-0.4663585153554901,'z':0.8433950466348584},'minZoom':1.8}},{'longitude':258.9141666666667,'latitude':36.790277777777774,'magnitude':3.16,'b_v':1.44,'letter':'pi','constell':'Her','desigNo':'67','bsNo':'6418','serialNo':201,'main':true,'letterLabel':{'vtr':{'x':0.7322811207340305,'y':0.6031636045914418,'z':-0.3161613928245685},'orthogVtr':{'x':0.6633652090110636,'y':-0.5268084731417134,'z':0.5314314933270372},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9684991982293293,'y':0.24901667219113352,'z':0},'orthogVtr':{'x':0.19569962529071477,'y':-0.7611334956816037,'z':0.6183667669050268},'minZoom':0.5}},{'longitude':257.21,'latitude':65.69333333333334,'magnitude':3.17,'b_v':-0.12,'letter':'zeta','constell':'Dra','desigNo':'22','bsNo':'6396','main':true,'serialNo':202,'letterLabel':{'vtr':{'x':-0.7770142266089696,'y':-0.3171793459309049,'z':0.5437335323134929},'orthogVtr':{'x':-0.6228525831078994,'y':0.26235208821652756,'z':-0.737038697440131},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7636801949673635,'y':-0.322651902152295,'z':0.5591853984611148},'orthogVtr':{'x':-0.6391314484920357,'y':0.25559167770926183,'z':-0.7253853361036722},'minZoom':0.5}},{'longitude':143.50458333333333,'latitude':51.59666666666667,'magnitude':3.17,'b_v':0.48,'letter':'theta','constell':'UMa','desigNo':'25','bsNo':'3775','serialNo':203,'main':true,'letterLabel':{'vtr':{'x':-0.13339165663361865,'y':-0.4909000020769184,'z':-0.8609435834602756},'orthogVtr':{'x':0.8560526683641541,'y':0.3806552169653283,'z':-0.349679045388326},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8433254408825652,'y':0.5374032012932443,'z':0},'orthogVtr':{'x':-0.19854900108808488,'y':0.3115750398889688,'z':0.9292466242527392},'minZoom':0.5}},{'longitude':99.57416666666667,'latitude':-43.21194444444445,'magnitude':3.17,'b_v':-0.1,'letter':'nu','constell':'Pup','desigNo':'','bsNo':'2451','serialNo':204,'main':true,'letterLabel':{'vtr':{'x':0.9851612937669852,'y':-0.1716102527730228,'z':-0.0026732763678276907},'orthogVtr':{'x':0.121501468241685,'y':0.7083340452567729,'z':-0.6953418393461527},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9846868982280726,'y':0.1743321899649548,'z':0},'orthogVtr':{'x':-0.12528804404053373,'y':-0.707669051229929,'z':0.6953469780993009},'minZoom':0.5}},{'longitude':281.6870833333333,'latitude':-26.97138888888889,'magnitude':3.17,'b_v':-0.11,'letter':'phi','constell':'Sgr','desigNo':'27','bsNo':'7039','serialNo':205,'main':true,'letterLabel':{'vtr':{'x':-0.9567109815023221,'y':-0.2869198074138596,'z':0.048796741555734456},'orthogVtr':{'x':-0.22827958926477,'y':0.8437852172240099,'z':0.48571075376126727},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9567109815023221,'y':-0.2869198074138596,'z':0.048796741555734456},'orthogVtr':{'x':-0.22827958926477,'y':0.8437852172240099,'z':0.48571075376126727},'minZoom':0.5}},{'longitude':76.93625,'latitude':41.256388888888885,'magnitude':3.18,'b_v':-0.15,'letter':'eta','constell':'Aur','desigNo':'10','bsNo':'1641','serialNo':206,'main':true,'letterLabel':{'vtr':{'x':-0.9740235635580278,'y':0.2252578850565093,'z':-0.02317289048843517},'orthogVtr':{'x':-0.14967769867960398,'y':-0.717224808913015,'z':-0.680577078660211},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9839862522051925,'y':0.07295465104743548,'z':-0.1626304841096096},'orthogVtr':{'x':0.053817946072670014,'y':-0.7482179897536475,'z':-0.6612665638678021},'minZoom':0.5}},{'longitude':220.98541666666668,'latitude':-65.05,'magnitude':3.18,'b_v':0.26,'letter':'alpha','constell':'Cir','desigNo':'','bsNo':'5463','serialNo':207,'main':true,'letterLabel':{'vtr':{'x':0.7417857934303139,'y':-0.4200434843699221,'z':-0.5227975783258133},'orthogVtr':{'x':-0.5902184272501969,'y':-0.03875121104793383,'z':-0.8063129366298316},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7417857934303139,'y':-0.4200434843699221,'z':-0.5227975783258133},'orthogVtr':{'x':-0.5902184272501969,'y':-0.03875121104793383,'z':-0.8063129366298316},'minZoom':0.5}},{'longitude':72.69791666666667,'latitude':6.990555555555556,'magnitude':3.19,'b_v':0.48,'letter':'pi^3','constell':'Ori','desigNo':'1','bsNo':'1543','serialNo':208,'main':true,'letterLabel':{'vtr':{'x':0.890069004981765,'y':0.32553365047048055,'z':0.3190689718260516},'orthogVtr':{'x':-0.3473253306815863,'y':0.9376649491048654,'z':0.012229386210969709},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.1937705257236249,'y':0.9636151551370516,'z':0.18411631147452986},'orthogVtr':{'x':-0.9355804093305358,'y':0.2379780392361085,'z':-0.2608749710459873},'minZoom':0.5}},{'longitude':267.7625,'latitude':-37.04722222222222,'magnitude':3.19,'b_v':1.19,'constell':'','desigNo':'','bsNo':'6630','serialNo':209,'main':false,'letterLabel':{'vtr':{'x':0.7180196122554492,'y':0.5415891419419788,'z':0.43718307120368427},'orthogVtr':{'x':0.695324989195929,'y':-0.5862656706368067,'z':-0.4157111050145961},'minZoom':1.8}},{'longitude':76.55083333333333,'latitude':-22.34861111111111,'magnitude':3.19,'b_v':1.46,'letter':'epsilon','constell':'Lep','desigNo':'2','bsNo':'1654','serialNo':210,'main':true,'letterLabel':{'vtr':{'x':-0.8703726649297904,'y':-0.49239356630952735,'z':0},'orthogVtr':{'x':0.4429197987921655,'y':-0.7829210452814246,'z':0.43687147846174323},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8703726649297904,'y':-0.49239356630952735,'z':0},'orthogVtr':{'x':0.4429197987921655,'y':-0.7829210452814246,'z':0.43687147846174323},'minZoom':0.5}},{'longitude':254.62416666666667,'latitude':9.34888888888889,'magnitude':3.19,'b_v':1.16,'letter':'kappa','constell':'Oph','desigNo':'27','bsNo':'6299','serialNo':211,'main':true,'letterLabel':{'vtr':{'x':0.644202119503907,'y':-0.7046410216478736,'z':0.297463711799801},'orthogVtr':{'x':-0.718717351716467,'y':-0.690718746401459,'z':-0.07970559397724604},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5274947776229164,'y':0.8495582732105844,'z':0},'orthogVtr':{'x':0.8082699190321311,'y':-0.5018586418891398,'z':0.30795720733403964},'minZoom':0.5}},{'longitude':355.0204166666667,'latitude':77.73,'magnitude':3.21,'b_v':1.03,'letter':'gamma','constell':'Cep','desigNo':'35','bsNo':'8974','main':true,'serialNo':212,'letterLabel':{'vtr':{'x':-0.2798217577059363,'y':0.07869075095717341,'z':-0.9568215871457733},'orthogVtr':{'x':0.93641648710016,'y':-0.19741326295156963,'z':-0.29008992794961114},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9773232808704613,'y':-0.21175269695708115,'z':0},'orthogVtr':{'x':-0.0039061576057592942,'y':-0.01802847766152202,'z':0.999829843486364},'minZoom':0.5}},{'longitude':318.42041666666665,'latitude':30.299444444444447,'magnitude':3.21,'b_v':0.99,'letter':'zeta','constell':'Cyg','desigNo':'64','bsNo':'8115','main':false,'serialNo':213,'letterLabel':{'vtr':{'x':0.4162439434740421,'y':0.39648032505193964,'z':-0.8182568859275715},'orthogVtr':{'x':0.6400111960210184,'y':-0.7669834914361721,'z':-0.04606509342360077},'minZoom':0.5}},{'longitude':230.63166666666666,'latitude':-40.709722222222226,'magnitude':3.22,'b_v':-0.23,'letter':'delta','constell':'Lup','desigNo':'','bsNo':'5695','serialNo':214,'main':true,'letterLabel':{'vtr':{'x':-0.847301936381274,'y':0.17365853649282953,'z':-0.5019184608158104},'orthogVtr':{'x':-0.22559808011146848,'y':0.7378635396910447,'z':0.636131199552908},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8766378379206636,'y':0.371243084683321,'z':-0.3060795210408513},'orthogVtr':{'x':0.017921112443743364,'y':0.6608921716717802,'z':0.7502668666226283},'minZoom':0.5}},{'longitude':275.5541666666667,'latitude':-2.8930555555555557,'magnitude':3.23,'b_v':0.94,'letter':'eta','constell':'Ser','desigNo':'58','bsNo':'6869','serialNo':215,'main':true,'letterLabel':{'vtr':{'x':-0.9133616861848641,'y':-0.40135576969218667,'z':0.06843958170776927},'orthogVtr':{'x':-0.395508052695135,'y':0.9145305540564845,'z':0.08489550017781786},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.46284580501438394,'y':-0.886438808255024,'z':0},'orthogVtr':{'x':-0.8811526260062684,'y':0.46008567396462274,'z':0.10904688117858438},'minZoom':0.5}},{'longitude':244.81208333333333,'latitude':-4.733888888888889,'magnitude':3.23,'b_v':0.97,'letter':'epsilon','constell':'Oph','desigNo':'2','bsNo':'6075','serialNo':216,'main':true,'letterLabel':{'vtr':{'x':0.6642735716215016,'y':-0.7051926306988358,'z':0.2478789536311404},'orthogVtr':{'x':-0.6155068700821917,'y':-0.7041963408349771,'z':-0.35391920891109147},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6642735716215016,'y':-0.7051926306988358,'z':0.2478789536311404},'orthogVtr':{'x':-0.6155068700821917,'y':-0.7041963408349771,'z':-0.35391920891109147},'minZoom':0.5}},{'longitude':322.22,'latitude':70.63777777777779,'magnitude':3.23,'b_v':-0.2,'letter':'beta','constell':'Cep','desigNo':'8','bsNo':'8238','main':true,'serialNo':217,'letterLabel':{'vtr':{'x':-0.05327973800199324,'y':-0.19600162230063914,'z':0.9791550610470011},'orthogVtr':{'x':-0.9635856124946007,'y':0.2673977775164485,'z':0.0010936053534378529},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9635255040909679,'y':-0.26761652222208965,'z':0},'orthogVtr':{'x':-0.054355920141251075,'y':-0.19570284719178796,'z':0.9791556717634973},'minZoom':0.5}},{'longitude':102.0925,'latitude':-61.96055555555556,'magnitude':3.24,'b_v':0.23,'letter':'alpha','constell':'Pic','desigNo':'','bsNo':'2550','serialNo':218,'main':true,'letterLabel':{'vtr':{'x':-0.9938332297314242,'y':0.11088512741394267,'z':0},'orthogVtr':{'x':-0.05096818890408445,'y':-0.45681401080068,'z':0.8881008970021559},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9938332297314242,'y':0.11088512741394267,'z':0},'orthogVtr':{'x':-0.05096818890408445,'y':-0.45681401080068,'z':0.8881008970021559},'minZoom':0.5}},{'longitude':303.0516666666667,'latitude':-0.7683333333333334,'magnitude':3.24,'b_v':-0.07,'letter':'theta','constell':'Aql','desigNo':'65','bsNo':'7710','serialNo':219,'main':true,'letterLabel':{'vtr':{'x':-0.02458162573839622,'y':-0.999697826183521,'z':0},'orthogVtr':{'x':-0.8378504815488065,'y':0.02060195233273111,'z':0.5455108891016869},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.02458162573839622,'y':-0.999697826183521,'z':0},'orthogVtr':{'x':-0.8378504815488065,'y':0.02060195233273111,'z':0.5455108891016869},'minZoom':0.5}},{'longitude':226.27458333333334,'latitude':-25.349722222222223,'magnitude':3.25,'b_v':1.67,'letter':'sigma','constell':'Lib','desigNo':'20','bsNo':'5603','serialNo':220,'main':true,'letterLabel':{'vtr':{'x':0.5193418251257074,'y':0.3967914788158392,'z':0.7568623329339612},'orthogVtr':{'x':0.5831799855431643,'y':-0.8119425535844478,'z':0.02550282613046273},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.565359663547199,'y':0.8248445010023392,'z':0},'orthogVtr':{'x':0.5386866229050283,'y':0.3692231535918308,'z':0.7572918758014502},'minZoom':0.5}},{'longitude':211.84333333333333,'latitude':-26.765833333333333,'magnitude':3.25,'b_v':1.09,'letter':'pi','constell':'Hya','desigNo':'49','bsNo':'5287','serialNo':221,'main':true,'letterLabel':{'vtr':{'x':0.6459409479787886,'y':-0.6153987075022967,'z':0.45171309758381634},'orthogVtr':{'x':-0.08646821238376384,'y':-0.6468953840531027,'z':-0.7576606168581979},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.510539566600595,'y':0.8598542614509022,'z':0},'orthogVtr':{'x':0.40505038077238803,'y':0.2404991812240369,'z':0.8820965552969309},'minZoom':0.5}},{'longitude':112.44666666666667,'latitude':-43.337500000000006,'magnitude':3.25,'b_v':1.51,'letter':'sigma','constell':'Pup','desigNo':'','bsNo':'2878','serialNo':222,'main':true,'letterLabel':{'vtr':{'x':-0.9437895771660901,'y':0.32549039921156553,'z':0.05759543431339346},'orthogVtr':{'x':-0.17927317333756426,'y':-0.6504274095939739,'z':0.7381092833519658},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9269828614399094,'y':0.3751036851280961,'z':0},'orthogVtr':{'x':-0.25215156402954453,'y':-0.6231348493972662,'z':0.7403529889344009},'minZoom':0.5}},{'longitude':284.89958333333334,'latitude':32.714444444444446,'magnitude':3.25,'b_v':-0.05,'letter':'gamma','constell':'Lyr','desigNo':'14','bsNo':'7178','main':true,'serialNo':223,'letterLabel':{'vtr':{'x':0.8328735087687686,'y':-0.5367102929064776,'z':0.13514355285933194},'orthogVtr':{'x':-0.5094301933869545,'y':-0.6479608089355481,'z':0.5662399386738104},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9221229619330517,'y':-0.38672001379691723,'z':0.011699316421410493},'orthogVtr':{'x':-0.32075948406693444,'y':-0.7472340860514055,'z':0.5820262657509843},'minZoom':0.5}},{'longitude':56.74666666666667,'latitude':-74.185,'magnitude':3.26,'b_v':1.59,'letter':'gamma','constell':'Hyi','desigNo':'','bsNo':'1208','serialNo':224,'main':true,'letterLabel':{'vtr':{'x':-0.5131702094961816,'y':-0.2724920873851595,'z':0.8138823000889771},'orthogVtr':{'x':0.845176778237473,'y':0.0046725582422681156,'z':0.5344664449033244},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9881517690962391,'y':-0.15347990497773006,'z':0},'orthogVtr':{'x':0.03497901682726872,'y':-0.22520588193045876,'z':0.9736830999487062},'minZoom':0.5}},{'longitude':10.067083333333333,'latitude':30.956666666666667,'magnitude':3.27,'b_v':1.27,'letter':'delta','constell':'And','desigNo':'31','bsNo':'165','serialNo':225,'main':true,'letterLabel':{'vtr':{'x':-0.5348172881456834,'y':0.7923456303018854,'z':-0.29352831284563496},'orthogVtr':{'x':0.03221386385730367,'y':-0.3280117318843514,'z':-0.9441242347920169},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5202682141081988,'y':-0.8540029188408348,'z':0},'orthogVtr':{'x':0.128016600926541,'y':0.07798915773104825,'z':0.9887008855885671},'minZoom':0.5}},{'longitude':260.77125,'latitude':-25.015555555555554,'magnitude':3.27,'b_v':-0.19,'letter':'theta','constell':'Oph','desigNo':'42','bsNo':'6453','serialNo':226,'main':true,'letterLabel':{'vtr':{'x':-0.6732485487010296,'y':-0.6202042218623647,'z':-0.40259547297014686},'orthogVtr':{'x':-0.7249930925076137,'y':0.6607060639308682,'z':0.19455722269097758},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9457055359919909,'y':0.3250246747465513,'z':0},'orthogVtr':{'x':0.29072260267460637,'y':0.8458987767675398,'z':0.4471416193526195},'minZoom':0.5}},{'longitude':343.89416666666665,'latitude':-15.727500000000001,'magnitude':3.27,'b_v':0.07,'letter':'delta','constell':'Aqr','desigNo':'76','bsNo':'8709','serialNo':227,'main':true,'letterLabel':{'vtr':{'x':0.0656457981299714,'y':-0.5775988258388384,'z':-0.8136769786453801},'orthogVtr':{'x':-0.3747915649046787,'y':-0.7700030725680752,'z':0.5163589363146781},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.2812758386079178,'y':-0.9596269601336828,'z':0},'orthogVtr':{'x':-0.2562459571412425,'y':0.07510814043276869,'z':0.9636891494094452},'minZoom':0.5}},{'longitude':153.53791666666666,'latitude':-70.125,'magnitude':3.29,'b_v':-0.07,'letter':'omega','constell':'Car','desigNo':'','bsNo':'4037','serialNo':228,'main':true,'letterLabel':{'vtr':{'x':-0.9195814188327411,'y':0.3315590872867038,'z':-0.21080461516572774},'orthogVtr':{'x':-0.24847696669287123,'y':-0.075150885562835,'z':0.9657181480236516},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9514173777908792,'y':0.30790416242319196,'z':0},'orthogVtr':{'x':-0.0466450648713769,'y':-0.14413226816276437,'z':0.9884584600262178},'minZoom':0.5}},{'longitude':78.42958333333333,'latitude':-16.185833333333335,'magnitude':3.29,'b_v':-0.11,'letter':'mu','constell':'Lep','desigNo':'5','bsNo':'1702','serialNo':229,'main':true,'letterLabel':{'vtr':{'x':0.12820721664018309,'y':-0.9434344555914239,'z':0.30576843788117014},'orthogVtr':{'x':0.9728615978153613,'y':0.17952109896215432,'z':0.14598796705058628},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8226909631913988,'y':-0.5684888557247262,'z':0},'orthogVtr':{'x':0.5348610641892797,'y':-0.774026367694575,'z':0.33883155716056623},'minZoom':0.5}},{'longitude':231.33041666666668,'latitude':58.905277777777776,'magnitude':3.29,'b_v':1.17,'letter':'iota','constell':'Dra','desigNo':'12','bsNo':'5744','main':true,'serialNo':230,'letterLabel':{'vtr':{'x':0.9357612687353942,'y':0.35263415593887854,'z':0},'orthogVtr':{'x':0.14219200941455395,'y':-0.377325261586007,'z':0.9150994915459755},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9357612687353942,'y':0.35263415593887854,'z':0},'orthogVtr':{'x':0.14219200941455395,'y':-0.377325261586007,'z':0.9150994915459755},'minZoom':0.5}},{'longitude':68.59416666666667,'latitude':-55.009166666666665,'magnitude':3.3,'b_v':-0.08,'letter':'alpha','constell':'Dor','desigNo':'','bsNo':'1465','serialNo':231,'main':true,'letterLabel':{'vtr':{'x':-0.8155629590342286,'y':-0.447466991935042,'z':0.36692008800273995},'orthogVtr':{'x':0.5394944188754524,'y':-0.3586263908248513,'z':0.7617958281627559},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9688829381427633,'y':-0.24751939757491023,'z':0},'orthogVtr':{'x':0.13214772159320487,'y':-0.5172753086042359,'z':0.8455549862582075},'minZoom':0.5}},{'longitude':158.1625,'latitude':-61.775555555555556,'magnitude':3.3,'b_v':-0.09,'letter':'PP','constell':'Car','desigNo':'','bsNo':'4140','serialNo':232,'main':true,'letterLabel':{'vtr':{'x':-0.07293364425642523,'y':-0.16020081174923925,'z':0.9843862978782071},'orthogVtr':{'x':0.8955265708784065,'y':-0.4449667180775764,'z':-0.0060647056015190465},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6460551990186304,'y':0.17347623329217426,'z':0.743316000301189},'orthogVtr':{'x':0.6244195988554159,'y':-0.43996099459452503,'z':0.6453948309373403},'minZoom':0.5}},{'longitude':261.71791666666667,'latitude':-56.39222222222222,'magnitude':3.31,'b_v':-0.15,'letter':'gamma','constell':'Ara','desigNo':'','bsNo':'6462','serialNo':233,'main':true,'letterLabel':{'vtr':{'x':0.18193413819352566,'y':-0.5524100401669789,'z':-0.8134759473288045},'orthogVtr':{'x':-0.980072961066653,'y':-0.034792274416910615,'z':-0.19556709494938376},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.18193413819352566,'y':-0.5524100401669789,'z':-0.8134759473288045},'orthogVtr':{'x':-0.980072961066653,'y':-0.034792274416910615,'z':-0.19556709494938376},'minZoom':0.5}},{'longitude':93.98375,'latitude':22.50027777777778,'magnitude':3.31,'b_v':1.6,'letter':'eta','constell':'Gem','desigNo':'7','bsNo':'2216','serialNo':234,'main':true,'letterLabel':{'vtr':{'x':0.6139353477324727,'y':0.7432394889747795,'z':0.26585419092637347},'orthogVtr':{'x':-0.7867424401397877,'y':0.5487668215688218,'z':0.28265050579849615},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9973309457734791,'y':-0.007610277533025872,'z':-0.07261589549436247},'orthogVtr':{'x':0.03480320265546162,'y':0.9238463325153751,'z':0.3811780305615923},'minZoom':0.5}},{'longitude':287.0079166666667,'latitude':-27.643333333333334,'magnitude':3.32,'b_v':1.17,'letter':'tau','constell':'Sgr','desigNo':'40','bsNo':'7234','serialNo':235,'main':true,'letterLabel':{'vtr':{'x':0.8847593159343712,'y':0.4657898633931962,'z':-0.015516314881153138},'orthogVtr':{'x':0.38737600901012725,'y':-0.7535086051070886,'z':-0.5311916882566553},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8847593159343712,'y':0.4657898633931962,'z':-0.015516314881153138},'orthogVtr':{'x':0.38737600901012725,'y':-0.7535086051070886,'z':-0.5311916882566553},'minZoom':0.5}},{'longitude':16.715416666666666,'latitude':-46.625,'magnitude':3.32,'b_v':0.89,'letter':'beta','constell':'Phe','desigNo':'','bsNo':'322','serialNo':236,'main':true,'letterLabel':{'vtr':{'x':0.3988412080747507,'y':0.5585522837671262,'z':-0.7272860764788512},'orthogVtr':{'x':-0.6389751749434266,'y':-0.39959098152590883,'z':-0.6572958034927489},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7414836244135078,'y':-0.6709709641456986,'z':0},'orthogVtr':{'x':0.13253534690458002,'y':-0.146463550044723,'z':0.9802973071110518},'minZoom':0.5}},{'longitude':46.57625,'latitude':38.90694444444444,'magnitude':3.32,'b_v':1.53,'letter':'rho','constell':'Per','desigNo':'25','bsNo':'921','serialNo':237,'main':true,'letterLabel':{'vtr':{'x':-0.07220541538083664,'y':-0.632487646004108,'z':-0.7711976112786287},'orthogVtr':{'x':0.8418224149819904,'y':-0.4533247253649393,'z':0.29297050193951596},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6051171941073283,'y':-0.7516070308280172,'z':-0.2625262893608295},'orthogVtr':{'x':0.5896709097217732,'y':0.20157083168183723,'z':0.7820853010017443},'minZoom':0.5}},{'longitude':184.07125,'latitude':56.93555555555555,'magnitude':3.32,'b_v':0.08,'letter':'delta','constell':'UMa','desigNo':'69','bsNo':'4660','serialNo':238,'main':true,'letterLabel':{'vtr':{'x':-0.5011661487619081,'y':-0.2877191327177268,'z':-0.8161189815237214},'orthogVtr':{'x':0.6728098883861441,'y':0.46354872374637746,'z':-0.5765842824799591},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6429356453988379,'y':0.38694942340749294,'z':0.6609870646239523},'orthogVtr':{'x':-0.5389567797612332,'y':-0.38461651335238456,'z':0.7493969089915282},'minZoom':0.5}},{'longitude':258.3525,'latitude':-43.260555555555555,'magnitude':3.32,'b_v':0.44,'letter':'eta','constell':'Sco','desigNo':'','bsNo':'6380','serialNo':239,'main':true,'letterLabel':{'vtr':{'x':0.7938109317606761,'y':-0.5119563734498458,'z':-0.3282756102748561},'orthogVtr':{'x':-0.5901252139634985,'y':-0.5179199299210546,'z':-0.6192827932658109},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7938109317606761,'y':-0.5119563734498458,'z':-0.3282756102748561},'orthogVtr':{'x':-0.5901252139634985,'y':-0.5179199299210546,'z':-0.6192827932658109},'minZoom':0.5}},{'longitude':269.9975,'latitude':-9.774444444444445,'magnitude':3.32,'b_v':0.99,'letter':'nu','constell':'Oph','desigNo':'64','bsNo':'6698','serialNo':240,'main':true,'letterLabel':{'vtr':{'x':-0.9999999679238719,'y':0.0002532829547945635,'z':0},'orthogVtr':{'x':0.00024960622795288685,'y':0.9854836862154415,'z':0.16976996760309682},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9999999679238719,'y':0.0002532829547945635,'z':0},'orthogVtr':{'x':0.00024960622795288685,'y':0.9854836862154415,'z':0.16976996760309682},'minZoom':0.5}},{'longitude':63.663333333333334,'latitude':-62.430277777777775,'magnitude':3.33,'b_v':0.92,'letter':'alpha','constell':'Ret','desigNo':'','bsNo':'1336','serialNo':241,'main':true,'letterLabel':{'vtr':{'x':0.06693795853742755,'y':0.43554544028058595,'z':-0.8976744839626625},'orthogVtr':{'x':-0.9764007648727189,'y':-0.15655545758746003,'z':-0.14876805791416048},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.464381590545791,'y':0.28482480084316153,'z':-0.8385848622452082},'orthogVtr':{'x':-0.8615038492655446,'y':-0.3648071746474867,'z':0.3531668770232686},'minZoom':0.5}},{'longitude':168.78916666666666,'latitude':15.33361111111111,'magnitude':3.33,'b_v':0,'letter':'theta','constell':'Leo','desigNo':'70','bsNo':'4359','serialNo':242,'main':true,'letterLabel':{'vtr':{'x':0.26921339035848924,'y':0.9630805524210774,'z':0},'orthogVtr':{'x':-0.18057659840833692,'y':0.05047722971323892,'z':0.9822648020710867},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.26921339035848924,'y':0.9630805524210774,'z':0},'orthogVtr':{'x':-0.18057659840833692,'y':0.05047722971323892,'z':0.9822648020710867},'minZoom':0.5}},{'longitude':117.5075,'latitude':-24.904722222222222,'magnitude':3.34,'b_v':1.22,'letter':'xi','constell':'Pup','desigNo':'7','bsNo':'3045','serialNo':243,'main':true,'letterLabel':{'vtr':{'x':-0.18360734100164805,'y':0.9069411405837653,'z':-0.3791386446234722},'orthogVtr':{'x':-0.889268274752688,'y':0.011120081137428295,'z':0.4572507838307934},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9034001775761415,'y':-0.10398283068723418,'z':-0.41599962749702757},'orthogVtr':{'x':-0.09153053756377307,'y':0.9010291114110319,'z':-0.423991392699348},'minZoom':0.5}},{'longitude':28.918333333333333,'latitude':63.75527777777778,'magnitude':3.35,'b_v':-0.15,'letter':'epsilon','constell':'Cas','desigNo':'45','bsNo':'542','main':true,'serialNo':244,'letterLabel':{'vtr':{'x':0.9181503392342087,'y':-0.39623219778825075,'z':0},'orthogVtr':{'x':0.08472802220114499,'y':0.19633200623488453,'z':0.9768699532597304},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9181503392342087,'y':-0.39623219778825075,'z':0},'orthogVtr':{'x':0.08472802220114499,'y':0.19633200623488453,'z':0.9768699532597304},'minZoom':0.5}},{'longitude':101.56791666666666,'latitude':12.875277777777779,'magnitude':3.35,'b_v':0.44,'letter':'xi','constell':'Gem','desigNo':'31','bsNo':'2484','serialNo':245,'main':true,'letterLabel':{'vtr':{'x':-0.7290796777228412,'y':-0.6843492588284507,'z':-0.010436257591139485},'orthogVtr':{'x':0.6559172537634701,'y':-0.6942716365595165,'z':-0.29624221658021443},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.488635269074564,'y':-0.8664879545695651,'z':-0.10214792412124744},'orthogVtr':{'x':0.8503059414525356,'y':-0.4467053144702114,'z':-0.27826995517767844},'minZoom':0.5}},{'longitude':81.33958333333334,'latitude':-2.3822222222222225,'magnitude':3.35,'b_v':-0.24,'letter':'eta','constell':'Ori','desigNo':'28','bsNo':'1788','serialNo':246,'main':true,'letterLabel':{'vtr':{'x':0.7658152033393868,'y':-0.626953034359061,'z':0.14302785407821678},'orthogVtr':{'x':0.6252140046871639,'y':0.7779474211147155,'z':0.06249206608844491},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.943982210129393,'y':-0.2907846414250186,'z':0.15601884267789565},'orthogVtr':{'x':0.29370574438021124,'y':0.9558852387302538,'z':0.004510664659701978},'minZoom':0.5}},{'longitude':127.92625,'latitude':60.658055555555556,'magnitude':3.35,'b_v':0.86,'letter':'omicron','constell':'UMa','desigNo':'1','bsNo':'3323','serialNo':247,'main':true,'letterLabel':{'vtr':{'x':0.94517241676369,'y':0.3265717418716531,'z':0},'orthogVtr':{'x':-0.12622964939846382,'y':0.36533712961628256,'z':0.9222769959922434},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.94517241676369,'y':0.3265717418716531,'z':0},'orthogVtr':{'x':-0.12622964939846382,'y':0.36533712961628256,'z':0.9222769959922434},'minZoom':0.5}},{'longitude':291.595,'latitude':3.1508333333333334,'magnitude':3.36,'b_v':0.32,'letter':'delta','constell':'Aql','desigNo':'30','bsNo':'7377','serialNo':248,'main':true,'letterLabel':{'vtr':{'x':0.14792364816408626,'y':-0.9889987837777293,'z':0},'orthogVtr':{'x':-0.9181894515652983,'y':-0.13733276077703,'z':0.37157481595443986},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.14792364816408626,'y':-0.9889987837777293,'z':0},'orthogVtr':{'x':-0.9181894515652983,'y':-0.13733276077703,'z':0.37157481595443986},'minZoom':0.5}},{'longitude':230.96916666666667,'latitude':-44.75111111111111,'magnitude':3.37,'b_v':-0.19,'letter':'epsilon','constell':'Lup','desigNo':'','bsNo':'5708','serialNo':249,'main':true,'letterLabel':{'vtr':{'x':-0.8440932931087536,'y':0.5361963376682274,'z':0},'orthogVtr':{'x':0.2958015550445943,'y':0.4656579897395242,'z':0.834064791622896},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.23878258927115287,'y':-0.6883779360334021,'z':-0.6849223987017488},'orthogVtr':{'x':-0.8619599309126523,'y':0.17458434385553592,'z':-0.4759678396505248},'minZoom':0.5}},{'longitude':203.89666666666668,'latitude':-0.6847222222222222,'magnitude':3.38,'b_v':0.11,'letter':'zeta','constell':'Vir','desigNo':'79','bsNo':'5107','serialNo':250,'main':true,'letterLabel':{'vtr':{'x':0.024387509729672525,'y':-0.999375828233821,'z':0.025557842458802237},'orthogVtr':{'x':-0.4045012178701114,'y':-0.033243684097817465,'z':-0.9139330512730135},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.013070654100528585,'y':0.9999145753520067,'z':0},'orthogVtr':{'x':0.4050248682372512,'y':0.00529439222643356,'z':0.914290339837598},'minZoom':0.5}},{'longitude':131.925,'latitude':6.35361111111111,'magnitude':3.38,'b_v':0.69,'letter':'epsilon','constell':'Hya','desigNo':'11','bsNo':'3482','serialNo':251,'main':true,'letterLabel':{'vtr':{'x':0.41940271985598754,'y':0.8738739116881139,'z':-0.24585716391497442},'orthogVtr':{'x':-0.6189786187361359,'y':0.473389689991897,'z':0.6267117925784397},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7425424605765547,'y':0.21340644532738762,'z':-0.6348924187085908},'orthogVtr':{'x':-0.08754350984516443,'y':0.9706755900981743,'z':0.22388620473702964},'minZoom':0.5}},{'longitude':154.4175,'latitude':-61.419999999999995,'magnitude':3.39,'b_v':1.54,'letter':'v337','constell':'Car','desigNo':'','bsNo':'4050','serialNo':252,'main':true,'letterLabel':{'vtr':{'x':0.40222351424405595,'y':0.017691298449981546,'z':-0.9153705602368452},'orthogVtr':{'x':-0.8074871947967943,'y':0.4780581196369877,'z':-0.3455790278479761},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.266227675432804,'y':0.34274060677890583,'z':-0.9009171445246634},'orthogVtr':{'x':-0.8619409202522408,'y':0.333738556742439,'z':0.3816758123567626},'minZoom':0.5}},{'longitude':194.12125,'latitude':3.3027777777777776,'magnitude':3.39,'b_v':1.57,'letter':'delta','constell':'Vir','desigNo':'43','bsNo':'4910','serialNo':253,'main':true,'letterLabel':{'vtr':{'x':0.05940139263923609,'y':0.9982341782129678,'z':0},'orthogVtr':{'x':0.24313936730829058,'y':-0.014468365578696822,'z':0.969883454061572},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.05940139263923609,'y':0.9982341782129678,'z':0},'orthogVtr':{'x':0.24313936730829058,'y':-0.014468365578696822,'z':0.969883454061572},'minZoom':0.5}},{'longitude':332.86583333333334,'latitude':58.28805555555555,'magnitude':3.39,'b_v':1.56,'letter':'zeta','constell':'Cep','desigNo':'21','bsNo':'8465','main':true,'serialNo':254,'letterLabel':{'vtr':{'x':0.38243442910628733,'y':0.04971109353608566,'z':-0.9226444139610854},'orthogVtr':{'x':0.7968125544985907,'y':-0.5232931176149376,'z':0.302082879439186},'minZoom':1.3},'shortNameLabel':{'vtr':{'x':-0.8712335019367011,'y':0.3981965878428679,'z':0.28703947905019855},'orthogVtr':{'x':-0.14872297964851802,'y':0.34314189075950996,'z':-0.9274346975019078},'minZoom':0.5}},{'longitude':84.02583333333334,'latitude':9.944444444444445,'magnitude':3.39,'b_v':-0.16,'letter':'lambda','constell':'Ori','desigNo':'39','bsNo':'1879','serialNo':255,'main':true,'letterLabel':{'vtr':{'x':0.05149135906410901,'y':0.9825732775799437,'z':0.1786012153585136},'orthogVtr':{'x':-0.9933977278270368,'y':0.0687518216702481,'z':-0.09183758144193171},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5841805678353057,'y':0.8075491024986773,'z':0.08122506520281005},'orthogVtr':{'x':-0.805123263776304,'y':-0.5639516875147652,'z':-0.18367096742664815},'minZoom':0.5}},{'longitude':67.41583333333334,'latitude':15.908333333333333,'magnitude':3.4,'b_v':0.18,'letter':'theta^2','constell':'Tau','desigNo':'78','bsNo':'1412','serialNo':256,'main':true,'letterLabel':{'vtr':{'x':-0.6182834371612281,'y':-0.6408648912800881,'z':-0.4549920685645614},'orthogVtr':{'x':0.6937719094459721,'y':-0.7170508189987341,'z':0.06722098360582313},'minZoom':2.1},'shortNameLabel':{'vtr':{'x':-0.08673155288742296,'y':-0.9411741670684464,'z':-0.3266019365783868},'orthogVtr':{'x':0.9252413245948048,'y':-0.19763823806442676,'z':0.3238327008145415},'minZoom':0.5}},{'longitude':22.280833333333334,'latitude':-43.22916666666667,'magnitude':3.41,'b_v':1.54,'letter':'gamma','constell':'Phe','desigNo':'','bsNo':'429','serialNo':257,'main':true,'letterLabel':{'vtr':{'x':-0.60461958989799,'y':-0.29709406275553185,'z':-0.7390333344220669},'orthogVtr':{'x':-0.42410393146667474,'y':-0.6652986634541485,'z':0.6144213079969104},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7126511297413718,'y':-0.7015186150618858,'z':0},'orthogVtr':{'x':0.19379721476907236,'y':-0.19687261475410323,'z':0.9610847065205192},'minZoom':0.5}},{'longitude':228.38791666666665,'latitude':-52.16444444444444,'magnitude':3.41,'b_v':0.92,'letter':'zeta','constell':'Lup','desigNo':'','bsNo':'5649','serialNo':258,'main':true,'letterLabel':{'vtr':{'x':0.5391821957897928,'y':-0.61327694568442,'z':-0.5772122206219186},'orthogVtr':{'x':-0.7371233083303512,'y':-0.012149294451051784,'z':-0.6756490383035113},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5387305097019035,'y':-0.6132842736373156,'z':-0.5776260361388477},'orthogVtr':{'x':-0.7374534899618495,'y':-0.011773579439562587,'z':-0.6752952931646041},'minZoom':0.5}},{'longitude':207.64041666666665,'latitude':-41.774166666666666,'magnitude':3.41,'b_v':-0.23,'letter':'nu','constell':'Cen','desigNo':'','bsNo':'5190','serialNo':259,'main':true,'letterLabel':{'vtr':{'x':-0.7034253845993221,'y':0.7103444220667836,'z':0.0245668544975303},'orthogVtr':{'x':0.26213230035379476,'y':0.22714161275246356,'z':0.9379196899881344},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6957144220742143,'y':0.7164960033173411,'z':0.051136289934042505},'orthogVtr':{'x':0.28196109218368826,'y':0.20692024414121368,'z':0.9368468151512936},'minZoom':0.5}},{'longitude':340.58375,'latitude':10.923055555555555,'magnitude':3.41,'b_v':-0.09,'letter':'zeta','constell':'Peg','desigNo':'42','bsNo':'8634','serialNo':260,'main':true,'letterLabel':{'vtr':{'x':-0.09979944091829579,'y':-0.7111079575357093,'z':0.6959637521608344},'orthogVtr':{'x':-0.3639883748413259,'y':0.6770663181340101,'z':0.6396043025408957},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.20047038399325018,'y':-0.9796997627546915,'z':0},'orthogVtr':{'x':-0.3197797532190442,'y':-0.06543471005937179,'z':0.9452297118429007},'minZoom':0.5}},{'longitude':60.41291666666667,'latitude':12.538611111111111,'magnitude':3.41,'b_v':-0.1,'letter':'lambda','constell':'Tau','desigNo':'35','bsNo':'1239','serialNo':261,'main':true,'letterLabel':{'vtr':{'x':0.556689401432817,'y':-0.8240153508516895,'z':0.10533571043639095},'orthogVtr':{'x':0.6766105711322797,'y':0.5233234037710696,'z':0.518006515497163},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.41069659081747706,'y':-0.9117720714580492,'z':0},'orthogVtr':{'x':0.7739723928710116,'y':0.34862640904393466,'z':0.5286079473396628},'minZoom':0.5}},{'longitude':311.41083333333336,'latitude':61.907222222222224,'magnitude':3.41,'b_v':0.91,'letter':'eta','constell':'Cep','desigNo':'3','bsNo':'7957','main':false,'serialNo':262,'letterLabel':{'vtr':{'x':0.950248485390731,'y':-0.29031686380191324,'z':-0.11288903669020843},'orthogVtr':{'x':-0.002941741930380881,'y':-0.37076080266917155,'z':0.9287237336035549},'minZoom':0.5}},{'longitude':28.52125,'latitude':29.66333333333333,'magnitude':3.42,'b_v':0.49,'letter':'alpha','constell':'Tri','desigNo':'2','bsNo':'544','main':true,'serialNo':263,'letterLabel':{'vtr':{'x':0.5439311890861481,'y':-0.8391298240077808,'z':0},'orthogVtr':{'x':0.34816296880238656,'y':0.22568223914621538,'z':0.9098626677079673},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5439311890861481,'y':-0.8391298240077808,'z':0},'orthogVtr':{'x':0.34816296880238656,'y':0.22568223914621538,'z':0.9098626677079673},'minZoom':0.5}},{'longitude':240.32166666666666,'latitude':-38.445277777777775,'magnitude':3.42,'b_v':-0.21,'letter':'eta','constell':'Lup','desigNo':'','bsNo':'5948','serialNo':264,'main':true,'letterLabel':{'vtr':{'x':-0.6813174210208716,'y':-0.303870456916111,'z':-0.6659349196633726},'orthogVtr':{'x':-0.6208282648556908,'y':0.7218508648333442,'z':0.30578357460077155},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8484991422362401,'y':0.5291967551151127,'z':0},'orthogVtr':{'x':0.3600977204240868,'y':0.5773705223014839,'z':0.7327843555389867},'minZoom':0.5}},{'longitude':311.62875,'latitude':-66.13861111111112,'magnitude':3.42,'b_v':0.16,'letter':'beta','constell':'Pav','desigNo':'','bsNo':'7913','serialNo':265,'main':true,'letterLabel':{'vtr':{'x':0.7228973732432994,'y':0.39894180481695707,'z':0.5641496469265284},'orthogVtr':{'x':0.6365573920623616,'y':-0.06697929041321438,'z':-0.7683153397313547},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7887430483137883,'y':0.02874359492924841,'z':-0.614050657101852},'orthogVtr':{'x':-0.5528746054649014,'y':-0.40350290547332135,'z':-0.7290508047499964},'minZoom':0.5}},{'longitude':266.78625,'latitude':27.711388888888887,'magnitude':3.42,'b_v':0.75,'letter':'mu','constell':'Her','desigNo':'86','bsNo':'6623','serialNo':266,'main':true,'letterLabel':{'vtr':{'x':-0.8677636875501613,'y':0.4180889171945672,'z':-0.26867794827343106},'orthogVtr':{'x':0.49449261810570994,'y':0.7803588210733624,'z':-0.3827756013801724},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8569687987059493,'y':-0.4743680856392759,'z':0.20144328574417872},'orthogVtr':{'x':-0.5129729474701132,'y':0.7474845494288576,'z':-0.4220492904021547},'minZoom':0.5}},{'longitude':154.415,'latitude':23.329444444444444,'magnitude':3.43,'b_v':0.31,'letter':'zeta','constell':'Leo','desigNo':'36','bsNo':'4031','serialNo':267,'main':true,'letterLabel':{'vtr':{'x':0.44020943324947026,'y':0.897600643179039,'z':-0.022994352410010736},'orthogVtr':{'x':-0.3468309966786442,'y':0.19360596797192406,'z':0.9177281672197672},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.44020943324947026,'y':0.897600643179039,'z':-0.022994352410010736},'orthogVtr':{'x':-0.3468309966786442,'y':0.19360596797192406,'z':0.9177281672197672},'minZoom':0.5}},{'longitude':286.7941666666667,'latitude':-4.8549999999999995,'magnitude':3.43,'b_v':-0.1,'letter':'lambda','constell':'Aql','desigNo':'16','bsNo':'7236','serialNo':268,'main':true,'letterLabel':{'vtr':{'x':0.6861839345005517,'y':0.7130671419758836,'z':-0.14382927055258105},'orthogVtr':{'x':0.6680318466431715,'y':-0.6959685873659421,'z':-0.26336510260543067},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.28203930631251656,'y':-0.9594028505767296,'z':0},'orthogVtr':{'x':-0.9151878330653757,'y':0.2690412493857504,'z':0.3000800498834546},'minZoom':0.5}},{'longitude':137.85708333333332,'latitude':-59.038888888888884,'magnitude':3.43,'b_v':-0.19,'letter':'v357','constell':'Car','desigNo':'','bsNo':'3659','serialNo':269,'main':true,'letterLabel':{'vtr':{'x':0.05183699491602836,'y':0.35299566187963954,'z':-0.9341878765281807},'orthogVtr':{'x':-0.9229325860199818,'y':0.3742448485454343,'z':0.09020108092298113},'minZoom':1.4},'shortNameLabel':{'vtr':{'x':0.44431120813356373,'y':0.15737662459637874,'z':-0.8819411252218279},'orthogVtr':{'x':-0.8106042084188488,'y':0.4897935708023231,'z':-0.3209720786834293},'minZoom':0.5}},{'longitude':154.53625,'latitude':42.82638888888889,'magnitude':3.45,'b_v':0.03,'letter':'lambda','constell':'UMa','desigNo':'33','bsNo':'4033','serialNo':270,'main':true,'letterLabel':{'vtr':{'x':0.7384559743453568,'y':0.6634572903204143,'z':-0.12044582962619783},'orthogVtr':{'x':-0.12732824617186045,'y':0.31260951073266585,'z':0.941309094573234},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.749347960365433,'y':0.6022093250672045,'z':-0.27535715552399836},'orthogVtr':{'x':-0.0027097261333238476,'y':0.4186217995780026,'z':0.9081566199188096},'minZoom':0.5}},{'longitude':12.54375,'latitude':57.9075,'magnitude':3.46,'b_v':0.59,'letter':'eta','constell':'Cas','desigNo':'24','bsNo':'219','main':false,'serialNo':271,'letterLabel':{'vtr':{'x':-0.8525662745343016,'y':0.5021882628707667,'z':-0.14469863911434477},'orthogVtr':{'x':0.06464108791999754,'y':-0.17341728563209258,'z':-0.9827247706232485},'minZoom':1.3}},{'longitude':229.05208333333334,'latitude':33.250277777777775,'magnitude':3.46,'b_v':0.96,'letter':'delta','constell':'Boo','desigNo':'49','bsNo':'5681','serialNo':272,'main':true,'letterLabel':{'vtr':{'x':-0.8236461191659861,'y':-0.2222722961158934,'z':-0.521729907866301},'orthogVtr':{'x':0.14566487455493018,'y':0.8062041396568953,'z':-0.5734253478186865},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5131881297881925,'y':0.3758965729290572,'z':-0.7715826008307131},'orthogVtr':{'x':0.6604915811278678,'y':0.7470420703553022,'z':-0.07535924879185846},'minZoom':0.5}},{'longitude':119.30583333333334,'latitude':-53.03,'magnitude':3.46,'b_v':-0.18,'letter':'chi','constell':'Car','desigNo':'','bsNo':'3117','serialNo':273,'main':true,'letterLabel':{'vtr':{'x':-0.3969209064214909,'y':-0.39697151748521786,'z':0.8275671624412279},'orthogVtr':{'x':0.8693688533046499,'y':-0.45176509007391386,'z':0.20026507507368152},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9383369314015335,'y':0.3457221473495061,'z':0},'orthogVtr':{'x':-0.18130695579225012,'y':-0.49209173853668214,'z':0.8514537618950855},'minZoom':0.5}},{'longitude':17.3675,'latitude':-10.09,'magnitude':3.46,'b_v':1.16,'letter':'eta','constell':'Cet','desigNo':'31','bsNo':'334','serialNo':274,'main':true,'letterLabel':{'vtr':{'x':-0.2036140461242773,'y':-0.9766294338824544,'z':-0.06882055721466694},'orthogVtr':{'x':0.27495758985732327,'y':-0.12450581339678858,'z':0.953360700999499},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.1883092100718684,'y':-0.4523303080644948,'z':0.8717436170161433},'orthogVtr':{'x':0.2856571325931777,'y':0.8744735794187488,'z':0.3920407650961888},'minZoom':0.5}},{'longitude':41.0525,'latitude':3.308611111111111,'magnitude':3.47,'b_v':0.09,'letter':'gamma','constell':'Cet','desigNo':'86','bsNo':'804','serialNo':275,'main':true,'letterLabel':{'vtr':{'x':-0.6505529456163696,'y':-0.08606798851659804,'z':-0.7545681985762267},'orthogVtr':{'x':0.09998015917504888,'y':-0.9946162011314533,'z':0.027250325102066368},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.07643639194744441,'y':-0.9970744595997114,'z':0},'orthogVtr':{'x':0.6537374436766337,'y':0.05011594770529814,'z':0.7550600946419697},'minZoom':0.5}},{'longitude':207.66958333333332,'latitude':-42.56027777777778,'magnitude':3.47,'b_v':-0.17,'letter':'mu','constell':'Cen','desigNo':'','bsNo':'5193','serialNo':276,'main':true,'letterLabel':{'vtr':{'x':0.37949315991148924,'y':-0.682109092557996,'z':-0.6250696980578245},'orthogVtr':{'x':-0.6560846208878984,'y':0.2779512892511139,'z':-0.7016381197155881},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4057213849581247,'y':-0.6927940348863563,'z':-0.5961766374268145},'orthogVtr':{'x':-0.6401970368354464,'y':0.25013228214792954,'z':-0.72634812277212},'minZoom':0.5}},{'longitude':152.07125,'latitude':16.67666666666667,'magnitude':3.48,'b_v':-0.03,'letter':'eta','constell':'Leo','desigNo':'30','bsNo':'3975','serialNo':277,'main':true,'letterLabel':{'vtr':{'x':0.1415357138767983,'y':-0.6909444716783689,'z':-0.708917046455003},'orthogVtr':{'x':0.5134464781841503,'y':0.6635086358938637,'z':-0.5441773645922416},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.1415357138767983,'y':-0.6909444716783689,'z':-0.708917046455003},'orthogVtr':{'x':0.5134464781841503,'y':0.6635086358938637,'z':-0.5441773645922416},'minZoom':0.5}},{'longitude':250.87416666666667,'latitude':38.88972222222222,'magnitude':3.48,'b_v':0.92,'letter':'eta','constell':'Her','desigNo':'44','bsNo':'6220','serialNo':278,'main':true,'letterLabel':{'vtr':{'x':0.2092472878247956,'y':-0.706684290345026,'z':0.6758793430173127},'orthogVtr':{'x':-0.9440225455768263,'y':-0.32624382768828875,'z':-0.048850776226618764},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9264818772004602,'y':0.3763393830296153,'z':0},'orthogVtr':{'x':0.2767567979987038,'y':-0.6813269333484824,'z':0.6776424460255256},'minZoom':0.5}},{'longitude':26.220416666666665,'latitude':-15.845833333333333,'magnitude':3.49,'b_v':0.73,'letter':'tau','constell':'Cet','desigNo':'52','bsNo':'509','serialNo':279,'main':true,'letterLabel':{'vtr':{'x':-0.30165378042440455,'y':-0.9534175353724439,'z':0},'orthogVtr':{'x':0.40523689644834854,'y':-0.12821375446314281,'z':0.9051763866359835},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.30165378042440455,'y':-0.9534175353724439,'z':0},'orthogVtr':{'x':0.40523689644834854,'y':-0.12821375446314281,'z':0.9051763866359835},'minZoom':0.5}},{'longitude':225.65125,'latitude':40.32222222222222,'magnitude':3.49,'b_v':0.96,'letter':'beta','constell':'Boo','desigNo':'42','bsNo':'5602','serialNo':280,'main':true,'letterLabel':{'vtr':{'x':0.771898574015836,'y':0.6357456971402317,'z':0},'orthogVtr':{'x':0.3466106794314958,'y':-0.4208416830744453,'z':0.8383038319673275},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.771898574015836,'y':0.6357456971402317,'z':0},'orthogVtr':{'x':0.3466106794314958,'y':-0.4208416830744453,'z':0.8383038319673275},'minZoom':0.5}},{'longitude':169.855,'latitude':32.99861111111111,'magnitude':3.49,'b_v':1.4,'letter':'nu','constell':'UMa','desigNo':'54','bsNo':'4377','serialNo':281,'main':true,'letterLabel':{'vtr':{'x':0.5506603441108046,'y':0.8347294085053972,'z':0},'orthogVtr':{'x':-0.12331096488843242,'y':0.08134667074888435,'z':0.9890283742625166},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5506603441108046,'y':0.8347294085053972,'z':0},'orthogVtr':{'x':-0.12331096488843242,'y':0.08134667074888435,'z':0.9890283742625166},'minZoom':0.5}},{'longitude':342.4008333333333,'latitude':-51.224444444444444,'magnitude':3.49,'b_v':0.08,'letter':'epsilon','constell':'Gru','desigNo':'','bsNo':'8675','serialNo':282,'main':true,'letterLabel':{'vtr':{'x':0.22378151698688542,'y':0.38846594619179486,'z':0.8938769721300364},'orthogVtr':{'x':0.7704298622145682,'y':0.4912330410401022,'z':-0.40635935672571255},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7939694593840737,'y':-0.60795764454883,'z':0},'orthogVtr':{'x':-0.11512096899466928,'y':0.15034358780750065,'z':0.9819083297858802},'minZoom':0.5}},{'longitude':277.0675,'latitude':-45.956944444444446,'magnitude':3.49,'b_v':-0.18,'letter':'alpha','constell':'Tel','desigNo':'','bsNo':'6897','serialNo':283,'main':true,'letterLabel':{'vtr':{'x':0.9793730080328743,'y':0.18788958899470293,'z':0.0743371608553988},'orthogVtr':{'x':0.18306299253974984,'y':-0.6693271075168064,'z':-0.7200619167165956},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9929943151633482,'y':-0.11816213460018955,'z':0},'orthogVtr':{'x':-0.08152201024411745,'y':0.6850831952807918,'z':0.7238889261410336},'minZoom':0.5}},{'longitude':105.60416666666667,'latitude':-27.960833333333333,'magnitude':3.49,'b_v':1.73,'letter':'sigma','constell':'CMa','desigNo':'22','bsNo':'2646','serialNo':284,'main':true,'letterLabel':{'vtr':{'x':0.18700971741058176,'y':0.8373288299360887,'z':-0.5137195695628842},'orthogVtr':{'x':-0.9531937116613078,'y':0.2811464749172965,'z':0.11125829268381544},'minZoom':1.8},'shortNameLabel':{'vtr':{'x':-0.1202105789125219,'y':0.8832516951866385,'z':-0.45322826441810266},'orthogVtr':{'x':-0.9638984921007825,'y':0.005417817871668007,'z':0.2662148458958422},'minZoom':0.5}},{'longitude':342.57708333333335,'latitude':66.29277777777777,'magnitude':3.5,'b_v':1.05,'letter':'iota','constell':'Cep','desigNo':'32','bsNo':'8694','main':true,'serialNo':285,'letterLabel':{'vtr':{'x':-0.6620825392016768,'y':0.36356039507164467,'z':-0.6553400265660643},'orthogVtr':{'x':0.6438049912075396,'y':-0.17169348045838867,'z':-0.7456785380204697},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9223198893208175,'y':-0.3864272528733383,'z':0},'orthogVtr':{'x':-0.04652071777944585,'y':-0.11103508604639585,'z':0.9927270684754974},'minZoom':0.5}},{'longitude':102.62375,'latitude':-32.52972222222222,'magnitude':3.5,'b_v':-0.12,'letter':'kappa','constell':'CMa','desigNo':'13','bsNo':'2538','serialNo':286,'main':true,'letterLabel':{'vtr':{'x':0.5727059604765757,'y':-0.7390217175726477,'z':0.3547601778534011},'orthogVtr':{'x':0.7987840757072497,'y':0.4058149460526327,'z':-0.4441376250182071},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5727059604765757,'y':-0.7390217175726477,'z':0.3547601778534011},'orthogVtr':{'x':0.7987840757072497,'y':0.4058149460526327,'z':-0.4441376250182071},'minZoom':0.5}},{'longitude':110.29166666666667,'latitude':21.948611111111113,'magnitude':3.5,'b_v':0.37,'letter':'delta','constell':'Gem','desigNo':'55','bsNo':'2777','serialNo':287,'main':true,'letterLabel':{'vtr':{'x':-0.8712164816858999,'y':-0.476671806144914,'z':0.11732787931854732},'orthogVtr':{'x':0.3708297829808683,'y':-0.7956609536592476,'z':-0.4789665112264313},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.757967933681687,'y':0.6522918146890345,'z':0},'orthogVtr':{'x':-0.5674658557279985,'y':0.6593995393091232,'z':0.49312751914875597},'minZoom':0.5}},{'longitude':299.88375,'latitude':19.540555555555557,'magnitude':3.51,'b_v':1.57,'letter':'gamma','constell':'Sge','desigNo':'12','bsNo':'7635','serialNo':288,'main':true,'letterLabel':{'vtr':{'x':0.7039631700242993,'y':0.4167400686932996,'z':-0.5751204833726962},'orthogVtr':{'x':0.5328815834685187,'y':-0.8452543144398439,'z':0.03977891301825329},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7637201151594647,'y':0.3104981500813186,'z':-0.5659703918906829},'orthogVtr':{'x':0.44301073627101895,'y':-0.889785389703464,'z':0.109651483432119},'minZoom':0.5}},{'longitude':342.7125,'latitude':24.694444444444446,'magnitude':3.51,'b_v':0.93,'letter':'mu','constell':'Peg','desigNo':'48','bsNo':'8684','serialNo':289,'main':true,'letterLabel':{'vtr':{'x':-0.13762051616213133,'y':0.7231647086989308,'z':-0.6768259729233648},'orthogVtr':{'x':0.47801112050061323,'y':-0.5499941159957239,'z':-0.6848443918495869},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.10812931688415384,'y':-0.6881752285624675,'z':0.7174419179439978},'orthogVtr':{'x':-0.4855327884099585,'y':0.593191013359544,'z':0.6421700188021298},'minZoom':0.5}},{'longitude':56.022083333333335,'latitude':-9.705277777777777,'magnitude':3.52,'b_v':0.92,'letter':'delta','constell':'Eri','desigNo':'23','bsNo':'1136','serialNo':290,'main':true,'letterLabel':{'vtr':{'x':-0.42007797244146633,'y':0.7902721872595005,'z':-0.4460990552708576},'orthogVtr':{'x':-0.7211598707532392,'y':-0.5891100017187939,'z':-0.36452413732159694},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8345855688926768,'y':-0.11361617210761302,'z':-0.5390345940955},'orthogVtr':{'x':0.001997576393755557,'y':-0.9791180161332167,'z':0.20328285754560227},'minZoom':0.5}},{'longitude':284.6933333333333,'latitude':-21.08222222222222,'magnitude':3.52,'b_v':1.15,'letter':'xi^2','constell':'Sgr','desigNo':'37','bsNo':'7150','serialNo':291,'main':true,'letterLabel':{'vtr':{'x':-0.8955602410335508,'y':0.27947357032637266,'z':0.34621724129361114},'orthogVtr':{'x':0.37677613951330935,'y':0.8902275957702698,'z':0.25599720393498915},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8816630186881331,'y':0.31080821640411277,'z':0.35506136665852983},'orthogVtr':{'x':0.4082385651850557,'y':0.8797777568213344,'z':0.243582373126768},'minZoom':0.5}},{'longitude':332.7708333333333,'latitude':6.2844444444444445,'magnitude':3.52,'b_v':0.09,'letter':'theta','constell':'Peg','desigNo':'26','bsNo':'8450','serialNo':292,'main':true,'letterLabel':{'vtr':{'x':0.12291186291695332,'y':-0.9924175905103072,'z':0},'orthogVtr':{'x':-0.45135258724679456,'y':-0.05590044741383899,'z':0.8905930507052914},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.12291186291695332,'y':-0.9924175905103072,'z':0},'orthogVtr':{'x':-0.45135258724679456,'y':-0.05590044741383899,'z':0.8905930507052914},'minZoom':0.5}},{'longitude':149.36958333333334,'latitude':-54.651666666666664,'magnitude':3.52,'b_v':-0.07,'letter':'phi','constell':'Vel','desigNo':'','bsNo':'3940','serialNo':293,'main':true,'letterLabel':{'vtr':{'x':-0.8289735245631055,'y':0.3476144885441735,'z':0.4381404602722682},'orthogVtr':{'x':0.2549035166190564,'y':-0.4624710987947577,'z':0.8492023787029852},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8535751983013724,'y':0.520969654437543,'z':0},'orthogVtr':{'x':-0.15356525666996443,'y':-0.25160677459377945,'z':0.9555688059592586},'minZoom':0.5}},{'longitude':282.6816666666667,'latitude':33.38388888888889,'magnitude':3.52,'b_v':0,'letter':'beta','constell':'Lyr','desigNo':'10','bsNo':'7106','main':true,'serialNo':294,'letterLabel':{'vtr':{'x':-0.9419090940650284,'y':-0.138925270644344,'z':0.30578918832096263},'orthogVtr':{'x':-0.28143232145750124,'y':0.8233645281734605,'z':-0.49281507909634464},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9546463338608143,'y':-0.09813629163875659,'z':0.2811043320717409},'orthogVtr':{'x':-0.23462154694202228,'y':0.829215680834186,'z':-0.5073007829377263},'minZoom':0.5}},{'longitude':145.52083333333334,'latitude':9.811944444444444,'magnitude':3.52,'b_v':0.52,'letter':'omicron','constell':'Leo','desigNo':'14','bsNo':'3852','serialNo':295,'main':true,'letterLabel':{'vtr':{'x':-0.08111692549026847,'y':-0.9800777405384881,'z':-0.18129442048771938},'orthogVtr':{'x':0.5776078804151711,'y':0.10201164838224705,'z':-0.8099152795673323},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.2053295532695423,'y':0.9786928908263971,'z':0},'orthogVtr':{'x':-0.5459401008103643,'y':0.11453811309150005,'z':0.8299580874818971},'minZoom':0.5}},{'longitude':124.36583333333333,'latitude':9.130555555555556,'magnitude':3.53,'b_v':1.48,'letter':'beta','constell':'Cnc','desigNo':'17','bsNo':'3249','serialNo':296,'main':true,'letterLabel':{'vtr':{'x':0.27384287298409965,'y':0.961774443887866,'z':0},'orthogVtr':{'x':-0.7838377449997026,'y':0.22317954215585567,'z':0.5794732793467565},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.27384287298409965,'y':0.961774443887866,'z':0},'orthogVtr':{'x':-0.7838377449997026,'y':0.22317954215585567,'z':0.5794732793467565},'minZoom':0.5}},{'longitude':67.41041666666666,'latitude':19.217777777777776,'magnitude':3.53,'b_v':1.01,'letter':'epsilon','constell':'Tau','desigNo':'74','bsNo':'1409','serialNo':297,'main':true,'letterLabel':{'vtr':{'x':-0.5970446455012881,'y':0.8004023413747687,'z':0.05379389556473235},'orthogVtr':{'x':-0.7155212536107348,'y':-0.5010089968701803,'z':-0.4868463008860784},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.3636760927370534,'y':0.9113596044039497,'z':0.19277803565807586},'orthogVtr':{'x':-0.8580050539839181,'y':-0.24713881622228523,'z':-0.45027739545118295},'minZoom':0.5}},{'longitude':237.63375,'latitude':-3.4827777777777778,'magnitude':3.54,'b_v':-0.04,'letter':'mu','constell':'Ser','desigNo':'32','bsNo':'5881','serialNo':298,'main':true,'letterLabel':{'vtr':{'x':-0.11296106055121458,'y':0.9935994156596234,'z':0},'orthogVtr':{'x':0.8376872114959949,'y':0.09523559930634373,'z':0.5377827780069065},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.11296106055121458,'y':0.9935994156596234,'z':0},'orthogVtr':{'x':0.8376872114959949,'y':0.09523559930634373,'z':0.5377827780069065},'minZoom':0.5}},{'longitude':173.46666666666667,'latitude':-31.954722222222223,'magnitude':3.54,'b_v':0.95,'letter':'xi','constell':'Hya','desigNo':'','bsNo':'4450','serialNo':299,'main':true,'letterLabel':{'vtr':{'x':-0.3514615722481573,'y':0.6776215374784736,'z':-0.6459905689545032},'orthogVtr':{'x':-0.40730711337949665,'y':0.5106120052994114,'z':0.7572161484243292},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5317325767375147,'y':0.8469123135461444,'z':0},'orthogVtr':{'x':-0.08176055413686825,'y':-0.051333236548006915,'z':0.9953291468718972},'minZoom':0.5}},{'longitude':264.6475,'latitude':-15.408055555555556,'magnitude':3.54,'b_v':0.26,'letter':'xi','constell':'Ser','desigNo':'55','bsNo':'6561','serialNo':300,'main':true,'letterLabel':{'vtr':{'x':-0.32060179998551747,'y':-0.9047372934497535,'z':-0.2804726647772668},'orthogVtr':{'x':-0.9429353383342898,'y':0.3329540060822848,'z':0.0038180563322897654},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9472119091922632,'y':0.32060817064502256,'z':0},'orthogVtr':{'x':0.3077371695422945,'y':0.9091855373028541,'z':0.2804986510509767},'minZoom':0.5}},{'longitude':302.6066666666667,'latitude':-66.13527777777779,'magnitude':3.55,'b_v':0.75,'letter':'delta','constell':'Pav','desigNo':'','bsNo':'7665','serialNo':301,'main':true,'letterLabel':{'vtr':{'x':-0.8042382889092511,'y':0.02948291168458983,'z':0.5935752122274974},'orthogVtr':{'x':0.5528746054650472,'y':0.4035029054733208,'z':0.7290508047498863},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8042382889092511,'y':0.02948291168458983,'z':0.5935752122274974},'orthogVtr':{'x':0.5528746054650472,'y':0.4035029054733208,'z':0.7290508047498863},'minZoom':0.5}},{'longitude':215.13291666666666,'latitude':-46.13805555555555,'magnitude':3.55,'b_v':-0.18,'letter':'iota','constell':'Lup','desigNo':'','bsNo':'5354','serialNo':302,'main':true,'letterLabel':{'vtr':{'x':-0.04053191327766931,'y':-0.45899015441598484,'z':-0.8875163109234905},'orthogVtr':{'x':-0.8229364069178756,'y':0.5191054281738072,'z':-0.2308792424831323},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7233940332508467,'y':-0.20370687488410422,'z':0.6597003727314582},'orthogVtr':{'x':0.3944213970893628,'y':-0.6623034927699486,'z':-0.6370132219842867},'minZoom':0.5}},{'longitude':86.9375,'latitude':-14.816666666666666,'magnitude':3.55,'b_v':0.1,'letter':'zeta','constell':'Lep','desigNo':'14','bsNo':'1998','serialNo':303,'main':true,'letterLabel':{'vtr':{'x':0.9986073894310018,'y':0.02363569267640042,'z':0.04716604504838932},'orthogVtr':{'x':-0.010755519866946096,'y':0.9664600681634646,'z':-0.2565916121736313},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9964227627382934,'y':-0.05154884841761756,'z':0.06696561896827749},'orthogVtr':{'x':0.06688854409235837,'y':0.9653737232541806,'z':-0.25214975137716356},'minZoom':0.5}},{'longitude':275.185,'latitude':72.74,'magnitude':3.55,'b_v':0.49,'letter':'chi','constell':'Dra','desigNo':'44','bsNo':'6927','main':true,'serialNo':304,'letterLabel':{'vtr':{'x':-0.27650997842869013,'y':0.29115239595235004,'z':-0.9158452457487408},'orthogVtr':{'x':0.9606368914410276,'y':0.0571495377049666,'z':-0.2718652113504566},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.19133736660019068,'y':0.29503807672654764,'z':-0.9361316923510304},'orthogVtr':{'x':0.9811579982401507,'y':0.03143756686172171,'z':-0.19063226872488215},'minZoom':0.5}},{'longitude':64.63916666666667,'latitude':-33.75666666666667,'magnitude':3.55,'b_v':-0.11,'constell':'Eri','desigNo':'41','bsNo':'1347','serialNo':305,'main':true,'letterLabel':{'vtr':{'x':0.9279352657075032,'y':0.11554123990491255,'z':0.3543816650697111},'orthogVtr':{'x':0.11011424378857224,'y':0.823337375939461,'z':-0.5567678319515179},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5445185648135928,'y':-0.5299835192344976,'z':0.6500899952415526},'orthogVtr':{'x':0.7594001162774,'y':0.6405869824445847,'z':-0.11384103530982428},'minZoom':0.5}},{'longitude':5.08,'latitude':-8.726944444444445,'magnitude':3.56,'b_v':1.21,'letter':'iota','constell':'Cet','desigNo':'8','bsNo':'74','serialNo':306,'main':true,'letterLabel':{'vtr':{'x':-0.15231013163338034,'y':-0.9883327495341954,'z':0},'orthogVtr':{'x':0.08650033702069458,'y':-0.013330406914233206,'z':0.9961626332817385},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.15231013163338034,'y':-0.9883327495341954,'z':0},'orthogVtr':{'x':0.08650033702069458,'y':-0.013330406914233206,'z':0.9961626332817385},'minZoom':0.5}},{'longitude':34.28375,'latitude':-51.431666666666665,'magnitude':3.56,'b_v':-0.12,'letter':'phi','constell':'Eri','desigNo':'','bsNo':'674','serialNo':307,'main':true,'letterLabel':{'vtr':{'x':-0.7828570142957525,'y':-0.2623771235664749,'z':-0.564174742608106},'orthogVtr':{'x':-0.34896622919245046,'y':-0.5655485045963496,'z':0.7472465856944646},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5212100356322762,'y':0.03951801905123828,'z':-0.8525130057227676},'orthogVtr':{'x':-0.6804282715356994,'y':-0.6221938541905172,'z':0.38715910825200806},'minZoom':0.5}},{'longitude':253.38083333333333,'latitude':-38.045833333333334,'magnitude':3.56,'b_v':-0.21,'letter':'mu^2','constell':'Sco','desigNo':'','bsNo':'6252','serialNo':308,'main':true,'letterLabel':{'vtr':{'x':0.8642149880618848,'y':0.23126541802716943,'z':0.4468207256091808},'orthogVtr':{'x':0.449889614922248,'y':-0.7527954030726199,'z':-0.4805189023314723},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8589705991861807,'y':0.23992931121023436,'z':0.4523311125225816},'orthogVtr':{'x':0.45982357588473666,'y':-0.7500790212269187,'z':-0.4753353984039496},'minZoom':0.5}},{'longitude':170.05416666666667,'latitude':-14.873333333333333,'magnitude':3.56,'b_v':1.11,'letter':'delta','constell':'Crt','desigNo':'12','bsNo':'4382','serialNo':309,'main':true,'letterLabel':{'vtr':{'x':-0.1589554759950066,'y':0.8802658680842218,'z':-0.4470628122950199},'orthogVtr':{'x':-0.2616964687044775,'y':0.39905618946314575,'z':0.8787884363820228},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.26033584424081635,'y':0.9655181242231661,'z':0},'orthogVtr':{'x':-0.16117423269435496,'y':-0.04345794127076619,'z':0.985968698314451},'minZoom':0.5}},{'longitude':116.37541666666667,'latitude':24.354722222222225,'magnitude':3.57,'b_v':0.93,'letter':'kappa','constell':'Gem','desigNo':'77','bsNo':'2985','serialNo':310,'main':true,'letterLabel':{'vtr':{'x':-0.1466667096306406,'y':-0.9102582418125336,'z':-0.3871935039466401},'orthogVtr':{'x':0.9026035303634417,'y':0.036997902342556496,'z':-0.42887996245768184},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.13481690237201838,'y':-0.9096947517428325,'z':-0.39278475210522135},'orthogVtr':{'x':0.9044493681645428,'y':0.04893230238748672,'z':-0.4237652300623769},'minZoom':0.5}},{'longitude':218.14583333333334,'latitude':30.29527777777778,'magnitude':3.57,'b_v':1.3,'letter':'rho','constell':'Boo','desigNo':'25','bsNo':'5429','serialNo':311,'main':true,'letterLabel':{'vtr':{'x':-0.15103206487400123,'y':0.6149455441004784,'z':-0.7739711190805907},'orthogVtr':{'x':0.7183944468457221,'y':0.6061069668361574,'z':0.3413850663018263},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.11914384389744981,'y':0.6411245735665545,'z':-0.758131931546511},'orthogVtr':{'x':0.7243659367613966,'y':0.578345016945304,'z':0.3752479594006083},'minZoom':0.5}},{'longitude':230.73041666666666,'latitude':-36.32361111111111,'magnitude':3.57,'b_v':1.53,'letter':'phi^1','constell':'Lup','desigNo':'','bsNo':'5705','serialNo':312,'main':true,'letterLabel':{'vtr':{'x':-0.6592167584265473,'y':0.7349545038977869,'z':0.15898157946741204},'orthogVtr':{'x':0.5525937450010976,'y':0.33010451093340276,'z':0.7652915554526136},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4884193713324042,'y':0.796294145396934,'z':0.3568783430159718},'orthogVtr':{'x':0.7080770433448623,'y':0.12264886850187295,'z':0.6954021539679096},'minZoom':0.5}},{'longitude':136.20291666666665,'latitude':47.086111111111116,'magnitude':3.57,'b_v':0.01,'letter':'kappa','constell':'UMa','desigNo':'12','bsNo':'3594','serialNo':313,'main':true,'letterLabel':{'vtr':{'x':-0.8613099459458107,'y':-0.48881213066648554,'z':0.13859248871463095},'orthogVtr':{'x':0.12885268737457772,'y':-0.47400987594671773,'z':-0.8710405400791208},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8486782368201107,'y':-0.5242003392846614,'z':0.07042197555986374},'orthogVtr':{'x':0.19545610345224404,'y':-0.4345534096927305,'z':-0.8791815772340135},'minZoom':0.5}},{'longitude':304.7558333333333,'latitude':-12.489444444444443,'magnitude':3.58,'b_v':0.88,'letter':'alpha^2','constell':'Cap','desigNo':'6','bsNo':'7754','serialNo':314,'main':true,'letterLabel':{'vtr':{'x':0.7614089346854681,'y':-0.25347920699644705,'z':-0.596661315824642},'orthogVtr':{'x':-0.3323613380642271,'y':-0.9428573662014514,'z':-0.023578124603526235},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.13383686008143802,'y':0.9295745250199763,'z':0.3434805632309153},'orthogVtr':{'x':0.8199361680900802,'y':0.298534627495321,'z':-0.48844831501806374},'minZoom':0.5}},{'longitude':109.77458333333334,'latitude':16.5075,'magnitude':3.58,'b_v':0.11,'letter':'lambda','constell':'Gem','desigNo':'54','bsNo':'2763','serialNo':315,'main':true,'letterLabel':{'vtr':{'x':-0.8628636117366129,'y':0.3019692108677695,'z':0.40531590547219365},'orthogVtr':{'x':-0.38761672890692156,'y':-0.9099882264117817,'z':-0.14722329728489958},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6589143267019607,'y':0.7522179937138579,'z':0},'orthogVtr':{'x':-0.6786842056910974,'y':0.5945015277131438,'z':0.43122579061575406},'minZoom':0.5}},{'longitude':79.61416666666666,'latitude':-6.826666666666666,'magnitude':3.59,'b_v':-0.12,'letter':'tau','constell':'Ori','desigNo':'20','bsNo':'1735','serialNo':316,'main':true,'letterLabel':{'vtr':{'x':-0.12109719328571972,'y':0.9824647302497981,'z':-0.14176926180774288},'orthogVtr':{'x':-0.9763683945801316,'y':-0.14364506071658634,'z':-0.1614647162594494},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6909925559377117,'y':0.6914427405995035,'z':-0.21079901354350863},'orthogVtr':{'x':-0.7003492413041734,'y':-0.712585283404961,'z':-0.04163116716284236},'minZoom':0.5}},{'longitude':24.769166666666667,'latitude':48.71611111111111,'magnitude':3.59,'b_v':1.28,'constell':'And','desigNo':'51','bsNo':'464','serialNo':317,'main':true,'letterLabel':{'vtr':{'x':0.37968897419994846,'y':-0.5705812357419485,'z':-0.7281986928649227},'orthogVtr':{'x':0.7049293678909521,'y':-0.3313010947699352,'z':0.6271476468018559},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7819174137965245,'y':-0.6233820321454211,'z':0},'orthogVtr':{'x':0.17232030886085667,'y':0.2161439427206132,'z':0.96103460248801},'minZoom':0.5}},{'longitude':86.29833333333333,'latitude':-22.44361111111111,'magnitude':3.59,'b_v':0.48,'letter':'gamma','constell':'Lep','desigNo':'13','bsNo':'1983','serialNo':318,'main':true,'letterLabel':{'vtr':{'x':0.45531185833042354,'y':-0.8118496024052733,'z':0.365501483906832},'orthogVtr':{'x':0.8883301534198009,'y':0.44175654251338065,'z':-0.12538219838468592},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.45531185833042354,'y':-0.8118496024052733,'z':0.365501483906832},'orthogVtr':{'x':0.8883301534198009,'y':0.44175654251338065,'z':-0.12538219838468592},'minZoom':0.5}},{'longitude':177.90166666666667,'latitude':1.666111111111111,'magnitude':3.59,'b_v':0.52,'letter':'beta','constell':'Vir','desigNo':'5','bsNo':'4540','serialNo':319,'main':true,'letterLabel':{'vtr':{'x':-0.04036960031489235,'y':-0.14194434442215328,'z':0.9890511101338398},'orthogVtr':{'x':-0.023561643546484264,'y':-0.9894475458135774,'z':-0.14296294287988426},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.029094519132339014,'y':0.9995766648719137,'z':0},'orthogVtr':{'x':-0.03658366620028259,'y':0.0010648349582386626,'z':0.9993300263145595},'minZoom':0.5}},{'longitude':185.57875,'latitude':-60.49777777777778,'magnitude':3.59,'b_v':1.39,'letter':'epsilon','constell':'Cru','desigNo':'','bsNo':'4700','serialNo':320,'main':true,'letterLabel':{'vtr':{'x':0.4595276107903312,'y':-0.2113290734819639,'z':0.8626554338915304},'orthogVtr':{'x':0.740683502894423,'y':-0.44480808371218733,'z':-0.5035213175272117},'minZoom':1.4},'shortNameLabel':{'vtr':{'x':0.8220819711569274,'y':-0.47981158628829945,'z':-0.3065323381998159},'orthogVtr':{'x':-0.2897566379522018,'y':0.1108830478385186,'z':-0.9506555845650292},'minZoom':0.5}},{'longitude':130.19875,'latitude':-52.98444444444444,'magnitude':3.6,'b_v':-0.17,'letter':'omicron','constell':'Vel','desigNo':'','bsNo':'3447','serialNo':321,'main':true,'letterLabel':{'vtr':{'x':-0.2460977303428968,'y':0.5708615843569665,'z':-0.7832962138460321},'orthogVtr':{'x':-0.8879440123293191,'y':0.19120505297001827,'z':0.41832530247074784},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.2316987152138164,'y':0.5676931882906402,'z':-0.7899621189251258},'orthogVtr':{'x':-0.8918096025944563,'y':0.2004164782252729,'z':0.40559692796678937},'minZoom':0.5}},{'longitude':21.22458333333333,'latitude':-8.093333333333334,'magnitude':3.6,'b_v':1.07,'letter':'theta','constell':'Cet','desigNo':'45','bsNo':'402','serialNo':322,'main':true,'letterLabel':{'vtr':{'x':-0.258233915675816,'y':0.4641931180289624,'z':-0.8472543856300098},'orthogVtr':{'x':-0.28565713259330716,'y':-0.8744735794184808,'z':-0.3920407650966919},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.258233915675816,'y':0.4641931180289624,'z':-0.8472543856300098},'orthogVtr':{'x':-0.28565713259330716,'y':-0.8744735794184808,'z':-0.3920407650966919},'minZoom':0.5}},{'longitude':142.84791666666666,'latitude':-40.54416666666666,'magnitude':3.6,'b_v':0.37,'letter':'psi','constell':'Vel','desigNo':'','bsNo':'3786','serialNo':323,'main':true,'letterLabel':{'vtr':{'x':0.4785944362298036,'y':-0.7583631174868283,'z':0.4425299398295393},'orthogVtr':{'x':0.6356963077626687,'y':-0.04838552094904533,'z':-0.7704213429412503},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7316317294553623,'y':0.6817000898152762,'z':0},'orthogVtr':{'x':-0.31285370790094347,'y':-0.3357689148025703,'z':0.8884716052327928},'minZoom':0.5}},{'longitude':103.48541666666667,'latitude':33.93861111111111,'magnitude':3.6,'b_v':0.1,'letter':'theta','constell':'Gem','desigNo':'34','bsNo':'2540','serialNo':324,'main':true,'letterLabel':{'vtr':{'x':0.9448760499135667,'y':0.3274282368699056,'z':0},'orthogVtr':{'x':-0.2641568528470538,'y':0.7622906505002905,'z':0.5908757240349141},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9448760499135667,'y':0.3274282368699056,'z':0},'orthogVtr':{'x':-0.2641568528470538,'y':0.7622906505002905,'z':0.5908757240349141},'minZoom':0.5}},{'longitude':263.17041666666665,'latitude':-60.69611111111111,'magnitude':3.6,'b_v':-0.1,'letter':'delta','constell':'Ara','desigNo':'','bsNo':'6500','serialNo':325,'main':true,'letterLabel':{'vtr':{'x':-0.9258506105276934,'y':-0.13491686660308808,'z':-0.3529845408675881},'orthogVtr':{'x':-0.373380617927456,'y':0.47047907437029246,'z':0.7995225792532591},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9258506105276934,'y':-0.13491686660308808,'z':-0.3529845408675881},'orthogVtr':{'x':-0.373380617927456,'y':0.47047907437029246,'z':0.7995225792532591},'minZoom':0.5}},{'longitude':234.5225,'latitude':-28.191944444444445,'magnitude':3.6,'b_v':1.36,'letter':'upsilon','constell':'Lib','desigNo':'39','bsNo':'5794','serialNo':326,'main':true,'letterLabel':{'vtr':{'x':-0.4407738755898162,'y':0.8612912310626193,'z':0.2527761972420885},'orthogVtr':{'x':0.7375995641605758,'y':0.18705690135212302,'z':0.648811681928332},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4407738755898162,'y':0.8612912310626193,'z':0.2527761972420885},'orthogVtr':{'x':0.7375995641605758,'y':0.18705690135212302,'z':0.648811681928332},'minZoom':0.5}},{'longitude':195.87541666666667,'latitude':-71.64277777777778,'magnitude':3.61,'b_v':1.19,'letter':'delta','constell':'Mus','desigNo':'','bsNo':'4923','serialNo':327,'main':true,'letterLabel':{'vtr':{'x':0.653209440137648,'y':-0.14095755835472976,'z':0.7439411227091385},'orthogVtr':{'x':0.6939393926629175,'y':-0.2816353829683668,'z':-0.6626685675138687},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4882359595399485,'y':-0.07692271220765094,'z':0.8693149855827431},'orthogVtr':{'x':0.818449815924241,'y':-0.30540206047714313,'z':-0.4866923877254415},'minZoom':0.5}},{'longitude':266.86333333333334,'latitude':-64.72972222222222,'magnitude':3.61,'b_v':1.16,'letter':'eta','constell':'Pav','desigNo':'','bsNo':'6582','serialNo':328,'main':true,'letterLabel':{'vtr':{'x':-0.7274138993255778,'y':-0.27710824256582567,'z':-0.6277579477553733},'orthogVtr':{'x':-0.6858012853959383,'y':0.3247230822491285,'z':0.6513305741356725},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4578970012637999,'y':-0.38869130566565735,'z':-0.7995307405807148},'orthogVtr':{'x':-0.8886983291400872,'y':-0.17650248480749853,'z':-0.4231573615576083},'minZoom':0.5}},{'longitude':152.86041666666668,'latitude':-12.44111111111111,'magnitude':3.61,'b_v':1.01,'letter':'lambda','constell':'Hya','desigNo':'41','bsNo':'3994','serialNo':329,'main':true,'letterLabel':{'vtr':{'x':-0.494741544464503,'y':0.3932662396448381,'z':0.774966108250217},'orthogVtr':{'x':-0.008224111964816289,'y':-0.8938282663489053,'z':0.44833402085732993},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.24062795373952842,'y':0.9706174261155253,'z':0},'orthogVtr':{'x':-0.4323598266673941,'y':-0.1071872991055998,'z':0.8953076919107685},'minZoom':0.5}},{'longitude':42.754583333333336,'latitude':27.331666666666667,'magnitude':3.61,'b_v':-0.1,'constell':'Ari','desigNo':'41','bsNo':'838','serialNo':330,'main':true,'letterLabel':{'vtr':{'x':-0.5646670494796976,'y':-0.2364029190311563,'z':-0.7907368608490699},'orthogVtr':{'x':0.5056278746691144,'y':-0.856331453448439,'z':-0.10505662374395322},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5755912388654469,'y':-0.8177375653235822,'z':0},'orthogVtr':{'x':0.4931563141153653,'y':0.34712414573208145,'z':0.7976851993724843},'minZoom':0.5}},{'longitude':51.439166666666665,'latitude':9.089444444444444,'magnitude':3.61,'b_v':0.89,'letter':'omicron','constell':'Tau','desigNo':'1','bsNo':'1030','serialNo':331,'main':true,'letterLabel':{'vtr':{'x':0.5692711999810102,'y':-0.7666486973230731,'z':0.29695130200929554},'orthogVtr':{'x':0.5450395501332269,'y':0.6223289400495787,'z':0.5618172115264337},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5744065404783658,'y':-0.7607216312249098,'z':0.30225771461153456},'orthogVtr':{'x':0.5396248109500944,'y':0.6295602707580183,'z':0.5589802580504661},'minZoom':0.5}},{'longitude':116.46958333333333,'latitude':-38.011944444444445,'magnitude':3.62,'b_v':1.71,'constell':'','desigNo':'','bsNo':'3017','serialNo':332,'main':false,'letterLabel':{'vtr':{'x':0.7599031069441794,'y':0.25261612747699,'z':-0.5989427019299193},'orthogVtr':{'x':-0.5470118471939673,'y':0.7462866419774373,'z':-0.3792549103643671},'minZoom':1.8}},{'longitude':23.105833333333333,'latitude':15.435555555555556,'magnitude':3.62,'b_v':0.97,'letter':'eta','constell':'Psc','desigNo':'99','bsNo':'437','serialNo':333,'main':true,'letterLabel':{'vtr':{'x':0.12603004365981477,'y':-0.9259163662549293,'z':-0.35608329193655375},'orthogVtr':{'x':0.44502501040187104,'y':-0.26803124140919043,'z':0.8544659114004858},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.287519060714302,'y':-0.9577749160037371,'z':0},'orthogVtr':{'x':0.36230321764241313,'y':0.10876154625656274,'z':0.925692878087455},'minZoom':0.5}},{'longitude':253.95458333333335,'latitude':-42.38972222222222,'magnitude':3.62,'b_v':1.39,'letter':'zeta^2','constell':'Sco','desigNo':'','bsNo':'6271','serialNo':334,'main':true,'letterLabel':{'vtr':{'x':-0.6282318184317569,'y':-0.4658494644380439,'z':-0.623144492708325},'orthogVtr':{'x':-0.750766847503999,'y':0.5731310552243472,'z':0.3284355861144363},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6282318184317569,'y':-0.4658494644380439,'z':-0.623144492708325},'orthogVtr':{'x':-0.750766847503999,'y':0.5731310552243472,'z':0.3284355861144363},'minZoom':0.5}},{'longitude':57.55166666666667,'latitude':24.105555555555558,'magnitude':3.62,'b_v':-0.07,'constell':'Tau','desigNo':'27','bsNo':'1178','serialNo':335,'main':true,'letterLabel':{'vtr':{'x':-0.8053017911912383,'y':-0.1266684583982673,'z':-0.5791753851392424},'orthogVtr':{'x':0.334117038413723,'y':-0.9039629677773766,'z':-0.26686468018222353},'minZoom':3.4},'shortNameLabel':{'vtr':{'x':-0.7835996192696351,'y':-0.18115646585392647,'z':-0.5942675925538917},'orthogVtr':{'x':0.38225228179130216,'y':-0.8946375133791291,'z':-0.23131561278943505},'minZoom':2.4}},{'longitude':345.6825,'latitude':42.42027777777778,'magnitude':3.62,'b_v':-0.1,'letter':'omicron','constell':'And','desigNo':'1','bsNo':'8762','serialNo':336,'main':true,'letterLabel':{'vtr':{'x':0.2989424213348597,'y':-0.0592333576315736,'z':-0.9524310148615182},'orthogVtr':{'x':0.6316619049139756,'y':-0.7358364157212552,'z':0.2440246036344366},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6860933410670835,'y':-0.7275135238216583,'z':0},'orthogVtr':{'x':-0.13281287865454783,'y':-0.12525132340381537,'z':0.9831952223485859},'minZoom':0.5}},{'longitude':176.61083333333335,'latitude':-66.82583333333334,'magnitude':3.63,'b_v':0.16,'letter':'lambda','constell':'Mus','desigNo':'','bsNo':'4520','serialNo':337,'main':true,'letterLabel':{'vtr':{'x':0.7652192469432898,'y':-0.31275243998293023,'z':-0.5626947799582545},'orthogVtr':{'x':-0.5100165494636287,'y':0.23885093137284755,'z':-0.8263373111844444},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8614246563376821,'y':-0.37672253818668483,'z':0.34062837620446135},'orthogVtr':{'x':0.32190827586868226,'y':-0.11377163686585001,'z':-0.9399101428179809},'minZoom':0.5}},{'longitude':309.5925,'latitude':14.656666666666666,'magnitude':3.64,'b_v':0.43,'letter':'beta','constell':'Del','desigNo':'6','bsNo':'7882','serialNo':338,'main':true,'letterLabel':{'vtr':{'x':-0.5008935973651224,'y':-0.6044955556049095,'z':0.6194277418493123},'orthogVtr':{'x':-0.6073956480902013,'y':0.7553560785682697,'z':0.2459831726989678},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.12261447440841361,'y':-0.9045296225659372,'z':0.4084015824727807},'orthogVtr':{'x':-0.7776821714979953,'y':0.34322564600688776,'z':0.5266940250822263},'minZoom':0.5}},{'longitude':337.43291666666664,'latitude':0.06999999999999999,'magnitude':3.65,'b_v':0.41,'letter':'zeta^2','constell':'Aqr','desigNo':'55','bsNo':'8559','serialNo':339,'main':true,'letterLabel':{'vtr':{'x':-0.08170539197577735,'y':-0.9764423054857638,'z':0.19971142425943184},'orthogVtr':{'x':-0.37496796932371157,'y':0.2157751872506009,'z':0.90157644742319},'minZoom':0.7},'shortNameLabel':{'vtr':{'x':0.3043287044018743,'y':0.6068810382379564,'z':-0.7342202973932938},'orthogVtr':{'x':0.2337964686939047,'y':-0.7947917417805785,'z':-0.5600404435606898},'minZoom':0.5}},{'longitude':271.99833333333333,'latitude':-50.08833333333334,'magnitude':3.65,'b_v':-0.1,'letter':'theta','constell':'Ara','desigNo':'','bsNo':'6743','serialNo':340,'main':true,'letterLabel':{'vtr':{'x':-0.09430050127497397,'y':-0.6401357185022,'z':-0.762452409896487},'orthogVtr':{'x':-0.9952923496501858,'y':0.04340855564011556,'z':0.08665354017610206},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9995748773255911,'y':-0.02915586766895597,'z':0},'orthogVtr':{'x':-0.01869519811151238,'y':0.6409430366152356,'z':0.7673607452704445},'minZoom':0.5}},{'longitude':236.74916666666667,'latitude':15.368055555555555,'magnitude':3.65,'b_v':0.07,'letter':'beta','constell':'Ser','desigNo':'28','bsNo':'5867','serialNo':341,'main':true,'letterLabel':{'vtr':{'x':-0.7099211287656988,'y':-0.6588193459646611,'z':-0.24893585582380964},'orthogVtr':{'x':-0.4652832518027617,'y':0.7040754455161047,'z':-0.5364599357017698},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8467092790619324,'y':-0.09788591444521111,'z':-0.5229739424709877},'orthogVtr':{'x':0.059664983252648976,'y':0.9592619617962707,'z':-0.2761459368236868},'minZoom':0.5}},{'longitude':65.19791666666667,'latitude':15.66861111111111,'magnitude':3.65,'b_v':0.98,'letter':'gamma','constell':'Tau','desigNo':'54','bsNo':'1346','serialNo':342,'main':true,'letterLabel':{'vtr':{'x':-0.31035300356208095,'y':-0.8583122166176924,'z':-0.40863327322284776},'orthogVtr':{'x':0.8605511367036117,'y':-0.4363034618771986,'z':0.2628517267816478},'minZoom':1.6},'shortNameLabel':{'vtr':{'x':0.8397978483453052,'y':-0.4883498572938556,'z':0.23717923769939545},'orthogVtr':{'x':0.3627765422632484,'y':0.8298041870961337,'z':0.42404975116281596},'minZoom':0.5}},{'longitude':143.2225,'latitude':62.98416666666667,'magnitude':3.65,'b_v':0.36,'constell':'UMa','desigNo':'23','bsNo':'3757','serialNo':343,'main':true,'letterLabel':{'vtr':{'x':0.4852927059530766,'y':-0.06791394639989032,'z':-0.8717102072553319},'orthogVtr':{'x':0.795059671264446,'y':0.44913102925825565,'z':0.4076290442133519},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9231541750978728,'y':0.38378791323106765,'z':0.022208256507620528},'orthogVtr':{'x':-0.12415820682401191,'y':0.24297700141356943,'z':0.9620534893977131},'minZoom':0.5}},{'longitude':232.13791666666665,'latitude':29.046111111111113,'magnitude':3.66,'b_v':0.32,'letter':'beta','constell':'CrB','desigNo':'3','bsNo':'5747','main':true,'serialNo':344,'letterLabel':{'vtr':{'x':-0.8196981582471039,'y':-0.10557258134603104,'z':-0.5629825569538023},'orthogVtr':{'x':0.20046981260627617,'y':0.867831330401796,'z':-0.45462142075209455},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8196981582471039,'y':-0.10557258134603104,'z':-0.5629825569538023},'orthogVtr':{'x':0.20046981260627617,'y':0.867831330401796,'z':-0.45462142075209455},'minZoom':0.5}},{'longitude':234.93375,'latitude':-29.834166666666665,'magnitude':3.66,'b_v':-0.18,'letter':'tau','constell':'Lib','desigNo':'40','bsNo':'5812','serialNo':345,'main':true,'letterLabel':{'vtr':{'x':0.33359479734833075,'y':-0.8659589760991568,'z':-0.37259839357601393},'orthogVtr':{'x':-0.8002067468286207,'y':-0.051160718190735976,'z':-0.597538068447663},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.33359479734833075,'y':-0.8659589760991568,'z':-0.37259839357601393},'orthogVtr':{'x':-0.8002067468286207,'y':-0.051160718190735976,'z':-0.597538068447663},'minZoom':0.5}},{'longitude':314.04125,'latitude':-58.38666666666666,'magnitude':3.67,'b_v':1.25,'letter':'beta','constell':'Ind','desigNo':'','bsNo':'7986','serialNo':346,'main':true,'letterLabel':{'vtr':{'x':0.46597968175599336,'y':-0.18357869241240202,'z':-0.865541333434017},'orthogVtr':{'x':-0.8062725330684072,'y':-0.4909865903552788,'z':-0.32993449427235166},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.46597968175599336,'y':-0.18357869241240202,'z':-0.865541333434017},'orthogVtr':{'x':-0.8062725330684072,'y':-0.4909865903552788,'z':-0.32993449427235166},'minZoom':0.5}},{'longitude':211.21583333333334,'latitude':64.2925,'magnitude':3.67,'b_v':-0.05,'letter':'alpha','constell':'Dra','desigNo':'11','bsNo':'5291','main':true,'serialNo':347,'letterLabel':{'vtr':{'x':0.2956444677711601,'y':-0.11489803615065489,'z':0.9483632162652821},'orthogVtr':{'x':-0.8803247730431893,'y':-0.41828334226154074,'z':0.2237573229035688},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9246900499441464,'y':0.3807207789631294,'z':0},'orthogVtr':{'x':0.0855901214599406,'y':-0.20788025781798136,'z':0.9744024474096944},'minZoom':0.5}},{'longitude':73.035,'latitude':5.633611111111111,'magnitude':3.68,'b_v':-0.16,'letter':'pi^4','constell':'Ori','desigNo':'3','bsNo':'1552','serialNo':348,'main':true,'letterLabel':{'vtr':{'x':-0.10602828181943125,'y':-0.9852982668045955,'z':-0.13396017649390957},'orthogVtr':{'x':0.9510197369066478,'y':-0.13982354207520076,'z':0.2757006294797952},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.20644870828547168,'y':-0.9648712669169133,'z':-0.16248805840864394},'orthogVtr':{'x':0.9343765126429657,'y':-0.24369393871154443,'z':0.25991113261348353},'minZoom':0.5}},{'longitude':297.0420833333333,'latitude':18.578611111111112,'magnitude':3.68,'b_v':1.31,'letter':'delta','constell':'Sge','desigNo':'7','bsNo':'7536','serialNo':349,'main':true,'letterLabel':{'vtr':{'x':-0.5833679439463427,'y':0.8121612761431295,'z':-0.008712262012848165},'orthogVtr':{'x':0.6884490768155479,'y':0.48875823299702026,'z':-0.5358668288945032},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7861436067632503,'y':-0.32676063771998143,'z':0.5246005291477497},'orthogVtr':{'x':-0.44301074359165493,'y':0.8897853867229091,'z':-0.10965147804171219},'minZoom':0.5}},{'longitude':347.5941666666667,'latitude':-21.077222222222222,'magnitude':3.68,'b_v':1.2,'constell':'Aqr','desigNo':'88','bsNo':'8812','serialNo':350,'main':true,'letterLabel':{'vtr':{'x':0.14872203568791859,'y':0.7415403288968219,'z':0.654216857563633},'orthogVtr':{'x':0.3839236640784498,'y':0.5663807573595462,'z':-0.7292567845782478},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.36707697507191783,'y':-0.9301905688470781,'z':0},'orthogVtr':{'x':-0.18646747199077762,'y':0.07358483074336024,'z':0.9797015640356197},'minZoom':0.5}},{'longitude':131.07416666666666,'latitude':-33.250277777777775,'magnitude':3.68,'b_v':-0.18,'letter':'alpha','constell':'Pyx','desigNo':'','bsNo':'3468','serialNo':351,'main':true,'letterLabel':{'vtr':{'x':-0.5820310960086746,'y':0.7925379821707522,'z':-0.1819982145397401},'orthogVtr':{'x':-0.5994371175452897,'y':-0.26693376563720544,'z':0.7546002298381149},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7063523634080109,'y':0.7078603949282071,'z':0},'orthogVtr':{'x':-0.44626381583092967,'y':-0.44531309178220774,'z':0.7762376291879887},'minZoom':0.5}},{'longitude':9.489166666666666,'latitude':53.99305555555556,'magnitude':3.69,'b_v':-0.2,'letter':'zeta','constell':'Cas','desigNo':'17','bsNo':'153','main':false,'serialNo':352,'letterLabel':{'vtr':{'x':0.8004289368553889,'y':-0.543423949097242,'z':0.25298997725623457},'orthogVtr':{'x':-0.15198700653639347,'y':0.2242703506956511,'z':0.9626020775185122},'minZoom':0.5}},{'longitude':176.74208333333334,'latitude':47.68222222222222,'magnitude':3.69,'b_v':1.18,'letter':'chi','constell':'UMa','desigNo':'63','bsNo':'4518','serialNo':353,'main':true,'letterLabel':{'vtr':{'x':0.7399640485139226,'y':0.6726464204222642,'z':0},'orthogVtr':{'x':-0.02573601530558979,'y':0.028311644126769463,'z':0.999267786092912},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7399640485139226,'y':0.6726464204222642,'z':0},'orthogVtr':{'x':-0.02573601530558979,'y':0.028311644126769463,'z':0.999267786092912},'minZoom':0.5}},{'longitude':325.26458333333335,'latitude':-16.5825,'magnitude':3.69,'b_v':0.32,'letter':'gamma','constell':'Cap','desigNo':'40','bsNo':'8278','serialNo':354,'main':true,'letterLabel':{'vtr':{'x':-0.6159370181553212,'y':-0.38901625278461893,'z':0.6850459435215606},'orthogVtr':{'x':-0.016928762205010106,'y':0.8759084868848984,'z':0.48218019413204244},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6139962544665741,'y':-0.28914546547516096,'z':0.7344409433686078},'orthogVtr':{'x':0.051706796699081625,'y':0.9137528233186101,'z':0.4029667294608684},'minZoom':0.5}},{'longitude':29.159166666666668,'latitude':-51.5225,'magnitude':3.69,'b_v':0.84,'letter':'chi','constell':'Eri','desigNo':'','bsNo':'566','serialNo':355,'main':true,'letterLabel':{'vtr':{'x':0.09390516629614284,'y':-0.3021779973913354,'z':0.9486149258974667},'orthogVtr':{'x':0.8342347069923942,'y':0.543902869288782,'z':0.09067591978438669},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4917144431223888,'y':0.004084254198682441,'z':0.8707469352759618},'orthogVtr':{'x':0.6804282717764094,'y':0.6221938541930869,'z':-0.38715910782483315},'minZoom':0.5}},{'longitude':146.43208333333334,'latitude':-62.58888888888889,'magnitude':3.69,'b_v':1.01,'letter':'lambda','constell':'Car','desigNo':'','bsNo':'3884','serialNo':356,'main':true,'letterLabel':{'vtr':{'x':-0.7969250851435618,'y':0.17891536071524938,'z':0.576974611546348},'orthogVtr':{'x':0.46665231828230186,'y':-0.4241834774006034,'z':0.7760824642665787},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.38736846559806287,'y':0.4048855018716025,'z':-0.8282592602768671},'orthogVtr':{'x':-0.8383314674694744,'y':0.21911197861759307,'z':0.49918963478497963},'minZoom':0.5}},{'longitude':75.92625,'latitude':41.099722222222226,'magnitude':3.69,'b_v':1.15,'letter':'zeta','constell':'Aur','desigNo':'8','bsNo':'1612','serialNo':357,'main':true,'letterLabel':{'vtr':{'x':0.9817349683466895,'y':-0.16106566407460857,'z':0.10126353628789482},'orthogVtr':{'x':0.05116271880008358,'y':0.7361524579536791,'z':0.674879200193442},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9735451835313308,'y':-0.22458560225294877,'z':0.04208423557138307},'orthogVtr':{'x':0.13649522882738196,'y':0.7193218311407755,'z':0.6811351963829518},'minZoom':0.5}},{'longitude':269.61125,'latitude':29.246944444444445,'magnitude':3.7,'b_v':0.94,'letter':'xi','constell':'Her','desigNo':'92','bsNo':'6703','serialNo':358,'main':true,'letterLabel':{'vtr':{'x':-0.33764838285924376,'y':-0.8222511314297604,'z':0.45814478761087796},'orthogVtr':{'x':-0.9412536976235166,'y':0.2918866708368233,'z':-0.16983417823822586},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5512005451841742,'y':0.7264047799012666,'z':-0.41050463423116385},'orthogVtr':{'x':0.8343517919475419,'y':0.48335374984199464,'z':-0.26500233921157823},'minZoom':0.5}},{'longitude':349.5183333333333,'latitude':3.3780555555555556,'magnitude':3.7,'b_v':0.92,'letter':'gamma','constell':'Psc','desigNo':'6','bsNo':'8852','serialNo':359,'main':true,'letterLabel':{'vtr':{'x':-0.0887231412186627,'y':0.9830223268822724,'z':0.1606091811300207},'orthogVtr':{'x':0.16905783511891742,'y':0.17376726473331733,'z':-0.9701671949164258},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.059920421576281135,'y':-0.998203157217067,'z':0},'orthogVtr':{'x':-0.18127848874293545,'y':-0.010881836417419523,'z':0.9833715956622207},'minZoom':0.5}},{'longitude':50.07375,'latitude':-21.695,'magnitude':3.7,'b_v':1.61,'letter':'tau^4','constell':'Eri','desigNo':'16','bsNo':'1003','serialNo':360,'main':true,'letterLabel':{'vtr':{'x':0.7287735987725175,'y':0.6214766578985026,'z':0.28749922681541495},'orthogVtr':{'x':-0.3365544381335295,'y':0.6907344303970038,'z':-0.6400133255149858},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5268732839832033,'y':-0.8499438467479806,'z':0},'orthogVtr':{'x':0.6056272704559933,'y':-0.37542342364829995,'z':0.701621594776139},'minZoom':0.5}},{'longitude':237.9225,'latitude':4.426111111111111,'magnitude':3.71,'b_v':0.15,'letter':'epsilon','constell':'Ser','desigNo':'37','bsNo':'5892','serialNo':361,'main':true,'letterLabel':{'vtr':{'x':0.42225344625175093,'y':-0.8397473754545768,'z':0.3413595941901588},'orthogVtr':{'x':-0.7357654282437673,'y':-0.5374649862650368,'z':-0.41204444316164385},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5123448041421913,'y':-0.7646250658561746,'z':0.3909620318303818},'orthogVtr':{'x':-0.676129824766453,'y':-0.6398380847590793,'z':-0.36531587065595517},'minZoom':0.5}},{'longitude':89.30083333333333,'latitude':-14.165555555555557,'magnitude':3.71,'b_v':0.34,'letter':'eta','constell':'Lep','desigNo':'16','bsNo':'2085','serialNo':362,'main':true,'letterLabel':{'vtr':{'x':-0.5728770031547941,'y':0.7930285408894943,'z':-0.20716580941618246},'orthogVtr':{'x':-0.8195559510621141,'y':-0.5578670381944137,'z':0.1308144134828666},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9594989185982952,'y':0.27014451073734597,'z':-0.07989848889173007},'orthogVtr':{'x':-0.2814637505499526,'y':-0.9311991421213872,'z':0.2316167412747759},'minZoom':0.5}},{'longitude':73.79125,'latitude':2.468055555555556,'magnitude':3.71,'b_v':-0.18,'letter':'pi^5','constell':'Ori','desigNo':'8','bsNo':'1567','serialNo':363,'main':true,'letterLabel':{'vtr':{'x':0.9191297404477159,'y':0.2774925488015472,'z':0.279639778257914},'orthogVtr':{'x':-0.2782572950422218,'y':0.9597622190798965,'z':-0.03780688538637615},'minZoom':1.7},'shortNameLabel':{'vtr':{'x':-0.21108291317882788,'y':-0.9718142143332257,'z':-0.10498160116818041},'orthogVtr':{'x':0.9368407579645749,'y':-0.23178171764278968,'z':0.2619286727010218},'minZoom':0.5}},{'longitude':272.045,'latitude':9.567499999999999,'magnitude':3.71,'b_v':0.16,'constell':'Oph','desigNo':'72','bsNo':'6771','serialNo':364,'main':true,'letterLabel':{'vtr':{'x':0.9783158848035483,'y':-0.20711839498473053,'z':0},'orthogVtr':{'x':-0.20410739943970999,'y':-0.9640935615232646,'z':0.1698934198941976},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9783158848035483,'y':-0.20711839498473053,'z':0},'orthogVtr':{'x':-0.20410739943970999,'y':-0.9640935615232646,'z':0.1698934198941976},'minZoom':0.5}},{'longitude':299.04333333333335,'latitude':6.451666666666667,'magnitude':3.71,'b_v':0.86,'letter':'beta','constell':'Aql','desigNo':'60','bsNo':'7602','serialNo':365,'main':true,'letterLabel':{'vtr':{'x':0.4203114246619694,'y':-0.899803575297793,'z':-0.11701210270709018},'orthogVtr':{'x':-0.768525826774523,'y':-0.4215775469228491,'z':0.48129037546064535},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4203114246619694,'y':-0.899803575297793,'z':-0.11701210270709018},'orthogVtr':{'x':-0.768525826774523,'y':-0.4215775469228491,'z':0.48129037546064535},'minZoom':0.5}},{'longitude':118.205,'latitude':-40.62166666666667,'magnitude':3.71,'b_v':1.01,'constell':'','desigNo':'','bsNo':'3080','serialNo':366,'main':false,'letterLabel':{'vtr':{'x':0.7003146523633067,'y':-0.6615032581031766,'z':0.26827751900623936},'orthogVtr':{'x':0.6171447636172384,'y':0.37219972144090485,'z':-0.6932529899676856},'minZoom':1.8}},{'longitude':316.39208333333335,'latitude':43.998333333333335,'magnitude':3.72,'b_v':1.61,'letter':'xi','constell':'Cyg','desigNo':'62','bsNo':'8079','main':false,'serialNo':367,'letterLabel':{'vtr':{'x':0.8322287253502978,'y':-0.2838788210269585,'z':-0.4762438069667286},'orthogVtr':{'x':0.18996840405622467,'y':-0.6609777866122207,'z':0.7259616870507289},'minZoom':0.5}},{'longitude':56.47958333333333,'latitude':24.16722222222222,'magnitude':3.72,'b_v':-0.11,'constell':'Tau','desigNo':'17','bsNo':'1142','serialNo':368,'main':true,'letterLabel':{'vtr':{'x':0.8495462664561371,'y':-0.3941622102455051,'z':0.3505813645429779},'orthogVtr':{'x':0.15627923297566965,'y':0.8228164080761586,'z':0.5463972546977014},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8504543679387735,'y':-0.389296148139743,'z':0.35380203094021445},'orthogVtr':{'x':0.15125946437458637,'y':0.8251298070173763,'z':0.5443173486198842},'minZoom':1.5}},{'longitude':90.24208333333333,'latitude':54.28388888888889,'magnitude':3.72,'b_v':1.01,'letter':'delta','constell':'Aur','desigNo':'33','bsNo':'2077','serialNo':369,'main':true,'letterLabel':{'vtr':{'x':-0.41968603772315777,'y':-0.5307067205178758,'z':-0.7363518225260244},'orthogVtr':{'x':0.9076659881708805,'y':-0.24318152106404856,'z':-0.34206023114468437},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9999953856987365,'y':0.0030378580011771617,'z':0},'orthogVtr':{'x':-0.0017733931374437802,'y':0.5837616352661656,'z':0.8119231541643289},'minZoom':0.5}},{'longitude':53.439166666666665,'latitude':-9.4,'magnitude':3.72,'b_v':0.88,'letter':'epsilon','constell':'Eri','desigNo':'18','bsNo':'1084','serialNo':370,'main':true,'letterLabel':{'vtr':{'x':0.7933048650479857,'y':0.30886791019616244,'z':0.5246598947339625},'orthogVtr':{'x':-0.15906848398276874,'y':0.9369766507810658,'z':-0.3110819398398438},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8090929496650678,'y':0.1210476776451816,'z':0.5750791758871019},'orthogVtr':{'x':-0.0019975754451575095,'y':0.9791180162751355,'z':-0.2032828568713667},'minZoom':0.5}},{'longitude':52.03,'latitude':9.7925,'magnitude':3.73,'b_v':-0.08,'letter':'xi','constell':'Tau','desigNo':'2','bsNo':'1038','serialNo':371,'main':true,'letterLabel':{'vtr':{'x':-0.6167178187145954,'y':0.717291585790619,'z':-0.32427135709755606},'orthogVtr':{'x':-0.5020736709079333,'y':-0.6756962347926948,'z':-0.5397746078392424},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5841437343146263,'y':0.7581071733289967,'z':-0.2899131101003923},'orthogVtr':{'x':-0.5396248109566679,'y':-0.6295602707494845,'z':-0.5589802580537317},'minZoom':0.5}},{'longitude':268.4579166666667,'latitude':56.87027777777778,'magnitude':3.73,'b_v':1.18,'letter':'xi','constell':'Dra','desigNo':'32','bsNo':'6688','main':true,'serialNo':372,'letterLabel':{'vtr':{'x':0.8963445806707168,'y':0.2531852781909864,'z':-0.3639555022383778},'orthogVtr':{'x':0.4431140588391299,'y':-0.4843545304351932,'z':0.7543544390444161},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8974035100908871,'y':0.2520242568289759,'z':-0.3621473650965273},'orthogVtr':{'x':0.440965550258981,'y':-0.4849596583382437,'z':0.7552241477000375},'minZoom':0.5}},{'longitude':325.84041666666667,'latitude':-77.31083333333333,'magnitude':3.73,'b_v':1.01,'letter':'nu','constell':'Oct','desigNo':'','bsNo':'8254','serialNo':373,'main':true,'letterLabel':{'vtr':{'x':0.7706257499492984,'y':0.06340840611356949,'z':-0.6341256401922402},'orthogVtr':{'x':-0.6108170206826786,'y':-0.21031086036314955,'z':-0.7633294893148361},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9830824522335415,'y':-0.18316356654773552,'z':0},'orthogVtr':{'x':-0.022591399936011558,'y':0.12125341991904716,'z':0.9923644677268865},'minZoom':0.5}},{'longitude':221.78375,'latitude':1.82,'magnitude':3.73,'b_v':-0.01,'constell':'Vir','desigNo':'109','bsNo':'5511','serialNo':374,'main':true,'letterLabel':{'vtr':{'x':-0.5117573952884481,'y':0.6130129397325594,'z':-0.6019298165799968},'orthogVtr':{'x':0.42737442920586777,'y':0.7894342659802268,'z':0.44061847096691187},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.09250498221974418,'y':0.9941299094667031,'z':0.05611195388016065},'orthogVtr':{'x':0.6602933913314465,'y':-0.10342653279994636,'z':0.7438518600346433},'minZoom':0.5}},{'longitude':343.38166666666666,'latitude':-7.486111111111112,'magnitude':3.73,'b_v':1.63,'letter':'lambda','constell':'Aqr','desigNo':'73','bsNo':'8698','serialNo':375,'main':true,'letterLabel':{'vtr':{'x':-0.13586228302717138,'y':-0.9907277325535229,'z':0},'orthogVtr':{'x':-0.2809280886477413,'y':0.03852474321251501,'z':0.9589552925810132},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.13586228302717138,'y':-0.9907277325535229,'z':0},'orthogVtr':{'x':-0.2809280886477413,'y':0.03852474321251501,'z':0.9589552925810132},'minZoom':0.5}},{'longitude':28.08125,'latitude':-10.249166666666666,'magnitude':3.74,'b_v':1.14,'letter':'zeta','constell':'Cet','desigNo':'55','bsNo':'539','serialNo':376,'main':true,'letterLabel':{'vtr':{'x':-0.2794331743796699,'y':0.5960981498753037,'z':-0.7527178068647911},'orthogVtr':{'x':-0.41005030961244027,'y':-0.7829483914672694,'z':-0.4678146640343349},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.20076697568811286,'y':-0.979639026107601,'z':0},'orthogVtr':{'x':0.45378053817920155,'y':-0.09299766939496742,'z':0.8862475143304485},'minZoom':0.5}},{'longitude':318.87291666666664,'latitude':38.120555555555555,'magnitude':3.74,'b_v':0.39,'letter':'tau','constell':'Cyg','desigNo':'65','bsNo':'8130','main':false,'serialNo':377,'letterLabel':{'vtr':{'x':0.6700376606916383,'y':-0.7343240498537204,'z':0.1087093513057092},'orthogVtr':{'x':-0.447081460850482,'y':-0.28228794116459305,'z':0.8487824725080358},'minZoom':0.5}},{'longitude':245.67333333333335,'latitude':19.113055555555558,'magnitude':3.74,'b_v':0.3,'letter':'gamma','constell':'Her','desigNo':'20','bsNo':'6095','serialNo':378,'main':true,'letterLabel':{'vtr':{'x':-0.037374989041477735,'y':-0.9395337097774638,'z':0.34041080826840125},'orthogVtr':{'x':-0.920382001729877,'y':-0.10031900090162765,'z':-0.37793262488147805},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6819262929077287,'y':-0.7307904440114347,'z':-0.030362114265857665},'orthogVtr':{'x':-0.6192547536799928,'y':0.5989430863543499,'z':-0.5077309615860128},'minZoom':0.5}},{'longitude':136.19,'latitude':-47.168055555555554,'magnitude':3.75,'b_v':1.17,'constell':'','desigNo':'','bsNo':'3614','serialNo':379,'main':false,'letterLabel':{'vtr':{'x':-0.1729326950390146,'y':-0.4474223674703225,'z':0.8774437349903383},'orthogVtr':{'x':0.8540487643890738,'y':-0.5118687598337877,'z':-0.09268808311598895},'minZoom':1.8}},{'longitude':267.1925,'latitude':2.7019444444444445,'magnitude':3.75,'b_v':0.04,'letter':'gamma','constell':'Oph','desigNo':'62','bsNo':'6629','serialNo':380,'main':true,'letterLabel':{'vtr':{'x':-0.37780488720731725,'y':-0.925542122158723,'z':0.025204113001528902},'orthogVtr':{'x':-0.9245916438396409,'y':0.375698772309703,'z':-0.06309298397518344},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5080615771629924,'y':-0.8588270747287454,'z':0.06549419457874468},'orthogVtr':{'x':-0.8599300404489166,'y':-0.510091994759726,'z':-0.01806882441024101},'minZoom':0.5}},{'longitude':338.00416666666666,'latitude':50.37277777777778,'magnitude':3.76,'b_v':0.03,'letter':'alpha','constell':'Lac','desigNo':'7','bsNo':'8585','serialNo':381,'main':true,'letterLabel':{'vtr':{'x':0.3300400362528476,'y':0.03911168720249247,'z':-0.9431563234132471},'orthogVtr':{'x':0.7357716147461392,'y':-0.6365896344049754,'z':0.23107091617509748},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7931728563693015,'y':-0.6089965680682967,'z':0},'orthogVtr':{'x':-0.1454754773660679,'y':-0.18947101833452612,'z':0.9710497508863243},'minZoom':0.5}},{'longitude':88.01875,'latitude':-20.878611111111113,'magnitude':3.76,'b_v':0.98,'letter':'delta','constell':'Lep','desigNo':'15','bsNo':'2035','serialNo':382,'main':true,'letterLabel':{'vtr':{'x':-0.49422251941490164,'y':0.8063584081049647,'z':-0.32485415032228626},'orthogVtr':{'x':-0.8687350922354558,'y':-0.4719881720291778,'z':0.15008832394030497},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.701705747348848,'y':0.6572100714759712,'z':-0.27510719017892593},'orthogVtr':{'x':-0.7117342223862453,'y':-0.6641247163052783,'z':0.2288509512252041},'minZoom':0.5}},{'longitude':83.44458333333333,'latitude':-62.478611111111114,'magnitude':3.76,'b_v':0.64,'letter':'beta','constell':'Dor','desigNo':'','bsNo':'1922','serialNo':383,'main':true,'letterLabel':{'vtr':{'x':0.42062365623401315,'y':0.4366628076142545,'z':-0.7952366517350463},'orthogVtr':{'x':-0.9057002084619219,'y':0.15113983255805524,'z':-0.3960604542318686},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9982354919986164,'y':-0.05937931049010622,'z':0},'orthogVtr':{'x':0.027258582243370445,'y':-0.4582485723108802,'z':0.888405997092051},'minZoom':0.5}},{'longitude':286.4325,'latitude':-21.714444444444442,'magnitude':3.76,'b_v':1.01,'letter':'omicron','constell':'Sgr','desigNo':'39','bsNo':'7217','serialNo':384,'main':true,'letterLabel':{'vtr':{'x':-0.26462948297363265,'y':-0.9157815199862334,'z':-0.30218445425404017},'orthogVtr':{'x':-0.9278476095679411,'y':0.15639143219876633,'z':0.338586079681189},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.24645715649301447,'y':-0.9186613258919487,'z':-0.30873975824928096},'orthogVtr':{'x':-0.9328391178832566,'y':0.13847541559397386,'z':0.3326195114885236},'minZoom':0.5}},{'longitude':292.5366666666667,'latitude':51.76777777777777,'magnitude':3.76,'b_v':0.15,'letter':'iota^2','constell':'Cyg','desigNo':'10','bsNo':'7420','main':false,'serialNo':385,'letterLabel':{'vtr':{'x':-0.8992702709275876,'y':0.4001153363557925,'z':-0.17669379569954932},'orthogVtr':{'x':0.36749705236795144,'y':0.4721052324483708,'z':-0.8012880667997851},'minZoom':1.3}},{'longitude':130.30166666666668,'latitude':-46.711666666666666,'magnitude':3.77,'b_v':0.67,'constell':'','desigNo':'','bsNo':'3445','serialNo':386,'main':false,'letterLabel':{'vtr':{'x':0.8824899824020987,'y':-0.4565828435882341,'z':-0.1128872796236388},'orthogVtr':{'x':0.1565869933307008,'y':0.5115424315545244,'z':-0.8448697261938882},'minZoom':1.8}},{'longitude':321.91583333333335,'latitude':-22.334722222222222,'magnitude':3.77,'b_v':1,'letter':'zeta','constell':'Cap','desigNo':'34','bsNo':'8204','serialNo':387,'main':true,'letterLabel':{'vtr':{'x':-0.617121342925338,'y':-0.7257231685435461,'z':0.3041169688543258},'orthogVtr':{'x':-0.29848775195424804,'y':0.5735094833431853,'z':0.7628839587045543},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.46272028593992076,'y':-0.8865043355673327,'z':0},'orthogVtr':{'x':-0.5057901016630826,'y':0.26400247700689017,'z':0.8212667442395772},'minZoom':0.5}},{'longitude':331.95666666666665,'latitude':25.43111111111111,'magnitude':3.77,'b_v':0.44,'letter':'iota','constell':'Peg','desigNo':'24','bsNo':'8430','serialNo':388,'main':true,'letterLabel':{'vtr':{'x':0.534544406553275,'y':-0.17460112586106394,'z':-0.8269079297422757},'orthogVtr':{'x':0.2809626059999495,'y':-0.8860632730132196,'z':0.36871654457973235},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.47429970714328074,'y':-0.8803634407469441,'z':0},'orthogVtr':{'x':-0.37378803666178745,'y':-0.20137996208921183,'z':0.905388653848431},'minZoom':0.5}},{'longitude':56.59708333333333,'latitude':42.6325,'magnitude':3.77,'b_v':0.43,'letter':'nu','constell':'Per','desigNo':'41','bsNo':'1135','serialNo':389,'main':true,'letterLabel':{'vtr':{'x':0.30781078431158204,'y':0.5315313122401227,'z':0.7891305247991502},'orthogVtr':{'x':-0.8609329572257011,'y':0.5086728971822282,'z':-0.00680638192051819},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.30781078431158204,'y':0.5315313122401227,'z':0.7891305247991502},'orthogVtr':{'x':-0.8609329572257011,'y':0.5086728971822282,'z':-0.00680638192051819},'minZoom':0.5}},{'longitude':84.90625,'latitude':-2.591111111111111,'magnitude':3.77,'b_v':-0.19,'letter':'sigma','constell':'Ori','desigNo':'48','bsNo':'1931','serialNo':390,'main':true,'letterLabel':{'vtr':{'x':-0.011079247251360003,'y':-0.9989524616496117,'z':0.04439853200866068},'orthogVtr':{'x':0.9959972240271803,'y':-0.007086287829827366,'z':0.0891028296685554},'minZoom':1.3},'shortNameLabel':{'vtr':{'x':0.30334015370956,'y':-0.9502919030454704,'z':0.07021431587417833},'orthogVtr':{'x':0.9487454722616424,'y':0.30806092760563575,'z':0.07057261328439508},'minZoom':0.5}},{'longitude':310.11291666666665,'latitude':15.974722222222223,'magnitude':3.77,'b_v':-0.06,'letter':'alpha','constell':'Del','desigNo':'9','bsNo':'7906','serialNo':391,'main':true,'letterLabel':{'vtr':{'x':-0.582757490828496,'y':0.7887253125110624,'z':0.19571941213789298},'orthogVtr':{'x':0.5260401672163415,'y':0.5496999676253667,'z':-0.6489311890082602},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.10740107438496266,'y':0.8980277439564369,'z':-0.4266276834729176},'orthogVtr':{'x':0.7776821714959632,'y':-0.34322564602243,'z':-0.5266940250750988},'minZoom':0.5}},{'longitude':252.82625,'latitude':-59.07055555555556,'magnitude':3.77,'b_v':1.56,'letter':'eta','constell':'Ara','desigNo':'','bsNo':'6229','serialNo':392,'main':true,'letterLabel':{'vtr':{'x':-0.12292946904892707,'y':-0.4765823967858627,'z':-0.8704927137622644},'orthogVtr':{'x':-0.9807426406357952,'y':0.19247562289091227,'z':0.03312110251008053},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.12292946904892707,'y':-0.4765823967858627,'z':-0.8704927137622644},'orthogVtr':{'x':-0.9807426406357952,'y':0.19247562289091227,'z':0.03312110251008053},'minZoom':0.5}},{'longitude':42.99666666666667,'latitude':55.966944444444444,'magnitude':3.77,'b_v':1.69,'letter':'eta','constell':'Per','desigNo':'15','bsNo':'834','serialNo':393,'main':true,'letterLabel':{'vtr':{'x':-0.24649770586787967,'y':0.5032169992157308,'z':0.828258131684916},'orthogVtr':{'x':-0.8784531052425671,'y':0.24495795179374408,'z':-0.4102630177614178},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.002355360633323894,'y':0.41736240655944384,'z':0.9087370763137139},'orthogVtr':{'x':-0.9123789943793771,'y':0.3728811714709937,'z':-0.1688910967981923},'minZoom':0.5}},{'longitude':126.48041666666667,'latitude':-66.19555555555556,'magnitude':3.77,'b_v':1.13,'letter':'beta','constell':'Vol','desigNo':'','bsNo':'3347','serialNo':394,'main':true,'letterLabel':{'vtr':{'x':-0.4154981205982506,'y':0.3989311362827024,'z':-0.8174443469029029},'orthogVtr':{'x':-0.877368835378103,'y':0.06131917228560896,'z':0.4758822184296018},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9672827286437747,'y':0.25370085310746177,'z':0},'orthogVtr':{'x':-0.0823339807179324,'y':-0.3139139524107624,'z':0.9458748046654973},'minZoom':0.5}},{'longitude':65.98666666666666,'latitude':17.58222222222222,'magnitude':3.77,'b_v':0.98,'letter':'delta','constell':'Tau','desigNo':'61','bsNo':'1373','serialNo':395,'main':true,'letterLabel':{'vtr':{'x':0.7552006797163694,'y':0.43742579206297155,'z':0.48819116111828137},'orthogVtr':{'x':-0.5283708541469809,'y':0.8470005329272428,'z':0.058432334447261924},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6350177504689799,'y':0.597155338756198,'z':0.490059137231709},'orthogVtr':{'x':-0.668024163294557,'y':0.7430724915752983,'z':-0.03983703702191474},'minZoom':0.5}},{'longitude':111.70291666666667,'latitude':27.761944444444445,'magnitude':3.78,'b_v':1.02,'letter':'iota','constell':'Gem','desigNo':'60','bsNo':'2821','serialNo':396,'main':true,'letterLabel':{'vtr':{'x':0.9283800728994472,'y':0.32067631554218556,'z':-0.1878220990552107},'orthogVtr':{'x':-0.17616116840285323,'y':0.8247411648582992,'z':0.5373725465029983},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8182668518314508,'y':0.5748385505460176,'z':0},'orthogVtr':{'x':-0.4726115489529305,'y':0.6727495292957769,'z':0.5692507308986283},'minZoom':0.5}},{'longitude':312.15541666666667,'latitude':-9.430833333333332,'magnitude':3.78,'b_v':0,'letter':'epsilon','constell':'Aqr','desigNo':'2','bsNo':'7950','serialNo':397,'main':true,'letterLabel':{'vtr':{'x':-0.7265924591821886,'y':-0.3794476320378061,'z':0.5727852065132979},'orthogVtr':{'x':-0.18363806773951116,'y':0.9105879558815075,'z':0.3702791307654759},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.24024239685098164,'y':-0.9707129291172006,'z':0},'orthogVtr':{'x':-0.7098895212769499,'y':0.1756910359132337,'z':0.6820480389832653},'minZoom':0.5}},{'longitude':107.14833333333333,'latitude':-70.52722222222222,'magnitude':3.78,'b_v':1.01,'letter':'gamma^2','constell':'Vol','desigNo':'','bsNo':'2736','serialNo':398,'main':true,'letterLabel':{'vtr':{'x':-0.9570949995605118,'y':0.0018773973424655865,'z':0.2897682473900177},'orthogVtr':{'x':0.2725954735160336,'y':-0.33335366962625634,'z':0.9025336773579579},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9946095570893286,'y':0.10369102635507799,'z':0},'orthogVtr':{'x':-0.033029673200563735,'y':-0.31682229203056916,'z':0.9479096349129282},'minZoom':0.5}},{'longitude':220.49625,'latitude':13.654166666666667,'magnitude':3.78,'b_v':0.04,'letter':'zeta','constell':'Boo','desigNo':'30','bsNo':'5478','serialNo':399,'main':true,'letterLabel':{'vtr':{'x':0.304301739002454,'y':0.9525756933913874,'z':0},'orthogVtr':{'x':0.6011182780916594,'y':-0.19202813869647556,'z':0.7757460987287566},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.304301739002454,'y':0.9525756933913874,'z':0},'orthogVtr':{'x':0.6011182780916594,'y':-0.19202813869647556,'z':0.7757460987287566},'minZoom':0.5}},{'longitude':163.5525,'latitude':-58.94638888888888,'magnitude':3.78,'b_v':0.95,'constell':'','desigNo':'','bsNo':'4257','serialNo':400,'main':false,'letterLabel':{'vtr':{'x':0.8671171605392428,'y':-0.49780297555975234,'z':-0.01732129966884266},'orthogVtr':{'x':0.057866812241051016,'y':0.13521461558959852,'z':-0.9891250880308398},'minZoom':2}},{'longitude':148.055,'latitude':58.955555555555556,'magnitude':3.78,'b_v':0.29,'letter':'upsilon','constell':'UMa','desigNo':'29','bsNo':'3888','serialNo':401,'main':true,'letterLabel':{'vtr':{'x':0.8905612164576351,'y':0.4548634077846856,'z':0},'orthogVtr':{'x':-0.12411444762221038,'y':0.24299935225109245,'z':0.962053490559118},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8905612164576351,'y':0.4548634077846856,'z':0},'orthogVtr':{'x':-0.12411444762221038,'y':0.24299935225109245,'z':0.962053490559118},'minZoom':0.5}},{'longitude':163.57166666666666,'latitude':34.12,'magnitude':3.79,'b_v':1.04,'constell':'LMi','desigNo':'46','bsNo':'4247','serialNo':402,'main':true,'letterLabel':{'vtr':{'x':0.21389190158471166,'y':0.6184225489196578,'z':0.7561770992460628},'orthogVtr':{'x':-0.5689541612822342,'y':-0.5503756179595641,'z':0.6110465133811482},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3747798576070137,'y':0.14857033658449995,'z':-0.915132183577452},'orthogVtr':{'x':0.47853802517246313,'y':0.8144241063130603,'z':0.32819922839673527},'minZoom':0.5}},{'longitude':47.670833333333334,'latitude':44.9225,'magnitude':3.79,'b_v':0.98,'letter':'kappa','constell':'Per','desigNo':'27','bsNo':'941','serialNo':403,'main':true,'letterLabel':{'vtr':{'x':-0.5233277379627804,'y':0.7065148966873348,'z':0.4764082067278482},'orthogVtr':{'x':-0.7062495269183605,'y':-0.046790269066603246,'z':-0.7064150879251283},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5233277379627804,'y':0.7065148966873348,'z':0.4764082067278482},'orthogVtr':{'x':-0.7062495269183605,'y':-0.046790269066603246,'z':-0.7064150879251283},'minZoom':0.5}},{'longitude':289.37666666666667,'latitude':53.40138888888889,'magnitude':3.8,'b_v':0.95,'letter':'kappa','constell':'Cyg','desigNo':'1','bsNo':'7328','main':false,'serialNo':404,'letterLabel':{'vtr':{'x':-0.8927020476289101,'y':0.3845508306461359,'z':-0.23495470373780145},'orthogVtr':{'x':0.40491400633327534,'y':0.4556111876013346,'z':-0.7927566418565272},'minZoom':0.5}},{'longitude':303.54583333333335,'latitude':46.794999999999995,'magnitude':3.8,'b_v':1.27,'letter':'omicron^1','constell':'Cyg','desigNo':'31','bsNo':'7735','main':false,'serialNo':405,'letterLabel':{'vtr':{'x':0.2147347214754694,'y':-0.6686897536419081,'z':0.7118588432878931},'orthogVtr':{'x':-0.9004243932445226,'y':0.14678504130044268,'z':0.40949977252821634},'minZoom':0.5}},{'longitude':48.205,'latitude':-28.919722222222223,'magnitude':3.8,'b_v':0.54,'letter':'alpha','constell':'For','desigNo':'','bsNo':'963','serialNo':406,'main':true,'letterLabel':{'vtr':{'x':-0.6381979839329567,'y':-0.7698722837613454,'z':0},'orthogVtr':{'x':0.5023914386717763,'y':-0.416465445072311,'z':0.7577330502294493},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6381979839329567,'y':-0.7698722837613454,'z':0},'orthogVtr':{'x':0.5023914386717763,'y':-0.416465445072311,'z':0.7577330502294493},'minZoom':0.5}},{'longitude':233.91,'latitude':10.481388888888889,'magnitude':3.8,'b_v':0.27,'letter':'delta','constell':'Ser','desigNo':'13','bsNo':'5789','serialNo':407,'main':true,'letterLabel':{'vtr':{'x':-0.4653526738804957,'y':0.7265438800225891,'z':-0.5055500759707141},'orthogVtr':{'x':0.6692859550299726,'y':0.6626013221142815,'z':0.3361782240598334},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.29963704134521474,'y':0.9540532707631613,'z':0},'orthogVtr':{'x':0.7580992310654296,'y':-0.23809426329079433,'z':0.6071216333207197},'minZoom':0.5}},{'longitude':157.13125,'latitude':-58.82916666666667,'magnitude':3.81,'b_v':0.32,'constell':'','desigNo':'','bsNo':'4114','serialNo':408,'main':false,'letterLabel':{'vtr':{'x':0.33426441028414056,'y':0.03509975270376614,'z':-0.9418255206658663},'orthogVtr':{'x':-0.8129123643687247,'y':0.5164000233680651,'z':-0.26926660342848263},'minZoom':1.8}},{'longitude':69.05791666666667,'latitude':-30.5275,'magnitude':3.81,'b_v':0.96,'letter':'upsilon^2','constell':'Eri','desigNo':'52','bsNo':'1464','serialNo':409,'main':true,'letterLabel':{'vtr':{'x':-0.6716315670499873,'y':-0.7149336793901768,'z':0.1943730233741358},'orthogVtr':{'x':0.6738850105465362,'y':-0.4804734594682407,'z':0.5612702088186365},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.573167893382256,'y':0.5758760526299996,'z':-0.5829625528308287},'orthogVtr':{'x':-0.7594001154154992,'y':-0.6405869833106549,'z':0.11384103618590921},'minZoom':0.5}},{'longitude':235.86958333333334,'latitude':26.241111111111113,'magnitude':3.81,'b_v':0.02,'letter':'gamma','constell':'CrB','desigNo':'8','bsNo':'5849','main':true,'serialNo':410,'letterLabel':{'vtr':{'x':-0.6250926835925916,'y':-0.779498782090562,'z':0.04050661227926346},'orthogVtr':{'x':-0.5966523538309556,'y':0.4437177365249035,'z':-0.6686707253657787},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.10637048670015176,'y':0.8843472627530322,'z':-0.45454948951724966},'orthogVtr':{'x':0.8575664487211359,'y':0.1497788364511911,'z':0.4920834138427618},'minZoom':0.5}},{'longitude':354.6066666666667,'latitude':46.55305555555555,'magnitude':3.81,'b_v':0.98,'letter':'lambda','constell':'And','desigNo':'16','bsNo':'8961','serialNo':411,'main':true,'letterLabel':{'vtr':{'x':-0.43197491699485513,'y':0.3327268304030648,'z':0.8382663821347116},'orthogVtr':{'x':-0.5870845501838922,'y':0.6018307058676641,'z':-0.5414162284326233},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7275328573296534,'y':-0.6860728397960018,'z':0},'orthogVtr':{'x':-0.0443456816734735,'y':-0.0470255323147999,'z':0.9979088434458454},'minZoom':0.5}},{'longitude':173.10625,'latitude':69.23416666666667,'magnitude':3.82,'b_v':1.61,'letter':'lambda','constell':'Dra','desigNo':'1','bsNo':'4434','main':true,'serialNo':412,'letterLabel':{'vtr':{'x':0.9217635867455718,'y':0.35417314555328555,'z':0.15783939026374189},'orthogVtr':{'x':-0.16265792368243912,'y':-0.016330667489391916,'z':0.9865473679264816},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9358851041385455,'y':0.35230536733291984,'z':0},'orthogVtr':{'x':-0.01499272618062416,'y':0.03982757688052691,'z':0.9990940807959473},'minZoom':0.5}},{'longitude':247.94958333333332,'latitude':1.9469444444444444,'magnitude':3.82,'b_v':0.02,'letter':'lambda','constell':'Oph','desigNo':'10','bsNo':'6149','serialNo':413,'main':true,'letterLabel':{'vtr':{'x':0.8556228210115665,'y':0.39709119276581223,'z':0.33200628426587575},'orthogVtr':{'x':0.35655344121710175,'y':-0.9171501231695652,'z':0.17805980772283858},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.09017890092165262,'y':0.9959255824751981,'z':0},'orthogVtr':{'x':0.9225445973545731,'y':-0.08353441191246412,'z':0.3767405843791292},'minZoom':0.5}},{'longitude':139.98208333333332,'latitude':36.7275,'magnitude':3.82,'b_v':0.07,'constell':'Lyn','desigNo':'38','bsNo':'3690','serialNo':414,'main':true,'letterLabel':{'vtr':{'x':0.2662189632370665,'y':0.7713898124869097,'z':0.5780010560581975},'orthogVtr':{'x':-0.7432084514152123,'y':-0.2175819692330341,'z':0.6326920928932787},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5687157301303346,'y':0.7877405920907252,'z':0.23670060809992427},'orthogVtr':{'x':-0.5475342518457972,'y':0.14781378730168718,'z':0.8236245062764918},'minZoom':0.5}},{'longitude':30.73875,'latitude':2.8475,'magnitude':3.82,'b_v':0.02,'letter':'alpha','constell':'Psc','desigNo':'113','bsNo':'596','serialNo':415,'main':true,'letterLabel':{'vtr':{'x':-0.4925670335866614,'y':-0.1976445446373432,'z':-0.8475342774181669},'orthogVtr':{'x':0.14299983865769172,'y':-0.979014172881513,'z':0.14519743606896585},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.057772820263887276,'y':-0.9983297557614701,'z':0},'orthogVtr':{'x':0.5096405965690387,'y':0.029492634487595332,'z':0.8598817632905909},'minZoom':0.5}},{'longitude':264.99,'latitude':45.99777777777778,'magnitude':3.82,'b_v':-0.18,'letter':'iota','constell':'Her','desigNo':'85','bsNo':'6588','serialNo':416,'main':true,'letterLabel':{'vtr':{'x':0.9964622638892022,'y':0.08404139839868281,'z':0},'orthogVtr':{'x':0.05815935389368629,'y':-0.6895839735116097,'z':0.7218666310549399},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9964622638892022,'y':0.08404139839868281,'z':0},'orthogVtr':{'x':0.05815935389368629,'y':-0.6895839735116097,'z':0.7218666310549399},'minZoom':0.5}},{'longitude':222.52916666666667,'latitude':-79.11694444444444,'magnitude':3.83,'b_v':1.43,'letter':'alpha','constell':'Aps','desigNo':'','bsNo':'5470','serialNo':417,'main':true,'letterLabel':{'vtr':{'x':0.8873873068043935,'y':-0.18084353144505289,'z':-0.42407473970625453},'orthogVtr':{'x':-0.4395278606316128,'y':-0.054249036298084766,'z':-0.8965892603580119},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9901113197375248,'y':0.14028390687323034,'z':0},'orthogVtr':{'x':0.01790382854515264,'y':0.12636362719220903,'z':0.9918224068079196},'minZoom':0.5}},{'longitude':209.83541666666667,'latitude':-42.18555555555555,'magnitude':3.83,'b_v':-0.22,'letter':'phi','constell':'Cen','desigNo':'','bsNo':'5248','serialNo':418,'main':true,'letterLabel':{'vtr':{'x':0.7579686209335411,'y':-0.4877184962273792,'z':0.43314459262215194},'orthogVtr':{'x':0.11107765343412865,'y':-0.5578288375761166,'z':-0.8224893573026014},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.3491370448209359,'y':0.17153884876222297,'z':0.921237074427118},'orthogVtr':{'x':0.6818782877801804,'y':-0.7208444818122344,'z':-0.12419836430010266},'minZoom':0.5}},{'longitude':156.73458333333335,'latitude':-16.926111111111112,'magnitude':3.83,'b_v':1.46,'letter':'mu','constell':'Hya','desigNo':'42','bsNo':'4094','serialNo':419,'main':true,'letterLabel':{'vtr':{'x':-0.3144535549687354,'y':0.9492728594916874,'z':0},'orthogVtr':{'x':-0.35871165212171174,'y':-0.11882584979705545,'z':0.9258543989484089},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.3144535549687354,'y':0.9492728594916874,'z':0},'orthogVtr':{'x':-0.35871165212171174,'y':-0.11882584979705545,'z':0.9258543989484089},'minZoom':0.5}},{'longitude':133.86041666666668,'latitude':-60.71194444444445,'magnitude':3.84,'b_v':-0.1,'constell':'','desigNo':'','bsNo':'3571','serialNo':420,'main':false,'letterLabel':{'vtr':{'x':0.8165048066195527,'y':-0.4589760961361201,'z':0.3502297016856419},'orthogVtr':{'x':0.46735415725610524,'y':0.16928736003817468,'z':-0.8677107129837346},'minZoom':1.8}},{'longitude':56.355,'latitude':32.3425,'magnitude':3.84,'b_v':0.02,'letter':'omicron','constell':'Per','desigNo':'38','bsNo':'1131','serialNo':421,'main':true,'letterLabel':{'vtr':{'x':0.7648243013525751,'y':0.15341460049002237,'z':0.6257058002104761},'orthogVtr':{'x':-0.44264201854767926,'y':0.8308196127048759,'z':0.3373526560751459},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7648243013525751,'y':0.15341460049002237,'z':0.6257058002104761},'orthogVtr':{'x':-0.44264201854767926,'y':0.8308196127048759,'z':0.3373526560751459},'minZoom':0.5}},{'longitude':56.10583333333334,'latitude':-64.75222222222222,'magnitude':3.84,'b_v':1.13,'letter':'beta','constell':'Ret','desigNo':'','bsNo':'1175','serialNo':422,'main':true,'letterLabel':{'vtr':{'x':-0.3896807173570409,'y':-0.4227553507620504,'z':0.818185096370105},'orthogVtr':{'x':0.8897028013928439,'y':0.05664694773480394,'z':0.4530121946549082},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.4485902957283584,'y':-0.22101287005382775,'z':0.865979247932024},'orthogVtr':{'x':0.8615038495935557,'y':0.36480717448562294,'z':-0.35316687639032684},'minZoom':0.5}},{'longitude':297.02625,'latitude':70.3125,'magnitude':3.84,'b_v':0.89,'letter':'epsilon','constell':'Dra','desigNo':'63','bsNo':'7582','main':true,'serialNo':423,'letterLabel':{'vtr':{'x':0.7122422566247728,'y':0.10539214103873612,'z':-0.6939765590315877},'orthogVtr':{'x':0.6850377926350095,'y':-0.31998010864099463,'z':0.6544737983570095},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9574194818436023,'y':-0.06608861097401146,'z':-0.28103421728653266},'orthogVtr':{'x':0.24477284417705114,'y':-0.3303438645081172,'z':0.9115696275849257},'minZoom':0.5}},{'longitude':67.39416666666666,'latitude':15.999722222222221,'magnitude':3.84,'b_v':0.95,'letter':'theta^1','constell':'Tau','desigNo':'77','bsNo':'1411','serialNo':424,'main':true,'letterLabel':{'vtr':{'x':-0.46050234326306305,'y':0.8837915658952994,'z':0.08276508866401552},'orthogVtr':{'x':-0.8070984485525866,'y':-0.3780728570417429,'z':-0.45348981147573875},'minZoom':3.1},'shortNameLabel':{'vtr':{'x':0.07491307816203785,'y':0.943049749331805,'z':0.32410677408148736},'orthogVtr':{'x':-0.9262064265200566,'y':0.1862358382927189,'z':-0.3278076692335847},'minZoom':1.5}},{'longitude':159.51041666666666,'latitude':-48.316944444444445,'magnitude':3.84,'b_v':0.3,'constell':'','desigNo':'','bsNo':'4167','serialNo':425,'main':false,'letterLabel':{'vtr':{'x':0.7750758374621316,'y':-0.548983418394817,'z':-0.3128492488562452},'orthogVtr':{'x':-0.10585547414505522,'y':0.3753063611494522,'z':-0.9208364425207567},'minZoom':1.8}},{'longitude':272.05625,'latitude':28.765833333333333,'magnitude':3.84,'b_v':-0.02,'letter':'omicron','constell':'Her','desigNo':'103','bsNo':'6779','serialNo':426,'main':true,'letterLabel':{'vtr':{'x':0.968331178308928,'y':-0.23186114403276264,'z':0.0926020464280432},'orthogVtr':{'x':-0.24768014539981592,'y':-0.8453739450954227,'z':0.4732836765920909},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9766317491520652,'y':-0.20123017014416622,'z':0.07547744810158495},'orthogVtr':{'x':-0.21260562518101098,'y':-0.8531841042718331,'z':0.47631474085866893},'minZoom':0.5}},{'longitude':158.43291666666667,'latitude':9.216111111111111,'magnitude':3.84,'b_v':-0.15,'letter':'rho','constell':'Leo','desigNo':'47','bsNo':'4133','serialNo':427,'main':true,'letterLabel':{'vtr':{'x':0.3066013658347925,'y':-0.2937862621378192,'z':-0.905364697040551},'orthogVtr':{'x':0.2516010207145851,'y':0.9423581086911375,'z':-0.22058585938233166},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.17187192625078124,'y':0.985119302910488,'z':0},'orthogVtr':{'x':-0.3574458170453633,'y':0.06236290459882823,'z':0.9318494277547046},'minZoom':0.5}},{'longitude':188.38375,'latitude':-72.22944444444444,'magnitude':3.84,'b_v':-0.16,'letter':'gamma','constell':'Mus','desigNo':'','bsNo':'4773','serialNo':428,'main':true,'letterLabel':{'vtr':{'x':0.5969499101632735,'y':-0.22525872092553684,'z':-0.7700060476405695},'orthogVtr':{'x':-0.7432902226497734,'y':0.20593491316867146,'z':-0.6364828799358724},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.5057087125714715,'y':-0.19956685389247975,'z':-0.8393043362551886},'orthogVtr':{'x':-0.8081387556354386,'y':0.23091935960905227,'z':-0.5418376149712666},'minZoom':0.5}},{'longitude':273.7025,'latitude':-21.052777777777777,'magnitude':3.84,'b_v':0.2,'letter':'mu','constell':'Sgr','desigNo':'13','bsNo':'6812','serialNo':429,'main':true,'letterLabel':{'vtr':{'x':-0.9862179036360574,'y':-0.16545164413719168,'z':0},'orthogVtr':{'x':-0.15408545428462922,'y':0.9184667489879437,'z':0.3642478603662859},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9862179036360574,'y':-0.16545164413719168,'z':0},'orthogVtr':{'x':-0.15408545428462922,'y':0.9184667489879437,'z':0.3642478603662859},'minZoom':0.5}},{'longitude':239.31583333333333,'latitude':15.605555555555556,'magnitude':3.85,'b_v':0.48,'letter':'gamma','constell':'Ser','desigNo':'41','bsNo':'5933','serialNo':430,'main':true,'letterLabel':{'vtr':{'x':0.45348741446047947,'y':-0.7329180031971165,'z':0.5071295352427239},'orthogVtr':{'x':-0.7434938927634017,'y':-0.6248704612252961,'z':-0.2382304307002135},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8688349057352588,'y':0.08630400554520401,'z':0.4875218202325488},'orthogVtr':{'x':-0.059664983252586484,'y':-0.9592619617962634,'z':0.27614593682372485},'minZoom':0.5}},{'longitude':63.645833333333336,'latitude':-42.25194444444445,'magnitude':3.85,'b_v':1.09,'letter':'alpha','constell':'Hor','desigNo':'','bsNo':'1326','serialNo':431,'main':true,'letterLabel':{'vtr':{'x':0.8611602056271446,'y':0.5016826637407075,'z':-0.08196099771380477},'orthogVtr':{'x':-0.38785831751037897,'y':0.5442459006121426,'z':-0.7438832739112341},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8984573910087098,'y':-0.43906072079135294,'z':0},'orthogVtr':{'x':0.2912134797010438,'y':-0.5959150769105206,'z':0.7483848811615172},'minZoom':0.5}},{'longitude':153.86833333333334,'latitude':-42.20916666666667,'magnitude':3.85,'b_v':0.05,'constell':'','desigNo':'','bsNo':'4023','serialNo':432,'main':false,'letterLabel':{'vtr':{'x':0.6132535028101272,'y':-0.24187254745960252,'z':-0.7519426920161615},'orthogVtr':{'x':-0.42627860116126853,'y':0.7000927747208601,'z':-0.5728495971680871},'minZoom':1.8}},{'longitude':279.04,'latitude':-8.230555555555556,'magnitude':3.85,'b_v':1.32,'letter':'alpha','constell':'Sct','desigNo':'','bsNo':'6973','serialNo':433,'main':true,'letterLabel':{'vtr':{'x':-0.978466785831037,'y':0.11362198433417975,'z':0.17231597053507045},'orthogVtr':{'x':0.13572310140619734,'y':0.9831562377572985,'z':0.12240527727021161},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6772912396469406,'y':-0.7357150105152883,'z':0},'orthogVtr':{'x':-0.7190928924188779,'y':0.6619890984507311,'z':0.21136661421577593},'minZoom':0.5}},{'longitude':276.11125,'latitude':21.778888888888886,'magnitude':3.85,'b_v':1.17,'constell':'Her','desigNo':'109','bsNo':'6895','serialNo':434,'main':true,'letterLabel':{'vtr':{'x':0.49390673307836264,'y':0.7872339244427435,'z':-0.36921387734798944},'orthogVtr':{'x':0.8638765750659042,'y':-0.49254713144993745,'z':0.1054257385691071},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9662865766955875,'y':-0.25746893346173333,'z':0},'orthogVtr':{'x':-0.23773272729193135,'y':-0.8922161603530631,'z':0.383970667602589},'minZoom':0.5}},{'longitude':189.66666666666666,'latitude':-48.6375,'magnitude':3.85,'b_v':0.05,'letter':'tau','constell':'Cen','desigNo':'','bsNo':'4802','serialNo':435,'main':true,'letterLabel':{'vtr':{'x':-0.614227838837521,'y':0.4358661858544778,'z':-0.6578334363846656},'orthogVtr':{'x':-0.4453680464089041,'y':0.49669383685238944,'z':0.7449446527566783},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.552658315458388,'y':0.36922067271628933,'z':-0.7471578689899664},'orthogVtr':{'x':-0.5198050799288061,'y':0.5480512698438068,'z':0.6553186129683777},'minZoom':0.5}},{'longitude':86.925,'latitude':-51.06083333333333,'magnitude':3.85,'b_v':0.17,'letter':'beta','constell':'Pic','desigNo':'','bsNo':'2020','serialNo':436,'main':true,'letterLabel':{'vtr':{'x':0.42995066265990245,'y':0.57815791605268,'z':-0.6934521265263617},'orthogVtr':{'x':-0.9022226805457837,'y':0.2464533901223482,'z':-0.35391377651340783},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.9990619221529388,'y':-0.04330445362864595,'z':0},'orthogVtr':{'x':0.027177441325187325,'y':-0.6270012549374209,'z':0.7785440340725215},'minZoom':0.5}},{'longitude':188.555,'latitude':69.69194444444445,'magnitude':3.85,'b_v':-0.12,'letter':'kappa','constell':'Dra','desigNo':'5','bsNo':'4787','main':true,'serialNo':437,'letterLabel':{'vtr':{'x':0.9390925992469682,'y':0.34366421117069074,'z':0},'orthogVtr':{'x':0.017743150296437454,'y':-0.04848471440756213,'z':0.9986663171882665},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9390925992469682,'y':0.34366421117069074,'z':0},'orthogVtr':{'x':0.017743150296437454,'y':-0.04848471440756213,'z':0.9986663171882665},'minZoom':0.5}},{'longitude':95.68833333333333,'latitude':-33.44611111111111,'magnitude':3.85,'b_v':0.86,'letter':'delta','constell':'Col','desigNo':'','bsNo':'2296','serialNo':438,'main':true,'letterLabel':{'vtr':{'x':0.9497130202720292,'y':0.20888965302291504,'z':-0.2332601380127911},'orthogVtr':{'x':-0.30200209017726776,'y':0.8078342040546197,'z':-0.5061606822818225},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.057925837869739344,'y':-0.8290828239234928,'z':0.5561171354868824},'orthogVtr':{'x':0.9948892805999806,'y':-0.09408857239666144,'z':-0.03664232377471602},'minZoom':0.5}},{'longitude':269.2133333333333,'latitude':37.24916666666667,'magnitude':3.86,'b_v':1.35,'letter':'theta','constell':'Her','desigNo':'91','bsNo':'6695','serialNo':439,'main':true,'letterLabel':{'vtr':{'x':0.9998370349052303,'y':0.018052801220787427,'z':0},'orthogVtr':{'x':0.014368870402026033,'y':-0.795806069207502,'z':0.6053810665819297},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9998370349052303,'y':0.018052801220787427,'z':0},'orthogVtr':{'x':0.014368870402026033,'y':-0.795806069207502,'z':0.6053810665819297},'minZoom':0.5}},{'longitude':14.432916666666667,'latitude':38.59388888888889,'magnitude':3.86,'b_v':0.13,'letter':'mu','constell':'And','desigNo':'37','bsNo':'269','serialNo':440,'main':true,'letterLabel':{'vtr':{'x':0.6468094130410688,'y':-0.7576720125907951,'z':0.08700979564441007},'orthogVtr':{'x':0.0933239373530661,'y':0.19186290962500102,'z':0.9769745475840963},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.27266094751259295,'y':0.5723597412599124,'z':0.7733436068698191},'orthogVtr':{'x':-0.5939089002390401,'y':0.5322429720889169,'z':-0.6033155367457486},'minZoom':0.5}},{'longitude':244.26083333333332,'latitude':-63.72833333333333,'magnitude':3.86,'b_v':1.11,'letter':'delta','constell':'TrA','desigNo':'','bsNo':'6030','serialNo':441,'main':true,'letterLabel':{'vtr':{'x':0.9252743728162206,'y':-0.030231914363201412,'z':0.3780917433156743},'orthogVtr':{'x':0.32698313690023856,'y':-0.4415941735870524,'z':-0.8355097929030206},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9252743728162206,'y':-0.030231914363201412,'z':0.3780917433156743},'orthogVtr':{'x':0.32698313690023856,'y':-0.4415941735870524,'z':-0.8355097929030206},'minZoom':0.5}},{'longitude':335.64,'latitude':-1.298611111111111,'magnitude':3.86,'b_v':-0.06,'letter':'gamma','constell':'Aqr','desigNo':'48','bsNo':'8518','serialNo':442,'main':true,'letterLabel':{'vtr':{'x':-0.2539541766492212,'y':-0.8181310299757434,'z':0.5159155880114938},'orthogVtr':{'x':-0.32567440337659365,'y':0.5745850691838794,'z':0.7508582963890433},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.24743613917774177,'y':-0.8293810256835189,'z':0.5009016582773183},'orthogVtr':{'x':-0.3306537431832539,'y':0.5582235199043195,'z':0.7609563745343977},'minZoom':0.5}},{'longitude':82.95875,'latitude':-35.45861111111111,'magnitude':3.86,'b_v':1.13,'letter':'epsilon','constell':'Col','desigNo':'','bsNo':'1862','serialNo':443,'main':true,'letterLabel':{'vtr':{'x':0.2354683388376731,'y':-0.7755973457200317,'z':0.5856649372440428},'orthogVtr':{'x':0.9667392975069873,'y':0.24882861757209318,'z':-0.05915614704202855},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8212172648693374,'y':-0.4106904167831519,'z':0.396150962945953},'orthogVtr':{'x':0.5618117227504255,'y':0.7034204327237576,'z':-0.43539325098917286},'minZoom':0.5}},{'longitude':249.04708333333335,'latitude':-78.93277777777779,'magnitude':3.86,'b_v':0.92,'letter':'gamma','constell':'Aps','desigNo':'','bsNo':'6102','serialNo':444,'main':true,'letterLabel':{'vtr':{'x':0.9590664660485547,'y':-0.11440099446464896,'z':-0.25904425522801283},'orthogVtr':{'x':-0.2747350495823866,'y':-0.15414690366965922,'z':-0.9490834444979115},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.997562715917673,'y':0.06977555310390732,'z':0},'orthogVtr':{'x':0.012508460291184579,'y':0.17883016421870124,'z':0.9838004425627467},'minZoom':0.5}},{'longitude':69.74583333333334,'latitude':-14.271111111111113,'magnitude':3.86,'b_v':1.08,'constell':'Eri','desigNo':'53','bsNo':'1481','serialNo':445,'main':true,'letterLabel':{'vtr':{'x':0.17618540339385091,'y':0.9645448822766571,'z':-0.19649904250366118},'orthogVtr':{'x':-0.9254172431152984,'y':0.09426448938478521,'z':-0.36703832522763374},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.5921062141854911,'y':-0.8058599326948358,'z':0},'orthogVtr':{'x':0.7326995300579214,'y':-0.5383515512768022,'z':0.4163280027703661},'minZoom':0.5}},{'longitude':220.99625,'latitude':-5.733333333333333,'magnitude':3.87,'b_v':0.39,'letter':'mu','constell':'Vir','desigNo':'107','bsNo':'5487','serialNo':446,'main':true,'letterLabel':{'vtr':{'x':-0.5887243299144073,'y':-0.3463912834479312,'z':-0.7303538471988269},'orthogVtr':{'x':-0.2990606481540265,'y':0.9327557782841602,'z':-0.20131911683495105},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.131863311761448,'y':0.9912679087972652,'z':0},'orthogVtr':{'x':0.6470283416657863,'y':0.086070878698261,'z':0.75759232369483},'minZoom':0.5}},{'longitude':209.94208333333333,'latitude':-44.888333333333335,'magnitude':3.87,'b_v':-0.21,'letter':'upsilon^1','constell':'Cen','desigNo':'','bsNo':'5249','serialNo':447,'main':true,'letterLabel':{'vtr':{'x':-0.7659056377113069,'y':0.4241537796746877,'z':-0.4831998813221222},'orthogVtr':{'x':-0.19101751264088876,'y':0.5674879005322178,'z':0.8009180935738834},'minZoom':1.8},'shortNameLabel':{'vtr':{'x':0.6657681896153471,'y':-0.22225178531000828,'z':0.7122898719080718},'orthogVtr':{'x':0.42408944069592075,'y':-0.6727206626745619,'z':-0.6062961786956269},'minZoom':0.5}},{'longitude':298.3408333333333,'latitude':1.0516666666666667,'magnitude':3.87,'b_v':0.63,'letter':'eta','constell':'Aql','desigNo':'55','bsNo':'7570','serialNo':448,'main':true,'letterLabel':{'vtr':{'x':0.3516798467030599,'y':0.9125560855197187,'z':-0.20871673676023245},'orthogVtr':{'x':0.8068719323523443,'y':-0.4085394973590521,'z':-0.4266768846323959},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.03864081663990113,'y':-0.9992531647632653,'z':0},'orthogVtr':{'x':-0.8793337916198238,'y':-0.03400357087215277,'z':0.47499035788471233},'minZoom':0.5}},{'longitude':56.71791666666667,'latitude':24.421111111111113,'magnitude':3.87,'b_v':-0.06,'constell':'Tau','desigNo':'20','bsNo':'1149','serialNo':449,'main':true,'letterLabel':{'vtr':{'x':-0.6374986151328647,'y':0.7704515012015224,'z':-2.224635385436222e-15},'orthogVtr':{'x':-0.5864562190818613,'y':-0.48525446042703496,'z':-0.6485346650225221},'minZoom':6},'shortNameLabel':{'vtr':{'x':0.0795195544037951,'y':0.8531406144739636,'z':0.5155848450084716},'orthogVtr':{'x':-0.862561314726979,'y':0.31814854864198316,'z':-0.39340752322936756},'minZoom':2.1}},{'longitude':239.49208333333334,'latitude':-29.26388888888889,'magnitude':3.87,'b_v':-0.2,'letter':'rho','constell':'Sco','desigNo':'5','bsNo':'5928','serialNo':450,'main':true,'letterLabel':{'vtr':{'x':0.8430568819605153,'y':-0.5123627712956289,'z':0.16352212195686827},'orthogVtr':{'x':-0.30515932250286193,'y':-0.7060644138075404,'z':-0.639023341861789},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7263428324811546,'y':-0.6870732774671502,'z':-0.018878588236462497},'orthogVtr':{'x':-0.5256360033660606,'y':-0.5375619752602214,'z':-0.6593435483264274},'minZoom':0.5}},{'longitude':131.65541666666667,'latitude':-46.10611111111111,'magnitude':3.87,'b_v':0.02,'constell':'','desigNo':'','bsNo':'3487','serialNo':451,'main':false,'letterLabel':{'vtr':{'x':-0.8704394979927708,'y':0.25310306633627433,'z':0.4222249615374117},'orthogVtr':{'x':0.17315302812002628,'y':-0.6454752925648596,'z':0.7438949358217023},'minZoom':1.8}},{'longitude':228.29,'latitude':-48.80305555555555,'magnitude':3.88,'b_v':-0.03,'letter':'kappa^1','constell':'Lup','desigNo':'','bsNo':'5646','serialNo':452,'main':true,'letterLabel':{'vtr':{'x':-0.30923205512334595,'y':-0.38742334319551835,'z':-0.8684921929593838},'orthogVtr':{'x':-0.8439915907135364,'y':0.5326557024578413,'z':0.06289751540385946},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.4929770875641706,'y':0.6586147738926856,'z':0.568506966313549},'orthogVtr':{'x':0.7516115088579481,'y':-0.006747134498082119,'z':0.6595715396591516},'minZoom':1.3}},{'longitude':347.8358333333333,'latitude':-45.151666666666664,'magnitude':3.88,'b_v':1,'letter':'iota','constell':'Gru','desigNo':'','bsNo':'8820','serialNo':453,'main':true,'letterLabel':{'vtr':{'x':-0.5778940648085066,'y':-0.6619799639815654,'z':-0.47730595758493016},'orthogVtr':{'x':-0.43677004592164903,'y':-0.2431778298973374,'z':0.8660810989924803},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7169361520295436,'y':-0.6971388340302607,'z':0},'orthogVtr':{'x':-0.10359622130352467,'y':0.10653814224746816,'z':0.9888970862420869},'minZoom':0.5}},{'longitude':2.5733333333333333,'latitude':-45.651111111111106,'magnitude':3.88,'b_v':1.01,'letter':'epsilon','constell':'Phe','desigNo':'','bsNo':'25','serialNo':454,'main':true,'letterLabel':{'vtr':{'x':-0.35407488126885966,'y':-0.38321025015358867,'z':0.8531007458862445},'orthogVtr':{'x':0.62207639708335,'y':0.5846253927461473,'z':0.5208014077824781},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.7154489843552461,'y':-0.6986649774999794,'z':0},'orthogVtr':{'x':0.021927520124394778,'y':-0.022454284253038755,'z':0.999507373149332},'minZoom':0.5}},{'longitude':148.43875,'latitude':25.92388888888889,'magnitude':3.88,'b_v':1.22,'letter':'mu','constell':'Leo','desigNo':'24','bsNo':'3905','serialNo':455,'main':true,'letterLabel':{'vtr':{'x':-0.00045428682405346255,'y':0.7323785224860239,'z':0.6808975645606836},'orthogVtr':{'x':-0.6424339189556489,'y':-0.5220135391210023,'z':0.5610530498532672},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.00045428682405346255,'y':0.7323785224860239,'z':0.6808975645606836},'orthogVtr':{'x':-0.6424339189556489,'y':-0.5220135391210023,'z':0.5610530498532672},'minZoom':0.5}},{'longitude':299.24083333333334,'latitude':35.130833333333335,'magnitude':3.89,'b_v':1.02,'letter':'eta','constell':'Cyg','desigNo':'21','bsNo':'7615','main':true,'serialNo':456,'letterLabel':{'vtr':{'x':0.8600859641438907,'y':0.03412345302959896,'z':-0.5090066052970342},'orthogVtr':{'x':0.31725692545154927,'y':-0.8171279725362555,'z':0.48130023867833155},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8214468603817761,'y':-0.570285065181373,'z':0},'orthogVtr':{'x':-0.40697036505526873,'y':-0.586206003021934,'z':0.7005266904178811},'minZoom':0.5}},{'longitude':103.715,'latitude':-24.20722222222222,'magnitude':3.89,'b_v':1.74,'letter':'omicron^1','constell':'CMa','desigNo':'16','bsNo':'2580','serialNo':457,'main':true,'letterLabel':{'vtr':{'x':0.9144282414273899,'y':0.23296993906142666,'z':-0.33097733876162366},'orthogVtr':{'x':-0.342139262104032,'y':0.8818128158277241,'z':-0.3245718459276608},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9280200506954763,'y':0.19564354265661044,'z':-0.3170211187349145},'orthogVtr':{'x':-0.3033431537059075,'y':0.8908380542394199,'z':-0.33821663504132815},'minZoom':0.5}},{'longitude':138.81833333333333,'latitude':2.2397222222222224,'magnitude':3.89,'b_v':-0.06,'letter':'theta','constell':'Hya','desigNo':'22','bsNo':'3665','serialNo':458,'main':true,'letterLabel':{'vtr':{'x':0.05189532255302433,'y':0.9986525299107382,'z':0},'orthogVtr':{'x':-0.6570590952767542,'y':0.034144302111599606,'z':0.7530654101387243},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.05189532255302433,'y':0.9986525299107382,'z':0},'orthogVtr':{'x':-0.6570590952767542,'y':0.034144302111599606,'z':0.7530654101387243},'minZoom':0.5}},{'longitude':44.32083333333333,'latitude':-8.829444444444444,'magnitude':3.89,'b_v':1.09,'letter':'eta','constell':'Eri','desigNo':'3','bsNo':'874','serialNo':459,'main':true,'letterLabel':{'vtr':{'x':-0.2121743627784799,'y':-0.9772318249932029,'z':0},'orthogVtr':{'x':0.6746768555112073,'y':-0.14648431235901943,'z':0.7234317430623395},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.2121743627784799,'y':-0.9772318249932029,'z':0},'orthogVtr':{'x':0.6746768555112073,'y':-0.14648431235901943,'z':0.7234317430623395},'minZoom':0.5}},{'longitude':185.20041666666665,'latitude':-0.7638888888888888,'magnitude':3.89,'b_v':0.03,'letter':'eta','constell':'Vir','desigNo':'15','bsNo':'4689','serialNo':460,'main':true,'letterLabel':{'vtr':{'x':0.010788305408129752,'y':-0.9995356231664426,'z':-0.028498254116562854},'orthogVtr':{'x':-0.09096961777079526,'y':0.027400662346457594,'z':-0.9954766357607852},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.01338707613555152,'y':0.9999103890812122,'z':0},'orthogVtr':{'x':0.09062364527806535,'y':0.0012132943634413427,'z':0.9958844726339009},'minZoom':0.5}},{'longitude':170.4525,'latitude':-54.58694444444445,'magnitude':3.9,'b_v':-0.16,'letter':'pi','constell':'Cen','desigNo':'','bsNo':'4390','serialNo':461,'main':true,'letterLabel':{'vtr':{'x':-0.8187864394946806,'y':0.5740982202547084,'z':0},'orthogVtr':{'x':-0.05517853105692329,'y':-0.07869634739609584,'z':0.9953703906671694},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8187864394946806,'y':0.5740982202547084,'z':0},'orthogVtr':{'x':-0.05517853105692329,'y':-0.07869634739609584,'z':0.9953703906671694},'minZoom':0.5}},{'longitude':145.1875,'latitude':-1.2230555555555558,'magnitude':3.9,'b_v':1.31,'letter':'iota','constell':'Hya','desigNo':'35','bsNo':'3845','serialNo':462,'main':true,'letterLabel':{'vtr':{'x':-0.025994802941869944,'y':0.9996620780143725,'z':0},'orthogVtr':{'x':-0.5705697644224154,'y':-0.014836862292716281,'z':0.8211151024334267},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.025994802941869944,'y':0.9996620780143725,'z':0},'orthogVtr':{'x':-0.5705697644224154,'y':-0.014836862292716281,'z':0.8211151024334267},'minZoom':0.5}},{'longitude':203.01625,'latitude':-39.49722222222222,'magnitude':3.9,'b_v':1.19,'constell':'','desigNo':'','bsNo':'5089','serialNo':463,'main':false,'letterLabel':{'vtr':{'x':0.021635813584550967,'y':-0.4481029201699719,'z':-0.8937201264969243},'orthogVtr':{'x':-0.7036401596687608,'y':0.6282164123959872,'z':-0.3320160612043276},'minZoom':1.8}},{'longitude':234.12708333333333,'latitude':-14.846666666666668,'magnitude':3.91,'b_v':1.01,'letter':'gamma','constell':'Lib','desigNo':'38','bsNo':'5787','serialNo':464,'main':false,'letterLabel':{'vtr':{'x':-0.4121581775546234,'y':0.9111123073885303,'z':0},'orthogVtr':{'x':0.7136435133220728,'y':0.3228295869666867,'z':0.6216864110403633},'minZoom':0.5}},{'longitude':61.0225,'latitude':6.036666666666666,'magnitude':3.91,'b_v':0.03,'letter':'nu','constell':'Tau','desigNo':'38','bsNo':'1251','serialNo':465,'main':false,'letterLabel':{'vtr':{'x':0.6694501466293371,'y':-0.684774144985378,'z':0.2879598436197369},'orthogVtr':{'x':0.56544218285727,'y':0.7211273925185643,'z':0.40031290461960145},'minZoom':0.5}},{'longitude':126.63375,'latitude':-3.9644444444444447,'magnitude':3.91,'b_v':-0.01,'constell':'','desigNo':'','bsNo':'3314','serialNo':466,'main':false,'letterLabel':{'vtr':{'x':-0.4358853163300215,'y':-0.8091781044195779,'z':0.3939984598140144},'orthogVtr':{'x':0.6750242847322944,'y':-0.5834816310713474,'z':-0.4515433547556363},'minZoom':1.8}},{'longitude':187.24833333333333,'latitude':-50.327222222222225,'magnitude':3.91,'b_v':-0.19,'letter':'sigma','constell':'Cen','desigNo':'','bsNo':'4743','serialNo':467,'main':false,'letterLabel':{'vtr':{'x':0.7052389105986836,'y':-0.5311145741186144,'z':0.4696332485422905},'orthogVtr':{'x':0.3186982681414749,'y':-0.3542240332790092,'z':-0.8791795880997102},'minZoom':0.5}},{'longitude':245.06708333333333,'latitude':46.2725,'magnitude':3.91,'b_v':-0.15,'letter':'tau','constell':'Her','desigNo':'22','bsNo':'6092','serialNo':468,'main':false,'letterLabel':{'vtr':{'x':0.9409726947297912,'y':0.3344937169452545,'z':0.05181062726027857},'orthogVtr':{'x':0.17222318268409814,'y':-0.6049065556673063,'z':0.777449184356686},'minZoom':0.5}},{'longitude':255.24,'latitude':30.901666666666664,'magnitude':3.92,'b_v':-0.02,'letter':'epsilon','constell':'Her','desigNo':'58','bsNo':'6324','serialNo':469,'main':false,'letterLabel':{'vtr':{'x':0.6211027275035814,'y':-0.5825896473734316,'z':0.524233444813389},'orthogVtr':{'x':-0.7526239519606199,'y':-0.6299516241186641,'z':0.1916197750897232},'minZoom':0.5}},{'longitude':319.1745833333333,'latitude':5.321111111111111,'magnitude':3.92,'b_v':0.55,'letter':'alpha','constell':'Equ','desigNo':'8','bsNo':'8131','serialNo':470,'main':false,'letterLabel':{'vtr':{'x':0.12216282343728711,'y':-0.992510072780035,'z':0},'orthogVtr':{'x':-0.6460635597425899,'y':-0.07952055172299591,'z':0.7591300011370933},'minZoom':0.5}},{'longitude':290.6716666666667,'latitude':-17.81277777777778,'magnitude':3.92,'b_v':0.23,'letter':'rho^1','constell':'Sgr','desigNo':'44','bsNo':'7340','serialNo':471,'main':false,'letterLabel':{'vtr':{'x':0.9244026201213398,'y':-0.07395810896434835,'z':-0.3741790935250387},'orthogVtr':{'x':-0.18034363072502535,'y':-0.9491842373657265,'z':-0.25792529614863263},'minZoom':0.5}},{'longitude':270.3804166666667,'latitude':2.9319444444444445,'magnitude':3.93,'b_v':0.03,'constell':'Oph','desigNo':'67','bsNo':'6714','serialNo':472,'main':false,'letterLabel':{'vtr':{'x':-0.6167568491758362,'y':0.7863218727067447,'z':-0.03617874372684936},'orthogVtr':{'x':0.7871257978908023,'y':0.6156960412228797,'z':-0.03676089113775606},'minZoom':0.5}},{'longitude':241.95833333333334,'latitude':-20.71527777777778,'magnitude':3.93,'b_v':-0.05,'letter':'omega^1','constell':'Sco','desigNo':'9','bsNo':'5993','serialNo':473,'main':false,'letterLabel':{'vtr':{'x':-0.7854838190560124,'y':-0.2942451606132478,'z':-0.544458405626055},'orthogVtr':{'x':-0.4355008439930912,'y':0.8878619992846952,'z':0.1484590351157165},'minZoom':1.7}},{'longitude':6.765,'latitude':-43.58277777777778,'magnitude':3.93,'b_v':0.18,'letter':'kappa','constell':'Phe','desigNo':'','bsNo':'100','serialNo':474,'main':false,'letterLabel':{'vtr':{'x':-0.6835752682484597,'y':-0.7243529138870566,'z':0.08965326978073247},'orthogVtr':{'x':0.12361613472416254,'y':0.00616135010571172,'z':0.9923109840169726},'minZoom':0.5}},{'longitude':167.33583333333334,'latitude':-59.07,'magnitude':3.93,'b_v':1.23,'letter':'v382','constell':'Car','desigNo':'','bsNo':'4337','serialNo':475,'main':false,'letterLabel':{'vtr':{'x':-0.49005442032990765,'y':0.17429822179567567,'z':0.8540882829040471},'orthogVtr':{'x':0.712992589061076,'y':-0.4835352379309027,'z':0.5077747941982637},'minZoom':0.5}},{'longitude':22.994583333333335,'latitude':-48.98222222222223,'magnitude':3.93,'b_v':0.97,'letter':'delta','constell':'Phe','desigNo':'','bsNo':'440','serialNo':476,'main':false,'letterLabel':{'vtr':{'x':0.3949094481831448,'y':0.004037363128104154,'z':0.9187111773754885},'orthogVtr':{'x':0.6921379912378995,'y':0.6562807506874726,'z':-0.3004006946767149},'minZoom':0.5}},{'longitude':43.8775,'latitude':52.83277777777778,'magnitude':3.93,'b_v':0.76,'letter':'tau','constell':'Per','desigNo':'18','bsNo':'854','serialNo':477,'main':false,'letterLabel':{'vtr':{'x':0.8658282998165635,'y':-0.24347003228135064,'z':0.4371083373920898},'orthogVtr':{'x':-0.2463695983771792,'y':0.552911851043896,'z':0.7959839860014021},'minZoom':0.5}},{'longitude':69.29875,'latitude':-3.3177777777777777,'magnitude':3.93,'b_v':-0.21,'letter':'nu','constell':'Eri','desigNo':'48','bsNo':'1463','serialNo':478,'main':false,'letterLabel':{'vtr':{'x':0.934724172350117,'y':0.06643505263252245,'z':0.3491090165064529},'orthogVtr':{'x':-0.04183733698383217,'y':0.9961109416938211,'z':-0.07754114438122703},'minZoom':0.5}},{'longitude':115.39875,'latitude':-72.64777777777779,'magnitude':3.93,'b_v':1.03,'letter':'zeta','constell':'Vol','desigNo':'','bsNo':'3024','serialNo':479,'main':false,'letterLabel':{'vtr':{'x':-0.28397367824359804,'y':-0.22502639830494844,'z':0.9320526112461165},'orthogVtr':{'x':0.9502604622060855,'y':-0.19573752922563545,'z':0.24226405763241207},'minZoom':0.5}},{'longitude':17.279166666666665,'latitude':-55.152499999999996,'magnitude':3.94,'b_v':-0.12,'letter':'zeta','constell':'Phe','desigNo':'','bsNo':'338','serialNo':480,'main':false,'letterLabel':{'vtr':{'x':0.7517414359191327,'y':0.568790112667928,'z':-0.33371038529456354},'orthogVtr':{'x':-0.37040302324677843,'y':-0.05448907670651856,'z':-0.9272715572524145},'minZoom':0.5}},{'longitude':314.45666666666665,'latitude':41.23527777777778,'magnitude':3.94,'b_v':0.03,'letter':'nu','constell':'Cyg','desigNo':'58','bsNo':'8028','main':false,'serialNo':481,'letterLabel':{'vtr':{'x':-0.7212455162396023,'y':0.012316396406303998,'z':0.6925700048975789},'orthogVtr':{'x':-0.4498982597662229,'y':0.751908336739218,'z':-0.4818977163272174},'minZoom':0.5}},{'longitude':131.41916666666665,'latitude':18.08888888888889,'magnitude':3.94,'b_v':1.08,'letter':'delta','constell':'Cnc','desigNo':'47','bsNo':'3461','serialNo':482,'main':false,'letterLabel':{'vtr':{'x':-0.507677983354804,'y':-0.8583633789772086,'z':0.0739957758769264},'orthogVtr':{'x':0.5888896797492101,'y':-0.40842008867776297,'z':-0.6974252477859696},'minZoom':0.5}},{'longitude':116.1275,'latitude':-28.997500000000002,'magnitude':3.94,'b_v':0.16,'constell':'Pup','desigNo':'3','bsNo':'2996','serialNo':483,'main':false,'letterLabel':{'vtr':{'x':0.691546550551577,'y':0.4118276817223095,'z':-0.5934318233693264},'orthogVtr':{'x':-0.6110734302022582,'y':0.771618166422762,'z':-0.17662012384555884},'minZoom':0.5}},{'longitude':115.52083333333333,'latitude':-9.593055555555557,'magnitude':3.94,'b_v':1.02,'letter':'alpha','constell':'Mon','desigNo':'26','bsNo':'2970','serialNo':484,'main':false,'letterLabel':{'vtr':{'x':-0.3651925870154684,'y':0.9309319923544089,'z':0},'orthogVtr':{'x':-0.8283519842774082,'y':-0.3249517758355193,'z':0.4563324813390156},'minZoom':0.5}},{'longitude':99.36208333333333,'latitude':-19.271944444444443,'magnitude':3.95,'b_v':1.04,'letter':'nu^2','constell':'CMa','desigNo':'7','bsNo':'2429','serialNo':485,'main':false,'letterLabel':{'vtr':{'x':0.3050622234720881,'y':-0.9123599197258847,'z':0.2730135833398096},'orthogVtr':{'x':0.9398708429468737,'y':0.2422084137095865,'z':-0.24078596908171201},'minZoom':0.5}},{'longitude':31.24125,'latitude':72.505,'magnitude':3.95,'b_v':0,'constell':'Cas','desigNo':'50','bsNo':'580','main':false,'serialNo':486,'letterLabel':{'vtr':{'x':0.5878859459430467,'y':-0.2823594561122305,'z':-0.7580654669002241},'orthogVtr':{'x':0.7670240477897318,'y':-0.10318462894894895,'z':0.6332669598683663},'minZoom':0.5}},{'longitude':62.48458333333333,'latitude':47.7575,'magnitude':3.96,'b_v':-0.03,'letter':'MX','constell':'Per','desigNo':'48','bsNo':'1273','serialNo':487,'main':false,'letterLabel':{'vtr':{'x':0.7928128924971884,'y':-0.5477833653817659,'z':-0.26717242017331844},'orthogVtr':{'x':0.5243926928580747,'y':0.38971811984692095,'z':0.7570548796091587},'minZoom':1.3}},{'longitude':137.91875,'latitude':-62.38916666666667,'magnitude':3.96,'b_v':-0.18,'constell':'','desigNo':'','bsNo':'3663','serialNo':488,'main':false,'letterLabel':{'vtr':{'x':0.8729017799046072,'y':-0.4236669077759748,'z':0.24196866304319772},'orthogVtr':{'x':0.346005683704533,'y':0.18789584486463165,'z':-0.919225335990455},'minZoom':1.8}},{'longitude':304.00333333333333,'latitude':47.76861111111111,'magnitude':3.96,'b_v':1.45,'letter':'omicron^2','constell':'Cyg','desigNo':'32','bsNo':'7751','main':false,'serialNo':489,'letterLabel':{'vtr':{'x':-0.12356302960329105,'y':0.6359681968099319,'z':-0.7617589056660776},'orthogVtr':{'x':0.9183930986615947,'y':-0.2174816240192744,'z':-0.33053874136732264},'minZoom':0.5}},{'longitude':135.4425,'latitude':41.71222222222222,'magnitude':3.96,'b_v':0.46,'constell':'','desigNo':'','bsNo':'3579','serialNo':490,'main':false,'letterLabel':{'vtr':{'x':0.6189948466212261,'y':-0.11655168164178487,'z':-0.7766988382654098},'orthogVtr':{'x':0.5778524718658528,'y':0.7373414210648939,'z':0.34987733499117485},'minZoom':1.8}},{'longitude':89.92083333333333,'latitude':-42.815,'magnitude':3.96,'b_v':1.15,'letter':'eta','constell':'Col','desigNo':'','bsNo':'2120','serialNo':491,'main':false,'letterLabel':{'vtr':{'x':-0.9999988879589149,'y':-0.0014913352854216697,'z':0},'orthogVtr':{'x':0.0010939708804082009,'y':-0.733550446074452,'z':0.6796341267856444},'minZoom':0.5}},{'longitude':290.97291666666666,'latitude':-44.42444444444444,'magnitude':3.96,'b_v':-0.09,'letter':'beta^1','constell':'Sgr','desigNo':'','bsNo':'7337','serialNo':492,'main':false,'letterLabel':{'vtr':{'x':-0.04617882592390243,'y':0.680148810000607,'z':0.731618146502018},'orthogVtr':{'x':0.9656733141273603,'y':0.2178124421727311,'z':-0.14153724038934587},'minZoom':0.5}},{'longitude':350.9716666666667,'latitude':-20.005,'magnitude':3.96,'b_v':1.08,'constell':'Aqr','desigNo':'98','bsNo':'8892','serialNo':493,'main':false,'letterLabel':{'vtr':{'x':0.12632929325170356,'y':0.6613698423770599,'z':0.7393448730198028},'orthogVtr':{'x':0.35045347747393557,'y':0.6674998528233957,'z':-0.6569827293066167},'minZoom':0.5}},{'longitude':291.27375,'latitude':-40.581388888888895,'magnitude':3.96,'b_v':-0.11,'letter':'alpha','constell':'Sgr','desigNo':'','bsNo':'7348','serialNo':494,'main':false,'letterLabel':{'vtr':{'x':0.960925066376583,'y':0.16628502766362907,'z':-0.22129687386871444},'orthogVtr':{'x':-0.02627486955413591,'y':-0.7410554587890077,'z':-0.6709295329831045},'minZoom':0.5}},{'longitude':66.17375,'latitude':-33.977222222222224,'magnitude':3.97,'b_v':1.47,'constell':'Eri','desigNo':'43','bsNo':'1393','serialNo':495,'main':false,'letterLabel':{'vtr':{'x':-0.9399202122006891,'y':-0.25444089730234465,'z':-0.2276177156475066},'orthogVtr':{'x':0.06580809097194865,'y':-0.7892602020926206,'z':0.610522422647476},'minZoom':0.5}},{'longitude':238.01875,'latitude':-33.67916666666667,'magnitude':3.97,'b_v':-0.05,'letter':'chi','constell':'Lup','desigNo':'5','bsNo':'5883','serialNo':496,'main':false,'letterLabel':{'vtr':{'x':-0.28769982170405195,'y':-0.657595574015511,'z':-0.6962735623493596},'orthogVtr':{'x':-0.8502782834748763,'y':0.5099523117260658,'z':-0.13028998586330323},'minZoom':0.5}},{'longitude':130.19708333333332,'latitude':-35.37111111111111,'magnitude':3.97,'b_v':0.94,'letter':'beta','constell':'Pyx','desigNo':'','bsNo':'3438','serialNo':497,'main':false,'letterLabel':{'vtr':{'x':0.31959557032075664,'y':-0.813445990192158,'z':0.48596737799120837},'orthogVtr':{'x':0.7879596425277664,'y':-0.0567011566981957,'z':-0.6131105777725594},'minZoom':0.5}},{'longitude':300.64666666666665,'latitude':-72.86194444444443,'magnitude':3.97,'b_v':-0.03,'letter':'epsilon','constell':'Pav','desigNo':'','bsNo':'7590','serialNo':498,'main':false,'letterLabel':{'vtr':{'x':-0.9878703010093035,'y':-0.15528125573870175,'z':0},'orthogVtr':{'x':-0.039366434729638196,'y':0.25044189358869445,'z':0.9673309370388121},'minZoom':0.5}},{'longitude':337.57708333333335,'latitude':-43.40555555555555,'magnitude':3.97,'b_v':1.02,'letter':'delta^1','constell':'Gru','desigNo':'','bsNo':'8556','serialNo':499,'main':false,'letterLabel':{'vtr':{'x':0.47398680816516936,'y':0.6859112181489491,'z':0.5521433749514885},'orthogVtr':{'x':0.569488970715567,'y':0.23945718039211433,'z':-0.7863476146030982},'minZoom':0.5}},{'longitude':88.17583333333333,'latitude':39.151944444444446,'magnitude':3.97,'b_v':1.13,'letter':'nu','constell':'Aur','desigNo':'32','bsNo':'2012','serialNo':500,'main':false,'letterLabel':{'vtr':{'x':0.6324424869542254,'y':0.5905815449320325,'z':0.5012284304395036},'orthogVtr':{'x':-0.7742138875132185,'y':0.5025672635452302,'z':0.38473237710690417},'minZoom':0.5}},{'longitude':183.14333333333335,'latitude':-52.465833333333336,'magnitude':3.97,'b_v':-0.16,'letter':'rho','constell':'Cen','desigNo':'','bsNo':'4638','serialNo':501,'main':false,'letterLabel':{'vtr':{'x':0.7872182683962111,'y':-0.5974547044486113,'z':0.15275887547207728},'orthogVtr':{'x':0.10117726262942454,'y':-0.1192243564393001,'z':-0.9876986961409089},'minZoom':1.5}},{'longitude':109.20458333333333,'latitude':-67.98916666666666,'magnitude':3.97,'b_v':0.76,'letter':'delta','constell':'Vol','desigNo':'','bsNo':'2803','serialNo':502,'main':false,'letterLabel':{'vtr':{'x':-0.6167754602235913,'y':0.3509796437707957,'z':-0.7045575358510493},'orthogVtr':{'x':-0.7774250344770053,'y':-0.13143347882674333,'z':0.6150898766943961},'minZoom':0.5}},{'longitude':341.8441666666667,'latitude':23.658055555555553,'magnitude':3.97,'b_v':1.07,'letter':'lambda','constell':'Peg','desigNo':'47','bsNo':'8667','serialNo':503,'main':false,'letterLabel':{'vtr':{'x':0.11518881425946179,'y':-0.7294336136004174,'z':0.6742834273651818},'orthogVtr':{'x':-0.4787655181211097,'y':0.5539883562416702,'z':0.6810877181442034},'minZoom':0.5}},{'longitude':60.02625,'latitude':35.84,'magnitude':3.98,'b_v':0.02,'letter':'xi','constell':'Per','desigNo':'46','bsNo':'1228','serialNo':504,'main':false,'letterLabel':{'vtr':{'x':-0.1722386285694456,'y':0.8031524614581104,'z':0.5703332170602509},'orthogVtr':{'x':-0.8979443445677965,'y':0.11003657607918622,'z':-0.42613132480900767},'minZoom':0.5}},{'longitude':323.66,'latitude':45.66972222222222,'magnitude':3.98,'b_v':0.89,'letter':'rho','constell':'Cyg','desigNo':'73','bsNo':'8252','main':false,'serialNo':505,'letterLabel':{'vtr':{'x':0.8250444412221581,'y':-0.4562217412034056,'z':-0.3334117467362982},'orthogVtr':{'x':0.04958134270187331,'y':-0.5293145847859241,'z':0.8469756553696123},'minZoom':0.5}},{'longitude':30.2075,'latitude':-20.99361111111111,'magnitude':3.99,'b_v':1.55,'letter':'upsilon','constell':'Cet','desigNo':'59','bsNo':'585','serialNo':506,'main':false,'letterLabel':{'vtr':{'x':-0.4058233781528897,'y':-0.913951522644706,'z':0},'orthogVtr':{'x':0.4293152871018079,'y':-0.19062956380900187,'z':0.8828073140061097},'minZoom':0.5}},{'longitude':201.48083333333332,'latitude':54.89722222222222,'magnitude':3.99,'b_v':0.17,'constell':'UMa','desigNo':'80','bsNo':'5062','serialNo':507,'main':false,'letterLabel':{'vtr':{'x':0.5734263938594121,'y':0.16870801150080203,'z':0.8016980589229562},'orthogVtr':{'x':-0.6203608870844118,'y':-0.5497401774618811,'z':0.5594087119986793},'minZoom':0.5}},{'longitude':349.61,'latitude':-58.13944444444444,'magnitude':3.99,'b_v':0.41,'letter':'gamma','constell':'Tuc','desigNo':'','bsNo':'8848','serialNo':508,'main':false,'letterLabel':{'vtr':{'x':-0.8532101839025971,'y':-0.5215672363990058,'z':0},'orthogVtr':{'x':-0.04965168392999577,'y':0.08122312795080712,'z':0.9954584440190372},'minZoom':0.5}},{'longitude':156.18458333333334,'latitude':-74.12083333333332,'magnitude':3.99,'b_v':0.37,'constell':'','desigNo':'','bsNo':'4102','serialNo':509,'main':false,'letterLabel':{'vtr':{'x':-0.517076024142754,'y':0.036336935753897265,'z':0.8551678270121832},'orthogVtr':{'x':0.8185208108224251,'y':-0.27118588911592073,'z':0.5064404168261133},'minZoom':1.8}},{'longitude':93.9275,'latitude':-6.2813888888888885,'magnitude':3.99,'b_v':1.32,'letter':'gamma','constell':'Mon','desigNo':'5','bsNo':'2227','serialNo':510,'main':false,'letterLabel':{'vtr':{'x':0.7767361752520677,'y':0.6179934852737325,'z':-0.12151117732132265},'orthogVtr':{'x':-0.6261354709134088,'y':0.778532715155862,'z':-0.042909014158859594},'minZoom':0.5}},{'longitude':135.67958333333334,'latitude':-66.46611111111112,'magnitude':4,'b_v':0.15,'letter':'alpha','constell':'Vol','desigNo':'','bsNo':'3615','serialNo':511,'main':false,'letterLabel':{'vtr':{'x':-0.9417227734795248,'y':0.2146073906874237,'z':0.25904031688593737},'orthogVtr':{'x':0.1776247199430171,'y':-0.33671546157308274,'z':0.9247011175524719},'minZoom':0.5}},{'longitude':171.20875,'latitude':10.432777777777778,'magnitude':4,'b_v':0.42,'letter':'iota','constell':'Leo','desigNo':'78','bsNo':'4399','serialNo':512,'main':false,'letterLabel':{'vtr':{'x':0.1831626755519639,'y':0.9830826182395078,'z':0},'orthogVtr':{'x':-0.14776543282522034,'y':0.027530862135299688,'z':0.9886391801319946},'minZoom':0.5}},{'longitude':243.25375,'latitude':-19.505,'magnitude':4,'b_v':0.08,'letter':'nu','constell':'Sco','desigNo':'14','bsNo':'6027','serialNo':513,'main':false,'letterLabel':{'vtr':{'x':0.6505517412500635,'y':0.5342588100887852,'z':0.539768427938339},'orthogVtr':{'x':0.6299409033417593,'y':-0.7765858484988033,'z':0.009427523978342095},'minZoom':0.5}},{'longitude':307.52791666666667,'latitude':30.42777777777778,'magnitude':4.01,'b_v':0.4,'constell':'Cyg','desigNo':'41','bsNo':'7834','main':false,'serialNo':514,'letterLabel':{'vtr':{'x':0.12208624566013282,'y':-0.8401425568029273,'z':0.528446244067695},'orthogVtr':{'x':-0.8421452070389954,'y':0.19407986667888105,'z':0.5031147539191785},'minZoom':0.5}},{'longitude':245.28916666666666,'latitude':-50.196666666666665,'magnitude':4.01,'b_v':1.08,'letter':'gamma^2','constell':'Nor','desigNo':'','bsNo':'6072','serialNo':515,'main':false,'letterLabel':{'vtr':{'x':-0.09230377892536958,'y':-0.5803314226211014,'z':-0.8091325307480011},'orthogVtr':{'x':-0.959096042838383,'y':0.2702093443476735,'z':-0.08439011102584844},'minZoom':0.5}},{'longitude':106.28666666666666,'latitude':20.543055555555558,'magnitude':4.01,'b_v':0.9,'letter':'zeta','constell':'Gem','desigNo':'43','bsNo':'2650','serialNo':516,'main':false,'letterLabel':{'vtr':{'x':0.35481091842131185,'y':-0.8311422793993352,'z':-0.428149183771151},'orthogVtr':{'x':0.8972989513946641,'y':0.4313512172268246,'z':-0.09375883543951019},'minZoom':0.5}},{'longitude':281.2675,'latitude':-71.41027777777778,'magnitude':4.01,'b_v':1.13,'letter':'zeta','constell':'Pav','desigNo':'','bsNo':'6982','serialNo':517,'main':false,'letterLabel':{'vtr':{'x':-0.4738220768173007,'y':-0.30378419894311587,'z':-0.8265638511288945},'orthogVtr':{'x':-0.8784149472726064,'y':0.09665285025179869,'z':0.4680228701102837},'minZoom':0.5}},{'longitude':220.76333333333332,'latitude':-37.8675,'magnitude':4.01,'b_v':-0.16,'constell':'','desigNo':'','bsNo':'5471','serialNo':518,'main':false,'letterLabel':{'vtr':{'x':0.7614309799642237,'y':-0.23407967880271568,'z':0.6045077060901205},'orthogVtr':{'x':0.2504134009908031,'y':-0.7539298497183231,'z':-0.6073573168308143},'minZoom':1.8}},{'longitude':71.59458333333333,'latitude':-3.223888888888889,'magnitude':4.01,'b_v':-0.15,'letter':'mu','constell':'Eri','desigNo':'57','bsNo':'1520','serialNo':519,'main':false,'letterLabel':{'vtr':{'x':-0.6137050704485093,'y':0.7493424380456633,'z':-0.24870061730838522},'orthogVtr':{'x':-0.7238718294076942,'y':-0.6597902860330712,'z':-0.2017085844637166},'minZoom':0.5}},{'longitude':240.555,'latitude':58.51888888888889,'magnitude':4.01,'b_v':0.53,'letter':'theta','constell':'Dra','desigNo':'13','bsNo':'5986','main':true,'serialNo':520,'letterLabel':{'vtr':{'x':-0.9408779316626276,'y':-0.11292142730520166,'z':-0.31937042594080584},'orthogVtr':{'x':0.2210107253839787,'y':0.5098625399895812,'z':-0.8313810495678982},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.8849571972938338,'y':-0.39656262135673515,'z':0.2441082675791972},'orthogVtr':{'x':-0.388519989167017,'y':0.33977808312477426,'z':-0.856506317691653},'minZoom':0.5}},{'longitude':108.88041666666666,'latitude':-26.80388888888889,'magnitude':4.01,'b_v':-0.15,'letter':'omega','constell':'CMa','desigNo':'28','bsNo':'2749','serialNo':521,'main':false,'letterLabel':{'vtr':{'x':-0.24115410161707285,'y':-0.8194166065336448,'z':0.5200010809701732},'orthogVtr':{'x':0.9265120106282139,'y':-0.35385199478260687,'z':-0.1279228671897039},'minZoom':0.5}},{'longitude':26.192083333333333,'latitude':50.77611111111111,'magnitude':4.01,'b_v':-0.1,'letter':'phi','constell':'Per','desigNo':'','bsNo':'496','serialNo':522,'main':false,'letterLabel':{'vtr':{'x':-0.7266181841955468,'y':0.6305299895560941,'z':0.2728698346588683},'orthogVtr':{'x':-0.3873735601562213,'y':-0.047973226703222516,'z':-0.9206738262878854},'minZoom':0.5}},{'longitude':285.65375,'latitude':-5.713333333333334,'magnitude':4.02,'b_v':1.08,'constell':'Aql','desigNo':'12','bsNo':'7193','serialNo':523,'main':false,'letterLabel':{'vtr':{'x':-0.6016171879293488,'y':-0.794133836812437,'z':0.08607094990494915},'orthogVtr':{'x':-0.7523122326093113,'y':0.5995339744372566,'z':0.27310312733811803},'minZoom':0.5}},{'longitude':132.81875,'latitude':-27.775555555555556,'magnitude':4.02,'b_v':1.27,'letter':'gamma','constell':'Pyx','desigNo':'','bsNo':'3518','serialNo':524,'main':false,'letterLabel':{'vtr':{'x':-0.6125295294276876,'y':0.7904477057839407,'z':0},'orthogVtr':{'x':-0.5129947536666066,'y':-0.39752716436900953,'z':0.7607946742053814},'minZoom':0.5}},{'longitude':182.33,'latitude':-24.82638888888889,'magnitude':4.02,'b_v':0.33,'letter':'alpha','constell':'Crv','desigNo':'1','bsNo':'4623','serialNo':525,'main':false,'letterLabel':{'vtr':{'x':0.4049186690589102,'y':-0.8921439116058592,'z':-0.20030005599639156},'orthogVtr':{'x':-0.1170181617336116,'y':0.1666982606419599,'z':-0.9790395496216848},'minZoom':0.5}},{'longitude':285.1041666666667,'latitude':15.093055555555557,'magnitude':4.02,'b_v':1.08,'letter':'epsilon','constell':'Aql','desigNo':'13','bsNo':'7176','serialNo':526,'main':false,'letterLabel':{'vtr':{'x':-0.7791364299375247,'y':0.6258505004810966,'z':0.03546229817382542},'orthogVtr':{'x':0.5741523453091184,'y':0.7351935167460238,'z':-0.36033259262888306},'minZoom':0.5}},{'longitude':34.59,'latitude':33.92722222222222,'magnitude':4.03,'b_v':0.02,'letter':'gamma','constell':'Tri','desigNo':'9','bsNo':'664','main':true,'serialNo':527,'letterLabel':{'vtr':{'x':0.011202579794454381,'y':-0.65289603800905,'z':-0.757364684784044},'orthogVtr':{'x':0.7302601450747245,'y':-0.512061690134232,'z':0.4522310759029244},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.18854322543037494,'y':-0.48834105752757373,'z':-0.8520413509197556},'orthogVtr':{'x':0.7055897033141283,'y':-0.6708229442139648,'z':0.22834129738877454},'minZoom':0.5}},{'longitude':76.24541666666667,'latitude':60.46555555555556,'magnitude':4.03,'b_v':0.92,'letter':'beta','constell':'Cam','desigNo':'10','bsNo':'1603','serialNo':528,'main':false,'letterLabel':{'vtr':{'x':0.6678271773956815,'y':0.2877919608695156,'z':0.6864274531154739},'orthogVtr':{'x':-0.7350305441741343,'y':0.40021523983375534,'z':0.5473187927852339},'minZoom':0.5}},{'longitude':271.58416666666665,'latitude':2.4980555555555557,'magnitude':4.03,'b_v':0.86,'constell':'Oph','desigNo':'70','bsNo':'6752','serialNo':529,'main':false,'letterLabel':{'vtr':{'x':0.9840913326116483,'y':0.17421782786446122,'z':-0.03481949931890958},'orthogVtr':{'x':0.17550336955377457,'y':-0.9837420668821063,'z':0.038080350862265744},'minZoom':0.5}},{'longitude':193.90833333333333,'latitude':-57.2725,'magnitude':4.03,'b_v':-0.18,'letter':'mu^1','constell':'Cru','desigNo':'','bsNo':'4898','serialNo':530,'main':false,'letterLabel':{'vtr':{'x':-0.445022802217309,'y':0.4012870961110483,'z':0.8005768994927448},'orthogVtr':{'x':0.7256353782386897,'y':-0.3623048001321989,'z':0.5849688279297978},'minZoom':0.5}},{'longitude':308.51208333333335,'latitude':11.36361111111111,'magnitude':4.03,'b_v':-0.12,'letter':'epsilon','constell':'Del','desigNo':'2','bsNo':'7852','serialNo':531,'main':false,'letterLabel':{'vtr':{'x':-0.7755758770291177,'y':0.34515195755098627,'z':0.5285377802666875},'orthogVtr':{'x':0.16063874077873633,'y':0.9176314312012599,'z':-0.36352132184034214},'minZoom':0.5}},{'longitude':0.05291666666666666,'latitude':6.960277777777778,'magnitude':4.03,'b_v':0.42,'letter':'omega','constell':'Psc','desigNo':'28','bsNo':'9072','serialNo':532,'main':false,'letterLabel':{'vtr':{'x':0.06675729710764637,'y':-0.5531105686028526,'z':-0.8304289025453719},'orthogVtr':{'x':0.1011394410950759,'y':-0.8242474240743323,'z':0.5571238617774361},'minZoom':0.5}},{'longitude':131.93833333333333,'latitude':28.69472222222222,'magnitude':4.03,'b_v':1.01,'letter':'iota','constell':'Cnc','desigNo':'48','bsNo':'3475','serialNo':533,'main':false,'letterLabel':{'vtr':{'x':0.6336180599988065,'y':0.7736460133958869,'z':0},'orthogVtr':{'x':-0.504812423485965,'y':0.41344266356194165,'z':0.7577793749113482},'minZoom':0.5}},{'longitude':339.06375,'latitude':-0.026944444444444444,'magnitude':4.04,'b_v':-0.08,'letter':'eta','constell':'Aqr','desigNo':'62','bsNo':'8597','serialNo':534,'main':false,'letterLabel':{'vtr':{'x':0.35732838586790083,'y':0.0034309984721984915,'z':-0.9339725118559563},'orthogVtr':{'x':0.0007867765002987546,'y':-0.9999940035301778,'z':-0.003372519299491903},'minZoom':0.5}},{'longitude':216.44791666666666,'latitude':51.77027777777778,'magnitude':4.04,'b_v':0.5,'letter':'theta','constell':'Boo','desigNo':'23','bsNo':'5404','serialNo':535,'main':false,'letterLabel':{'vtr':{'x':0.7613858209626472,'y':0.19279063981472436,'z':0.6189696283638357},'orthogVtr':{'x':-0.4153466195321326,'y':-0.5880178409072853,'z':0.6940621041506043},'minZoom':0.5}},{'longitude':63.180416666666666,'latitude':-6.793055555555555,'magnitude':4.04,'b_v':0.33,'letter':'omicron^1','constell':'Eri','desigNo':'38','bsNo':'1298','serialNo':536,'main':false,'letterLabel':{'vtr':{'x':0.7100571228836463,'y':0.649360303950221,'z':0.2723051191143397},'orthogVtr':{'x':-0.5432322152414899,'y':0.7512257860940751,'z':-0.37491142771481684},'minZoom':0.5}},{'longitude':176.68958333333333,'latitude':6.431388888888889,'magnitude':4.04,'b_v':1.5,'letter':'nu','constell':'Vir','desigNo':'3','bsNo':'4517','serialNo':537,'main':false,'letterLabel':{'vtr':{'x':0.05475645173635496,'y':-0.02638054792182938,'z':-0.998151189792703},'orthogVtr':{'x':0.11332002108765407,'y':0.9933564708550101,'z':-0.020037330939368738},'minZoom':0.5}},{'longitude':207.58041666666668,'latitude':15.711666666666666,'magnitude':4.05,'b_v':1.52,'letter':'upsilon','constell':'Boo','desigNo':'5','bsNo':'5200','serialNo':538,'main':false,'letterLabel':{'vtr':{'x':-0.17450528777786006,'y':-0.953606829698755,'z':0.2453200336080518},'orthogVtr':{'x':-0.4914487593097368,'y':-0.13154196559185102,'z':-0.8609151109494784},'minZoom':0.5}},{'longitude':47.585,'latitude':49.67861111111111,'magnitude':4.05,'b_v':0.6,'letter':'iota','constell':'Per','desigNo':'','bsNo':'937','serialNo':539,'main':false,'letterLabel':{'vtr':{'x':0.8393339090350252,'y':-0.15376524325934582,'z':0.5214161860830349},'orthogVtr':{'x':-0.3240847506643825,'y':0.6285392473073944,'z':0.7070413629916279},'minZoom':0.5}},{'longitude':124.51208333333334,'latitude':-76.97444444444444,'magnitude':4.05,'b_v':0.41,'letter':'alpha','constell':'Cha','desigNo':'','bsNo':'3318','serialNo':540,'main':false,'letterLabel':{'vtr':{'x':-0.36964304092131217,'y':0.22051242758362263,'z':-0.9026285457371837},'orthogVtr':{'x':-0.9203569898512471,'y':0.04661492224710545,'z':0.3882912054835241},'minZoom':0.5}},{'longitude':170.50958333333332,'latitude':5.933333333333334,'magnitude':4.05,'b_v':-0.06,'letter':'sigma','constell':'Leo','desigNo':'77','bsNo':'4386','serialNo':541,'main':false,'letterLabel':{'vtr':{'x':0.02963603254124772,'y':0.9159978873180464,'z':0.40008696055243975},'orthogVtr':{'x':-0.19158051930979264,'y':-0.38763676624518645,'z':0.9016843361598141},'minZoom':0.5}},{'longitude':215.40708333333333,'latitude':-37.965,'magnitude':4.05,'b_v':-0.03,'letter':'psi','constell':'Cen','desigNo':'','bsNo':'5367','serialNo':542,'main':false,'letterLabel':{'vtr':{'x':-0.4877676449183037,'y':0.7881725704051574,'z':0.37532216005956665},'orthogVtr':{'x':0.5909097948064062,'y':-0.01837325688565203,'z':0.8065283862538659},'minZoom':0.5}},{'longitude':342.62916666666666,'latitude':-13.5,'magnitude':4.05,'b_v':1.57,'letter':'tau','constell':'Aqr','desigNo':'71','bsNo':'8679','serialNo':543,'main':false,'letterLabel':{'vtr':{'x':0.05248532739539424,'y':0.8534563862014709,'z':0.5185146933888413},'orthogVtr':{'x':0.36880827138353184,'y':0.4659564989847334,'z':-0.8042791803925932},'minZoom':0.5}},{'longitude':131.25625,'latitude':-42.71333333333334,'magnitude':4.05,'b_v':0.87,'constell':'','desigNo':'','bsNo':'3477','serialNo':544,'main':false,'letterLabel':{'vtr':{'x':-0.8420780956527123,'y':0.532700820950701,'z':0.08446488134337711},'orthogVtr':{'x':-0.2369509850135697,'y':-0.5060606013218496,'z':0.8293110987385053},'minZoom':1.8}},{'longitude':219.76833333333335,'latitude':-49.50111111111111,'magnitude':4.05,'b_v':-0.15,'letter':'rho','constell':'Lup','desigNo':'','bsNo':'5453','serialNo':545,'main':false,'letterLabel':{'vtr':{'x':0.5214325910223083,'y':0.11929756098520436,'z':0.8449119155052457},'orthogVtr':{'x':0.6920468134127804,'y':-0.6383821000693033,'z':-0.33695623210785447},'minZoom':0.5}},{'longitude':184.84958333333333,'latitude':-64.10027777777778,'magnitude':4.06,'b_v':-0.17,'letter':'zeta','constell':'Cru','desigNo':'','bsNo':'4679','serialNo':546,'main':false,'letterLabel':{'vtr':{'x':0.7643972209588187,'y':-0.3475456053006527,'z':0.5430551913264783},'orthogVtr':{'x':0.4756768800765798,'y':-0.2645827746287154,'z':-0.8388846530545075},'minZoom':0.5}},{'longitude':221.18333333333334,'latitude':-35.24805555555556,'magnitude':4.06,'b_v':1.36,'constell':'','desigNo':'','bsNo':'5485','serialNo':547,'main':false,'letterLabel':{'vtr':{'x':-0.7718548778318732,'y':0.5806240958165423,'z':-0.2590669931202487},'orthogVtr':{'x':0.16271696357307214,'y':0.5742918064660344,'z':0.8023167147651473},'minZoom':1.8}},{'longitude':74.33916666666667,'latitude':13.540833333333333,'magnitude':4.06,'b_v':1.16,'letter':'omicron^2','constell':'Ori','desigNo':'9','bsNo':'1580','serialNo':548,'main':false,'letterLabel':{'vtr':{'x':-0.5980567862224239,'y':-0.7218552813134131,'z':-0.3482140624576195},'orthogVtr':{'x':0.7572674293612321,'y':-0.6512328418555027,'z':0.04941483701720617},'minZoom':0.5}},{'longitude':171.43958333333333,'latitude':-17.780277777777776,'magnitude':4.06,'b_v':0.22,'letter':'gamma','constell':'Crt','desigNo':'15','bsNo':'4405','serialNo':549,'main':false,'letterLabel':{'vtr':{'x':0.2117903570476129,'y':-0.8645836100370231,'z':0.4556753514477094},'orthogVtr':{'x':0.2616964687296255,'y':-0.3990561896023304,'z':-0.8787884363113303},'minZoom':0.5}},{'longitude':184.63291666666666,'latitude':-68.05805555555555,'magnitude':4.06,'b_v':1.6,'letter':'epsilon','constell':'Mus','desigNo':'','bsNo':'4671','serialNo':550,'main':false,'letterLabel':{'vtr':{'x':0.13033686322279578,'y':-0.08447817993898235,'z':-0.9878642311570144},'orthogVtr':{'x':-0.9188559549262424,'y':0.3639923158772525,'z':-0.15235920739783917},'minZoom':0.5}},{'longitude':114.24958333333333,'latitude':26.85527777777778,'magnitude':4.06,'b_v':1.54,'letter':'upsilon','constell':'Gem','desigNo':'69','bsNo':'2905','serialNo':551,'main':false,'letterLabel':{'vtr':{'x':0.3248836097991578,'y':-0.7570936782208295,'z':-0.5667978497506179},'orthogVtr':{'x':0.8718882765507413,'y':0.47195498621576326,'z':-0.13064962380143733},'minZoom':0.5}},{'longitude':255.24583333333334,'latitude':-53.18555555555555,'magnitude':4.06,'b_v':1.45,'letter':'epsilon^1','constell':'Ara','desigNo':'','bsNo':'6295','serialNo':552,'main':false,'letterLabel':{'vtr':{'x':-0.4740190874819231,'y':0.5737831269062762,'z':0.667891329469444},'orthogVtr':{'x':0.867189299377986,'y':0.17275433086008013,'z':0.467053166366961},'minZoom':0.5}},{'longitude':227.5075,'latitude':-45.346111111111114,'magnitude':4.07,'b_v':-0.16,'letter':'lambda','constell':'Lup','desigNo':'','bsNo':'5626','serialNo':553,'main':false,'letterLabel':{'vtr':{'x':-0.15277026694519483,'y':-0.5132812372898954,'z':-0.844513834690497},'orthogVtr':{'x':-0.8667592926882376,'y':0.48010596740147504,'z':-0.13500588359060536},'minZoom':1.3}},{'longitude':337.45625,'latitude':58.505,'magnitude':4.07,'b_v':0.78,'letter':'delta','constell':'Cep','desigNo':'27','bsNo':'8571','main':true,'serialNo':554,'letterLabel':{'vtr':{'x':0.2542325307654477,'y':0.08248816727483733,'z':-0.9636189716689031},'orthogVtr':{'x':0.838185856602389,'y':-0.5158708179962073,'z':0.17697957207441645},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.09732390115841913,'y':0.1750627387612091,'z':-0.979735217168767},'orthogVtr':{'x':0.8704698548318551,'y':-0.4922194999163099,'z':-0.001481799968544903},'minZoom':0.5}},{'longitude':229.72458333333333,'latitude':-58.865,'magnitude':4.07,'b_v':0.09,'letter':'beta','constell':'Cir','desigNo':'','bsNo':'5670','serialNo':555,'main':false,'letterLabel':{'vtr':{'x':-0.9423610490084077,'y':0.2968304146585588,'z':-0.15442589888163785},'orthogVtr':{'x':-0.015085645567327804,'y':0.42336617535237353,'z':0.9058330446971564},'minZoom':0.5}},{'longitude':214.23333333333332,'latitude':-6.083333333333333,'magnitude':4.07,'b_v':0.51,'letter':'iota','constell':'Vir','desigNo':'99','bsNo':'5338','serialNo':556,'main':false,'letterLabel':{'vtr':{'x':-0.1278499258886184,'y':0.9917935251100779,'z':0},'orthogVtr':{'x':0.5548058792603292,'y':0.07151880784675442,'z':0.8289001727966718},'minZoom':0.5}},{'longitude':283.96708333333333,'latitude':43.97,'magnitude':4.08,'b_v':1.4,'letter':'R','constell':'Lyr','desigNo':'13','bsNo':'7157','main':false,'serialNo':557,'letterLabel':{'vtr':{'x':0.9700963268636212,'y':-0.24272024350208146,'z':0},'orthogVtr':{'x':-0.1695219028935485,'y':-0.677539594337761,'z':0.7156831858748481},'minZoom':0.5}},{'longitude':103.75083333333333,'latitude':-12.061666666666667,'magnitude':4.08,'b_v':1.42,'letter':'theta','constell':'CMa','desigNo':'14','bsNo':'2574','serialNo':558,'main':false,'letterLabel':{'vtr':{'x':0.8708414305807616,'y':-0.47964497168527853,'z':-0.10759137475225851},'orthogVtr':{'x':0.43312941990618126,'y':0.8522174645868105,'z':-0.29346941691590867},'minZoom':0.5}},{'longitude':12.0675,'latitude':24.362222222222222,'magnitude':4.08,'b_v':1.1,'letter':'zeta','constell':'And','desigNo':'34','bsNo':'215','serialNo':559,'main':false,'letterLabel':{'vtr':{'x':0.057309894233996406,'y':0.31380368531277947,'z':0.9477567320293779},'orthogVtr':{'x':-0.45071661104023947,'y':0.8552004401654207,'z':-0.25590377815357035},'minZoom':0.5}},{'longitude':143.73791666666668,'latitude':-59.30833333333333,'magnitude':4.08,'b_v':-0.01,'constell':'','desigNo':'','bsNo':'3825','serialNo':560,'main':false,'letterLabel':{'vtr':{'x':-0.5149568421046916,'y':-0.05389690581249834,'z':0.8555200607311336},'orthogVtr':{'x':0.7519559599026134,'y':-0.5075642887892107,'z':0.42064323019970534},'minZoom':1.8}},{'longitude':316.7320833333333,'latitude':-17.162499999999998,'magnitude':4.08,'b_v':-0.01,'letter':'theta','constell':'Cap','desigNo':'23','bsNo':'8075','serialNo':561,'main':false,'letterLabel':{'vtr':{'x':0.39003755526921635,'y':0.9207987946113314,'z':0.000534155344364044},'orthogVtr':{'x':0.6031800456652634,'y':-0.25506027809628545,'z':-0.7557235520007937},'minZoom':0.5}},{'longitude':320.7241666666667,'latitude':19.88,'magnitude':4.08,'b_v':1.11,'constell':'Peg','desigNo':'1','bsNo':'8173','serialNo':562,'main':false,'letterLabel':{'vtr':{'x':-0.48197924841827716,'y':-0.36371515030871365,'z':0.7971243902491395},'orthogVtr':{'x':-0.4875932709984818,'y':0.867223384162412,'z':0.10087816433150743},'minZoom':0.5}},{'longitude':40.095416666666665,'latitude':0.40305555555555556,'magnitude':4.08,'b_v':-0.21,'letter':'delta','constell':'Cet','desigNo':'82','bsNo':'779','serialNo':563,'main':false,'letterLabel':{'vtr':{'x':0.2063769470820055,'y':-0.9498964727469227,'z':0.23474506762883326},'orthogVtr':{'x':0.61012616589563,'y':0.3124855286692232,'z':0.7280788803844086},'minZoom':0.5}},{'longitude':35.51625,'latitude':-68.58,'magnitude':4.08,'b_v':0.03,'letter':'delta','constell':'Hyi','desigNo':'','bsNo':'705','serialNo':564,'main':false,'letterLabel':{'vtr':{'x':-0.05927493740375231,'y':-0.2397661620835937,'z':0.9690194370163506},'orthogVtr':{'x':0.9529560306567906,'y':0.2754714402772529,'z':0.1264527153778431},'minZoom':0.5}},{'longitude':165.15708333333333,'latitude':-18.392222222222223,'magnitude':4.08,'b_v':1.08,'letter':'alpha','constell':'Crt','desigNo':'7','bsNo':'4287','serialNo':565,'main':false,'letterLabel':{'vtr':{'x':0.004418021198328265,'y':-0.6183267941467995,'z':0.785908682181863},'orthogVtr':{'x':0.3982756962329108,'y':-0.7198048086197371,'z':-0.5685573913670404},'minZoom':0.5}},{'longitude':45.79083333333333,'latitude':-23.55666666666667,'magnitude':4.08,'b_v':0.16,'letter':'tau^3','constell':'Eri','desigNo':'11','bsNo':'919','serialNo':566,'main':false,'letterLabel':{'vtr':{'x':-0.30988287992126073,'y':-0.9157808338912498,'z':0.2555739912611469},'orthogVtr':{'x':0.7038689887302284,'y':-0.0402573509444053,'z':0.7091881220091216},'minZoom':0.5}},{'longitude':237.38208333333333,'latitude':18.08861111111111,'magnitude':4.09,'b_v':1.62,'letter':'kappa','constell':'Ser','desigNo':'35','bsNo':'5879','serialNo':567,'main':false,'letterLabel':{'vtr':{'x':0.0356676222831826,'y':0.9392400111754433,'z':-0.34140302009182283},'orthogVtr':{'x':0.8580095880232427,'y':0.14637527937597597,'z':0.49233507334719784},'minZoom':0.5}},{'longitude':84.46708333333333,'latitude':9.29888888888889,'magnitude':4.09,'b_v':0.95,'letter':'phi^2','constell':'Ori','desigNo':'40','bsNo':'1907','serialNo':568,'main':false,'letterLabel':{'vtr':{'x':-0.8253096894710711,'y':-0.5389226080103584,'z':-0.1686011240783344},'orthogVtr':{'x':0.5566060436217005,'y':-0.8267120494205655,'z':-0.08207861808440897},'minZoom':0.5}},{'longitude':277.5445833333333,'latitude':-49.05916666666666,'magnitude':4.1,'b_v':1,'letter':'zeta','constell':'Tel','desigNo':'','bsNo':'6905','serialNo':569,'main':false,'letterLabel':{'vtr':{'x':0.6296917262889511,'y':-0.4640499944159765,'z':-0.6230135893588299},'orthogVtr':{'x':-0.7720660790224292,'y':-0.4626538640370531,'z':-0.4357354377538236},'minZoom':0.5}},{'longitude':24.457916666666666,'latitude':41.4925,'magnitude':4.1,'b_v':0.54,'letter':'upsilon','constell':'And','desigNo':'50','bsNo':'458','serialNo':570,'main':false,'letterLabel':{'vtr':{'x':0.40759728662639116,'y':-0.6961185789035073,'z':-0.591002010182846},'orthogVtr':{'x':0.607433612322929,'y':-0.27655653618326176,'z':0.7446750223517865},'minZoom':0.5}},{'longitude':117.44291666666666,'latitude':-46.418055555555554,'magnitude':4.1,'b_v':-0.16,'constell':'','desigNo':'','bsNo':'3055','serialNo':571,'main':false,'letterLabel':{'vtr':{'x':-0.7942578995412115,'y':0.555751028964029,'z':-0.24555077442721696},'orthogVtr':{'x':-0.5178907948778125,'y':-0.4079229842843336,'z':0.7519228440959824},'minZoom':1.8}},{'longitude':41.35125,'latitude':49.30138888888889,'magnitude':4.1,'b_v':0.51,'letter':'theta','constell':'Per','desigNo':'13','bsNo':'799','serialNo':572,'main':false,'letterLabel':{'vtr':{'x':0.8013693963526253,'y':-0.5858988369031927,'z':-0.1205389708970295},'orthogVtr':{'x':0.3437988437724935,'y':0.28623576497437997,'z':0.8943553219331946},'minZoom':0.5}},{'longitude':287.8075,'latitude':-39.311388888888885,'magnitude':4.1,'b_v':1.16,'letter':'beta','constell':'CrA','desigNo':'','bsNo':'7259','serialNo':573,'main':false,'letterLabel':{'vtr':{'x':-0.4250341470792053,'y':-0.7492746658915503,'z':-0.5078714885379549},'orthogVtr':{'x':-0.8737037529771723,'y':0.19292818715455984,'z':0.44656518744172113},'minZoom':0.5}},{'longitude':106.1375,'latitude':-15.660277777777779,'magnitude':4.11,'b_v':-0.11,'letter':'gamma','constell':'CMa','desigNo':'23','bsNo':'2657','serialNo':574,'main':false,'letterLabel':{'vtr':{'x':-0.9204322268451386,'y':0.35549060668600446,'z':0.16257596483772047},'orthogVtr':{'x':-0.28492259326961333,'y':-0.8948534093593157,'z':0.3435934976138626},'minZoom':0.5}},{'longitude':129.565,'latitude':-43.051111111111105,'magnitude':4.11,'b_v':0.11,'constell':'','desigNo':'','bsNo':'3426','serialNo':575,'main':false,'letterLabel':{'vtr':{'x':0.7721990049484262,'y':-0.0021847091895663695,'z':-0.635376993447526},'orthogVtr':{'x':-0.4325097018344409,'y':0.7307417633564508,'z':-0.5281589089523984},'minZoom':1.8}},{'longitude':176.8425,'latitude':-61.27583333333333,'magnitude':4.11,'b_v':0.9,'constell':'','desigNo':'','bsNo':'4522','serialNo':576,'main':false,'letterLabel':{'vtr':{'x':-0.8713975865645128,'y':0.4799016510686488,'z':-0.10178728521346357},'orthogVtr':{'x':-0.10196542259440367,'y':0.02577682749260491,'z':0.994453924402514},'minZoom':1.8}},{'longitude':40.33958333333333,'latitude':-39.78111111111111,'magnitude':4.11,'b_v':1.01,'letter':'iota','constell':'Eri','desigNo':'','bsNo':'794','serialNo':577,'main':false,'letterLabel':{'vtr':{'x':0.7162896563445125,'y':0.12151313310622325,'z':0.6871416787654273},'orthogVtr':{'x':0.37922416351572874,'y':0.7588269688937898,'z':-0.5295003919594956},'minZoom':0.5}},{'longitude':345.47625,'latitude':-52.66,'magnitude':4.11,'b_v':0.96,'letter':'zeta','constell':'Gru','desigNo':'','bsNo':'8747','serialNo':578,'main':false,'letterLabel':{'vtr':{'x':-0.24835474791036263,'y':-0.355788190985157,'z':-0.9009631969985731},'orthogVtr':{'x':-0.7704298612035896,'y':-0.49123303959170755,'z':0.40635936039337095},'minZoom':0.5}},{'longitude':148.08,'latitude':-14.929166666666665,'magnitude':4.11,'b_v':0.92,'letter':'upsilon^1','constell':'Hya','desigNo':'39','bsNo':'3903','serialNo':579,'main':false,'letterLabel':{'vtr':{'x':-0.20377984606842825,'y':-0.7028288195789454,'z':0.6815463481712699},'orthogVtr':{'x':0.5346494498591129,'y':-0.6630695027398346,'z':-0.523916787573844},'minZoom':0.5}},{'longitude':158.91541666666666,'latitude':-78.69861111111112,'magnitude':4.11,'b_v':1.58,'letter':'gamma','constell':'Cha','desigNo':'','bsNo':'4174','serialNo':580,'main':false,'letterLabel':{'vtr':{'x':-0.810774573227437,'y':0.19096239740818333,'z':-0.553333492736511},'orthogVtr':{'x':-0.5560670298900058,'y':0.044017841196655264,'z':0.8299710163166503},'minZoom':0.5}},{'longitude':287.665,'latitude':-37.87555555555556,'magnitude':4.11,'b_v':0.04,'letter':'alpha','constell':'CrA','desigNo':'','bsNo':'7254','serialNo':581,'main':false,'letterLabel':{'vtr':{'x':0.05656379344013335,'y':0.782185948135852,'z':0.6204721426546725},'orthogVtr':{'x':0.9692403830583862,'y':0.10607728834236407,'z':-0.22208261693965153},'minZoom':0.5}},{'longitude':234.58541666666667,'latitude':-66.37416666666665,'magnitude':4.11,'b_v':1.16,'letter':'epsilon','constell':'TrA','desigNo':'','bsNo':'5771','serialNo':582,'main':false,'letterLabel':{'vtr':{'x':-0.7987883882443568,'y':0.3712461177165428,'z':0.4734062007265823},'orthogVtr':{'x':0.5549802108161814,'y':0.15095240225145046,'z':0.8180527720489326},'minZoom':0.5}},{'longitude':39.96625,'latitude':-68.19222222222223,'magnitude':4.12,'b_v':-0.06,'letter':'epsilon','constell':'Hyi','desigNo':'','bsNo':'806','serialNo':583,'main':false,'letterLabel':{'vtr':{'x':-0.3348171019599354,'y':0.13693448469153743,'z':-0.9322802449571767},'orthogVtr':{'x':-0.898237840061739,'y':-0.3453355525921342,'z':0.2718678701080859},'minZoom':0.5}},{'longitude':181.525,'latitude':8.635833333333332,'magnitude':4.12,'b_v':0.97,'letter':'omicron','constell':'Vir','desigNo':'9','bsNo':'4608','serialNo':584,'main':false,'letterLabel':{'vtr':{'x':0.14587761139739266,'y':0.8814606543207251,'z':0.44916237306509843},'orthogVtr':{'x':-0.04425091883947731,'y':-0.44775102867700656,'z':0.8930626363814268},'minZoom':0.5}},{'longitude':337.69875,'latitude':-43.659166666666664,'magnitude':4.12,'b_v':1.57,'letter':'delta^2','constell':'Gru','desigNo':'','bsNo':'8560','serialNo':585,'main':false,'letterLabel':{'vtr':{'x':-0.4786555048328107,'y':-0.6833235345793348,'z':-0.5513237295666238},'orthogVtr':{'x':-0.5682124141898943,'y':-0.2376180976573351,'z':0.7878275775994397},'minZoom':0.5}},{'longitude':299.11625,'latitude':-41.82083333333334,'magnitude':4.12,'b_v':1.06,'letter':'iota','constell':'Sgr','desigNo':'','bsNo':'7581','serialNo':586,'main':false,'letterLabel':{'vtr':{'x':-0.03282703596317732,'y':-0.7073161513032625,'z':-0.7061347235587643},'orthogVtr':{'x':-0.9313594786317045,'y':-0.23468482969864712,'z':0.2783748413060999},'minZoom':0.5}},{'longitude':64.0475,'latitude':48.452222222222225,'magnitude':4.12,'b_v':0.94,'letter':'mu','constell':'Per','desigNo':'51','bsNo':'1303','serialNo':587,'main':false,'letterLabel':{'vtr':{'x':-0.9530174459819802,'y':0.16962648597446497,'z':-0.25096733434839336},'orthogVtr':{'x':0.08666607865515513,'y':-0.6411863471971924,'z':-0.7624756120548777},'minZoom':0.5}},{'longitude':313.2158333333333,'latitude':-26.852500000000003,'magnitude':4.12,'b_v':1.63,'letter':'omega','constell':'Cap','desigNo':'18','bsNo':'7980','serialNo':588,'main':false,'letterLabel':{'vtr':{'x':-0.12670887932124314,'y':-0.866467453973673,'z':-0.4828861264372126},'orthogVtr':{'x':-0.7814917443298821,'y':-0.21261602531741475,'z':0.5865706089828083},'minZoom':0.5}},{'longitude':90.83666666666667,'latitude':9.645833333333332,'magnitude':4.12,'b_v':0.17,'letter':'mu','constell':'Ori','desigNo':'61','bsNo':'2124','serialNo':589,'main':false,'letterLabel':{'vtr':{'x':-0.2950554126543855,'y':0.9412478881265096,'z':0.16430068947127505},'orthogVtr':{'x':-0.9553716917040663,'y':-0.2932182115465142,'z':-0.03588887164532513},'minZoom':0.5}},{'longitude':81.19791666666667,'latitude':-7.793333333333333,'magnitude':4.13,'b_v':0.94,'constell':'Ori','desigNo':'29','bsNo':'1784','serialNo':590,'main':false,'letterLabel':{'vtr':{'x':-0.8429228153949205,'y':-0.5350683297609075,'z':-0.05641816882506477},'orthogVtr':{'x':0.516232524650085,'y':-0.8338551691316366,'z':0.1954214353796659},'minZoom':1.3}},{'longitude':355.2129166666667,'latitude':5.721111111111111,'magnitude':4.13,'b_v':0.51,'letter':'iota','constell':'Psc','desigNo':'17','bsNo':'8969','serialNo':591,'main':false,'letterLabel':{'vtr':{'x':0.037508604391883374,'y':0.39244000429282444,'z':-0.9190124850224949},'orthogVtr':{'x':0.12420026638749168,'y':-0.9143595948848647,'z':-0.38538399690602404},'minZoom':0.5}},{'longitude':238.70625,'latitude':-16.779444444444444,'magnitude':4.13,'b_v':1,'letter':'theta','constell':'Lib','desigNo':'46','bsNo':'5908','serialNo':592,'main':false,'letterLabel':{'vtr':{'x':-0.858234129266251,'y':0.02571052231427584,'z':-0.5126140345376111},'orthogVtr':{'x':-0.12695106454400001,'y':0.9570778537310624,'z':0.260548285560831},'minZoom':0.5}},{'longitude':97.50041666666667,'latitude':20.199444444444445,'magnitude':4.13,'b_v':-0.12,'letter':'nu','constell':'Gem','desigNo':'18','bsNo':'2343','serialNo':593,'main':false,'letterLabel':{'vtr':{'x':-0.6333329287136317,'y':-0.7490203167006388,'z':-0.19457123779399857},'orthogVtr':{'x':0.7641216499624852,'y':-0.5654591083485571,'z':-0.3104417833415215},'minZoom':1.3}},{'longitude':341.9375,'latitude':-81.28916666666666,'magnitude':4.13,'b_v':0.21,'letter':'beta','constell':'Oct','desigNo':'','bsNo':'8630','serialNo':594,'main':false,'letterLabel':{'vtr':{'x':-0.35563157164944836,'y':-0.0959675718989962,'z':-0.9296861892003958},'orthogVtr':{'x':-0.9234688593998855,'y':-0.11716073077140501,'z':0.3653472716249358},'minZoom':0.5}},{'longitude':311.78208333333333,'latitude':-25.206944444444442,'magnitude':4.13,'b_v':0.43,'letter':'psi','constell':'Cap','desigNo':'16','bsNo':'7936','serialNo':595,'main':false,'letterLabel':{'vtr':{'x':-0.3084629912150037,'y':0.6554483131869939,'z':0.6893751459046208},'orthogVtr':{'x':0.7358131127279874,'y':0.6237035396815227,'z':-0.2637668624491889},'minZoom':0.5}},{'longitude':326.36,'latitude':25.72611111111111,'magnitude':4.14,'b_v':0.43,'letter':'kappa','constell':'Peg','desigNo':'10','bsNo':'8315','serialNo':596,'main':false,'letterLabel':{'vtr':{'x':-0.5618676066962076,'y':0.020021811462215933,'z':0.8269848363853156},'orthogVtr':{'x':-0.34897690586714086,'y':0.9006567812386634,'z':-0.2589063181542839},'minZoom':0.5}},{'longitude':233.40916666666666,'latitude':31.300833333333333,'magnitude':4.14,'b_v':-0.13,'letter':'theta','constell':'CrB','desigNo':'4','bsNo':'5778','main':true,'serialNo':597,'letterLabel':{'vtr':{'x':0.7399329916303624,'y':0.6714376803842885,'z':0.04087308719815676},'orthogVtr':{'x':0.43940490296129797,'y':-0.528449071248491,'z':0.7264054724120541},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.7399329916303624,'y':0.6714376803842885,'z':0.04087308719815676},'orthogVtr':{'x':0.43940490296129797,'y':-0.528449071248491,'z':0.7264054724120541},'minZoom':0.5}},{'longitude':239.57833333333335,'latitude':26.828055555555554,'magnitude':4.14,'b_v':1.23,'letter':'epsilon','constell':'CrB','desigNo':'13','bsNo':'5947','main':true,'serialNo':598,'letterLabel':{'vtr':{'x':0.21721027612641014,'y':0.8922883439811037,'z':-0.39577924041130313},'orthogVtr':{'x':0.8652422865675765,'y':0.011691300911450125,'z':0.5012176164285425},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8870574369961188,'y':0.3188027611126725,'z':0.3339070274444858},'orthogVtr':{'x':0.09462358051498637,'y':-0.8334746395832802,'z':0.5443954474295729},'minZoom':0.5}},{'longitude':181.95166666666665,'latitude':-64.71138888888889,'magnitude':4.14,'b_v':0.35,'letter':'eta','constell':'Cru','desigNo':'','bsNo':'4616','serialNo':599,'main':false,'letterLabel':{'vtr':{'x':0.8969095266257088,'y':-0.42544416356178916,'z':-0.12062572171496691},'orthogVtr':{'x':-0.11525528426519471,'y':0.038450398327313805,'z':-0.9925914498510554},'minZoom':0.5}},{'longitude':129.64541666666668,'latitude':5.641666666666667,'magnitude':4.14,'b_v':0,'letter':'delta','constell':'Hya','desigNo':'4','bsNo':'3410','serialNo':600,'main':false,'letterLabel':{'vtr':{'x':0.7028729350068071,'y':0.4851819676128209,'z':-0.5201616052134842},'orthogVtr':{'x':-0.3206489118797596,'y':0.8688695333844967,'z':0.37716045559752576},'minZoom':0.5}},{'longitude':52.96041666666667,'latitude':12.995555555555555,'magnitude':4.14,'b_v':1.11,'constell':'Tau','desigNo':'5','bsNo':'1066','serialNo':601,'main':false,'letterLabel':{'vtr':{'x':-0.37291331170027275,'y':0.9277727060111042,'z':-0.013170722742833426},'orthogVtr':{'x':-0.718636793028711,'y':-0.2977731153996524,'z':-0.6284045921622431},'minZoom':0.5}},{'longitude':334.18375,'latitude':37.83638888888889,'magnitude':4.14,'b_v':1.45,'constell':'Lac','desigNo':'1','bsNo':'8498','serialNo':602,'main':false,'letterLabel':{'vtr':{'x':0.5693230441738973,'y':-0.7891213947690671,'z':0.2305616960604867},'orthogVtr':{'x':-0.41283281850159353,'y':-0.03189223812021752,'z':0.9102482898175164},'minZoom':0.5}},{'longitude':56.842083333333335,'latitude':24.001666666666665,'magnitude':4.14,'b_v':-0.05,'letter':'v971','constell':'Tau','desigNo':'23','bsNo':'1156','serialNo':603,'main':false,'letterLabel':{'vtr':{'x':0.3313389395396401,'y':-0.9054945027980006,'z':-0.2651305575510839},'orthogVtr':{'x':0.8003490250983427,'y':0.1209272128561055,'z':0.5872120972995931},'minZoom':2.7}},{'longitude':355.31875,'latitude':44.43083333333333,'magnitude':4.15,'b_v':-0.07,'letter':'kappa','constell':'And','desigNo':'19','bsNo':'8976','serialNo':604,'main':false,'letterLabel':{'vtr':{'x':-0.21198638177883014,'y':0.2931310870364345,'z':-0.932274605335337},'orthogVtr':{'x':0.6697201237077199,'y':-0.6511584635333926,'z':-0.3570260652525914},'minZoom':0.5}},{'longitude':108.18958333333333,'latitude':-0.5230555555555556,'magnitude':4.15,'b_v':-0.01,'letter':'delta','constell':'Mon','desigNo':'22','bsNo':'2714','serialNo':605,'main':false,'letterLabel':{'vtr':{'x':-0.10742704512621064,'y':0.9938795076887719,'z':0.0257478964534132},'orthogVtr':{'x':-0.943939780625485,'y':-0.11009172135377401,'z':0.31121938153346784},'minZoom':0.5}},{'longitude':91.29625,'latitude':23.260833333333334,'magnitude':4.16,'b_v':0.84,'constell':'Gem','desigNo':'1','bsNo':'2134','serialNo':606,'main':false,'letterLabel':{'vtr':{'x':0.5847373439822086,'y':0.7499716615431896,'z':0.3092325103134851},'orthogVtr':{'x':-0.8109564110987187,'y':0.5306435887392268,'z':0.2465097990503418},'minZoom':0.5}},{'longitude':112.55875,'latitude':31.748333333333335,'magnitude':4.16,'b_v':0.32,'letter':'rho','constell':'Gem','desigNo':'62','bsNo':'2852','serialNo':607,'main':false,'letterLabel':{'vtr':{'x':0.9304363309493318,'y':0.0320383796863038,'z':-0.36505037498490783},'orthogVtr':{'x':0.16692572255997173,'y':0.8497637795233117,'z':0.5000373207652484},'minZoom':0.5}},{'longitude':261.86,'latitude':-24.19,'magnitude':4.16,'b_v':0.28,'constell':'Oph','desigNo':'44','bsNo':'6486','serialNo':608,'main':false,'letterLabel':{'vtr':{'x':0.8183804089424415,'y':0.4701887778665167,'z':0.3304179465882473},'orthogVtr':{'x':0.5599744305222613,'y':-0.7816751976720937,'z':-0.2746134055459834},'minZoom':0.5}},{'longitude':8.502083333333333,'latitude':63.028055555555554,'magnitude':4.17,'b_v':0.13,'letter':'kappa','constell':'Cas','desigNo':'15','bsNo':'130','main':false,'serialNo':609,'letterLabel':{'vtr':{'x':0.4011852022861524,'y':-0.1337421268635012,'z':0.9061807087819991},'orthogVtr':{'x':-0.7986460760391905,'y':0.4333871405791944,'z':0.4175404550553076},'minZoom':0.5}},{'longitude':334.43916666666667,'latitude':-7.695555555555556,'magnitude':4.17,'b_v':0.98,'letter':'theta','constell':'Aqr','desigNo':'43','bsNo':'8499','serialNo':610,'main':false,'letterLabel':{'vtr':{'x':-0.24919978430755044,'y':0.6444820491411863,'z':0.7228709122906024},'orthogVtr':{'x':0.372368831192345,'y':0.7528022209643619,'z':-0.5427985534869917},'minZoom':0.5}},{'longitude':57.5275,'latitude':-36.14805555555556,'magnitude':4.17,'b_v':0.93,'constell':'','desigNo':'','bsNo':'1195','serialNo':611,'main':false,'letterLabel':{'vtr':{'x':-0.900687616376761,'y':-0.30745052636262843,'z':-0.30697881285992884},'orthogVtr':{'x':0.028369717895479485,'y':-0.7466746509586846,'z':0.6645841742941653},'minZoom':1.8}},{'longitude':213.45791666666668,'latitude':-10.354444444444445,'magnitude':4.18,'b_v':1.32,'letter':'kappa','constell':'Vir','desigNo':'98','bsNo':'5315','serialNo':612,'main':false,'letterLabel':{'vtr':{'x':-0.569953783056027,'y':0.3239412478587465,'z':-0.7551256538589068},'orthogVtr':{'x':0.03996413436726376,'y':0.928846951123617,'z':0.36830179113416817},'minZoom':0.5}},{'longitude':333.92125,'latitude':57.13138888888889,'magnitude':4.18,'b_v':0.28,'letter':'epsilon','constell':'Cep','desigNo':'23','bsNo':'8494','main':true,'serialNo':613,'letterLabel':{'vtr':{'x':0.8526065686958681,'y':-0.516796887834427,'z':0.07734995631096857},'orthogVtr':{'x':-0.18826525023518248,'y':-0.1657102517699524,'z':0.9680373484593574},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.8138096481830098,'y':-0.5360535459806423,'z':0.2244113463393176},'orthogVtr':{'x':-0.31637892147503055,'y':-0.08476736788758844,'z':0.9448380133058294},'minZoom':0.5}},{'longitude':340.405,'latitude':-26.951944444444443,'magnitude':4.18,'b_v':-0.11,'letter':'epsilon','constell':'PsA','desigNo':'18','bsNo':'8628','serialNo':614,'main':false,'letterLabel':{'vtr':{'x':-0.474962745447309,'y':-0.8800059036376715,'z':0},'orthogVtr':{'x':-0.26307238043467013,'y':0.14198720661544093,'z':0.9542706931526193},'minZoom':0.5}},{'longitude':214.26208333333332,'latitude':46.00861111111111,'magnitude':4.18,'b_v':0.09,'letter':'lambda','constell':'Boo','desigNo':'19','bsNo':'5351','serialNo':615,'main':false,'letterLabel':{'vtr':{'x':0.7013230536362324,'y':0.6784528874229783,'z':-0.21874106607076343},'orthogVtr':{'x':0.4226588545388104,'y':-0.14866651034972508,'z':0.8940121707115491},'minZoom':0.5}},{'longitude':249.3825,'latitude':-35.28972222222222,'magnitude':4.18,'b_v':1.54,'constell':'','desigNo':'','bsNo':'6166','serialNo':616,'main':false,'letterLabel':{'vtr':{'x':0.7046828537641785,'y':-0.667756207910791,'z':-0.23984103570359677},'orthogVtr':{'x':-0.6486996504679073,'y':-0.4694160183981597,'z':-0.5990303541174136},'minZoom':1.8}},{'longitude':281.60375,'latitude':20.56416666666667,'magnitude':4.19,'b_v':0.48,'constell':'Her','desigNo':'110','bsNo':'7061','serialNo':617,'main':false,'letterLabel':{'vtr':{'x':-0.019519011787917206,'y':0.9350077006298214,'z':-0.354089830328064},'orthogVtr':{'x':0.9819127501846038,'y':-0.048782277004489685,'z':-0.18294163133405392},'minZoom':0.5}},{'longitude':207.61625,'latitude':-34.5375,'magnitude':4.19,'b_v':1.52,'letter':'v806','constell':'Cen','desigNo':'2','bsNo':'5192','serialNo':618,'main':false,'letterLabel':{'vtr':{'x':0.6336409979912101,'y':-0.7707313814352478,'z':0.06687468381695451},'orthogVtr':{'x':-0.2563891629386064,'y':-0.2907678320315662,'z':-0.9218018577673313},'minZoom':0.5}},{'longitude':341.89208333333335,'latitude':12.263055555555555,'magnitude':4.2,'b_v':0.5,'letter':'xi','constell':'Peg','desigNo':'46','bsNo':'8665','serialNo':619,'main':false,'letterLabel':{'vtr':{'x':0.06978369486828984,'y':0.7046043395116751,'z':-0.7061607187261592},'orthogVtr':{'x':0.3639883733218757,'y':-0.6770663334758807,'z':-0.6396042871651366},'minZoom':0.5}},{'longitude':119.40291666666667,'latitude':-22.92777777777778,'magnitude':4.2,'b_v':0.72,'constell':'Pup','desigNo':'11','bsNo':'3102','serialNo':620,'main':false,'letterLabel':{'vtr':{'x':-0.14168076213043285,'y':0.9195224609788838,'z':-0.3666128822033903},'orthogVtr':{'x':-0.8806114294690695,'y':0.052088994055233595,'z':0.4709673523576303},'minZoom':0.5}},{'longitude':344.22833333333335,'latitude':-32.44583333333333,'magnitude':4.2,'b_v':0.95,'letter':'delta','constell':'PsA','desigNo':'23','bsNo':'8720','serialNo':621,'main':false,'letterLabel':{'vtr':{'x':0.49520620874305843,'y':0.4258691380268984,'z':-0.7572359527244814},'orthogVtr':{'x':-0.3085747030252612,'y':-0.7285609385814987,'z':-0.6115395419971774},'minZoom':0.5}},{'longitude':82.93041666666667,'latitude':5.960277777777778,'magnitude':4.2,'b_v':-0.14,'constell':'Ori','desigNo':'32','bsNo':'1839','serialNo':622,'main':false,'letterLabel':{'vtr':{'x':-0.7842790456495259,'y':-0.5993371332962344,'z':-0.160316496990549},'orthogVtr':{'x':0.6082124084547714,'y':-0.7937332502750094,'z':-0.00807425597290451},'minZoom':0.5}},{'longitude':248.66708333333332,'latitude':42.401666666666664,'magnitude':4.2,'b_v':-0.01,'letter':'sigma','constell':'Her','desigNo':'35','bsNo':'6168','serialNo':623,'main':false,'letterLabel':{'vtr':{'x':-0.19146226781005654,'y':0.6624592710606739,'z':-0.7242167591203554},'orthogVtr':{'x':0.9440225455766487,'y':0.32624382768889654,'z':0.048850776225993736},'minZoom':0.5}},{'longitude':157.2225,'latitude':36.61694444444444,'magnitude':4.2,'b_v':0.91,'letter':'beta','constell':'LMi','desigNo':'31','bsNo':'4100','serialNo':624,'main':false,'letterLabel':{'vtr':{'x':-0.5659390875995782,'y':-0.30264112899340323,'z':0.7668906676760093},'orthogVtr':{'x':-0.3633770257463456,'y':-0.7433983495286841,'z':-0.5615300802964776},'minZoom':0.5}},{'longitude':307.46791666666667,'latitude':63.05333333333333,'magnitude':4.21,'b_v':0.2,'letter':'theta','constell':'Cep','desigNo':'2','bsNo':'7850','main':false,'serialNo':625,'letterLabel':{'vtr':{'x':-0.9589963687260554,'y':0.2294140213360181,'z':0.16641866357075735},'orthogVtr':{'x':-0.06583677448076938,'y':0.3907992108309574,'z':-0.9181184541985145},'minZoom':0.5}},{'longitude':66.60375,'latitude':22.3325,'magnitude':4.21,'b_v':0.14,'letter':'kappa^1','constell':'Tau','desigNo':'65','bsNo':'1387','serialNo':626,'main':false,'letterLabel':{'vtr':{'x':0.541155973245956,'y':-0.8296526915648372,'z':-0.13721014539546053},'orthogVtr':{'x':0.7564641402571497,'y':0.4090121290119223,'z':0.5103636770246743},'minZoom':1.3}},{'longitude':52.625,'latitude':59.999722222222225,'magnitude':4.21,'b_v':0.42,'constell':'','desigNo':'','bsNo':'1035','serialNo':627,'main':false,'letterLabel':{'vtr':{'x':-0.15231935275370584,'y':0.45575261893443775,'z':0.8769768327105872},'orthogVtr':{'x':-0.9405722563724093,'y':0.2056544406420458,'z':-0.2702407844621574},'minZoom':1.8}},{'longitude':251.05916666666667,'latitude':82.00611111111111,'magnitude':4.21,'b_v':0.9,'letter':'epsilon','constell':'UMi','desigNo':'22','bsNo':'6322','main':true,'serialNo':628,'letterLabel':{'vtr':{'x':0.9989627081137118,'y':0.0455357859064604,'z':0},'orthogVtr':{'x':0.005989666582074059,'y':-0.1314011261783888,'z':0.9913111862242284},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9989627081137118,'y':0.0455357859064604,'z':0},'orthogVtr':{'x':0.005989666582074059,'y':-0.1314011261783888,'z':0.9913111862242284},'minZoom':0.5}},{'longitude':321.96708333333333,'latitude':-65.28583333333333,'magnitude':4.21,'b_v':0.49,'letter':'gamma','constell':'Pav','desigNo':'','bsNo':'8181','serialNo':629,'main':false,'letterLabel':{'vtr':{'x':0.789682222641535,'y':0.11540753530412384,'z':-0.6025637626334265},'orthogVtr':{'x':-0.5176437533888586,'y':-0.40184793834167776,'z':-0.7553563258674927},'minZoom':0.5}},{'longitude':241.93666666666667,'latitude':-36.84861111111111,'magnitude':4.22,'b_v':-0.18,'letter':'theta','constell':'Lup','desigNo':'','bsNo':'5987','serialNo':630,'main':false,'letterLabel':{'vtr':{'x':0.4744677301516677,'y':0.5298579136993036,'z':0.7029444959134012},'orthogVtr':{'x':0.7957111557636484,'y':-0.599672587269521,'z':-0.08506788272172947},'minZoom':0.5}},{'longitude':118.45416666666667,'latitude':-48.149166666666666,'magnitude':4.22,'b_v':-0.13,'constell':'','desigNo':'','bsNo':'3090','serialNo':631,'main':false,'letterLabel':{'vtr':{'x':0.9317552793822399,'y':-0.35991286876177103,'z':-0.047904344719412004},'orthogVtr':{'x':0.17544012056068373,'y':0.5617918012515415,'z':-0.808461957140966},'minZoom':1.8}},{'longitude':56.900416666666665,'latitude':-23.198888888888888,'magnitude':4.22,'b_v':0.43,'letter':'tau^6','constell':'Eri','desigNo':'27','bsNo':'1173','serialNo':632,'main':false,'letterLabel':{'vtr':{'x':-0.8417657108480638,'y':-0.4270335642749402,'z':-0.330261749258212},'orthogVtr':{'x':0.19871220430819903,'y':-0.8139202357283923,'z':0.5459370931992205},'minZoom':0.5}},{'longitude':319.52625,'latitude':39.468611111111116,'magnitude':4.22,'b_v':0.1,'letter':'sigma','constell':'Cyg','desigNo':'67','bsNo':'8143','main':false,'serialNo':633,'letterLabel':{'vtr':{'x':0.013769005703488157,'y':0.6111416650106961,'z':-0.7914014656101489},'orthogVtr':{'x':0.8092939560463928,'y':-0.47164401799159583,'z':-0.35013599215093977},'minZoom':0.5}},{'longitude':283.4583333333333,'latitude':-62.165277777777774,'magnitude':4.22,'b_v':-0.15,'letter':'lambda','constell':'Pav','desigNo':'','bsNo':'7074','serialNo':634,'main':false,'letterLabel':{'vtr':{'x':0.9341214687994978,'y':-0.06540522805949651,'z':-0.3509120084442169},'orthogVtr':{'x':-0.3400114059870367,'y':-0.46231903993458767,'z':-0.8189342764304592},'minZoom':0.5}},{'longitude':311.59625,'latitude':30.784444444444446,'magnitude':4.22,'b_v':1.05,'constell':'Cyg','desigNo':'52','bsNo':'7942','main':false,'serialNo':635,'letterLabel':{'vtr':{'x':0.6602361757990274,'y':-0.7509601175139706,'z':0.012128234400736347},'orthogVtr':{'x':-0.48867656921132197,'y':-0.4172646547932197,'z':0.7662149950008466},'minZoom':0.9}},{'longitude':247.01,'latitude':-18.494722222222222,'magnitude':4.22,'b_v':0.22,'letter':'chi','constell':'Oph','desigNo':'7','bsNo':'6118','serialNo':636,'main':false,'letterLabel':{'vtr':{'x':-0.707191466096239,'y':0.7056745843548088,'z':-0.0436303939510058},'orthogVtr':{'x':0.6022334176787026,'y':0.6335586517381607,'z':0.48571426316174127},'minZoom':0.9}},{'longitude':282.0258333333333,'latitude':-4.727777777777778,'magnitude':4.22,'b_v':1.09,'letter':'beta','constell':'Sct','desigNo':'','bsNo':'7063','serialNo':637,'main':false,'letterLabel':{'vtr':{'x':-0.09599979770031308,'y':0.9899168612456447,'z':0.1041568368522673},'orthogVtr':{'x':0.9734824591360924,'y':0.1152010160039305,'z':-0.19763761703179908},'minZoom':0.5}},{'longitude':275.12625,'latitude':71.34666666666666,'magnitude':4.22,'b_v':-0.09,'letter':'phi','constell':'Dra','desigNo':'43','bsNo':'6920','main':true,'serialNo':638,'letterLabel':{'vtr':{'x':-0.031382686644413786,'y':-0.31768472659262853,'z':0.9476769182948088},'orthogVtr':{'x':-0.9990988055802321,'y':0.03708007188065124,'z':-0.020655385677340536},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.10075353749418414,'y':-0.31979956568183954,'z':0.9421130306243063},'orthogVtr':{'x':-0.9945008904044661,'y':-0.005172526521360722,'z':0.10460030570753734},'minZoom':0.5}},{'longitude':348.8070833333333,'latitude':-5.954444444444444,'magnitude':4.22,'b_v':1.55,'letter':'phi','constell':'Aqr','desigNo':'90','bsNo':'8834','serialNo':639,'main':false,'letterLabel':{'vtr':{'x':-0.0008845928193544905,'y':0.8790202121553284,'z':0.4767836869251563},'orthogVtr':{'x':0.2191691590000554,'y':0.46536217936990304,'z':-0.8575563665178533},'minZoom':0.5}},{'longitude':283.77916666666664,'latitude':36.92166666666667,'magnitude':4.22,'b_v':1.58,'letter':'delta^2','constell':'Lyr','desigNo':'12','bsNo':'7139','main':true,'serialNo':640,'letterLabel':{'vtr':{'x':0.55060743914863,'y':0.5894551986493394,'z':-0.5910786891264611},'orthogVtr':{'x':0.81275676098407,'y':-0.5400693866536814,'z':0.21852117763319798},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9581840000157007,'y':0.05836343130706306,'z':-0.2801377018538877},'orthogVtr':{'x':0.21360132650580804,'y':-0.7973243276743045,'z':0.5644894948656508},'minZoom':0.5}},{'longitude':42.92375,'latitude':38.38972222222222,'magnitude':4.22,'b_v':0.34,'constell':'Per','desigNo':'16','bsNo':'840','serialNo':641,'main':false,'letterLabel':{'vtr':{'x':0.5280225173841167,'y':0.21758408908803942,'z':0.8208832957924461},'orthogVtr':{'x':-0.6259187026232894,'y':0.7529988270223821,'z':0.20302350654368873},'minZoom':0.5}},{'longitude':5.242916666666667,'latitude':-64.77222222222223,'magnitude':4.23,'b_v':0.58,'letter':'zeta','constell':'Tuc','desigNo':'','bsNo':'77','serialNo':642,'main':false,'letterLabel':{'vtr':{'x':-0.7487986898550651,'y':-0.32649188513288174,'z':-0.5768046211792301},'orthogVtr':{'x':-0.5090733669129207,'y':-0.2739794868123133,'z':0.8159531530094142},'minZoom':0.5}},{'longitude':116.10083333333333,'latitude':28.83972222222222,'magnitude':4.23,'b_v':1.12,'letter':'sigma','constell':'Gem','desigNo':'75','bsNo':'2973','serialNo':643,'main':false,'letterLabel':{'vtr':{'x':0.4502286169209035,'y':0.8424259288366608,'z':0.2959945048969318},'orthogVtr':{'x':-0.8054637100111837,'y':0.24009651369087556,'z':0.5418319628524207},'minZoom':1.3}},{'longitude':210.63458333333332,'latitude':1.4605555555555556,'magnitude':4.23,'b_v':0.12,'letter':'tau','constell':'Vir','desigNo':'93','bsNo':'5264','serialNo':644,'main':false,'letterLabel':{'vtr':{'x':0.02961972800687729,'y':0.9995612396010554,'z':0},'orthogVtr':{'x':0.5091718067678759,'y':-0.015088150508171064,'z':0.8605326367471368},'minZoom':0.5}},{'longitude':206.67166666666665,'latitude':-33.13166666666667,'magnitude':4.23,'b_v':0.39,'constell':'Cen','desigNo':'1','bsNo':'5168','serialNo':645,'main':false,'letterLabel':{'vtr':{'x':-0.6445301659325036,'y':0.7330953726032337,'z':-0.21714520457690456},'orthogVtr':{'x':0.15688460144785743,'y':0.40476908579934395,'z':0.90086026053418},'minZoom':0.5}},{'longitude':326.0108333333333,'latitude':58.86083333333333,'magnitude':4.23,'b_v':2.24,'letter':'mu','constell':'Cep','desigNo':'','bsNo':'8316','main':false,'serialNo':646,'letterLabel':{'vtr':{'x':-0.13701684642921585,'y':-0.25468301907075697,'z':0.9572684804126776},'orthogVtr':{'x':-0.8929650850042066,'y':0.45005349203084144,'z':-0.00807534979276553},'minZoom':0.5}},{'longitude':326.86041666666665,'latitude':49.39111111111111,'magnitude':4.23,'b_v':-0.12,'letter':'pi^2','constell':'Cyg','desigNo':'81','bsNo':'8335','main':false,'serialNo':647,'letterLabel':{'vtr':{'x':-0.12999752208616988,'y':0.4957881110153308,'z':-0.8586587175515694},'orthogVtr':{'x':0.828284519074879,'y':-0.42172805057064877,'z':-0.36890406181387764},'minZoom':0.5}},{'longitude':198.17208333333335,'latitude':27.789722222222224,'magnitude':4.23,'b_v':0.57,'letter':'beta','constell':'Com','desigNo':'43','bsNo':'4983','serialNo':648,'main':false,'letterLabel':{'vtr':{'x':0.33639330081723784,'y':0.04996568671144791,'z':0.9403951176589214},'orthogVtr':{'x':-0.4246528533267784,'y':-0.883252468673077,'z':0.19883417901442504},'minZoom':0.5}},{'longitude':242.33041666666668,'latitude':44.88972222222222,'magnitude':4.23,'b_v':-0.05,'letter':'phi','constell':'Her','desigNo':'11','bsNo':'6023','serialNo':649,'main':false,'letterLabel':{'vtr':{'x':-0.9259956395434772,'y':-0.37139877666565246,'z':-0.06778660810015154},'orthogVtr':{'x':-0.18519280583496872,'y':0.6033138936340352,'z':-0.7757035325529411},'minZoom':0.5}},{'longitude':251.40416666666667,'latitude':-77.55083333333333,'magnitude':4.23,'b_v':1.06,'letter':'beta','constell':'Aps','desigNo':'','bsNo':'6163','serialNo':650,'main':false,'letterLabel':{'vtr':{'x':0.17440245742250549,'y':0.1898865073318217,'z':0.9661919566930338},'orthogVtr':{'x':0.9822718607284728,'y':-0.10205382727653871,'z':-0.15724823674443575},'minZoom':0.5}},{'longitude':349.20166666666665,'latitude':-8.992222222222221,'magnitude':4.24,'b_v':1.11,'letter':'psi^1','constell':'Aqr','desigNo':'91','bsNo':'8841','serialNo':651,'main':false,'letterLabel':{'vtr':{'x':-0.14018286434089475,'y':0.26070933190648243,'z':0.9551855363237332},'orthogVtr':{'x':0.19754015557547336,'y':0.9526808664316752,'z':-0.23103474559080994},'minZoom':0.5}},{'longitude':184.8525,'latitude':-79.40916666666668,'magnitude':4.24,'b_v':-0.12,'letter':'beta','constell':'Cha','desigNo':'','bsNo':'4674','serialNo':652,'main':false,'letterLabel':{'vtr':{'x':-0.23692609195681594,'y':0.05947908213027432,'z':0.9697052468348362},'orthogVtr':{'x':0.9541108311914052,'y':-0.17390372701113532,'z':0.2437827219777529},'minZoom':0.5}},{'longitude':41.23916666666667,'latitude':-13.785277777777777,'magnitude':4.24,'b_v':-0.12,'letter':'pi','constell':'Cet','desigNo':'89','bsNo':'811','serialNo':653,'main':false,'letterLabel':{'vtr':{'x':-0.5157699839301576,'y':0.4221836928244925,'z':-0.7454812225601388},'orthogVtr':{'x':-0.44792478857552265,'y':-0.8746323256709578,'z':-0.1854229723388793},'minZoom':0.5}},{'longitude':17.871666666666666,'latitude':86.35,'magnitude':4.24,'b_v':1.21,'constell':'','desigNo':'','bsNo':'285','serialNo':654,'main':false,'letterLabel':{'vtr':{'x':0.3777124679032605,'y':-0.0410404692582436,'z':-0.9250129574624842},'orthogVtr':{'x':0.9239384176546733,'y':-0.0486668119774488,'z':0.37943292133620954},'minZoom':1.8}},{'longitude':265.5995833333333,'latitude':-12.883333333333333,'magnitude':4.24,'b_v':0.09,'letter':'omicron','constell':'Ser','desigNo':'56','bsNo':'6581','serialNo':655,'main':false,'letterLabel':{'vtr':{'x':0.324466775752261,'y':0.9162027849586946,'z':0.23514626994035873},'orthogVtr':{'x':0.9429353384538582,'y':-0.3329540057446572,'z':-0.0038180562456292533},'minZoom':0.5}},{'longitude':248.1325,'latitude':-34.740833333333335,'magnitude':4.24,'b_v':-0.17,'constell':'','desigNo':'','bsNo':'6143','serialNo':656,'main':false,'letterLabel':{'vtr':{'x':-0.9328464582838469,'y':0.33943997588511166,'z':-0.12073933923290174},'orthogVtr':{'x':0.1900558906469877,'y':0.7483542217604242,'z':0.6354877789570229},'minZoom':1.8}},{'longitude':36.906666666666666,'latitude':-47.62583333333333,'magnitude':4.24,'b_v':-0.14,'letter':'kappa','constell':'Eri','desigNo':'','bsNo':'721','serialNo':657,'main':false,'letterLabel':{'vtr':{'x':0.3076250782354022,'y':0.6198873760664567,'z':-0.7218770340120996},'orthogVtr':{'x':-0.7841788645719265,'y':-0.2645266494807707,'z':-0.5613280325025304},'minZoom':0.5}},{'longitude':188.6425,'latitude':41.2625,'magnitude':4.24,'b_v':0.59,'letter':'beta','constell':'CVn','desigNo':'8','bsNo':'4785','serialNo':658,'main':false,'letterLabel':{'vtr':{'x':0.5832723218928626,'y':0.5557992729739253,'z':0.5923517254768191},'orthogVtr':{'x':-0.32788070226020505,'y':-0.5060967875329501,'z':0.7977219357233337},'minZoom':0.5}},{'longitude':326.48875,'latitude':61.20194444444445,'magnitude':4.25,'b_v':0.47,'letter':'nu','constell':'Cep','desigNo':'10','bsNo':'8334','main':false,'serialNo':659,'letterLabel':{'vtr':{'x':0.9081819038269915,'y':-0.41850964631653986,'z':0.007436766850310369},'orthogVtr':{'x':-0.11782388800977277,'y':-0.23855319144076725,'z':0.963955344540236},'minZoom':0.5}},{'longitude':193.60291666666666,'latitude':-40.27361111111111,'magnitude':4.25,'b_v':0.22,'constell':'','desigNo':'','bsNo':'4889','serialNo':660,'main':false,'letterLabel':{'vtr':{'x':0.6616223035926188,'y':-0.6603972955589797,'z':0.35514974223161405},'orthogVtr':{'x':0.11107862984696822,'y':-0.3820899722922551,'z':-0.9174250874403991},'minZoom':1.8}},{'longitude':126.00708333333333,'latitude':43.13055555555555,'magnitude':4.25,'b_v':1.55,'constell':'Lyn','desigNo':'31','bsNo':'3275','serialNo':661,'main':false,'letterLabel':{'vtr':{'x':0.3511693272556336,'y':-0.4759203945543526,'z':-0.8063373249714136},'orthogVtr':{'x':0.8322301624715855,'y':0.5532671930599549,'z':0.03589386794533739},'minZoom':0.5}},{'longitude':77.49625,'latitude':-8.732777777777779,'magnitude':4.25,'b_v':-0.19,'letter':'lambda','constell':'Eri','desigNo':'69','bsNo':'1679','serialNo':662,'main':false,'letterLabel':{'vtr':{'x':0.9275418572646233,'y':-0.2782588432483037,'z':0.24947568854741917},'orthogVtr':{'x':0.3063867329247145,'y':0.9484307000780514,'z':-0.08127962252112676},'minZoom':0.5}},{'longitude':61.97375,'latitude':50.39722222222222,'magnitude':4.25,'b_v':-0.01,'letter':'lambda','constell':'Per','desigNo':'47','bsNo':'1261','serialNo':663,'main':false,'letterLabel':{'vtr':{'x':0.01968227732083347,'y':0.584670822252993,'z':0.8110318351122074},'orthogVtr':{'x':-0.9538845315737133,'y':0.25400195940837594,'z':-0.15996032333395474},'minZoom':0.5}},{'longitude':216.87708333333333,'latitude':75.61805555555554,'magnitude':4.25,'b_v':1.43,'constell':'UMi','desigNo':'5','bsNo':'5430','main':false,'serialNo':664,'letterLabel':{'vtr':{'x':-0.951223823395963,'y':-0.1539762790764443,'z':-0.26732853062428336},'orthogVtr':{'x':0.23599980757667,'y':0.19490058489062612,'z':-0.9520072756198171},'minZoom':0.5}},{'longitude':69.47666666666667,'latitude':41.299166666666665,'magnitude':4.25,'b_v':1.17,'constell':'Per','desigNo':'58','bsNo':'1454','serialNo':665,'main':false,'letterLabel':{'vtr':{'x':0.8758855966421923,'y':0.14205108854309778,'z':0.46113545714732435},'orthogVtr':{'x':-0.4042908585687975,'y':0.7377219732240973,'z':0.5406618091746904},'minZoom':0.5}},{'longitude':69.15416666666667,'latitude':10.195277777777777,'magnitude':4.25,'b_v':0.18,'constell':'Tau','desigNo':'88','bsNo':'1458','serialNo':666,'main':false,'letterLabel':{'vtr':{'x':0.4826728495598119,'y':-0.8756674516880855,'z':0.01527855856766455},'orthogVtr':{'x':0.8027215068637444,'y':0.44930638895715286,'z':0.3921249179288191},'minZoom':0.5}},{'longitude':26.58,'latitude':9.245,'magnitude':4.26,'b_v':0.94,'letter':'omicron','constell':'Psc','desigNo':'110','bsNo':'510','serialNo':667,'main':false,'letterLabel':{'vtr':{'x':-0.2552734143945553,'y':0.9529344399132306,'z':-0.16355866571540495},'orthogVtr':{'x':-0.394572240514732,'y':-0.25710982801762017,'z':-0.882160576852046},'minZoom':0.5}},{'longitude':73.95041666666667,'latitude':66.36999999999999,'magnitude':4.26,'b_v':-0.01,'letter':'alpha','constell':'Cam','desigNo':'9','bsNo':'1542','serialNo':668,'main':false,'letterLabel':{'vtr':{'x':-0.9938048786445234,'y':0.10544841087780861,'z':-0.03510691991173618},'orthogVtr':{'x':-0.008456009130943208,'y':-0.38670964142844677,'z':-0.9221627563157491},'minZoom':0.5}},{'longitude':17.631666666666668,'latitude':47.334722222222226,'magnitude':4.26,'b_v':0.01,'letter':'phi','constell':'And','desigNo':'42','bsNo':'335','serialNo':669,'main':false,'letterLabel':{'vtr':{'x':-0.2990980096323537,'y':0.4911104614216817,'z':0.818138677313417},'orthogVtr':{'x':-0.7024120393815285,'y':0.4670192898292281,'z':-0.5371315573109493},'minZoom':0.5}},{'longitude':64.12166666666667,'latitude':-51.44305555555555,'magnitude':4.26,'b_v':0.31,'letter':'gamma','constell':'Dor','desigNo':'','bsNo':'1338','serialNo':670,'main':false,'letterLabel':{'vtr':{'x':0.796830180659342,'y':0.5097844659898104,'z':-0.32431691510910193},'orthogVtr':{'x':-0.5394944195224682,'y':0.35862639041089095,'z':-0.7617958278994251},'minZoom':0.5}},{'longitude':50.156666666666666,'latitude':-43.00361111111111,'magnitude':4.26,'b_v':0.71,'constell':'','desigNo':'','bsNo':'1008','serialNo':671,'main':false,'letterLabel':{'vtr':{'x':-0.47378204488162307,'y':-0.730446355909843,'z':0.49191330037499365},'orthogVtr':{'x':0.7456521992014009,'y':-0.03554554096162385,'z':0.6653865886414153},'minZoom':1.8}},{'longitude':134.86083333333335,'latitude':11.78888888888889,'magnitude':4.26,'b_v':0.14,'letter':'alpha','constell':'Cnc','desigNo':'65','bsNo':'3572','serialNo':672,'main':false,'letterLabel':{'vtr':{'x':0.695310406360693,'y':0.45186725982098075,'z':-0.5588912401428441},'orthogVtr':{'x':-0.19935264386382118,'y':0.8683748889129617,'z':0.4540744164670656},'minZoom':0.5}},{'longitude':53.64041666666667,'latitude':-21.575,'magnitude':4.26,'b_v':-0.11,'letter':'tau^5','constell':'Eri','desigNo':'19','bsNo':'1088','serialNo':673,'main':false,'letterLabel':{'vtr':{'x':-0.22687699921956628,'y':0.7977224610405442,'z':-0.5587179094825424},'orthogVtr':{'x':-0.8028571695766062,'y':-0.4779348701036248,'z':-0.35636866472583134},'minZoom':0.5}},{'longitude':331.07458333333335,'latitude':64.71361111111112,'magnitude':4.26,'b_v':0.38,'letter':'xi','constell':'Cep','desigNo':'17','bsNo':'8417','main':false,'serialNo':674,'letterLabel':{'vtr':{'x':-0.8128593307652913,'y':0.4266882315828986,'z':-0.3964805939973125},'orthogVtr':{'x':0.4466437615766225,'y':0.01970691931379459,'z':-0.8944948225539627},'minZoom':0.5}},{'longitude':264.43833333333333,'latitude':-38.645833333333336,'magnitude':4.26,'b_v':1.08,'constell':'','desigNo':'','bsNo':'6546','serialNo':675,'main':false,'letterLabel':{'vtr':{'x':-0.649262160950897,'y':-0.560807131628818,'z':-0.5137645447786655},'orthogVtr':{'x':-0.7567886276830234,'y':0.5435893716784438,'z':0.36301731089285727},'minZoom':1.8}},{'longitude':70.82458333333334,'latitude':22.989166666666666,'magnitude':4.27,'b_v':-0.11,'letter':'tau','constell':'Tau','desigNo':'94','bsNo':'1497','serialNo':676,'main':false,'letterLabel':{'vtr':{'x':-0.9518565977028124,'y':0.07550263580314504,'z':-0.2970999316667784},'orthogVtr':{'x':0.050384741925543694,'y':-0.9174772603349335,'z':-0.3945844073825035},'minZoom':0.5}},{'longitude':69.78458333333333,'latitude':12.544722222222221,'magnitude':4.27,'b_v':0.12,'constell':'Tau','desigNo':'90','bsNo':'1473','serialNo':677,'main':false,'letterLabel':{'vtr':{'x':-0.8342786841546019,'y':-0.3818094159293653,'z':-0.3977444494558567},'orthogVtr':{'x':0.43612717511971333,'y':-0.8983568537552775,'z':-0.052421850721030505},'minZoom':0.5}},{'longitude':15.963333333333333,'latitude':7.983888888888889,'magnitude':4.27,'b_v':0.95,'letter':'epsilon','constell':'Psc','desigNo':'71','bsNo':'294','serialNo':678,'main':false,'letterLabel':{'vtr':{'x':0.08166860873420013,'y':0.7429249048821117,'z':0.6643740091645108},'orthogVtr':{'x':-0.294618335208043,'y':0.6548059748250046,'z':-0.6960094625022829},'minZoom':0.5}},{'longitude':229.93958333333333,'latitude':-47.93833333333333,'magnitude':4.27,'b_v':-0.09,'letter':'mu','constell':'Lup','desigNo':'','bsNo':'5683','serialNo':679,'main':false,'letterLabel':{'vtr':{'x':0.6063886010788266,'y':0.18236960050948858,'z':0.7739729926112883},'orthogVtr':{'x':0.6681248177077841,'y':-0.6446298222989615,'z':-0.3715664411188792},'minZoom':0.5}},{'longitude':311.8675,'latitude':16.188333333333333,'magnitude':4.27,'b_v':1.04,'letter':'gamma^2','constell':'Del','desigNo':'12','bsNo':'7948','serialNo':680,'main':false,'letterLabel':{'vtr':{'x':0.5053331306281169,'y':0.5480514957338645,'z':-0.6665418104766274},'orthogVtr':{'x':0.5777753955323145,'y':-0.788614349192354,'z':-0.21038773862893628},'minZoom':0.5}},{'longitude':196.98541666666668,'latitude':-49.99944444444444,'magnitude':4.27,'b_v':-0.18,'letter':'xi^2','constell':'Cen','desigNo':'','bsNo':'4942','serialNo':681,'main':false,'letterLabel':{'vtr':{'x':0.5471031528638779,'y':-0.2426806771561224,'z':0.8011143670297333},'orthogVtr':{'x':0.5681139746535226,'y':-0.5952239486809523,'z':-0.5682912657432205},'minZoom':0.5}},{'longitude':352.21416666666664,'latitude':6.4752777777777775,'magnitude':4.27,'b_v':1.06,'letter':'theta','constell':'Psc','desigNo':'10','bsNo':'8916','serialNo':682,'main':false,'letterLabel':{'vtr':{'x':-0.1603585768150326,'y':0.8897424347610677,'z':0.4273681394621086},'orthogVtr':{'x':0.07156878400521555,'y':0.4423124614789252,'z':-0.8940008923801301},'minZoom':0.5}},{'longitude':41.47291666666667,'latitude':10.187222222222223,'magnitude':4.27,'b_v':0.31,'letter':'mu','constell':'Cet','desigNo':'87','bsNo':'813','serialNo':683,'main':false,'letterLabel':{'vtr':{'x':-0.16676044142826402,'y':0.9829048746966573,'z':0.07803180423518923},'orthogVtr':{'x':-0.6544834532351855,'y':-0.05115361154060815,'z':-0.7543438986746691},'minZoom':0.5}},{'longitude':291.12,'latitude':-44.765277777777776,'magnitude':4.27,'b_v':0.35,'letter':'beta^2','constell':'Sgr','desigNo':'','bsNo':'7343','serialNo':684,'main':false,'letterLabel':{'vtr':{'x':0.020864483340962442,'y':-0.680922567021996,'z':-0.732058147318292},'orthogVtr':{'x':-0.9664971108053092,'y':-0.2010996954001842,'z':0.15950626105248392},'minZoom':0.5}},{'longitude':64.12166666666667,'latitude':8.935,'magnitude':4.27,'b_v':-0.05,'letter':'mu','constell':'Tau','desigNo':'49','bsNo':'1320','serialNo':685,'main':false,'letterLabel':{'vtr':{'x':-0.703115714697333,'y':0.6751687835266462,'z':-0.22310402393683407},'orthogVtr':{'x':-0.5654421828574955,'y':-0.7211273925183515,'z':-0.4003129046196666},'minZoom':0.5}},{'longitude':332.69166666666666,'latitude':33.264722222222225,'magnitude':4.28,'b_v':0.47,'letter':'pi','constell':'Peg','desigNo':'29','bsNo':'8454','serialNo':686,'main':false,'letterLabel':{'vtr':{'x':0.5939468252447588,'y':-0.8045043000392677,'z':0},'orthogVtr':{'x':-0.3086124402221751,'y':-0.2278413913910119,'z':0.9234969746074551},'minZoom':0.5}},{'longitude':303.4508333333333,'latitude':56.62166666666667,'magnitude':4.28,'b_v':0.11,'constell':'Cyg','desigNo':'33','bsNo':'7740','main':false,'serialNo':687,'letterLabel':{'vtr':{'x':-0.6682736041677955,'y':-0.15702757380583582,'z':0.7271538565099119},'orthogVtr':{'x':-0.6792953526258209,'y':0.5272796860436738,'z':-0.5104252703252914},'minZoom':0.5}},{'longitude':346.96458333333334,'latitude':-43.425555555555555,'magnitude':4.28,'b_v':0.42,'letter':'theta','constell':'Gru','desigNo':'','bsNo':'8787','serialNo':688,'main':false,'letterLabel':{'vtr':{'x':0.5555186304907365,'y':0.6843463679840368,'z':0.47230191594440274},'orthogVtr':{'x':0.43677004592339386,'y':0.24317782989947223,'z':-0.8660810989910006},'minZoom':0.5}},{'longitude':144.86416666666668,'latitude':81.24694444444445,'magnitude':4.28,'b_v':1.49,'constell':'','desigNo':'','bsNo':'3751','serialNo':689,'main':false,'letterLabel':{'vtr':{'x':-0.1393110649928944,'y':-0.10479638105142569,'z':-0.9846878417493892},'orthogVtr':{'x':0.9823976295562478,'y':0.11034166188797712,'z':-0.1507302726530572},'minZoom':1.8}},{'longitude':262.11833333333334,'latitude':-29.88138888888889,'magnitude':4.28,'b_v':0.4,'constell':'Oph','desigNo':'45','bsNo':'6492','serialNo':690,'main':false,'letterLabel':{'vtr':{'x':-0.2738276148689827,'y':-0.8150057030619103,'z':-0.5106702863019594},'orthogVtr':{'x':-0.9544012689024837,'y':0.2958992436690421,'z':0.03952031772921484},'minZoom':0.5}},{'longitude':156.98875,'latitude':-31.15722222222222,'magnitude':4.28,'b_v':1.43,'letter':'alpha','constell':'Ant','desigNo':'','bsNo':'4104','serialNo':691,'main':false,'letterLabel':{'vtr':{'x':0.07329840328384382,'y':-0.6177917828932014,'z':0.7829180398136696},'orthogVtr':{'x':0.6117382288626756,'y':-0.5921509294277061,'z':-0.5245318065912312},'minZoom':0.5}},{'longitude':320.8045833333333,'latitude':-16.759166666666665,'magnitude':4.28,'b_v':0.89,'letter':'iota','constell':'Cap','desigNo':'32','bsNo':'8167','serialNo':692,'main':false,'letterLabel':{'vtr':{'x':-0.36218858253920405,'y':-0.9321048388879022,'z':0},'orthogVtr':{'x':-0.5640396144161476,'y':0.21916923925111398,'z':0.796130741734906},'minZoom':0.5}},{'longitude':66.83958333333334,'latitude':22.851944444444445,'magnitude':4.28,'b_v':0.26,'letter':'upsilon','constell':'Tau','desigNo':'69','bsNo':'1392','serialNo':693,'main':false,'letterLabel':{'vtr':{'x':-0.4659527759247526,'y':0.8627934315650292,'z':0.19615173987568527},'orthogVtr':{'x':-0.8071726084933326,'y':-0.3236832524635342,'z':-0.4936613537362398},'minZoom':0.5}},{'longitude':354.75,'latitude':43.365,'magnitude':4.29,'b_v':-0.08,'letter':'iota','constell':'And','desigNo':'17','bsNo':'8965','serialNo':694,'main':false,'letterLabel':{'vtr':{'x':0.6151954407860055,'y':-0.6862162062969663,'z':0.38812612363961263},'orthogVtr':{'x':-0.31215218866363204,'y':0.2400582481093816,'z':0.9192023980751787},'minZoom':0.5}},{'longitude':331.845,'latitude':-13.784166666666666,'magnitude':4.29,'b_v':-0.08,'letter':'iota','constell':'Aqr','desigNo':'33','bsNo':'8418','serialNo':695,'main':false,'letterLabel':{'vtr':{'x':0.4506126147445694,'y':-0.08903652194877634,'z':-0.8882684105563631},'orthogVtr':{'x':-0.25244602291417934,'y':-0.967110256733263,'z':-0.031124858813104922},'minZoom':0.5}},{'longitude':338.12416666666667,'latitude':-32.255833333333335,'magnitude':4.29,'b_v':0.01,'letter':'beta','constell':'PsA','desigNo':'17','bsNo':'8576','serialNo':696,'main':false,'letterLabel':{'vtr':{'x':0.36433131525700746,'y':0.8085429214858382,'z':0.4620833656800954},'orthogVtr':{'x':0.5013819262948664,'y':0.24783461231575163,'z':-0.8289717539959671},'minZoom':0.5}},{'longitude':160.00166666666667,'latitude':-55.69472222222222,'magnitude':4.29,'b_v':1.03,'constell':'','desigNo':'','bsNo':'4180','serialNo':697,'main':false,'letterLabel':{'vtr':{'x':-0.805005080672798,'y':0.5610953427622285,'z':-0.19271439080027075},'orthogVtr':{'x':-0.2673409628433977,'y':-0.0530979386677632,'z':0.9621379415110912},'minZoom':1.8}},{'longitude':178.44916666666666,'latitude':-34.00555555555555,'magnitude':4.29,'b_v':-0.1,'letter':'beta','constell':'Hya','desigNo':'','bsNo':'4552','serialNo':698,'main':false,'letterLabel':{'vtr':{'x':-0.12184700835829061,'y':0.14112973939028084,'z':0.9824640976716482},'orthogVtr':{'x':0.5462996121119866,'y':-0.8168817463762217,'z':0.18509712651369656},'minZoom':0.5}},{'longitude':54.442083333333336,'latitude':0.45611111111111113,'magnitude':4.29,'b_v':0.58,'constell':'Tau','desigNo':'10','bsNo':'1101','serialNo':699,'main':false,'letterLabel':{'vtr':{'x':0.5177411691470674,'y':0.7676975419761363,'z':0.3776037153074983},'orthogVtr':{'x':-0.6275296745117783,'y':0.6407629152681893,'z':-0.44230011759454996},'minZoom':0.5}},{'longitude':80.09541666666667,'latitude':-13.16,'magnitude':4.29,'b_v':-0.24,'letter':'lambda','constell':'Lep','desigNo':'6','bsNo':'1756','serialNo':700,'main':false,'letterLabel':{'vtr':{'x':-0.9770006970874265,'y':-0.16857535487380054,'z':-0.13058325933998907},'orthogVtr':{'x':0.13197166912701658,'y':-0.9590350395595141,'z':0.2506696460381883},'minZoom':0.5}},{'longitude':235.86708333333334,'latitude':77.74,'magnitude':4.29,'b_v':0.04,'letter':'zeta','constell':'UMi','desigNo':'16','bsNo':'5903','main':true,'serialNo':701,'letterLabel':{'vtr':{'x':-0.18861236030073944,'y':0.15152906015133685,'z':-0.9702908437532721},'orthogVtr':{'x':0.9747965176156789,'y':0.14876395340813423,'z':-0.1662559334602179},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.2428988001951411,'y':0.14296150398923807,'z':-0.9594593171369468},'orthogVtr':{'x':0.9627061057652181,'y':0.15701521671831703,'z':-0.22032515889309823},'minZoom':0.5}},{'longitude':248.03583333333333,'latitude':-16.649444444444445,'magnitude':4.29,'b_v':0.92,'letter':'phi','constell':'Oph','desigNo':'8','bsNo':'6147','serialNo':702,'main':false,'letterLabel':{'vtr':{'x':-0.120774676157348,'y':0.9579723260556936,'z':0.2601970409334652},'orthogVtr':{'x':0.9257438841236001,'y':0.014072192169879177,'z':0.3778891827180087},'minZoom':0.5}},{'longitude':304.65416666666664,'latitude':-12.453055555555554,'magnitude':4.3,'b_v':0.93,'letter':'alpha^1','constell':'Cap','desigNo':'5','bsNo':'7747','serialNo':703,'main':false,'letterLabel':{'vtr':{'x':-0.7154524945541745,'y':0.368606119919434,'z':0.5935126421519166},'orthogVtr':{'x':0.42406619658644257,'y':0.9042284441956956,'z':-0.05038632374108046},'minZoom':0.5}},{'longitude':90.30875,'latitude':45.936388888888885,'magnitude':4.3,'b_v':1.7,'letter':'pi','constell':'Aur','desigNo':'35','bsNo':'2091','serialNo':704,'main':false,'letterLabel':{'vtr':{'x':-0.07135809447911902,'y':0.6934862973356697,'z':0.7169273169296677},'orthogVtr':{'x':-0.9974437216756598,'y':-0.052312485826108604,'z':-0.04867674923926301},'minZoom':0.5}},{'longitude':215.39041666666665,'latitude':-56.46611111111111,'magnitude':4.3,'b_v':0.08,'constell':'','desigNo':'','bsNo':'5358','serialNo':705,'main':false,'letterLabel':{'vtr':{'x':-0.8829354276151672,'y':0.4690315466901965,'z':-0.02084319724571423},'orthogVtr':{'x':0.13268652511698434,'y':0.2918705775062504,'z':0.9472095079962763},'minZoom':1.8}},{'longitude':174.46125,'latitude':-0.9205555555555556,'magnitude':4.3,'b_v':0.98,'letter':'upsilon','constell':'Leo','desigNo':'91','bsNo':'4471','serialNo':706,'main':false,'letterLabel':{'vtr':{'x':0.03403204935081826,'y':-0.9816703808908056,'z':-0.1875235529171849},'orthogVtr':{'x':0.09172478787162298,'y':0.18990825634538422,'z':-0.9775077582616732},'minZoom':0.5}},{'longitude':164.13958333333332,'latitude':24.65611111111111,'magnitude':4.3,'b_v':0.02,'constell':'Leo','desigNo':'54','bsNo':'4259','serialNo':707,'main':false,'letterLabel':{'vtr':{'x':0.15109189532858225,'y':0.7199394472472924,'z':0.6773909000446343},'orthogVtr':{'x':-0.46140490564020414,'y':-0.5546670397067769,'z':0.6924232723660255},'minZoom':0.5}},{'longitude':66.62625,'latitude':17.966666666666665,'magnitude':4.3,'b_v':0.05,'letter':'v776','constell':'Tau','desigNo':'68','bsNo':'1389','serialNo':708,'main':false,'letterLabel':{'vtr':{'x':-0.9258094589037493,'y':0.1038293395911647,'z':-0.3634505661632808},'orthogVtr':{'x':0.021450168361042785,'y':-0.9455525639147087,'z':-0.3247618191099494},'minZoom':1.6}},{'longitude':37.27291666666667,'latitude':8.5375,'magnitude':4.3,'b_v':-0.05,'letter':'xi^2','constell':'Cet','desigNo':'73','bsNo':'718','serialNo':709,'main':false,'letterLabel':{'vtr':{'x':0.2516070365596689,'y':0.8090538487707635,'z':0.5311551270042267},'orthogVtr':{'x':-0.5633970733764115,'y':0.5686760776941311,'z':-0.5993256680380985},'minZoom':0.5}},{'longitude':177.63666666666666,'latitude':-63.88583333333333,'magnitude':4.3,'b_v':-0.15,'constell':'','desigNo':'','bsNo':'4537','serialNo':710,'main':false,'letterLabel':{'vtr':{'x':0.8368162372464897,'y':-0.40235463034230895,'z':-0.37128067081755084},'orthogVtr':{'x':-0.32607690642558174,'y':0.17847305633467525,'z':-0.9283432658550835},'minZoom':1.8}},{'longitude':188.24375,'latitude':-16.29277777777778,'magnitude':4.3,'b_v':0.39,'letter':'eta','constell':'Crv','desigNo':'8','bsNo':'4775','serialNo':711,'main':false,'letterLabel':{'vtr':{'x':-0.02058661353917396,'y':0.49565349370467726,'z':0.8682763416800762},'orthogVtr':{'x':0.31180623565240595,'y':-0.8219621111656206,'z':0.4766079722543806},'minZoom':0.5}},{'longitude':14.862083333333333,'latitude':-29.263333333333332,'magnitude':4.3,'b_v':-0.15,'letter':'alpha','constell':'Scl','desigNo':'','bsNo':'280','serialNo':712,'main':false,'letterLabel':{'vtr':{'x':0.5322078118786808,'y':0.8178174744876389,'z':0.21892789543127375},'orthogVtr':{'x':-0.07597768200127886,'y':0.3036863745976534,'z':-0.9497378468406144},'minZoom':0.5}},{'longitude':131.03458333333333,'latitude':3.3347222222222226,'magnitude':4.3,'b_v':-0.19,'letter':'eta','constell':'Hya','desigNo':'7','bsNo':'3454','serialNo':713,'main':false,'letterLabel':{'vtr':{'x':-0.6992364791148822,'y':-0.4236265582664499,'z':0.5758549169767894},'orthogVtr':{'x':0.28550921581638783,'y':-0.9039673131518664,'z':-0.3183199403696013},'minZoom':0.5}},{'longitude':56.56333333333333,'latitude':24.520833333333332,'magnitude':4.3,'b_v':-0.11,'constell':'Tau','desigNo':'19','bsNo':'1145','serialNo':714,'main':false,'letterLabel':{'vtr':{'x':0.2314452368038457,'y':0.7811672149240603,'z':0.5798369466398283},'orthogVtr':{'x':-0.8337339324934211,'y':0.4664041058575302,'z':-0.2955586910383342},'minZoom':7.6}},{'longitude':309.81,'latitude':-1.0430555555555556,'magnitude':4.31,'b_v':0.95,'constell':'Aql','desigNo':'71','bsNo':'7884','serialNo':715,'main':false,'letterLabel':{'vtr':{'x':0.4197704491664623,'y':0.8455826988572339,'z':-0.32982217845363737},'orthogVtr':{'x':0.6434411447411379,'y':-0.533533994179401,'z':-0.5489307518341352},'minZoom':0.5}},{'longitude':242.10875,'latitude':-20.91472222222222,'magnitude':4.31,'b_v':0.83,'letter':'omega^2','constell':'Sco','desigNo':'10','bsNo':'5997','serialNo':716,'main':false,'letterLabel':{'vtr':{'x':0.5937327299468559,'y':-0.8039698811964459,'z':-0.033374773689521076},'orthogVtr':{'x':-0.6756744180581664,'y':-0.47560394700488134,'z':-0.5632627862509083},'minZoom':2.6}},{'longitude':217.48291666666665,'latitude':-83.74555555555555,'magnitude':4.31,'b_v':1.3,'letter':'delta','constell':'Oct','desigNo':'','bsNo':'5339','serialNo':717,'main':false,'letterLabel':{'vtr':{'x':0.17637631255880806,'y':0.05022185282988925,'z':0.9830407732472193},'orthogVtr':{'x':0.9805190706866456,'y':-0.09667759344625053,'z':-0.1709847798642871},'minZoom':0.5}},{'longitude':231.28791666666666,'latitude':37.31666666666667,'magnitude':4.31,'b_v':0.31,'letter':'mu^1','constell':'Boo','desigNo':'51','bsNo':'5733','serialNo':718,'main':false,'letterLabel':{'vtr':{'x':-0.7044627931990772,'y':-0.6997097381316506,'z':0.11890523689850942},'orthogVtr':{'x':-0.5063010277873378,'y':0.3780262883286793,'z':-0.7750841209790891},'minZoom':0.5}},{'longitude':130.25083333333333,'latitude':-59.823888888888895,'magnitude':4.31,'b_v':-0.12,'letter':'v343','constell':'Car','desigNo':'','bsNo':'3457','serialNo':719,'main':false,'letterLabel':{'vtr':{'x':0.9182100860072139,'y':-0.385448639014685,'z':0.09121175711689983},'orthogVtr':{'x':0.22672518932403957,'y':0.3226390743317281,'z':-0.9189666567620093},'minZoom':0.7}},{'longitude':54.43541666666667,'latitude':48.24944444444444,'magnitude':4.32,'b_v':-0.06,'letter':'psi','constell':'Per','desigNo':'37','bsNo':'1087','serialNo':720,'main':false,'letterLabel':{'vtr':{'x':-0.710951129564757,'y':0.6157365717215402,'z':0.3397307251562631},'orthogVtr':{'x':-0.5869850812255699,'y':-0.25352810754602684,'z':-0.7688771118343563},'minZoom':0.5}},{'longitude':94.12333333333333,'latitude':29.490000000000002,'magnitude':4.32,'b_v':1.02,'letter':'kappa','constell':'Aur','desigNo':'44','bsNo':'2219','serialNo':721,'main':false,'letterLabel':{'vtr':{'x':0.9920142667574162,'y':0.1261257093131529,'z':0},'orthogVtr':{'x':-0.10950089810006756,'y':0.8612554389550543,'z':0.4962344427643204},'minZoom':0.5}},{'longitude':83.31,'latitude':18.605833333333333,'magnitude':4.32,'b_v':2.06,'letter':'CE','constell':'Tau','desigNo':'119','bsNo':'1845','serialNo':722,'main':false,'letterLabel':{'vtr':{'x':-0.9907224418309986,'y':0.11083793606424838,'z':-0.07863838236790698},'orthogVtr':{'x':-0.07923981019834142,'y':-0.9412323559681889,'z':-0.3283332218315762},'minZoom':0.5}},{'longitude':260.4533333333333,'latitude':-12.863333333333333,'magnitude':4.32,'b_v':0.04,'letter':'nu','constell':'Ser','desigNo':'53','bsNo':'6446','serialNo':723,'main':false,'letterLabel':{'vtr':{'x':0.618132094961454,'y':0.7365798491031963,'z':0.2745229299597333},'orthogVtr':{'x':0.7692655542862625,'y':-0.6386608416924123,'z':-0.018515838554833353},'minZoom':0.5}},{'longitude':131.80083333333334,'latitude':-13.612499999999999,'magnitude':4.32,'b_v':0.9,'constell':'Hya','desigNo':'12','bsNo':'3484','serialNo':724,'main':false,'letterLabel':{'vtr':{'x':-0.5244343641850626,'y':-0.5520467336268875,'z':0.6482383832770887},'orthogVtr':{'x':0.5525377634163697,'y':-0.7999080102797613,'z':-0.2341990501456171},'minZoom':0.5}},{'longitude':180.98166666666665,'latitude':-63.41027777777778,'magnitude':4.32,'b_v':0.28,'letter':'theta^1','constell':'Cru','desigNo':'','bsNo':'4599','serialNo':725,'main':false,'letterLabel':{'vtr':{'x':-0.8655365265682241,'y':0.43529494942230257,'z':0.24771925275127252},'orthogVtr':{'x':0.22485716065489642,'y':-0.10422519361526088,'z':0.9688015102785912},'minZoom':0.5}},{'longitude':70.30208333333333,'latitude':-19.63888888888889,'magnitude':4.32,'b_v':1.6,'letter':'DM','constell':'Eri','desigNo':'54','bsNo':'1496','serialNo':726,'main':false,'letterLabel':{'vtr':{'x':-0.8781271562826704,'y':-0.4571446157614083,'z':-0.14110810635560583},'orthogVtr':{'x':0.3579324425555298,'y':-0.8234450222835841,'z':0.4402529521111931},'minZoom':0.5}},{'longitude':143.17916666666667,'latitude':22.89,'magnitude':4.32,'b_v':1.54,'letter':'lambda','constell':'Leo','desigNo':'4','bsNo':'3773','serialNo':727,'main':false,'letterLabel':{'vtr':{'x':0.026145658995884502,'y':-0.8004486884291679,'z':-0.5988307788580141},'orthogVtr':{'x':0.6748673752279263,'y':0.456058715392396,'z':-0.5801417705764745},'minZoom':0.5}},{'longitude':223.19708333333332,'latitude':-43.64666666666667,'magnitude':4.32,'b_v':-0.15,'letter':'omicron','constell':'Lup','desigNo':'','bsNo':'5528','serialNo':728,'main':false,'letterLabel':{'vtr':{'x':-0.3773874960444841,'y':-0.33197084915299235,'z':-0.8645079717052445},'orthogVtr':{'x':-0.7611225215044215,'y':0.642967101464118,'z':0.08535697800169695},'minZoom':0.5}},{'longitude':275.11875,'latitude':36.07333333333334,'magnitude':4.33,'b_v':1.16,'letter':'kappa','constell':'Lyr','desigNo':'1','bsNo':'6872','main':false,'serialNo':729,'letterLabel':{'vtr':{'x':-0.7276176497519887,'y':-0.5209975056130022,'z':0.4462445012707967},'orthogVtr':{'x':-0.6821819381828509,'y':0.6179420089987415,'z':-0.39086503646615434},'minZoom':0.5}},{'longitude':272.56625,'latitude':-63.66555555555556,'magnitude':4.33,'b_v':0.23,'letter':'pi','constell':'Pav','desigNo':'','bsNo':'6745','serialNo':730,'main':false,'letterLabel':{'vtr':{'x':0.6171544185409916,'y':-0.3377370795902118,'z':-0.7106715758669441},'orthogVtr':{'x':-0.7865913216833955,'y':-0.2876170057839834,'z':-0.5463977952336789},'minZoom':0.5}},{'longitude':112.27875,'latitude':8.88888888888889,'magnitude':4.33,'b_v':1.43,'letter':'gamma','constell':'CMi','desigNo':'4','bsNo':'2854','serialNo':731,'main':false,'letterLabel':{'vtr':{'x':-0.2975816051243792,'y':0.9138198580977528,'z':0.27636652336670736},'orthogVtr':{'x':-0.87815155612263,'y':-0.37557583736897976,'z':0.2962982194748945},'minZoom':0.5}},{'longitude':216.82833333333335,'latitude':-45.4575,'magnitude':4.33,'b_v':0.43,'letter':'tau^2','constell':'Lup','desigNo':'','bsNo':'5396','serialNo':732,'main':false,'letterLabel':{'vtr':{'x':0.7438686276149591,'y':-0.6573011979538523,'z':-0.12089085994676402},'orthogVtr':{'x':-0.3625286147374468,'y':-0.2448889406200833,'z':-0.8992232260448577},'minZoom':0.5}},{'longitude':193.52833333333334,'latitude':-49.038333333333334,'magnitude':4.33,'b_v':1.34,'constell':'','desigNo':'','bsNo':'4888','serialNo':733,'main':false,'letterLabel':{'vtr':{'x':-0.433915886149864,'y':0.5161906439598876,'z':0.7384200856118792},'orthogVtr':{'x':0.6367751753921314,'y':-0.40410171900372427,'z':0.6566728079512318},'minZoom':1.8}},{'longitude':281.94875,'latitude':18.202222222222222,'magnitude':4.34,'b_v':0.15,'constell':'Her','desigNo':'111','bsNo':'7069','serialNo':734,'main':false,'letterLabel':{'vtr':{'x':-0.266285933851956,'y':-0.8952447774439777,'z':0.35725143791435576},'orthogVtr':{'x':-0.943615460939134,'y':0.31774308823149305,'z':0.09289344302877164},'minZoom':0.5}},{'longitude':9.455,'latitude':33.815555555555555,'magnitude':4.34,'b_v':-0.12,'letter':'pi','constell':'And','desigNo':'29','bsNo':'154','serialNo':735,'main':false,'letterLabel':{'vtr':{'x':0.5501989610343684,'y':-0.697729847569325,'z':0.458752834419133},'orthogVtr':{'x':-0.16007711223476456,'y':0.4510623124057163,'z':0.8780194237406067},'minZoom':1.5}},{'longitude':337.56583333333333,'latitude':47.79694444444444,'magnitude':4.34,'b_v':1.68,'constell':'Lac','desigNo':'5','bsNo':'8572','serialNo':736,'main':false,'letterLabel':{'vtr':{'x':0.26758772736371905,'y':-0.5077004358793697,'z':0.8189243405664641},'orthogVtr':{'x':-0.7367867412553967,'y':0.43988850040695293,'z':0.5134621749651824},'minZoom':0.5}},{'longitude':326.335,'latitude':17.430833333333336,'magnitude':4.34,'b_v':1.16,'constell':'Peg','desigNo':'9','bsNo':'8313','serialNo':737,'main':false,'letterLabel':{'vtr':{'x':0.542291482013056,'y':-0.7421571564583888,'z':-0.3938561966678723},'orthogVtr':{'x':-0.2745312102540369,'y':-0.5995581675891857,'z':0.7517729832027429},'minZoom':0.5}},{'longitude':18.045,'latitude':55.2425,'magnitude':4.34,'b_v':0.17,'letter':'theta','constell':'Cas','desigNo':'33','bsNo':'343','main':false,'serialNo':738,'letterLabel':{'vtr':{'x':-0.6410503694391217,'y':0.2683988260173851,'z':-0.7190385900871072},'orthogVtr':{'x':0.5433435834280818,'y':-0.5029721619184514,'z':-0.6721582809745117},'minZoom':0.5}},{'longitude':261.84583333333336,'latitude':4.126388888888888,'magnitude':4.34,'b_v':1.48,'letter':'sigma','constell':'Oph','desigNo':'49','bsNo':'6498','serialNo':739,'main':false,'letterLabel':{'vtr':{'x':-0.9854844691985692,'y':-0.10478377819728685,'z':-0.13356916109310574},'orthogVtr':{'x':-0.09384432171537439,'y':0.991888388023418,'z':-0.08573604251472555},'minZoom':0.5}},{'longitude':281.34375,'latitude':37.62416666666667,'magnitude':4.34,'b_v':0.19,'letter':'zeta^1','constell':'Lyr','desigNo':'6','bsNo':'7056','main':true,'serialNo':740,'letterLabel':{'vtr':{'x':-0.05469172638896724,'y':-0.7796215254123272,'z':0.6238582308332162},'orthogVtr':{'x':-0.9862751668755017,'y':0.1396614344609953,'z':0.08806803579618924},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.3358940915648536,'y':-0.7065701889212451,'z':0.6228432606841131},'orthogVtr':{'x':-0.9289268264952446,'y':0.35787373092997904,'z':-0.09498075451232922},'minZoom':0.5}},{'longitude':210.70625,'latitude':-45.6875,'magnitude':4.34,'b_v':0.6,'letter':'upsilon^2','constell':'Cen','desigNo':'','bsNo':'5260','serialNo':741,'main':false,'letterLabel':{'vtr':{'x':0.7917092579027635,'y':-0.4700373726345334,'z':0.39020676477718913},'orthogVtr':{'x':0.11153873527062125,'y':-0.5167851404966435,'z':-0.8488181366441783},'minZoom':1.6}},{'longitude':125.02208333333333,'latitude':-77.54027777777777,'magnitude':4.34,'b_v':1.16,'letter':'theta','constell':'Cha','desigNo':'','bsNo':'3340','serialNo':742,'main':false,'letterLabel':{'vtr':{'x':0.6418114006651462,'y':-0.2146037849845982,'z':0.7362223451149302},'orthogVtr':{'x':0.7568004756330942,'y':0.022241353657725615,'z':-0.6532674507956097},'minZoom':1.3}},{'longitude':234.80958333333334,'latitude':-42.623333333333335,'magnitude':4.34,'b_v':1.41,'letter':'omega','constell':'Lup','desigNo':'','bsNo':'5797','serialNo':743,'main':false,'letterLabel':{'vtr':{'x':0.8681040491775,'y':-0.11475618674882293,'z':0.48293516894558247},'orthogVtr':{'x':0.2580240531725803,'y':-0.7268177971158041,'z':-0.6365213883131686},'minZoom':0.5}},{'longitude':98.14625,'latitude':-23.431944444444447,'magnitude':4.34,'b_v':-0.25,'letter':'xi^1','constell':'CMa','desigNo':'4','bsNo':'2387','serialNo':744,'main':false,'letterLabel':{'vtr':{'x':0.8563524674806823,'y':-0.5067572128807473,'z':0.09928533946703295},'orthogVtr':{'x':0.49975655606006725,'y':0.7648947910627374,'z':-0.4064226165951792},'minZoom':0.5}},{'longitude':144.36333333333334,'latitude':-49.43388888888889,'magnitude':4.34,'b_v':0.17,'constell':'','desigNo':'','bsNo':'3836','serialNo':745,'main':false,'letterLabel':{'vtr':{'x':-0.8387096951648114,'y':0.39829925833561874,'z':0.3713808665586383},'orthogVtr':{'x':0.13120318189722976,'y':-0.5140820228563722,'z':0.8476469777188751},'minZoom':1.8}},{'longitude':9.87125,'latitude':29.406388888888888,'magnitude':4.34,'b_v':0.87,'letter':'epsilon','constell':'And','desigNo':'30','bsNo':'163','serialNo':746,'main':false,'letterLabel':{'vtr':{'x':0.5092662078041866,'y':-0.8508203965616609,'z':0.12943176728841133},'orthogVtr':{'x':0.06351631972238359,'y':0.18714371967273136,'z':0.9802769533738811},'minZoom':0.5}},{'longitude':86.20166666666667,'latitude':-65.72916666666667,'magnitude':4.34,'b_v':0.22,'letter':'delta','constell':'Dor','desigNo':'','bsNo':'2015','serialNo':747,'main':false,'letterLabel':{'vtr':{'x':-0.9484391652576771,'y':0.10605473776739593,'z':-0.29868970923419746},'orthogVtr':{'x':-0.31578739371507947,'y':-0.3971332069429623,'z':0.8617212646290189},'minZoom':0.5}},{'longitude':139.17375,'latitude':-57.61527777777778,'magnitude':4.34,'b_v':1.6,'constell':'','desigNo':'','bsNo':'3696','serialNo':748,'main':false,'letterLabel':{'vtr':{'x':-0.3023264504878597,'y':0.48528423233685525,'z':-0.8204254574186741},'orthogVtr':{'x':-0.8627518954665208,'y':0.22664582161089963,'z':0.4519854404903392},'minZoom':1.8}},{'longitude':121.995,'latitude':-68.66861111111112,'magnitude':4.35,'b_v':-0.11,'letter':'epsilon','constell':'Vol','desigNo':'','bsNo':'3223','serialNo':749,'main':false,'letterLabel':{'vtr':{'x':0.9040800048780249,'y':-0.29078847857749796,'z':0.31317951003591266},'orthogVtr':{'x':0.38143368620494106,'y':0.2185510406778782,'z':-0.8981891703014052},'minZoom':0.5}},{'longitude':289.2441666666667,'latitude':38.16583333333333,'magnitude':4.35,'b_v':1.26,'letter':'theta','constell':'Lyr','desigNo':'21','bsNo':'7314','main':false,'serialNo':750,'letterLabel':{'vtr':{'x':0.7873934148036791,'y':-0.5802432457267487,'z':0.20815711881242344},'orthogVtr':{'x':-0.5593391964447452,'y':-0.530535907526173,'z':0.6369233188900585},'minZoom':0.5}},{'longitude':186.95208333333332,'latitude':28.17138888888889,'magnitude':4.35,'b_v':1.13,'letter':'gamma','constell':'Com','desigNo':'15','bsNo':'4737','serialNo':751,'main':false,'letterLabel':{'vtr':{'x':0.4793998983632398,'y':0.8150066099873221,'z':0.32548419796710293},'orthogVtr':{'x':-0.06670265606174662,'y':-0.3359699215670816,'z':0.9395078325785886},'minZoom':0.5}},{'longitude':326.49625,'latitude':-32.94499999999999,'magnitude':4.35,'b_v':-0.05,'letter':'iota','constell':'PsA','desigNo':'9','bsNo':'8305','serialNo':752,'main':false,'letterLabel':{'vtr':{'x':-0.6136419799410661,'y':-0.7895843972964562,'z':0},'orthogVtr':{'x':-0.3657571695350742,'y':0.28425581161385804,'z':0.8862394295546989},'minZoom':0.5}},{'longitude':72.89166666666667,'latitude':8.928888888888888,'magnitude':4.35,'b_v':0.01,'letter':'pi^2','constell':'Ori','desigNo':'2','bsNo':'1544','serialNo':753,'main':false,'letterLabel':{'vtr':{'x':-0.33576261501979154,'y':0.9405504960321992,'z':0.051266273208173986},'orthogVtr':{'x':-0.8959948330313288,'y':-0.30211766793749173,'z':-0.3254507242289878},'minZoom':1.3}},{'longitude':104.69666666666667,'latitude':58.397777777777776,'magnitude':4.35,'b_v':0.85,'constell':'Lyn','desigNo':'15','bsNo':'2560','serialNo':754,'main':false,'letterLabel':{'vtr':{'x':-0.663707628814904,'y':-0.45631799966122555,'z':-0.5926770340059376},'orthogVtr':{'x':0.7360828408110416,'y':-0.25762323758539957,'z':-0.6259491344506865},'minZoom':0.5}},{'longitude':229.725,'latitude':-30.211944444444445,'magnitude':4.35,'b_v':1.1,'constell':'Lup','desigNo':'2','bsNo':'5686','serialNo':755,'main':false,'letterLabel':{'vtr':{'x':-0.10598951696483266,'y':0.8317251880626797,'z':0.5449765442986162},'orthogVtr':{'x':0.8226043501195253,'y':-0.23456952032774905,'z':0.5179760837120215},'minZoom':0.5}},{'longitude':98.84041666666667,'latitude':-52.99055555555556,'magnitude':4.35,'b_v':-0.02,'constell':'','desigNo':'','bsNo':'2435','serialNo':756,'main':false,'letterLabel':{'vtr':{'x':0.22307754286605797,'y':-0.5987939734407318,'z':0.7692088060077722},'orthogVtr':{'x':0.9704012118439912,'y':0.06152688931121747,'z':-0.2335292914034522},'minZoom':1.8}},{'longitude':132.33958333333334,'latitude':5.772222222222222,'magnitude':4.35,'b_v':-0.04,'letter':'rho','constell':'Hya','desigNo':'13','bsNo':'3492','serialNo':757,'main':false,'letterLabel':{'vtr':{'x':-0.34861908138683056,'y':-0.9173449261978565,'z':0.19220567752293802},'orthogVtr':{'x':0.655301162673948,'y':-0.38517939488895336,'z':-0.6497824404761581},'minZoom':1.4}},{'longitude':261.66333333333336,'latitude':86.57388888888889,'magnitude':4.35,'b_v':0.02,'letter':'delta','constell':'UMi','desigNo':'23','bsNo':'6789','main':true,'serialNo':758,'letterLabel':{'vtr':{'x':-0.8484265584951681,'y':-0.0386351571259228,'z':0.5279012213226071},'orthogVtr':{'x':-0.5292421911204015,'y':0.04559316208817797,'z':-0.8472449272252254},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.6394619113335436,'y':-0.03992957373327958,'z':0.7677851868166835},'orthogVtr':{'x':-0.7687739498549164,'y':-0.04446392849065635,'z':0.6379730190906571},'minZoom':0.5}},{'longitude':48.15833333333333,'latitude':19.791666666666668,'magnitude':4.35,'b_v':1.03,'letter':'delta','constell':'Ari','desigNo':'57','bsNo':'951','serialNo':759,'main':false,'letterLabel':{'vtr':{'x':0.6204193653464828,'y':-0.7614751242391947,'z':0.18771107124506714},'orthogVtr':{'x':0.4702230762926777,'y':0.552725021880982,'z':0.6880300202087978},'minZoom':0.5}},{'longitude':276.20916666666665,'latitude':-61.48361111111111,'magnitude':4.35,'b_v':1.46,'letter':'xi','constell':'Pav','desigNo':'','bsNo':'6855','serialNo':760,'main':false,'letterLabel':{'vtr':{'x':0.04786087785915963,'y':0.4768747034623754,'z':0.8776672795360565},'orthogVtr':{'x':0.9975184551473305,'y':0.022603929489538342,'z':-0.06667828741138326},'minZoom':0.5}},{'longitude':33.4825,'latitude':8.928055555555554,'magnitude':4.36,'b_v':0.88,'letter':'xi^1','constell':'Cet','desigNo':'65','bsNo':'649','serialNo':761,'main':false,'letterLabel':{'vtr':{'x':0.5362222377189674,'y':0.09745333890688423,'z':0.8384322026923605},'orthogVtr':{'x':-0.18323164184847818,'y':0.983065423825563,'z':0.002921969229392654},'minZoom':0.5}},{'longitude':73.43875,'latitude':-5.424722222222223,'magnitude':4.36,'b_v':0.26,'letter':'omega','constell':'Eri','desigNo':'61','bsNo':'1560','serialNo':762,'main':false,'letterLabel':{'vtr':{'x':-0.20084006330397675,'y':-0.978915230560838,'z':0.03725909752095666},'orthogVtr':{'x':0.9376254656771895,'y':-0.18107336026427528,'z':0.2967674583175142},'minZoom':0.5}},{'longitude':61.43333333333333,'latitude':22.128333333333334,'magnitude':4.36,'b_v':1.06,'constell':'Tau','desigNo':'37','bsNo':'1256','serialNo':763,'main':false,'letterLabel':{'vtr':{'x':-0.7401232132330311,'y':0.6657669725081934,'z':-0.09472047060106603},'orthogVtr':{'x':-0.505969008031805,'y':-0.6440999237710657,'z':-0.5736990945691114},'minZoom':0.5}},{'longitude':8.084583333333333,'latitude':-62.86194444444445,'magnitude':4.36,'b_v':-0.06,'letter':'beta^1','constell':'Tuc','desigNo':'','bsNo':'126','serialNo':764,'main':false,'letterLabel':{'vtr':{'x':0.7826981470904913,'y':0.4296562761746276,'z':-0.4503099986507782},'orthogVtr':{'x':-0.4282972470778707,'y':-0.15315224148990433,'z':-0.890564910083558},'minZoom':0.5}},{'longitude':294.4066666666667,'latitude':-1.2466666666666668,'magnitude':4.36,'b_v':-0.08,'letter':'iota','constell':'Aql','desigNo':'41','bsNo':'7447','serialNo':765,'main':false,'letterLabel':{'vtr':{'x':0.6514271554760404,'y':0.7056579351172909,'z':-0.2787284336310094},'orthogVtr':{'x':0.6363809053996343,'y':-0.7082185564418646,'z':-0.30568908968777897},'minZoom':0.5}},{'longitude':52.954166666666666,'latitude':48.05416666666667,'magnitude':4.36,'b_v':1.37,'letter':'sigma','constell':'Per','desigNo':'35','bsNo':'1052','serialNo':766,'main':false,'letterLabel':{'vtr':{'x':0.8050096990529201,'y':-0.5651933346782648,'z':-0.18032159844563822},'orthogVtr':{'x':0.4356543348895807,'y':0.35686432860897455,'z':0.8263492914369703},'minZoom':0.5}},{'longitude':211.78041666666667,'latitude':-41.26277777777778,'magnitude':4.36,'b_v':-0.2,'letter':'chi','constell':'Cen','desigNo':'','bsNo':'5285','serialNo':767,'main':false,'letterLabel':{'vtr':{'x':0.1870603935969925,'y':0.3659873655401453,'z':0.9116258319136873},'orthogVtr':{'x':0.7461204248283207,'y':-0.6565784275434705,'z':0.11049470638247794},'minZoom':0.5}},{'longitude':89.53958333333334,'latitude':-35.282222222222224,'magnitude':4.36,'b_v':-0.17,'letter':'gamma','constell':'Col','desigNo':'','bsNo':'2106','serialNo':768,'main':false,'letterLabel':{'vtr':{'x':-0.9343351485922338,'y':0.2873453290783655,'z':-0.2108328531372048},'orthogVtr':{'x':-0.35633523644989684,'y':-0.7640718942878896,'z':0.5377911672977828},'minZoom':0.5}},{'longitude':78.51,'latitude':-12.921666666666667,'magnitude':4.36,'b_v':-0.09,'letter':'kappa','constell':'Lep','desigNo':'4','bsNo':'1705','serialNo':769,'main':false,'letterLabel':{'vtr':{'x':0.42155891912435145,'y':-0.8601614827580449,'z':0.2870719444428355},'orthogVtr':{'x':0.8857724614886711,'y':0.45838509560905594,'z':0.07273410886082313},'minZoom':0.5}},{'longitude':11.03375,'latitude':-57.367222222222225,'magnitude':4.36,'b_v':0.02,'letter':'eta','constell':'Phe','desigNo':'','bsNo':'191','serialNo':770,'main':false,'letterLabel':{'vtr':{'x':-0.24656544570964903,'y':-0.2690641586672275,'z':0.9310262936688196},'orthogVtr':{'x':0.8118272919200716,'y':0.467330606670622,'z':0.35005507018552273},'minZoom':0.5}},{'longitude':122.36833333333334,'latitude':-3.035833333333333,'magnitude':4.36,'b_v':0.97,'letter':'zeta','constell':'Mon','desigNo':'29','bsNo':'3188','serialNo':771,'main':false,'letterLabel':{'vtr':{'x':-0.730050241713452,'y':0.5316787198817452,'z':0.4293534481042853},'orthogVtr':{'x':-0.4256995840437828,'y':-0.8452886633701653,'z':0.3229039171686057},'minZoom':0.5}},{'longitude':104.22958333333334,'latitude':-17.078055555555554,'magnitude':4.36,'b_v':-0.06,'letter':'iota','constell':'CMa','desigNo':'20','bsNo':'2596','serialNo':772,'main':false,'letterLabel':{'vtr':{'x':0.02254179394309541,'y':-0.9546557485362489,'z':0.29685732147366944},'orthogVtr':{'x':0.9717414108878222,'y':-0.04886560231509911,'z':-0.23093458657404997},'minZoom':0.5}},{'longitude':165.24041666666668,'latitude':-42.32,'magnitude':4.37,'b_v':0.12,'constell':'','desigNo':'','bsNo':'4293','serialNo':773,'main':false,'letterLabel':{'vtr':{'x':-0.3800605712518954,'y':0.1481670291010757,'z':0.9130172471903497},'orthogVtr':{'x':0.5867973036815213,'y':-0.7243984815170699,'z':0.3618228356086167},'minZoom':1.8}},{'longitude':300.21791666666667,'latitude':-35.2275,'magnitude':4.37,'b_v':-0.15,'letter':'theta^1','constell':'Sgr','desigNo':'','bsNo':'7623','serialNo':774,'main':false,'letterLabel':{'vtr':{'x':0.5441814635833276,'y':0.7765236371358197,'z':0.3176123040149194},'orthogVtr':{'x':0.7313312995619742,'y':-0.25354406622695635,'z':-0.6331429039025036},'minZoom':0.5}},{'longitude':109.85875,'latitude':-24.987222222222222,'magnitude':4.37,'b_v':-0.13,'letter':'tau','constell':'CMa','desigNo':'30','bsNo':'2782','serialNo':775,'main':false,'letterLabel':{'vtr':{'x':-0.7056948469226426,'y':0.7023670966117023,'z':-0.0931409932525725},'orthogVtr':{'x':-0.6381128755401237,'y':-0.5729267608741078,'z':0.5143606562949945},'minZoom':0.5}},{'longitude':94.29375,'latitude':-35.14722222222222,'magnitude':4.37,'b_v':0.98,'letter':'kappa','constell':'Col','desigNo':'','bsNo':'2256','serialNo':776,'main':false,'letterLabel':{'vtr':{'x':0.42454929067150826,'y':-0.7543494045016275,'z':0.500714365400434},'orthogVtr':{'x':0.9033327702867008,'y':0.3155158444947503,'z':-0.29058502714166035},'minZoom':0.5}},{'longitude':272.37666666666667,'latitude':20.81833333333333,'magnitude':4.37,'b_v':-0.16,'constell':'Her','desigNo':'102','bsNo':'6787','serialNo':777,'main':false,'letterLabel':{'vtr':{'x':-0.9859307839756525,'y':0.16568251699523592,'z':-0.022131262306487307},'orthogVtr':{'x':0.16259780700857646,'y':0.9199107734584958,'z':-0.35682786050278326},'minZoom':0.5}},{'longitude':0.7145833333333333,'latitude':-5.916944444444445,'magnitude':4.37,'b_v':1.63,'letter':'YY','constell':'Psc','desigNo':'30','bsNo':'9089','serialNo':778,'main':false,'letterLabel':{'vtr':{'x':-0.04327272811439825,'y':-0.5201458347308104,'z':0.8529805282734924},'orthogVtr':{'x':0.09438339252148709,'y':0.8478333813136846,'z':0.5217952977426489},'minZoom':0.5}},{'longitude':353.47625,'latitude':-37.72138888888889,'magnitude':4.38,'b_v':-0.1,'letter':'beta','constell':'Scl','desigNo':'','bsNo':'8937','serialNo':779,'main':false,'letterLabel':{'vtr':{'x':0.596703043004293,'y':0.7884128045222075,'z':0.14950159910463803},'orthogVtr':{'x':0.1623222627125952,'y':0.06386424301541704,'z':-0.9846688994235223},'minZoom':0.5}},{'longitude':302.06708333333336,'latitude':77.76333333333334,'magnitude':4.38,'b_v':-0.05,'letter':'kappa','constell':'Cep','desigNo':'1','bsNo':'7750','main':false,'serialNo':780,'letterLabel':{'vtr':{'x':-0.8647426861091523,'y':0.18535368279001996,'z':-0.4667591446312595},'orthogVtr':{'x':0.48944640647016496,'y':0.10279553793827079,'z':-0.8659534009249135},'minZoom':0.5}},{'longitude':351.74083333333334,'latitude':-20.545833333333334,'magnitude':4.38,'b_v':1.46,'constell':'Aqr','desigNo':'99','bsNo':'8906','serialNo':781,'main':false,'letterLabel':{'vtr':{'x':-0.08601057774826144,'y':-0.5464098991288313,'z':-0.8330896726340034},'orthogVtr':{'x':-0.36587782416396436,'y':-0.7604378475433552,'z':0.5365330351513059},'minZoom':0.5}},{'longitude':197.71458333333334,'latitude':-5.631944444444445,'magnitude':4.38,'b_v':-0.01,'letter':'theta','constell':'Vir','desigNo':'51','bsNo':'4963','serialNo':782,'main':false,'letterLabel':{'vtr':{'x':-0.1029720953880683,'y':0.9946842451609408,'z':0},'orthogVtr':{'x':0.3011970960489531,'y':0.031180644768273907,'z':0.9530519800742836},'minZoom':0.5}},{'longitude':28.58625,'latitude':-46.2175,'magnitude':4.39,'b_v':1.6,'letter':'psi','constell':'Phe','desigNo':'','bsNo':'555','serialNo':783,'main':false,'letterLabel':{'vtr':{'x':-0.7908295530433107,'y':-0.51118220048297,'z':-0.3365729875416421},'orthogVtr':{'x':-0.07375804395004912,'y':-0.46631509761910017,'z':0.8815384170217156},'minZoom':0.5}},{'longitude':57.78541666666667,'latitude':65.57805555555555,'magnitude':4.39,'b_v':1.87,'letter':'BE','constell':'Cam','desigNo':'','bsNo':'1155','serialNo':784,'main':false,'letterLabel':{'vtr':{'x':-0.6806308967093404,'y':0.4004518768627115,'z':0.6134980658174656},'orthogVtr':{'x':-0.6986856960457462,'y':-0.10286806052641234,'z':-0.7079946753080888},'minZoom':0.5}},{'longitude':83.94541666666667,'latitude':9.5,'magnitude':4.39,'b_v':-0.16,'letter':'phi^1','constell':'Ori','desigNo':'37','bsNo':'1876','serialNo':785,'main':false,'letterLabel':{'vtr':{'x':0.851176993736934,'y':-0.5248751290840846,'z':0.001955556678020941},'orthogVtr':{'x':0.5144663510388687,'y':0.8350241832837081,'z':0.1950871266386574},'minZoom':0.5}},{'longitude':96.17375,'latitude':4.5825,'magnitude':4.39,'b_v':0.22,'constell':'Mon','desigNo':'8','bsNo':'2298','serialNo':786,'main':false,'letterLabel':{'vtr':{'x':0.6277124042558901,'y':-0.7675510006225668,'z':-0.12977903908793084},'orthogVtr':{'x':0.7710287139174585,'y':0.6359892568413551,'z':-0.03213078737240945},'minZoom':0.5}},{'longitude':152.20791666666668,'latitude':9.911111111111111,'magnitude':4.39,'b_v':1.45,'constell':'Leo','desigNo':'31','bsNo':'3980','serialNo':787,'main':false,'letterLabel':{'vtr':{'x':-0.42836373297005614,'y':-0.7232199730118285,'z':0.5417170690616352},'orthogVtr':{'x':0.23893876090894312,'y':-0.6688254853252269,'z':-0.703974956028106},'minZoom':0.5}},{'longitude':253.70916666666668,'latitude':10.137777777777778,'magnitude':4.39,'b_v':-0.09,'letter':'iota','constell':'Oph','desigNo':'25','bsNo':'6281','serialNo':788,'main':false,'letterLabel':{'vtr':{'x':-0.7409188380892817,'y':0.5872095436162339,'z':-0.3259205842693019},'orthogVtr':{'x':0.6122005516610218,'y':0.7900654302889298,'z':0.03173484533299095},'minZoom':0.5}},{'longitude':88.855,'latitude':20.27777777777778,'magnitude':4.39,'b_v':0.59,'letter':'chi^1','constell':'Ori','desigNo':'54','bsNo':'2047','serialNo':789,'main':false,'letterLabel':{'vtr':{'x':0.8083419316405989,'y':0.5467775931742652,'z':0.21821453928210893},'orthogVtr':{'x':-0.5884147987189315,'y':0.7621825282856018,'z':0.26989964472878947},'minZoom':0.5}},{'longitude':120.79375,'latitude':2.2852777777777775,'magnitude':4.39,'b_v':1.25,'constell':'','desigNo':'','bsNo':'3145','serialNo':790,'main':false,'letterLabel':{'vtr':{'x':-0.7543971327542675,'y':0.4573706007511894,'z':0.47084721477421565},'orthogVtr':{'x':-0.41135112861467305,'y':-0.8883817390054651,'z':0.20388264955375845},'minZoom':1.8}},{'longitude':295.45875,'latitude':17.5175,'magnitude':4.39,'b_v':1.04,'letter':'beta','constell':'Sge','desigNo':'6','bsNo':'7488','serialNo':791,'main':false,'letterLabel':{'vtr':{'x':0.28910094298464556,'y':-0.9381865099496507,'z':0.1903331744964137},'orthogVtr':{'x':-0.8650901708500497,'y':-0.17090005656153126,'z':0.4716059445828657},'minZoom':0.5}},{'longitude':225.94666666666666,'latitude':2.0236111111111112,'magnitude':4.39,'b_v':1.03,'constell':'Vir','desigNo':'110','bsNo':'5601','serialNo':792,'main':false,'letterLabel':{'vtr':{'x':0.3818095094444708,'y':-0.8282665914343038,'z':0.4101169979549402},'orthogVtr':{'x':-0.6093798398001391,'y':-0.55922049603197,'z':-0.562075304263507},'minZoom':0.5}},{'longitude':260.51416666666665,'latitude':-21.130277777777778,'magnitude':4.39,'b_v':0.39,'letter':'xi','constell':'Oph','desigNo':'40','bsNo':'6445','serialNo':793,'main':false,'letterLabel':{'vtr':{'x':-0.30569384114605325,'y':0.9027486004315486,'z':0.30264870709165725},'orthogVtr':{'x':0.9396385258575365,'y':0.23471703620039625,'z':0.2489725961658788},'minZoom':0.5}},{'longitude':295.21958333333333,'latitude':18.05527777777778,'magnitude':4.39,'b_v':0.78,'letter':'alpha','constell':'Sge','desigNo':'5','bsNo':'7479','serialNo':794,'main':false,'letterLabel':{'vtr':{'x':-0.6306300024991802,'y':0.7758877122361554,'z':0.017437257491618056},'orthogVtr':{'x':0.661962290996555,'y':0.5494896900834091,'z':-0.5097715231264213},'minZoom':1.4}},{'longitude':320.2758333333333,'latitude':-53.375,'magnitude':4.39,'b_v':0.19,'letter':'theta','constell':'Ind','desigNo':'','bsNo':'8140','serialNo':795,'main':false,'letterLabel':{'vtr':{'x':-0.8681314219951662,'y':-0.49633439750298414,'z':0},'orthogVtr':{'x':-0.1892357043098603,'y':0.3309894738330887,'z':0.9244651515476646},'minZoom':0.5}},{'longitude':117.20333333333333,'latitude':-25.981666666666666,'magnitude':4.4,'b_v':-0.07,'letter':'omicron','constell':'Pup','desigNo':'','bsNo':'3034','serialNo':796,'main':false,'letterLabel':{'vtr':{'x':0.42334575076264247,'y':-0.8683876263538071,'z':0.25822723657045876},'orthogVtr':{'x':0.8074035692299585,'y':0.23234833837735075,'z':-0.542322529541239},'minZoom':1.3}},{'longitude':329.77416666666664,'latitude':-54.90861111111111,'magnitude':4.4,'b_v':0.3,'letter':'delta','constell':'Ind','desigNo':'','bsNo':'8368','serialNo':797,'main':false,'letterLabel':{'vtr':{'x':0.45483716213330655,'y':0.5294072064278124,'z':0.7161362759453119},'orthogVtr':{'x':0.7391796787341924,'y':0.22409294998660348,'z':-0.63513443640911},'minZoom':0.5}},{'longitude':284.68625,'latitude':-67.20916666666668,'magnitude':4.4,'b_v':0.53,'letter':'kappa','constell':'Pav','desigNo':'','bsNo':'7107','serialNo':798,'main':false,'letterLabel':{'vtr':{'x':0.4676990557393913,'y':0.37511633762172053,'z':0.8003407564967246},'orthogVtr':{'x':0.878414947152045,'y':-0.09665285034850116,'z':-0.4680228703165909},'minZoom':0.5}},{'longitude':14.53625,'latitude':23.511666666666667,'magnitude':4.4,'b_v':0.94,'letter':'eta','constell':'And','desigNo':'38','bsNo':'271','serialNo':799,'main':false,'letterLabel':{'vtr':{'x':-0.2081854699903253,'y':-0.09821963397124482,'z':-0.9731452684915353},'orthogVtr':{'x':0.4108282007628183,'y':-0.9117034253216971,'z':0.004129614348913749},'minZoom':0.5}},{'longitude':122.45208333333333,'latitude':-19.297222222222224,'magnitude':4.4,'b_v':-0.16,'constell':'Pup','desigNo':'16','bsNo':'3192','serialNo':800,'main':false,'letterLabel':{'vtr':{'x':-0.7242100552783529,'y':-0.33829855378844664,'z':0.6008942372317866},'orthogVtr':{'x':0.46800814880728075,'y':-0.8811041762546998,'z':0.06799855319423487},'minZoom':0.5}},{'longitude':349.94125,'latitude':-32.436388888888885,'magnitude':4.41,'b_v':1.11,'letter':'gamma','constell':'Scl','desigNo':'','bsNo':'8863','serialNo':801,'main':false,'letterLabel':{'vtr':{'x':0.536766764514688,'y':0.8427600078642953,'z':0.04045997598870328},'orthogVtr':{'x':0.14593169695924638,'y':-0.04550145404149203,'z':-0.9882477207171816},'minZoom':0.5}},{'longitude':216.03041666666667,'latitude':-39.590833333333336,'magnitude':4.41,'b_v':-0.19,'letter':'v761','constell':'Cen','desigNo':'','bsNo':'5378','serialNo':802,'main':false,'letterLabel':{'vtr':{'x':0.7715003921788124,'y':-0.5959208548020015,'z':0.22285753224872273},'orthogVtr':{'x':-0.12809600896064963,'y':-0.48859609288683137,'z':-0.8630557748512409},'minZoom':2.2}},{'longitude':349.7029166666667,'latitude':-9.086666666666668,'magnitude':4.41,'b_v':-0.14,'letter':'psi^2','constell':'Aqr','desigNo':'93','bsNo':'8858','serialNo':803,'main':false,'letterLabel':{'vtr':{'x':0.22987186020662154,'y':0.8082759386831782,'z':-0.5420783475024388},'orthogVtr':{'x':0.05705839112907138,'y':-0.5672289351721281,'z':-0.8215812042064108},'minZoom':0.5}},{'longitude':347.1145833333333,'latitude':75.48222222222222,'magnitude':4.41,'b_v':0.8,'letter':'pi','constell':'Cep','desigNo':'33','bsNo':'8819','main':false,'serialNo':804,'letterLabel':{'vtr':{'x':0.73897973470339,'y':-0.14859193285001354,'z':-0.6571372681484475},'orthogVtr':{'x':0.6278481928428838,'y':-0.20189377209624593,'z':0.7516951187367616},'minZoom':0.5}},{'longitude':102.55875,'latitude':-53.64333333333333,'magnitude':4.41,'b_v':0.9,'letter':'v415','constell':'Car','desigNo':'','bsNo':'2554','serialNo':805,'main':false,'letterLabel':{'vtr':{'x':-0.5404294038586529,'y':-0.4321819565988103,'z':0.7219105317388056},'orthogVtr':{'x':0.8314569182912241,'y':-0.40576152459298376,'z':0.37952203913032256},'minZoom':1.3}},{'longitude':262.8616666666667,'latitude':26.09861111111111,'magnitude':4.41,'b_v':1.43,'letter':'lambda','constell':'Her','desigNo':'76','bsNo':'6526','serialNo':806,'main':false,'letterLabel':{'vtr':{'x':-0.6166201087851522,'y':0.6725307080015837,'z':-0.40924575530685214},'orthogVtr':{'x':0.7793113543403283,'y':0.5951261439049949,'z':-0.19621081987753608},'minZoom':0.5}},{'longitude':269.79333333333335,'latitude':30.18888888888889,'magnitude':4.41,'b_v':0.38,'letter':'nu','constell':'Her','desigNo':'94','bsNo':'6707','serialNo':807,'main':false,'letterLabel':{'vtr':{'x':0.06973870449117063,'y':0.8623757383286464,'z':-0.5014425181793174},'orthogVtr':{'x':0.9975604204472839,'y':-0.05871641907751444,'z':0.03775698197356459},'minZoom':0.5}},{'longitude':319.65958333333333,'latitude':34.971111111111114,'magnitude':4.41,'b_v':-0.1,'letter':'upsilon','constell':'Cyg','desigNo':'66','bsNo':'8146','main':false,'serialNo':808,'letterLabel':{'vtr':{'x':0.12834847677940686,'y':-0.7453303937358566,'z':0.6542241761674351},'orthogVtr':{'x':-0.7703354922325314,'y':0.340538379156492,'z':0.5390888996523053},'minZoom':0.5}},{'longitude':108.06291666666667,'latitude':30.215,'magnitude':4.41,'b_v':1.26,'letter':'tau','constell':'Gem','desigNo':'46','bsNo':'2697','serialNo':809,'main':false,'letterLabel':{'vtr':{'x':0.963258148451663,'y':0.1235282402782758,'z':-0.2384837799415852},'orthogVtr':{'x':0.018530789152043176,'y':0.8552684023520273,'z':0.5178538112166533},'minZoom':0.5}},{'longitude':108.51833333333333,'latitude':-44.66888888888889,'magnitude':4.42,'b_v':1.33,'letter':'L$_{2}','constell':'Pup','desigNo':'','bsNo':'2748','serialNo':810,'main':false,'letterLabel':{'vtr':{'x':-0.8074887109711392,'y':0.5223476912453238,'z':-0.2740709234939891},'orthogVtr':{'x':-0.5449234752469854,'y':-0.48263002379137854,'z':0.685657834681324},'minZoom':0.5}},{'longitude':92.14291666666666,'latitude':14.765,'magnitude':4.42,'b_v':-0.16,'letter':'nu','constell':'Ori','desigNo':'67','bsNo':'2159','serialNo':811,'main':false,'letterLabel':{'vtr':{'x':0.873216310746125,'y':0.47828514878342504,'z':0.09346973360475597},'orthogVtr':{'x':-0.4859896181055609,'y':0.8404119160204995,'z':0.23983724169603932},'minZoom':0.5}},{'longitude':123.6675,'latitude':-40.40222222222222,'magnitude':4.42,'b_v':1.17,'constell':'','desigNo':'','bsNo':'3243','serialNo':812,'main':false,'letterLabel':{'vtr':{'x':-0.34456277695915466,'y':-0.5319395225040663,'z':0.7735094292459156},'orthogVtr':{'x':0.8384842392114409,'y':-0.5449244459833683,'z':-0.0012364318544119124},'minZoom':2}},{'longitude':351.56375,'latitude':23.500555555555554,'magnitude':4.42,'b_v':0.62,'letter':'upsilon','constell':'Peg','desigNo':'68','bsNo':'8905','serialNo':813,'main':false,'letterLabel':{'vtr':{'x':0.25796769372326656,'y':-0.27428331806391715,'z':-0.926402358819831},'orthogVtr':{'x':0.3325081552109742,'y':-0.875077567986617,'z':0.3516782289605405},'minZoom':0.5}},{'longitude':108.74166666666666,'latitude':-26.38361111111111,'magnitude':4.42,'b_v':-0.17,'letter':'EW','constell':'CMa','desigNo':'27','bsNo':'2745','serialNo':814,'main':false,'letterLabel':{'vtr':{'x':-0.02338061971665245,'y':0.8888234678624014,'z':-0.4576529138973335},'orthogVtr':{'x':-0.95739468961281,'y':0.1118936566707583,'z':0.2662239994779543},'minZoom':1.8}},{'longitude':270.66041666666666,'latitude':1.3058333333333334,'magnitude':4.42,'b_v':0.05,'constell':'Oph','desigNo':'68','bsNo':'6723','serialNo':815,'main':false,'letterLabel':{'vtr':{'x':-0.19306603183203813,'y':-0.9808776842061869,'z':0.024586093202017975},'orthogVtr':{'x':-0.9811180985448485,'y':0.1932863800723915,'z':0.0069030418115330686},'minZoom':0.5}},{'longitude':222.83,'latitude':-28.03222222222222,'magnitude':4.42,'b_v':1.37,'constell':'Hya','desigNo':'58','bsNo':'5526','serialNo':816,'main':false,'letterLabel':{'vtr':{'x':0.5028559242339242,'y':-0.8549691377590445,'z':-0.12713651301810097},'orthogVtr':{'x':-0.5727919487319733,'y':-0.21944888037005938,'z':-0.7897794453973563},'minZoom':0.5}},{'longitude':336.0629166666667,'latitude':52.31722222222223,'magnitude':4.42,'b_v':1.02,'letter':'beta','constell':'Lac','desigNo':'3','bsNo':'8538','serialNo':817,'main':false,'letterLabel':{'vtr':{'x':-0.8293233826643983,'y':0.5302736868156656,'z':0.17616056322855497},'orthogVtr':{'x':-0.00789610032987878,'y':0.3041122858116662,'z':-0.9526034690352457},'minZoom':0.5}},{'longitude':165.81541666666666,'latitude':20.085555555555555,'magnitude':4.42,'b_v':0.05,'constell':'Leo','desigNo':'60','bsNo':'4300','serialNo':818,'main':false,'letterLabel':{'vtr':{'x':-0.11795826563704137,'y':-0.7493825292735767,'z':-0.6515456026921203},'orthogVtr':{'x':0.396220852466329,'y':0.5661152819694093,'z':-0.7228571944662042},'minZoom':0.5}},{'longitude':99.665,'latitude':-18.253611111111113,'magnitude':4.42,'b_v':1.14,'letter':'nu^3','constell':'CMa','desigNo':'8','bsNo':'2443','serialNo':819,'main':false,'letterLabel':{'vtr':{'x':0.06955418578164052,'y':0.9424102809744184,'z':-0.3271468745899478},'orthogVtr':{'x':-0.9847544929676143,'y':0.11727659723949879,'z':0.1284709629450225},'minZoom':1.3}},{'longitude':236.82333333333332,'latitude':7.299166666666666,'magnitude':4.42,'b_v':0.6,'letter':'lambda','constell':'Ser','desigNo':'27','bsNo':'5868','serialNo':820,'main':false,'letterLabel':{'vtr':{'x':0.4633077224037493,'y':0.869777205302117,'z':0.16980449787296373},'orthogVtr':{'x':0.7005192872724728,'y':-0.47680799529089163,'z':0.5309678556993331},'minZoom':0.5}},{'longitude':74.67375,'latitude':53.778055555555554,'magnitude':4.43,'b_v':-0.02,'constell':'Cam','desigNo':'7','bsNo':'1568','serialNo':821,'main':false,'letterLabel':{'vtr':{'x':-0.17451630501495158,'y':-0.545364144522943,'z':-0.81983047586235},'orthogVtr':{'x':0.9721879961906608,'y':-0.22750411757859795,'z':-0.0556091408634575},'minZoom':0.5}},{'longitude':64.01958333333333,'latitude':-7.626666666666667,'magnitude':4.43,'b_v':0.82,'letter':'omicron^2','constell':'Eri','desigNo':'40','bsNo':'1325','serialNo':822,'main':false,'letterLabel':{'vtr':{'x':-0.6431143548336439,'y':-0.7382550985357885,'z':-0.20342894605443798},'orthogVtr':{'x':0.6307805117929961,'y':-0.661336086506763,'z':0.4058947235750739},'minZoom':0.5}},{'longitude':312.165,'latitude':-4.962777777777778,'magnitude':4.43,'b_v':1.64,'letter':'EN','constell':'Aqr','desigNo':'3','bsNo':'7951','serialNo':823,'main':false,'letterLabel':{'vtr':{'x':0.6054884104505925,'y':0.6397447799969136,'z':-0.473403000916466},'orthogVtr':{'x':0.43145720622558337,'y':-0.7637034030982053,'z':-0.4802101532581696},'minZoom':0.5}},{'longitude':300.93291666666664,'latitude':-27.66,'magnitude':4.43,'b_v':1.64,'letter':'v3872','constell':'Sgr','desigNo':'62','bsNo':'7650','serialNo':824,'main':false,'letterLabel':{'vtr':{'x':0.8167774239580619,'y':-0.12186993700906884,'z':-0.5639347109070678},'orthogVtr':{'x':-0.3543816343991613,'y':-0.8772935492901337,'z':-0.3236814569518918},'minZoom':0.5}},{'longitude':56.7425,'latitude':-12.047777777777778,'magnitude':4.43,'b_v':1.6,'letter':'pi','constell':'Eri','desigNo':'26','bsNo':'1162','serialNo':825,'main':false,'letterLabel':{'vtr':{'x':0.08863469151809433,'y':-0.9496516148979985,'z':0.300509071046309},'orthogVtr':{'x':0.8393455657914044,'y':0.2336551619383916,'z':0.4908200143493042},'minZoom':0.5}},{'longitude':288.5883333333333,'latitude':39.176944444444445,'magnitude':4.43,'b_v':-0.15,'letter':'eta','constell':'Lyr','desigNo':'20','bsNo':'7298','main':false,'serialNo':826,'letterLabel':{'vtr':{'x':-0.5188732985393558,'y':0.7266641981049781,'z':-0.45025508687336085},'orthogVtr':{'x':0.8183571999974639,'y':0.2699856434971407,'z':-0.5073452922002388},'minZoom':0.5}},{'longitude':306.14,'latitude':32.2475,'magnitude':4.43,'b_v':1.33,'constell':'Cyg','desigNo':'39','bsNo':'7806','main':false,'serialNo':827,'letterLabel':{'vtr':{'x':-0.8596348217413052,'y':0.4051321832767947,'z':0.3112810423446505},'orthogVtr':{'x':0.11061685085184003,'y':0.7424034242716846,'z':-0.6607579495831277},'minZoom':0.5}},{'longitude':311.06916666666666,'latitude':15.138333333333334,'magnitude':4.43,'b_v':0.3,'letter':'delta','constell':'Del','desigNo':'11','bsNo':'7928','serialNo':828,'main':false,'letterLabel':{'vtr':{'x':0.5579523067575625,'y':-0.8061724552306444,'z':-0.19691418387538587},'orthogVtr':{'x':-0.5352715856604231,'y':-0.5309297926521864,'z':0.6569610984364921},'minZoom':0.5}},{'longitude':113.70041666666667,'latitude':-22.334722222222222,'magnitude':4.44,'b_v':0.52,'constell':'','desigNo':'','bsNo':'2906','serialNo':829,'main':false,'letterLabel':{'vtr':{'x':0.016880131315450853,'y':0.9094532816515155,'z':-0.41546334334097706},'orthogVtr':{'x':-0.92815951307647,'y':0.1687660313532938,'z':0.3317196782630016},'minZoom':1.8}},{'longitude':3.882083333333333,'latitude':-18.83611111111111,'magnitude':4.44,'b_v':1.64,'letter':'AE','constell':'Cet','desigNo':'7','bsNo':'48','serialNo':830,'main':false,'letterLabel':{'vtr':{'x':-0.1834922974883734,'y':-0.3547056455123661,'z':-0.9167957688624516},'orthogVtr':{'x':-0.2732700992791831,'y':-0.877464451339297,'z':0.3941821780291089},'minZoom':0.5}},{'longitude':12.397916666666667,'latitude':7.680000000000001,'magnitude':4.44,'b_v':1.5,'letter':'delta','constell':'Psc','desigNo':'63','bsNo':'224','serialNo':831,'main':false,'letterLabel':{'vtr':{'x':0.22556626272443675,'y':-0.08910896019232593,'z':0.9701440379314676},'orthogVtr':{'x':-0.11069023604983431,'y':0.9870156404145022,'z':0.11639500513502371},'minZoom':0.5}},{'longitude':95.29166666666667,'latitude':59.0025,'magnitude':4.44,'b_v':0.03,'letter':'UZ','constell':'Lyn','desigNo':'2','bsNo':'2238','serialNo':832,'main':false,'letterLabel':{'vtr':{'x':0.09836389037001236,'y':0.5149036864827482,'z':0.8515860136931278},'orthogVtr':{'x':-0.9940164202088589,'y':0.009994362953288705,'z':0.10877255657712183},'minZoom':0.5}},{'longitude':292.35833333333335,'latitude':24.70138888888889,'magnitude':4.44,'b_v':1.5,'letter':'alpha','constell':'Vul','desigNo':'6','bsNo':'7405','serialNo':833,'main':false,'letterLabel':{'vtr':{'x':-0.4203510187746728,'y':-0.7315702256322142,'z':0.5367588154688528},'orthogVtr':{'x':-0.838970820710152,'y':0.5386777403634652,'z':0.07716381298151057},'minZoom':0.5}},{'longitude':70.28166666666667,'latitude':-41.83111111111111,'magnitude':4.44,'b_v':0.34,'letter':'alpha','constell':'Cae','desigNo':'','bsNo':'1502','serialNo':834,'main':false,'letterLabel':{'vtr':{'x':-0.2602995453527259,'y':0.6514095634710272,'z':-0.712677856613807},'orthogVtr':{'x':-0.9322246355348918,'y':-0.3617463290832966,'z':0.009839832142766014},'minZoom':0.5}},{'longitude':122.99583333333334,'latitude':-39.671388888888885,'magnitude':4.44,'b_v':1.59,'letter':'NS','constell':'Pup','desigNo':'','bsNo':'3225','serialNo':835,'main':false,'letterLabel':{'vtr':{'x':-0.3833273410388535,'y':0.7690091227643827,'z':-0.5115516774649822},'orthogVtr':{'x':-0.8230159090344967,'y':-0.03303687606524833,'z':0.5670567681422829},'minZoom':0.7}},{'longitude':124.8025,'latitude':-36.71416666666667,'magnitude':4.44,'b_v':0.22,'constell':'','desigNo':'','bsNo':'3270','serialNo':836,'main':false,'letterLabel':{'vtr':{'x':-0.8822885054351869,'y':0.39729991889519606,'z':0.2524277473314187},'orthogVtr':{'x':-0.11060994826012038,'y':-0.6962470758760795,'z':0.709228770341349},'minZoom':1.8}},{'longitude':218.45166666666665,'latitude':-50.53361111111111,'magnitude':4.44,'b_v':-0.18,'letter':'sigma','constell':'Lup','desigNo':'','bsNo':'5425','serialNo':837,'main':false,'letterLabel':{'vtr':{'x':-0.09057716029106899,'y':-0.4069762903956079,'z':-0.908936783879625},'orthogVtr':{'x':-0.8625610499664842,'y':0.4882520051711251,'z':-0.1326590160037835},'minZoom':0.5}},{'longitude':64.19708333333334,'latitude':-59.260555555555555,'magnitude':4.44,'b_v':1.08,'letter':'epsilon','constell':'Ret','desigNo':'','bsNo':'1355','serialNo':838,'main':false,'letterLabel':{'vtr':{'x':0.1732416560252929,'y':0.49934503040837747,'z':-0.8489062782333928},'orthogVtr':{'x':-0.959420491832388,'y':-0.10914794044184707,'z':-0.2599981672039279},'minZoom':0.5}},{'longitude':248.29416666666665,'latitude':-21.5025,'magnitude':4.45,'b_v':0.13,'letter':'omega','constell':'Oph','desigNo':'9','bsNo':'6153','serialNo':839,'main':false,'letterLabel':{'vtr':{'x':0.753324888577468,'y':-0.6573081371557051,'z':0.021157151950156456},'orthogVtr':{'x':-0.5604427987871162,'y':-0.6584778693729462,'z':-0.5023054497352473},'minZoom':0.5}},{'longitude':135.18625,'latitude':-41.32222222222222,'magnitude':4.45,'b_v':0.65,'constell':'','desigNo':'','bsNo':'3591','serialNo':840,'main':false,'letterLabel':{'vtr':{'x':-0.6226622868417158,'y':0.7294386970356115,'z':-0.28321522524757425},'orthogVtr':{'x':-0.5731070461935486,'y':-0.17869623841168494,'z':0.799759943971202},'minZoom':1.8}},{'longitude':25.58625,'latitude':5.575555555555555,'magnitude':4.45,'b_v':1.35,'letter':'nu','constell':'Psc','desigNo':'106','bsNo':'489','serialNo':841,'main':false,'letterLabel':{'vtr':{'x':0.43698701747177504,'y':-0.32210844664852073,'z':0.839814559982619},'orthogVtr':{'x':0.056855674246228186,'y':0.9417039954703093,'z':0.3316037050777072},'minZoom':0.5}},{'longitude':159.06625,'latitude':-57.64861111111111,'magnitude':4.45,'b_v':1.6,'constell':'','desigNo':'','bsNo':'4159','serialNo':842,'main':false,'letterLabel':{'vtr':{'x':-0.3104291108772295,'y':0.38077821269403755,'z':-0.8710004132361288},'orthogVtr':{'x':-0.8086061228486187,'y':0.37596666989840494,'z':0.45255408651036233},'minZoom':1.8}},{'longitude':78.27875,'latitude':-11.849444444444446,'magnitude':4.45,'b_v':-0.1,'letter':'iota','constell':'Lep','desigNo':'3','bsNo':'1696','serialNo':843,'main':false,'letterLabel':{'vtr':{'x':0.41960377784841785,'y':0.9014837507701194,'z':-0.10611181231499535},'orthogVtr':{'x':-0.885665121343061,'y':0.3810016287061688,'z':-0.26539602815345203},'minZoom':0.5}},{'longitude':293.73583333333335,'latitude':7.417222222222223,'magnitude':4.45,'b_v':1.18,'letter':'mu','constell':'Aql','desigNo':'38','bsNo':'7429','serialNo':844,'main':false,'letterLabel':{'vtr':{'x':-0.7323236691288774,'y':-0.5508374356650306,'z':0.40035005071011515},'orthogVtr':{'x':-0.5517060245100424,'y':0.8245683376121343,'z':0.12532964185253948},'minZoom':0.5}},{'longitude':129.91791666666666,'latitude':3.278888888888889,'magnitude':4.45,'b_v':1.22,'letter':'sigma','constell':'Hya','desigNo':'5','bsNo':'3418','serialNo':845,'main':false,'letterLabel':{'vtr':{'x':0.6999812964259013,'y':-0.3663858724718308,'z':-0.6130151524285266},'orthogVtr':{'x':0.31560707406067656,'y':0.9287033918027112,'z':-0.19468483468672795},'minZoom':0.5}},{'longitude':161.48208333333332,'latitude':-80.6325,'magnitude':4.45,'b_v':-0.19,'letter':'delta^2','constell':'Cha','desigNo':'','bsNo':'4234','serialNo':846,'main':false,'letterLabel':{'vtr':{'x':0.9264906488816406,'y':-0.16270475045499522,'z':0.3393261583112252},'orthogVtr':{'x':0.3432121097881365,'y':-0.004476531032186926,'z':-0.939247256245497},'minZoom':0.5}},{'longitude':169.38791666666665,'latitude':-3.7475,'magnitude':4.45,'b_v':0.21,'letter':'phi','constell':'Leo','desigNo':'74','bsNo':'4368','serialNo':847,'main':false,'letterLabel':{'vtr':{'x':-0.06022522686534282,'y':0.997626209122889,'z':-0.033389652889960535},'orthogVtr':{'x':-0.18551098385145923,'y':0.02168111966566195,'z':0.9824029743035734},'minZoom':0.5}},{'longitude':288.80125,'latitude':73.3875,'magnitude':4.45,'b_v':1.26,'letter':'tau','constell':'Dra','desigNo':'60','bsNo':'7352','main':true,'serialNo':848,'letterLabel':{'vtr':{'x':0.6607964067373956,'y':0.14448009360943165,'z':-0.7365280791616544},'orthogVtr':{'x':0.7448880281381505,'y':-0.246703963098035,'z':0.6199023956464286},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.05762000412655077,'y':0.2662122654787681,'z':-0.9621907112590093},'orthogVtr':{'x':0.9940774621452053,'y':-0.10425148711806778,'z':0.030685936332780155},'minZoom':0.5}},{'longitude':42.45583333333333,'latitude':-32.33305555555556,'magnitude':4.45,'b_v':0.98,'letter':'beta','constell':'For','desigNo':'','bsNo':'841','serialNo':849,'main':false,'letterLabel':{'vtr':{'x':-0.6511372340338837,'y':-0.7589600137390001,'z':0},'orthogVtr':{'x':0.4328818488553301,'y':-0.37138384713909905,'z':0.8213935372376349},'minZoom':0.5}},{'longitude':93.23375,'latitude':14.203333333333333,'magnitude':4.45,'b_v':-0.18,'letter':'xi','constell':'Ori','desigNo':'70','bsNo':'2199','serialNo':850,'main':false,'letterLabel':{'vtr':{'x':-0.9964156190146467,'y':0.0492452394516423,'z':0.06878096084679566},'orthogVtr':{'x':-0.06454020669571495,'y':-0.9681794870542311,'z':-0.24179132028896355},'minZoom':0.5}},{'longitude':137.52416666666667,'latitude':51.532777777777774,'magnitude':4.46,'b_v':0.29,'constell':'UMa','desigNo':'15','bsNo':'3619','serialNo':851,'main':false,'letterLabel':{'vtr':{'x':0.8844062966995598,'y':0.4479334622841936,'z':-0.13107675508748676},'orthogVtr':{'x':-0.08553445651304036,'y':0.43165118112904216,'z':0.897976121385709},'minZoom':0.5}},{'longitude':343.37333333333333,'latitude':-32.782222222222224,'magnitude':4.46,'b_v':-0.04,'letter':'gamma','constell':'PsA','desigNo':'22','bsNo':'8695','serialNo':852,'main':false,'letterLabel':{'vtr':{'x':-0.44033857760163386,'y':-0.2754892282279136,'z':0.8545218675997464},'orthogVtr':{'x':0.3964060856578154,'y':0.7943175862763695,'z':0.46034963602193824},'minZoom':0.5}},{'longitude':168.13041666666666,'latitude':-22.921666666666667,'magnitude':4.46,'b_v':0.03,'letter':'beta','constell':'Crt','desigNo':'11','bsNo':'4343','serialNo':853,'main':false,'letterLabel':{'vtr':{'x':-0.4253375267071372,'y':0.8784681446499494,'z':0.21767339573299047},'orthogVtr':{'x':-0.08164229151940323,'y':-0.2767762047177641,'z':0.9574599045064451},'minZoom':0.5}},{'longitude':182.25,'latitude':-50.75861111111111,'magnitude':4.46,'b_v':-0.16,'constell':'','desigNo':'','bsNo':'4618','serialNo':854,'main':false,'letterLabel':{'vtr':{'x':-0.6421082727170702,'y':0.5055801345553079,'z':-0.5762687685892214},'orthogVtr':{'x':-0.4337568411720882,'y':0.38020716689710155,'z':0.8168828024732138},'minZoom':1.8}},{'longitude':37.63291666666667,'latitude':67.48,'magnitude':4.46,'b_v':0.15,'letter':'iota','constell':'Cas','desigNo':'','bsNo':'707','main':false,'serialNo':855,'letterLabel':{'vtr':{'x':0.9500924906158089,'y':-0.31196836261943167,'z':0},'orthogVtr':{'x':0.07295801180715247,'y':0.22219195102419503,'z':0.9722694407484013},'minZoom':0.5}},{'longitude':78.55166666666666,'latitude':2.8808333333333334,'magnitude':4.46,'b_v':1.17,'letter':'rho','constell':'Ori','desigNo':'17','bsNo':'1698','serialNo':856,'main':false,'letterLabel':{'vtr':{'x':0.06522094047825835,'y':0.9957947006258091,'z':0.06433617278550749},'orthogVtr':{'x':-0.9779824959640944,'y':0.07659610162247861,'z':-0.19412180404086316},'minZoom':0.5}},{'longitude':247.11833333333334,'latitude':-47.59305555555556,'magnitude':4.46,'b_v':-0.07,'letter':'epsilon','constell':'Nor','desigNo':'','bsNo':'6115','serialNo':857,'main':false,'letterLabel':{'vtr':{'x':0.49163049643290146,'y':0.4518162205300761,'z':0.7444202830680104},'orthogVtr':{'x':0.8303845061704058,'y':-0.5006660750366212,'z':-0.24453027055879145},'minZoom':0.5}},{'longitude':178.00625,'latitude':-45.270833333333336,'magnitude':4.47,'b_v':1.28,'constell':'','desigNo':'','bsNo':'4546','serialNo':858,'main':false,'letterLabel':{'vtr':{'x':-0.4888465036452123,'y':0.5083853118600719,'z':-0.7089241641803367},'orthogVtr':{'x':-0.5160963343301859,'y':0.48663899525817605,'z':0.7048596044497502},'minZoom':1.8}},{'longitude':50.350833333333334,'latitude':29.110833333333336,'magnitude':4.47,'b_v':1.56,'constell':'','desigNo':'','bsNo':'999','serialNo':859,'main':false,'letterLabel':{'vtr':{'x':0.32920789280030865,'y':0.6143217174605635,'z':0.7170990104401792},'orthogVtr':{'x':-0.7621258029223386,'y':0.6212294350106999,'z':-0.18231360233473434},'minZoom':1.8}},{'longitude':97.205,'latitude':-32.591944444444444,'magnitude':4.47,'b_v':-0.17,'letter':'lambda','constell':'CMa','desigNo':'','bsNo':'2361','serialNo':860,'main':false,'letterLabel':{'vtr':{'x':-0.9314217873657532,'y':0.34800644050359353,'z':-0.10651277570509646},'orthogVtr':{'x':-0.3482633547529394,'y':-0.7672973218713267,'z':0.5384862631352056},'minZoom':0.5}},{'longitude':224.525,'latitude':-4.416666666666667,'magnitude':4.47,'b_v':0.32,'constell':'Lib','desigNo':'16','bsNo':'5570','serialNo':861,'main':false,'letterLabel':{'vtr':{'x':0.359137080156751,'y':0.8149132454375635,'z':0.4549032425328499},'orthogVtr':{'x':0.6047685371103395,'y':-0.5744440858259884,'z':0.5516058454920184},'minZoom':0.5}},{'longitude':141.4175,'latitude':26.10611111111111,'magnitude':4.47,'b_v':1.22,'letter':'kappa','constell':'Leo','desigNo':'1','bsNo':'3731','serialNo':862,'main':false,'letterLabel':{'vtr':{'x':0.5886671889747993,'y':0.8010704775721876,'z':-0.10842984177234193},'orthogVtr':{'x':-0.4009005086831407,'y':0.40577744228287527,'z':0.8213546429356609},'minZoom':0.5}},{'longitude':331.79083333333335,'latitude':-39.458333333333336,'magnitude':4.47,'b_v':1.35,'letter':'lambda','constell':'Gru','desigNo':'','bsNo':'8411','serialNo':863,'main':false,'letterLabel':{'vtr':{'x':-0.45262776563245194,'y':-0.7560680726037482,'z':-0.47274641761501257},'orthogVtr':{'x':-0.5763722938074489,'y':-0.15645870237545112,'z':0.8020696063198818},'minZoom':0.5}},{'longitude':136.29541666666665,'latitude':-72.67305555555556,'magnitude':4.47,'b_v':0.61,'constell':'','desigNo':'','bsNo':'3643','serialNo':864,'main':false,'letterLabel':{'vtr':{'x':0.7618791872927216,'y':-0.03238238700480073,'z':-0.6469091783102582},'orthogVtr':{'x':-0.6108893900055336,'y':0.29605813315688756,'z':-0.734277696086655},'minZoom':1.8}},{'longitude':98.4625,'latitude':7.318888888888889,'magnitude':4.47,'b_v':0.02,'constell':'Mon','desigNo':'13','bsNo':'2385','serialNo':865,'main':false,'letterLabel':{'vtr':{'x':0.933075824889289,'y':0.3472513706032809,'z':-0.09373361521522335},'orthogVtr':{'x':-0.328731331141596,'y':0.9290790413889567,'z':0.16955189995293934},'minZoom':0.5}},{'longitude':119.68583333333333,'latitude':-49.293055555555554,'magnitude':4.47,'b_v':-0.18,'letter':'V','constell':'Pup','desigNo':'','bsNo':'3129','serialNo':866,'main':false,'letterLabel':{'vtr':{'x':-0.048538285550532884,'y':-0.5846248935901077,'z':0.8098504606596024},'orthogVtr':{'x':0.9451557524247173,'y':-0.28907767973962534,'z':-0.1520351891333756},'minZoom':0.5}},{'longitude':318.8329166666667,'latitude':10.07861111111111,'magnitude':4.47,'b_v':0.53,'letter':'delta','constell':'Equ','desigNo':'7','bsNo':'8123','serialNo':867,'main':false,'letterLabel':{'vtr':{'x':0.669439971256696,'y':-0.12066056322477581,'z':-0.733001468870366},'orthogVtr':{'x':0.05007464548476663,'y':-0.9771470263669721,'z':0.20658223239610618},'minZoom':0.5}},{'longitude':74.86416666666666,'latitude':1.7397222222222224,'magnitude':4.47,'b_v':1.37,'letter':'pi^6','constell':'Ori','desigNo':'10','bsNo':'1601','serialNo':868,'main':false,'letterLabel':{'vtr':{'x':-0.6988154213655584,'y':-0.6836172804577684,'z':-0.21053365697959564},'orthogVtr':{'x':0.6659897254027982,'y':-0.7292089768403378,'z':0.1572003618105682},'minZoom':0.5}},{'longitude':144.00333333333333,'latitude':51.972500000000004,'magnitude':4.47,'b_v':0.03,'constell':'UMa','desigNo':'26','bsNo':'3799','serialNo':869,'main':false,'letterLabel':{'vtr':{'x':0.10397896355758918,'y':0.4689400763072161,'z':0.8770881255441052},'orthogVtr':{'x':-0.8606847566943004,'y':-0.399499713652985,'z':0.3156290993955659},'minZoom':0.5}},{'longitude':41.48,'latitude':-18.499166666666667,'magnitude':4.47,'b_v':0.48,'letter':'tau^1','constell':'Eri','desigNo':'1','bsNo':'818','serialNo':870,'main':false,'letterLabel':{'vtr':{'x':0.5873372723769379,'y':0.7590237582097047,'z':0.2809232331973175},'orthogVtr':{'x':-0.38763376809242556,'y':0.5685151206191611,'z':-0.7256242963557988},'minZoom':0.5}},{'longitude':218.86041666666668,'latitude':29.669722222222223,'magnitude':4.47,'b_v':0.36,'letter':'sigma','constell':'Boo','desigNo':'28','bsNo':'5447','serialNo':871,'main':false,'letterLabel':{'vtr':{'x':0.18712828431618184,'y':-0.6004640936425975,'z':0.777448311757673},'orthogVtr':{'x':-0.7121889175546327,'y':-0.6280273038253213,'z':-0.3136377709432619},'minZoom':0.5}},{'longitude':346.19208333333336,'latitude':3.9144444444444444,'magnitude':4.48,'b_v':-0.12,'letter':'beta','constell':'Psc','desigNo':'4','bsNo':'8773','serialNo':872,'main':false,'letterLabel':{'vtr':{'x':-0.24613435742207662,'y':0.15728215108771879,'z':0.9563891483311809},'orthogVtr':{'x':-0.0278390473273721,'y':0.9851913356805315,'z':-0.16918339027196078},'minZoom':0.5}},{'longitude':231.19625,'latitude':-59.382222222222225,'magnitude':4.48,'b_v':0.17,'letter':'gamma','constell':'Cir','desigNo':'','bsNo':'5704','serialNo':873,'main':false,'letterLabel':{'vtr':{'x':0.9475805683294217,'y':-0.2831186888376649,'z':0.14810426920022224},'orthogVtr':{'x':0.015085645603141129,'y':-0.42336617536365423,'z':-0.9058330446912877},'minZoom':0.5}},{'longitude':246.2825,'latitude':-20.076944444444443,'magnitude':4.48,'b_v':1,'letter':'psi','constell':'Oph','desigNo':'4','bsNo':'6104','serialNo':874,'main':false,'letterLabel':{'vtr':{'x':-0.16912479320578722,'y':-0.8875199995129917,'z':-0.4286082766204579},'orthogVtr':{'x':-0.9103160177121724,'y':0.30735300592958037,'z':-0.27723433705568157},'minZoom':0.5}},{'longitude':66.83625,'latitude':15.656666666666666,'magnitude':4.48,'b_v':0.26,'letter':'v777','constell':'Tau','desigNo':'71','bsNo':'1394','serialNo':875,'main':false,'letterLabel':{'vtr':{'x':0.3688159777295284,'y':-0.9213198725094742,'z':-0.12306285829013637},'orthogVtr':{'x':0.8488296403205129,'y':0.27989042002971687,'z':0.44849703955426257},'minZoom':1.9}},{'longitude':346.90458333333333,'latitude':-23.648333333333333,'magnitude':4.48,'b_v':0.89,'constell':'Aqr','desigNo':'86','bsNo':'8789','serialNo':876,'main':false,'letterLabel':{'vtr':{'x':-0.44113142409499506,'y':-0.8725178198224853,'z':0.21003742706512762},'orthogVtr':{'x':-0.09683768526328834,'y':0.27895136897212,'z':0.9554101718431873},'minZoom':0.5}},{'longitude':152.20833333333334,'latitude':-0.4577777777777778,'magnitude':4.48,'b_v':-0.03,'letter':'alpha','constell':'Sex','desigNo':'15','bsNo':'3981','serialNo':877,'main':false,'letterLabel':{'vtr':{'x':-0.009031350782291683,'y':0.9999592165198774,'z':0},'orthogVtr':{'x':-0.4662240814126916,'y':-0.004210804953669862,'z':0.8846566424509196},'minZoom':0.5}},{'longitude':11.427083333333334,'latitude':48.37972222222222,'magnitude':4.48,'b_v':-0.07,'letter':'omicron','constell':'Cas','desigNo':'22','bsNo':'193','main':false,'serialNo':878,'letterLabel':{'vtr':{'x':0.04440803455587319,'y':0.1355519489704321,'z':0.9897745175529636},'orthogVtr':{'x':-0.7577561509803642,'y':0.6502115995278455,'z':-0.055049900007760534},'minZoom':0.5}},{'longitude':102.19333333333333,'latitude':2.3916666666666666,'magnitude':4.48,'b_v':1.1,'constell':'Mon','desigNo':'18','bsNo':'2506','serialNo':879,'main':false,'letterLabel':{'vtr':{'x':-0.9615841824236938,'y':0.1705844661292493,'z':0.21507394083885523},'orthogVtr':{'x':-0.17556602763728074,'y':-0.9844589980843074,'z':-0.004129289346534157},'minZoom':0.5}},{'longitude':152.11416666666668,'latitude':35.15861111111111,'magnitude':4.49,'b_v':0.19,'constell':'LMi','desigNo':'21','bsNo':'3974','serialNo':880,'main':false,'letterLabel':{'vtr':{'x':0.6717218221771517,'y':0.7155160351855946,'z':-0.19190257164325406},'orthogVtr':{'x':-0.1630953041220383,'y':0.3955286706088222,'z':0.9038567322865709},'minZoom':0.5}},{'longitude':108.265,'latitude':-46.78916666666667,'magnitude':4.49,'b_v':0.32,'letter':'QW','constell':'Pup','desigNo':'','bsNo':'2740','serialNo':881,'main':false,'letterLabel':{'vtr':{'x':0.3503433497453811,'y':-0.6788351494804397,'z':0.6453234670450586},'orthogVtr':{'x':0.911707847822059,'y':0.08931005844916187,'z':-0.40101435595184953},'minZoom':0.5}},{'longitude':118.31583333333333,'latitude':-38.90888888888889,'magnitude':4.49,'b_v':-0.19,'letter':'QZ','constell':'Pup','desigNo':'','bsNo':'3084','serialNo':882,'main':false,'letterLabel':{'vtr':{'x':-0.7751956792661129,'y':0.6146489550101645,'z':-0.14587090509098424},'orthogVtr':{'x':-0.512676862617029,'y':-0.47719746287831705,'z':0.713754170537488},'minZoom':1.4}},{'longitude':294.22791666666666,'latitude':50.26222222222222,'magnitude':4.49,'b_v':0.4,'letter':'theta','constell':'Cyg','desigNo':'13','bsNo':'7469','main':false,'serialNo':883,'letterLabel':{'vtr':{'x':-0.5929300865508701,'y':-0.3481757690257355,'z':0.7260905909913138},'orthogVtr':{'x':-0.7613231171193068,'y':0.536140031546281,'z':-0.36461072106192244},'minZoom':0.5}},{'longitude':317.0370833333333,'latitude':-24.935,'magnitude':4.49,'b_v':1.6,'constell':'Cap','desigNo':'24','bsNo':'8080','serialNo':884,'main':false,'letterLabel':{'vtr':{'x':0.2749814075750159,'y':0.9057119990808017,'z':0.32260037230158456},'orthogVtr':{'x':0.6957329181477476,'y':0.044133903062605506,'z':-0.7169434463094564},'minZoom':0.5}},{'longitude':355.90708333333333,'latitude':-14.448055555555555,'magnitude':4.49,'b_v':-0.03,'letter':'omega^2','constell':'Aqr','desigNo':'105','bsNo':'8988','serialNo':885,'main':false,'letterLabel':{'vtr':{'x':0.2130312543949095,'y':0.9176463643002606,'z':0.33547404480443027},'orthogVtr':{'x':0.14712635020665527,'y':0.3093118389457626,'z':-0.9395105232847898},'minZoom':0.5}},{'longitude':101.24375,'latitude':13.208888888888888,'magnitude':4.49,'b_v':1.17,'constell':'Gem','desigNo':'30','bsNo':'2478','serialNo':886,'main':false,'letterLabel':{'vtr':{'x':0.7040252343107606,'y':0.7095478330815438,'z':0.029838599547636874},'orthogVtr':{'x':-0.6843354686237166,'y':0.6665798903821482,'z':0.295560850116658},'minZoom':0.5}},{'longitude':355.735,'latitude':1.8763888888888889,'magnitude':4.49,'b_v':0.2,'letter':'lambda','constell':'Psc','desigNo':'18','bsNo':'8984','serialNo':887,'main':false,'letterLabel':{'vtr':{'x':0.07932097485479936,'y':-0.5892365311662872,'z':-0.8040575186435394},'orthogVtr':{'x':-0.017470263536037766,'y':-0.8072968388117715,'z':0.5898869416561978},'minZoom':0.5}},{'longitude':68.54916666666666,'latitude':-29.731944444444444,'magnitude':4.49,'b_v':0.97,'letter':'upsilon^1','constell':'Eri','desigNo':'50','bsNo':'1453','serialNo':888,'main':false,'letterLabel':{'vtr':{'x':0.5762032865240412,'y':0.7778399573985602,'z':-0.2509078979886839},'orthogVtr':{'x':-0.7530906605661688,'y':0.38601250754105676,'z':-0.5327746249493093},'minZoom':0.5}},{'longitude':0.2033333333333333,'latitude':-65.47972222222222,'magnitude':4.49,'b_v':-0.08,'letter':'epsilon','constell':'Tuc','desigNo':'','bsNo':'9076','serialNo':889,'main':false,'letterLabel':{'vtr':{'x':-0.29126542412899054,'y':-0.1343942418086297,'z':0.947155024521141},'orthogVtr':{'x':0.8619332642183799,'y':0.3926523369376413,'z':0.3207728017324065},'minZoom':0.5}},{'longitude':340.32125,'latitude':44.36805555555556,'magnitude':4.5,'b_v':1.32,'constell':'Lac','desigNo':'11','bsNo':'8632','serialNo':890,'main':false,'letterLabel':{'vtr':{'x':-0.36282113133956234,'y':0.595888837327105,'z':-0.7164337514400275},'orthogVtr':{'x':0.6444236079918202,'y':-0.3948988608767109,'z':-0.6548076840882988},'minZoom':0.5}},{'longitude':60.22416666666667,'latitude':-62.159166666666664,'magnitude':4.5,'b_v':1.5,'letter':'gamma','constell':'Ret','desigNo':'','bsNo':'1264','serialNo':891,'main':false,'letterLabel':{'vtr':{'x':-0.17418281156885723,'y':-0.44773784769541425,'z':0.8770354427815596},'orthogVtr':{'x':0.9570117372173388,'y':0.13279926001132802,'z':0.25786215575127636},'minZoom':0.5}},{'longitude':332.35,'latitude':-32.902499999999996,'magnitude':4.5,'b_v':0.05,'letter':'mu','constell':'PsA','desigNo':'14','bsNo':'8431','serialNo':892,'main':false,'letterLabel':{'vtr':{'x':-0.5898242030341599,'y':-0.8075316770970151,'z':0},'orthogVtr':{'x':-0.3146391602333054,'y':0.2298136372743819,'z':0.9209711672850565},'minZoom':0.5}},{'longitude':131.79041666666666,'latitude':-56.834722222222226,'magnitude':4.5,'b_v':-0.17,'letter':'v344','constell':'Car','desigNo':'','bsNo':'3498','serialNo':893,'main':false,'letterLabel':{'vtr':{'x':0.791728307592299,'y':-0.04807733165801206,'z':-0.6089785358595814},'orthogVtr':{'x':-0.49016380006146215,'y':0.5449393265161115,'z':-0.6802797803297358},'minZoom':1.3}},{'longitude':333.65791666666667,'latitude':39.80222222222222,'magnitude':4.5,'b_v':1.39,'constell':'','desigNo':'','bsNo':'8485','serialNo':894,'main':false,'letterLabel':{'vtr':{'x':-0.7242804786252631,'y':0.5825475750873274,'z':0.36885784665943394},'orthogVtr':{'x':-0.03753054790040608,'y':0.5008590093042243,'z':-0.8647148147066097},'minZoom':1.8}},{'longitude':87.53666666666666,'latitude':-56.16277777777778,'magnitude':4.5,'b_v':1.08,'letter':'gamma','constell':'Pic','desigNo':'','bsNo':'2042','serialNo':895,'main':false,'letterLabel':{'vtr':{'x':0.710292100807456,'y':-0.3774679330684732,'z':0.5941406323721224},'orthogVtr':{'x':0.7035000728671642,'y':0.40936971508434555,'z':-0.580951016736916},'minZoom':0.5}},{'longitude':322.4295833333333,'latitude':-21.729999999999997,'magnitude':4.5,'b_v':0.89,'constell':'Cap','desigNo':'36','bsNo':'8213','serialNo':896,'main':false,'letterLabel':{'vtr':{'x':0.6166814296772932,'y':0.7117026173683131,'z':-0.33642740483239764},'orthogVtr':{'x':0.27855707592241347,'y':-0.5969981261347429,'z':-0.75232917851507},'minZoom':0.5}},{'longitude':207.02333333333334,'latitude':17.37027777777778,'magnitude':4.5,'b_v':0.51,'letter':'tau','constell':'Boo','desigNo':'4','bsNo':'5185','serialNo':897,'main':false,'letterLabel':{'vtr':{'x':-0.2656119232207471,'y':0.46791375296542004,'z':-0.8429157882189607},'orthogVtr':{'x':0.4545516139385473,'y':0.8318215922626053,'z':0.3185210650986304},'minZoom':0.5}},{'longitude':177.22166666666666,'latitude':20.121666666666666,'magnitude':4.5,'b_v':0.55,'letter':'DQ','constell':'Leo','desigNo':'93','bsNo':'4527','serialNo':898,'main':false,'letterLabel':{'vtr':{'x':0.34505658274255785,'y':0.9106124243123629,'z':-0.227422442590852},'orthogVtr':{'x':0.036791495556433594,'y':0.22899527280116044,'z':0.9727320036317522},'minZoom':0.5}},{'longitude':317.63625,'latitude':-11.3,'magnitude':4.5,'b_v':0.93,'letter':'nu','constell':'Aqr','desigNo':'13','bsNo':'8093','serialNo':899,'main':false,'letterLabel':{'vtr':{'x':-0.5623464726241658,'y':0.38622335634574323,'z':0.7311620639367084},'orthogVtr':{'x':0.39847416883045966,'y':0.901352665480898,'z':-0.1696517291552158},'minZoom':0.5}},{'longitude':18.1575,'latitude':30.182222222222222,'magnitude':4.51,'b_v':1.09,'letter':'tau','constell':'Psc','desigNo':'83','bsNo':'352','serialNo':900,'main':false,'letterLabel':{'vtr':{'x':-0.5592442067321365,'y':0.8027211415943585,'z':-0.20708618030663747},'orthogVtr':{'x':-0.11212627583532038,'y':-0.3207482534674291,'z':-0.9405042563247099},'minZoom':0.5}},{'longitude':142.49208333333334,'latitude':-36.02861111111111,'magnitude':4.51,'b_v':1.41,'letter':'epsilon','constell':'Ant','desigNo':'','bsNo':'3765','serialNo':901,'main':false,'letterLabel':{'vtr':{'x':-0.6757964770326557,'y':0.7370882726175009,'z':0},'orthogVtr':{'x':-0.36294834364653417,'y':-0.3327677580734605,'z':0.870364359926922},'minZoom':0.5}},{'longitude':4.8116666666666665,'latitude':36.882222222222225,'magnitude':4.51,'b_v':0.05,'letter':'sigma','constell':'And','desigNo':'25','bsNo':'68','serialNo':902,'main':false,'letterLabel':{'vtr':{'x':0.5592006282361098,'y':-0.6915222242007576,'z':0.4572654270954423},'orthogVtr':{'x':-0.22804110336195668,'y':0.4019832088881144,'z':0.8867957797314308},'minZoom':0.5}},{'longitude':311.32875,'latitude':-51.85722222222223,'magnitude':4.51,'b_v':0.28,'letter':'eta','constell':'Ind','desigNo':'','bsNo':'7920','serialNo':903,'main':false,'letterLabel':{'vtr':{'x':-0.8877251247182991,'y':-0.4603738730031063,'z':0},'orthogVtr':{'x':-0.2135184496836263,'y':0.4117212194050293,'z':0.8859432877652703},'minZoom':0.5}},{'longitude':358.81666666666666,'latitude':57.59666666666667,'magnitude':4.51,'b_v':1.19,'letter':'rho','constell':'Cas','desigNo':'7','bsNo':'9045','main':false,'serialNo':904,'letterLabel':{'vtr':{'x':0.5480666919757179,'y':-0.3576948007915586,'z':0.7560934668633772},'orthogVtr':{'x':-0.6423257557185132,'y':0.39902058324005013,'z':0.6543700770140786},'minZoom':0.5}},{'longitude':337.13958333333335,'latitude':-64.87666666666667,'magnitude':4.51,'b_v':-0.03,'letter':'delta','constell':'Tuc','desigNo':'','bsNo':'8540','serialNo':905,'main':false,'letterLabel':{'vtr':{'x':-0.9179687451384969,'y':-0.3966527233599352,'z':0},'orthogVtr':{'x':-0.06542366477183978,'y':0.151409219995371,'z':0.9863037018019426},'minZoom':0.5}},{'longitude':337.81166666666667,'latitude':43.21361111111111,'magnitude':4.52,'b_v':-0.09,'constell':'Lac','desigNo':'6','bsNo':'8579','serialNo':906,'main':false,'letterLabel':{'vtr':{'x':-0.2976082152300675,'y':-0.08877848808559899,'z':0.9505512770391763},'orthogVtr':{'x':-0.6752966839034572,'y':0.7233785636493358,'z':-0.14386744719226174},'minZoom':0.5}},{'longitude':215.015,'latitude':-13.450833333333332,'magnitude':4.52,'b_v':0.13,'letter':'lambda','constell':'Vir','desigNo':'100','bsNo':'5359','serialNo':907,'main':false,'letterLabel':{'vtr':{'x':0.4255039576645644,'y':-0.871408567499023,'z':0.24411777997739845},'orthogVtr':{'x':-0.4295066026205661,'y':-0.43190194802426135,'z':-0.7930856105101062},'minZoom':0.5}},{'longitude':322.68541666666664,'latitude':23.71611111111111,'magnitude':4.52,'b_v':1.62,'constell':'Peg','desigNo':'2','bsNo':'8225','serialNo':908,'main':false,'letterLabel':{'vtr':{'x':-0.6652406705800099,'y':0.6097128156666521,'z':0.43093518377837464},'orthogVtr':{'x':0.1650648526105692,'y':0.6829943112354135,'z':-0.7115281900618653},'minZoom':0.5}},{'longitude':311.44666666666666,'latitude':57.643055555555556,'magnitude':4.52,'b_v':0.54,'constell':'','desigNo':'','bsNo':'7955','serialNo':909,'main':false,'letterLabel':{'vtr':{'x':0.7355509096459034,'y':-0.5166061591149103,'z':0.4382726727547861},'orthogVtr':{'x':-0.5774666179568098,'y':-0.13981676882657776,'z':0.8043528928899423},'minZoom':1.8}},{'longitude':226.29916666666668,'latitude':26.880277777777778,'magnitude':4.52,'b_v':1.24,'letter':'psi','constell':'Boo','desigNo':'43','bsNo':'5616','serialNo':910,'main':false,'letterLabel':{'vtr':{'x':0.38690155753870936,'y':0.8869753549560092,'z':-0.25215452499366764},'orthogVtr':{'x':0.6859667001124411,'y':-0.09410235673925813,'z':0.7215223023531331},'minZoom':0.5}},{'longitude':290.6820833333333,'latitude':-15.920833333333333,'magnitude':4.52,'b_v':0.08,'letter':'upsilon','constell':'Sgr','desigNo':'46','bsNo':'7342','serialNo':911,'main':false,'letterLabel':{'vtr':{'x':0.1647648348445116,'y':0.9590875164905482,'z':0.23022529163984762},'orthogVtr':{'x':0.9260133605922912,'y':-0.07004115448576437,'z':-0.37093596844047405},'minZoom':0.5}},{'longitude':273.13208333333336,'latitude':-45.94944444444444,'magnitude':4.52,'b_v':1.01,'letter':'epsilon','constell':'Tel','desigNo':'','bsNo':'6783','serialNo':912,'main':false,'letterLabel':{'vtr':{'x':-0.8549377106790677,'y':0.3363060522832472,'z':0.3949427174369631},'orthogVtr':{'x':0.5173377219753726,'y':0.6085477310361749,'z':0.6016904025095094},'minZoom':0.5}},{'longitude':200.94458333333333,'latitude':-61.07944444444445,'magnitude':4.52,'b_v':-0.14,'constell':'','desigNo':'','bsNo':'5035','serialNo':913,'main':false,'letterLabel':{'vtr':{'x':-0.8276025773231961,'y':0.48338786540602036,'z':0.28532463193039337},'orthogVtr':{'x':0.33330474538934174,'y':0.014201554881457273,'z':0.9427121843595188},'minZoom':1.8}},{'longitude':12.69625,'latitude':41.17388888888889,'magnitude':4.53,'b_v':-0.14,'letter':'nu','constell':'And','desigNo':'35','bsNo':'226','serialNo':914,'main':false,'letterLabel':{'vtr':{'x':-0.4649448208502007,'y':0.665358713078347,'z':0.5840582988840244},'orthogVtr':{'x':-0.4945853415812358,'y':0.35196260041744337,'z':-0.7946745672288521},'minZoom':0.5}},{'longitude':267.16583333333335,'latitude':-27.835833333333333,'magnitude':4.53,'b_v':0.6,'letter':'X','constell':'Sgr','desigNo':'3','bsNo':'6616','serialNo':915,'main':false,'letterLabel':{'vtr':{'x':-0.9115267230938918,'y':0.38048979650239595,'z':0.15603380352755847},'orthogVtr':{'x':0.4089098246253635,'y':0.7982448005981349,'z':0.44226461947899304},'minZoom':0.5}},{'longitude':114.50416666666666,'latitude':-35.00861111111111,'magnitude':4.53,'b_v':-0.08,'constell':'','desigNo':'','bsNo':'2937','serialNo':916,'main':false,'letterLabel':{'vtr':{'x':0.8729504407367368,'y':0.10261645224952676,'z':-0.47689348050194375},'orthogVtr':{'x':-0.35007294435059344,'y':0.812612268648,'z':-0.465950892773538},'minZoom':1.8}},{'longitude':312.0229166666667,'latitude':36.55583333333333,'magnitude':4.53,'b_v':-0.08,'letter':'lambda','constell':'Cyg','desigNo':'54','bsNo':'7963','main':false,'serialNo':917,'letterLabel':{'vtr':{'x':-0.6471805509836703,'y':0.7452238988639247,'z':-0.16061965941479206},'orthogVtr':{'x':0.5403679324571082,'y':0.299824982818756,'z':-0.7861981157760192},'minZoom':0.5}},{'longitude':261.89,'latitude':-5.100833333333333,'magnitude':4.53,'b_v':0.39,'constell':'','desigNo':'','bsNo':'6493','serialNo':918,'main':false,'letterLabel':{'vtr':{'x':0.7551966992362038,'y':0.6344389841245645,'z':0.16481844825666048},'orthogVtr':{'x':0.640260404626651,'y':-0.7678426945711412,'z':0.02200478723020284},'minZoom':1.8}},{'longitude':98.9475,'latitude':-22.97972222222222,'magnitude':4.54,'b_v':-0.04,'letter':'xi^2','constell':'CMa','desigNo':'5','bsNo':'2414','serialNo':919,'main':false,'letterLabel':{'vtr':{'x':-0.901480930319689,'y':0.43068252636725646,'z':-0.04294989815896218},'orthogVtr':{'x':-0.4084477946295274,'y':-0.8136929667248862,'z':0.4136111156203717},'minZoom':1.4}},{'longitude':144,'latitude':69.75222222222222,'magnitude':4.54,'b_v':0.78,'letter':'DK','constell':'UMa','desigNo':'24','bsNo':'3771','serialNo':920,'main':false,'letterLabel':{'vtr':{'x':0.5212107674905332,'y':0.3265054661321908,'z':0.7885008030672703},'orthogVtr':{'x':-0.8061933116565712,'y':-0.1147432352069474,'z':0.5804191022136106},'minZoom':0.5}},{'longitude':231.07,'latitude':-36.919999999999995,'magnitude':4.54,'b_v':-0.16,'letter':'phi^2','constell':'Lup','desigNo':'','bsNo':'5712','serialNo':921,'main':false,'letterLabel':{'vtr':{'x':0.6849964780061063,'y':-0.715417234742501,'z':-0.1376880726592657},'orthogVtr':{'x':-0.527643570571563,'y':-0.3568451955035893,'z':-0.7708785694780322},'minZoom':1.3}},{'longitude':352.5104166666667,'latitude':12.857222222222221,'magnitude':4.54,'b_v':0.94,'constell':'Peg','desigNo':'70','bsNo':'8923','serialNo':922,'main':false,'letterLabel':{'vtr':{'x':-0.24120243285842746,'y':0.9575278474030449,'z':0.15799306260360543},'orthogVtr':{'x':0.08652360799099873,'y':0.18336917513379866,'z':-0.9792289879650061},'minZoom':0.5}},{'longitude':143.8225,'latitude':36.31888888888889,'magnitude':4.54,'b_v':0.91,'letter':'SU','constell':'LMi','desigNo':'10','bsNo':'3800','serialNo':923,'main':false,'letterLabel':{'vtr':{'x':-0.559439603393862,'y':0.05006870859387941,'z':0.8273575131551412},'orthogVtr':{'x':-0.5138397841628762,'y':-0.8041759139071372,'z':-0.2987804807932902},'minZoom':0.5}},{'longitude':346.9716666666667,'latitude':9.504166666666666,'magnitude':4.54,'b_v':1.56,'constell':'Peg','desigNo':'55','bsNo':'8795','serialNo':924,'main':false,'letterLabel':{'vtr':{'x':-0.2757605858536396,'y':0.4962602213288845,'z':0.823214365773742},'orthogVtr':{'x':-0.02559086131908167,'y':0.8523270496362675,'z':-0.5223827220298191},'minZoom':0.5}},{'longitude':228.30541666666667,'latitude':-19.856944444444444,'magnitude':4.54,'b_v':-0.07,'letter':'iota','constell':'Lib','desigNo':'24','bsNo':'5652','serialNo':925,'main':false,'letterLabel':{'vtr':{'x':-0.4771515752558045,'y':0.8788210137627026,'z':0},'orthogVtr':{'x':0.6172003428617973,'y':0.33510591034234066,'z':0.7118762291472521},'minZoom':0.5}},{'longitude':52.83083333333333,'latitude':58.937777777777775,'magnitude':4.55,'b_v':0.49,'constell':'','desigNo':'','bsNo':'1040','serialNo':926,'main':false,'letterLabel':{'vtr':{'x':0.43329892894750477,'y':-0.5132613809182948,'z':-0.7408203513881015},'orthogVtr':{'x':0.8456208334875419,'y':-0.052786287507899265,'z':0.531167594853986},'minZoom':1.8}},{'longitude':112.6925,'latitude':11.969166666666666,'magnitude':4.55,'b_v':1.28,'constell':'CMi','desigNo':'6','bsNo':'2864','serialNo':927,'main':false,'letterLabel':{'vtr':{'x':0.22160947256458227,'y':0.9665091440759288,'z':0.12941914884306377},'orthogVtr':{'x':-0.8991440096532328,'y':0.15116686537943724,'z':0.41071721258800714},'minZoom':0.5}},{'longitude':1.15875,'latitude':-17.238611111111112,'magnitude':4.55,'b_v':-0.05,'constell':'Cet','desigNo':'2','bsNo':'9098','serialNo':928,'main':false,'letterLabel':{'vtr':{'x':0.1745259334389703,'y':0.5073464392665605,'z':0.8438840495712657},'orthogVtr':{'x':0.24028751228179104,'y':0.8091818330397663,'z':-0.5361778366548098},'minZoom':0.5}},{'longitude':325.54291666666666,'latitude':71.39222222222223,'magnitude':4.55,'b_v':1.11,'constell':'Cep','desigNo':'11','bsNo':'8317','main':false,'serialNo':929,'letterLabel':{'vtr':{'x':-0.5017233820801366,'y':0.29424360596169397,'z':-0.8134459713003246},'orthogVtr':{'x':0.8240448451869085,'y':-0.12344160171465265,'z':-0.5529125284229008},'minZoom':1.3}},{'longitude':105.64833333333333,'latitude':76.95166666666667,'magnitude':4.55,'b_v':1.37,'constell':'','desigNo':'','bsNo':'2527','serialNo':930,'main':false,'letterLabel':{'vtr':{'x':-0.21594445873827592,'y':-0.22550934756452612,'z':-0.9500071183424127},'orthogVtr':{'x':0.974504692526829,'y':0.010906407698760862,'z':-0.22410188422746224},'minZoom':1.8}},{'longitude':216.81708333333333,'latitude':-45.29972222222222,'magnitude':4.56,'b_v':-0.15,'letter':'tau^1','constell':'Lup','desigNo':'','bsNo':'5395','serialNo':931,'main':false,'letterLabel':{'vtr':{'x':-0.5465609048678192,'y':0.702920426277669,'z':0.45516376348704507},'orthogVtr':{'x':0.6198236332817186,'y':-0.02591968623899016,'z':0.7843129690950685},'minZoom':0.5}},{'longitude':59.75666666666667,'latitude':-61.35111111111111,'magnitude':4.56,'b_v':1.59,'letter':'delta','constell':'Ret','desigNo':'','bsNo':'1247','serialNo':932,'main':false,'letterLabel':{'vtr':{'x':0.7553310674480957,'y':0.4379408447729256,'z':-0.4875272249088214},'orthogVtr':{'x':-0.6092303354216619,'y':0.19511877768765973,'z':-0.768613726780678},'minZoom':0.5}},{'longitude':88.60708333333334,'latitude':27.614722222222223,'magnitude':4.56,'b_v':-0.01,'constell':'Tau','desigNo':'136','bsNo':'2034','serialNo':933,'main':false,'letterLabel':{'vtr':{'x':0.31682479488114357,'y':0.8371972440140164,'z':0.44578338233255926},'orthogVtr':{'x':-0.948239474446289,'y':0.29025252017776354,'z':0.1288230322274806},'minZoom':0.5}},{'longitude':136.90916666666666,'latitude':38.38111111111111,'magnitude':4.56,'b_v':1.04,'constell':'','desigNo':'','bsNo':'3612','serialNo':934,'main':false,'letterLabel':{'vtr':{'x':0.5123365014187309,'y':-0.23906232651591952,'z':-0.8248396894880912},'orthogVtr':{'x':0.6401581771946444,'y':0.7465558098544698,'z':0.1812510163926449},'minZoom':1.8}},{'longitude':265.40791666666667,'latitude':72.13972222222223,'magnitude':4.57,'b_v':0.43,'letter':'psi','constell':'Dra','desigNo':'31','bsNo':'6636','main':false,'serialNo':935,'letterLabel':{'vtr':{'x':-0.7734464163072894,'y':0.1756634371693764,'z':-0.609034480093904},'orthogVtr':{'x':0.6333859146877924,'y':0.25140663429349347,'z':-0.7318585842280779},'minZoom':0.5}},{'longitude':54.43083333333333,'latitude':-40.217777777777776,'magnitude':4.57,'b_v':1.02,'constell':'','desigNo':'','bsNo':'1106','serialNo':936,'main':false,'letterLabel':{'vtr':{'x':-0.889552498712726,'y':-0.4004702463354153,'z':-0.21981795612278202},'orthogVtr':{'x':0.10680455268107678,'y':-0.650155368759279,'z':0.7522571262541027},'minZoom':1.8}},{'longitude':246.55625,'latitude':13.994166666666667,'magnitude':4.57,'b_v':0,'letter':'omega','constell':'Her','desigNo':'24','bsNo':'6117','serialNo':937,'main':false,'letterLabel':{'vtr':{'x':0.5308633702344693,'y':0.8474574220238448,'z':0},'orthogVtr':{'x':0.7544247980317382,'y':-0.472585973599885,'z':0.45552795926421474},'minZoom':0.5}},{'longitude':350.37666666666667,'latitude':23.836388888888887,'magnitude':4.58,'b_v':0.18,'letter':'tau','constell':'Peg','desigNo':'62','bsNo':'8880','serialNo':938,'main':false,'letterLabel':{'vtr':{'x':-0.2759315707529466,'y':0.2663102973184825,'z':0.9235478297326855},'orthogVtr':{'x':-0.33250815528202105,'y':0.8750775680553748,'z':-0.3516782287222774},'minZoom':0.5}},{'longitude':207.98583333333335,'latitude':64.63722222222223,'magnitude':4.58,'b_v':1.57,'letter':'CU','constell':'Dra','desigNo':'10','bsNo':'5226','main':false,'serialNo':939,'letterLabel':{'vtr':{'x':-0.2580284304905282,'y':0.10561148709579261,'z':-0.9603476156330114},'orthogVtr':{'x':0.8890116274612206,'y':0.4151245432431814,'z':-0.193209574907385},'minZoom':0.5}},{'longitude':58.05875,'latitude':71.38388888888889,'magnitude':4.59,'b_v':0.06,'letter':'gamma','constell':'Cam','desigNo':'','bsNo':'1148','serialNo':940,'main':false,'letterLabel':{'vtr':{'x':0.9844890186795249,'y':-0.17544620856383888,'z':0},'orthogVtr':{'x':0.04752700035124485,'y':0.26669034526074276,'z':0.9626097049076113},'minZoom':0.5}},{'longitude':357.45875,'latitude':-28.033333333333335,'magnitude':4.59,'b_v':0,'letter':'delta','constell':'Scl','desigNo':'','bsNo':'9016','serialNo':941,'main':false,'letterLabel':{'vtr':{'x':0.4470989460394669,'y':0.8066834919133491,'z':-0.38647674745692484},'orthogVtr':{'x':-0.15006750518731432,'y':-0.3582955371524491,'z':-0.9214684215660857},'minZoom':0.5}},{'longitude':237.58208333333334,'latitude':26.015833333333333,'magnitude':4.59,'b_v':0.79,'letter':'delta','constell':'CrB','desigNo':'10','bsNo':'5889','main':true,'serialNo':942,'letterLabel':{'vtr':{'x':-0.10335386543661579,'y':-0.8881140192049688,'z':0.4478520597149311},'orthogVtr':{'x':-0.870181246511522,'y':-0.13735507877495368,'z':-0.4731999371876334},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.1937217607687614,'y':-0.7909864567777125,'z':0.5803553261570802},'orthogVtr':{'x':-0.854616465255431,'y':-0.42655990665780774,'z':-0.29610360238672473},'minZoom':0.5}},{'longitude':294.4425,'latitude':-24.84361111111111,'magnitude':4.59,'b_v':-0.08,'constell':'Sgr','desigNo':'52','bsNo':'7440','serialNo':943,'main':false,'letterLabel':{'vtr':{'x':-0.5279916824848119,'y':-0.8295407597444349,'z':-0.181898079015374},'orthogVtr':{'x':-0.7617307264504775,'y':0.36788864158105855,'z':0.5333143986213678},'minZoom':0.5}},{'longitude':10.537083333333333,'latitude':-45.98916666666667,'magnitude':4.59,'b_v':0.95,'letter':'mu','constell':'Phe','desigNo':'','bsNo':'180','serialNo':944,'main':false,'letterLabel':{'vtr':{'x':0.030778049256498477,'y':0.20216278290685047,'z':-0.9788681836137706},'orthogVtr':{'x':-0.7296967320760002,'y':-0.6647325960520497,'z':-0.16022875816628218},'minZoom':0.5}},{'longitude':238.32041666666666,'latitude':42.40333333333333,'magnitude':4.6,'b_v':0.56,'letter':'chi','constell':'Her','desigNo':'1','bsNo':'5914','serialNo':945,'main':false,'letterLabel':{'vtr':{'x':0.7292715953318124,'y':-0.19247155952612705,'z':0.6565954911631469},'orthogVtr':{'x':-0.5637194828685229,'y':-0.7128906300128323,'z':0.4171418155428112},'minZoom':1.3}},{'longitude':164.38416666666666,'latitude':-37.23222222222223,'magnitude':4.6,'b_v':1.01,'letter':'iota','constell':'Ant','desigNo':'','bsNo':'4273','serialNo':946,'main':false,'letterLabel':{'vtr':{'x':-0.6194410398038357,'y':0.7850431823834553,'z':0},'orthogVtr':{'x':-0.16825290451735525,'y':-0.13276053657050715,'z':0.9767628166811966},'minZoom':0.5}},{'longitude':151.49416666666667,'latitude':-13.15,'magnitude':4.6,'b_v':-0.09,'letter':'upsilon^2','constell':'Hya','desigNo':'40','bsNo':'3970','serialNo':947,'main':false,'letterLabel':{'vtr':{'x':0.5156221907748879,'y':-0.4499478648639967,'z':-0.7291643678107397},'orthogVtr':{'x':0.04322020112947744,'y':0.8635914161778422,'z':-0.5023364212540006},'minZoom':1.3}},{'longitude':28.615833333333335,'latitude':3.2733333333333334,'magnitude':4.61,'b_v':0.93,'letter':'xi','constell':'Psc','desigNo':'111','bsNo':'549','serialNo':948,'main':false,'letterLabel':{'vtr':{'x':0.481114340351542,'y':-0.146069273469069,'z':0.864403122886723},'orthogVtr':{'x':0.020486598554741033,'y':0.9876251460642097,'z':0.15548913190736416},'minZoom':0.5}},{'longitude':1.5579166666666666,'latitude':-5.609722222222222,'magnitude':4.61,'b_v':1.03,'letter':'BC','constell':'Psc','desigNo':'33','bsNo':'3','serialNo':949,'main':false,'letterLabel':{'vtr':{'x':-0.0033454359959037804,'y':0.2349950743883767,'z':-0.9719908040054696},'orthogVtr':{'x':-0.1013721380657738,'y':-0.9670687182558825,'z':-0.23345617103623267},'minZoom':0.5}},{'longitude':233.78416666666666,'latitude':-10.123333333333333,'magnitude':4.61,'b_v':1,'constell':'Lib','desigNo':'37','bsNo':'5777','serialNo':950,'main':false,'letterLabel':{'vtr':{'x':0.5950964937243589,'y':0.5737216998973708,'z':0.562764226140793},'orthogVtr':{'x':0.5545865128834881,'y':-0.7999682158506802,'z':0.22909529317821503},'minZoom':0.5}},{'longitude':120.16291666666666,'latitude':-18.448333333333334,'magnitude':4.61,'b_v':0.09,'constell':'','desigNo':'','bsNo':'3131','serialNo':951,'main':false,'letterLabel':{'vtr':{'x':0.6766605393211458,'y':0.463521445645467,'z':-0.5720824975056942},'orthogVtr':{'x':-0.5612005429290066,'y':0.8276518975450913,'z':0.006803462809338134},'minZoom':1.8}},{'longitude':278.6879166666667,'latitude':-42.29805555555556,'magnitude':4.62,'b_v':0.99,'letter':'theta','constell':'CrA','desigNo':'','bsNo':'6951','serialNo':952,'main':false,'letterLabel':{'vtr':{'x':-0.4626512126759592,'y':0.6159426131951409,'z':0.6376272834970331},'orthogVtr':{'x':0.8794720305444813,'y':0.40951512810327834,'z':0.24254135182381345},'minZoom':0.5}},{'longitude':76.03583333333333,'latitude':21.613611111111112,'magnitude':4.62,'b_v':0.16,'letter':'iota','constell':'Tau','desigNo':'102','bsNo':'1620','serialNo':953,'main':false,'letterLabel':{'vtr':{'x':0.8540567596162112,'y':-0.52017982597738,'z':0},'orthogVtr':{'x':0.4693133953522782,'y':0.7705417581812913,'z':0.43128915572015103},'minZoom':0.5}},{'longitude':284.2725,'latitude':4.2275,'magnitude':4.62,'b_v':0.16,'letter':'theta^1','constell':'Ser','desigNo':'63','bsNo':'7141','serialNo':954,'main':false,'letterLabel':{'vtr':{'x':0.287197506297892,'y':-0.957871386135045,'z':0},'orthogVtr':{'x':-0.9257801666533471,'y':-0.277575631855656,'z':0.2566765506064674},'minZoom':0.5}},{'longitude':166.47958333333332,'latitude':7.2411111111111115,'magnitude':4.62,'b_v':0.33,'letter':'chi','constell':'Leo','desigNo':'63','bsNo':'4310','serialNo':955,'main':false,'letterLabel':{'vtr':{'x':0.20328893724432306,'y':0.9151612554205854,'z':-0.3480710912602362},'orthogVtr':{'x':-0.16837817844663397,'y':0.38287402303109186,'z':0.9083260821483551},'minZoom':0.5}},{'longitude':359.66333333333336,'latitude':25.238611111111112,'magnitude':4.63,'b_v':1.58,'letter':'psi','constell':'Peg','desigNo':'84','bsNo':'9064','serialNo':956,'main':false,'letterLabel':{'vtr':{'x':0.36503366425001776,'y':-0.7806902529467892,'z':0.5072210099336223},'orthogVtr':{'x':-0.2204227971699627,'y':0.4568535789069589,'z':0.8617996274817439},'minZoom':0.5}},{'longitude':282.8645833333333,'latitude':59.41,'magnitude':4.63,'b_v':1.19,'letter':'omicron','constell':'Dra','desigNo':'47','bsNo':'7125','main':true,'serialNo':957,'letterLabel':{'vtr':{'x':0.9914489096625513,'y':-0.13049543872847813,'z':0},'orthogVtr':{'x':-0.06474107164959161,'y':-0.491875160716748,'z':0.8682553886452626},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.9914489096625513,'y':-0.13049543872847813,'z':0},'orthogVtr':{'x':-0.06474107164959161,'y':-0.491875160716748,'z':0.8682553886452626},'minZoom':0.5}},{'longitude':224.46666666666667,'latitude':65.86305555555555,'magnitude':4.63,'b_v':1.59,'letter':'RR','constell':'UMi','desigNo':'','bsNo':'5589','main':false,'serialNo':958,'letterLabel':{'vtr':{'x':-0.955842121513581,'y':-0.2673952453868077,'z':-0.12192465495110454},'orthogVtr':{'x':0.0346707381561497,'y':0.30937761582282597,'z':-0.950307019201422},'minZoom':0.5}},{'longitude':91.24,'latitude':20.136666666666667,'magnitude':4.64,'b_v':0.24,'letter':'chi^2','constell':'Ori','desigNo':'62','bsNo':'2135','serialNo':959,'main':false,'letterLabel':{'vtr':{'x':-0.7015048758434999,'y':-0.6738586934871109,'z':-0.23195984648132476},'orthogVtr':{'x':0.712374974345564,'y':-0.6537576764894095,'z':-0.2551916855176235},'minZoom':0.5}},{'longitude':252.70083333333332,'latitude':-10.8125,'magnitude':4.64,'b_v':0.48,'constell':'Oph','desigNo':'20','bsNo':'6243','serialNo':960,'main':false,'letterLabel':{'vtr':{'x':0.9563847074310359,'y':-0.0614615867848905,'z':0.285570945199149},'orthogVtr':{'x':-0.004067714494129737,'y':-0.9803215593486181,'z':-0.19736538190647476},'minZoom':0.5}},{'longitude':180.4425,'latitude':6.516666666666667,'magnitude':4.65,'b_v':0.12,'letter':'pi','constell':'Vir','desigNo':'8','bsNo':'4589','serialNo':961,'main':false,'letterLabel':{'vtr':{'x':-0.11357544612144607,'y':-0.9934633464747219,'z':-0.011454136788125917},'orthogVtr':{'x':-0.0063229940031835335,'y':0.012251267325202464,'z':-0.9999049585814455},'minZoom':0.5}},{'longitude':68.71083333333333,'latitude':14.88,'magnitude':4.65,'b_v':0.26,'letter':'rho','constell':'Tau','desigNo':'86','bsNo':'1444','serialNo':962,'main':false,'letterLabel':{'vtr':{'x':-0.5858834334853792,'y':-0.6899766475358331,'z':-0.4250562647727902},'orthogVtr':{'x':0.7304861789186741,'y':-0.6767483457159926,'z':0.0916603457306529},'minZoom':1.9}},{'longitude':76.3925,'latitude':15.426944444444445,'magnitude':4.65,'b_v':-0.06,'letter':'v1032','constell':'Ori','desigNo':'11','bsNo':'1638','serialNo':963,'main':false,'letterLabel':{'vtr':{'x':-0.9319709596460649,'y':0.3386332398063028,'z':-0.12945137803314424},'orthogVtr':{'x':-0.2828342429497329,'y':-0.9025333730188592,'z':-0.32471264466024796},'minZoom':0.5}},{'longitude':41.12083333333333,'latitude':27.780555555555555,'magnitude':4.65,'b_v':-0.12,'constell':'Ari','desigNo':'35','bsNo':'801','serialNo':964,'main':false,'letterLabel':{'vtr':{'x':0.5464493086296238,'y':0.22548127309944077,'z':0.8065676342252162},'orthogVtr':{'x':-0.5071260512672899,'y':0.8555241963398318,'z':0.10441033283699264},'minZoom':0.5}},{'longitude':300.4554166666667,'latitude':27.802777777777777,'magnitude':4.66,'b_v':0.18,'letter':'NT','constell':'Vul','desigNo':'15','bsNo':'7653','serialNo':965,'main':false,'letterLabel':{'vtr':{'x':0.23875416961886997,'y':0.7595715190913506,'z':-0.6050186392788754},'orthogVtr':{'x':0.8613797294643613,'y':-0.4533151278510608,'z':-0.22919501855249913},'minZoom':0.5}},{'longitude':271.53458333333333,'latitude':-29.57777777777778,'magnitude':4.66,'b_v':0.77,'letter':'W','constell':'Sgr','desigNo':'','bsNo':'6742','serialNo':966,'main':false,'letterLabel':{'vtr':{'x':-0.20268175490122942,'y':0.8492200991458764,'z':0.48759135496522715},'orthogVtr':{'x':0.9789676497844672,'y':0.18756259485949422,'z':0.08026589366007425},'minZoom':0.5}},{'longitude':27.61125,'latitude':-10.600555555555555,'magnitude':4.66,'b_v':0.33,'letter':'chi','constell':'Cet','desigNo':'53','bsNo':'531','serialNo':967,'main':false,'letterLabel':{'vtr':{'x':0.27062056773455617,'y':-0.5942644279902483,'z':0.7573732883753225},'orthogVtr':{'x':0.4100503096018764,'y':0.7829483914887011,'z':0.46781466400772537},'minZoom':0.5}},{'longitude':18.09958333333333,'latitude':21.127222222222223,'magnitude':4.66,'b_v':1.02,'letter':'chi','constell':'Psc','desigNo':'84','bsNo':'351','serialNo':968,'main':false,'letterLabel':{'vtr':{'x':0.4579187212926352,'y':-0.7720146674960455,'z':0.4407990447592736},'orthogVtr':{'x':0.06483823559487295,'y':0.5235230061714164,'z':0.8495408555297308},'minZoom':0.5}},{'longitude':190.03791666666666,'latitude':-8.091666666666667,'magnitude':4.66,'b_v':1.24,'letter':'chi','constell':'Vir','desigNo':'26','bsNo':'4813','serialNo':969,'main':false,'letterLabel':{'vtr':{'x':-0.21431278941346313,'y':0.3824704188304083,'z':-0.8987693847776039},'orthogVtr':{'x':-0.06050745928288205,'y':0.9131833216036558,'z':0.40303234177426106},'minZoom':0.5}},{'longitude':100.48541666666667,'latitude':9.878333333333334,'magnitude':4.66,'b_v':-0.23,'letter':'S','constell':'Mon','desigNo':'15','bsNo':'2456','serialNo':970,'main':false,'letterLabel':{'vtr':{'x':-0.5616816235080009,'y':-0.8262675972058084,'z':-0.04237465777037262},'orthogVtr':{'x':0.8076941606384859,'y':-0.5365167313818588,'z':-0.2444993656797862},'minZoom':0.5}},{'longitude':131.07416666666666,'latitude':21.404444444444444,'magnitude':4.66,'b_v':0.01,'letter':'gamma','constell':'Cnc','desigNo':'43','bsNo':'3449','serialNo':971,'main':false,'letterLabel':{'vtr':{'x':-0.3163294077147131,'y':0.7003605193752458,'z':0.6398678369126665},'orthogVtr':{'x':-0.7250770566973808,'y':-0.6134389670918889,'z':0.3129790656007192},'minZoom':0.5}},{'longitude':270.20916666666665,'latitude':16.75111111111111,'magnitude':4.67,'b_v':1.25,'constell':'Her','desigNo':'93','bsNo':'6713','serialNo':972,'main':false,'letterLabel':{'vtr':{'x':-0.4441715647870044,'y':-0.8574738735509928,'z':0.25971171943545374},'orthogVtr':{'x':-0.8959349311910701,'y':0.4262285342787116,'z':-0.12501934105678802},'minZoom':0.5}},{'longitude':315.59,'latitude':-32.18833333333333,'magnitude':4.67,'b_v':0.89,'letter':'gamma','constell':'Mic','desigNo':'','bsNo':'8039','serialNo':973,'main':false,'letterLabel':{'vtr':{'x':-0.702144118174886,'y':-0.005270034152017655,'z':0.7120153538038687},'orthogVtr':{'x':0.37617231812554597,'y':0.8462852450176468,'z':0.37722098449247854},'minZoom':0.5}},{'longitude':277.54875,'latitude':-14.553333333333335,'magnitude':4.67,'b_v':0.08,'letter':'gamma','constell':'Sct','desigNo':'','bsNo':'6930','serialNo':974,'main':false,'letterLabel':{'vtr':{'x':-0.892266355879528,'y':-0.4515094131526691,'z':0},'orthogVtr':{'x':-0.4332348744190034,'y':0.8561524773948865,'z':0.2816211622690111},'minZoom':0.5}},{'longitude':293.0808333333333,'latitude':69.69083333333333,'magnitude':4.67,'b_v':0.79,'letter':'sigma','constell':'Dra','desigNo':'61','bsNo':'7462','main':false,'serialNo':975,'letterLabel':{'vtr':{'x':-0.5071582136857359,'y':-0.2109277454624594,'z':0.835643484079914},'orthogVtr':{'x':-0.8510441240610754,'y':0.27564101356643256,'z':-0.4469294469389845},'minZoom':0.5}},{'longitude':28.845416666666665,'latitude':-67.56166666666667,'magnitude':4.68,'b_v':0.93,'letter':'eta^2','constell':'Hyi','desigNo':'','bsNo':'570','serialNo':976,'main':false,'letterLabel':{'vtr':{'x':0.7554773586198953,'y':0.14602182334550745,'z':0.6386952228720358},'orthogVtr':{'x':0.5634509658140812,'y':0.3526528134240491,'z':-0.7471003964041794},'minZoom':0.5}},{'longitude':159.92541666666668,'latitude':31.884722222222223,'magnitude':4.68,'b_v':0.82,'constell':'LMi','desigNo':'37','bsNo':'4166','serialNo':977,'main':false,'letterLabel':{'vtr':{'x':0.49335840122670005,'y':0.2930073926491281,'z':-0.818989716536169},'orthogVtr':{'x':0.34720255414593953,'y':0.7969559677731497,'z':0.49427884015533063},'minZoom':0.5}},{'longitude':144.84166666666667,'latitude':4.569444444444445,'magnitude':4.68,'b_v':1.31,'constell':'','desigNo':'','bsNo':'3834','serialNo':978,'main':false,'letterLabel':{'vtr':{'x':0.2347925076664519,'y':-0.8601744179518362,'z':-0.45273883094441864},'orthogVtr':{'x':0.5298151686890878,'y':0.503739105413027,'z':-0.6823069695559593},'minZoom':1.8}},{'longitude':324.67041666666665,'latitude':-7.775,'magnitude':4.68,'b_v':0.18,'letter':'xi','constell':'Aqr','desigNo':'23','bsNo':'8264','serialNo':979,'main':false,'letterLabel':{'vtr':{'x':0.23298236829382363,'y':-0.8202741279775511,'z':-0.5223691903576143},'orthogVtr':{'x':-0.5406543714093334,'y':-0.5557416606566367,'z':0.6315410178971613},'minZoom':0.5}},{'longitude':245.75458333333333,'latitude':-78.7363888888889,'magnitude':4.68,'b_v':1.68,'letter':'delta^1','constell':'Aps','desigNo':'','bsNo':'6020','serialNo':980,'main':false,'letterLabel':{'vtr':{'x':-0.9602028417547407,'y':0.02806649344082212,'z':-0.2778898606139793},'orthogVtr':{'x':-0.2675389017857275,'y':0.19329632072378758,'z':0.9439594633383013},'minZoom':0.5}},{'longitude':31.31875,'latitude':-29.21333333333333,'magnitude':4.68,'b_v':-0.16,'letter':'nu','constell':'For','desigNo':'','bsNo':'612','serialNo':981,'main':false,'letterLabel':{'vtr':{'x':0.6663588987809249,'y':0.545130624598972,'z':0.5087223409088771},'orthogVtr':{'x':0.0009709961992378224,'y':0.6816357684884007,'z':-0.7316910114820385},'minZoom':0.5}},{'longitude':150.28416666666666,'latitude':7.959722222222222,'magnitude':4.68,'b_v':1.59,'letter':'pi','constell':'Leo','desigNo':'29','bsNo':'3950','serialNo':982,'main':false,'letterLabel':{'vtr':{'x':0.2288688174450964,'y':-0.7553494835893629,'z':-0.6140571814111172},'orthogVtr':{'x':0.4558511570238615,'y':0.6405242368664765,'z':-0.6180035797846355},'minZoom':0.5}},{'longitude':80.09375,'latitude':40.11277777777778,'magnitude':4.69,'b_v':0.63,'letter':'lambda','constell':'Aur','desigNo':'15','bsNo':'1729','serialNo':983,'main':false,'letterLabel':{'vtr':{'x':-0.9575952905216013,'y':0.2791128191726244,'z':0.07146533246518931},'orthogVtr':{'x':-0.25632141155326615,'y':-0.7120259933824583,'z':-0.6536958916247406},'minZoom':0.5}},{'longitude':354.0029166666667,'latitude':-42.518055555555556,'magnitude':4.69,'b_v':0.08,'letter':'iota','constell':'Phe','desigNo':'','bsNo':'8949','serialNo':984,'main':false,'letterLabel':{'vtr':{'x':0.6452646029928883,'y':0.7267292964071693,'z':0.2355803936408342},'orthogVtr':{'x':0.21517369928403302,'y':0.12299781604118702,'z':-0.9687991620483177},'minZoom':0.5}},{'longitude':331.1716666666667,'latitude':-56.713055555555556,'magnitude':4.69,'b_v':1.06,'letter':'epsilon','constell':'Ind','desigNo':'','bsNo':'8387','serialNo':985,'main':false,'letterLabel':{'vtr':{'x':-0.4990394540673896,'y':-0.5090569096420685,'z':-0.7012992842073837},'orthogVtr':{'x':-0.7209555431942067,'y':-0.2051292671870121,'z':0.6619252891987628},'minZoom':0.5}},{'longitude':317.79791666666665,'latitude':10.202777777777778,'magnitude':4.7,'b_v':0.26,'letter':'gamma','constell':'Equ','desigNo':'5','bsNo':'8097','serialNo':986,'main':false,'letterLabel':{'vtr':{'x':-0.682608937483114,'y':0.11750651962663491,'z':0.7212747439869288},'orthogVtr':{'x':-0.05007464548654415,'y':0.9771470263672916,'z':-0.206582232394165},'minZoom':0.5}},{'longitude':280.80791666666664,'latitude':-9.034444444444444,'magnitude':4.7,'b_v':0.36,'letter':'delta','constell':'Sct','desigNo':'','bsNo':'7020','serialNo':987,'main':false,'letterLabel':{'vtr':{'x':-0.15014153445806655,'y':-0.9800822885219702,'z':-0.12998548902133256},'orthogVtr':{'x':-0.9711652360361782,'y':0.12157652230436256,'z':0.20507860331875455},'minZoom':0.5}},{'longitude':175.27166666666668,'latitude':-34.84166666666667,'magnitude':4.7,'b_v':-0.07,'letter':'omicron','constell':'Hya','desigNo':'','bsNo':'4494','serialNo':988,'main':false,'letterLabel':{'vtr':{'x':0.5198875398698637,'y':-0.6836684556132275,'z':-0.5121663681729651},'orthogVtr':{'x':-0.24635301585865121,'y':0.4540943422474172,'z':-0.8562175657601476},'minZoom':0.5}},{'longitude':174.39291666666668,'latitude':-9.899166666666666,'magnitude':4.7,'b_v':-0.07,'letter':'theta','constell':'Crt','desigNo':'21','bsNo':'4468','serialNo':989,'main':false,'letterLabel':{'vtr':{'x':-0.17271668428885634,'y':0.9849715462734258,'z':0},'orthogVtr':{'x':-0.09480476574763322,'y':-0.016624200827591685,'z':0.9953570677592943},'minZoom':0.5}},{'longitude':343.5525,'latitude':84.43972222222223,'magnitude':4.7,'b_v':1.42,'constell':'','desigNo':'','bsNo':'8748','serialNo':990,'main':false,'letterLabel':{'vtr':{'x':0.9840161592862565,'y':-0.09600898113735622,'z':0.14998157821709712},'orthogVtr':{'x':-0.15190979082942205,'y':-0.013057944498566681,'z':0.9883081025346466},'minZoom':1.8}},{'longitude':45.16375,'latitude':8.976111111111111,'magnitude':4.71,'b_v':-0.11,'letter':'lambda','constell':'Cet','desigNo':'91','bsNo':'896','serialNo':991,'main':false,'letterLabel':{'vtr':{'x':-0.6363760331342155,'y':-0.3168106405462189,'z':-0.7033182512128165},'orthogVtr':{'x':0.3316405687902747,'y':-0.935568251017586,'z':0.12135312447711703},'minZoom':0.5}},{'longitude':52.42208333333333,'latitude':-62.87638888888889,'magnitude':4.71,'b_v':0.41,'letter':'kappa','constell':'Ret','desigNo':'','bsNo':'1083','serialNo':992,'main':false,'letterLabel':{'vtr':{'x':0.9446542294549034,'y':0.185151606512528,'z':0.2708270100613904},'orthogVtr':{'x':0.17414358741783603,'y':0.4166225834276721,'z':-0.892244156012971},'minZoom':0.5}},{'longitude':73.38125,'latitude':14.278333333333334,'magnitude':4.71,'b_v':1.77,'letter':'omicron^1','constell':'Ori','desigNo':'4','bsNo':'1556','serialNo':993,'main':false,'letterLabel':{'vtr':{'x':0.7017435931205289,'y':0.6082161791867344,'z':0.37098383912211047},'orthogVtr':{'x':-0.6563035358320864,'y':0.7544835724401175,'z':0.0044953055846758405},'minZoom':0.8}},{'longitude':83.46708333333333,'latitude':32.20333333333333,'magnitude':4.71,'b_v':0.28,'letter':'chi','constell':'Aur','desigNo':'25','bsNo':'1843','serialNo':994,'main':false,'letterLabel':{'vtr':{'x':-0.42340357211195234,'y':0.7862935068632445,'z':0.44996881690572726},'orthogVtr':{'x':-0.900811445177448,'y':-0.3126226599492306,'z':-0.30134002841239915},'minZoom':0.5}},{'longitude':176.41291666666666,'latitude':-18.448055555555555,'magnitude':4.71,'b_v':0.96,'letter':'zeta','constell':'Crt','desigNo':'27','bsNo':'4514','serialNo':995,'main':false,'letterLabel':{'vtr':{'x':0.18417366982458494,'y':-0.38109362087921184,'z':-0.9060064632597917},'orthogVtr':{'x':-0.26408297467333947,'y':0.8686946280963562,'z':-0.4190821227447121},'minZoom':0.5}},{'longitude':319.74875,'latitude':-32.098333333333336,'magnitude':4.71,'b_v':0.07,'letter':'epsilon','constell':'Mic','desigNo':'','bsNo':'8135','serialNo':996,'main':false,'letterLabel':{'vtr':{'x':0.6636764583761283,'y':0.03798714933849129,'z':-0.7470545730282725},'orthogVtr':{'x':-0.3761723086277793,'y':-0.846285244474033,'z':-0.37722099518342445},'minZoom':0.5}},{'longitude':140.56708333333333,'latitude':-26.040555555555557,'magnitude':4.71,'b_v':1.63,'letter':'theta','constell':'Pyx','desigNo':'','bsNo':'3718','serialNo':997,'main':false,'letterLabel':{'vtr':{'x':-0.5346164103641037,'y':0.8450948430616534,'z':0},'orthogVtr':{'x':-0.4822902939183792,'y':-0.3051022116689,'z':0.8211630245127145},'minZoom':0.5}},{'longitude':76.45333333333333,'latitude':-57.44916666666666,'magnitude':4.71,'b_v':0.53,'letter':'zeta','constell':'Dor','desigNo':'','bsNo':'1674','serialNo':998,'main':false,'letterLabel':{'vtr':{'x':-0.98900618547343,'y':-0.1478741528979811,'z':0},'orthogVtr':{'x':0.07734984696492099,'y':-0.5173282523992366,'z':0.8522842720853501},'minZoom':0.5}},{'longitude':209.73333333333332,'latitude':-63.77166666666667,'magnitude':4.71,'b_v':1.08,'constell':'','desigNo':'','bsNo':'5241','serialNo':999,'main':false,'letterLabel':{'vtr':{'x':0.9225390501716894,'y':-0.3828677189063378,'z':0.048311600343757595},'orthogVtr':{'x':-0.04058372874012372,'y':-0.22075251329388065,'z':-0.9744851403874681},'minZoom':1.8}},{'longitude':80.66416666666667,'latitude':-0.3663888888888889,'magnitude':4.72,'b_v':-0.17,'constell':'Ori','desigNo':'22','bsNo':'1765','serialNo':1000,'main':false,'letterLabel':{'vtr':{'x':0.7955651737564636,'y':0.5924184532885934,'z':0.12695050416992584},'orthogVtr':{'x':-0.5837477918697194,'y':0.8056050426039771,'z':-0.1011880962281166},'minZoom':0.5}},{'longitude':21.798333333333332,'latitude':68.22055555555556,'magnitude':4.72,'b_v':1.05,'letter':'psi','constell':'Cas','desigNo':'36','bsNo':'399','main':false,'serialNo':1001,'letterLabel':{'vtr':{'x':0.9375606936394704,'y':-0.34782171545531115,'z':0},'orthogVtr':{'x':0.04792299231976763,'y':0.12917742603213955,'z':0.990462810715693},'minZoom':0.5}},{'longitude':92.66,'latitude':-54.973055555555554,'magnitude':4.72,'b_v':-0.23,'letter':'delta','constell':'Pic','desigNo':'','bsNo':'2212','serialNo':1002,'main':false,'letterLabel':{'vtr':{'x':-0.29863786481939514,'y':-0.5408360140419467,'z':0.7863280686910089},'orthogVtr':{'x':0.9539947034821277,'y':-0.19216742281018379,'z':0.23014297151670604},'minZoom':0.5}},{'longitude':199.58125,'latitude':40.48083333333334,'magnitude':4.72,'b_v':0.31,'letter':'AO','constell':'CVn','desigNo':'20','bsNo':'5017','serialNo':1003,'main':false,'letterLabel':{'vtr':{'x':0.6748870497735192,'y':0.7376861469225886,'z':0.018617698206287295},'orthogVtr':{'x':0.17596279007446441,'y':-0.18538275689548275,'z':0.9667834969397442},'minZoom':0.5}},{'longitude':241.93333333333334,'latitude':-45.219166666666666,'magnitude':4.73,'b_v':0.23,'letter':'delta','constell':'Nor','desigNo':'','bsNo':'5980','serialNo':1004,'main':false,'letterLabel':{'vtr':{'x':-0.1930058020654664,'y':-0.5938552335623901,'z':-0.7810792033716076},'orthogVtr':{'x':-0.923531841018435,'y':0.3788282182465498,'z':-0.05981738614520565},'minZoom':0.5}},{'longitude':242.40291666666667,'latitude':36.4475,'magnitude':4.73,'b_v':1.02,'letter':'tau','constell':'CrB','desigNo':'16','bsNo':'6018','main':false,'serialNo':1005,'letterLabel':{'vtr':{'x':0.9239910612945007,'y':0.1664203150160361,'z':0.34430335083734737},'orthogVtr':{'x':-0.08590765647777354,'y':-0.7869981862392954,'z':0.6109449479409388},'minZoom':0.5}},{'longitude':313.39916666666664,'latitude':-8.916666666666666,'magnitude':4.73,'b_v':0.33,'letter':'mu','constell':'Aqr','desigNo':'6','bsNo':'7990','serialNo':1006,'main':false,'letterLabel':{'vtr':{'x':0.7249205430549915,'y':0.29754917997084174,'z':-0.6212525185104169},'orthogVtr':{'x':0.11728916735041896,'y':-0.9420404333943296,'z':-0.31432956124499206},'minZoom':0.5}},{'longitude':354.69666666666666,'latitude':-45.39555555555555,'magnitude':4.74,'b_v':0.08,'constell':'','desigNo':'','bsNo':'8959','serialNo':1007,'main':false,'letterLabel':{'vtr':{'x':-0.6588874570049272,'y':-0.6769703512967624,'z':-0.327991558529664},'orthogVtr':{'x':-0.2774587982336365,'y':-0.1865679929865061,'z':0.9424484066917048},'minZoom':1.8}},{'longitude':52.87166666666667,'latitude':-5.016111111111111,'magnitude':4.74,'b_v':-0.09,'constell':'Eri','desigNo':'17','bsNo':'1070','serialNo':1008,'main':false,'letterLabel':{'vtr':{'x':0.5682457654422962,'y':0.7455924517156155,'z':0.3481215965745254},'orthogVtr':{'x':-0.5617351141938577,'y':0.6606412537214224,'z':-0.49800280658145013},'minZoom':0.5}},{'longitude':293.10583333333335,'latitude':34.49111111111111,'magnitude':4.74,'b_v':-0.15,'constell':'Cyg','desigNo':'8','bsNo':'7426','main':false,'serialNo':1009,'letterLabel':{'vtr':{'x':-0.7969906226029884,'y':-0.26884300933829697,'z':0.5408598559819626},'orthogVtr':{'x':-0.510086285836199,'y':0.7791355713193183,'z':-0.3643621035546246},'minZoom':0.5}},{'longitude':199.83083333333335,'latitude':-18.408055555555553,'magnitude':4.74,'b_v':0.71,'constell':'Vir','desigNo':'61','bsNo':'5019','serialNo':1010,'main':false,'letterLabel':{'vtr':{'x':-0.45088908047345216,'y':0.6166576672346197,'z':-0.6453157045590646},'orthogVtr':{'x':-0.00528613056012836,'y':0.7211204967171535,'z':0.6927894961949894},'minZoom':0.5}},{'longitude':136.02458333333334,'latitude':67.55972222222222,'magnitude':4.74,'b_v':1.54,'letter':'rho','constell':'UMa','desigNo':'8','bsNo':'3576','serialNo':1011,'main':false,'letterLabel':{'vtr':{'x':-0.5140860045328828,'y':-0.3741247827462597,'z':-0.7718459865015047},'orthogVtr':{'x':0.8125609694241855,'y':0.07576920748019025,'z':-0.5779305305711508},'minZoom':0.5}},{'longitude':38.229166666666664,'latitude':-15.168888888888889,'magnitude':4.74,'b_v':0.45,'letter':'sigma','constell':'Cet','desigNo':'76','bsNo':'740','serialNo':1012,'main':false,'letterLabel':{'vtr':{'x':0.025429303345254395,'y':-0.9033872125880464,'z':0.42807113271485014},'orthogVtr':{'x':0.6515577563317089,'y':0.3397394535844528,'z':0.6782695583926256},'minZoom':0.5}},{'longitude':315.10541666666666,'latitude':47.59,'magnitude':4.74,'b_v':-0.08,'letter':'v832','constell':'Cyg','desigNo':'59','bsNo':'8047','main':false,'serialNo':1013,'letterLabel':{'vtr':{'x':-0.2502336429940887,'y':0.6337945491190409,'z':-0.731906820176516},'orthogVtr':{'x':0.842091137818334,'y':-0.23056885475416877,'z':-0.48756591228794366},'minZoom':0.5}},{'longitude':20.108333333333334,'latitude':27.355555555555558,'magnitude':4.74,'b_v':0.03,'letter':'upsilon','constell':'Psc','desigNo':'90','bsNo':'383','serialNo':1014,'main':false,'letterLabel':{'vtr':{'x':0.19543307122540685,'y':-0.763634028382951,'z':-0.6153608578444288},'orthogVtr':{'x':0.5159409112290222,'y':-0.4535556663973248,'z':0.7266995483685433},'minZoom':0.5}},{'longitude':235.73958333333334,'latitude':-19.734444444444446,'magnitude':4.75,'b_v':1.57,'letter':'kappa','constell':'Lib','desigNo':'43','bsNo':'5838','serialNo':1015,'main':false,'letterLabel':{'vtr':{'x':-0.8121129724186266,'y':-0.06222584159545591,'z':-0.5801727886303529},'orthogVtr':{'x':-0.2443101686550877,'y':0.9392086413166545,'z':0.24124607679265295},'minZoom':0.5}},{'longitude':214.19625,'latitude':51.286944444444444,'magnitude':4.75,'b_v':0.24,'letter':'iota','constell':'Boo','desigNo':'21','bsNo':'5350','serialNo':1016,'main':false,'letterLabel':{'vtr':{'x':-0.7482592605235807,'y':-0.21303941413526883,'z':-0.6282692791037976},'orthogVtr':{'x':0.41534659468030855,'y':0.5880178342620077,'z':-0.694062124652606},'minZoom':0.5}},{'longitude':95.19291666666666,'latitude':69.31083333333333,'magnitude':4.76,'b_v':0.03,'constell':'','desigNo':'','bsNo':'2209','serialNo':1017,'main':false,'letterLabel':{'vtr':{'x':0.7625272694486959,'y':0.2504187051032836,'z':0.5965254692647339},'orthogVtr':{'x':-0.6461653403501555,'y':0.24921862902535383,'z':0.7213601235699763},'minZoom':1.8}},{'longitude':42.958333333333336,'latitude':-20.93277777777778,'magnitude':4.76,'b_v':0.91,'letter':'tau^2','constell':'Eri','desigNo':'2','bsNo':'850','serialNo':1018,'main':false,'letterLabel':{'vtr':{'x':-0.05537810821032857,'y':-0.8948873689627453,'z':0.44284293152536647},'orthogVtr':{'x':0.7278021500685081,'y':0.267456618590845,'z':0.6314831648805913},'minZoom':0.5}},{'longitude':324.5975,'latitude':62.16138888888889,'magnitude':4.76,'b_v':0.25,'letter':'v337','constell':'Cep','desigNo':'9','bsNo':'8279','main':false,'serialNo':1019,'letterLabel':{'vtr':{'x':-0.7512846170212973,'y':0.12514645500051347,'z':0.6480044668271719},'orthogVtr':{'x':-0.5391526508132024,'y':0.44990127368367816,'z':-0.7119713920228127},'minZoom':2.2}},{'longitude':119.59166666666667,'latitude':-30.3825,'magnitude':4.76,'b_v':0.15,'constell':'','desigNo':'','bsNo':'3113','serialNo':1020,'main':false,'letterLabel':{'vtr':{'x':-0.7707451905823178,'y':-0.23133007811341427,'z':0.5936650959541653},'orthogVtr':{'x':0.4737898729435969,'y':-0.8310732806902028,'z':0.2912736830180751},'minZoom':1.8}},{'longitude':8.06375,'latitude':-48.706944444444446,'magnitude':4.76,'b_v':0.02,'letter':'lambda^1','constell':'Phe','desigNo':'','bsNo':'125','serialNo':1021,'main':false,'letterLabel':{'vtr':{'x':-0.7189277517087856,'y':-0.654150227800157,'z':0.23501141949265603},'orthogVtr':{'x':0.2371283835486704,'y':0.08700281108544132,'z':0.9675746175767663},'minZoom':0.5}},{'longitude':170.02,'latitude':38.089444444444446,'magnitude':4.76,'b_v':0.11,'constell':'UMa','desigNo':'55','bsNo':'4380','serialNo':1022,'main':false,'letterLabel':{'vtr':{'x':0.24900017994934426,'y':0.4967105167754195,'z':0.8314310391787704},'orthogVtr':{'x':-0.5806530517914295,'y':-0.610511502352211,'z':0.5386257874823169},'minZoom':0.5}},{'longitude':193.81625,'latitude':-9.63361111111111,'magnitude':4.77,'b_v':1.59,'letter':'psi','constell':'Vir','desigNo':'40','bsNo':'4902','serialNo':1023,'main':false,'letterLabel':{'vtr':{'x':0.2824472842659712,'y':-0.371606183594738,'z':0.8843824828234284},'orthogVtr':{'x':0.060507461105801255,'y':-0.9131833240048121,'z':-0.4030323360600889},'minZoom':0.5}},{'longitude':264.2129166666667,'latitude':68.74972222222222,'magnitude':4.77,'b_v':0.43,'letter':'omega','constell':'Dra','desigNo':'28','bsNo':'6596','main':true,'serialNo':1024,'letterLabel':{'vtr':{'x':0.7040658394598478,'y':0.28008716635559905,'z':-0.6525660678801734},'orthogVtr':{'x':0.709193695232685,'y':-0.2300343152855962,'z':0.6664296785357752},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.2750364569951854,'y':0.33752080427097153,'z':-0.9002414420630792},'orthogVtr':{'x':0.9607389608918889,'y':0.1320769232314966,'z':-0.2440006872409898},'minZoom':0.5}},{'longitude':304.60791666666665,'latitude':38.088055555555556,'magnitude':4.77,'b_v':0.38,'letter':'P','constell':'Cyg','desigNo':'34','bsNo':'7763','main':false,'serialNo':1025,'letterLabel':{'vtr':{'x':0.8943507710381602,'y':-0.32248498283471005,'z':-0.3100647258066374},'orthogVtr':{'x':-0.017635243440478204,'y':-0.7179642097712962,'z':0.6958565884406596},'minZoom':0.5}},{'longitude':199.62208333333334,'latitude':5.378055555555555,'magnitude':4.78,'b_v':1.64,'letter':'sigma','constell':'Vir','desigNo':'60','bsNo':'5015','serialNo':1026,'main':false,'letterLabel':{'vtr':{'x':-0.2726671893220645,'y':0.39738371718995114,'z':-0.8762070446986274},'orthogVtr':{'x':0.21498408671160885,'y':0.9128534549129175,'z':0.34710288433593517},'minZoom':0.5}},{'longitude':13.475833333333334,'latitude':-1.0494444444444446,'magnitude':4.78,'b_v':1.55,'constell':'Cet','desigNo':'20','bsNo':'248','serialNo':1027,'main':false,'letterLabel':{'vtr':{'x':-0.018833580882044763,'y':-0.9998226323859445,'z':0},'orthogVtr':{'x':0.2329547944035178,'y':-0.0043881512781810865,'z':0.9724776644698708},'minZoom':0.5}},{'longitude':146.24583333333334,'latitude':-27.85027777777778,'magnitude':4.78,'b_v':0.52,'letter':'theta','constell':'Ant','desigNo':'','bsNo':'3871','serialNo':1028,'main':false,'letterLabel':{'vtr':{'x':-0.5363485522190796,'y':0.8439965820620942,'z':0},'orthogVtr':{'x':-0.41463252836117587,'y':-0.26349343233844014,'z':0.8710057850205858},'minZoom':0.5}},{'longitude':0.6179166666666667,'latitude':-76.96916666666667,'magnitude':4.78,'b_v':1.25,'letter':'theta','constell':'Oct','desigNo':'','bsNo':'9084','serialNo':1029,'main':false,'letterLabel':{'vtr':{'x':0.12709626626816942,'y':0.026938073907425593,'z':0.9915245227803741},'orthogVtr':{'x':0.965926140239866,'y':0.2238604112245832,'z':-0.12989691254096636},'minZoom':0.5}},{'longitude':122.44166666666666,'latitude':51.45472222222222,'magnitude':4.78,'b_v':0.05,'constell':'Lyn','desigNo':'27','bsNo':'3173','serialNo':1030,'main':false,'letterLabel':{'vtr':{'x':-0.0742067854257622,'y':0.53440950634026,'z':0.8419618949393937},'orthogVtr':{'x':-0.9395500852587866,'y':-0.32047009978915003,'z':0.12060079780556736},'minZoom':0.5}},{'longitude':185.84583333333333,'latitude':25.749166666666667,'magnitude':4.78,'b_v':0.52,'constell':'Com','desigNo':'12','bsNo':'4707','serialNo':1031,'main':false,'letterLabel':{'vtr':{'x':-0.368299191000881,'y':-0.6117922787278839,'z':-0.7000470795575394},'orthogVtr':{'x':0.2479979580497269,'y':0.661043802217604,'z':-0.708179429490055},'minZoom':0.5}},{'longitude':3.8779166666666667,'latitude':20.30388888888889,'magnitude':4.79,'b_v':1.57,'letter':'chi','constell':'Peg','desigNo':'89','bsNo':'45','serialNo':1032,'main':false,'letterLabel':{'vtr':{'x':0.34769944254833673,'y':-0.9376060460830956,'z':0},'orthogVtr':{'x':0.05947098312800644,'y':0.022054068196118246,'z':0.9979863827937681},'minZoom':0.5}},{'longitude':237.97291666666666,'latitude':35.60388888888889,'magnitude':4.79,'b_v':1,'letter':'kappa','constell':'CrB','desigNo':'11','bsNo':'5901','main':false,'serialNo':1033,'letterLabel':{'vtr':{'x':-0.8981655492883389,'y':-0.20421177159160409,'z':-0.3893535647904033},'orthogVtr':{'x':0.08590765837749925,'y':0.7869981865814454,'z':-0.610944947233064},'minZoom':0.5}},{'longitude':199.11416666666668,'latitude':-67.98666666666666,'magnitude':4.79,'b_v':-0.08,'letter':'eta','constell':'Mus','desigNo':'','bsNo':'4993','serialNo':1034,'main':false,'letterLabel':{'vtr':{'x':-0.09979798451715086,'y':0.1679599946424467,'z':0.9807292197574333},'orthogVtr':{'x':0.9298455421617856,'y':-0.3350839198216441,'z':0.15200669195406327},'minZoom':0.5}},{'longitude':332.535,'latitude':72.42750000000001,'magnitude':4.79,'b_v':0.92,'constell':'Cep','desigNo':'24','bsNo':'8468','main':false,'serialNo':1035,'letterLabel':{'vtr':{'x':0.9622968900959086,'y':-0.2576826277743688,'z':-0.08708822340040547},'orthogVtr':{'x':0.047143552109159104,'y':-0.15732366259079458,'z':0.9864211832090534},'minZoom':0.5}},{'longitude':49.17125,'latitude':-8.755555555555556,'magnitude':4.8,'b_v':0.23,'letter':'zeta','constell':'Eri','desigNo':'13','bsNo':'984','serialNo':1036,'main':false,'letterLabel':{'vtr':{'x':0.7629103169070305,'y':0.15506713726598337,'z':0.6276320827498758},'orthogVtr':{'x':-0.020429208815359562,'y':0.9761062913897653,'z':-0.2163311242898182},'minZoom':0.5}},{'longitude':214.68416666666667,'latitude':35.42944444444444,'magnitude':4.8,'b_v':1.06,'constell':'','desigNo':'','bsNo':'5361','serialNo':1037,'main':false,'letterLabel':{'vtr':{'x':-0.6820678268424878,'y':-0.23424424159327312,'z':-0.6927576162459409},'orthogVtr':{'x':0.2929770066362313,'y':0.7804342089525369,'z':-0.5523467380903969},'minZoom':1.8}},{'longitude':188.93041666666667,'latitude':22.533055555555556,'magnitude':4.8,'b_v':0.01,'constell':'Com','desigNo':'23','bsNo':'4789','serialNo':1038,'main':false,'letterLabel':{'vtr':{'x':0.08583423455245726,'y':-0.1633569977205105,'z':0.9828260148543765},'orthogVtr':{'x':-0.4000578078914616,'y':-0.909098287712784,'z':-0.11616390843443011},'minZoom':0.5}},{'longitude':336.5425,'latitude':1.4666666666666668,'magnitude':4.8,'b_v':-0.17,'letter':'pi','constell':'Aqr','desigNo':'52','bsNo':'8539','serialNo':1039,'main':false,'letterLabel':{'vtr':{'x':-0.20936327770180418,'y':0.8802308746135565,'z':0.4258645621873348},'orthogVtr':{'x':0.33937742077110084,'y':0.47385491932940993,'z':-0.8125789079825253},'minZoom':0.5}},{'longitude':320.4683333333333,'latitude':-40.73444444444444,'magnitude':4.8,'b_v':0.03,'letter':'theta^1','constell':'Mic','desigNo':'','bsNo':'8151','serialNo':1040,'main':false,'letterLabel':{'vtr':{'x':0.28704439390585357,'y':-0.3896920292417596,'z':-0.875068933440481},'orthogVtr':{'x':-0.7589807288340771,'y':-0.6498563922267857,'z':0.04043417787564613},'minZoom':0.5}},{'longitude':221.04791666666668,'latitude':26.454166666666666,'magnitude':4.8,'b_v':1.67,'letter':'W','constell':'Boo','desigNo':'34','bsNo':'5490','serialNo':1041,'main':false,'letterLabel':{'vtr':{'x':-0.6235601914706275,'y':-0.7705003818655366,'z':-0.13229455452956848},'orthogVtr':{'x':-0.39406441437859524,'y':0.4559332739423231,'z':-0.798021357504102},'minZoom':0.5}},{'longitude':212.20125,'latitude':77.46527777777779,'magnitude':4.8,'b_v':1.37,'constell':'UMi','desigNo':'4','bsNo':'5321','main':false,'serialNo':1042,'letterLabel':{'vtr':{'x':0.3828835849090983,'y':0.17939927963247687,'z':-0.9062097212425531},'orthogVtr':{'x':0.9053582934947672,'y':0.12214111358539835,'z':0.40670371128422467},'minZoom':0.5}},{'longitude':78.43708333333333,'latitude':-67.16555555555556,'magnitude':4.81,'b_v':1.27,'letter':'theta','constell':'Dor','desigNo':'','bsNo':'1744','serialNo':1043,'main':false,'letterLabel':{'vtr':{'x':0.8461570558703808,'y':-0.1406380981825514,'z':0.5140419848031526},'orthogVtr':{'x':0.5272262745259779,'y':0.3616891298361683,'z':-0.768904043953349},'minZoom':0.5}},{'longitude':309.82625,'latitude':21.263333333333332,'magnitude':4.81,'b_v':-0.03,'constell':'Vul','desigNo':'29','bsNo':'7891','serialNo':1044,'main':false,'letterLabel':{'vtr':{'x':-0.6564210779831734,'y':0.7336562657371116,'z':0.17566972455174287},'orthogVtr':{'x':0.46137623886808404,'y':0.5746563279461182,'z':-0.6759453165452247},'minZoom':0.5}},{'longitude':312.38375,'latitude':46.17972222222222,'magnitude':4.81,'b_v':0.57,'letter':'v1661','constell':'Cyg','desigNo':'55','bsNo':'7977','main':false,'serialNo':1045,'letterLabel':{'vtr':{'x':-0.6964760537131418,'y':0.6562686010923634,'z':-0.29022858202534324},'orthogVtr':{'x':0.545044922179999,'y':0.22074262188303775,'z':-0.8088255236390611},'minZoom':0.5}},{'longitude':79.52916666666667,'latitude':-34.87888888888889,'magnitude':4.81,'b_v':0.99,'letter':'omicron','constell':'Col','desigNo':'','bsNo':'1743','serialNo':1046,'main':false,'letterLabel':{'vtr':{'x':0.9822016884917026,'y':0.17990012078894896,'z':0.053998052410893504},'orthogVtr':{'x':-0.11424726918496517,'y':0.8003941496320588,'z':-0.5884868449834297},'minZoom':0.5}},{'longitude':217.27625,'latitude':-2.3055555555555554,'magnitude':4.81,'b_v':0.69,'letter':'phi','constell':'Vir','desigNo':'105','bsNo':'5409','serialNo':1047,'main':false,'letterLabel':{'vtr':{'x':-0.050532346856862614,'y':0.9987224248614515,'z':0},'orthogVtr':{'x':0.6043951827810484,'y':0.030580575998527027,'z':0.7960975388748929},'minZoom':0.5}},{'longitude':157.93375,'latitude':55.890277777777776,'magnitude':4.82,'b_v':0.54,'constell':'UMa','desigNo':'36','bsNo':'4112','serialNo':1048,'main':false,'letterLabel':{'vtr':{'x':-0.4712131691779018,'y':-0.4834798798954967,'z':-0.7377027551321428},'orthogVtr':{'x':0.7126482426797439,'y':0.28411414708162175,'z':-0.6414137772402115},'minZoom':0.5}},{'longitude':255.49583333333334,'latitude':-4.2475000000000005,'magnitude':4.82,'b_v':1.48,'constell':'Oph','desigNo':'30','bsNo':'6318','serialNo':1049,'main':false,'letterLabel':{'vtr':{'x':-0.2843045146975537,'y':0.9587340313781444,'z':0},'orthogVtr':{'x':0.9256293120445322,'y':0.2744875885675694,'z':0.2605128411543794},'minZoom':0.5}},{'longitude':245.74,'latitude':0.9891666666666666,'magnitude':4.82,'b_v':0.34,'letter':'sigma','constell':'Ser','desigNo':'50','bsNo':'6093','serialNo':1050,'main':false,'letterLabel':{'vtr':{'x':-0.839106216565976,'y':-0.39816783891683283,'z':-0.3706253220877289},'orthogVtr':{'x':-0.3565534410940143,'y':0.9171501232279702,'z':-0.17805980766848117},'minZoom':0.5}},{'longitude':78.65708333333333,'latitude':38.50361111111111,'magnitude':4.82,'b_v':0.19,'letter':'mu','constell':'Aur','desigNo':'11','bsNo':'1689','serialNo':1051,'main':false,'letterLabel':{'vtr':{'x':0.28748203664994665,'y':-0.7711583826705317,'z':-0.5680394594045108},'orthogVtr':{'x':0.9453379838219698,'y':0.13314978288972323,'z':0.297669668693055},'minZoom':0.5}},{'longitude':155.77,'latitude':-41.73833333333334,'magnitude':4.82,'b_v':1.1,'constell':'','desigNo':'','bsNo':'4080','serialNo':1052,'main':false,'letterLabel':{'vtr':{'x':-0.486291627727713,'y':0.097616228596935,'z':0.8683268536193283},'orthogVtr':{'x':0.5481772102095338,'y':-0.7397803639833624,'z':0.3901624780415675},'minZoom':1.8}},{'longitude':335.595,'latitude':12.293888888888889,'magnitude':4.82,'b_v':-0.13,'letter':'IN','constell':'Peg','desigNo':'31','bsNo':'8520','serialNo':1053,'main':false,'letterLabel':{'vtr':{'x':-0.44951005764647706,'y':0.25548529536535747,'z':0.8559602630535702},'orthogVtr':{'x':-0.0791146599160061,'y':0.9430746036919837,'z':-0.3230343053881161},'minZoom':0.5}},{'longitude':212.79916666666668,'latitude':25.009444444444444,'magnitude':4.82,'b_v':0.54,'constell':'Boo','desigNo':'12','bsNo':'5304','serialNo':1054,'main':false,'letterLabel':{'vtr':{'x':0.23604798765675,'y':0.8867675493217211,'z':-0.39739735906664986},'orthogVtr':{'x':0.6033258553452967,'y':0.18684439689025403,'z':0.7752980611497642},'minZoom':0.5}},{'longitude':337.8929166666667,'latitude':-10.587777777777779,'magnitude':4.82,'b_v':-0.05,'letter':'sigma','constell':'Aqr','desigNo':'57','bsNo':'8573','serialNo':1055,'main':false,'letterLabel':{'vtr':{'x':0.17875052295912697,'y':-0.6320821270241553,'z':-0.754002941133825},'orthogVtr':{'x':-0.37236883118587627,'y':-0.7528022209811793,'z':0.5427985534681061},'minZoom':0.5}},{'longitude':283.5445833333333,'latitude':71.32027777777778,'magnitude':4.82,'b_v':1.15,'letter':'upsilon','constell':'Dra','desigNo':'52','bsNo':'7180','main':false,'serialNo':1056,'letterLabel':{'vtr':{'x':0.45587485494145513,'y':-0.310286753615815,'z':0.8342063576613798},'orthogVtr':{'x':-0.8868774815825201,'y':-0.07937229352938346,'z':0.45513555308471826},'minZoom':0.5}},{'longitude':281.695,'latitude':26.681944444444447,'magnitude':4.83,'b_v':1.2,'constell':'','desigNo':'','bsNo':'7064','serialNo':1057,'main':false,'letterLabel':{'vtr':{'x':0.9783796666326833,'y':0.008059427694718901,'z':-0.2066598014732263},'orthogVtr':{'x':0.09984969966612879,'y':-0.8934765888731897,'z':0.4378694127386765},'minZoom':1.8}},{'longitude':125.51833333333333,'latitude':-33.11083333333333,'magnitude':4.83,'b_v':1.42,'constell':'','desigNo':'','bsNo':'3282','serialNo':1058,'main':false,'letterLabel':{'vtr':{'x':-0.24776352718061012,'y':0.8346465309029363,'z':-0.49191300353895595},'orthogVtr':{'x':-0.8377412355661475,'y':0.07046136578979337,'z':0.5415023713365817},'minZoom':1.8}},{'longitude':22.17791666666667,'latitude':45.49638888888889,'magnitude':4.83,'b_v':0.42,'letter':'omega','constell':'And','desigNo':'48','bsNo':'417','serialNo':1059,'main':false,'letterLabel':{'vtr':{'x':-0.2459149470298759,'y':-0.1324252115871041,'z':-0.9602027922076691},'orthogVtr':{'x':0.7198622239265116,'y':-0.6883315889642436,'z':-0.08943155034738437},'minZoom':1.3}},{'longitude':50.07041666666667,'latitude':3.4333333333333336,'magnitude':4.84,'b_v':0.68,'letter':'kappa','constell':'Cet','desigNo':'96','bsNo':'996','serialNo':1060,'main':false,'letterLabel':{'vtr':{'x':-0.7491590858592406,'y':-0.1695677985131317,'z':-0.6403182222785456},'orthogVtr':{'x':0.16814375554979313,'y':-0.9836972578272758,'z':0.06377603321554148},'minZoom':0.8}},{'longitude':165.36583333333334,'latitude':3.5233333333333334,'magnitude':4.84,'b_v':1.14,'constell':'Leo','desigNo':'58','bsNo':'4291','serialNo':1061,'main':false,'letterLabel':{'vtr':{'x':0.07259011428958306,'y':-0.8688415382899762,'z':-0.4897397846298919},'orthogVtr':{'x':0.2491917303039967,'y':0.4912612971321998,'z':-0.8346051877912626},'minZoom':0.5}},{'longitude':251.40791666666667,'latitude':56.75111111111111,'magnitude':4.84,'b_v':0.38,'constell':'','desigNo':'','bsNo':'6237','serialNo':1062,'main':false,'letterLabel':{'vtr':{'x':-0.34421514098002737,'y':-0.5463935067566199,'z':0.7635247687497135},'orthogVtr':{'x':-0.9224742325351274,'y':0.04540723874807259,'z':-0.38337902000240354},'minZoom':1.8}},{'longitude':275.43541666666664,'latitude':3.386388888888889,'magnitude':4.85,'b_v':0.91,'constell':'Oph','desigNo':'74','bsNo':'6866','serialNo':1063,'main':false,'letterLabel':{'vtr':{'x':0.818757680311871,'y':0.5632311917636847,'z':-0.11138440445045912},'orthogVtr':{'x':0.566299029202682,'y':-0.824185325356347,'z':-0.004894792268567295},'minZoom':0.5}},{'longitude':284.96458333333334,'latitude':-52.913888888888884,'magnitude':4.85,'b_v':-0.05,'letter':'lambda','constell':'Tel','desigNo':'','bsNo':'7134','serialNo':1064,'main':false,'letterLabel':{'vtr':{'x':-0.9814774223608456,'y':-0.19157784160990696,'z':0},'orthogVtr':{'x':-0.11160630916296568,'y':0.5717731848107983,'z':0.8127850004068342},'minZoom':0.5}},{'longitude':263.1533333333333,'latitude':55.16166666666666,'magnitude':4.86,'b_v':0.28,'letter':'nu^2','constell':'Dra','desigNo':'25','bsNo':'6555','main':false,'serialNo':1065,'letterLabel':{'vtr':{'x':0.7280319975211418,'y':-0.3478285137579807,'z':0.5907493001284816},'orthogVtr':{'x':-0.6821521521662233,'y':-0.4531628173600139,'z':0.573857039912664},'minZoom':0.5}},{'longitude':266.12,'latitude':-21.690277777777776,'magnitude':4.86,'b_v':0.47,'constell':'Oph','desigNo':'58','bsNo':'6595','serialNo':1066,'main':false,'letterLabel':{'vtr':{'x':0.8139532928972556,'y':0.5185318433268064,'z':0.26192511227031817},'orthogVtr':{'x':0.5775176707584095,'y':-0.7710568269057851,'z':-0.2682251100172454},'minZoom':0.5}},{'longitude':249.80583333333334,'latitude':48.89472222222222,'magnitude':4.86,'b_v':1.56,'constell':'Her','desigNo':'42','bsNo':'6200','serialNo':1067,'main':false,'letterLabel':{'vtr':{'x':0.9023162943360982,'y':0.4011017627260812,'z':-0.15793252012679992},'orthogVtr':{'x':0.3664945559031209,'y':-0.5209134795840517,'z':0.7709285876662051},'minZoom':0.5}},{'longitude':159.13291666666666,'latitude':75.62194444444444,'magnitude':4.86,'b_v':0.96,'constell':'','desigNo':'','bsNo':'4126','serialNo':1068,'main':false,'letterLabel':{'vtr':{'x':-0.00023323961660358383,'y':-0.0909886273056391,'z':-0.9958519043011952},'orthogVtr':{'x':0.9727082490097764,'y':0.23104836124412392,'z':-0.021338160059851122},'minZoom':1.8}},{'longitude':296.84541666666667,'latitude':-19.717777777777776,'magnitude':4.87,'b_v':1.06,'constell':'Sgr','desigNo':'56','bsNo':'7515','serialNo':1069,'main':false,'letterLabel':{'vtr':{'x':0.23435805206469834,'y':-0.8552634894526085,'z':-0.4621695219741216},'orthogVtr':{'x':-0.8742772088023598,'y':-0.3933117482518984,'z':0.284508753566196},'minZoom':0.5}},{'longitude':48.977916666666665,'latitude':21.108055555555556,'magnitude':4.87,'b_v':-0.01,'letter':'zeta','constell':'Ari','desigNo':'58','bsNo':'972','serialNo':1070,'main':false,'letterLabel':{'vtr':{'x':0.22031007272420755,'y':0.7772537429048255,'z':0.5893556574740705},'orthogVtr':{'x':-0.7593017040646749,'y':0.5159306750283871,'z':-0.3965809637000166},'minZoom':0.5}},{'longitude':20.844583333333333,'latitude':45.62,'magnitude':4.87,'b_v':1.08,'letter':'xi','constell':'And','desigNo':'46','bsNo':'390','serialNo':1071,'main':false,'letterLabel':{'vtr':{'x':0.39708650939406126,'y':-0.04393197628100895,'z':0.9167291233059444},'orthogVtr':{'x':-0.6442681751773827,'y':0.698032796367045,'z':0.31251997320108926},'minZoom':0.5}},{'longitude':39.19875,'latitude':5.6688888888888895,'magnitude':4.87,'b_v':0.88,'letter':'nu','constell':'Cet','desigNo':'78','bsNo':'754','serialNo':1072,'main':false,'letterLabel':{'vtr':{'x':0.2019655029182913,'y':-0.9748191652344939,'z':0.09453851449270077},'orthogVtr':{'x':0.6037462188776865,'y':0.1999255350856966,'z':0.7716996071086177},'minZoom':0.5}},{'longitude':289.6641666666667,'latitude':-18.92027777777778,'magnitude':4.88,'b_v':1.01,'constell':'Sgr','desigNo':'43','bsNo':'7304','serialNo':1073,'main':false,'letterLabel':{'vtr':{'x':-0.2310845078418795,'y':-0.9378789621260379,'z':-0.2588107467568958},'orthogVtr':{'x':-0.9193851404081917,'y':0.123464744997297,'z':0.3734801471823658},'minZoom':2}},{'longitude':294.1275,'latitude':-48.05972222222222,'magnitude':4.88,'b_v':1.1,'letter':'iota','constell':'Tel','desigNo':'','bsNo':'7424','serialNo':1074,'main':false,'letterLabel':{'vtr':{'x':-0.9386882553649968,'y':-0.3447671086977678,'z':0},'orthogVtr':{'x':-0.21029649027857494,'y':0.5725686719785854,'z':0.7924269695342231},'minZoom':0.5}},{'longitude':281.11833333333334,'latitude':-8.256666666666666,'magnitude':4.88,'b_v':1.11,'letter':'epsilon','constell':'Sct','desigNo':'','bsNo':'7032','serialNo':1075,'main':false,'letterLabel':{'vtr':{'x':0.5834062350867585,'y':0.8121621801317338,'z':0.005455091709837639},'orthogVtr':{'x':0.7894417964633139,'y':-0.5654815655095141,'z':-0.23877237919341504},'minZoom':0.5}},{'longitude':190.6925,'latitude':10.139444444444443,'magnitude':4.88,'b_v':0.08,'letter':'rho','constell':'Vir','desigNo':'30','bsNo':'4828','serialNo':1076,'main':false,'letterLabel':{'vtr':{'x':0.0996496039360609,'y':0.9258103412797049,'z':-0.3646164675586424},'orthogVtr':{'x':0.23327898279432396,'y':0.334490004527591,'z':0.9130702892207027},'minZoom':0.5}},{'longitude':36.69916666666666,'latitude':-12.212222222222222,'magnitude':4.88,'b_v':-0.03,'letter':'rho','constell':'Cet','desigNo':'72','bsNo':'708','serialNo':1077,'main':false,'letterLabel':{'vtr':{'x':0.5066080076418844,'y':0.7617665191435155,'z':0.4038070045270299},'orthogVtr':{'x':-0.3595215553031776,'y':0.6123442141953862,'z':-0.7041156258838598},'minZoom':0.5}},{'longitude':359.89208333333335,'latitude':-3.458888888888889,'magnitude':4.88,'b_v':0.93,'constell':'Psc','desigNo':'27','bsNo':'9067','serialNo':1078,'main':false,'letterLabel':{'vtr':{'x':0.058526677363218954,'y':0.9597418336891504,'z':-0.2747184753594283},'orthogVtr':{'x':-0.014770027077125183,'y':-0.274327580937844,'z':-0.961522867453984},'minZoom':0.5}},{'longitude':72.77291666666666,'latitude':37.5175,'magnitude':4.89,'b_v':1.45,'constell':'','desigNo':'','bsNo':'1533','serialNo':1079,'main':false,'letterLabel':{'vtr':{'x':0.8488024188596551,'y':-0.5083144190169977,'z':-0.14543350768447644},'orthogVtr':{'x':0.47366075855820855,'y':0.6088767729097991,'z':0.6363289724765102},'minZoom':1.8}},{'longitude':256.5475,'latitude':12.718055555555555,'magnitude':4.89,'b_v':0.13,'constell':'Her','desigNo':'60','bsNo':'6355','serialNo':1080,'main':false,'letterLabel':{'vtr':{'x':-0.7410943368414554,'y':0.5929847933776261,'z':-0.31487810137324235},'orthogVtr':{'x':0.6318871105232332,'y':0.7745330346105619,'z':-0.028587722042058172},'minZoom':0.5}},{'longitude':296.2270833333333,'latitude':37.3975,'magnitude':4.89,'b_v':0.95,'constell':'Cyg','desigNo':'15','bsNo':'7517','main':false,'serialNo':1081,'letterLabel':{'vtr':{'x':-0.37491134039475194,'y':0.7886108950600923,'z':-0.48737495117817675},'orthogVtr':{'x':0.8580088503605765,'y':0.09607055637207018,'z':-0.5045703725956197},'minZoom':0.5}},{'longitude':340.0125,'latitude':39.141666666666666,'magnitude':4.89,'b_v':-0.21,'constell':'Lac','desigNo':'10','bsNo':'8622','serialNo':1082,'main':false,'letterLabel':{'vtr':{'x':-0.6805548238160154,'y':0.7102814439644753,'z':0.17984827533365963},'orthogVtr':{'x':0.07477355573018944,'y':0.3115065584074605,'z':-0.9472975136843775},'minZoom':0.5}},{'longitude':263.1304166666667,'latitude':55.172777777777775,'magnitude':4.89,'b_v':0.25,'letter':'nu^1','constell':'Dra','desigNo':'24','bsNo':'6554','main':true,'serialNo':1083,'letterLabel':{'vtr':{'x':-0.6856527516056362,'y':0.374215947158781,'z':-0.6243738696547736},'orthogVtr':{'x':0.7247165680916854,'y':0.431418357094955,'z':-0.537274694262534},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.6303175719689407,'y':0.4050244556743172,'z':-0.6623103115405213},'orthogVtr':{'x':0.7733262948575783,'y':0.4026345293838778,'z':-0.48974674825839654},'minZoom':0.5}},{'longitude':116.78416666666666,'latitude':18.46611111111111,'magnitude':4.89,'b_v':1.43,'constell':'Gem','desigNo':'81','bsNo':'3003','serialNo':1084,'main':false,'letterLabel':{'vtr':{'x':-0.19888276633467167,'y':-0.9466140062374968,'z':-0.2537076436571525},'orthogVtr':{'x':0.8819016972007452,'y':-0.05996128661273471,'z':-0.4676045771612921},'minZoom':0.5}},{'longitude':247.59291666666667,'latitude':-70.12138888888889,'magnitude':4.9,'b_v':0.56,'letter':'zeta','constell':'TrA','desigNo':'','bsNo':'6098','serialNo':1085,'main':false,'letterLabel':{'vtr':{'x':-0.6904048288989209,'y':-0.14196364450492382,'z':-0.7093571003887474},'orthogVtr':{'x':-0.7117172698849268,'y':0.30897526081711774,'z':0.630866718055835},'minZoom':0.5}},{'longitude':241.61541666666668,'latitude':-19.848333333333333,'magnitude':4.9,'b_v':-0.02,'letter':'beta^2','constell':'Sco','desigNo':'8','bsNo':'5985','serialNo':1086,'main':false,'letterLabel':{'vtr':{'x':-0.5487165329903796,'y':0.8347420627899652,'z':0.0459984242357439},'orthogVtr':{'x':0.7063779188686455,'y':0.43350207206445407,'z':0.5595589238414717}}},{'longitude':192.91,'latitude':-34.09444444444445,'magnitude':4.9,'b_v':-0.03,'constell':'','desigNo':'','bsNo':'4874','serialNo':1087,'main':false,'letterLabel':{'vtr':{'x':-0.35064508185841714,'y':0.20317326062483065,'z':-0.9142038354412974},'orthogVtr':{'x':-0.4748742886420365,'y':0.8028041909310326,'z':0.360554907067273},'minZoom':1.8}},{'longitude':250.64666666666668,'latitude':-17.77472222222222,'magnitude':4.91,'b_v':1.1,'constell':'','desigNo':'','bsNo':'6196','serialNo':1088,'main':false,'letterLabel':{'vtr':{'x':0.9385752276128759,'y':0.038882848881015564,'z':0.34287704235532357},'orthogVtr':{'x':0.13960633186881372,'y':-0.9514700035023848,'z':-0.27425335829722686},'minZoom':1.8}},{'longitude':108.21416666666667,'latitude':39.290277777777774,'magnitude':4.91,'b_v':1.45,'constell':'Aur','desigNo':'63','bsNo':'2696','serialNo':1089,'main':false,'letterLabel':{'vtr':{'x':0.6053843185757555,'y':-0.49361111990856693,'z':-0.6243860097128847},'orthogVtr':{'x':0.7582796906575708,'y':0.5961065877044777,'z':0.2639485685348239},'minZoom':0.5}},{'longitude':107.77416666666667,'latitude':-4.265555555555555,'magnitude':4.91,'b_v':1.02,'constell':'Mon','desigNo':'20','bsNo':'2701','serialNo':1090,'main':false,'letterLabel':{'vtr':{'x':-0.23580862560767654,'y':-0.9600300686856669,'z':0.15078646924844585},'orthogVtr':{'x':0.9228881354024601,'y':-0.2698332751686353,'z':-0.2747134746333678},'minZoom':0.5}},{'longitude':225.4775,'latitude':-8.5875,'magnitude':4.91,'b_v':0,'letter':'delta','constell':'Lib','desigNo':'19','bsNo':'5586','serialNo':1091,'main':false,'letterLabel':{'vtr':{'x':-0.21521978180076629,'y':0.97655373394789,'z':-0.004821849651748853},'orthogVtr':{'x':0.6877327782434688,'y':0.1550691903390334,'z':0.70920883520802},'minZoom':0.5}},{'longitude':203.89416666666668,'latitude':37.093333333333334,'magnitude':4.91,'b_v':0.4,'letter':'BH','constell':'CVn','desigNo':'','bsNo':'5110','serialNo':1092,'main':false,'letterLabel':{'vtr':{'x':0.11849650869274561,'y':-0.353739395576283,'z':0.9278076403247367},'orthogVtr':{'x':-0.6738640398937192,'y':-0.714926932628584,'z':-0.18651202840674946},'minZoom':0.5}},{'longitude':228.92458333333335,'latitude':-31.583333333333332,'magnitude':4.91,'b_v':0.37,'constell':'Lup','desigNo':'1','bsNo':'5660','serialNo':1093,'main':false,'letterLabel':{'vtr':{'x':0.025970039770547182,'y':-0.7856594656592615,'z':-0.6181138738568485},'orthogVtr':{'x':-0.8282687510739761,'y':0.3292986165905537,'z':-0.45335780252015484},'minZoom':0.7}},{'longitude':307.6408333333333,'latitude':-2.826388888888889,'magnitude':4.91,'b_v':1.16,'constell':'Aql','desigNo':'69','bsNo':'7831','serialNo':1094,'main':false,'letterLabel':{'vtr':{'x':-0.5907821508018158,'y':-0.693472300692647,'z':0.412398615984617},'orthogVtr':{'x':-0.5281259495745655,'y':0.7187939294440684,'z':0.45212638540602723},'minZoom':0.5}},{'longitude':203.755,'latitude':3.569722222222222,'magnitude':4.92,'b_v':0.03,'letter':'CW','constell':'Vir','desigNo':'78','bsNo':'5105','serialNo':1095,'main':false,'letterLabel':{'vtr':{'x':0.3082977911382658,'y':0.7507529762775685,'z':0.5842280724080613},'orthogVtr':{'x':0.26546061682393135,'y':-0.6576422083180833,'z':0.7050087848771623},'minZoom':0.5}},{'longitude':91.44166666666666,'latitude':-16.486666666666668,'magnitude':4.92,'b_v':0.2,'letter':'SS','constell':'Lep','desigNo':'17','bsNo':'2148','serialNo':1096,'main':false,'letterLabel':{'vtr':{'x':-0.9579059771665125,'y':-0.26781607016114184,'z':0.10339580006998011},'orthogVtr':{'x':0.28606666024333527,'y':-0.9207260908503958,'z':0.26538525114364053},'minZoom':1.5}},{'longitude':96.56125,'latitude':49.276944444444446,'magnitude':4.92,'b_v':1.91,'letter':'psi^1','constell':'Aur','desigNo':'46','bsNo':'2289','serialNo':1097,'main':false,'letterLabel':{'vtr':{'x':0.8372787774553823,'y':0.400603228027989,'z':0.37213075997070616},'orthogVtr':{'x':-0.5416705489865988,'y':0.5149245353613401,'z':0.6644138313155925},'minZoom':0.5}},{'longitude':166.54416666666665,'latitude':-27.388333333333332,'magnitude':4.92,'b_v':0.37,'letter':'chi^1','constell':'Hya','desigNo':'','bsNo':'4314','serialNo':1098,'main':false,'letterLabel':{'vtr':{'x':0.49763521129231425,'y':-0.8436690466401203,'z':-0.20144909089743793},'orthogVtr':{'x':0.08164229594161407,'y':0.2767761954950351,'z':-0.9574599067954104},'minZoom':0.5}},{'longitude':302.1795833333333,'latitude':-52.82916666666667,'magnitude':4.93,'b_v':1.59,'letter':'xi','constell':'Tel','desigNo':'','bsNo':'7673','serialNo':1099,'main':false,'letterLabel':{'vtr':{'x':0.48440221225421115,'y':0.6026153597000266,'z':0.6341996728293335},'orthogVtr':{'x':0.8135190716559304,'y':-0.043641558273965014,'z':-0.5798983828598708},'minZoom':0.5}},{'longitude':114.02375,'latitude':-52.57333333333334,'magnitude':4.93,'b_v':1.37,'constell':'','desigNo':'','bsNo':'2934','serialNo':1100,'main':false,'letterLabel':{'vtr':{'x':0.897047489763672,'y':-0.4042729208894543,'z':0.17851948505472431},'orthogVtr':{'x':0.3661801652218127,'y':0.45378189906149513,'z':-0.8124001936744412},'minZoom':1.8}},{'longitude':120.1525,'latitude':-3.7283333333333335,'magnitude':4.93,'b_v':1.21,'constell':'Mon','desigNo':'27','bsNo':'3122','serialNo':1101,'main':false,'letterLabel':{'vtr':{'x':0.732123837284252,'y':-0.5634110296383248,'z':-0.3828350801090003},'orthogVtr':{'x':0.46125152400041214,'y':0.8236137806495452,'z':-0.3300111694040976},'minZoom':0.5}},{'longitude':294.4579166666667,'latitude':-6.987222222222222,'magnitude':4.93,'b_v':-0.05,'letter':'kappa','constell':'Aql','desigNo':'39','bsNo':'7446','serialNo':1102,'main':false,'letterLabel':{'vtr':{'x':-0.28384174179565275,'y':-0.9588711412981464,'z':0},'orthogVtr':{'x':-0.8663452061160827,'y':0.25645253226350073,'z':0.42857681054312824},'minZoom':0.5}},{'longitude':65.38791666666667,'latitude':34.6075,'magnitude':4.93,'b_v':0.95,'constell':'Per','desigNo':'54','bsNo':'1343','serialNo':1103,'main':false,'letterLabel':{'vtr':{'x':-0.8884751259590956,'y':-0.06273296224014896,'z':-0.4546169002583881},'orthogVtr':{'x':0.3051425077166218,'y':-0.820667826940042,'z':-0.48310699416373665},'minZoom':0.5}},{'longitude':134.35041666666666,'latitude':-59.29722222222222,'magnitude':4.93,'b_v':-0.18,'letter':'v376','constell':'Car','desigNo':'','bsNo':'3582','serialNo':1104,'main':false,'letterLabel':{'vtr':{'x':-0.2514546114847611,'y':0.4648597151695809,'z':-0.8489263946747705},'orthogVtr':{'x':-0.8996541667882327,'y':0.21119205284065787,'z':0.38212602240297583},'minZoom':2}},{'longitude':302.51916666666665,'latitude':36.89194444444444,'magnitude':4.93,'b_v':-0.14,'letter':'v1624','constell':'Cyg','desigNo':'28','bsNo':'7708','main':false,'serialNo':1105,'letterLabel':{'vtr':{'x':0.34478840612876044,'y':-0.7994921943134106,'z':0.49186704121247704},'orthogVtr':{'x':-0.8344288462225286,'y':-0.0210426270870733,'z':0.5507138171836747},'minZoom':0.5}},{'longitude':116.11958333333334,'latitude':58.6675,'magnitude':4.93,'b_v':0.1,'constell':'Lyn','desigNo':'24','bsNo':'2946','serialNo':1106,'main':false,'letterLabel':{'vtr':{'x':-0.6433084437677696,'y':-0.4927246935878976,'z':-0.5859834660686281},'orthogVtr':{'x':0.7305788710379533,'y':-0.16621139913280464,'z':-0.6622901811073644},'minZoom':0.5}},{'longitude':193.1375,'latitude':27.445833333333333,'magnitude':4.93,'b_v':0.68,'constell':'Com','desigNo':'31','bsNo':'4883','serialNo':1107,'main':false,'letterLabel':{'vtr':{'x':0.32601483965677075,'y':0.8183892978315461,'z':-0.47323702466983575},'orthogVtr':{'x':0.38319419670930277,'y':0.34322161601760337,'z':0.8575319993484656},'minZoom':0.5}},{'longitude':227.0175,'latitude':24.801944444444445,'magnitude':4.93,'b_v':0.43,'constell':'Boo','desigNo':'45','bsNo':'5634','serialNo':1108,'main':false,'letterLabel':{'vtr':{'x':0.0027848366935391833,'y':-0.8442768562555618,'z':0.5359000230227797},'orthogVtr':{'x':-0.7854725438111068,'y':-0.3335126616532678,'z':-0.5213465137850851},'minZoom':0.5}},{'longitude':195.36875,'latitude':56.2725,'magnitude':4.93,'b_v':0.37,'constell':'UMa','desigNo':'78','bsNo':'4931','serialNo':1109,'main':false,'letterLabel':{'vtr':{'x':0.6546320797459715,'y':0.29852712018895833,'z':0.6945058665548849},'orthogVtr':{'x':-0.5336818343127167,'y':-0.46816353418118406,'z':0.7042773636768385},'minZoom':0.5}},{'longitude':246.98916666666668,'latitude':68.73027777777779,'magnitude':4.94,'b_v':-0.05,'constell':'Dra','desigNo':'15','bsNo':'6161','main':false,'serialNo':1110,'letterLabel':{'vtr':{'x':-0.8204450904507388,'y':0.07808333116712154,'z':-0.5663681196440393},'orthogVtr':{'x':0.5538604459662684,'y':0.35425550446523624,'z':-0.753486326319282},'minZoom':0.5}},{'longitude':45.03791666666667,'latitude':35.25222222222222,'magnitude':4.94,'b_v':1.24,'constell':'Per','desigNo':'24','bsNo':'882','serialNo':1111,'main':false,'letterLabel':{'vtr':{'x':0.23104458557144042,'y':-0.7939677706545711,'z':-0.5623464934005828},'orthogVtr':{'x':0.7833430142339708,'y':-0.1910027430098616,'z':0.5915164192256591},'minZoom':0.5}},{'longitude':148.92416666666668,'latitude':-19.092777777777776,'magnitude':4.94,'b_v':1.56,'constell':'','desigNo':'','bsNo':'3923','serialNo':1112,'main':false,'letterLabel':{'vtr':{'x':0.03752042500039737,'y':-0.8576454555475379,'z':0.5128708319708245},'orthogVtr':{'x':0.5860996412941393,'y':-0.39680052673882227,'z':-0.7064251923980872},'minZoom':1.8}},{'longitude':303.77166666666665,'latitude':15.251944444444444,'magnitude':4.94,'b_v':0.07,'letter':'rho','constell':'Aql','desigNo':'67','bsNo':'7724','serialNo':1113,'main':false,'letterLabel':{'vtr':{'x':0.44038546685140595,'y':-0.8978087995704147,'z':0},'orthogVtr':{'x':-0.7200257519362946,'y':-0.3531808521627556,'z':0.5973493133955737},'minZoom':0.5}},{'longitude':121.1475,'latitude':27.74388888888889,'magnitude':4.94,'b_v':1.13,'letter':'chi','constell':'Gem','desigNo':'','bsNo':'3149','serialNo':1114,'main':false,'letterLabel':{'vtr':{'x':-0.6003571729253798,'y':0.46652424965206724,'z':0.6495586112150475},'orthogVtr':{'x':-0.6557509564263081,'y':-0.7520945000384403,'z':-0.06591317135376679},'minZoom':0.5}},{'longitude':156.34333333333333,'latitude':65.47722222222222,'magnitude':4.94,'b_v':-0.05,'constell':'','desigNo':'','bsNo':'4072','serialNo':1115,'main':false,'letterLabel':{'vtr':{'x':-0.6506754222044493,'y':-0.39105224911696235,'z':-0.6509221408122686},'orthogVtr':{'x':0.6573335702964096,'y':0.13909982140229427,'z':-0.7406509414341043},'minZoom':1.8}},{'longitude':172.20916666666668,'latitude':2.7597222222222224,'magnitude':4.95,'b_v':1,'letter':'tau','constell':'Leo','desigNo':'84','bsNo':'4418','serialNo':1116,'main':false,'letterLabel':{'vtr':{'x':-0.14269646021824284,'y':-0.4407035747229936,'z':0.8862381618208269},'orthogVtr':{'x':0.017000941056819492,'y':-0.8963605112808528,'z':-0.44299977631993304},'minZoom':0.5}},{'longitude':351.9575,'latitude':1.3516666666666668,'magnitude':4.95,'b_v':0.04,'letter':'kappa','constell':'Psc','desigNo':'8','bsNo':'8911','serialNo':1117,'main':false,'letterLabel':{'vtr':{'x':0.028827081799918778,'y':-0.998952265529121,'z':-0.03554392422253668},'orthogVtr':{'x':-0.13888369329049288,'y':-0.03921654700373153,'z':0.9895319005363579},'minZoom':0.5}},{'longitude':20.299166666666668,'latitude':58.323055555555555,'magnitude':4.95,'b_v':0.68,'letter':'phi','constell':'Cas','desigNo':'34','bsNo':'382','main':false,'serialNo':1118,'letterLabel':{'vtr':{'x':0.366509378720874,'y':-0.39267776746040256,'z':-0.8434898021031156},'orthogVtr':{'x':0.7893663911998745,'y':-0.34866157811261284,'z':0.5053076334195927},'minZoom':1.4}},{'longitude':239.79291666666666,'latitude':-14.32861111111111,'magnitude':4.95,'b_v':-0.08,'letter':'FX','constell':'Lib','desigNo':'48','bsNo':'5941','serialNo':1119,'main':false,'letterLabel':{'vtr':{'x':-0.07371179738925143,'y':0.9672307514005529,'z':0.24296346324245552},'orthogVtr':{'x':0.870019570717399,'y':-0.056717754836814065,'z':0.48974385433100015},'minZoom':0.5}},{'longitude':244.25333333333333,'latitude':75.71444444444445,'magnitude':4.95,'b_v':0.39,'letter':'eta','constell':'UMi','desigNo':'21','bsNo':'6116','main':true,'serialNo':1120,'letterLabel':{'vtr':{'x':0.7280706387344729,'y':-0.07572650896276777,'z':0.6813065689196668},'orthogVtr':{'x':-0.6770699917974549,'y':-0.23484757657762662,'z':0.6974402067439261},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':0.24841016040068484,'y':-0.19035258592276005,'z':0.9497674900954571},'orthogVtr':{'x':-0.9627060927352308,'y':-0.1570152267029876,'z':0.22032520871174643},'minZoom':0.5}},{'longitude':243.71666666666667,'latitude':-54.67388888888889,'magnitude':4.95,'b_v':1.02,'letter':'kappa','constell':'Nor','desigNo':'','bsNo':'6024','serialNo':1121,'main':false,'letterLabel':{'vtr':{'x':-0.9541179216485561,'y':0.299431113261531,'z':0},'orthogVtr':{'x':0.15523988155252721,'y':0.49466186573102006,'z':0.8551083076236972},'minZoom':0.5}},{'longitude':239.55208333333334,'latitude':54.700833333333335,'magnitude':4.96,'b_v':0.27,'letter':'CL','constell':'Dra','desigNo':'','bsNo':'5960','main':false,'serialNo':1122,'letterLabel':{'vtr':{'x':-0.35734564662467017,'y':-0.5766519749293287,'z':0.7346948949383694},'orthogVtr':{'x':-0.8868804434990142,'y':-0.037124322499587276,'z':-0.46050500932990834},'minZoom':0.5}},{'longitude':351.4058333333333,'latitude':62.37916666666667,'magnitude':4.96,'b_v':1.68,'constell':'Cas','desigNo':'4','bsNo':'8904','main':false,'serialNo':1123,'letterLabel':{'vtr':{'x':0.8881691456942667,'y':-0.45951666850802714,'z':0},'orthogVtr':{'x':-0.03183560948418548,'y':-0.061532928000263346,'z':0.9975972096695566},'minZoom':0.5}},{'longitude':89.07875,'latitude':55.70888888888889,'magnitude':4.96,'b_v':0.05,'letter':'xi','constell':'Aur','desigNo':'30','bsNo':'2029','serialNo':1124,'main':false,'letterLabel':{'vtr':{'x':0.5051151398881646,'y':0.48241135991210665,'z':0.7156381594657398},'orthogVtr':{'x':-0.8630044269262154,'y':0.29102654877543355,'z':0.41294903682369166},'minZoom':0.5}},{'longitude':207.70625,'latitude':-18.220555555555553,'magnitude':4.96,'b_v':1.06,'constell':'Vir','desigNo':'89','bsNo':'5196','serialNo':1125,'main':false,'letterLabel':{'vtr':{'x':-0.3485020903337932,'y':0.9373080032907949,'z':0},'orthogVtr':{'x':0.41394012063292307,'y':0.15390778357500123,'z':0.8971989582503047},'minZoom':0.5}},{'longitude':185.30958333333334,'latitude':3.215277777777778,'magnitude':4.97,'b_v':1.17,'constell':'Vir','desigNo':'16','bsNo':'4695','serialNo':1126,'main':false,'letterLabel':{'vtr':{'x':0.09485700123379179,'y':0.8625095203430662,'z':0.4970708969900635},'orthogVtr':{'x':0.051808936586764005,'y':-0.5029229496917426,'z':0.8627771095497987},'minZoom':0.5}},{'longitude':356.7266666666667,'latitude':46.5175,'magnitude':4.97,'b_v':1.09,'letter':'psi','constell':'And','desigNo':'20','bsNo':'9003','serialNo':1127,'main':false,'letterLabel':{'vtr':{'x':-0.2175496062071065,'y':0.25697440805084365,'z':-0.9416136800440251},'orthogVtr':{'x':0.6933173979546672,'y':-0.6383503476559561,'z':-0.3343947059103808},'minZoom':0.5}},{'longitude':118.64125,'latitude':26.719166666666666,'magnitude':4.97,'b_v':0.1,'letter':'phi','constell':'Gem','desigNo':'83','bsNo':'3067','serialNo':1128,'main':false,'letterLabel':{'vtr':{'x':-0.6541952614313868,'y':-0.7526579462615934,'z':-0.0743947299880833},'orthogVtr':{'x':0.623476443220267,'y':-0.4809883855707881,'z':-0.6163824281202475},'minZoom':0.5}},{'longitude':202.32166666666666,'latitude':13.685833333333333,'magnitude':4.97,'b_v':0.71,'constell':'Vir','desigNo':'70','bsNo':'5072','serialNo':1129,'main':false,'letterLabel':{'vtr':{'x':-0.4383479682474085,'y':-0.49025496689350145,'z':-0.7533267061306276},'orthogVtr':{'x':-0.002679543521383415,'y':0.838851293383143,'z':-0.5443540462198709},'minZoom':0.5}},{'longitude':217.30083333333334,'latitude':-29.569444444444443,'magnitude':4.97,'b_v':-0.07,'constell':'Hya','desigNo':'52','bsNo':'5407','serialNo':1130,'main':false,'letterLabel':{'vtr':{'x':0.2112332704999087,'y':-0.8363879153327192,'z':-0.5058020961989981},'orthogVtr':{'x':-0.6904401266016883,'y':0.23860976691558153,'z':-0.6829039542356865},'minZoom':0.5}},{'longitude':130.21333333333334,'latitude':-12.538055555555555,'magnitude':4.98,'b_v':1.42,'constell':'Hya','desigNo':'6','bsNo':'3431','serialNo':1131,'main':false,'letterLabel':{'vtr':{'x':0.5454371433776968,'y':0.5594818746324496,'z':-0.624082009500144},'orthogVtr':{'x':-0.5525377634168134,'y':0.7999080102793091,'z':0.23419905014611475},'minZoom':0.5}},{'longitude':25.902916666666666,'latitude':-3.602777777777778,'magnitude':4.98,'b_v':1.38,'constell':'','desigNo':'','bsNo':'500','serialNo':1132,'main':false,'letterLabel':{'vtr':{'x':0.250015255510822,'y':0.8875854692633673,'z':0.38689069097664597},'orthogVtr':{'x':-0.3626614807573074,'y':0.4563368347517374,'z':-0.8125474408449532},'minZoom':1.8}},{'longitude':30.87,'latitude':54.57138888888889,'magnitude':4.99,'b_v':-0.07,'constell':'Per','desigNo':'4','bsNo':'590','serialNo':1133,'main':false,'letterLabel':{'vtr':{'x':0.3844207355441368,'y':0.10024045943985765,'z':0.917699595932673},'orthogVtr':{'x':-0.7775917433071674,'y':0.5709555068752972,'z':0.2633645570483871},'minZoom':0.5}},{'longitude':240.17541666666668,'latitude':-41.793055555555554,'magnitude':4.99,'b_v':0.99,'constell':'','desigNo':'','bsNo':'5943','serialNo':1134,'main':false,'letterLabel':{'vtr':{'x':0.8950032397870118,'y':-0.0704888040491613,'z':0.44045491173838863},'orthogVtr':{'x':0.2479448814782581,'y':-0.7422171117934147,'z':-0.6226050872822795},'minZoom':1.8}},{'longitude':344.30125,'latitude':49.827222222222225,'magnitude':4.99,'b_v':1.78,'constell':'','desigNo':'','bsNo':'8726','serialNo':1135,'main':false,'letterLabel':{'vtr':{'x':-0.029684777373556917,'y':0.2454705494811597,'z':-0.9689494431236853},'orthogVtr':{'x':0.7832235289752385,'y':-0.5965663498846872,'z':-0.17512707913065476},'minZoom':1.8}},{'longitude':123.53416666666666,'latitude':-15.841944444444445,'magnitude':4.99,'b_v':1.07,'constell':'Pup','desigNo':'20','bsNo':'3229','serialNo':1136,'main':false,'letterLabel':{'vtr':{'x':-0.5532278057040263,'y':0.8287302844740537,'z':0.08452875600327915},'orthogVtr':{'x':-0.6414810642875491,'y':-0.48855453399146564,'z':0.5914528818738607},'minZoom':0.5}},{'longitude':273.4995833333333,'latitude':64.40333333333334,'magnitude':4.99,'b_v':0.44,'constell':'Dra','desigNo':'36','bsNo':'6850','main':false,'serialNo':1137,'letterLabel':{'vtr':{'x':0.685300154982167,'y':-0.3303689013451855,'z':0.6490147044600707},'orthogVtr':{'x':-0.7277830874122715,'y':-0.27840464331214265,'z':0.6267556399897019},'minZoom':0.5}},{'longitude':143.22166666666666,'latitude':11.221388888888889,'magnitude':4.99,'b_v':1.05,'letter':'xi','constell':'Leo','desigNo':'5','bsNo':'3782','serialNo':1138,'main':false,'letterLabel':{'vtr':{'x':0.6154743839823721,'y':0.1493822732767091,'z':-0.7738709318046533},'orthogVtr':{'x':0.06286725867823353,'y':0.9694408534540986,'z':0.23713316815762717},'minZoom':0.5}},{'longitude':55.73625,'latitude':-31.883333333333333,'magnitude':4.99,'b_v':-0.16,'letter':'delta','constell':'For','desigNo':'','bsNo':'1134','serialNo':1139,'main':false,'letterLabel':{'vtr':{'x':0.5466404257302397,'y':0.804302999399897,'z':-0.23298268200403105},'orthogVtr':{'x':-0.6874900225047044,'y':0.2722325771448149,'z':-0.6732361345750639},'minZoom':0.5}},{'longitude':349.9675,'latitude':-9.515,'magnitude':4.99,'b_v':-0.02,'letter':'psi^3','constell':'Aqr','desigNo':'95','bsNo':'8865','serialNo':1140,'main':false,'letterLabel':{'vtr':{'x':-0.020282581019322732,'y':-0.7752845414829117,'z':-0.6312863824325896},'orthogVtr':{'x':-0.23755701307339605,'y':-0.6095964806270131,'z':0.7562795755187403},'minZoom':0.5}},{'longitude':272.00166666666667,'latitude':43.465,'magnitude':5,'b_v':0.91,'constell':'','desigNo':'','bsNo':'6791','serialNo':1141,'main':false,'letterLabel':{'vtr':{'x':0.5131253141024509,'y':0.6137537572169006,'z':-0.6000072812303191},'orthogVtr':{'x':0.8579392404652154,'y':-0.38740716566808725,'z':0.33742546978405324},'minZoom':1.8}},{'longitude':242.21666666666667,'latitude':17.00138888888889,'magnitude':5,'b_v':0.93,'letter':'kappa','constell':'Her','desigNo':'7','bsNo':'6008','serialNo':1142,'main':false,'letterLabel':{'vtr':{'x':0.7929710302782852,'y':-0.30954030319273207,'z':0.5247682782321608},'orthogVtr':{'x':-0.4153268853352955,'y':-0.9048149154778713,'z':0.09388049342890839},'minZoom':0.5}},{'longitude':176.09083333333334,'latitude':-62.586666666666666,'magnitude':5,'b_v':0.78,'letter':'v810','constell':'Cen','desigNo':'','bsNo':'4511','serialNo':1143,'main':false,'letterLabel':{'vtr':{'x':-0.22153240066637347,'y':0.08026649460099174,'z':0.9718439613947614},'orthogVtr':{'x':0.860194501731125,'y':-0.45335562334827134,'z':0.23352536900739926},'minZoom':2.7}},{'longitude':299.73541666666665,'latitude':-15.443888888888889,'magnitude':5.01,'b_v':0.06,'constell':'Sgr','desigNo':'61','bsNo':'7614','serialNo':1144,'main':false,'letterLabel':{'vtr':{'x':0.7427376625550505,'y':-0.3860525710102395,'z':-0.5470869922038397},'orthogVtr':{'x':-0.4688012206361022,'y':-0.8832047493745601,'z':-0.013220673671244937},'minZoom':0.5}},{'longitude':161.07416666666666,'latitude':68.98416666666667,'magnitude':5.01,'b_v':1.41,'constell':'','desigNo':'','bsNo':'4181','serialNo':1145,'main':false,'letterLabel':{'vtr':{'x':0.9404990972442018,'y':0.33912120191077916,'z':-0.021406973102937907},'orthogVtr':{'x':-0.019462940579931958,'y':0.11665918099605521,'z':0.9929812835261858},'minZoom':1.8}},{'longitude':260.27166666666665,'latitude':18.040277777777778,'magnitude':5.01,'b_v':1.65,'letter':'v656','constell':'Her','desigNo':'','bsNo':'6452','serialNo':1146,'main':false,'letterLabel':{'vtr':{'x':0.5616773047765555,'y':0.8094525460058328,'z':-0.1711875610656906},'orthogVtr':{'x':0.8116057172647108,'y':-0.4988802181953041,'z':0.3039978414341789},'minZoom':0.5}},{'longitude':186.67708333333334,'latitude':38.92166666666667,'magnitude':5.01,'b_v':0.96,'constell':'CVn','desigNo':'6','bsNo':'4728','serialNo':1147,'main':false,'letterLabel':{'vtr':{'x':-0.5904502123132187,'y':-0.6591755421820815,'z':-0.4656781628638321},'orthogVtr':{'x':0.23293574874682965,'y':0.41325580243482396,'z':-0.8803184530098773},'minZoom':0.5}},{'longitude':2.8091666666666666,'latitude':46.169444444444444,'magnitude':5.01,'b_v':0.41,'constell':'And','desigNo':'22','bsNo':'27','serialNo':1148,'main':false,'letterLabel':{'vtr':{'x':0.10266237964639005,'y':-0.14473840638189547,'z':-0.9841296812531212},'orthogVtr':{'x':0.714854797079563,'y':-0.6772339373664354,'z':0.17417466282870114},'minZoom':0.5}},{'longitude':158.4225,'latitude':-47.09388888888889,'magnitude':5.02,'b_v':1.05,'constell':'','desigNo':'','bsNo':'4143','serialNo':1149,'main':false,'letterLabel':{'vtr':{'x':-0.32880528643952023,'y':0.5472755247851078,'z':-0.7696600441627524},'orthogVtr':{'x':-0.7007746156199518,'y':0.4049404583569966,'z':0.5873143649599712},'minZoom':1.8}},{'longitude':267.1675,'latitude':76.95944444444444,'magnitude':5.02,'b_v':0.52,'constell':'Dra','desigNo':'35','bsNo':'6701','main':false,'serialNo':1150,'letterLabel':{'vtr':{'x':-0.21576036710609,'y':0.21772580808631817,'z':-0.9518628769310236},'orthogVtr':{'x':0.9763826780997431,'y':0.05923842431163355,'z':-0.20776832047222318},'minZoom':0.5}},{'longitude':143.50375,'latitude':-21.19388888888889,'magnitude':5.02,'b_v':1.02,'constell':'','desigNo':'','bsNo':'3808','serialNo':1151,'main':false,'letterLabel':{'vtr':{'x':0.45642190872713306,'y':0.32452253653253654,'z':-0.8284709798878709},'orthogVtr':{'x':-0.47947423423205704,'y':0.874062186356958,'z':0.07822885074240066},'minZoom':1.8}},{'longitude':116.68833333333333,'latitude':-14.6075,'magnitude':5.03,'b_v':0.34,'constell':'Pup','desigNo':'4','bsNo':'3015','serialNo':1152,'main':false,'letterLabel':{'vtr':{'x':-0.5018921087909339,'y':0.8649302348359603,'z':0},'orthogVtr':{'x':-0.7478037316473775,'y':-0.4339272425936333,'z':0.5024905243577669},'minZoom':0.5}},{'longitude':189.00166666666667,'latitude':18.280833333333334,'magnitude':5.03,'b_v':1.15,'constell':'Com','desigNo':'24','bsNo':'4792','serialNo':1153,'main':false,'letterLabel':{'vtr':{'x':-0.30735091473738907,'y':-0.9494165533562505,'z':0.06437098277351183},'orthogVtr':{'x':-0.16124311864816282,'y':-0.014707343695308697,'z':-0.986805122975171},'minZoom':0.5}},{'longitude':292.89458333333334,'latitude':-2.7511111111111113,'magnitude':5.03,'b_v':1.77,'constell':'Aql','desigNo':'36','bsNo':'7414','serialNo':1154,'main':false,'letterLabel':{'vtr':{'x':-0.7904764392096556,'y':-0.5304890805582183,'z':0.3061508361297085},'orthogVtr':{'x':-0.47344059114438963,'y':0.8463318353485602,'z':0.24408283661984165},'minZoom':0.5}},{'longitude':313.82666666666665,'latitude':28.125,'magnitude':5.03,'b_v':1.48,'constell':'Vul','desigNo':'32','bsNo':'8008','serialNo':1155,'main':false,'letterLabel':{'vtr':{'x':0.5544807632349381,'y':-0.828206733422741,'z':0.08139219812508688},'orthogVtr':{'x':-0.5653158125812563,'y':-0.3030820404165085,'z':0.7671761915118065},'minZoom':0.5}},{'longitude':165.11041666666668,'latitude':40.33638888888889,'magnitude':5.03,'b_v':0.62,'constell':'UMa','desigNo':'47','bsNo':'4277','serialNo':1156,'main':false,'letterLabel':{'vtr':{'x':0.23789797948485958,'y':-0.023081067648565365,'z':-0.9710158678792141},'orthogVtr':{'x':0.6330341781750614,'y':0.7619078696954521,'z':0.13698221548201941},'minZoom':0.5}},{'longitude':205.63333333333333,'latitude':-8.790833333333333,'magnitude':5.03,'b_v':1.62,'constell':'Vir','desigNo':'82','bsNo':'5150','serialNo':1157,'main':false,'letterLabel':{'vtr':{'x':0.25364538857653063,'y':0.6134452141611442,'z':0.7478963738892233},'orthogVtr':{'x':0.37656455517896914,'y':-0.7748087857207026,'z':0.5078094931693142},'minZoom':0.5}},{'longitude':253.12,'latitude':24.628055555555555,'magnitude':5.03,'b_v':1.25,'constell':'Her','desigNo':'51','bsNo':'6270','serialNo':1158,'main':false,'letterLabel':{'vtr':{'x':-0.41164779662701667,'y':0.7669210408375795,'z':-0.49231921418194297},'orthogVtr':{'x':0.8722811285519737,'y':0.48802826857673465,'z':0.030887567759368073},'minZoom':0.5}},{'longitude':94.35666666666667,'latitude':12.265833333333333,'magnitude':5.04,'b_v':0.43,'constell':'Ori','desigNo':'74','bsNo':'2241','serialNo':1159,'main':false,'letterLabel':{'vtr':{'x':-0.7013243752613205,'y':-0.7057297271635237,'z':-0.10044736363895718},'orthogVtr':{'x':0.7089667864529412,'y':-0.6758783324282726,'z':-0.20138166614805678},'minZoom':0.5}},{'longitude':324.41333333333336,'latitude':40.49277777777778,'magnitude':5.04,'b_v':0.2,'constell':'Cyg','desigNo':'74','bsNo':'8266','main':false,'serialNo':1160,'letterLabel':{'vtr':{'x':0.7800261208325083,'y':-0.43902860124411913,'z':-0.44588466906658863},'orthogVtr':{'x':0.09524253418373438,'y':-0.6209634586480051,'z':0.7780316463397665},'minZoom':0.5}},{'longitude':339.66541666666666,'latitude':-4.137222222222222,'magnitude':5.04,'b_v':1.14,'letter':'kappa','constell':'Aqr','desigNo':'63','bsNo':'8610','serialNo':1161,'main':false,'letterLabel':{'vtr':{'x':-0.01655928885533956,'y':-0.9868585148494579,'z':-0.16073599976896177},'orthogVtr':{'x':-0.35363772291160595,'y':-0.14458668847530665,'z':0.9241401681831815},'minZoom':0.5}},{'longitude':232.88958333333332,'latitude':40.774166666666666,'magnitude':5.04,'b_v':1.59,'letter':'nu^1','constell':'Boo','desigNo':'52','bsNo':'5763','serialNo':1162,'main':false,'letterLabel':{'vtr':{'x':-0.5561622148507446,'y':0.32011119543295885,'z':-0.766950072254248},'orthogVtr':{'x':0.6942003760555807,'y':0.686306306943274,'z':-0.21695504357856105},'minZoom':0.5}},{'longitude':70.66958333333334,'latitude':-37.111111111111114,'magnitude':5.04,'b_v':0.39,'letter':'beta','constell':'Cae','desigNo':'','bsNo':'1503','serialNo':1163,'main':false,'letterLabel':{'vtr':{'x':-0.7660847966190129,'y':0.34287004309364044,'z':-0.543648984123185},'orthogVtr':{'x':-0.586030634948512,'y':-0.7199955890526513,'z':0.3717182355582921},'minZoom':0.5}},{'longitude':238.58833333333334,'latitude':-20.218055555555555,'magnitude':5.04,'b_v':-0.01,'letter':'lambda','constell':'Lib','desigNo':'45','bsNo':'5902','serialNo':1164,'main':false,'letterLabel':{'vtr':{'x':-0.7253578648504223,'y':-0.3487797593202584,'z':-0.5934716904690055},'orthogVtr':{'x':-0.4844236155529743,'y':0.871158720520051,'z':0.08010146288583975},'minZoom':0.5}},{'longitude':333.02666666666664,'latitude':59.50111111111111,'magnitude':5.05,'b_v':0.19,'letter':'lambda','constell':'Cep','desigNo':'22','bsNo':'8469','main':false,'serialNo':1165,'letterLabel':{'vtr':{'x':-0.6810166323282539,'y':0.5003413198051038,'z':-0.5346727131507374},'orthogVtr':{'x':0.5758731942184134,'y':-0.08506934025166754,'z':-0.8131010217247472},'minZoom':0.5}},{'longitude':76.35541666666667,'latitude':-49.55472222222222,'magnitude':5.05,'b_v':1.48,'letter':'eta^2','constell':'Pic','desigNo':'','bsNo':'1663','serialNo':1166,'main':false,'letterLabel':{'vtr':{'x':0.9817443728202557,'y':0.18999397542315433,'z':0.008959672910812299},'orthogVtr':{'x':-0.11295615022458731,'y':0.6202756449817717,'z':-0.7762081115067581},'minZoom':0.5}},{'longitude':117.01541666666667,'latitude':86.97722222222222,'magnitude':5.05,'b_v':1.6,'letter':'OV','constell':'Cep','desigNo':'','bsNo':'2609','main':false,'serialNo':1167,'letterLabel':{'vtr':{'x':-0.4279722521279168,'y':-0.05271144817447107,'z':-0.9022534314924542},'orthogVtr':{'x':0.9034744102062494,'y':0.0015058953032799985,'z':-0.4286393850100634},'minZoom':0.5}},{'longitude':357.1904166666667,'latitude':67.90416666666667,'magnitude':5.05,'b_v':0.01,'constell':'','desigNo':'','bsNo':'9013','serialNo':1168,'main':false,'letterLabel':{'vtr':{'x':0.5215947929539854,'y':-0.19497007056288806,'z':-0.8306175675652374},'orthogVtr':{'x':0.7660188194707835,'y':-0.3216841187780972,'z':0.5565379555273355},'minZoom':1.8}},{'longitude':55.9225,'latitude':63.27166666666667,'magnitude':5.06,'b_v':1.65,'letter':'BD','constell':'Cam','desigNo':'','bsNo':'1105','serialNo':1169,'main':false,'letterLabel':{'vtr':{'x':-0.04420390180913832,'y':-0.37392626075853,'z':-0.9264044292748129},'orthogVtr':{'x':0.9667152746489215,'y':-0.24992771155236962,'z':0.05475140873672629},'minZoom':0.5}},{'longitude':92.15625,'latitude':-68.84694444444445,'magnitude':5.06,'b_v':-0.07,'letter':'nu','constell':'Dor','desigNo':'','bsNo':'2221','serialNo':1170,'main':false,'letterLabel':{'vtr':{'x':0.4970747186850202,'y':-0.31921451969851183,'z':0.8068573693397467},'orthogVtr':{'x':0.8676015104846998,'y':0.16829271063229334,'z':-0.467915785748571},'minZoom':0.5}},{'longitude':295.3441666666667,'latitude':45.56722222222223,'magnitude':5.06,'b_v':0.43,'constell':'','desigNo':'','bsNo':'7495','serialNo':1171,'main':false,'letterLabel':{'vtr':{'x':-0.9409971906977944,'y':0.11192999997271605,'z':0.31936806697753406},'orthogVtr':{'x':-0.15723467087643464,'y':0.6910661520944736,'z':-0.7054819853856775},'minZoom':1.8}},{'longitude':318.73833333333334,'latitude':-70.05333333333333,'magnitude':5.06,'b_v':1.58,'letter':'omicron','constell':'Pav','desigNo':'','bsNo':'8092','serialNo':1172,'main':false,'letterLabel':{'vtr':{'x':-0.7134365186837477,'y':-0.02704252596925641,'z':0.7001978546079791},'orthogVtr':{'x':0.6521092306316193,'y':0.3400717725000967,'z':0.6775726830928769},'minZoom':0.5}},{'longitude':97.20583333333333,'latitude':-4.774166666666667,'magnitude':5.06,'b_v':-0.18,'constell':'Mon','desigNo':'10','bsNo':'2344','serialNo':1173,'main':false,'letterLabel':{'vtr':{'x':-0.9892416289929516,'y':-0.06587745191597916,'z':0.13061837847879393},'orthogVtr':{'x':0.07600156692206497,'y':-0.9943506280770719,'z':0.07409851731393789},'minZoom':0.5}},{'longitude':295.87958333333336,'latitude':-16.081666666666667,'magnitude':5.06,'b_v':0.32,'constell':'Sgr','desigNo':'55','bsNo':'7489','serialNo':1174,'main':false,'letterLabel':{'vtr':{'x':0.8738266366195646,'y':0.38127708910966474,'z':-0.3017528632079576},'orthogVtr':{'x':0.2460284756682381,'y':-0.881983438564689,'z':-0.40196418156095837},'minZoom':0.5}},{'longitude':358.345,'latitude':19.217499999999998,'magnitude':5.06,'b_v':1.59,'letter':'phi','constell':'Peg','desigNo':'81','bsNo':'9036','serialNo':1175,'main':false,'letterLabel':{'vtr':{'x':0.3292775478204943,'y':-0.9442331790936612,'z':0},'orthogVtr':{'x':-0.02575094223235592,'y':-0.008979992760343667,'z':0.9996280551806107},'minZoom':0.5}},{'longitude':108.59375,'latitude':16.12777777777778,'magnitude':5.07,'b_v':1.65,'letter':'BQ','constell':'Gem','desigNo':'51','bsNo':'2717','serialNo':1176,'main':false,'letterLabel':{'vtr':{'x':0.8477633338139875,'y':-0.3554474015359763,'z':-0.3936425721157659},'orthogVtr':{'x':0.4329817756027968,'y':0.8924657882763568,'z':0.12661594983299024},'minZoom':0.5}},{'longitude':327.655,'latitude':30.25638888888889,'magnitude':5.07,'b_v':0.01,'constell':'Peg','desigNo':'14','bsNo':'8343','serialNo':1177,'main':false,'letterLabel':{'vtr':{'x':-0.6319294599411742,'y':0.7551078459971425,'z':0.17457748586805696},'orthogVtr':{'x':0.2609979618478687,'y':0.4194363646170262,'z':-0.8694556917681957},'minZoom':0.5}},{'longitude':262.9741666666667,'latitude':68.12388888888889,'magnitude':5.07,'b_v':1.08,'constell':'Dra','desigNo':'27','bsNo':'6566','main':false,'serialNo':1178,'letterLabel':{'vtr':{'x':-0.6355093198985343,'y':-0.312551734594228,'z':0.7060023495175082},'orthogVtr':{'x':-0.7707469041388114,'y':0.20283698539349915,'z':-0.6039920257063958},'minZoom':0.7}},{'longitude':331.4216666666667,'latitude':62.36527777777778,'magnitude':5.07,'b_v':0.24,'constell':'Cep','desigNo':'19','bsNo':'8428','main':false,'serialNo':1179,'letterLabel':{'vtr':{'x':0.8490325314385531,'y':-0.4568341061281835,'z':0.2654173318325425},'orthogVtr':{'x':-0.336501152029122,'y':-0.08027238364410057,'z':0.9382554658019149},'minZoom':2}},{'longitude':67.84291666666667,'latitude':-44.91694444444444,'magnitude':5.07,'b_v':-0.19,'letter':'delta','constell':'Cae','desigNo':'','bsNo':'1443','serialNo':1180,'main':false,'letterLabel':{'vtr':{'x':-0.31146135970239475,'y':-0.7072764990075544,'z':0.6346272727861233},'orthogVtr':{'x':0.9119570373200948,'y':-0.03477851100077184,'z':0.40880902296173044},'minZoom':0.5}},{'longitude':12.475,'latitude':17.034722222222225,'magnitude':5.07,'b_v':0.5,'constell':'Psc','desigNo':'64','bsNo':'225','serialNo':1181,'main':false,'letterLabel':{'vtr':{'x':0.2994067290935152,'y':-0.9541255737970356,'z':0},'orthogVtr':{'x':0.19706178043502257,'y':0.06183842539152564,'z':0.9784388912123617},'minZoom':0.5}},{'longitude':145.28625,'latitude':-14.4125,'magnitude':5.07,'b_v':-0.15,'letter':'kappa','constell':'Hya','desigNo':'38','bsNo':'3849','serialNo':1182,'main':false,'letterLabel':{'vtr':{'x':0.519030514043719,'y':0.18769602037323058,'z':-0.8338929963895635},'orthogVtr':{'x':-0.3110815908301759,'y':0.9501675641194847,'z':0.02024460278227716},'minZoom':0.5}},{'longitude':48.41708333333333,'latitude':-1.1316666666666666,'magnitude':5.07,'b_v':0.58,'constell':'Cet','desigNo':'94','bsNo':'962','serialNo':1183,'main':false,'letterLabel':{'vtr':{'x':-0.13229807956686215,'y':-0.9869940299316413,'z':-0.0913236170014011},'orthogVtr':{'x':0.7363199566049287,'y':-0.1595390904593461,'z':0.6575562334285341},'minZoom':0.5}},{'longitude':309.995,'latitude':10.148888888888889,'magnitude':5.07,'b_v':0.7,'letter':'kappa','constell':'Del','desigNo':'7','bsNo':'7896','serialNo':1184,'main':false,'letterLabel':{'vtr':{'x':0.6599651111260216,'y':-0.6321695609409143,'z':-0.4059651442133789},'orthogVtr':{'x':-0.4051938182046104,'y':-0.7545282242163112,'z':0.5162413471911651},'minZoom':0.5}},{'longitude':328.5620833333333,'latitude':-13.46861111111111,'magnitude':5.08,'b_v':0.38,'letter':'mu','constell':'Cap','desigNo':'51','bsNo':'8351','serialNo':1185,'main':false,'letterLabel':{'vtr':{'x':0.09346388663940627,'y':0.9539194925722227,'z':0.28513523736116775},'orthogVtr':{'x':0.5502680471655271,'y':0.18918062857806983,'z':-0.8132747174475816},'minZoom':0.5}},{'longitude':147.4275,'latitude':45.93861111111111,'magnitude':5.08,'b_v':0.62,'constell':'','desigNo':'','bsNo':'3881','serialNo':1186,'main':false,'letterLabel':{'vtr':{'x':-0.045327441736491364,'y':0.43226007396959043,'z':0.9006090447455153},'orthogVtr':{'x':-0.8090094456370471,'y':-0.5447681202943087,'z':0.2207519240709892},'minZoom':1.8}},{'longitude':81.36833333333334,'latitude':79.24722222222222,'magnitude':5.08,'b_v':0.51,'constell':'','desigNo':'','bsNo':'1686','serialNo':1187,'main':false,'letterLabel':{'vtr':{'x':0.7834687028224272,'y':-0.13617131845966973,'z':-0.6063284289283313},'orthogVtr':{'x':0.6208000766068946,'y':0.12753963582233782,'z':0.7735249874303862},'minZoom':1.8}},{'longitude':73.1,'latitude':18.868333333333332,'magnitude':5.08,'b_v':0.21,'letter':'v480','constell':'Tau','desigNo':'97','bsNo':'1547','serialNo':1188,'main':false,'letterLabel':{'vtr':{'x':-0.9202169288772071,'y':0.36130503273025494,'z':-0.15053065180085645},'orthogVtr':{'x':-0.2784442451516789,'y':-0.8745711430212169,'z':-0.39698125665637435},'minZoom':0.5}},{'longitude':161.09125,'latitude':23.09638888888889,'magnitude':5.08,'b_v':0.04,'constell':'LMi','desigNo':'41','bsNo':'4192','serialNo':1189,'main':false,'letterLabel':{'vtr':{'x':0.3823985070357838,'y':0.15627146333911418,'z':-0.910686889969684},'orthogVtr':{'x':0.3106609638699055,'y':0.9064746568061723,'z':0.28599556306969737},'minZoom':0.5}},{'longitude':339.05,'latitude':73.73416666666667,'magnitude':5.08,'b_v':0.4,'constell':'Cep','desigNo':'31','bsNo':'8615','main':false,'serialNo':1190,'letterLabel':{'vtr':{'x':0.8325301217185845,'y':-0.17191146412193498,'z':-0.5266308431289336},'orthogVtr':{'x':0.48833443024231366,'y':-0.2211317919484911,'z':0.8441742798910448},'minZoom':0.5}},{'longitude':92.42958333333333,'latitude':-74.75833333333334,'magnitude':5.08,'b_v':0.71,'letter':'alpha','constell':'Men','desigNo':'','bsNo':'2261','serialNo':1191,'main':false,'letterLabel':{'vtr':{'x':-0.8151730237095044,'y':0.16089097486462917,'z':-0.5564234319503566},'orthogVtr':{'x':-0.5791103046865451,'y':-0.207907945378873,'z':0.7882928017267395},'minZoom':0.5}},{'longitude':158.71208333333334,'latitude':-23.835833333333333,'magnitude':5.08,'b_v':1.6,'constell':'Hya','desigNo':'44','bsNo':'4145','serialNo':1192,'main':false,'letterLabel':{'vtr':{'x':-0.5140830099199148,'y':0.7643122756726074,'z':0.38928833037716476},'orthogVtr':{'x':-0.09650130093513357,'y':-0.5025095405349096,'z':0.8591691687841345},'minZoom':0.5}},{'longitude':328.465,'latitude':26.008055555555554,'magnitude':5.09,'b_v':-0.16,'constell':'Peg','desigNo':'16','bsNo':'8356','serialNo':1193,'main':false,'letterLabel':{'vtr':{'x':0.3342887553422166,'y':0.35285203873705756,'z':-0.8739258932031101},'orthogVtr':{'x':0.5490739832178994,'y':-0.826568432205798,'z':-0.12370282063913993},'minZoom':0.5}},{'longitude':335.47375,'latitude':-80.35138888888888,'magnitude':5.09,'b_v':1.28,'letter':'epsilon','constell':'Oct','desigNo':'','bsNo':'8481','serialNo':1194,'main':false,'letterLabel':{'vtr':{'x':0.30652441012771475,'y':0.1141016070884627,'z':0.9449992641561615},'orthogVtr':{'x':0.9395700619360488,'y':0.12276944297273837,'z':-0.3195868623483345},'minZoom':0.5}},{'longitude':98.63,'latitude':-1.2347222222222223,'magnitude':5.09,'b_v':-0.13,'constell':'','desigNo':'','bsNo':'2395','serialNo':1195,'main':false,'letterLabel':{'vtr':{'x':-0.8683051536333103,'y':0.4809706789071768,'z':0.12129866530758988},'orthogVtr':{'x':-0.47280091136998054,'y':-0.8764718345676514,'z':0.09086485248615817},'minZoom':1.8}},{'longitude':12.297916666666667,'latitude':-74.82833333333333,'magnitude':5.09,'b_v':1.35,'letter':'lambda','constell':'Hyi','desigNo':'','bsNo':'236','serialNo':1196,'main':false,'letterLabel':{'vtr':{'x':0.6599392147503208,'y':0.21639932385098537,'z':-0.719480066069635},'orthogVtr':{'x':-0.7064661424246206,'y':-0.14718855342509737,'z':-0.6922724314518837},'minZoom':0.5}},{'longitude':325.2183333333333,'latitude':43.35388888888889,'magnitude':5.09,'b_v':1.6,'constell':'Cyg','desigNo':'75','bsNo':'8284','main':false,'serialNo':1197,'letterLabel':{'vtr':{'x':0.6865542240926843,'y':-0.17014958606587968,'z':-0.7068892528127033},'orthogVtr':{'x':0.41470485857076594,'y':-0.7069394388548819,'z':0.5729367417694086},'minZoom':1.3}},{'longitude':345.20708333333334,'latitude':57.03944444444444,'magnitude':5.1,'b_v':1.01,'letter':'v509','constell':'Cas','desigNo':'','bsNo':'8752','main':false,'serialNo':1198,'letterLabel':{'vtr':{'x':0.5932472585958001,'y':-0.24496944912144047,'z':-0.7668426560681834},'orthogVtr':{'x':0.6093862548363282,'y':-0.48579102849956696,'z':0.6266222698291903},'minZoom':0.5}},{'longitude':199.46583333333334,'latitude':-31.598333333333333,'magnitude':5.1,'b_v':0.96,'constell':'','desigNo':'','bsNo':'5006','serialNo':1199,'main':false,'letterLabel':{'vtr':{'x':-0.5233839137983556,'y':0.8479046674467087,'z':0.08442128700275717},'orthogVtr':{'x':0.28490150559479427,'y':0.0807614335822127,'z':0.9551485344989885},'minZoom':1.8}},{'longitude':177.40958333333333,'latitude':-26.84722222222222,'magnitude':5.1,'b_v':1.59,'letter':'II','constell':'Hya','desigNo':'','bsNo':'4532','serialNo':1200,'main':false,'letterLabel':{'vtr':{'x':-0.4519806646551334,'y':0.892027734309816,'z':0},'orthogVtr':{'x':-0.03597049182977163,'y':-0.018225853501933342,'z':0.9991866402137543},'minZoom':0.5}},{'longitude':216.26541666666665,'latitude':5.741388888888889,'magnitude':5.1,'b_v':0.12,'constell':'','desigNo':'','bsNo':'5392','serialNo':1201,'main':false,'letterLabel':{'vtr':{'x':0.5960548854021783,'y':0.18968637114759773,'z':0.7802164149702646},'orthogVtr':{'x':0.03358997194314568,'y':-0.9767350583603487,'z':0.21180259572220816},'minZoom':1.8}},{'longitude':103.89541666666666,'latitude':68.86527777777778,'magnitude':5.11,'b_v':-0.11,'constell':'Cam','desigNo':'43','bsNo':'2511','serialNo':1202,'main':false,'letterLabel':{'vtr':{'x':-0.9770995397362664,'y':-0.01096666085516311,'z':0.21249993363967062},'orthogVtr':{'x':-0.19436772120029452,'y':-0.36039531120225105,'z':-0.9123247276155775},'minZoom':0.5}},{'longitude':341.21875,'latitude':41.91138888888889,'magnitude':5.11,'b_v':0.96,'constell':'Lac','desigNo':'13','bsNo':'8656','serialNo':1203,'main':false,'letterLabel':{'vtr':{'x':0.5510623525827969,'y':-0.3022515446064712,'z':-0.7778009304114489},'orthogVtr':{'x':0.44713857193633877,'y':-0.6800338715084782,'z':0.5810516595690288},'minZoom':0.5}},{'longitude':22.610416666666666,'latitude':-21.539444444444445,'magnitude':5.11,'b_v':0.03,'constell':'Cet','desigNo':'48','bsNo':'433','serialNo':1204,'main':false,'letterLabel':{'vtr':{'x':0.5121002299175478,'y':0.6429638238637959,'z':0.569518108334441},'orthogVtr':{'x':-0.02083915597390784,'y':0.6721640526745509,'z':-0.7401089216260119},'minZoom':0.5}},{'longitude':149.6875,'latitude':40.97138888888889,'magnitude':5.11,'b_v':0.48,'constell':'LMi','desigNo':'19','bsNo':'3928','serialNo':1205,'main':false,'letterLabel':{'vtr':{'x':0.19503951671891395,'y':-0.340657058296349,'z':-0.9197349376591771},'orthogVtr':{'x':0.7328710618551691,'y':0.6738202896170722,'z':-0.09416062869183767},'minZoom':0.5}},{'longitude':312.41625,'latitude':-43.92361111111111,'magnitude':5.11,'b_v':0.36,'letter':'iota','constell':'Mic','desigNo':'','bsNo':'7943','serialNo':1206,'main':false,'letterLabel':{'vtr':{'x':0.7669089249512133,'y':0.630166525010541,'z':0.12141190874998027},'orthogVtr':{'x':0.4193118090455339,'y':-0.34881551133020766,'z':-0.8381559197729308},'minZoom':0.5}},{'longitude':46.007083333333334,'latitude':-59.67027777777778,'magnitude':5.12,'b_v':0.35,'letter':'mu','constell':'Hor','desigNo':'','bsNo':'934','serialNo':1207,'main':false,'letterLabel':{'vtr':{'x':0.1382821148925468,'y':-0.3359489194125349,'z':0.9316739667106699},'orthogVtr':{'x':0.9262068628066058,'y':0.3770126277476923,'z':-0.0015250602366698174},'minZoom':0.5}},{'longitude':266.38416666666666,'latitude':-51.84138888888889,'magnitude':5.12,'b_v':0.69,'letter':'mu','constell':'Ara','desigNo':'','bsNo':'6585','serialNo':1208,'main':false,'letterLabel':{'vtr':{'x':0.5885905585659604,'y':-0.5167259064237723,'z':-0.6217358699621102},'orthogVtr':{'x':-0.8074917267731734,'y':-0.3387053088450066,'z':-0.4829449502304458},'minZoom':0.5}},{'longitude':118.15166666666667,'latitude':1.7211111111111113,'magnitude':5.12,'b_v':-0.12,'letter':'zeta','constell':'CMi','desigNo':'13','bsNo':'3059','serialNo':1209,'main':false,'letterLabel':{'vtr':{'x':0.7390170474728868,'y':-0.531795596879111,'z':-0.41357858586300966},'orthogVtr':{'x':0.48109522922822684,'y':0.846339984669194,'z':-0.22859573653939447},'minZoom':0.5}},{'longitude':346.11541666666665,'latitude':-34.654444444444444,'magnitude':5.12,'b_v':0.31,'letter':'pi','constell':'PsA','desigNo':'','bsNo':'8767','serialNo':1210,'main':false,'letterLabel':{'vtr':{'x':0.3812648707847342,'y':0.22408339433015215,'z':-0.8968967224218057},'orthogVtr':{'x':-0.46576535701639343,'y':-0.7914868852850578,'z':-0.39574125716830355},'minZoom':0.5}},{'longitude':28.772916666666667,'latitude':-42.41166666666666,'magnitude':5.12,'b_v':-0.06,'letter':'phi','constell':'Phe','desigNo':'','bsNo':'558','serialNo':1211,'main':false,'letterLabel':{'vtr':{'x':0.5745031241357801,'y':0.7378926280139816,'z':-0.35420422058587675},'orthogVtr':{'x':-0.5011274334671203,'y':-0.025059372482130887,'z':-0.8650105914250177},'minZoom':0.5}},{'longitude':335.6383333333333,'latitude':-21.51,'magnitude':5.12,'b_v':1.06,'constell':'Aqr','desigNo':'47','bsNo':'8516','serialNo':1212,'main':false,'letterLabel':{'vtr':{'x':-0.48742813933318296,'y':-0.2514885005153912,'z':0.8361622707912092},'orthogVtr':{'x':0.21007747758552475,'y':0.8957183326657172,'z':0.3918623762723989},'minZoom':0.5}},{'longitude':359.9575,'latitude':-52.64805555555556,'magnitude':5.13,'b_v':1.12,'letter':'pi','constell':'Phe','desigNo':'','bsNo':'9069','serialNo':1213,'main':false,'letterLabel':{'vtr':{'x':-0.79492384447527,'y':-0.606709223174213,'z':0},'orthogVtr':{'x':-0.0002730407873153391,'y':0.00035774407914174763,'z':0.999999898733946},'minZoom':0.5}},{'longitude':51.55375,'latitude':64.64694444444446,'magnitude':5.13,'b_v':2.04,'constell':'','desigNo':'','bsNo':'1009','serialNo':1214,'main':false,'letterLabel':{'vtr':{'x':0.6115043384049479,'y':0.11058738369874088,'z':0.7834748717595189},'orthogVtr':{'x':-0.7451020521001888,'y':0.41366806085247326,'z':0.5231650479405544},'minZoom':1.8}},{'longitude':125.28125,'latitude':27.15972222222222,'magnitude':5.13,'b_v':0.49,'letter':'chi','constell':'Cnc','desigNo':'18','bsNo':'3262','serialNo':1215,'main':false,'letterLabel':{'vtr':{'x':-0.8497028022359637,'y':-0.15446348623356082,'z':0.5041291295818219},'orthogVtr':{'x':-0.11793175430751857,'y':-0.8762270379747503,'z':-0.4672454165082271},'minZoom':0.5}},{'longitude':212.15708333333333,'latitude':43.77166666666667,'magnitude':5.13,'b_v':1.49,'letter':'BY','constell':'Boo','desigNo':'','bsNo':'5299','serialNo':1216,'main':false,'letterLabel':{'vtr':{'x':-0.7904472408369704,'y':-0.5573200776648162,'z':-0.25414069033687553},'orthogVtr':{'x':-0.03838573066124526,'y':0.4591581685660654,'z':-0.8875248232701206},'minZoom':0.5}},{'longitude':316.69458333333336,'latitude':-76.955,'magnitude':5.13,'b_v':0.49,'letter':'alpha','constell':'Oct','desigNo':'','bsNo':'8021','serialNo':1217,'main':false,'letterLabel':{'vtr':{'x':-0.4888109959742132,'y':0.05593549969889497,'z':0.870594641660591},'orthogVtr':{'x':0.8567869859891861,'y':0.21867566599208277,'z':0.467008579945257},'minZoom':0.5}},{'longitude':19.675833333333333,'latitude':3.7061111111111114,'magnitude':5.13,'b_v':0.07,'constell':'Psc','desigNo':'89','bsNo':'378','serialNo':1218,'main':false,'letterLabel':{'vtr':{'x':0.028362238773629728,'y':-0.9933282547858424,'z':-0.11177907521472936},'orthogVtr':{'x':0.340977593475246,'y':-0.09550293683214336,'z':0.9352077147908189},'minZoom':0.5}},{'longitude':114.53708333333333,'latitude':-4.151111111111112,'magnitude':5.14,'b_v':0.44,'constell':'Mon','desigNo':'25','bsNo':'2927','serialNo':1219,'main':false,'letterLabel':{'vtr':{'x':0.6897845054307091,'y':0.6254013137742123,'z':-0.36478833972209357},'orthogVtr':{'x':-0.5938364909898738,'y':0.776938409050161,'z':0.20910507050628532},'minZoom':0.5}},{'longitude':117.1575,'latitude':33.37138888888889,'magnitude':5.14,'b_v':1.64,'letter':'pi','constell':'Gem','desigNo':'80','bsNo':'3013','serialNo':1220,'main':false,'letterLabel':{'vtr':{'x':-0.8898692793044214,'y':-0.0003798033799795597,'z':0.45621543321069513},'orthogVtr':{'x':-0.2506653725632508,'y':-0.8351225598106492,'z':-0.4896296366571732},'minZoom':0.5}},{'longitude':106.15791666666667,'latitude':-56.776666666666664,'magnitude':5.14,'b_v':-0.03,'letter':'v386','constell':'Car','desigNo':'','bsNo':'2683','serialNo':1221,'main':false,'letterLabel':{'vtr':{'x':-0.4330480104052525,'y':-0.4220977127769597,'z':0.7964313790606895},'orthogVtr':{'x':0.8883811966882873,'y':-0.34933115192261993,'z':0.2979036684351207},'minZoom':1.4}},{'longitude':183.25,'latitude':77.51916666666666,'magnitude':5.14,'b_v':0.36,'constell':'','desigNo':'','bsNo':'4646','serialNo':1222,'main':false,'letterLabel':{'vtr':{'x':-0.9560141545177909,'y':-0.21378750741744912,'z':0.20082788161474835},'orthogVtr':{'x':-0.19870132365584103,'y':-0.03161858179906115,'z':-0.9795499217816478},'minZoom':1.8}},{'longitude':116.95458333333333,'latitude':37.47361111111111,'magnitude':5.15,'b_v':1.59,'constell':'','desigNo':'','bsNo':'2999','serialNo':1223,'main':false,'letterLabel':{'vtr':{'x':-0.35211218111371523,'y':0.6135958160095931,'z':0.7067652980211068},'orthogVtr':{'x':-0.8640619590946284,'y':-0.5033433435677721,'z':0.0065122447411492534},'minZoom':1.8}},{'longitude':310.2608333333333,'latitude':-18.075833333333332,'magnitude':5.15,'b_v':1.65,'letter':'upsilon','constell':'Cap','desigNo':'15','bsNo':'7900','serialNo':1224,'main':false,'letterLabel':{'vtr':{'x':-0.45080051014815564,'y':-0.8926247252066025,'z':0},'orthogVtr':{'x':-0.6475530604519006,'y':0.3270324490867655,'z':0.6882766966443724},'minZoom':0.5}},{'longitude':222.91416666666666,'latitude':-16.06888888888889,'magnitude':5.15,'b_v':0.4,'letter':'alpha^1','constell':'Lib','desigNo':'8','bsNo':'5530','serialNo':1225,'main':false,'letterLabel':{'vtr':{'x':-0.6344036316777772,'y':0.6593834273223769,'z':-0.40341731232886224},'orthogVtr':{'x':0.319770766642679,'y':0.6989986956227805,'z':0.6396463713008969},'minZoom':0.5}},{'longitude':38.29416666666667,'latitude':36.223888888888894,'magnitude':5.15,'b_v':1.47,'constell':'Tri','desigNo':'14','bsNo':'736','main':false,'serialNo':1226,'letterLabel':{'vtr':{'x':-0.45845816854198135,'y':0.8066842741392766,'z':0.37292973809220514},'orthogVtr':{'x':-0.6236574420822845,'y':0.00692471084695942,'z':-0.7816670923833675},'minZoom':1.4}},{'longitude':348.155,'latitude':8.815277777777778,'magnitude':5.15,'b_v':0.14,'constell':'Peg','desigNo':'59','bsNo':'8826','serialNo':1227,'main':false,'letterLabel':{'vtr':{'x':0.25070482326295457,'y':-0.4426541744451906,'z':-0.8609322699486515},'orthogVtr':{'x':0.042149280326630525,'y':-0.8834998142563142,'z':0.46653136698083386},'minZoom':1.4}},{'longitude':228.71166666666667,'latitude':67.28055555555555,'magnitude':5.15,'b_v':0.55,'constell':'','desigNo':'','bsNo':'5691','serialNo':1228,'main':false,'letterLabel':{'vtr':{'x':0.926033415245815,'y':0.14639466506954182,'z':0.3478946908007494},'orthogVtr':{'x':-0.2784161386938955,'y':-0.3573986518848225,'z':0.8914878896236861},'minZoom':1.8}},{'longitude':181.14291666666668,'latitude':-42.53194444444444,'magnitude':5.15,'b_v':0.42,'constell':'','desigNo':'','bsNo':'4600','serialNo':1229,'main':false,'letterLabel':{'vtr':{'x':-0.6594583688097311,'y':0.7231866233150482,'z':0.20522126513835628},'orthogVtr':{'x':0.14935954759573658,'y':-0.14150455156496392,'z':0.9786052255268187},'minZoom':1.8}},{'longitude':137.59041666666667,'latitude':21.973611111111108,'magnitude':5.16,'b_v':0.97,'letter':'xi','constell':'Cnc','desigNo':'77','bsNo':'3627','serialNo':1230,'main':false,'letterLabel':{'vtr':{'x':0.47954653817825055,'y':0.8775164486898555,'z':0},'orthogVtr':{'x':-0.5488278272671246,'y':0.2999242749406973,'z':0.7802778000933669},'minZoom':0.5}},{'longitude':159.06916666666666,'latitude':56.99194444444444,'magnitude':5.16,'b_v':0.35,'constell':'UMa','desigNo':'37','bsNo':'4141','serialNo':1231,'main':false,'letterLabel':{'vtr':{'x':0.5887240138509622,'y':0.5038839758671779,'z':0.632064058762636},'orthogVtr':{'x':-0.6281056475504766,'y':-0.2070291432920492,'z':0.7500814818024483},'minZoom':0.5}},{'longitude':87.82083333333334,'latitude':-52.105555555555554,'magnitude':5.16,'b_v':0.96,'constell':'','desigNo':'','bsNo':'2049','serialNo':1232,'main':false,'letterLabel':{'vtr':{'x':-0.45663052403741666,'y':-0.5545697284224039,'z':0.6956586669012437},'orthogVtr':{'x':0.88934982461146,'y':-0.26401652526171554,'z':0.37329902739264637},'minZoom':1.8}},{'longitude':5.512083333333333,'latitude':38.06527777777777,'magnitude':5.16,'b_v':0.44,'letter':'rho','constell':'And','desigNo':'27','bsNo':'82','serialNo':1233,'main':false,'letterLabel':{'vtr':{'x':-0.022181671088561,'y':0.14944312179115132,'z':0.988521485258178},'orthogVtr':{'x':-0.6207833932883168,'y':0.7729954193737987,'z':-0.13079013817780177},'minZoom':0.5}},{'longitude':231.65041666666667,'latitude':15.3675,'magnitude':5.16,'b_v':1.65,'letter':'tau^1','constell':'Ser','desigNo':'9','bsNo':'5739','serialNo':1234,'main':false,'letterLabel':{'vtr':{'x':-0.6110814697286737,'y':0.4595491595253707,'z':-0.644510672784997},'orthogVtr':{'x':0.5183123032314652,'y':0.8476937472414499,'z':0.11299410253036518},'minZoom':0.5}},{'longitude':49.97125,'latitude':50.285,'magnitude':5.16,'b_v':-0.07,'constell':'Per','desigNo':'29','bsNo':'987','serialNo':1235,'main':false,'letterLabel':{'vtr':{'x':-0.10305020900723325,'y':0.5724466545412782,'z':0.8134405215675354},'orthogVtr':{'x':-0.9058072255685283,'y':0.2838776089565016,'z':-0.31452626796658023},'minZoom':1.4}},{'longitude':44.375416666666666,'latitude':-3.642777777777778,'magnitude':5.16,'b_v':0.08,'constell':'','desigNo':'','bsNo':'875','serialNo':1236,'main':false,'letterLabel':{'vtr':{'x':0.6265907491473663,'y':-0.3882644237990793,'z':0.6757475640317997},'orthogVtr':{'x':0.313920772648876,'y':0.919355186768625,'z':0.23714929698643283},'minZoom':1.8}},{'longitude':39.93416666666667,'latitude':72.89333333333335,'magnitude':5.17,'b_v':0.9,'constell':'','desigNo':'','bsNo':'743','serialNo':1237,'main':false,'letterLabel':{'vtr':{'x':-0.6235926498915586,'y':-0.007272175881666565,'z':-0.7817156276160598},'orthogVtr':{'x':0.748504703604464,'y':-0.2940616277046527,'z':-0.594363918650589},'minZoom':1.8}},{'longitude':291.45125,'latitude':11.983055555555556,'magnitude':5.17,'b_v':0.76,'constell':'Aql','desigNo':'31','bsNo':'7373','serialNo':1238,'main':false,'letterLabel':{'vtr':{'x':0.8554245090581134,'y':0.31816979367476406,'z':-0.4086770016720342},'orthogVtr':{'x':0.3745274258953759,'y':-0.9250194149946093,'z':0.06378314146555218},'minZoom':0.5}},{'longitude':7.812916666666666,'latitude':-23.691111111111113,'magnitude':5.17,'b_v':0.13,'constell':'','desigNo':'','bsNo':'118','serialNo':1239,'main':false,'letterLabel':{'vtr':{'x':-0.3208914519126369,'y':-0.4697383503381531,'z':-0.8224199403656204},'orthogVtr':{'x':-0.2719787528810616,'y':-0.7860649140815165,'z':0.555094144115465},'minZoom':1.8}},{'longitude':12.750833333333333,'latitude':-10.550277777777778,'magnitude':5.17,'b_v':0.51,'letter':'phi^2','constell':'Cet','desigNo':'19','bsNo':'235','serialNo':1240,'main':false,'letterLabel':{'vtr':{'x':0.20303114119368398,'y':-0.09199876491947404,'z':0.9748407987763344},'orthogVtr':{'x':0.1984535969812871,'y':0.9787804908815512,'z':0.05103842194718464},'minZoom':0.5}},{'longitude':179.2275,'latitude':-17.248333333333335,'magnitude':5.17,'b_v':-0.02,'letter':'eta','constell':'Crt','desigNo':'30','bsNo':'4567','serialNo':1241,'main':false,'letterLabel':{'vtr':{'x':-0.13544889333238158,'y':0.39679870566797265,'z':0.907857028653331},'orthogVtr':{'x':0.2640829746733327,'y':-0.8686946280963419,'z':0.419082122744746},'minZoom':0.5}},{'longitude':66.13833333333334,'latitude':-3.7061111111111114,'magnitude':5.17,'b_v':0.07,'letter':'xi','constell':'Eri','desigNo':'42','bsNo':'1383','serialNo':1242,'main':false,'letterLabel':{'vtr':{'x':0.574867426280633,'y':0.7939155180719772,'z':0.19805451867095802},'orthogVtr':{'x':-0.7117350628305664,'y':0.6045824864019432,'z':-0.3576495735683378},'minZoom':0.5}},{'longitude':17.3625,'latitude':55.00555555555555,'magnitude':5.17,'b_v':0.7,'letter':'mu','constell':'Cas','desigNo':'30','bsNo':'321','main':false,'serialNo':1243,'letterLabel':{'vtr':{'x':0.687301741625785,'y':-0.32334935478293614,'z':0.6504317879067886},'orthogVtr':{'x':-0.477500437755476,'y':0.47364967132583563,'z':0.7400333241120001},'minZoom':0.5}},{'longitude':161.1425,'latitude':46.11138888888889,'magnitude':5.18,'b_v':0.32,'constell':'','desigNo':'','bsNo':'4191','serialNo':1244,'main':false,'letterLabel':{'vtr':{'x':0.7255231278167569,'y':0.6840120573065857,'z':0.07578717874549802},'orthogVtr':{'x':-0.20788690299439572,'y':0.11284934798630161,'z':0.9716213564050893},'minZoom':1.8}},{'longitude':307.81416666666667,'latitude':75.01444444444445,'magnitude':5.18,'b_v':0.1,'letter':'AF','constell':'Dra','desigNo':'73','bsNo':'7879','main':false,'serialNo':1245,'letterLabel':{'vtr':{'x':0.9759617971345914,'y':-0.18465106837082945,'z':0.11576939787063681},'orthogVtr':{'x':-0.14955190096174503,'y':-0.18101183537723853,'z':0.9720436946825445},'minZoom':0.5}},{'longitude':82.80041666666666,'latitude':-76.3275,'magnitude':5.18,'b_v':1.13,'letter':'gamma','constell':'Men','desigNo':'','bsNo':'1953','serialNo':1246,'main':false,'letterLabel':{'vtr':{'x':-0.22661694938450946,'y':-0.23503073281900777,'z':0.9452012023279588},'orthogVtr':{'x':0.9735333606326853,'y':-0.025143320770647716,'z':0.22715767465761386},'minZoom':0.5}},{'longitude':236.73458333333335,'latitude':62.545833333333334,'magnitude':5.19,'b_v':0.06,'constell':'','desigNo':'','bsNo':'5886','serialNo':1247,'main':false,'letterLabel':{'vtr':{'x':0.36271808157553914,'y':0.45634058387720255,'z':-0.8125200704012022},'orthogVtr':{'x':0.8969298346964769,'y':0.0656517025834725,'z':0.4372719126347382},'minZoom':1.8}},{'longitude':35.83583333333333,'latitude':-23.737222222222222,'magnitude':5.19,'b_v':0.61,'letter':'kappa','constell':'For','desigNo':'','bsNo':'695','serialNo':1248,'main':false,'letterLabel':{'vtr':{'x':-0.47679977899939796,'y':-0.8790119286711217,'z':0},'orthogVtr':{'x':0.47109346122902923,'y':-0.2555337997990948,'z':0.8442591000086938},'minZoom':0.5}},{'longitude':119.98083333333334,'latitude':-60.635555555555555,'magnitude':5.19,'b_v':1.76,'constell':'','desigNo':'','bsNo':'3153','serialNo':1249,'main':false,'letterLabel':{'vtr':{'x':0.9191017136668405,'y':-0.06938686681133038,'z':-0.38786273686548417},'orthogVtr':{'x':-0.3085574749110292,'y':0.4854290385996527,'z':-0.8180164626465328},'minZoom':1.8}},{'longitude':157.59166666666667,'latitude':-2.8291666666666666,'magnitude':5.19,'b_v':-0.05,'letter':'delta','constell':'Sex','desigNo':'29','bsNo':'4116','serialNo':1250,'main':false,'letterLabel':{'vtr':{'x':-0.05337857486816102,'y':0.9985743476301823,'z':0},'orthogVtr':{'x':-0.38019740385898926,'y':-0.02032336964666696,'z':0.9246820506233965},'minZoom':0.5}},{'longitude':339.81875,'latitude':63.67583333333333,'magnitude':5.19,'b_v':0.08,'constell':'Cep','desigNo':'30','bsNo':'8627','main':false,'serialNo':1251,'letterLabel':{'vtr':{'x':0.8072289975810506,'y':-0.2868096437373395,'z':-0.5158697255349963},'orthogVtr':{'x':0.4184958902585362,'y':-0.33821219802019614,'z':0.8428960190599211},'minZoom':0.5}},{'longitude':316.92125,'latitude':38.83638888888889,'magnitude':5.2,'b_v':1.07,'letter':'v1803','constell':'Cyg','desigNo':'61','bsNo':'8085','main':false,'serialNo':1252,'letterLabel':{'vtr':{'x':-0.6440016998211091,'y':-0.06257134415550547,'z':0.7624609088458866},'orthogVtr':{'x':-0.5114272978338149,'y':0.7764226385656876,'z':-0.3682526379445203},'minZoom':1.7}},{'longitude':106.15041666666667,'latitude':-42.36388888888889,'magnitude':5.2,'b_v':0.2,'constell':'','desigNo':'','bsNo':'2666','serialNo':1253,'main':false,'letterLabel':{'vtr':{'x':-0.8055167781640276,'y':0.5283292396260361,'z':-0.268348532048192},'orthogVtr':{'x':-0.5557890049950474,'y':-0.5165386068659021,'z':0.6513727424014981},'minZoom':1.8}},{'longitude':196.63916666666665,'latitude':35.705555555555556,'magnitude':5.2,'b_v':-0.06,'constell':'CVn','desigNo':'14','bsNo':'4943','serialNo':1254,'main':false,'letterLabel':{'vtr':{'x':-0.4842991912399084,'y':-0.7929311366084174,'z':0.36974924741134174},'orthogVtr':{'x':-0.4001642383093048,'y':-0.17506560492961534,'z':-0.8995669048764308},'minZoom':0.5}},{'longitude':209.87625,'latitude':-25.056944444444444,'magnitude':5.2,'b_v':-0.09,'constell':'Hya','desigNo':'47','bsNo':'5250','serialNo':1255,'main':false,'letterLabel':{'vtr':{'x':-0.6175044513301321,'y':0.5846844983708636,'z':-0.526148543618895},'orthogVtr':{'x':0.04100400054949693,'y':0.6919363125945308,'z':0.7207931820238177},'minZoom':0.5}},{'longitude':105.86958333333334,'latitude':24.18888888888889,'magnitude':5.2,'b_v':0.95,'letter':'omega','constell':'Gem','desigNo':'42','bsNo':'2630','serialNo':1256,'main':false,'letterLabel':{'vtr':{'x':0.9186146889469531,'y':0.38687108632345013,'z':-0.0804848794358696},'orthogVtr':{'x':-0.306474924795845,'y':0.8260985782696031,'z':0.47289984082501235},'minZoom':0.5}},{'longitude':40.30125,'latitude':-54.47555555555556,'magnitude':5.21,'b_v':0.41,'letter':'zeta','constell':'Hor','desigNo':'','bsNo':'802','serialNo':1257,'main':false,'letterLabel':{'vtr':{'x':-0.8911497717670583,'y':-0.3544059960307776,'z':-0.283281616517825},'orthogVtr':{'x':-0.09735840684417318,'y':-0.46045169590253054,'z':0.8823296302160818},'minZoom':0.5}},{'longitude':96.24708333333334,'latitude':-11.540555555555555,'magnitude':5.21,'b_v':1.23,'constell':'','desigNo':'','bsNo':'2305','serialNo':1258,'main':false,'letterLabel':{'vtr':{'x':0.902383040265911,'y':-0.43081203680348656,'z':-0.010287739580811368},'orthogVtr':{'x':0.4175377805769108,'y':0.8799865818005054,'z':-0.22646372257377143},'minZoom':1.8}},{'longitude':17.14875,'latitude':-41.39388888888889,'magnitude':5.21,'b_v':0.16,'letter':'upsilon','constell':'Phe','desigNo':'','bsNo':'331','serialNo':1259,'main':false,'letterLabel':{'vtr':{'x':0.5534347715328684,'y':0.3466267758520539,'z':0.7573373303362062},'orthogVtr':{'x':0.4241039314615897,'y':0.6652986634509684,'z':-0.6144213080038637},'minZoom':0.5}},{'longitude':338.9120833333333,'latitude':-20.618055555555557,'magnitude':5.21,'b_v':0.45,'letter':'upsilon','constell':'Aqr','desigNo':'59','bsNo':'8592','serialNo':1260,'main':false,'letterLabel':{'vtr':{'x':-0.18916701945466147,'y':-0.8819589499913109,'z':-0.4316992579109489},'orthogVtr':{'x':-0.4490206299684006,'y':-0.31328616023076566,'z':0.8367988143339137},'minZoom':0.5}},{'longitude':18.66208333333333,'latitude':7.6675,'magnitude':5.21,'b_v':0.32,'letter':'zeta','constell':'Psc','desigNo':'86','bsNo':'361','serialNo':1261,'main':false,'letterLabel':{'vtr':{'x':-0.34384412184499574,'y':0.3320399140369203,'z':-0.8783625193272984},'orthogVtr':{'x':0.011896489968420701,'y':-0.9337813016444644,'z':-0.3576464094963094},'minZoom':0.5}},{'longitude':89.93166666666667,'latitude':0.5533333333333333,'magnitude':5.21,'b_v':0.01,'constell':'Ori','desigNo':'60','bsNo':'2103','serialNo':1262,'main':false,'letterLabel':{'vtr':{'x':-0.8959049097795828,'y':0.4442341864950414,'z':0.0032218289722577283},'orthogVtr':{'x':-0.4442442688117113,'y':-0.8958586514422758,'z':-0.009181844257826569},'minZoom':0.5}},{'longitude':117.01375,'latitude':-46.652499999999996,'magnitude':5.22,'b_v':-0.15,'constell':'','desigNo':'','bsNo':'3037','serialNo':1263,'main':false,'letterLabel':{'vtr':{'x':0.9496169400115678,'y':-0.2168105802282078,'z':-0.2263202146167549},'orthogVtr':{'x':-0.03199451823193908,'y':0.651281504459917,'z':-0.7581614292164519},'minZoom':1.8}},{'longitude':102.24791666666667,'latitude':48.76916666666666,'magnitude':5.22,'b_v':1.13,'letter':'psi^6','constell':'Aur','desigNo':'57','bsNo':'2487','serialNo':1264,'main':false,'letterLabel':{'vtr':{'x':-0.8795302560622376,'y':0.20446786750331722,'z':0.429673620123159},'orthogVtr':{'x':-0.45483670661261694,'y':-0.6265765317318943,'z':-0.6328707768578185},'minZoom':0.5}},{'longitude':322.52416666666664,'latitude':46.61833333333333,'magnitude':5.22,'b_v':0.97,'constell':'Cyg','desigNo':'71','bsNo':'8228','main':false,'serialNo':1265,'letterLabel':{'vtr':{'x':-0.8284170009954189,'y':0.5435319517174036,'z':0.13527117181434717},'orthogVtr':{'x':0.1288281755459426,'y':0.4199318904214222,'z':-0.898365464937625},'minZoom':0.5}},{'longitude':222.06416666666667,'latitude':-52.45638888888889,'magnitude':5.22,'b_v':0.98,'constell':'','desigNo':'','bsNo':'5495','serialNo':1266,'main':false,'letterLabel':{'vtr':{'x':0.6496490914815977,'y':-0.6066065178967883,'z':-0.4582407559157829},'orthogVtr':{'x':-0.6109825682531433,'y':-0.057917020180833806,'z':-0.7895225899644456},'minZoom':1.8}},{'longitude':191.62541666666667,'latitude':7.5777777777777775,'magnitude':5.22,'b_v':0.32,'letter':'FM','constell':'Vir','desigNo':'32','bsNo':'4847','serialNo':1267,'main':false,'letterLabel':{'vtr':{'x':-0.14499712589406138,'y':-0.9880380288214998,'z':-0.052504162549145285},'orthogVtr':{'x':-0.1904393288003864,'y':0.07994151601840681,'z':-0.9784386623916377},'minZoom':0.5}},{'longitude':149.90583333333333,'latitude':-35.97527777777778,'magnitude':5.23,'b_v':0.3,'letter':'eta','constell':'Ant','desigNo':'','bsNo':'3947','serialNo':1268,'main':false,'letterLabel':{'vtr':{'x':-0.642731702688305,'y':0.7660913511843037,'z':0},'orthogVtr':{'x':-0.31086958974373874,'y':-0.2608118998095038,'z':0.9139678610817324},'minZoom':0.5}},{'longitude':194.04166666666666,'latitude':65.34388888888888,'magnitude':5.23,'b_v':0.3,'constell':'Dra','desigNo':'8','bsNo':'4916','main':false,'serialNo':1269,'letterLabel':{'vtr':{'x':0.9135195090486571,'y':0.4067949195694316,'z':0},'orthogVtr':{'x':0.041174619618783825,'y':-0.09246383494471516,'z':0.9948643575516037},'minZoom':0.5}},{'longitude':222.19291666666666,'latitude':-26.15972222222222,'magnitude':5.23,'b_v':0.94,'constell':'Hya','desigNo':'56','bsNo':'5516','serialNo':1270,'main':false,'letterLabel':{'vtr':{'x':-0.550832335554926,'y':0.834611395142336,'z':0.0027490372258795765},'orthogVtr':{'x':0.5043433115553722,'y':0.33023183218557767,'z':0.7978626204433426},'minZoom':0.5}},{'longitude':111.3375,'latitude':40.636944444444445,'magnitude':5.23,'b_v':1.25,'constell':'Aur','desigNo':'66','bsNo':'2805','serialNo':1271,'main':false,'letterLabel':{'vtr':{'x':-0.5110759633556905,'y':0.5233442001423809,'z':0.6818447094884469},'orthogVtr':{'x':-0.8139785470881451,'y':-0.5495147778346794,'z':-0.18834126956558356},'minZoom':0.5}},{'longitude':137.17333333333335,'latitude':10.596944444444444,'magnitude':5.23,'b_v':-0.09,'letter':'kappa','constell':'Cnc','desigNo':'76','bsNo':'3623','serialNo':1272,'main':false,'letterLabel':{'vtr':{'x':-0.6637424673744184,'y':-0.4605499269805995,'z':0.5893553272533333},'orthogVtr':{'x':0.19935264363075367,'y':-0.868374889073614,'z':-0.4540744162621565},'minZoom':0.5}},{'longitude':135.15375,'latitude':32.349444444444444,'magnitude':5.23,'b_v':0.91,'letter':'sigma^3','constell':'Cnc','desigNo':'64','bsNo':'3575','serialNo':1273,'main':false,'letterLabel':{'vtr':{'x':0.6757064956665013,'y':0.7369645014615887,'z':-0.017437181525940093},'orthogVtr':{'x':-0.4297228772020576,'y':0.413002447293799,'z':0.8029739892042073},'minZoom':0.5}},{'longitude':56.349583333333335,'latitude':-1.108888888888889,'magnitude':5.24,'b_v':-0.09,'constell':'Eri','desigNo':'24','bsNo':'1146','serialNo':1274,'main':false,'letterLabel':{'vtr':{'x':-0.5585883671656539,'y':-0.7499213974975278,'z':-0.35439657679295306},'orthogVtr':{'x':0.6172846559591867,'y':-0.6612438099753781,'z':0.42628192230798895},'minZoom':0.5}},{'longitude':54.272083333333335,'latitude':-17.41,'magnitude':5.24,'b_v':-0.12,'letter':'EG','constell':'Eri','desigNo':'20','bsNo':'1100','serialNo':1275,'main':false,'letterLabel':{'vtr':{'x':0.46449741135782047,'y':0.885538904050913,'z':-0.007937521917538465},'orthogVtr':{'x':-0.6883214273939607,'y':0.3553812328459799,'z':-0.6323905375092289},'minZoom':0.5}},{'longitude':101.99958333333333,'latitude':43.55833333333333,'magnitude':5.24,'b_v':0.58,'letter':'psi^5','constell':'Aur','desigNo':'56','bsNo':'2483','serialNo':1276,'main':false,'letterLabel':{'vtr':{'x':-0.1124448872566238,'y':-0.7243150006189393,'z':-0.6802381400717188},'orthogVtr':{'x':0.9821694593202699,'y':0.02278137410612946,'z':-0.186612331244121},'minZoom':0.5}},{'longitude':356.27666666666664,'latitude':-18.179722222222225,'magnitude':5.24,'b_v':-0.08,'constell':'Aqr','desigNo':'106','bsNo':'8998','serialNo':1277,'main':false,'letterLabel':{'vtr':{'x':-0.2680976396700456,'y':-0.8883763235702987,'z':-0.3727078793412749},'orthogVtr':{'x':-0.17109463287403046,'y':-0.3368149711745696,'z':0.9258954054289149},'minZoom':0.5}},{'longitude':342.1225,'latitude':-19.521666666666665,'magnitude':5.24,'b_v':0.94,'constell':'Aqr','desigNo':'68','bsNo':'8670','serialNo':1278,'main':false,'letterLabel':{'vtr':{'x':0.06912676456576566,'y':-0.5404725871904167,'z':-0.8385170677549543},'orthogVtr':{'x':-0.4365798341655349,'y':-0.7721556006846437,'z':0.46170745795506835},'minZoom':1.3}},{'longitude':3.155,'latitude':-35.03527777777778,'magnitude':5.24,'b_v':0.46,'letter':'theta','constell':'Scl','desigNo':'','bsNo':'35','serialNo':1279,'main':false,'letterLabel':{'vtr':{'x':-0.5746645035512515,'y':-0.8183890934990482,'z':0},'orthogVtr':{'x':0.036880281459301376,'y':-0.025896958798687243,'z':0.9989840801356457},'minZoom':0.5}},{'longitude':65.52041666666666,'latitude':-63.34527777777778,'magnitude':5.24,'b_v':0.96,'letter':'eta','constell':'Ret','desigNo':'','bsNo':'1395','serialNo':1280,'main':false,'letterLabel':{'vtr':{'x':-0.7523428900591209,'y':-0.39673798513399305,'z':0.525907926284924},'orthogVtr':{'x':0.6320004892165834,'y':-0.20940984391750336,'z':0.746138659298958},'minZoom':0.5}},{'longitude':226.695,'latitude':54.489444444444445,'magnitude':5.24,'b_v':0.96,'constell':'','desigNo':'','bsNo':'5635','serialNo':1281,'main':false,'letterLabel':{'vtr':{'x':-0.4605915092207965,'y':-0.5760765877327895,'z':0.6752712245460002},'orthogVtr':{'x':-0.7931807485779927,'y':-0.07433633709830062,'z':-0.6044323031341582},'minZoom':1.8}},{'longitude':116.80791666666667,'latitude':10.724444444444444,'magnitude':5.25,'b_v':0.02,'constell':'CMi','desigNo':'11','bsNo':'3008','serialNo':1282,'main':false,'letterLabel':{'vtr':{'x':-0.8345103140233404,'y':0.27170504828514763,'z':0.47934215600657504},'orthogVtr':{'x':-0.3274662378666819,'y':-0.9442184258058057,'z':-0.034891652672928375},'minZoom':0.5}},{'longitude':154.625,'latitude':-8.156944444444445,'magnitude':5.25,'b_v':0.34,'letter':'epsilon','constell':'Sex','desigNo':'22','bsNo':'4042','serialNo':1283,'main':false,'letterLabel':{'vtr':{'x':-0.15668114591895774,'y':0.9876492386032211,'z':0},'orthogVtr':{'x':-0.4189661856625035,'y':-0.06646499536994808,'z':0.9055659775311159},'minZoom':0.5}},{'longitude':158.26833333333335,'latitude':82.46833333333333,'magnitude':5.25,'b_v':0.4,'constell':'','desigNo':'','bsNo':'4084','serialNo':1284,'main':false,'letterLabel':{'vtr':{'x':-0.029383335293647145,'y':0.045273723757869554,'z':0.9985423924621915},'orthogVtr':{'x':-0.9921247410089725,'y':-0.12300698311282558,'z':-0.023617374607701917},'minZoom':1.8}},{'longitude':234.61375,'latitude':40.29722222222222,'magnitude':5.25,'b_v':0.89,'letter':'phi','constell':'Boo','desigNo':'54','bsNo':'5823','serialNo':1285,'main':false,'letterLabel':{'vtr':{'x':0.5738328421841573,'y':-0.32912711554670804,'z':0.7499274705214871},'orthogVtr':{'x':-0.6896701603288226,'y':-0.6880306337052782,'z':0.22576296648283517},'minZoom':0.5}},{'longitude':286.9816666666667,'latitude':36.12833333333333,'magnitude':5.25,'b_v':-0.11,'letter':'iota','constell':'Lyr','desigNo':'18','bsNo':'7262','main':false,'serialNo':1286,'letterLabel':{'vtr':{'x':0.47575671368095634,'y':-0.763207166843043,'z':0.43723033960020663},'orthogVtr':{'x':-0.8473525048517627,'y':-0.2643701208912817,'z':0.4605455153417223},'minZoom':0.5}},{'longitude':25.732916666666668,'latitude':-32.239444444444445,'magnitude':5.25,'b_v':1.04,'letter':'pi','constell':'Scl','desigNo':'','bsNo':'497','serialNo':1287,'main':false,'letterLabel':{'vtr':{'x':-0.573533173060661,'y':-0.8191823358684989,'z':0},'orthogVtr':{'x':0.3008348654837555,'y':-0.210623163383094,'z':0.9301270164638105},'minZoom':0.5}},{'longitude':65.58333333333333,'latitude':65.18111111111112,'magnitude':5.26,'b_v':0.82,'constell':'','desigNo':'','bsNo':'1327','serialNo':1288,'main':false,'letterLabel':{'vtr':{'x':-0.42131870420292133,'y':-0.28237744198701525,'z':-0.8618314973042244},'orthogVtr':{'x':0.8901595496205867,'y':-0.31057069887066635,'z':-0.33340938382454127},'minZoom':1.8}},{'longitude':174.195,'latitude':-47.73888888888889,'magnitude':5.26,'b_v':0.26,'constell':'','desigNo':'','bsNo':'4466','serialNo':1289,'main':false,'letterLabel':{'vtr':{'x':-0.36791455238706805,'y':0.4093407853839268,'z':-0.8349125724068918},'orthogVtr':{'x':-0.6457518209118169,'y':0.5335824973130537,'z':0.546163257964354},'minZoom':1.8}},{'longitude':101.98916666666666,'latitude':-37.95,'magnitude':5.27,'b_v':-0.08,'constell':'','desigNo':'','bsNo':'2518','serialNo':1290,'main':false,'letterLabel':{'vtr':{'x':0.8150828143043269,'y':0.3560895353143674,'z':-0.45699042513529325},'orthogVtr':{'x':-0.5557056448752825,'y':0.703567870736441,'z':-0.4429260519783606},'minZoom':1.8}},{'longitude':37.83708333333333,'latitude':-79.03277777777778,'magnitude':5.27,'b_v':0.98,'letter':'mu','constell':'Hyi','desigNo':'','bsNo':'776','serialNo':1291,'main':false,'letterLabel':{'vtr':{'x':-0.9884904711990526,'y':-0.15128313967086732,'z':0},'orthogVtr':{'x':0.017654929991370052,'y':-0.11535806372160029,'z':0.993167065795782},'minZoom':0.5}},{'longitude':95.13916666666667,'latitude':-7.831388888888888,'magnitude':5.27,'b_v':-0.18,'constell':'Mon','desigNo':'7','bsNo':'2273','serialNo':1292,'main':false,'letterLabel':{'vtr':{'x':-0.4166392670199053,'y':-0.8946968897381115,'z':0.16102545348504957},'orthogVtr':{'x':0.9047303373074027,'y':-0.4253835269024221,'z':-0.02262458387881891},'minZoom':0.5}},{'longitude':332.8666666666667,'latitude':86.19500000000001,'magnitude':5.27,'b_v':-0.03,'constell':'','desigNo':'','bsNo':'8546','serialNo':1293,'main':false,'letterLabel':{'vtr':{'x':-0.5713682063325329,'y':0.008926783338547531,'z':0.8206452859375789},'orthogVtr':{'x':-0.8185661549211994,'y':0.06575782469994798,'z':-0.5706359246562154},'minZoom':1.8}},{'longitude':255.56333333333333,'latitude':33.54388888888889,'magnitude':5.27,'b_v':0.03,'constell':'Her','desigNo':'59','bsNo':'6332','serialNo':1294,'main':false,'letterLabel':{'vtr':{'x':0.2906508244802135,'y':0.822765905397428,'z':-0.4884448414555354},'orthogVtr':{'x':0.9339942561125942,'y':-0.1331032992882569,'z':0.331569361170876},'minZoom':0.5}},{'longitude':331.3854166666667,'latitude':62.87138888888889,'magnitude':5.27,'b_v':1.41,'constell':'Cep','desigNo':'20','bsNo':'8426','main':false,'serialNo':1295,'letterLabel':{'vtr':{'x':-0.5980317982741271,'y':0.4342713513818973,'z':-0.67362182389079},'orthogVtr':{'x':0.6943497704704569,'y':-0.1390493184195187,'z':-0.7060762588380176},'minZoom':1.9}},{'longitude':50.56,'latitude':21.20888888888889,'magnitude':5.27,'b_v':-0.07,'letter':'tau','constell':'Ari','desigNo':'61','bsNo':'1005','serialNo':1296,'main':false,'letterLabel':{'vtr':{'x':-0.7992823781032704,'y':0.150688321292951,'z':-0.5817565726998649},'orthogVtr':{'x':0.10196884725758677,'y':-0.9200087341105668,'z':-0.3783996344464824},'minZoom':0.5}},{'longitude':201.91166666666666,'latitude':-12.798333333333334,'magnitude':5.27,'b_v':1.48,'constell':'Vir','desigNo':'68','bsNo':'5064','serialNo':1297,'main':false,'letterLabel':{'vtr':{'x':0.2846665593280084,'y':-0.9498365902077552,'z':0.12951988998936792},'orthogVtr':{'x':-0.31695942523357157,'y':-0.2207697515668895,'z':-0.9223868166602867},'minZoom':0.5}},{'longitude':33.419583333333335,'latitude':-30.6425,'magnitude':5.27,'b_v':-0.01,'letter':'mu','constell':'For','desigNo':'','bsNo':'652','serialNo':1298,'main':false,'letterLabel':{'vtr':{'x':-0.6959276007278451,'y':-0.5249754639720918,'z':-0.48998524138230093},'orthogVtr':{'x':-0.000970996199824492,'y':-0.6816357684888641,'z':0.7316910114816058},'minZoom':0.5}},{'longitude':60.60583333333334,'latitude':-1.5016666666666667,'magnitude':5.28,'b_v':-0.13,'constell':'Eri','desigNo':'35','bsNo':'1244','serialNo':1299,'main':false,'letterLabel':{'vtr':{'x':-0.5009424153959755,'y':0.8093716577633192,'z':-0.30655214249243523},'orthogVtr':{'x':-0.7129675450121081,'y':-0.5867118234282382,'z':-0.38398765085471054},'minZoom':0.5}},{'longitude':185.16708333333332,'latitude':48.88722222222222,'magnitude':5.28,'b_v':1.62,'constell':'CVn','desigNo':'3','bsNo':'4690','serialNo':1300,'main':false,'letterLabel':{'vtr':{'x':0.754741312489521,'y':0.6560225234102828,'z':0},'orthogVtr':{'x':0.038848753781536405,'y':-0.0446947450298464,'z':0.9982450371007805},'minZoom':0.5}},{'longitude':289.65958333333333,'latitude':11.628055555555555,'magnitude':5.28,'b_v':0.2,'letter':'omega^1','constell':'Aql','desigNo':'25','bsNo':'7315','serialNo':1301,'main':false,'letterLabel':{'vtr':{'x':-0.7824824788373892,'y':-0.4883835166597726,'z':0.38626766751506497},'orthogVtr':{'x':-0.5283309001311359,'y':0.8490324443871482,'z':0.0032199913988123496},'minZoom':1.3}},{'longitude':24.987083333333334,'latitude':73.12833333333333,'magnitude':5.28,'b_v':0.97,'constell':'Cas','desigNo':'40','bsNo':'456','main':false,'serialNo':1302,'letterLabel':{'vtr':{'x':0.10121708163771669,'y':0.09899627825476447,'z':0.9899266837884759},'orthogVtr':{'x':-0.9594541139983245,'y':0.272823407699477,'z':0.07081801566646201},'minZoom':0.5}},{'longitude':26.61625,'latitude':-24.965833333333332,'magnitude':5.29,'b_v':0.4,'letter':'epsilon','constell':'Scl','desigNo':'','bsNo':'514','serialNo':1303,'main':false,'letterLabel':{'vtr':{'x':-0.4618897040362845,'y':-0.886937371692767,'z':0},'orthogVtr':{'x':0.36022979296815105,'y':-0.18759659674905116,'z':0.9138063324065427},'minZoom':0.5}},{'longitude':37.299166666666665,'latitude':29.746666666666666,'magnitude':5.29,'b_v':0.31,'constell':'Tri','desigNo':'12','bsNo':'717','main':false,'serialNo':1304,'letterLabel':{'vtr':{'x':0.6583157831528202,'y':-0.13020916657890103,'z':0.7413945660650051},'orthogVtr':{'x':-0.29934836155158384,'y':0.8584083412070487,'z':0.41656413453698343},'minZoom':0.5}},{'longitude':286.1566666666667,'latitude':-87.58138888888888,'magnitude':5.29,'b_v':1.3,'letter':'chi','constell':'Oct','desigNo':'','bsNo':'6721','serialNo':1305,'main':false,'letterLabel':{'vtr':{'x':-0.26280893225128105,'y':0.03602733484074163,'z':0.9641750340437231},'orthogVtr':{'x':0.9647764358511883,'y':0.021974697457085024,'z':0.26215175280350067},'minZoom':0.5}},{'longitude':72.3675,'latitude':56.78638888888889,'magnitude':5.29,'b_v':0.25,'constell':'Cam','desigNo':'4','bsNo':'1511','serialNo':1306,'main':false,'letterLabel':{'vtr':{'x':0.7651793222011578,'y':0.2247038089224926,'z':0.6033314206400168},'orthogVtr':{'x':-0.6220692936090665,'y':0.49955119307697826,'z':0.6028916979392608},'minZoom':0.5}},{'longitude':295.43083333333334,'latitude':-16.251944444444444,'magnitude':5.3,'b_v':1.11,'constell':'Sgr','desigNo':'54','bsNo':'7476','serialNo':1307,'main':false,'letterLabel':{'vtr':{'x':-0.8888211879008696,'y':-0.3325534483486934,'z':0.3152857433026112},'orthogVtr':{'x':-0.20009299143644282,'y':0.9006029600286871,'z':0.38584595781941644},'minZoom':1.5}},{'longitude':304.3833333333333,'latitude':24.72583333333333,'magnitude':5.3,'b_v':0.95,'constell':'Vul','desigNo':'24','bsNo':'7753','serialNo':1308,'main':false,'letterLabel':{'vtr':{'x':0.44614249466261746,'y':-0.875951839843688,'z':0.18348092198011873},'orthogVtr':{'x':-0.7333733633100503,'y':-0.24031856544754934,'z':0.6359327771773815},'minZoom':0.5}},{'longitude':314.76375,'latitude':22.394444444444446,'magnitude':5.3,'b_v':1.42,'constell':'Vul','desigNo':'33','bsNo':'8032','serialNo':1309,'main':false,'letterLabel':{'vtr':{'x':0.7572136027104601,'y':-0.2665402640838258,'z':-0.596308517038261},'orthogVtr':{'x':0.05220661057279036,'y':-0.8853304312400923,'z':0.4620221827279866},'minZoom':0.5}},{'longitude':132.56041666666667,'latitude':-3.508888888888889,'magnitude':5.3,'b_v':-0.08,'letter':'KX','constell':'Hya','desigNo':'14','bsNo':'3500','serialNo':1310,'main':false,'letterLabel':{'vtr':{'x':-0.7375137099902894,'y':0.07994645791642627,'z':0.6705833963370824},'orthogVtr':{'x':-0.017733356634673132,'y':-0.9949184433622946,'z':0.09911013631317682},'minZoom':0.5}},{'longitude':306.01125,'latitude':5.4,'magnitude':5.3,'b_v':0.98,'constell':'','desigNo':'','bsNo':'7794','serialNo':1311,'main':false,'letterLabel':{'vtr':{'x':0.7596437924435457,'y':-0.41084547190978316,'z':-0.5041302478657822},'orthogVtr':{'x':-0.2834157908325913,'y':-0.90683494836468,'z':0.31197093763869244},'minZoom':1.8}},{'longitude':358.37833333333333,'latitude':11.044722222222221,'magnitude':5.3,'b_v':0.19,'letter':'HT','constell':'Peg','desigNo':'82','bsNo':'9039','serialNo':1312,'main':false,'letterLabel':{'vtr':{'x':-0.19066353388224655,'y':0.9811193585077522,'z':-0.03243795938203059},'orthogVtr':{'x':0.03346536448918186,'y':-0.026528620067007555,'z':-0.9990877347345162},'minZoom':0.5}},{'longitude':138.73541666666668,'latitude':43.144444444444446,'magnitude':5.3,'b_v':-0.13,'constell':'Lyn','desigNo':'36','bsNo':'3652','serialNo':1313,'main':false,'letterLabel':{'vtr':{'x':-0.5878923902916066,'y':0.09390969529088716,'z':0.8034696674844634},'orthogVtr':{'x':-0.5946358334576438,'y':-0.7235633236133472,'z':-0.35052010254725746},'minZoom':0.5}},{'longitude':355.3875,'latitude':-31.976388888888888,'magnitude':5.3,'b_v':0.97,'letter':'mu','constell':'Scl','desigNo':'','bsNo':'8975','serialNo':1314,'main':false,'letterLabel':{'vtr':{'x':-0.4189389451765709,'y':-0.7371742399064257,'z':-0.5301549775610201},'orthogVtr':{'x':-0.33104002217005746,'y':-0.41967847744391684,'z':0.8451523408782607},'minZoom':0.5}},{'longitude':33.695,'latitude':51.14611111111111,'magnitude':5.31,'b_v':0.93,'constell':'','desigNo':'','bsNo':'645','serialNo':1315,'main':false,'letterLabel':{'vtr':{'x':-0.8294693012822447,'y':0.3682565663025249,'z':-0.41996164063568786},'orthogVtr':{'x':0.19888057447363958,'y':-0.5078761907467236,'z':-0.8381576772717843},'minZoom':1.8}},{'longitude':35.10458333333333,'latitude':47.459722222222226,'magnitude':5.31,'b_v':0.01,'constell':'And','desigNo':'62','bsNo':'670','serialNo':1316,'main':false,'letterLabel':{'vtr':{'x':0.8309234673096038,'y':-0.5216078381177793,'z':0.19362710215329423},'orthogVtr':{'x':0.060141510094671974,'y':0.43017175577589384,'z':0.9007415052589822},'minZoom':0.5}},{'longitude':175.49208333333334,'latitude':34.10277777777778,'magnitude':5.31,'b_v':0.72,'constell':'UMa','desigNo':'61','bsNo':'4496','serialNo':1317,'main':false,'letterLabel':{'vtr':{'x':-0.15867406332210318,'y':-0.11985438514267606,'z':0.9800293199649306},'orthogVtr':{'x':-0.5416817776335874,'y':-0.8193130225995565,'z':-0.18790163059030535},'minZoom':0.5}},{'longitude':175.85875,'latitude':66.64805555555556,'magnitude':5.32,'b_v':1.27,'constell':'Dra','desigNo':'3','bsNo':'4504','main':false,'serialNo':1318,'letterLabel':{'vtr':{'x':-0.8829155494965422,'y':-0.3712342802978143,'z':0.2874808542998697},'orthogVtr':{'x':-0.2533060998653018,'y':-0.13892671395811895,'z':-0.9573585472119779},'minZoom':0.5}},{'longitude':229.015,'latitude':4.875277777777778,'magnitude':5.32,'b_v':1.09,'constell':'Ser','desigNo':'3','bsNo':'5675','serialNo':1319,'main':false,'letterLabel':{'vtr':{'x':0.5913086918319921,'y':0.6776672291599006,'z':0.4371740585701318},'orthogVtr':{'x':0.4725534230447274,'y':-0.7304411920196267,'z':0.49310133580194015},'minZoom':0.5}},{'longitude':162.54375,'latitude':10.452222222222222,'magnitude':5.32,'b_v':0.04,'constell':'Leo','desigNo':'53','bsNo':'4227','serialNo':1320,'main':false,'letterLabel':{'vtr':{'x':-0.1412607697388903,'y':0.5772859384151553,'z':0.804230278117474},'orthogVtr':{'x':-0.3161991134941859,'y':-0.7961339993658997,'z':0.5159348560420672},'minZoom':0.5}},{'longitude':298.25708333333336,'latitude':-39.828611111111115,'magnitude':5.32,'b_v':-0.05,'letter':'v3961','constell':'Sgr','desigNo':'','bsNo':'7552','serialNo':1321,'main':false,'letterLabel':{'vtr':{'x':0.20978530583062283,'y':0.763782463587325,'z':0.6104313833462601},'orthogVtr':{'x':0.9076357324880223,'y':0.08002950478957155,'z':-0.41205904367465024},'minZoom':0.5}},{'longitude':316.01958333333334,'latitude':-38.56194444444444,'magnitude':5.32,'b_v':0.42,'letter':'zeta','constell':'Mic','desigNo':'','bsNo':'8048','serialNo':1322,'main':false,'letterLabel':{'vtr':{'x':-0.3276573149967641,'y':0.4348660948374727,'z':0.8387682418224464},'orthogVtr':{'x':0.7589807352110998,'y':0.6498563837632149,'z':-0.04043419420015609},'minZoom':0.5}},{'longitude':126.45458333333333,'latitude':-24.10388888888889,'magnitude':5.32,'b_v':1.48,'constell':'','desigNo':'','bsNo':'3315','serialNo':1323,'main':false,'letterLabel':{'vtr':{'x':-0.8120983418378427,'y':0.030971000274366833,'z':0.5826981039322434},'orthogVtr':{'x':0.2152307059265193,'y':-0.9122808946927243,'z':0.34845274056177916},'minZoom':1.8}},{'longitude':224.20625,'latitude':-33.92583333333333,'magnitude':5.32,'b_v':0.05,'constell':'','desigNo':'','bsNo':'5558','serialNo':1324,'main':false,'letterLabel':{'vtr':{'x':-0.10817024335531594,'y':0.7687207289186697,'z':0.6303710331092323},'orthogVtr':{'x':0.7965618480245149,'y':-0.31236405697483394,'z':0.5176078807185921},'minZoom':1.8}},{'longitude':128.42958333333334,'latitude':20.380555555555556,'magnitude':5.33,'b_v':1.25,'letter':'eta','constell':'Cnc','desigNo':'33','bsNo':'3366','serialNo':1325,'main':false,'letterLabel':{'vtr':{'x':0.7676458292009876,'y':-0.06093244760706007,'z':-0.6379710947519025},'orthogVtr':{'x':0.26692069795203976,'y':0.9354177828793326,'z':0.23183380357037972},'minZoom':0.5}},{'longitude':297.36,'latitude':-56.31888888888889,'magnitude':5.33,'b_v':0.2,'letter':'nu','constell':'Tel','desigNo':'','bsNo':'7510','serialNo':1326,'main':false,'letterLabel':{'vtr':{'x':-0.9561570279711301,'y':-0.29285446532606535,'z':0},'orthogVtr':{'x':-0.14424076387585505,'y':0.4709397889708322,'z':0.8702932363293524},'minZoom':0.5}},{'longitude':123.63333333333334,'latitude':68.42055555555557,'magnitude':5.34,'b_v':1.04,'constell':'','desigNo':'','bsNo':'3182','serialNo':1327,'main':false,'letterLabel':{'vtr':{'x':0.35691547141082974,'y':-0.22071699470040304,'z':-0.9076868152165745},'orthogVtr':{'x':0.9116541773077206,'y':0.2942009497143287,'z':0.28693633820861786},'minZoom':1.8}},{'longitude':253.40791666666667,'latitude':31.67361111111111,'magnitude':5.34,'b_v':0.32,'constell':'Her','desigNo':'53','bsNo':'6279','serialNo':1328,'main':false,'letterLabel':{'vtr':{'x':-0.5725712002530141,'y':0.6010703171595022,'z':-0.557563175317917},'orthogVtr':{'x':0.7830082476293884,'y':0.6024995817472472,'z':-0.15457146612084277},'minZoom':0.5}},{'longitude':216.45333333333335,'latitude':-24.884999999999998,'magnitude':5.34,'b_v':0.96,'constell':'','desigNo':'','bsNo':'5390','serialNo':1329,'main':false,'letterLabel':{'vtr':{'x':-0.2945179760179978,'y':0.9047691346923098,'z':0.30765561056218543},'orthogVtr':{'x':0.6171332283150744,'y':-0.06573867852867377,'z':0.7841077761728407},'minZoom':1.8}},{'longitude':156.06416666666667,'latitude':-38.09916666666667,'magnitude':5.34,'b_v':0.25,'constell':'','desigNo':'','bsNo':'4086','serialNo':1330,'main':false,'letterLabel':{'vtr':{'x':-0.6642219047691363,'y':0.7454563309011145,'z':0.055714629535771484},'orthogVtr':{'x':-0.20362726751135007,'y':-0.25214224563493975,'z':0.9460233738613602},'minZoom':1.8}},{'longitude':56.651666666666664,'latitude':6.10361111111111,'magnitude':5.34,'b_v':-0.1,'constell':'Tau','desigNo':'29','bsNo':'1153','serialNo':1331,'main':false,'letterLabel':{'vtr':{'x':0.48737617721687565,'y':-0.8469877161246483,'z':0.2123117298111829},'orthogVtr':{'x':0.6809408343550665,'y':0.520870841077396,'z':0.514794276408695},'minZoom':0.5}},{'longitude':130.555,'latitude':45.771388888888886,'magnitude':5.35,'b_v':0.99,'constell':'Lyn','desigNo':'34','bsNo':'3422','serialNo':1332,'main':false,'letterLabel':{'vtr':{'x':0.8636395161790715,'y':0.20646814709538897,'z':-0.45988878039040704},'orthogVtr':{'x':0.2201179931249899,'y':0.6662651537879367,'z':0.7124877640707692},'minZoom':0.5}},{'longitude':288.4066666666667,'latitude':-7.908888888888889,'magnitude':5.35,'b_v':0.09,'constell':'Aql','desigNo':'20','bsNo':'7279','serialNo':1333,'main':false,'letterLabel':{'vtr':{'x':0.4352105739700056,'y':-0.8587148544523515,'z':-0.27055601092486375},'orthogVtr':{'x':-0.8442603001494061,'y':-0.49363501768876017,'z':0.20868400730063658},'minZoom':0.5}},{'longitude':12.95125,'latitude':64.3425,'magnitude':5.35,'b_v':0.53,'constell':'','desigNo':'','bsNo':'233','serialNo':1334,'main':false,'letterLabel':{'vtr':{'x':-0.8951964194459442,'y':0.3973417904686855,'z':-0.2018486367511564},'orthogVtr':{'x':0.1433869334009211,'y':-0.17204749981593503,'z':-0.9745972733067569},'minZoom':1.8}},{'longitude':17,'latitude':-61.68222222222222,'magnitude':5.36,'b_v':0.88,'letter':'iota','constell':'Tuc','desigNo':'','bsNo':'332','serialNo':1335,'main':false,'letterLabel':{'vtr':{'x':-0.8889208613567797,'y':-0.45806080627436435,'z':0},'orthogVtr':{'x':0.06352838255927852,'y':-0.12328429713187919,'z':0.9903358655981822},'minZoom':0.5}},{'longitude':161.70833333333334,'latitude':30.58972222222222,'magnitude':5.36,'b_v':-0.05,'constell':'LMi','desigNo':'42','bsNo':'4203','serialNo':1336,'main':false,'letterLabel':{'vtr':{'x':-0.5739702229317675,'y':-0.6783062919207989,'z':0.45875784192568647},'orthogVtr':{'x':-0.050193623380914515,'y':-0.5300326298534783,'z':-0.8464904083700537},'minZoom':0.5}},{'longitude':274.64958333333334,'latitude':-56.01583333333333,'magnitude':5.36,'b_v':-0.05,'constell':'','desigNo':'','bsNo':'6819','serialNo':1337,'main':false,'letterLabel':{'vtr':{'x':0.9967455850191874,'y':0.07474703287090925,'z':0.03018476141619773},'orthogVtr':{'x':0.06667235241243435,'y':-0.5539434912346386,'z':-0.8298803564023984},'minZoom':1.8}},{'longitude':146.17083333333332,'latitude':13.940833333333334,'magnitude':5.36,'b_v':1.61,'letter':'psi','constell':'Leo','desigNo':'16','bsNo':'3866','serialNo':1338,'main':false,'letterLabel':{'vtr':{'x':0.19188346096650016,'y':0.9704390500573286,'z':0.14638574907192128},'orthogVtr':{'x':-0.5596152697497959,'y':-0.014342452431346756,'z':0.8286284112442187},'minZoom':0.5}},{'longitude':93.6525,'latitude':65.7125,'magnitude':5.36,'b_v':1.34,'constell':'Cam','desigNo':'36','bsNo':'2165','serialNo':1339,'main':false,'letterLabel':{'vtr':{'x':-0.10577570394940479,'y':-0.41084391218591476,'z':-0.9055488834258372},'orthogVtr':{'x':0.9940447229539816,'y':-0.019690855497953432,'z':-0.10717909766881233},'minZoom':0.5}},{'longitude':36.34708333333333,'latitude':-60.23416666666667,'magnitude':5.36,'b_v':0.4,'letter':'lambda','constell':'Hor','desigNo':'','bsNo':'714','serialNo':1340,'main':false,'letterLabel':{'vtr':{'x':-0.25180384246784826,'y':0.20462885925004065,'z':-0.9458973807345353},'orthogVtr':{'x':-0.8813067151039184,'y':-0.45232288589351444,'z':0.13675701374958338},'minZoom':0.5}},{'longitude':168.33833333333334,'latitude':-49.19611111111111,'magnitude':5.37,'b_v':0.18,'constell':'','desigNo':'','bsNo':'4350','serialNo':1341,'main':false,'letterLabel':{'vtr':{'x':-0.7481563824610954,'y':0.6530437874249106,'z':-0.11745568989391356},'orthogVtr':{'x':-0.17516719899120342,'y':-0.023652566116436416,'z':0.9842545445735487},'minZoom':1.8}},{'longitude':150.50375,'latitude':31.836944444444445,'magnitude':5.37,'b_v':0.68,'constell':'LMi','desigNo':'20','bsNo':'3951','serialNo':1342,'main':false,'letterLabel':{'vtr':{'x':-0.2085894915701801,'y':-0.7702683122464904,'z':-0.602641809996151},'orthogVtr':{'x':0.6400923839581203,'y':0.35836653739674756,'z':-0.6795992678579605},'minZoom':0.5}},{'longitude':281.44916666666666,'latitude':75.4538888888889,'magnitude':5.37,'b_v':0.05,'constell':'Dra','desigNo':'50','bsNo':'7124','main':false,'serialNo':1343,'letterLabel':{'vtr':{'x':0.001334514575381262,'y':0.24640302235559877,'z':-0.9691665334940505},'orthogVtr':{'x':0.998755590204041,'y':-0.04864600287077489,'z':-0.010992608465439403},'minZoom':0.5}},{'longitude':26.716666666666665,'latitude':-5.646388888888889,'magnitude':5.37,'b_v':1.52,'constell':'','desigNo':'','bsNo':'513','serialNo':1344,'main':false,'letterLabel':{'vtr':{'x':-0.3749743878720946,'y':-0.7172906898852799,'z':-0.5872718915833169},'orthogVtr':{'x':0.2631331946901914,'y':-0.6897925349264237,'z':0.6744977246899447},'minZoom':1.8}},{'longitude':120.56416666666667,'latitude':73.86861111111111,'magnitude':5.37,'b_v':1.42,'constell':'','desigNo':'','bsNo':'3075','serialNo':1345,'main':false,'letterLabel':{'vtr':{'x':-0.6878501580689063,'y':0.07854272983695915,'z':0.7215907424810404},'orthogVtr':{'x':-0.7119700022908487,'y':-0.2665082383060789,'z':-0.6496707433407782},'minZoom':1.8}},{'longitude':187.69166666666666,'latitude':58.30972222222222,'magnitude':5.37,'b_v':0.21,'constell':'UMa','desigNo':'74','bsNo':'4760','serialNo':1346,'main':false,'letterLabel':{'vtr':{'x':0.8348847694215538,'y':0.4900997778228549,'z':0.2505386787821541},'orthogVtr':{'x':-0.1787240807050493,'y':-0.18913210298980457,'z':0.9655499731214273},'minZoom':0.5}},{'longitude':277.6483333333333,'latitude':-1.972777777777778,'magnitude':5.38,'b_v':0.96,'constell':'Ser','desigNo':'60','bsNo':'6935','serialNo':1347,'main':false,'letterLabel':{'vtr':{'x':0.8117762913293399,'y':0.5771539574042601,'z':-0.0889525844941231},'orthogVtr':{'x':0.5686181747520137,'y':-0.8159094630569225,'z':-0.10471446622054076},'minZoom':0.5}},{'longitude':5.375,'latitude':8.287222222222223,'magnitude':5.38,'b_v':1.34,'constell':'Psc','desigNo':'41','bsNo':'80','serialNo':1348,'main':false,'letterLabel':{'vtr':{'x':-0.12511108534456106,'y':0.23531342155848542,'z':-0.9638333932575406},'orthogVtr':{'x':0.11711006955180442,'y':-0.9611724849327123,'z':-0.24986533536656697},'minZoom':0.5}},{'longitude':282.1041666666667,'latitude':-5.6850000000000005,'magnitude':5.38,'b_v':1.28,'letter':'R','constell':'Sct','desigNo':'','bsNo':'7066','serialNo':1349,'main':false,'letterLabel':{'vtr':{'x':0.2489749595782746,'y':-0.9566981546701636,'z':-0.15079824386809043},'orthogVtr':{'x':-0.945765920205451,'y':-0.2737077045740214,'z':0.17495975718649337},'minZoom':1.8}},{'longitude':297.93541666666664,'latitude':-10.717777777777778,'magnitude':5.38,'b_v':0.4,'constell':'Aql','desigNo':'51','bsNo':'7553','serialNo':1350,'main':false,'letterLabel':{'vtr':{'x':0.6367292873003372,'y':0.7505348335354108,'z':-0.17684252413935356},'orthogVtr':{'x':0.6186246750511776,'y':-0.6341230698432626,'z':-0.46388731790207605},'minZoom':0.5}},{'longitude':279.32458333333335,'latitude':9.1375,'magnitude':5.38,'b_v':0.39,'constell':'','desigNo':'','bsNo':'6985','serialNo':1351,'main':false,'letterLabel':{'vtr':{'x':-0.5539469044971277,'y':0.8313589606995044,'z':-0.04455452235957666},'orthogVtr':{'x':0.8170385973744212,'y':0.532563117969508,'z':-0.22096256646553158},'minZoom':1.8}},{'longitude':260.32875,'latitude':32.44611111111111,'magnitude':5.38,'b_v':0.62,'constell':'Her','desigNo':'72','bsNo':'6458','serialNo':1352,'main':false,'letterLabel':{'vtr':{'x':0.8899593699386799,'y':-0.2988998651311928,'z':0.3444287886964489},'orthogVtr':{'x':-0.4334438131157438,'y':-0.7891894858288742,'z':0.43509357192314574},'minZoom':0.5}},{'longitude':65.35375,'latitude':-20.598888888888887,'magnitude':5.38,'b_v':-0.03,'constell':'','desigNo':'','bsNo':'1367','serialNo':1353,'main':false,'letterLabel':{'vtr':{'x':0.6209620952628931,'y':-0.5816564541245453,'z':0.52543491092806},'orthogVtr':{'x':0.6797281395685548,'y':0.7334139330600646,'z':0.00858248635525699},'minZoom':1.8}},{'longitude':219.87208333333334,'latitude':44.32944444444445,'magnitude':5.39,'b_v':0.03,'constell':'Boo','desigNo':'33','bsNo':'5468','serialNo':1354,'main':false,'letterLabel':{'vtr':{'x':0.793470134136774,'y':0.26330065598105834,'z':0.5487056686356668},'orthogVtr':{'x':-0.2626809532660521,'y':-0.6651128461978922,'z':0.6990161790786941},'minZoom':0.5}},{'longitude':261.01458333333335,'latitude':-70.1388888888889,'magnitude':5.39,'b_v':-0.04,'letter':'iota','constell':'Aps','desigNo':'','bsNo':'6411','serialNo':1355,'main':false,'letterLabel':{'vtr':{'x':0.9891284698184729,'y':-0.09565513806213607,'z':-0.11169138174845994},'orthogVtr':{'x':-0.13714704582130924,'y':-0.32599726888646,'z':-0.9353696961635314},'minZoom':0.5}},{'longitude':62.975,'latitude':26.525277777777777,'magnitude':5.39,'b_v':0.35,'letter':'IM','constell':'Tau','desigNo':'44','bsNo':'1287','serialNo':1356,'main':false,'letterLabel':{'vtr':{'x':-0.5883402242858508,'y':0.7954012524631935,'z':0.14557688026351528},'orthogVtr':{'x':-0.6989798247314687,'y':-0.40974614054410363,'z':-0.5861188488076263},'minZoom':0.5}},{'longitude':202.27291666666667,'latitude':59.85583333333334,'magnitude':5.4,'b_v':-0.01,'constell':'','desigNo':'','bsNo':'5085','serialNo':1357,'main':false,'letterLabel':{'vtr':{'x':0.6632061996427308,'y':0.1975037804977462,'z':0.7219070531893592},'orthogVtr':{'x':-0.5866878213193872,'y':-0.4617082319780864,'z':0.6652991123090277},'minZoom':1.8}},{'longitude':216.8175,'latitude':19.148888888888887,'magnitude':5.4,'b_v':0.23,'constell':'Boo','desigNo':'22','bsNo':'5405','serialNo':1358,'main':false,'letterLabel':{'vtr':{'x':0.6030297715799625,'y':0.01376075598391352,'z':0.7975999850695645},'orthogVtr':{'x':-0.2538418949084904,'y':-0.9445691322821814,'z':0.2082149051555956},'minZoom':0.5}},{'longitude':82.0475,'latitude':17.97583333333333,'magnitude':5.4,'b_v':-0.09,'constell':'Tau','desigNo':'115','bsNo':'1808','serialNo':1359,'main':false,'letterLabel':{'vtr':{'x':0.8760839544472265,'y':-0.48087551536928075,'z':-0.035151720846045925},'orthogVtr':{'x':0.4638520160416771,'y':0.820679604143379,'z':0.3336559523778023},'minZoom':1.8}},{'longitude':233.36416666666668,'latitude':-73.44805555555556,'magnitude':5.4,'b_v':-0.15,'letter':'kappa^1','constell':'Aps','desigNo':'','bsNo':'5730','serialNo':1360,'main':false,'letterLabel':{'vtr':{'x':0.3294924571609562,'y':-0.2739190161502637,'z':-0.903550271576135},'orthogVtr':{'x':-0.9287277983851301,'y':0.07827865791511336,'z':-0.3624046470752247},'minZoom':0.5}},{'longitude':318.5808333333333,'latitude':-27.546944444444446,'magnitude':5.41,'b_v':1.43,'constell':'','desigNo':'','bsNo':'8110','serialNo':1361,'main':false,'letterLabel':{'vtr':{'x':0.44803160338729336,'y':-0.3814126015990557,'z':-0.8085741213442657},'orthogVtr':{'x':-0.5976679543210867,'y':-0.800400587662461,'z':0.046388744833576245},'minZoom':1.8}},{'longitude':215.02958333333333,'latitude':12.924166666666666,'magnitude':5.41,'b_v':0.39,'constell':'Boo','desigNo':'18','bsNo':'5365','serialNo':1362,'main':false,'letterLabel':{'vtr':{'x':-0.3669852928054276,'y':0.5559704326974233,'z':-0.745800692431131},'orthogVtr':{'x':0.47784889790614504,'y':0.8005451444517924,'z':0.36164610113278073},'minZoom':0.5}},{'longitude':3.115,'latitude':-27.7025,'magnitude':5.41,'b_v':1.35,'letter':'kappa^2','constell':'Scl','desigNo':'','bsNo':'34','serialNo':1363,'main':false,'letterLabel':{'vtr':{'x':-0.012819500171520594,'y':0.07878281737746234,'z':-0.9968093740035865},'orthogVtr':{'x':-0.4671877682464029,'y':-0.881861226629231,'z':-0.06368960801365832},'minZoom':0.5}},{'longitude':102.81125,'latitude':-70.985,'magnitude':5.41,'b_v':-0.11,'letter':'iota','constell':'Vol','desigNo':'','bsNo':'2602','serialNo':1364,'main':false,'letterLabel':{'vtr':{'x':0.990379336949162,'y':-0.10569486632347704,'z':0.08931609136656485},'orthogVtr':{'x':0.11802217106731222,'y':0.3081954773011321,'z':-0.943973683376653},'minZoom':0.5}},{'longitude':191.4875,'latitude':45.344722222222224,'magnitude':5.42,'b_v':2.99,'letter':'Y','constell':'CVn','desigNo':'','bsNo':'4846','serialNo':1365,'main':false,'letterLabel':{'vtr':{'x':0.7184209599249932,'y':0.6956085999615383,'z':0},'orthogVtr':{'x':0.09736672385754902,'y':-0.10055984819963382,'z':0.9901552595503973},'minZoom':0.5}},{'longitude':188.62708333333333,'latitude':33.151111111111106,'magnitude':5.42,'b_v':1.01,'constell':'','desigNo':'','bsNo':'4783','serialNo':1366,'main':false,'letterLabel':{'vtr':{'x':-0.00930700494231082,'y':0.2104159974426879,'z':-0.9775676384164947},'orthogVtr':{'x':0.5610074245070785,'y':0.8103587101814366,'z':0.16908409292719848},'minZoom':1.8}},{'longitude':343.00666666666666,'latitude':-39.06388888888888,'magnitude':5.43,'b_v':1.44,'constell':'','desigNo':'','bsNo':'8685','serialNo':1367,'main':false,'letterLabel':{'vtr':{'x':-0.4025146402718385,'y':-0.6906348442246609,'z':-0.6008373126809045},'orthogVtr':{'x':-0.5353610784490895,'y':-0.3548075467941362,'z':0.7664855643909773},'minZoom':1.8}},{'longitude':41.30833333333333,'latitude':44.37027777777778,'magnitude':5.43,'b_v':0.9,'constell':'Per','desigNo':'14','bsNo':'800','serialNo':1368,'main':false,'letterLabel':{'vtr':{'x':0.8415762908854213,'y':-0.4052495712619897,'z':0.357102410537244},'orthogVtr':{'x':-0.05849365959891886,'y':0.5888655415909105,'z':0.8061115715045714},'minZoom':0.5}},{'longitude':133.45333333333335,'latitude':-85.73055555555555,'magnitude':5.43,'b_v':0.31,'letter':'zeta','constell':'Oct','desigNo':'','bsNo':'3678','serialNo':1369,'main':false,'letterLabel':{'vtr':{'x':0.3712956897924852,'y':0.03122751872467161,'z':-0.9279894141722863},'orthogVtr':{'x':-0.9271018705358464,'y':0.06758096117570758,'z':-0.36866642827290746},'minZoom':0.5}},{'longitude':158.28208333333333,'latitude':14.046944444444444,'magnitude':5.43,'b_v':1.7,'constell':'Leo','desigNo':'46','bsNo':'4127','serialNo':1370,'main':false,'letterLabel':{'vtr':{'x':0.3662508215156851,'y':0.8693986497440284,'z':-0.33167201202746405},'orthogVtr':{'x':-0.2315875093914017,'y':0.4303888208976668,'z':0.8724291881523702},'minZoom':0.5}},{'longitude':82.95708333333333,'latitude':63.07944444444445,'magnitude':5.43,'b_v':1.7,'constell':'Cam','desigNo':'17','bsNo':'1802','serialNo':1371,'main':false,'letterLabel':{'vtr':{'x':-0.899968737976386,'y':-0.15021286009048887,'z':-0.4092583136951852},'orthogVtr':{'x':0.432405507015614,'y':-0.4271098753730977,'z':-0.7941049249698349},'minZoom':0.5}},{'longitude':235.03375,'latitude':-52.428888888888885,'magnitude':5.43,'b_v':0.01,'constell':'','desigNo':'','bsNo':'5798','serialNo':1372,'main':false,'letterLabel':{'vtr':{'x':0.9349727314105962,'y':-0.32967510947210865,'z':0.1309210208987182},'orthogVtr':{'x':-0.060964521063628124,'y':-0.5129366723830939,'z':-0.8562588961850506},'minZoom':1.8}},{'longitude':77.57291666666667,'latitude':9.850833333333332,'magnitude':5.43,'b_v':0.25,'constell':'Ori','desigNo':'16','bsNo':'1672','serialNo':1373,'main':false,'letterLabel':{'vtr':{'x':-0.9739215054754837,'y':-0.044374693618777994,'z':-0.22250345556554174},'orthogVtr':{'x':0.0807628274052585,'y':-0.9842567022486091,'z':-0.15721358016469608},'minZoom':0.5}},{'longitude':102.2975,'latitude':79.54166666666667,'magnitude':5.44,'b_v':0.53,'constell':'','desigNo':'','bsNo':'2401','serialNo':1374,'main':false,'letterLabel':{'vtr':{'x':0.022060606796068118,'y':0.17828484775738668,'z':0.9837315907745947},'orthogVtr':{'x':-0.9990088127836526,'y':-0.03412009818012075,'z':0.028586900510121506},'minZoom':1.8}},{'longitude':50.65416666666667,'latitude':77.79666666666667,'magnitude':5.44,'b_v':0.21,'constell':'','desigNo':'','bsNo':'961','serialNo':1375,'main':false,'letterLabel':{'vtr':{'x':0.1536142242640639,'y':-0.18345216735617803,'z':-0.9709520958296918},'orthogVtr':{'x':0.9790007182792225,'y':-0.10501194414460327,'z':0.1747286044004742},'minZoom':1.8}},{'longitude':234.35166666666666,'latitude':-44.45416666666667,'magnitude':5.44,'b_v':1.5,'constell':'','desigNo':'','bsNo':'5784','serialNo':1376,'main':false,'letterLabel':{'vtr':{'x':0.7949298673514889,'y':-0.5898417076439979,'z':-0.14203262271801032},'orthogVtr':{'x':-0.4416082744172388,'y':-0.40201091076215073,'z':-0.8021030853914068},'minZoom':1.8}},{'longitude':79.95,'latitude':-50.58777777777778,'magnitude':5.44,'b_v':0.52,'letter':'zeta','constell':'Pic','desigNo':'','bsNo':'1767','serialNo':1377,'main':false,'letterLabel':{'vtr':{'x':-0.6247786134538806,'y':-0.5433320071678022,'z':0.5607512943878542},'orthogVtr':{'x':0.7729012689885988,'y':-0.3284545914131319,'z':0.5429007365766292},'minZoom':0.5}},{'longitude':14.696666666666667,'latitude':29.086388888888887,'magnitude':5.44,'b_v':1.08,'constell':'Psc','desigNo':'68','bsNo':'274','serialNo':1378,'main':false,'letterLabel':{'vtr':{'x':0.5242960430244044,'y':-0.8346036680746992,'z':0.16896856661879256},'orthogVtr':{'x':0.10289697318466741,'y':0.2590684941191649,'z':0.9603622901094472},'minZoom':0.5}},{'longitude':13.913333333333334,'latitude':-69.43277777777779,'magnitude':5.45,'b_v':1.1,'letter':'lambda^2','constell':'Tuc','desigNo':'','bsNo':'270','serialNo':1379,'main':false,'letterLabel':{'vtr':{'x':0.887223299247983,'y':0.3502319171881275,'z':-0.3002872315871133},'orthogVtr':{'x':-0.31073223932609534,'y':-0.027451282359130733,'z':-0.9501009959684441},'minZoom':0.5}},{'longitude':9.574166666666667,'latitude':35.495555555555555,'magnitude':5.45,'b_v':0.89,'constell':'','desigNo':'','bsNo':'157','serialNo':1380,'main':false,'letterLabel':{'vtr':{'x':-0.5765476269101926,'y':0.6981786454002706,'z':-0.4244283367204274},'orthogVtr':{'x':0.15189641966598685,'y':-0.41881260538686144,'z':-0.8952784367233042},'minZoom':1.8}},{'longitude':320.8154166666667,'latitude':-88.88277777777778,'magnitude':5.45,'b_v':0.28,'letter':'sigma','constell':'Oct','desigNo':'','bsNo':'7228','serialNo':1381,'main':false,'letterLabel':{'vtr':{'x':-0.6841604487978683,'y':-0.01932514311455475,'z':-0.7290754550417272},'orthogVtr':{'x':-0.7291749259885322,'y':-0.002590309199517046,'z':0.6843224514860445},'minZoom':0.5}},{'longitude':194.25208333333333,'latitude':-85.21777777777778,'magnitude':5.45,'b_v':0.99,'letter':'iota','constell':'Oct','desigNo':'','bsNo':'4870','serialNo':1382,'main':false,'letterLabel':{'vtr':{'x':0.12419497330661544,'y':-0.030497340309749474,'z':-0.991789050574466},'orthogVtr':{'x':-0.9889623494074291,'y':0.07759022809111732,'z':-0.12622689079315424},'minZoom':0.5}},{'longitude':187.3275,'latitude':-39.13777777777778,'magnitude':5.45,'b_v':-0.07,'constell':'','desigNo':'','bsNo':'4748','serialNo':1383,'main':false,'letterLabel':{'vtr':{'x':-0.5857540739416961,'y':0.6349816192615029,'z':-0.503676987821308},'orthogVtr':{'x':-0.25509935626860913,'y':0.44542212283967736,'z':0.8582094446674056},'minZoom':1.8}},{'longitude':337.5054166666667,'latitude':78.91416666666667,'magnitude':5.45,'b_v':0.09,'letter':'rho^2','constell':'Cep','desigNo':'29','bsNo':'8591','main':false,'serialNo':1384,'letterLabel':{'vtr':{'x':-0.7522803264933536,'y':0.08722885740993487,'z':0.6530432120510943},'orthogVtr':{'x':-0.634440561034118,'y':0.17135480040458123,'z':-0.7537391504313807},'minZoom':0.5}},{'longitude':333.825,'latitude':-27.679444444444446,'magnitude':5.45,'b_v':-0.12,'letter':'lambda','constell':'PsA','desigNo':'16','bsNo':'8478','serialNo':1385,'main':false,'letterLabel':{'vtr':{'x':-0.5046181172516206,'y':-0.8633426641498899,'z':0},'orthogVtr':{'x':-0.3372504241313352,'y':0.19712065803563544,'z':0.9205463582019283},'minZoom':0.5}},{'longitude':39.95333333333333,'latitude':22.03611111111111,'magnitude':5.45,'b_v':0.17,'letter':'nu','constell':'Ari','desigNo':'32','bsNo':'773','serialNo':1386,'main':false,'letterLabel':{'vtr':{'x':0.46692294720576766,'y':-0.8842980048449051,'z':0},'orthogVtr':{'x':0.5263800347990494,'y':0.2779367541847539,'z':0.8035391836358667},'minZoom':0.5}},{'longitude':142.93125,'latitude':-73.15861111111111,'magnitude':5.46,'b_v':1.56,'constell':'','desigNo':'','bsNo':'3821','serialNo':1387,'main':false,'letterLabel':{'vtr':{'x':-0.19588277870261928,'y':-0.13003598114794485,'z':0.9719673763118967},'orthogVtr':{'x':0.9529892779447586,'y':-0.2589019361117193,'z':0.1574205310622825},'minZoom':1.8}},{'longitude':191.23625,'latitude':-28.419722222222223,'magnitude':5.46,'b_v':1.35,'constell':'','desigNo':'','bsNo':'4839','serialNo':1388,'main':false,'letterLabel':{'vtr':{'x':0.1131594192551234,'y':-0.5117630918166175,'z':-0.8516416404146403},'orthogVtr':{'x':-0.4930210721968039,'y':0.7152566362125206,'z':-0.49531622901320754},'minZoom':1.8}},{'longitude':86.81458333333333,'latitude':49.831944444444446,'magnitude':5.46,'b_v':0.03,'letter':'omicron','constell':'Aur','desigNo':'27','bsNo':'1971','serialNo':1389,'main':false,'letterLabel':{'vtr':{'x':0.9989017727387898,'y':-0.046853478198565314,'z':0},'orthogVtr':{'x':0.0301752859721013,'y':0.6433278341191517,'z':0.764995914998285},'minZoom':0.5}},{'longitude':324.64416666666665,'latitude':19.398055555555555,'magnitude':5.46,'b_v':0.32,'constell':'Peg','desigNo':'5','bsNo':'8267','serialNo':1390,'main':false,'letterLabel':{'vtr':{'x':-0.257133724957878,'y':0.9429708204303472,'z':-0.21139602481173644},'orthogVtr':{'x':0.5848887937753711,'y':-0.022277307110347117,'z':-0.810807511376099},'minZoom':0.5}},{'longitude':130.1725,'latitude':-79.0261111111111,'magnitude':5.46,'b_v':-0.1,'letter':'eta','constell':'Cha','desigNo':'','bsNo':'3502','serialNo':1391,'main':false,'letterLabel':{'vtr':{'x':0.06465490346846196,'y':-0.15416816385288765,'z':0.9859269347734206},'orthogVtr':{'x':0.9903230597128971,'y':-0.11166792296512415,'z':-0.08240456529549965},'minZoom':0.5}},{'longitude':282.5254166666667,'latitude':-43.659166666666664,'magnitude':5.46,'b_v':0.13,'letter':'eta^1','constell':'CrA','desigNo':'','bsNo':'7062','serialNo':1392,'main':false,'letterLabel':{'vtr':{'x':0.9428811393735494,'y':-0.1080709080135169,'z':-0.3151124178047751},'orthogVtr':{'x':-0.29386731144825007,'y':-0.7153419406727248,'z':-0.6339778475441843},'minZoom':0.5}},{'longitude':82.66,'latitude':-47.06583333333333,'magnitude':5.46,'b_v':0.62,'constell':'','desigNo':'','bsNo':'1856','serialNo':1393,'main':false,'letterLabel':{'vtr':{'x':0.04277030414586351,'y':0.6802690071357822,'z':-0.7317135908357637},'orthogVtr':{'x':-0.9952877743125118,'y':-0.03478109635543372,'z':-0.09051254962910207},'minZoom':1.8}},{'longitude':73.67416666666666,'latitude':-74.90916666666668,'magnitude':5.47,'b_v':1.52,'letter':'eta','constell':'Men','desigNo':'','bsNo':'1629','serialNo':1394,'main':false,'letterLabel':{'vtr':{'x':0.758625204030139,'y':0.2165198689274618,'z':-0.6144973117678098},'orthogVtr':{'x':-0.6474039430556551,'y':0.14457278475651947,'z':-0.7483093240256568},'minZoom':0.5}},{'longitude':337.41833333333335,'latitude':-39.04277777777778,'magnitude':5.47,'b_v':0.96,'letter':'nu','constell':'Gru','desigNo':'','bsNo':'8552','serialNo':1395,'main':false,'letterLabel':{'vtr':{'x':-0.6599341576344229,'y':-0.7513234374005276,'z':0},'orthogVtr':{'x':-0.22407730169804033,'y':0.19682104667561223,'z':0.954489831506466},'minZoom':1.4}},{'longitude':240.32791666666665,'latitude':-16.58361111111111,'magnitude':5.47,'b_v':0.52,'constell':'Lib','desigNo':'49','bsNo':'5954','serialNo':1396,'main':false,'letterLabel':{'vtr':{'x':0.7810450491361338,'y':0.2998590634861547,'z':0.5477710956824396},'orthogVtr':{'x':0.4060437283289218,'y':-0.9102874575247006,'z':-0.08065503925958334},'minZoom':1.3}},{'longitude':118.995,'latitude':47.5175,'magnitude':5.47,'b_v':1.46,'constell':'Lyn','desigNo':'26','bsNo':'3066','serialNo':1397,'main':false,'letterLabel':{'vtr':{'x':0.10036573050155101,'y':-0.594488672356534,'z':-0.7978157297149862},'orthogVtr':{'x':0.93955008525843,'y':0.3204700997905554,'z':-0.12060079780461251},'minZoom':0.5}},{'longitude':269.0316666666667,'latitude':26.048333333333336,'magnitude':5.47,'b_v':0.34,'letter':'v441','constell':'Her','desigNo':'89','bsNo':'6685','serialNo':1398,'main':false,'letterLabel':{'vtr':{'x':0.6166198032014301,'y':-0.7031125030316376,'z':0.35413673401726503},'orthogVtr':{'x':-0.7871146607656664,'y':-0.5592837930209074,'z':0.26010026849639495},'minZoom':0.5}},{'longitude':87.11458333333333,'latitude':17.734166666666667,'magnitude':5.47,'b_v':0.3,'constell':'Tau','desigNo':'130','bsNo':'1990','serialNo':1399,'main':false,'letterLabel':{'vtr':{'x':-0.014287742394863245,'y':-0.9520611936432142,'z':-0.3055737946485536},'orthogVtr':{'x':0.9987477058987304,'y':-0.028242772852814124,'z':0.04129607419123108},'minZoom':0.5}},{'longitude':224.43,'latitude':-11.479444444444445,'magnitude':5.48,'b_v':1.49,'letter':'xi^2','constell':'Lib','desigNo':'15','bsNo':'5564','serialNo':1400,'main':false,'letterLabel':{'vtr':{'x':-0.5887974797255605,'y':-0.38304894157578223,'z':-0.7117520890215225},'orthogVtr':{'x':-0.40443487496461694,'y':0.9020343652672153,'z':-0.15088550556407743},'minZoom':0.5}},{'longitude':242.58708333333334,'latitude':75.83277777777778,'magnitude':5.48,'b_v':-0.09,'constell':'UMi','desigNo':'19','bsNo':'6079','main':false,'serialNo':1401,'letterLabel':{'vtr':{'x':-0.8177206590696923,'y':0.03373067928054989,'z':-0.5746261088794182},'orthogVtr':{'x':0.5644778182511399,'y':0.242417300585205,'z':-0.7890492032056149},'minZoom':0.5}},{'longitude':321.2866666666667,'latitude':-12.802222222222223,'magnitude':5.48,'b_v':0.3,'constell':'Aqr','desigNo':'18','bsNo':'8187','serialNo':1402,'main':false,'letterLabel':{'vtr':{'x':0.5804617765183374,'y':0.6525265329706359,'z':-0.48710702085937657},'orthogVtr':{'x':0.2900244657144979,'y':-0.7246437932727283,'z':-0.6251217338713566},'minZoom':0.5}},{'longitude':222.97166666666666,'latitude':59.223333333333336,'magnitude':5.48,'b_v':1.37,'constell':'','desigNo':'','bsNo':'5552','serialNo':1403,'main':false,'letterLabel':{'vtr':{'x':-0.7214870731465415,'y':-0.03363678758993255,'z':-0.6916104176507659},'orthogVtr':{'x':0.5824776513626788,'y':0.5105862412456931,'z':-0.6324725100062549},'minZoom':1.8}},{'longitude':92.425,'latitude':-22.43166666666667,'magnitude':5.49,'b_v':-0.01,'constell':'','desigNo':'','bsNo':'2180','serialNo':1404,'main':false,'letterLabel':{'vtr':{'x':0.12528279781960072,'y':-0.9187941379693554,'z':0.374328134934635},'orthogVtr':{'x':0.991349898036944,'y':0.10105959155285664,'z':-0.08373970753060234},'minZoom':1.8}},{'longitude':357.2104166666667,'latitude':-2.6641666666666666,'magnitude':5.49,'b_v':0.94,'constell':'Psc','desigNo':'20','bsNo':'9012','serialNo':1405,'main':false,'letterLabel':{'vtr':{'x':-0.028652001620239263,'y':0.3602157985763293,'z':0.9324288934064469},'orthogVtr':{'x':0.060853003549255553,'y':0.9317102701956649,'z':-0.35806826775205214},'minZoom':0.5}},{'longitude':47.1375,'latitude':79.48527777777778,'magnitude':5.49,'b_v':1.57,'constell':'','desigNo':'','bsNo':'881','serialNo':1406,'main':false,'letterLabel':{'vtr':{'x':-0.3235675720818071,'y':0.16754579239521583,'z':0.9312531523424465},'orthogVtr':{'x':-0.938026803320232,'y':0.0723210821933454,'z':-0.3389327032365132},'minZoom':1.8}},{'longitude':15.81875,'latitude':-31.458055555555553,'magnitude':5.5,'b_v':0.08,'letter':'sigma','constell':'Scl','desigNo':'','bsNo':'293','serialNo':1407,'main':false,'letterLabel':{'vtr':{'x':-0.566259828464316,'y':-0.7971335335305905,'z':-0.2095899243489497},'orthogVtr':{'x':0.07597768211156287,'y':-0.3036863744128451,'z':0.9497378468908859},'minZoom':0.5}},{'longitude':204.40166666666667,'latitude':71.15333333333334,'magnitude':5.5,'b_v':1.22,'constell':'','desigNo':'','bsNo':'5139','serialNo':1408,'main':false,'letterLabel':{'vtr':{'x':-0.5007466899391257,'y':-0.03368417906763671,'z':-0.8649382224156523},'orthogVtr':{'x':0.8140704568535251,'y':0.32127563722421565,'z':-0.48380911132849413},'minZoom':1.8}},{'longitude':352.53375,'latitude':-87.38555555555556,'magnitude':5.5,'b_v':1.28,'letter':'tau','constell':'Oct','desigNo':'','bsNo':'8862','serialNo':1409,'main':false,'letterLabel':{'vtr':{'x':0.9349329705712832,'y':0.04023753418147615,'z':-0.35253550371806586},'orthogVtr':{'x':-0.3519300506627543,'y':-0.0214861253873932,'z':-0.9357796673663883},'minZoom':0.5}},{'longitude':161.8375,'latitude':18.79888888888889,'magnitude':5.5,'b_v':1.13,'constell':'Leo','desigNo':'51','bsNo':'4208','serialNo':1410,'main':false,'letterLabel':{'vtr':{'x':-0.20944066570659892,'y':-0.91068075874276,'z':-0.35608308469244615},'orthogVtr':{'x':0.38347498479817094,'y':0.2584902499210817,'z':-0.8866395697969831},'minZoom':0.5}},{'longitude':21.910833333333333,'latitude':19.330555555555556,'magnitude':5.5,'b_v':1.11,'constell':'Psc','desigNo':'94','bsNo':'414','serialNo':1411,'main':false,'letterLabel':{'vtr':{'x':-0.4831797354397682,'y':0.5842185616718483,'z':-0.6520935634235568},'orthogVtr':{'x':0.010135966046659811,'y':-0.7410235990190273,'z':-0.6714024783162397},'minZoom':0.5}},{'longitude':296.11083333333335,'latitude':25.814722222222223,'magnitude':5.5,'b_v':0.94,'constell':'Vul','desigNo':'10','bsNo':'7506','serialNo':1412,'main':false,'letterLabel':{'vtr':{'x':0.8264940150651842,'y':-0.5526072224435266,'z':-0.10739134399327369},'orthogVtr':{'x':-0.39992726868039297,'y':-0.7106319271088176,'z':0.5788440583952199},'minZoom':0.5}},{'longitude':34.46458333333333,'latitude':-6.3422222222222215,'magnitude':5.51,'b_v':0.96,'constell':'Cet','desigNo':'67','bsNo':'666','serialNo':1413,'main':false,'letterLabel':{'vtr':{'x':0.1531390513281468,'y':-0.9033882446463091,'z':0.4005472636196333},'orthogVtr':{'x':0.5523427996843524,'y':0.41435103122366723,'z':0.7233468425041583},'minZoom':0.5}},{'longitude':45.57666666666667,'latitude':-71.83416666666666,'magnitude':5.51,'b_v':-0.13,'letter':'theta','constell':'Hyi','desigNo':'','bsNo':'939','serialNo':1414,'main':false,'letterLabel':{'vtr':{'x':-0.4195628881487491,'y':0.11465262504625706,'z':-0.9004564167455761},'orthogVtr':{'x':-0.8811046726404383,'y':-0.28992118783090304,'z':0.37363118271619705},'minZoom':0.5}},{'longitude':62.54708333333333,'latitude':19.654166666666665,'magnitude':5.51,'b_v':1.08,'constell':'Tau','desigNo':'43','bsNo':'1283','serialNo':1415,'main':false,'letterLabel':{'vtr':{'x':0.9006727766338839,'y':-0.1444381852120306,'z':0.40978794526348006},'orthogVtr':{'x':-0.01712328205885842,'y':0.9305974697293985,'z':0.3656434636975945},'minZoom':0.5}},{'longitude':154.7325,'latitude':-29.08,'magnitude':5.52,'b_v':0.28,'letter':'AG','constell':'Ant','desigNo':'','bsNo':'4049','serialNo':1416,'main':false,'letterLabel':{'vtr':{'x':0.0749994780531581,'y':0.5275327880358732,'z':-0.8462176054885956},'orthogVtr':{'x':-0.6080770637564638,'y':0.696766574671174,'z':0.3804715823216197},'minZoom':0.5}},{'longitude':328.0595833333333,'latitude':-69.54694444444445,'magnitude':5.52,'b_v':1.38,'letter':'omicron','constell':'Ind','desigNo':'','bsNo':'8333','serialNo':1417,'main':false,'letterLabel':{'vtr':{'x':0.6977256141488465,'y':0.08037023154049625,'z':-0.711842393541395},'orthogVtr':{'x':-0.652109230631834,'y':-0.34007177250010534,'z':-0.6775726830926662},'minZoom':0.5}},{'longitude':43.11541666666667,'latitude':15.153333333333334,'magnitude':5.52,'b_v':-0.1,'letter':'sigma','constell':'Ari','desigNo':'43','bsNo':'847','serialNo':1418,'main':false,'letterLabel':{'vtr':{'x':0.347830679189568,'y':-0.9375573681724889,'z':0},'orthogVtr':{'x':0.6185120025676595,'y':0.2294659049604189,'z':0.7515239857386055},'minZoom':0.5}},{'longitude':245.16416666666666,'latitude':-30.947777777777777,'magnitude':5.53,'b_v':0.47,'constell':'','desigNo':'','bsNo':'6077','serialNo':1419,'main':false,'letterLabel':{'vtr':{'x':-0.6647461878083237,'y':-0.44384948631044857,'z':-0.6009244039779481},'orthogVtr':{'x':-0.6544853170672749,'y':0.7338513383355899,'z':0.18196478496240096},'minZoom':1.8}},{'longitude':179.14375,'latitude':15.549444444444445,'magnitude':5.53,'b_v':0.12,'constell':'Leo','desigNo':'95','bsNo':'4564','serialNo':1420,'main':false,'letterLabel':{'vtr':{'x':0.10022907390991921,'y':0.408881404698949,'z':0.9070667724233836},'orthogVtr':{'x':-0.24904387574290554,'y':-0.872327087484715,'z':0.4207405380937127},'minZoom':0.5}},{'longitude':310.4379166666667,'latitude':32.37027777777778,'magnitude':5.53,'b_v':0.87,'constell':'Cyg','desigNo':'49','bsNo':'7921','main':false,'serialNo':1421,'letterLabel':{'vtr':{'x':-0.678127190920345,'y':-0.16580546436725851,'z':0.7159972492408331},'orthogVtr':{'x':-0.48992278515091264,'y':0.8281711530339612,'z':-0.2722282238717577},'minZoom':0.6}},{'longitude':65.2375,'latitude':14.07611111111111,'magnitude':5.58,'b_v':0.28,'letter':'v483','constell':'Tau','desigNo':'57','bsNo':'1351','serialNo':1422,'main':false,'letterLabel':{'vtr':{'x':0.24344854594284157,'y':-0.957896522511336,'z':-0.15220728510490475},'orthogVtr':{'x':0.880720465492333,'y':0.1525871887507784,'z':0.4483844460862825},'minZoom':1.9}},{'longitude':69.24166666666666,'latitude':-62.043055555555554,'magnitude':5.59,'b_v':1.5,'letter':'R','constell':'Dor','desigNo':'','bsNo':'1492','serialNo':1423,'main':false,'letterLabel':{'vtr':{'x':-0.8134348509630256,'y':0.12852046777966167,'z':-0.5672796775845731},'orthogVtr':{'x':-0.5574183284742781,'y':-0.4508473844437639,'z':0.6971523814928545},'minZoom':0.5}},{'longitude':298.1279166666667,'latitude':47.073055555555555,'magnitude':5.6,'b_v':-0.08,'constell':'','desigNo':'','bsNo':'7589','serialNo':1424,'main':false,'letterLabel':{'vtr':{'x':0.635581199327181,'y':0.3035698553779126,'z':-0.7098463791325949},'orthogVtr':{'x':0.7020986743558352,'y':-0.6096681612332794,'z':0.3679160021611061},'minZoom':1.8}},{'longitude':298.5570833333333,'latitude':-3.068055555555556,'magnitude':5.63,'b_v':0.23,'letter':'v1291','constell':'Aql','desigNo':'','bsNo':'7575','serialNo':1425,'main':false,'letterLabel':{'vtr':{'x':0.486960095616487,'y':-0.814742864538907,'z':-0.3147442294310068},'orthogVtr':{'x':-0.7314423378221744,'y':-0.5773469070919849,'z':0.3628534901479539},'minZoom':0.5}},{'longitude':66.10583333333334,'latitude':16.816666666666666,'magnitude':5.64,'b_v':0.31,'constell':'Tau','desigNo':'63','bsNo':'1376','serialNo':1426,'main':false,'letterLabel':{'vtr':{'x':0.9020717403532441,'y':-0.31435108937270556,'z':0.2957194073209644},'orthogVtr':{'x':0.18956406773711595,'y':0.9041476469136295,'z':0.3828609366382322},'minZoom':2.3}},{'longitude':211.77333333333334,'latitude':-76.88,'magnitude':5.69,'b_v':1.24,'letter':'theta','constell':'Aps','desigNo':'','bsNo':'5261','serialNo':1427,'main':false,'letterLabel':{'vtr':{'x':-0.9731123878979987,'y':0.17434555398851082,'z':-0.15051879724437645},'orthogVtr':{'x':-0.12575119689499054,'y':0.14535703250591114,'z':0.9813551699464127},'minZoom':0.5}},{'longitude':48.249583333333334,'latitude':-57.25666666666667,'magnitude':5.71,'b_v':2.42,'letter':'TW','constell':'Hor','desigNo':'','bsNo':'977','serialNo':1428,'main':false,'letterLabel':{'vtr':{'x':0.1003019843286197,'y':0.4649574275203741,'z':-0.8796329362486249},'orthogVtr':{'x':-0.9274817002538336,'y':-0.27633692492897577,'z':-0.25182454132799664},'minZoom':0.5}},{'longitude':266.01958333333334,'latitude':24.32138888888889,'magnitude':5.73,'b_v':0.68,'constell':'Her','desigNo':'84','bsNo':'6608','serialNo':1429,'main':false,'letterLabel':{'vtr':{'x':-0.14951413552967374,'y':-0.9045063978269362,'z':0.39939166186458447},'orthogVtr':{'x':-0.9867341824079536,'y':0.11065258901254951,'z':-0.1187924989741658},'minZoom':0.5}},{'longitude':205.27208333333334,'latitude':-50.03805555555555,'magnitude':5.74,'b_v':1.5,'letter':'v744','constell':'Cen','desigNo':'','bsNo':'5134','serialNo':1430,'main':false,'letterLabel':{'vtr':{'x':-0.48119692891427446,'y':0.05157623576541881,'z':-0.8750939421043554},'orthogVtr':{'x':-0.6565921152577974,'y':0.6402044796284507,'z':0.39877941075857526},'minZoom':1.6}},{'longitude':328.8691666666667,'latitude':56.69444444444444,'magnitude':5.74,'b_v':0.66,'constell':'Cep','desigNo':'13','bsNo':'8371','main':false,'serialNo':1431,'letterLabel':{'vtr':{'x':0.3764903062404147,'y':-0.4807343487474921,'z':0.7919277335977845},'orthogVtr':{'x':-0.7983293822836136,'y':0.2653479458182356,'z':0.5406113807835595},'minZoom':0.5}},{'longitude':39.26083333333333,'latitude':6.969444444444445,'magnitude':5.79,'b_v':0.92,'constell':'','desigNo':'','bsNo':'753','serialNo':1432,'main':false,'letterLabel':{'vtr':{'x':-0.4215654407228385,'y':0.8346092633230024,'z':-0.3545559994748282},'orthogVtr':{'x':-0.4812593456292919,'y':-0.5373118093645557,'z':-0.6925932874074462},'minZoom':1.8}},{'longitude':108.37541666666667,'latitude':24.097777777777775,'magnitude':5.85,'b_v':0.4,'constell':'Gem','desigNo':'48','bsNo':'2706','serialNo':1433,'main':false,'letterLabel':{'vtr':{'x':-0.5179461782683774,'y':0.6945149935135032,'z':0.49938029616928337},'orthogVtr':{'x':-0.8055563381082445,'y':-0.5924053268363385,'z':-0.011615286030355304},'minZoom':0.5}},{'longitude':353.93875,'latitude':71.7388888888889,'magnitude':5.86,'b_v':1.68,'constell':'','desigNo':'','bsNo':'8952','serialNo':1434,'main':false,'letterLabel':{'vtr':{'x':0.0758832066970172,'y':0.009840561632556949,'z':-0.9970681532814766},'orthogVtr':{'x':0.9471797774372676,'y':-0.3131934139727594,'z':0.06899532345004754},'minZoom':1.8}},{'longitude':321.625,'latitude':36.743611111111115,'magnitude':5.93,'b_v':0.03,'constell':'Cyg','desigNo':'69','bsNo':'8209','main':false,'serialNo':1435,'letterLabel':{'vtr':{'x':0.7151701472124529,'y':-0.1921897123802907,'z':-0.6720080170587993},'orthogVtr':{'x':0.3064113438772962,'y':-0.7779316798586143,'z':0.5485748716589777},'minZoom':0.5}},{'longitude':314.2995833333333,'latitude':44.99277777777778,'magnitude':5.96,'b_v':0.02,'constell':'','desigNo':'','bsNo':'8023','serialNo':1436,'main':false,'letterLabel':{'vtr':{'x':0.19642257175664657,'y':0.47632465971555105,'z':-0.857049002012936},'orthogVtr':{'x':0.847035045234123,'y':-0.5227244686281843,'z':-0.09638859913189812},'minZoom':1.8}},{'longitude':35.7475,'latitude':-73.56666666666666,'magnitude':5.99,'b_v':1.09,'letter':'kappa','constell':'Hyi','desigNo':'','bsNo':'715','serialNo':1437,'main':false,'letterLabel':{'vtr':{'x':0.1855025336518691,'y':-0.12357252057408247,'z':0.9748428807596151},'orthogVtr':{'x':0.9554434289451118,'y':0.25448372816973175,'z':-0.1495522857813992},'minZoom':0.5}},{'longitude':295.5704166666667,'latitude':50.566111111111105,'magnitude':5.99,'b_v':0.64,'constell':'Cyg','desigNo':'16','bsNo':'7503','main':false,'serialNo':1438,'letterLabel':{'vtr':{'x':0.4080539355333873,'y':0.4460817377029308,'z':-0.7965570092489602},'orthogVtr':{'x':0.8708205768038262,'y':-0.4521882170943795,'z':0.1928661176465635},'minZoom':6.4}},{'longitude':62.17333333333333,'latitude':15.208333333333332,'magnitude':6.02,'b_v':0.4,'constell':'','desigNo':'','bsNo':'1279','serialNo':1439,'main':false,'letterLabel':{'vtr':{'x':0.868290579855348,'y':0.09371746931890301,'z':0.48712267949555},'orthogVtr':{'x':-0.20776439681100053,'y':0.9604167078283985,'z':0.18556320416995947},'minZoom':1.8}},{'longitude':340.09166666666664,'latitude':37.68444444444444,'magnitude':6.03,'b_v':0.85,'constell':'','desigNo':'','bsNo':'8626','serialNo':1440,'main':false,'letterLabel':{'vtr':{'x':0.6266805186996799,'y':-0.7784657083431229,'z':0.035534045873502014},'orthogVtr':{'x':-0.23150414427144703,'y':-0.14243781205769976,'z':0.9623498848554826},'minZoom':1.8}},{'longitude':316.9266666666667,'latitude':38.82833333333333,'magnitude':6.05,'b_v':1.31,'constell':'Cyg','desigNo':'61','bsNo':'8086','main':false,'serialNo':1441,'letterLabel':{'vtr':{'x':-0.16510906689928553,'y':-0.5467002761435859,'z':0.8208884236558426},'orthogVtr':{'x':-0.8055461155943384,'y':0.554980580787523,'z':0.2075861522347202}}},{'longitude':51.80166666666667,'latitude':49.18111111111111,'magnitude':6.09,'b_v':-0.07,'constell':'','desigNo':'','bsNo':'1029','serialNo':1442,'main':false,'letterLabel':{'vtr':{'x':0.8690674747788153,'y':-0.4928849313499168,'z':-0.04226308944884407},'orthogVtr':{'x':0.28518028007313434,'y':0.42935892059911474,'z':0.8569265576228641},'minZoom':1.8}},{'longitude':169.46416666666667,'latitude':-7.230277777777778,'magnitude':6.11,'b_v':0.21,'letter':'SV','constell':'Crt','desigNo':'','bsNo':'4369','serialNo':1443,'main':false,'letterLabel':{'vtr':{'x':0.18558449886147926,'y':-0.9124071500069917,'z':-0.36478978384605604},'orthogVtr':{'x':0.11959589907701126,'y':0.3894522863190202,'z':-0.9132490008781006},'minZoom':0.5}},{'longitude':344.8883333333333,'latitude':-35.42972222222222,'magnitude':6.15,'b_v':0.58,'constell':'','desigNo':'','bsNo':'8732','serialNo':1444,'main':false,'letterLabel':{'vtr':{'x':-0.6094908320576652,'y':-0.674267173777432,'z':0.4169948488936635},'orthogVtr':{'x':0.09850145094638199,'y':0.4575009480638478,'z':0.8837365821794058},'minZoom':1.8}},{'longitude':210.8475,'latitude':9.601944444444444,'magnitude':6.18,'b_v':0.85,'constell':'','desigNo':'','bsNo':'5270','serialNo':1445,'main':false,'letterLabel':{'vtr':{'x':-0.4100456642467848,'y':-0.8099494419608853,'z':-0.4193381150094318},'orthogVtr':{'x':-0.3395406623193631,'y':0.5622801123682689,'z':-0.7540246772267172},'minZoom':1.8}},{'longitude':298.28583333333336,'latitude':18.717777777777776,'magnitude':6.24,'b_v':-0.03,'constell':'Sge','desigNo':'9','bsNo':'7574','serialNo':1446,'main':false,'letterLabel':{'vtr':{'x':0.7640691407979301,'y':-0.6218076246996466,'z':-0.17191168065520332},'orthogVtr':{'x':-0.46343270539542264,'y':-0.7144046854752073,'z':0.5242671770585585},'minZoom':0.5}},{'longitude':84.05958333333334,'latitude':-4.4141666666666675,'magnitude':6.24,'b_v':-0.15,'constell':'','desigNo':'','bsNo':'1891','serialNo':1447,'main':false,'letterLabel':{'vtr':{'x':-0.9140657759488431,'y':0.38580467451506917,'z':-0.1250540297685816},'orthogVtr':{'x':-0.39221953196040454,'y':-0.9193644853496831,'z':0.030541477149504836},'minZoom':1.8}},{'longitude':295.5829166666667,'latitude':50.558611111111105,'magnitude':6.25,'b_v':0.66,'constell':'Cyg','desigNo':'16','bsNo':'7504','main':false,'serialNo':1448,'letterLabel':{'vtr':{'x':0.9153341026684358,'y':-0.02703158838870595,'z':-0.40178697554967235},'orthogVtr':{'x':0.29480072621461456,'y':-0.6347131900657184,'z':0.7143050456072217}}},{'longitude':352.6095833333333,'latitude':-4.437222222222222,'magnitude':6.26,'b_v':1.12,'constell':'','desigNo':'','bsNo':'8924','serialNo':1449,'main':false,'letterLabel':{'vtr':{'x':0.12222345347065386,'y':0.9116771997414264,'z':-0.3923086933695694},'orthogVtr':{'x':0.08656565221539886,'y':-0.4035580129871011,'z':-0.9108497779603539},'minZoom':1.8}},{'longitude':315.14875,'latitude':-18.96638888888889,'magnitude':6.26,'b_v':-0.11,'letter':'AO','constell':'Cap','desigNo':'20','bsNo':'8033','serialNo':1450,'main':false,'letterLabel':{'vtr':{'x':-0.5791954379554,'y':-0.7910978203954033,'z':0.1967152338211122},'orthogVtr':{'x':-0.4637106725919039,'y':0.518199292017838,'z':0.7186389259402637},'minZoom':0.5}},{'longitude':62.73833333333334,'latitude':59.95305555555556,'magnitude':6.29,'b_v':1.11,'constell':'','desigNo':'','bsNo':'1270','serialNo':1451,'main':false,'letterLabel':{'vtr':{'x':-0.03726572551825166,'y':-0.44913764957986996,'z':-0.8926850718094643},'orthogVtr':{'x':0.9726298057228165,'y':-0.2213261667682343,'z':0.07075301352787844},'minZoom':1.8}},{'longitude':98.40041666666667,'latitude':-11.180277777777777,'magnitude':6.3,'b_v':1.1,'constell':'','desigNo':'','bsNo':'2392','serialNo':1452,'main':false,'letterLabel':{'vtr':{'x':-0.9663428019381523,'y':0.2391006256709728,'z':0.09493408211001218},'orthogVtr':{'x':-0.21363899783445253,'y':-0.9514383685912632,'z':0.22163801428610283},'minZoom':1.8}},{'longitude':64.19166666666666,'latitude':15.443055555555556,'magnitude':6.31,'b_v':0.4,'constell':'Tau','desigNo':'48','bsNo':'1319','serialNo':1453,'main':false,'letterLabel':{'vtr':{'x':0.9011484382286756,'y':-0.007661168809718788,'z':0.4334429590736111},'orthogVtr':{'x':-0.1087694211989341,'y':0.9638651304537791,'z':0.24317323723503892},'minZoom':1.9}},{'longitude':102.88708333333334,'latitude':-8.0625,'magnitude':6.31,'b_v':0.01,'letter':'v592','constell':'Mon','desigNo':'','bsNo':'2534','serialNo':1454,'main':false,'letterLabel':{'vtr':{'x':-0.5161253166298222,'y':0.8564893668503701,'z':-0.006373539520386923},'orthogVtr':{'x':-0.8275570066672955,'y':-0.4967443961950853,'z':0.26152324096463403},'minZoom':0.5}},{'longitude':103.74916666666667,'latitude':-42.38861111111111,'magnitude':6.32,'b_v':2.29,'letter':'NP','constell':'Pup','desigNo':'','bsNo':'2591','serialNo':1455,'main':false,'letterLabel':{'vtr':{'x':0.8356197919634183,'y':0.28326234113144333,'z':-0.4706399997617578},'orthogVtr':{'x':-0.5205042045223083,'y':0.6821119322704626,'z':-0.5136133613223618},'minZoom':0.5}},{'longitude':207.10458333333332,'latitude':-62.67666666666666,'magnitude':6.4,'b_v':null,'letter':'v766','constell':'Cen','desigNo':'','bsNo':'5171','serialNo':1456,'main':false,'letterLabel':{'vtr':{'x':-0.6208893780256425,'y':0.10261674115600894,'z':-0.7771526135125918},'orthogVtr':{'x':-0.6689854432395647,'y':0.44739386427256267,'z':0.5935462972210572},'minZoom':1.3}},{'longitude':33.73583333333333,'latitude':58.641666666666666,'magnitude':6.43,'b_v':0.55,'constell':'','desigNo':'','bsNo':'641','serialNo':1457,'main':false,'letterLabel':{'vtr':{'x':-0.9008253267716982,'y':0.3971184993216722,'z':-0.17552956486918744},'orthogVtr':{'x':0.0351204283283649,'y':-0.3363054773450591,'z':-0.941097859641464},'minZoom':1.8}},{'longitude':35.057916666666664,'latitude':-2.898888888888889,'magnitude':6.47,'b_v':0.97,'letter':'omicron','constell':'Cet','desigNo':'68','bsNo':'681','serialNo':1458,'main':true,'letterLabel':{'vtr':{'x':-0.05620768433218044,'y':0.9843736330560036,'z':-0.16688093589783884},'orthogVtr':{'x':-0.5731445296316572,'y':-0.1686738400683106,'z':-0.8019067800124379},'minZoom':0.5},'shortNameLabel':{'vtr':{'x':-0.16464523031286804,'y':-0.9750840284587962,'z':-0.1486710650388581},'orthogVtr':{'x':0.5518567783038479,'y':-0.21599409997458524,'z':0.8054816230158615},'minZoom':0.5}},{'longitude':101.45958333333333,'latitude':-52.22027777777778,'magnitude':6.56,'b_v':1.08,'constell':'','desigNo':'','bsNo':'2513','serialNo':1459,'main':false,'letterLabel':{'vtr':{'x':0.6781066411179846,'y':0.3755189474591244,'z':-0.6317886540377852},'orthogVtr':{'x':-0.7248150821304361,'y':0.4840431928728752,'z':-0.4902502260577568},'minZoom':1.8}},{'longitude':84.05791666666667,'latitude':-4.483888888888889,'magnitude':6.57,'b_v':-0.14,'letter':'v1046','constell':'Ori','desigNo':'','bsNo':'1890','serialNo':1460,'main':false,'letterLabel':{'vtr':{'x':-0.9644610283086029,'y':-0.25165016377044114,'z':-0.08054265918271099},'orthogVtr':{'x':0.2432352606457073,'y':-0.9646555216159081,'z':0.10137224765464767},'minZoom':1.6}},{'longitude':115.38916666666667,'latitude':-31.702777777777776,'magnitude':6.6,'b_v':1.07,'letter':'R','constell':'Pup','desigNo':'','bsNo':'2974','serialNo':1461,'main':false,'letterLabel':{'vtr':{'x':0.715207606668341,'y':-0.6867023542938642,'z':0.13006904309253628},'orthogVtr':{'x':0.5961617803435633,'y':0.5022709126095009,'z':-0.626350590327823},'minZoom':0.5}},{'longitude':43.61541666666667,'latitude':-49.81888888888889,'magnitude':7.22,'b_v':1.04,'letter':'R','constell':'Hor','desigNo':'','bsNo':'868','serialNo':1462,'main':false,'letterLabel':{'vtr':{'x':-0.8531695567627496,'y':-0.5216336908341459,'z':0},'orthogVtr':{'x':0.23216469006618823,'y':-0.3797221099791068,'z':0.8954946542997819},'minZoom':0.5}},{'longitude':143.17083333333332,'latitude':-62.86666666666667,'magnitude':7.43,'b_v':0.91,'letter':'R','constell':'Car','desigNo':'','bsNo':'3816','serialNo':1463,'main':false,'letterLabel':{'vtr':{'x':0.9186363621084392,'y':-0.2966438506517993,'z':-0.2609782751162352},'orthogVtr':{'x':-0.15116103408003065,'y':0.34640387419918917,'z':-0.9258264943906326},'minZoom':0.5}},{'longitude':297.8095833333333,'latitude':32.95916666666667,'magnitude':7.91,'b_v':2.1,'letter':'chi','constell':'Cyg','desigNo':'','bsNo':'7564','main':false,'serialNo':1464,'letterLabel':{'vtr':{'x':0.15989653061849723,'y':-0.8344551476121027,'z':0.5273686624362808},'orthogVtr':{'x':-0.9062009386872825,'y':0.08777119903958397,'z':0.4136376135477067},'minZoom':0.5}},{'longitude':240.05875,'latitude':25.87138888888889,'magnitude':10.08,'b_v':1.34,'letter':'T','constell':'CrB','desigNo':'','bsNo':'5958','main':false,'serialNo':1465,'letterLabel':{'vtr':{'x':0.3382039625206852,'y':-0.7246880292506452,'z':0.6003710019613897},'orthogVtr':{'x':-0.8270051168182793,'y':-0.5333139110011846,'z':-0.17787301394254557},'minZoom':0.5}},{'longitude':147.12458333333333,'latitude':11.346944444444444,'magnitude':10.35,'b_v':1.5,'letter':'R','constell':'Leo','desigNo':'','bsNo':'3882','serialNo':1466,'main':false,'letterLabel':{'vtr':{'x':-0.5139998969114734,'y':0.13861728962410338,'z':0.8465160087040658},'orthogVtr':{'x':-0.24032432951903365,'y':-0.9706054138009964,'z':0.01301335242831099},'minZoom':0.5}},{'longitude':6.2404166666666665,'latitude':38.67361111111111,'magnitude':10.71,'b_v':2.08,'letter':'R','constell':'And','desigNo':'','bsNo':'90','serialNo':1467,'main':false,'letterLabel':{'vtr':{'x':-0.5440730980991422,'y':0.5954481568560172,'z':-0.5911226238451489},'orthogVtr':{'x':0.31885012293334053,'y':-0.5049381623181456,'z':-0.80210476331971},'minZoom':0.5}}];var mainStars=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,201,202,203,204,205,206,207,208,210,211,212,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,263,264,265,266,267,268,269,270,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,353,354,355,356,357,358,359,360,361,362,363,364,365,368,369,370,371,372,373,374,375,376,378,380,381,382,383,384,387,388,389,390,391,392,393,394,395,396,397,398,399,401,402,403,406,407,409,410,411,412,413,414,415,416,417,418,419,421,422,423,424,426,427,428,429,430,431,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,452,453,454,455,456,457,458,459,460,461,462,520,527,554,597,598,613,628,638,640,701,740,758,848,942,957,1024,1083,1120,1458];

var unit = 10000;
var distance = 500000.0 * unit;
var Star = function () {
	function Star(values) {
		classCallCheck(this, Star);
		if (values) {
			Object.assign(this, values);
			if (this.magnitude) {
				this.intensity = Math.pow(10, -(this.magnitude + 1.44) / 2.5);
			} else {
				console.log('star without magnitude: ' + this.letter + ' ' + this.constell);
			}
		}
	}
	createClass(Star, [{
		key: 'getGreekLetter',
		value: function getGreekLetter() {
			var letter = this.letter;
			if (!letter) return undefined;
			var idx = letter.indexOf('^');
			if (idx !== -1) {
				var superscript = letter.slice(idx + 1);
				letter = letter.slice(0, idx);
				letter = greekAlpha[letter] || letter;
				if (!letter) return undefined;
				for (var jdx = 0; jdx < superscript.length; jdx++) {
					letter += superscripts[superscript.charAt(jdx)];
				}
			} else if (letter === 'L$_{2}') {
				letter = 'L' + subscripts['2'];
			} else {
				letter = greekAlpha[letter] || letter;
			}
			return letter;
		}
	}, {
		key: 'getLongName',
		value: function getLongName() {
			var longName = '';
			longName += this.getGreekLetter() || this.desigNo || 'Bright Star #' + this.bsNo;
			longName += ' ' + this.getConstellationName('gen');
			var starName = this.getCommonName();
			if (starName) {
				longName += ' (' + starName + ')';
			}
			return longName;
		}
	}, {
		key: 'getShortName',
		value: function getShortName() {
			var shortName = this.getGreekLetter() || this.desigNo;
			var starName = this.getWellKnownName();
			if (starName) {
				shortName += ' ' + starName;
			}
			return shortName;
		}
	}, {
		key: 'getBrightStarNumber',
		value: function getBrightStarNumber() {
			var number = '000' + this.bsNo;
			return number.substring(number.length - 4);
		}
	}, {
		key: 'getLabel',
		value: function getLabel() {
			return this.getGreekLetter() || this.desigNo;
		}
	}, {
		key: 'getLetter',
		value: function getLetter() {
			return this.getGreekLetter() || this.desigNo || this.getBrightStarNumber();
		}
	}, {
		key: 'getDataString',
		value: function getDataString() {
			var data = this.getLongName();
			data += '; RA: ' + Utils.roundTo2(this.longitude) + '&deg;, D: ' + Utils.roundTo2(this.latitude) + '&deg;';
			if (this.magnitude) {
				data += '; mag: ' + this.magnitude;
			}
			return data;
		}
	}, {
		key: 'getCommonName',
		value: function getCommonName() {
			var letter = this.letter || this.desigNo;
			if (this.constell) {
				var constellStars = this.starNames[this.constell];
				return constellStars && constellStars[letter];
			}
			return undefined;
		}
	}, {
		key: 'getWellKnownName',
		value: function getWellKnownName() {
			var letter = this.letter || this.desigNo;
			if (this.constell) {
				var constellStars = Star.wellKnownStarNames[this.constell];
				return constellStars && constellStars[letter];
			}
			return undefined;
		}
	}, {
		key: 'getConstellationName',
		value: function getConstellationName(idx) {
			if (this.constell) {
				var name = constellations[this.constell][idx];
				return name ? name : this.constell;
			} else {
				return '';
			}
		}
	}, {
		key: 'getNameColorCode',
		value: function getNameColorCode() {
			if (this.constell) {
				return constellations[this.constell].color;
			} else {
				return colors.length - 1;
			}
		}
	}, {
		key: 'getConstellationColor',
		value: function getConstellationColor() {
			if (this.constell) {
				return constellations[this.constell].color;
			} else {
				return colors[colors.length - 1];
			}
		}
	}]);
	return Star;
}();
Star.prototype.starNames = {
	And: {
		alpha: 'Alpheratz',
		beta: 'Mirach'
	},
	Aql: {
		alpha: 'Altair'
	},
	Ari: {
		alpha: 'Hamal'
	},
	Aur: {
		alpha: 'Capella'
	},
	Boo: {
		alpha: 'Arcturus',
		beta: 'Nekkar',
		gamma: 'Seginus'
	},
	CMa: {
		alpha: 'Sirius',
		beta: 'Mirzam'
	},
	CMi: {
		alpha: 'Procyon',
		beta: 'Gomeisa'
	},
	CVn: {
		alpha: 'Cor Caroli'
	},
	Cas: {
		alpha: 'Schedar'
	},
	Car: {
		alpha: 'Canopus'
	},
	Cen: {
		alpha: 'Rigil Kentaurus'
	},
	Cep: {
		alpha: 'Alderamin'
	},
	Cet: {
		alpha: 'Menkar',
		omicron: 'Mira'
	},
	CrB: {
		alpha: 'Alphecca'
	},
	Cru: {
		alpha: 'Acrux',
		beta: 'Mimosa',
		gamma: 'Gacrux'
	},
	Cyg: {
		alpha: 'Deneb',
		beta: 'Albireo',
		gamma: 'Sadr'
	},
	Eri: {
		alpha: 'Achernar'
	},
	Gem: {
		'alpha^1': 'Castor',
		beta: 'Pollux'
	},
	Her: {
		alpha: 'Ras Algethi'
	},
	Hya: {
		alpha: 'Alphard'
	},
	Leo: {
		alpha: 'Regulus',
		beta: 'Denebola',
		gamma: 'Algieba',
		delta: 'Zosma'
	},
	Lyr: {
		alpha: 'Vega',
		beta: 'Sheliak',
		gamma: 'Sulafat',
		eta: 'Aladfar',
		mu: 'Alathfar'
	},
	Ori: {
		alpha: 'Betelgeuse',
		beta: 'Rigel',
		gamma: 'Bellatrix',
		delta: 'Mintaka',
		epsilon: 'Alnilam',
		zeta: 'Alnitak'
	},
	Peg: {
		alpha: 'Markab',
		beta: 'Scheat',
		gamma: 'Algenib',
		epsilon: 'Enif',
		zeta: 'Homam',
		theta: 'Biham',
		eta: 'Matar'
	},
	Per: {
		alpha: 'Mirfak',
		beta: 'Algol'
	},
	PsA: {
		alpha: 'Fomalhaut'
	},
	Sco: {
		alpha: 'Antares'
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
		'28': 'Pleione'
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
		'80': 'Alcor'
	},
	UMi: {
		alpha: 'Polaris',
		beta: 'Kochab',
		gamma: 'Pherkad',
		delta: 'Yildun'
	},
	Vir: {
		alpha: 'Spica'
	}
};
Star.wellKnownStarNames = {
	And: {
		alpha: 'Alpheratz'
	},
	Aql: {
		alpha: 'Altair'
	},
	Ari: {
		alpha: 'Hamal'
	},
	Aur: {
		alpha: 'Capella'
	},
	Boo: {
		alpha: 'Arcturus'
	},
	CMa: {
		alpha: 'Sirius'
	},
	CMi: {
		alpha: 'Procyon'
	},
	CVn: {
		'alpha^2': 'Cor Caroli'
	},
	Car: {
		alpha: 'Canopus'
	},
	Cen: {
		alpha: 'Rigil Kentaurus'
	},
	Cet: {
		omicron: 'Mira'
	},
	CrB: {
		alpha: 'Alphecca'
	},
	Cyg: {
		alpha: 'Deneb',
		beta: 'Albireo'
	},
	Eri: {
		alpha: 'Achernar'
	},
	Gem: {
		'alpha^1': 'Castor',
		beta: 'Pollux'
	},
	Her: {
		alpha: 'Ras Algethi'
	},
	Leo: {
		alpha: 'Regulus',
		beta: 'Denebola'
	},
	Lyr: {
		alpha: 'Vega'
	},
	Ori: {
		alpha: 'Betelgeuse',
		beta: 'Rigel',
		gamma: 'Bellatrix'
	},
	Per: {
		beta: 'Algol'
	},
	PsA: {
		alpha: 'Fomalhaut'
	},
	Sco: {
		alpha: 'Antares'
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
		'28': 'Pleione'
	},
	UMi: {
		alpha: 'Polaris'
	},
	Vir: {
		alpha: 'Spica'
	}
};
Star.prototype.starExplan = {
	Aql: {
		alpha: 'Summer Triangle'
	},
	CMa: {
		alpha: 'Dog Star'
	},
	Cyg: {
		alpha: 'Tail, Summer Triangle'
	},
	Lyr: {
		alpha: 'Summer Triangle'
	},
	Ori: {
		gamma: 'Xena Warrior Princess'
	}
};
Star.prototype.starGroups = {
	'Guard Stars': [5563, 5735],
	'Pointer Stars': [4301, 4295],
	'Hyades': [1412, 1394, 1346, 1376, 1373, 1389, 1409],
	'Pleiades': [27, 1165, 1156, 1142, 1145, 1149],
	'Belt': [1948, 1903, 1852],
	'Sword': [1899, 1890, 1931],
	'The Kids': [1605, 1612, 1641],
	'Horse and Rider': [5054, 5062]
};

function bvToColor(b_v, level) {
	var min = 1.0 - level / 10;
	var comin = 1.0 - min;
	var r, g, b;
	if (b_v < -0.33) {
		r = g = min;
		b = 1.0;
	} else if (b_v <= .20) {
		b = 1.0;
		r = g = 1.0 - comin * (.20 - b_v) / .53;
	} else if (b_v <= .60) {
		r = g = 1.0;
		b = 1.0 + comin * (0.20 - b_v) / 0.48;
	} else if (b_v <= 1.64) {
		b = min;
		g = 1.0 + comin * (0.68 - b_v) / 0.94;
		r = 1.0;
	} else {
		b = min;
		g = min;
		r = 1.0;
	}
	return new THREE$1.Color(r, g, b);
}
var starGeom = new THREE$1.CircleBufferGeometry(unit, 32);
var DecoratedStar = function (_Star) {
	inherits(DecoratedStar, _Star);
	function DecoratedStar(starData, zoom, colorLevel, baseBrightness, baseRadius) {
		classCallCheck(this, DecoratedStar);
		var _this = possibleConstructorReturn(this, (DecoratedStar.__proto__ || Object.getPrototypeOf(DecoratedStar)).call(this, starData));
		_this.group = null;
		var material = new THREE$1.MeshBasicMaterial({
			color: 0xffffff,
			lights: false,
			side: THREE$1.FrontSide
		});
		_this.mesh = new THREE$1.Mesh(starGeom, material);
		_this.mesh.star = _this;
		var theta = _this.longitude * Math.PI / 180;
		var phi = (90 - _this.latitude) * Math.PI / 180;
		_this.spherical = new THREE$1.Spherical(distance, phi, Math.PI / 2 + theta);
		_this.mesh.position.setFromSpherical(_this.spherical);
		_this.updateBrightnessAndRadius(zoom, colorLevel, baseBrightness, baseRadius);
		return _this;
	}
	createClass(DecoratedStar, [{
		key: 'updateBrightnessAndRadius',
		value: function updateBrightnessAndRadius(zoom, colorLevel, baseBrightness, baseRadius) {
			zoom = zoom === undefined ? ssettings.get('view', 'zoom') : zoom;
			baseBrightness = baseBrightness || ssettings.get('stars', 'starbrightness');
			baseRadius = baseRadius || ssettings.get('stars', 'starradius');
			var color = this.getColor(colorLevel);
			var brightness = this.intensity;
			var intrinsicBrightness = (color.r + color.g + color.b) / 3.0;
			brightness *= baseBrightness * zoom * zoom / intrinsicBrightness;
			var radius = baseRadius / zoom;
			if (brightness > 1.0) {
				radius *= Math.sqrt(brightness);
				brightness = 1.0;
			}
			this.mesh.scale.set(radius, radius, radius);
			this.mesh.material.color = color.multiplyScalar(Math.min(brightness, 1.0));
			this.radius = radius * unit;
		}
	}, {
		key: 'addToGroup',
		value: function addToGroup(group) {
			if (this.group === group) {
				return this;
			}
			if (this.group) {
				this.group.remove(this.mesh);
			}
			group.add(this.mesh);
			this.mesh.lookAt(Utils.origin);
			this.group = group;
			return this;
		}
	}, {
		key: 'removeFromGroup',
		value: function removeFromGroup() {
			if (this.group) {
				this.group.remove(this.mesh);
				this.group = null;
			}
		}
	}, {
		key: 'getColor',
		value: function getColor(colorLevel) {
			colorLevel = colorLevel === undefined ? ssettings.get('stars', 'colorlevel') : colorLevel;
			return bvToColor(this.b_v, colorLevel);
		}
	}, {
		key: 'setPosition',
		value: function setPosition(pos) {
			this.mesh.position.copy(pos);
			return this;
		}
	}, {
		key: 'getPosition',
		value: function getPosition() {
			return this.mesh.position;
		}
	}]);
	return DecoratedStar;
}(Star);

var viewer = void 0;
var Viewer = function () {
	function Viewer(fov, aspect, near, far) {
		classCallCheck(this, Viewer);
		this.camera = new THREE$1.PerspectiveCamera(fov, aspect, near, far);
		var cameraHelper = new THREE.Object3D();
		cameraHelper.visible = false;
		this.camera.helper = cameraHelper;
		this.camera.position.set(0, .5 * this.camera.near, 0);
		this.cameraGroup = new THREE$1.Group();
		this.cameraGroup.name = 'cameraGroup';
		this.cameraInnerGroup = new THREE$1.Group();
		this.cameraGroup.add(this.cameraInnerGroup);
		this.cameraInnerGroup.add(this.camera);
		this.cameraInnerGroup.add(this.camera.helper);
	}
	createClass(Viewer, [{
		key: 'getZoom',
		value: function getZoom() {
			return this.camera.zoom;
		}
	}, {
		key: 'setZoom',
		value: function setZoom(zoom) {
			this.camera.zoom = zoom;
			return zoom;
		}
	}, {
		key: 'setHomePlanet',
		value: function setHomePlanet(planetName) {
			var planet = planets[planetName];
			planet = planet || planets.earth;
			var oldHomePlanet = this.homePlanet;
			this.homePlanet = planet;
			planet.updateRadius();
			planet.updateColor();
			switch (planet.name) {
				case 'Earth':
					planets.moon.updateRadius();
					break;
				case 'Moon':
					planets.earth.updateRadius();
					break;
				default:
					break;
			}
			planet.group.add(this.cameraGroup);
			this.setAltitude(ssettings.get('location', 'altitude'));
			planet.group.updateMatrixWorld();
			if (oldHomePlanet) {
				oldHomePlanet.updateRadius();
				oldHomePlanet.updateColor();
				switch (oldHomePlanet.name) {
					case 'Earth':
						planets.moon.updateRadius();
						break;
					case 'Moon':
						planets.earth.updateRadius();
						break;
					default:
						break;
				}
			}
			this.setCameraPosition();
			this.camera.updateProjectionMatrix();
		}
	}, {
		key: 'setLatLong',
		value: function setLatLong(latitude, longitude) {
			Utils.setLatLong(this.cameraGroup, latitude, longitude);
		}
	}, {
		key: 'rotate',
		value: function rotate(elevation, rotation) {
			Utils.rotate(this.camera, elevation, rotation);
		}
	}, {
		key: 'rotateDegrees',
		value: function rotateDegrees(elevation, rotation) {
			this.rotate(Utils.radians(elevation), Utils.radians(rotation));
		}
	}, {
		key: 'updateProjectionMatrix',
		value: function updateProjectionMatrix() {
			this.camera.updateProjectionMatrix();
		}
	}, {
		key: 'setCameraPosition',
		value: function setCameraPosition() {
			this.setLatLong(ssettings.get('location', 'latitude'), ssettings.get('location', 'longitude'));
			this.setAltitude(ssettings.get('location', 'altitude'));
		}
	}, {
		key: 'setAltitude',
		value: function setAltitude(alt) {
			if (this.homePlanet) {
				this.cameraInnerGroup.position.set(0, alt * this.homePlanet.eqRadius * 1.001, 0);
			}
		}
	}, {
		key: 'displayDirectionText',
		value: function displayDirectionText(font) {
			var material = new THREE.MeshBasicMaterial({
				color: 0x444444,
				transparent: true,
				opacity: 0.5
			});
			var sqrt2 = Math.sqrt(2);
			var tgE = new THREE.TextGeometry('E', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmE = new THREE.Mesh(tgE, material);
			tmE.position.x = -0.035;
			tmE.position.y = 0;
			tmE.position.z = -5;
			tmE.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmE);
			var tgNE = new THREE.TextGeometry('NE', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmNE = new THREE.Mesh(tgNE, material);
			tmNE.position.x = -5 / sqrt2;
			tmNE.position.y = 0;
			tmNE.position.z = -5 / sqrt2;
			tmNE.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmNE);
			var tgN = new THREE.TextGeometry('N', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmN = new THREE.Mesh(tgN, material);
			tmN.position.x = -5;
			tmN.position.y = 0;
			tmN.position.z = 0.04;
			tmN.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmN);
			var tgNW = new THREE.TextGeometry('NW', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmNW = new THREE.Mesh(tgNW, material);
			tmNW.position.x = -5 / sqrt2;
			tmNW.position.y = 0;
			tmNW.position.z = 5 / sqrt2;
			tmNW.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmNW);
			var tgW = new THREE.TextGeometry('W', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmW = new THREE.Mesh(tgW, material);
			tmW.position.x = 0.055;
			tmW.position.y = 0;
			tmW.position.z = 5;
			tmW.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmW);
			var tgSW = new THREE.TextGeometry('SW', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmSW = new THREE.Mesh(tgSW, material);
			tmSW.position.x = 5 / sqrt2;
			tmSW.position.y = 0;
			tmSW.position.z = 5 / sqrt2;
			tmSW.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmSW);
			var tgS = new THREE.TextGeometry('S', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmS = new THREE.Mesh(tgS, material);
			tmS.position.x = 5;
			tmS.position.y = 0;
			tmS.position.z = -0.03;
			tmS.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmS);
			var tgSE = new THREE.TextGeometry('SE', {
				font: font,
				size: 0.1,
				height: 0.1
			});
			var tmSE = new THREE.Mesh(tgSE, material);
			tmSE.position.x = 5 / sqrt2;
			tmSE.position.y = 0;
			tmSE.position.z = -5 / sqrt2;
			tmSE.lookAt(this.camera.position);
			this.cameraInnerGroup.add(tmSE);
			var nameGeom = new THREE.TextGeometry('\u0394\u039F\u0393\u039F\u03A5\u039B\u0397\u03A3', {
				font: font,
				size: 0.065,
				height: 0.03
			});
			var nameMesh = new THREE.Mesh(nameGeom, material);
			nameMesh.position.x = -0.22;
			nameMesh.position.y = -0.15;
			nameMesh.position.z = -5;
			nameMesh.lookAt(this.camera.position);
			this.cameraInnerGroup.add(nameMesh);
		}
	}, {
		key: 'onWindowResize',
		value: function onWindowResize() {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		}
	}], [{
		key: 'createViewer',
		value: function createViewer(fov, aspect, near, far) {
			if (!viewer) {
				viewer = new Viewer(fov, aspect, near, far);
			}
			return viewer;
		}
	}, {
		key: 'getViewer',
		value: function getViewer() {
			return viewer;
		}
	}]);
	return Viewer;
}();

var sind$2 = Utils.sind;
var cosd$2 = Utils.cosd;
var asind = Utils.asind;
var moonElements = function moonElements(t) {
	var t2 = t * t;
	var t3 = t * t2;
	var t4 = t * t3;
	var t2e4 = t2 * 1e-4;
	var t3e6 = t3 * 1e-6;
	var t4e8 = t4 * 1e-8;
	var sa = 3400.4 * cosd$2(235.7004 + 890534.2230 * t - 32.601 * t2e4 + 3.664 * t3e6 - 1.769 * t4e8) - 635.6 * cosd$2(100.7370 + 413335.3554 * t - 122.571 * t2e4 - 10.684 * t3e6 + 5.028 * t4e8) - 235.6 * cosd$2(134.9634 + 477198.8676 * t + 89.970 * t2e4 + 14.348 * t3e6 - 6.797 * t4e8) + 218.1 * cosd$2(238.1713 + 854535.1727 * t - 31.065 * t2e4 + 3.623 * t3e6 - 1.769 * t4e8) + 181.0 * cosd$2(10.6638 + 1367733.0907 * t + 57.370 * t2e4 + 18.011 * t3e6 - 8.566 * t4e8) - 39.9 * cosd$2(103.2079 + 377336.3051 * t - 121.035 * t2e4 - 10.724 * t3e6 + 5.028 * t4e8) - 38.4 * cosd$2(233.2295 + 926533.2733 * t - 34.136 * t2e4 + 3.705 * t3e6 - 1.769 * t4e8) + 33.8 * cosd$2(336.4374 + 1303869.5784 * t - 155.171 * t2e4 - 7.020 * t3e6 + 3.259 * t4e8) + 28.8 * cosd$2(111.4008 + 1781068.4461 * t - 65.201 * t2e4 + 7.328 * t3e6 - 3.538 * t4e8) + 12.6 * cosd$2(13.1347 + 1331734.0404 * t + 58.906 * t2e4 + 17.971 * t3e6 - 8.566 * t4e8) + 11.4 * cosd$2(186.5442 + 966404.0351 * t - 68.058 * t2e4 - 0.567 * t3e6 + 0.232 * t4e8) - 11.1 * cosd$2(222.5657 - 441199.8173 * t - 91.506 * t2e4 - 14.307 * t3e6 + 6.797 * t4e8) - 10.2 * cosd$2(269.9268 + 954397.7353 * t + 179.941 * t2e4 + 28.695 * t3e6 - 13.594 * t4e8) + 9.7 * cosd$2(145.6272 + 1844931.9583 * t + 147.340 * t2e4 + 32.359 * t3e6 - 15.363 * t4e8) + 9.6 * cosd$2(240.6422 + 818536.1225 * t - 29.529 * t2e4 + 3.582 * t3e6 - 1.769 * t4e8) + 8.0 * cosd$2(297.8502 + 445267.1115 * t - 16.300 * t2e4 + 1.832 * t3e6 - 0.884 * t4e8) - 6.2 * cosd$2(132.4925 + 513197.9179 * t + 88.434 * t2e4 + 14.388 * t3e6 - 6.797 * t4e8) + 6.0 * cosd$2(173.5506 + 1335801.3346 * t - 48.901 * t2e4 + 5.496 * t3e6 - 2.653 * t4e8) + 3.7 * cosd$2(113.8717 + 1745069.3958 * t - 63.665 * t2e4 + 7.287 * t3e6 - 3.538 * t4e8) + 3.6 * cosd$2(338.9083 + 1267870.5281 * t - 153.636 * t2e4 - 7.061 * t3e6 + 3.259 * t4e8) + 3.2 * cosd$2(246.3642 + 2258267.3137 * t + 24.769 * t2e4 + 21.675 * t3e6 - 10.335 * t4e8) - 3.0 * cosd$2(8.1929 + 1403732.1410 * t + 55.834 * t2e4 + 18.052 * t3e6 - 8.566 * t4e8) + 2.3 * cosd$2(98.2661 + 449334.4057 * t - 124.107 * t2e4 - 10.643 * t3e6 + 5.028 * t4e8) - 2.2 * cosd$2(357.5291 + 35999.0503 * t - 1.536 * t2e4 + 0.041 * t3e6 + 0.000 * t4e8) - 2.0 * cosd$2(38.5872 + 858602.4669 * t - 138.871 * t2e4 - 8.852 * t3e6 + 4.144 * t4e8) - 1.8 * cosd$2(105.6788 + 341337.2548 * t - 119.499 * t2e4 - 10.765 * t3e6 + 5.028 * t4e8) - 1.7 * cosd$2(201.4740 + 826670.7108 * t - 245.142 * t2e4 - 21.367 * t3e6 + 10.057 * t4e8) + 1.6 * cosd$2(184.1196 + 401329.0556 * t + 125.428 * t2e4 + 18.579 * t3e6 - 8.798 * t4e8) - 1.4 * cosd$2(308.4192 - 489205.1674 * t + 158.029 * t2e4 + 14.915 * t3e6 - 7.029 * t4e8) + 1.3 * cosd$2(325.7736 - 63863.5122 * t - 212.541 * t2e4 - 25.031 * t3e6 + 11.826 * t4e8);
	var sapp = -0.55 * cosd$2(238.2 + 854535.2 * t) + 0.10 * cosd$2(103.2 + 377336.3 * t) + 0.10 * cosd$2(233.2 + 926533.3 * t);
	var sma = 383397.6 + sa + sapp * t;
	var se = 0.014217 * cosd$2(100.7370 + 413335.3554 * t - 122.571 * t2e4 - 10.684 * t3e6 + 5.028 * t4e8) + 0.008551 * cosd$2(325.7736 - 63863.5122 * t - 212.541 * t2e4 - 25.031 * t3e6 + 11.826 * t4e8) - 0.001383 * cosd$2(134.9634 + 477198.8676 * t + 89.970 * t2e4 + 14.348 * t3e6 - 6.797 * t4e8) + 0.001353 * cosd$2(10.6638 + 1367733.0907 * t + 57.370 * t2e4 + 18.011 * t3e6 - 8.566 * t4e8) - 0.001146 * cosd$2(66.5106 + 349471.8432 * t - 335.112 * t2e4 - 35.715 * t3e6 + 16.854 * t4e8) - 0.000915 * cosd$2(201.4740 + 826670.7108 * t - 245.142 * t2e4 - 21.367 * t3e6 + 10.057 * t4e8) + 0.000869 * cosd$2(103.2079 + 377336.3051 * t - 121.035 * t2e4 - 10.724 * t3e6 + 5.028 * t4e8) - 0.000628 * cosd$2(235.7004 + 890534.2230 * t - 32.601 * t2e4 + 3.664 * t3e6 - 1.769 * t4e8) - 0.000393 * cosd$2(291.5472 - 127727.0245 * t - 425.082 * t2e4 - 50.062 * t3e6 + 23.651 * t4e8) + 0.000284 * cosd$2(328.2445 - 99862.5625 * t - 211.005 * t2e4 - 25.072 * t3e6 + 11.826 * t4e8) - 0.000278 * cosd$2(162.8868 - 31931.7561 * t - 106.271 * t2e4 - 12.516 * t3e6 + 5.913 * t4e8) - 0.000240 * cosd$2(269.9268 + 954397.7353 * t + 179.941 * t2e4 + 28.695 * t3e6 - 13.594 * t4e8) + 0.000230 * cosd$2(111.4008 + 1781068.4461 * t - 65.201 * t2e4 + 7.328 * t3e6 - 3.538 * t4e8) + 0.000229 * cosd$2(167.2476 + 762807.1986 * t - 457.683 * t2e4 - 46.398 * t3e6 + 21.882 * t4e8) - 0.000202 * cosd$2(83.3826 - 12006.2998 * t + 247.999 * t2e4 + 29.262 * t3e6 - 13.826 * t4e8) + 0.000190 * cosd$2(190.8102 - 541062.3799 * t - 302.511 * t2e4 - 39.379 * t3e6 + 18.623 * t4e8) + 0.000177 * cosd$2(357.5291 + 35999.0503 * t - 1.536 * t2e4 + 0.041 * t3e6 + 0.000 * t4e8) + 0.000153 * cosd$2(32.2842 + 285608.3309 * t - 547.653 * t2e4 - 60.746 * t3e6 + 28.679 * t4e8) - 0.000137 * cosd$2(44.8902 + 1431596.6029 * t + 269.911 * t2e4 + 43.043 * t3e6 - 20.392 * t4e8) + 0.000122 * cosd$2(145.6272 + 1844931.9583 * t + 147.340 * t2e4 + 32.359 * t3e6 - 15.363 * t4e8) + 0.000116 * cosd$2(302.2110 + 1240006.0662 * t - 367.713 * t2e4 - 32.051 * t3e6 + 15.085 * t4e8) - 0.000111 * cosd$2(203.9449 + 790671.6605 * t - 243.606 * t2e4 - 21.408 * t3e6 + 10.057 * t4e8) - 0.000108 * cosd$2(68.9815 + 313472.7929 * t - 333.576 * t2e4 - 35.756 * t3e6 + 16.854 * t4e8) + 0.000096 * cosd$2(336.4374 + 1303869.5784 * t - 155.171 * t2e4 - 7.020 * t3e6 + 3.259 * t4e8) - 0.000090 * cosd$2(98.2661 + 449334.4057 * t - 124.107 * t2e4 - 10.643 * t3e6 + 5.028 * t4e8) + 0.000090 * cosd$2(13.1347 + 1331734.0404 * t + 58.906 * t2e4 + 17.971 * t3e6 - 8.566 * t4e8) + 0.000056 * cosd$2(55.8468 - 1018261.2475 * t - 392.482 * t2e4 - 53.726 * t3e6 + 25.420 * t4e8) - 0.000056 * cosd$2(238.1713 + 854535.1727 * t - 31.065 * t2e4 + 3.623 * t3e6 - 1.769 * t4e8) + 0.000052 * cosd$2(308.4192 - 489205.1674 * t + 158.029 * t2e4 + 14.915 * t3e6 - 7.029 * t4e8) - 0.000050 * cosd$2(133.0212 + 698943.6863 * t - 670.224 * t2e4 - 71.429 * t3e6 + 33.708 * t4e8) - 0.000049 * cosd$2(267.9846 + 1176142.5540 * t - 580.254 * t2e4 - 57.082 * t3e6 + 26.911 * t4e8) - 0.000049 * cosd$2(184.1196 + 401329.0556 * t + 125.428 * t2e4 + 18.579 * t3e6 - 8.798 * t4e8) - 0.000045 * cosd$2(49.1562 - 75869.8120 * t + 35.458 * t2e4 + 4.231 * t3e6 - 2.001 * t4e8) + 0.000044 * cosd$2(257.3208 - 191590.5367 * t - 637.623 * t2e4 - 75.093 * t3e6 + 35.477 * t4e8) + 0.000042 * cosd$2(105.6788 + 341337.2548 * t - 119.499 * t2e4 - 10.765 * t3e6 + 5.028 * t4e8) + 0.000042 * cosd$2(160.4159 + 4067.2942 * t - 107.806 * t2e4 - 12.475 * t3e6 + 5.913 * t4e8) + 0.000040 * cosd$2(246.3642 + 2258267.3137 * t + 24.769 * t2e4 + 21.675 * t3e6 - 10.335 * t4e8) - 0.000040 * cosd$2(156.5838 - 604925.8921 * t - 515.053 * t2e4 - 64.410 * t3e6 + 30.448 * t4e8) + 0.000036 * cosd$2(169.7185 + 726808.1483 * t - 456.147 * t2e4 - 46.439 * t3e6 + 21.882 * t4e8) + 0.000029 * cosd$2(113.8717 + 1745069.3958 * t - 63.665 * t2e4 + 7.287 * t3e6 - 3.538 * t4e8) - 0.000029 * cosd$2(297.8502 + 445267.1115 * t - 16.300 * t2e4 + 1.832 * t3e6 - 0.884 * t4e8) - 0.000028 * cosd$2(294.0181 - 163726.0747 * t - 423.546 * t2e4 - 50.103 * t3e6 + 23.651 * t4e8) + 0.000027 * cosd$2(263.6238 + 381403.5993 * t - 228.841 * t2e4 - 23.199 * t3e6 + 10.941 * t4e8) - 0.000026 * cosd$2(358.0578 + 221744.8187 * t - 760.194 * t2e4 - 85.777 * t3e6 + 40.505 * t4e8) - 0.000026 * cosd$2(8.1929 + 1403732.1410 * t + 55.834 * t2e4 + 18.052 * t3e6 - 8.566 * t4e8);
	var sedp = -0.0022 * cosd$2(103.2 + 377336.3 * t);
	var ecc = 0.055544 + se + 1e-3 * t * sedp;
	var sg = 0.0011776 * cosd$2(49.1562 - 75869.8120 * t + 35.458 * t2e4 + 4.231 * t3e6 - 2.001 * t4e8) - 0.0000971 * cosd$2(235.7004 + 890534.2230 * t - 32.601 * t2e4 + 3.664 * t3e6 - 1.769 * t4e8) + 0.0000908 * cosd$2(186.5442 + 966404.0351 * t - 68.058 * t2e4 - 0.567 * t3e6 + 0.232 * t4e8) + 0.0000623 * cosd$2(83.3826 - 12006.2998 * t + 247.999 * t2e4 + 29.262 * t3e6 - 13.826 * t4e8) + 0.0000483 * cosd$2(51.6271 - 111868.8623 * t + 36.994 * t2e4 + 4.190 * t3e6 - 2.001 * t4e8) + 0.0000348 * cosd$2(100.7370 + 413335.3554 * t - 122.571 * t2e4 - 10.684 * t3e6 + 5.028 * t4e8) - 0.0000316 * cosd$2(308.4192 - 489205.1674 * t + 158.029 * t2e4 + 14.915 * t3e6 - 7.029 * t4e8) - 0.0000253 * cosd$2(46.6853 - 39870.7617 * t + 33.922 * t2e4 + 4.272 * t3e6 - 2.001 * t4e8) - 0.0000141 * cosd$2(274.1928 - 553068.6797 * t - 54.513 * t2e4 - 10.116 * t3e6 + 4.797 * t4e8) + 0.0000127 * cosd$2(325.7736 - 63863.5122 * t - 212.541 * t2e4 - 25.031 * t3e6 + 11.826 * t4e8) + 0.0000117 * cosd$2(184.1196 + 401329.0556 * t + 125.428 * t2e4 + 18.579 * t3e6 - 8.798 * t4e8) - 0.0000078 * cosd$2(98.3124 - 151739.6240 * t + 70.916 * t2e4 + 8.462 * t3e6 - 4.001 * t4e8) - 0.0000063 * cosd$2(238.1713 + 854535.1727 * t - 31.065 * t2e4 + 3.623 * t3e6 - 1.769 * t4e8) + 0.0000063 * cosd$2(134.9634 + 477198.8676 * t + 89.970 * t2e4 + 14.348 * t3e6 - 6.797 * t4e8) + 0.0000036 * cosd$2(321.5076 + 1443602.9027 * t + 21.912 * t2e4 + 13.780 * t3e6 - 6.566 * t4e8) - 0.0000035 * cosd$2(10.6638 + 1367733.0907 * t + 57.370 * t2e4 + 18.011 * t3e6 - 8.566 * t4e8) + 0.0000024 * cosd$2(149.8932 + 337465.5434 * t - 87.113 * t2e4 - 6.453 * t3e6 + 3.028 * t4e8) + 0.0000024 * cosd$2(170.9849 - 930404.9848 * t + 66.523 * t2e4 + 0.608 * t3e6 - 0.232 * t4e8);
	var sgp = -0.0203 * cosd$2(125.0 - 1934.1 * t) + 0.0034 * cosd$2(220.2 - 1935.5 * t);
	var gamma = 0.0449858 + sg + 1e-3 * sgp;
	var sp = -15.448 * sind$2(100.7370 + 413335.3554 * t - 122.571 * t2e4 - 10.684 * t3e6 + 5.028 * t4e8) - 9.642 * sind$2(325.7736 - 63863.5122 * t - 212.541 * t2e4 - 25.031 * t3e6 + 11.826 * t4e8) - 2.721 * sind$2(134.9634 + 477198.8676 * t + 89.970 * t2e4 + 14.348 * t3e6 - 6.797 * t4e8) + 2.607 * sind$2(66.5106 + 349471.8432 * t - 335.112 * t2e4 - 35.715 * t3e6 + 16.854 * t4e8) + 2.085 * sind$2(201.4740 + 826670.7108 * t - 245.142 * t2e4 - 21.367 * t3e6 + 10.057 * t4e8) + 1.477 * sind$2(10.6638 + 1367733.0907 * t + 57.370 * t2e4 + 18.011 * t3e6 - 8.566 * t4e8) + 0.968 * sind$2(291.5472 - 127727.0245 * t - 425.082 * t2e4 - 50.062 * t3e6 + 23.651 * t4e8) - 0.949 * sind$2(103.2079 + 377336.3051 * t - 121.035 * t2e4 - 10.724 * t3e6 + 5.028 * t4e8) - 0.703 * sind$2(167.2476 + 762807.1986 * t - 457.683 * t2e4 - 46.398 * t3e6 + 21.882 * t4e8) - 0.660 * sind$2(235.7004 + 890534.2230 * t - 32.601 * t2e4 + 3.664 * t3e6 - 1.769 * t4e8) - 0.577 * sind$2(190.8102 - 541062.3799 * t - 302.511 * t2e4 - 39.379 * t3e6 + 18.623 * t4e8) - 0.524 * sind$2(269.9268 + 954397.7353 * t + 179.941 * t2e4 + 28.695 * t3e6 - 13.594 * t4e8) - 0.482 * sind$2(32.2842 + 285608.3309 * t - 547.653 * t2e4 - 60.746 * t3e6 + 28.679 * t4e8) + 0.452 * sind$2(357.5291 + 35999.0503 * t - 1.536 * t2e4 + 0.041 * t3e6 + 0.000 * t4e8) - 0.381 * sind$2(302.2110 + 1240006.0662 * t - 367.713 * t2e4 - 32.051 * t3e6 + 15.085 * t4e8) - 0.342 * sind$2(328.2445 - 99862.5625 * t - 211.005 * t2e4 - 25.072 * t3e6 + 11.826 * t4e8) - 0.312 * sind$2(44.8902 + 1431596.6029 * t + 269.911 * t2e4 + 43.043 * t3e6 - 20.392 * t4e8) + 0.282 * sind$2(162.8868 - 31931.7561 * t - 106.271 * t2e4 - 12.516 * t3e6 + 5.913 * t4e8) + 0.255 * sind$2(203.9449 + 790671.6605 * t - 243.606 * t2e4 - 21.408 * t3e6 + 10.057 * t4e8) + 0.252 * sind$2(68.9815 + 313472.7929 * t - 333.576 * t2e4 - 35.756 * t3e6 + 16.854 * t4e8) - 0.211 * sind$2(83.3826 - 12006.2998 * t + 247.999 * t2e4 + 29.262 * t3e6 - 13.826 * t4e8) + 0.193 * sind$2(267.9846 + 1176142.5540 * t - 580.254 * t2e4 - 57.082 * t3e6 + 26.911 * t4e8) + 0.191 * sind$2(133.0212 + 698943.6863 * t - 670.224 * t2e4 - 71.429 * t3e6 + 33.708 * t4e8) - 0.184 * sind$2(55.8468 - 1018261.2475 * t - 392.482 * t2e4 - 53.726 * t3e6 + 25.420 * t4e8) + 0.182 * sind$2(145.6272 + 1844931.9583 * t + 147.340 * t2e4 + 32.359 * t3e6 - 15.363 * t4e8) - 0.158 * sind$2(257.3208 - 191590.5367 * t - 637.623 * t2e4 - 75.093 * t3e6 + 35.477 * t4e8) + 0.148 * sind$2(156.5838 - 604925.8921 * t - 515.053 * t2e4 - 64.410 * t3e6 + 30.448 * t4e8) - 0.111 * sind$2(169.7185 + 726808.1483 * t - 456.147 * t2e4 - 46.439 * t3e6 + 21.882 * t4e8) + 0.101 * sind$2(13.1347 + 1331734.0404 * t + 58.906 * t2e4 + 17.971 * t3e6 - 8.566 * t4e8) + 0.100 * sind$2(358.0578 + 221744.8187 * t - 760.194 * t2e4 - 85.777 * t3e6 + 40.505 * t4e8) + 0.087 * sind$2(98.2661 + 449334.4057 * t - 124.107 * t2e4 - 10.643 * t3e6 + 5.028 * t4e8) + 0.080 * sind$2(42.9480 + 1653341.4216 * t - 490.283 * t2e4 - 42.734 * t3e6 + 20.113 * t4e8) + 0.080 * sind$2(222.5657 - 441199.8173 * t - 91.506 * t2e4 - 14.307 * t3e6 + 6.797 * t4e8) + 0.077 * sind$2(294.0181 - 163726.0747 * t - 423.546 * t2e4 - 50.103 * t3e6 + 23.651 * t4e8) - 0.073 * sind$2(280.8834 - 1495460.1151 * t - 482.452 * t2e4 - 68.074 * t3e6 + 32.217 * t4e8) - 0.071 * sind$2(304.6819 + 1204007.0159 * t - 366.177 * t2e4 - 32.092 * t3e6 + 15.085 * t4e8) - 0.069 * sind$2(233.7582 + 1112279.0417 * t - 792.795 * t2e4 - 82.113 * t3e6 + 38.736 * t4e8) - 0.067 * sind$2(34.7551 + 249609.2807 * t - 546.117 * t2e4 - 60.787 * t3e6 + 28.679 * t4e8) - 0.067 * sind$2(263.6238 + 381403.5993 * t - 228.841 * t2e4 - 23.199 * t3e6 + 10.941 * t4e8) + 0.055 * sind$2(21.6203 - 1082124.7597 * t - 605.023 * t2e4 - 78.757 * t3e6 + 37.246 * t4e8) + 0.055 * sind$2(308.4192 - 489205.1674 * t + 158.029 * t2e4 + 14.915 * t3e6 - 7.029 * t4e8) - 0.054 * sind$2(8.7216 + 1589477.9094 * t - 702.824 * t2e4 - 67.766 * t3e6 + 31.939 * t4e8) - 0.052 * sind$2(179.8536 + 1908795.4705 * t + 359.881 * t2e4 + 57.390 * t3e6 - 27.189 * t4e8) - 0.050 * sind$2(98.7948 + 635080.1741 * t - 882.765 * t2e4 - 96.461 * t3e6 + 45.533 * t4e8) - 0.049 * sind$2(128.6604 - 95795.2683 * t - 318.812 * t2e4 - 37.547 * t3e6 + 17.738 * t4e8) - 0.047 * sind$2(17.3544 + 425341.6552 * t - 370.570 * t2e4 - 39.946 * t3e6 + 18.854 * t4e8) - 0.044 * sind$2(160.4159 + 4067.2942 * t - 107.806 * t2e4 - 12.475 * t3e6 + 5.913 * t4e8) - 0.043 * sind$2(238.1713 + 854535.1727 * t - 31.065 * t2e4 + 3.623 * t3e6 - 1.769 * t4e8) + 0.042 * sind$2(270.4555 + 1140143.5037 * t - 578.718 * t2e4 - 57.123 * t3e6 + 26.911 * t4e8) - 0.042 * sind$2(132.4925 + 513197.9179 * t + 88.434 * t2e4 + 14.388 * t3e6 - 6.797 * t4e8) - 0.041 * sind$2(122.3573 - 668789.4043 * t - 727.594 * t2e4 - 89.441 * t3e6 + 42.274 * t4e8) - 0.040 * sind$2(105.6788 + 341337.2548 * t - 119.499 * t2e4 - 10.765 * t3e6 + 5.028 * t4e8) + 0.038 * sind$2(135.4921 + 662944.6361 * t - 668.688 * t2e4 - 71.470 * t3e6 + 33.708 * t4e8) - 0.037 * sind$2(242.3910 - 51857.2124 * t - 460.540 * t2e4 - 54.293 * t3e6 + 25.652 * t4e8) + 0.036 * sind$2(336.4374 + 1303869.5784 * t - 155.171 * t2e4 - 7.020 * t3e6 + 3.259 * t4e8) + 0.035 * sind$2(223.0943 - 255454.0489 * t - 850.164 * t2e4 - 100.124 * t3e6 + 47.302 * t4e8) - 0.034 * sind$2(193.2811 - 577061.4302 * t - 300.976 * t2e4 - 39.419 * t3e6 + 18.623 * t4e8) + 0.031 * sind$2(87.6023 - 918398.6850 * t - 181.476 * t2e4 - 28.654 * t3e6 + 13.594 * t4e8);
	var spp = 2.4 * sind$2(103.2 + 377336.3 * t);
	var lp = 83.353 + 4069.0137 * t - 103.238 * t2e4 - 12.492 * t3e6 + 5.263 * t4e8 + sp + 1e-3 * t * spp;
	var sr = -1.4979 * sind$2(49.1562 - 75869.8120 * t + 35.458 * t2e4 + 4.231 * t3e6 - 2.001 * t4e8) - 0.1500 * sind$2(357.5291 + 35999.0503 * t - 1.536 * t2e4 + 0.041 * t3e6 + 0.000 * t4e8) - 0.1226 * sind$2(235.7004 + 890534.2230 * t - 32.601 * t2e4 + 3.664 * t3e6 - 1.769 * t4e8) + 0.1176 * sind$2(186.5442 + 966404.0351 * t - 68.058 * t2e4 - 0.567 * t3e6 + 0.232 * t4e8) - 0.0801 * sind$2(83.3826 - 12006.2998 * t + 247.999 * t2e4 + 29.262 * t3e6 - 13.826 * t4e8) - 0.0616 * sind$2(51.6271 - 111868.8623 * t + 36.994 * t2e4 + 4.190 * t3e6 - 2.001 * t4e8) + 0.0490 * sind$2(100.7370 + 413335.3554 * t - 122.571 * t2e4 - 10.684 * t3e6 + 5.028 * t4e8) + 0.0409 * sind$2(308.4192 - 489205.1674 * t + 158.029 * t2e4 + 14.915 * t3e6 - 7.029 * t4e8) + 0.0327 * sind$2(134.9634 + 477198.8676 * t + 89.970 * t2e4 + 14.348 * t3e6 - 6.797 * t4e8) + 0.0324 * sind$2(46.6853 - 39870.7617 * t + 33.922 * t2e4 + 4.272 * t3e6 - 2.001 * t4e8) + 0.0196 * sind$2(98.3124 - 151739.6240 * t + 70.916 * t2e4 + 8.462 * t3e6 - 4.001 * t4e8) + 0.0180 * sind$2(274.1928 - 553068.6797 * t - 54.513 * t2e4 - 10.116 * t3e6 + 4.797 * t4e8) + 0.0150 * sind$2(325.7736 - 63863.5122 * t - 212.541 * t2e4 - 25.031 * t3e6 + 11.826 * t4e8) - 0.0150 * sind$2(184.1196 + 401329.0556 * t + 125.428 * t2e4 + 18.579 * t3e6 - 8.798 * t4e8) - 0.0078 * sind$2(238.1713 + 854535.1727 * t - 31.065 * t2e4 + 3.623 * t3e6 - 1.769 * t4e8) - 0.0045 * sind$2(10.6638 + 1367733.0907 * t + 57.370 * t2e4 + 18.011 * t3e6 - 8.566 * t4e8) + 0.0044 * sind$2(321.5076 + 1443602.9027 * t + 21.912 * t2e4 + 13.780 * t3e6 - 6.566 * t4e8) - 0.0042 * sind$2(162.8868 - 31931.7561 * t - 106.271 * t2e4 - 12.516 * t3e6 + 5.913 * t4e8) - 0.0031 * sind$2(170.9849 - 930404.9848 * t + 66.523 * t2e4 + 0.608 * t3e6 - 0.232 * t4e8) + 0.0031 * sind$2(103.2079 + 377336.3051 * t - 121.035 * t2e4 - 10.724 * t3e6 + 5.028 * t4e8) + 0.0029 * sind$2(222.6120 - 1042273.8471 * t + 103.516 * t2e4 + 4.798 * t3e6 - 2.232 * t4e8) + 0.0028 * sind$2(184.0733 + 1002403.0853 * t - 69.594 * t2e4 - 0.526 * t3e6 + 0.232 * t4e8);
	var srp = 25.9 * sind$2(125.0 - 1934.1 * t) - 4.3 * sind$2(220.2 - 1935.5 * t);
	var srpp = 0.38 * sind$2(357.5 + 35999.1 * t);
	var raan = 125.0446 - 1934.13618 * t + 20.762 * t2e4 + 2.139 * t3e6 - 1.650 * t4e8 + sr + 1e-3 * (srp + srpp * t);
	var sl = -0.92581 * sind$2(235.7004 + 890534.2230 * t - 32.601 * t2e4 + 3.664 * t3e6 - 1.769 * t4e8) + 0.33262 * sind$2(100.7370 + 413335.3554 * t - 122.571 * t2e4 - 10.684 * t3e6 + 5.028 * t4e8) - 0.18402 * sind$2(357.5291 + 35999.0503 * t - 1.536 * t2e4 + 0.041 * t3e6 + 0.000 * t4e8) + 0.11007 * sind$2(134.9634 + 477198.8676 * t + 89.970 * t2e4 + 14.348 * t3e6 - 6.797 * t4e8) - 0.06055 * sind$2(238.1713 + 854535.1727 * t - 31.065 * t2e4 + 3.623 * t3e6 - 1.769 * t4e8) + 0.04741 * sind$2(325.7736 - 63863.5122 * t - 212.541 * t2e4 - 25.031 * t3e6 + 11.826 * t4e8) - 0.03086 * sind$2(10.6638 + 1367733.0907 * t + 57.370 * t2e4 + 18.011 * t3e6 - 8.566 * t4e8) + 0.02184 * sind$2(103.2079 + 377336.3051 * t - 121.035 * t2e4 - 10.724 * t3e6 + 5.028 * t4e8) + 0.01645 * sind$2(49.1562 - 75869.8120 * t + 35.458 * t2e4 + 4.231 * t3e6 - 2.001 * t4e8) + 0.01022 * sind$2(233.2295 + 926533.2733 * t - 34.136 * t2e4 + 3.705 * t3e6 - 1.769 * t4e8) - 0.00756 * sind$2(336.4374 + 1303869.5784 * t - 155.171 * t2e4 - 7.020 * t3e6 + 3.259 * t4e8) - 0.00530 * sind$2(222.5657 - 441199.8173 * t - 91.506 * t2e4 - 14.307 * t3e6 + 6.797 * t4e8) - 0.00496 * sind$2(162.8868 - 31931.7561 * t - 106.271 * t2e4 - 12.516 * t3e6 + 5.913 * t4e8) - 0.00472 * sind$2(297.8502 + 445267.1115 * t - 16.300 * t2e4 + 1.832 * t3e6 - 0.884 * t4e8) - 0.00271 * sind$2(240.6422 + 818536.1225 * t - 29.529 * t2e4 + 3.582 * t3e6 - 1.769 * t4e8) + 0.00264 * sind$2(132.4925 + 513197.9179 * t + 88.434 * t2e4 + 14.388 * t3e6 - 6.797 * t4e8) - 0.00254 * sind$2(186.5442 + 966404.0351 * t - 68.058 * t2e4 - 0.567 * t3e6 + 0.232 * t4e8) + 0.00234 * sind$2(269.9268 + 954397.7353 * t + 179.941 * t2e4 + 28.695 * t3e6 - 13.594 * t4e8) - 0.00220 * sind$2(13.1347 + 1331734.0404 * t + 58.906 * t2e4 + 17.971 * t3e6 - 8.566 * t4e8) - 0.00202 * sind$2(355.0582 + 71998.1006 * t - 3.072 * t2e4 + 0.082 * t3e6 + 0.000 * t4e8) + 0.00167 * sind$2(328.2445 - 99862.5625 * t - 211.005 * t2e4 - 25.072 * t3e6 + 11.826 * t4e8) - 0.00143 * sind$2(173.5506 + 1335801.3346 * t - 48.901 * t2e4 + 5.496 * t3e6 - 2.653 * t4e8) - 0.00121 * sind$2(98.2661 + 449334.4057 * t - 124.107 * t2e4 - 10.643 * t3e6 + 5.028 * t4e8) - 0.00116 * sind$2(145.6272 + 1844931.9583 * t + 147.340 * t2e4 + 32.359 * t3e6 - 15.363 * t4e8) + 0.00102 * sind$2(105.6788 + 341337.2548 * t - 119.499 * t2e4 - 10.765 * t3e6 + 5.028 * t4e8) - 0.00090 * sind$2(184.1196 + 401329.0556 * t + 125.428 * t2e4 + 18.579 * t3e6 - 8.798 * t4e8) - 0.00086 * sind$2(338.9083 + 1267870.5281 * t - 153.636 * t2e4 - 7.061 * t3e6 + 3.259 * t4e8) - 0.00078 * sind$2(111.4008 + 1781068.4461 * t - 65.201 * t2e4 + 7.328 * t3e6 - 3.538 * t4e8) + 0.00069 * sind$2(323.3027 - 27864.4619 * t - 214.077 * t2e4 - 24.990 * t3e6 + 11.826 * t4e8) + 0.00066 * sind$2(51.6271 - 111868.8623 * t + 36.994 * t2e4 + 4.190 * t3e6 - 2.001 * t4e8) + 0.00065 * sind$2(38.5872 + 858602.4669 * t - 138.871 * t2e4 - 8.852 * t3e6 + 4.144 * t4e8) - 0.00060 * sind$2(83.3826 - 12006.2998 * t + 247.999 * t2e4 + 29.262 * t3e6 - 13.826 * t4e8) + 0.00054 * sind$2(201.4740 + 826670.7108 * t - 245.142 * t2e4 - 21.367 * t3e6 + 10.057 * t4e8) - 0.00052 * sind$2(308.4192 - 489205.1674 * t + 158.029 * t2e4 + 14.915 * t3e6 - 7.029 * t4e8) + 0.00048 * sind$2(8.1929 + 1403732.1410 * t + 55.834 * t2e4 + 18.052 * t3e6 - 8.566 * t4e8) - 0.00041 * sind$2(46.6853 - 39870.7617 * t + 33.922 * t2e4 + 4.272 * t3e6 - 2.001 * t4e8) - 0.00033 * sind$2(274.1928 - 553068.6797 * t - 54.513 * t2e4 - 10.116 * t3e6 + 4.797 * t4e8) + 0.00030 * sind$2(160.4159 + 4067.2942 * t - 107.806 * t2e4 - 12.475 * t3e6 + 5.913 * t4e8);
	var slp = 3.96 * sind$2(119.7 + 131.8 * t) + 1.96 * sind$2(125.0 - 1934.1 * t);
	var slpp = 0.463 * sind$2(357.5 + 35999.1 * t) + 0.152 * sind$2(238.2 + 854535.2 * t) - 0.071 * sind$2(27.8 + 131.8 * t) - 0.055 * sind$2(103.2 + 377336.3 * t) - 0.026 * sind$2(233.2 + 926533.3 * t);
	var slppp = 14 * sind$2(357.5 + 35999.1 * t) + 5 * sind$2(238.2 + 854535.2 * t);
	var lambda = 218.31665 + 481267.88134 * t - 13.268 * t2e4 + 1.856 * t3e6 - 1.534 * t4e8 + sl + 1e-3 * (slp + slpp * t + slppp * t2e4);
	var computed = {
		a: sma * 1000,
		e: ecc,
		i: 2.0 * asind(gamma),
		w: (lp - raan) % 360,
		o: raan % 360,
		M: (lambda - lp) % 360
	};
	return computed;
};

var sind$1 = Utils.sind;
var cosd$1 = Utils.cosd;
var degrees = Utils.degrees;
var earth = void 0;
var moon = void 0;
var secsPerDay = 24 * 60 * 60;
var millisPerDay = secsPerDay * 1000;
var j2000 = new Date('2000-01-01T11:58:55.816Z');
var j2000_millis = j2000.getTime();
var AU = 149597870.700;
var j2000obliquity = 23.43928;
var julianCenturiesSinceJ2000 = function julianCenturiesSinceJ2000(unixtime) {
	var millisSinceJ2000 = unixtime - j2000_millis;
	var nj = millisSinceJ2000 / millisPerDay;
	return nj / 36525;
};
var tmp$1 = new THREE$1.Vector3();
var Planet = function () {
	function Planet(planetInfoItem) {
		classCallCheck(this, Planet);
		Object.assign(this, planetInfoItem);
		this.radius = this.diamKM / (2 * AU);
		this.eqRadius /= AU;
		this.polarRadius /= AU;
		if (this.rings) {
			this.rings.innerRadius /= AU;
			this.rings.outerRadius /= AU;
		}
		this.ecl = new THREE$1.Vector3();
		if (this.name === 'Moon') {
			moon = this;
			moon.keplerEclipticCoords = moon_keplerEclipticCoords;
			moon.getPosition = moon_getPosition;
		} else if (this.name === 'Earth') {
			earth = this;
			earth.keplerEclipticCoords = earth_keplerEclipticCoords;
		}
	}
	createClass(Planet, [{
		key: 'getName',
		value: function getName() {
			return this.name;
		}
	}, {
		key: 'getShortName',
		value: function getShortName() {
			return this.name;
		}
	}, {
		key: 'getLongName',
		value: function getLongName() {
			return this.name;
		}
	}, {
		key: 'solveKeplerEquation',
		value: function solveKeplerEquation(M, e) {
			var e_deg = degrees(e);
			var E = M + e_deg * sind$1(M);
			for (var idx = 0; idx < 100; idx++) {
				var dM = M - (E - e_deg * sind$1(E));
				var dE = dM / (1 - e * cosd$1(E));
				E += dE;
				if (Math.abs(dE) < Planet.kepler_eq_tol) {
					break;
				}
			}
			return E;
		}
	}, {
		key: 'keplerEclipticCoords',
		value: function keplerEclipticCoords(unixtime, T) {
			T = T || julianCenturiesSinceJ2000(unixtime);
			var a = this.a_0 + this.a_dot * T;
			var e = this.e_0 + this.e_dot * T;
			var i = this.i_0 + this.i_dot * T;
			var l = this.l_0 + this.l_dot * T;
			var obar = this.obar_0 + this.obar_dot * T;
			var oMega = this.oMega_0 + this.oMega_dot * T;
			var omega = obar - oMega;
			var M = l - obar;
			if (this.b) {
				M += this.b * T * T + this.c * cosd$1(this.f * T) + this.s * sind$1(this.f * T);
			}
			M %= 360;
			M = M <= -180 ? M + 360 : M;
			M = M > 180 ? M - 360 : M;
			var E = this.solveKeplerEquation(M, e);
			var xpr = a * (cosd$1(E) - e);
			var ypr = a * Math.sqrt(1 - e * e) * sind$1(E);
			var xecl = (cosd$1(omega) * cosd$1(oMega) - sind$1(omega) * sind$1(oMega) * cosd$1(i)) * xpr + (-sind$1(omega) * cosd$1(oMega) - cosd$1(omega) * sind$1(oMega) * cosd$1(i)) * ypr;
			var yecl = (cosd$1(omega) * sind$1(oMega) + sind$1(omega) * cosd$1(oMega) * cosd$1(i)) * xpr + (-sind$1(omega) * sind$1(oMega) + cosd$1(omega) * cosd$1(oMega) * cosd$1(i)) * ypr;
			var zecl = sind$1(omega) * sind$1(i) * xpr + cosd$1(omega) * sind$1(i) * ypr;
			this.ecl.set(xecl, yecl, zecl);
		}
	}, {
		key: 'getPosition',
		value: function getPosition(unixtime, pos) {
			this.keplerEclipticCoords(unixtime);
			if (pos) {
				pos.copy(this.ecl);
			} else {
				pos = this.ecl.clone();
			}
			return pos;
		}
	}, {
		key: 'getRotationDegrees',
		value: function getRotationDegrees(unixtime) {
			if (this.rotationRate) {
				var millisSinceJ2000 = unixtime - j2000_millis;
				var nj = millisSinceJ2000 / millisPerDay;
				var gmstHours = 24.06570982441908 * nj;
				return (gmstHours * this.rotationRate + this.rotationAtJ2000) % 360;
			}
			return 0;
		}
	}]);
	return Planet;
}();
Planet.kepler_eq_tol = 0.000001;
var planetInfo = {
	mercury: {
		name: 'Mercury',
		diamKM: 4879,
		polarRadius: 2439.7,
		eqRadius: 2439.7,
		color: 0x635e58,
		a_0: 0.38709927, a_dot: 0.00000037,
		e_0: 0.20563593, e_dot: 0.00001906,
		i_0: 7.00497902, i_dot: -0.00594749,
		l_0: 252.25032350, l_dot: 149472.67411175,
		obar_0: 77.45779628, obar_dot: 0.16047689,
		oMega_0: 48.33076593, oMega_dot: -0.12534081,
		celestialPole: { ra: 281.01, decl: 61.41 },
		rotationRate: 360 / 1407.6,
		rotationAtJ2000: 0
	},
	venus: {
		name: 'Venus',
		diamKM: 12104,
		polarRadius: 6051.8,
		eqRadius: 6051.8,
		color: 0xf9d77d,
		a_0: 0.72333566, a_dot: 0.00000390,
		e_0: 0.00677672, e_dot: -0.00004107,
		i_0: 3.39467605, i_dot: -0.00078890,
		l_0: 181.97909950, l_dot: 58517.81538729,
		obar_0: 131.60246718, obar_dot: 0.00268329,
		oMega_0: 76.67984255, oMega_dot: -0.27769418,
		celestialPole: { ra: 272.76, decl: 67.16 },
		rotationRate: -360 / 5832.5,
		rotationAtJ2000: 0
	},
	earth: {
		name: 'Earth',
		diamKM: 12756,
		polarRadius: 6356.752,
		eqRadius: 6378.137,
		color: 0x151d65,
		celestialPole: { ra: 0, decl: 90 },
		rotationRate: 15,
		rotationAtJ2000: 18.697374558 * 15 - 0.2682
	},
	mars: {
		name: 'Mars',
		polarRadius: 3376.2,
		eqRadius: 3396.2,
		diamKM: 6792,
		color: 0x795b34,
		a_0: 1.52371034, a_dot: 0.00001847,
		e_0: 0.09339410, e_dot: 0.00007882,
		i_0: 1.84969142, i_dot: -0.00813131,
		l_0: -4.55343205, l_dot: 19140.30268499,
		obar_0: -23.94362959, obar_dot: 0.44441088,
		oMega_0: 49.55953891, oMega_dot: -0.29257343,
		celestialPole: { ra: 317.68, decl: 52.89 },
		rotationRate: 360 / 24.6,
		rotationAtJ2000: 0
	},
	jupiter: {
		name: 'Jupiter',
		diamKM: 142984,
		polarRadius: 66854,
		eqRadius: 71492,
		color: 0xc84b90,
		a_0: 5.20288700, a_dot: -0.00011607,
		e_0: 0.04838624, e_dot: -0.00013253,
		i_0: 1.30439695, i_dot: -0.00183714,
		l_0: 34.39644051, l_dot: 3034.74612775,
		obar_0: 14.72847983, obar_dot: 0.21252668,
		oMega_0: 100.47390909, oMega_dot: 0.20469106,
		b: -0.00012452,
		c: 0.06064060,
		s: -0.35635438,
		f: 38.35125000,
		celestialPole: { ra: 268.06, decl: 64.50 },
		rotationRate: 360 / 9.9,
		rotationAtJ2000: 0
	},
	saturn: {
		name: 'Saturn',
		diamKM: 120536,
		polarRadius: 54364,
		eqRadius: 60268,
		color: 0xb89f76,
		a_0: 9.53667594, a_dot: -0.00125060,
		e_0: 0.05386179, e_dot: -0.00050991,
		i_0: 2.48599187, i_dot: 0.00193609,
		l_0: 49.95424423, l_dot: 1222.49362201,
		obar_0: 92.59887831, obar_dot: -0.41897216,
		oMega_0: 113.66242448, oMega_dot: -0.28867794,
		celestialPole: { ra: 40.60, decl: 83.54 },
		rotationRate: 360 / 10.7,
		rotationAtJ2000: 0,
		rings: { innerRadius: 74500, outerRadius: 136780              }
	},
	uranus: {
		name: 'Uranus',
		diamKM: 50724,
		polarRadius: 24973,
		eqRadius: 25559,
		color: 0x0087d5,
		a_0: 19.18916464, a_dot: -0.00196176,
		e_0: 0.04725744, e_dot: 0.00004397,
		i_0: 0.77263783, i_dot: -0.00242939,
		l_0: 313.23810451, l_dot: 428.48202785,
		obar_0: 170.95427630, obar_dot: 0.40805281,
		oMega_0: 74.01692503, oMega_dot: 0.04240589,
		celestialPole: { ra: 257.31, decl: -15.18 },
		rotationRate: -360 / 17.2,
		rotationAtJ2000: 0,
		rings: { innerRadius: 26800, outerRadius: 51207 }
	},
	neptune: {
		name: 'Neptune',
		diamKM: 49266,
		polarRadius: 24341,
		eqRadius: 24764,
		color: 0x2fa0ff,
		a_0: 30.06992276, a_dot: 0.00026291,
		e_0: 0.00859048, e_dot: 0.00005105,
		i_0: 1.77004347, i_dot: 0.00035372,
		l_0: -55.12002969, l_dot: 218.45945325,
		obar_0: 44.96476227, obar_dot: -0.32241464,
		oMega_0: 131.78422574, oMega_dot: -0.00508664,
		celestialPole: { ra: 299.36, decl: 43.46 },
		rotationRate: 360 / 16.1,
		rotationAtJ2000: 0
	},
	sun: {
		name: 'Sun',
		diamKM: 1391400,
		polarRadius: 695700,
		eqRadius: 695700,
		color: 0xffff00,
		a_0: 0.0, a_dot: 0.0,
		e_0: 0.0, e_dot: 0.0,
		i_0: 0.0, i_dot: 0.0,
		l_0: 0.0, l_dot: 0.0,
		obar_0: 0.0, obar_dot: 0.0,
		oMega_0: 0.0, oMega_dot: 0.0,
		b_v: 0.656,
		luminosity: 382.8e24,
		celestialPole: { ra: 286.13, decl: 63.87 },
		rotationRate: 360 / (25.05 * 24),
		rotationAtJ2000: 0
	},
	moon: {
		name: 'Moon',
		diamKM: 3474,
		polarRadius: 1736.0,
		eqRadius: 1738.1,
		color: 0x251e25,
		celestialPole: { ra: 270, decl: 66 + 33 / 60 + 33.55 / 3600 },
		rotationRate: 360 / 655.719864 - 360 / (28 * 365.2425 * 24),
		rotationAtJ2000: 210
	}
};
var earth_moon = new Planet({
	name: 'Earth-Moon Barycenter',
	diamKM: 12756,
	color: 0x6b7084,
	a_0: 1.00000261, a_dot: 0.00000562,
	e_0: 0.01671123, e_dot: -0.00004392,
	i_0: -0.00001531, i_dot: -0.01294668,
	l_0: 100.46457166, l_dot: 35999.37244981,
	obar_0: 102.93768193, obar_dot: 0.32327364,
	oMega_0: 0.0, oMega_dot: 0.0
});
function moon_keplerEclipticCoords(unixtime, T) {
	T = T || julianCenturiesSinceJ2000(unixtime);
	var elements = moonElements(T);
	var a = elements.a;
	var e = elements.e;
	var oMega = elements.o;
	var omega = elements.w;
	var i = elements.i;
	var M = elements.M;
	M = M <= -180 ? M + 360 : M;
	M = M > 180 ? M - 360 : M;
	var E = this.solveKeplerEquation(M, e);
	var xpr = a * (cosd$1(E) - e);
	var ypr = a * Math.sqrt(1 - e * e) * sind$1(E);
	var xecl = (cosd$1(omega) * cosd$1(oMega) - sind$1(omega) * sind$1(oMega) * cosd$1(i)) * xpr + (-sind$1(omega) * cosd$1(oMega) - cosd$1(omega) * sind$1(oMega) * cosd$1(i)) * ypr;
	var yecl = (cosd$1(omega) * sind$1(oMega) + sind$1(omega) * cosd$1(oMega) * cosd$1(i)) * xpr + (-sind$1(omega) * sind$1(oMega) + cosd$1(omega) * cosd$1(oMega) * cosd$1(i)) * ypr;
	var zecl = sind$1(omega) * sind$1(i) * xpr + cosd$1(omega) * sind$1(i) * ypr;
	this.ecl.set(xecl / (AU * 1000), yecl / (AU * 1000), zecl / (AU * 1000));
}
function earth_keplerEclipticCoords(unixtime, T) {
	earth_moon.keplerEclipticCoords(unixtime, T);
	moon.keplerEclipticCoords(unixtime, T);
	this.ecl.copy(earth_moon.ecl);
	tmp$1.copy(moon.ecl);
	this.ecl.sub(tmp$1.multiplyScalar(0.0123));
}
function moon_getPosition(unixtime, pos) {
	earth.keplerEclipticCoords(unixtime);
	if (pos) {
		pos.copy(this.ecl);
	} else {
		pos = this.ecl.clone();
	}
	pos.add(earth.ecl);
	return pos;
}

var sind = Utils.sind;
var cosd = Utils.cosd;
var acosd = Utils.acosd;
var roundTo2 = Utils.roundTo2;
var tmp = new THREE$1.Vector3();
var tmp2 = new THREE$1.Vector3();
var stmp = new THREE$1.Spherical();
var planetGeom = new THREE$1.SphereBufferGeometry(1, 180, 180);
var DecoratedPlanet = function () {
	function DecoratedPlanet(properties, parent) {
		classCallCheck(this, DecoratedPlanet);
		this.planet = new Planet(properties);
		this.name = this.planet.getName();
		var material = void 0;
		if (this.name === 'Sun') {
			material = new THREE$1.MeshBasicMaterial({
				side: THREE$1.FrontSide
			});
		} else if (this.name === 'Moon') {
			material = new THREE$1.MeshLambertMaterial({
				side: THREE$1.FrontSide,
				emissive: 0x010101,
				emissiveIntensity: 0.1
			});
		} else {
			material = new THREE$1.MeshLambertMaterial({
				side: THREE$1.FrontSide
			});
		}
		this.mesh = new THREE$1.Mesh(planetGeom, material);
		switch (this.name) {
			case 'Earth':
			case 'Saturn':
			case 'Moon':
				break;
			default:
				break;
		}
		this.mesh.planet = this;
		this.group = new THREE$1.Group();
		this.posGroup = this.group;
		this.group.add(this.mesh);
		if (this.planet.rings) {
			this.ringMesh = this.createRingMesh();
			this.posGroup.add(this.ringMesh);
		}
		this.spherical = new THREE$1.Spherical();
		this.updateColor();
		this.updateRadius();
		this.tryLoadTexture();
		if (parent) {
			this.setParent(parent);
		}
	}
	createClass(DecoratedPlanet, [{
		key: 'computeOrbitalPole',
		value: function computeOrbitalPole(unixtime, sph) {
			unixtime = unixtime === undefined ? time.getTime() : unixtime;
			var planet = this.planet;
			if (this === planets.moon || this === planets.earth || this === planets.sun) {
				planet = earth_moon;
			}
			sph = sph || new THREE$1.Spherical();
			var T = julianCenturiesSinceJ2000(unixtime);
			var oMega = planet.oMega_0 + planet.oMega_dot * T;
			var i = planet.i_0 + planet.i_dot * T;
			stmp.set(1, Math.PI / 2, Utils.radians(oMega) - Math.PI / 2);
			tmp.setFromSpherical(stmp);
			tmp2.copy(Utils.yaxis);
			tmp2.applyAxisAngle(tmp, -Utils.radians(i));
			this.posGroup.parent.localToWorld(tmp2);
			sph.setFromVector3(tmp2);
			return sph;
		}
	}, {
		key: 'getName',
		value: function getName() {
			return this.name;
		}
	}, {
		key: 'setParent',
		value: function setParent(parent) {
			if (this.posGroup.parent) {
				this.posGroup.parent.remove(this.posGroup);
			}
			parent.add(this.posGroup);
			parent.updateMatrixWorld();
			if (this.planet.celestialPole) {
				this.northPole = new THREE$1.Spherical();
				this.northPole.set(1.0, Math.PI / 2 - Utils.radians(this.planet.celestialPole.decl), Utils.radians(this.planet.celestialPole.ra) + Math.PI / 2);
				tmp.setFromSpherical(this.northPole);
				parent.worldToLocal(tmp);
				this.q = Utils.getQuaternion(Utils.origin, Utils.yaxis, tmp);
				stmp.setFromVector3(parent.localToWorld(Utils.yaxis.clone().applyQuaternion(this.q)));
			}
		}
	}, {
		key: 'updateColor',
		value: function updateColor() {
			var color = void 0;
			switch (this.name) {
				case 'Sun':
					color = bvToColor(0.656, 5);
					break;
				default:
					var colorType = ssettings.get('planets', 'planetcolor');
					switch (colorType) {
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
							if (this.textureOrOwnColor()) return;
							color = this.color;
							break;
					}
			}
			this.mesh.material.color = new THREE$1.Color(color);
		}
	}, {
		key: 'textureOrOwnColor',
		value: function textureOrOwnColor() {
			if (this.textureData) {
				if (!this.mesh.material.texture) {
					this.mesh.material.map = this.textureData.texture;
					if (this.textureData.normal) {
						this.mesh.material.normalMap = this.textureData.normal;
					}
					this.mesh.material.needsUpdate = true;
					this.mesh.rotation.y = Utils.radians(this.textureData.rotationDegrees);
					this.mesh.material.color = null;
				}
				return true;
			}
			return false;
		}
	}, {
		key: 'updateRadius',
		value: function updateRadius() {
			this.radius = this.planet.radius * unit;
			this.eqRadius = this.planet.eqRadius * unit;
			this.polarRadius = this.planet.polarRadius * unit;
			var startRadius = this.eqRadius;
			if (this !== Viewer.getViewer().homePlanet) {
				switch (this.name) {
					case 'Sun':
						this.radius *= ssettings.get('planets', 'sunmoonmag');
						this.eqRadius *= ssettings.get('planets', 'sunmoonmag');
						this.polarRadius *= ssettings.get('planets', 'sunmoonmag');
						break;
					case 'Moon':
						if (Viewer.getViewer().homePlanet && Viewer.getViewer().homePlanet.name === 'Earth') {
							this.radius *= ssettings.get('planets', 'sunmoonmag');
							this.eqRadius *= ssettings.get('planets', 'sunmoonmag');
							this.polarRadius *= ssettings.get('planets', 'sunmoonmag');
						} else {
							this.radius *= ssettings.get('planets', 'planetmag');
							this.eqRadius *= ssettings.get('planets', 'planetmag');
							this.polarRadius *= ssettings.get('planets', 'planetmag');
						}
						break;
					case 'Earth':
						if (Viewer.getViewer().homePlanet && Viewer.getViewer().homePlanet.name === 'Moon') {
							this.radius *= ssettings.get('planets', 'sunmoonmag');
							this.eqRadius *= ssettings.get('planets', 'sunmoonmag');
							this.polarRadius *= ssettings.get('planets', 'sunmoonmag');
						} else {
							this.radius *= ssettings.get('planets', 'planetmag');
							this.eqRadius *= ssettings.get('planets', 'planetmag');
							this.polarRadius *= ssettings.get('planets', 'planetmag');
						}
						break;
					default:
						this.radius *= ssettings.get('planets', 'planetmag');
						this.eqRadius *= ssettings.get('planets', 'planetmag');
						this.polarRadius *= ssettings.get('planets', 'planetmag');
				}
			}
			this.mesh.scale.set(this.eqRadius, this.polarRadius, this.eqRadius);
			if (this.ringMesh) {
				this.ringMesh.scale.set(this.eqRadius / startRadius, this.eqRadius / startRadius, this.eqRadius / startRadius);
			}
		}
	}, {
		key: 'updatePositionAndRotation',
		value: function updatePositionAndRotation(unixtime) {
			var rotation = Utils.radians(this.planet.getRotationDegrees(unixtime));
			this.group.setRotationFromAxisAngle(Utils.yaxis, rotation);
			if (this.q) {
				this.group.quaternion.premultiply(this.q);
			}
			this.planet.getPosition(unixtime, tmp);
			this.posGroup.position.set(tmp.x, tmp.z, -tmp.y);
			this.posGroup.position.multiplyScalar(unit);
		}
	}, {
		key: 'getPosition',
		value: function getPosition(pos) {
			pos = pos || new THREE$1.Vector3();
			pos.copy(this.group.position);
			return pos;
		}
	}, {
		key: 'getDataString',
		value: function getDataString(unixtime, fromPosition) {
			if (this === Viewer.getViewer().homePlanet) {
				return this.name;
			}
			this.updatePositionAndRotation(unixtime);
			tmp.subVectors(this.posGroup.position, fromPosition);
			var xeq = tmp.x;
			var yeq = -cosd(j2000obliquity) * tmp.z - sind(j2000obliquity) * tmp.y;
			var zeq = -sind(j2000obliquity) * tmp.z + cosd(j2000obliquity) * tmp.y;
			tmp.y = yeq;
			tmp.z = zeq;
			var distance$$1 = tmp.length();
			var ra = acosd(xeq / Math.sqrt(xeq * xeq + yeq * yeq));
			if (yeq < 0) ra *= -1;
			if (ra < 0) ra += 360;
			var decl = 90 - acosd(zeq / tmp.length());
			return this.name + '; RA: ' + roundTo2(ra) + '&deg;, D: ' + roundTo2(decl) + '&deg;, dist. ' + roundTo2(distance$$1 / unit) + ' AU';
		}
	}, {
		key: 'distance',
		value: function distance$$1() {
			this.posGroup.position.distanceTo(Viewer.getViewer().homePlanet.posGroup.position);
		}
	}, {
		key: 'tryLoadTexture',
		value: function tryLoadTexture() {
			var textureRecord = textures[this.name];
			if (textureRecord) {
				var loader = new THREE$1.TextureLoader();
				var self = this;
				loader.load(textureRecord.path,
				function (texture) {
					self.textureData = { texture: texture,
						rotationDegrees: textureRecord.rotationDegrees };
					self.updateColor();
					if (textureRecord.normal) {
						console.log('try loading normal map');
						loader.load(textureRecord.normal, function (normalMap) {
							console.log('loaded normal map');
							self.textureData.normal = normalMap;
							self.updateColor();
						}, function (progress) {
							console.log('Loading for ' + self.name + ', total ' + progress.total + ', loaded ' + progress.total);
						},
						function (error) {
							console.log('error loading ' + textureRecord.normal + ': ' + JSON.stringify(error));
						});
					}
				},
				function (progress) {
					console.log('Loading for ' + self.name + ', total ' + progress.total + ', loaded ' + progress.total);
				},
				function (error) {
					console.log('error ' + JSON.stringify(error));
				});
			}
			return !!textureRecord;
		}
	}, {
		key: 'createRingMesh',
		value: function createRingMesh() {
			var ringGeom = new THREE$1.RingBufferGeometry(this.planet.rings.innerRadius * unit, this.planet.rings.outerRadius * unit, 180, 1);
			var uvs = ringGeom.attributes.uv.array;
			var phiSegments = ringGeom.parameters.phiSegments || 8;
			var thetaSegments = ringGeom.parameters.thetaSegments || 8;
			for (var c = 0, j = 0; j <= phiSegments; j++) {
				for (var i = 0; i <= thetaSegments; i++) {
					uvs[c++] = i / thetaSegments, uvs[c++] = j / phiSegments;
				}
			}
			var material = this.createRingMaterial();
			var mesh = new THREE$1.Mesh(ringGeom, material);
			mesh.rotation.x = Math.PI / 2;
			return mesh;
		}
	}, {
		key: 'createRingMaterial',
		value: function createRingMaterial() {
			var material = new THREE$1.MeshLambertMaterial({
				side: THREE$1.DoubleSide,
				transparent: true,
				opacity: 1.0
			});
			var loader = new THREE$1.TextureLoader();
			var rings = textures[this.name].rings;
			material.map = loader.load(rings.map);
			material.alphaMap = loader.load(rings.alphaMap);
			return material;
		}
	}, {
		key: 'getShortName',
		value: function getShortName() {
			return this.name;
		}
	}], [{
		key: 'updatePlanetPositionsAndRotations',
		value: function updatePlanetPositionsAndRotations(unixtime) {
			for (var planetName in planets) {
				if (planets.hasOwnProperty(planetName)) {
					planets[planetName].updatePositionAndRotation(unixtime);
				}
			}
		}
	}, {
		key: 'updatePlanetRadii',
		value: function updatePlanetRadii() {
			for (var planetName in planets) {
				if (planets.hasOwnProperty(planetName)) {
					planets[planetName].updateRadius();
				}
			}
		}
	}, {
		key: 'updatePlanetColors',
		value: function updatePlanetColors() {
			for (var planetName in planets) {
				if (planets.hasOwnProperty(planetName)) {
					planets[planetName].updateColor();
				}
			}
		}
	}, {
		key: 'setPlanetParent',
		value: function setPlanetParent(group) {
			for (var planetName in planets) {
				if (planets.hasOwnProperty(planetName)) {
					planets[planetName].setParent(group);
				}
			}
		}
	}]);
	return DecoratedPlanet;
}();
var textures = {
	'Mercury': { path: 'images/mercurymap.jpg', rotationDegrees: 0 },
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
		}
	},
	'Uranus': {
		path: 'images/uranusmap.jpg', rotationDegrees: 0,
		rings: {
			map: 'images/uranusringcolour.jpg',
			alphaMap: 'images/uranusringtrans.gif'
		}
	},
	'Neptune': { path: 'images/neptunemap.jpg', rotationDegrees: 0 }
};
var planets = {};
var planetMeshes = [];
DecoratedPlanet.init = function (parent) {
	planets.mercury = new DecoratedPlanet(planetInfo.mercury, parent);
	planets.venus = new DecoratedPlanet(planetInfo.venus, parent);
	planets.earth = new DecoratedPlanet(planetInfo.earth, parent);
	planets.mars = new DecoratedPlanet(planetInfo.mars, parent);
	planets.jupiter = new DecoratedPlanet(planetInfo.jupiter, parent);
	planets.saturn = new DecoratedPlanet(planetInfo.saturn, parent);
	planets.uranus = new DecoratedPlanet(planetInfo.uranus, parent);
	planets.neptune = new DecoratedPlanet(planetInfo.neptune, parent);
	planets.sun = new DecoratedPlanet(planetInfo.sun, parent);
	planets.moon = new DecoratedPlanet(planetInfo.moon, parent);
	planetMeshes.push(planets.sun.mesh);
	planetMeshes.push(planets.mercury.mesh);
	planetMeshes.push(planets.venus.mesh);
	planetMeshes.push(planets.earth.mesh);
	planetMeshes.push(planets.mars.mesh);
	planetMeshes.push(planets.jupiter.mesh);
	planetMeshes.push(planets.saturn.mesh);
	planetMeshes.push(planets.uranus.mesh);
	planetMeshes.push(planets.neptune.mesh);
	planetMeshes.push(planets.moon.mesh);
};

var compassHeading = 0;
var needAlphaAdjustment = true;
var alphaAdjustment = 0;
var compassCorrection = undefined;
var noDOC = false;
var isApple$1 = navigator.userAgent.indexOf('Mac OS X') >= 0;
function setNoDOC(val) {
	noDOC = val;
}
function getCompassCorrection() {
	if (compassCorrection === undefined) {
		compassCorrection = ssettings.get('compass', 'correction');
		compassCorrection = compassCorrection === undefined || compassCorrection === 500 ? 0 : compassCorrection;
	}
	return compassCorrection;
}
function requestCompassCorrection() {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleCompassCorrection;
	httpRequest.open('POST', 'https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination', true);
	httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	httpRequest.send('browserRequest=true&lat1=37.4&lat1Hemisphere=N&lon1=122&lon1Hemisphere=W&model=WMM&startYear=2017&startMonth=7&startDay=27&resultFormat=xml');
	function handleCompassCorrection() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				var doc = httpRequest.responseXML;
				var xpathResult = doc.evaluate('//declination', doc, null, XPathResult.NUMBER_TYPE, null);
				if (xpathResult && !xpathResult.invalidIteratorState && xpathResult.resultType === XPathResult.NUMBER_TYPE) {
					setCompassCorrection(xpathResult.numberValue);
					console.log('Compass correction: ' + compassCorrection);
					return;
				}
			}
			console.log('Compass correction request failed:' + ' status: ' + httpRequest.status + ', responseText ' + httpRequest.responseText);
			clearCompassCorrection();
		}
	}
}
function setCompassCorrection(angle) {
	compassCorrection = angle;
	ssettings.set('compass', 'correction', compassCorrection);
	setDirectionFromCompass();
}
function clearCompassCorrection() {
	setCompassCorrection(500);
}
var lastTrueAlpha = -1000;
var lastBeta = -1000;
function setTrueNorth() {
	alphaAdjustment = lastTrueAlpha;
	needAlphaAdjustment = false;
}
function setDirectionFromCompass() {
	needAlphaAdjustment = true;
}
function absoluteOrientationHandler(e) {
	if (needAlphaAdjustment) console.log('noDOC ' + noDOC);
	if (noDOC || !needAlphaAdjustment) return;
	e.stopPropagation();
	e.preventDefault();
	compassHeading = 360 - e.alpha + getCompassCorrection();
}
exports.doOrient = false;
function deviceOrientationHandler(e) {
	if (noDOC && !exports.doOrient) return;
	exports.doOrient = false;
	var rawAlpha = 360 - e.alpha;
	if (isApple$1 && e.webkitCompassHeading && needAlphaAdjustment) {
		alphaAdjustment = e.alpha - e.webkitCompassHeading + getCompassCorrection();
		needAlphaAdjustment = false;
	} else if (needAlphaAdjustment) {
		if (e.absolute) {
			alphaAdjustment = getCompassCorrection();
		} else {
			alphaAdjustment = compassHeading - rawAlpha;
		}
		needAlphaAdjustment = false;
	}
	var trueAlpha = rawAlpha + alphaAdjustment;
	trueAlpha = trueAlpha % 360;
	if (trueAlpha > 180) trueAlpha -= 360;
	if (trueAlpha < -180) trueAlpha += 360;
	if (Math.abs(trueAlpha - lastTrueAlpha) > 1 || Math.abs(e.beta - lastBeta) > 1) {
		lastTrueAlpha = e.alpha;
		lastBeta = e.beta;
		var alt = e.beta;
		if (alt < 0) alt = 0;
		if (alt > 89) alt = 89;
		ssettings.set('view', 'rotation', trueAlpha);
		ssettings.set('view', 'elevation', alt);
	}
}

var isMobile = navigator.userAgent.indexOf('Mobile') >= 0;
var isApple = navigator.userAgent.indexOf('Mac OS X') >= 0;
var screenfull = void 0;
var devicePosition = void 0;
var time;
if (ssettings.get('time', 'realtime')) {
	time = new Time(Date.now(), ssettings.get('time', 'rate'));
} else {
	time = new Time(ssettings.get('time', 'timeset'), ssettings.get('time', 'rate'), ssettings.get('time', 'stopped'));
}
var SettingsControl = function () {
	function SettingsControl() {
		classCallCheck(this, SettingsControl);
	}
	createClass(SettingsControl, null, [{
		key: 'updateNumber',
		value: function updateNumber(section, item, type1, type2) {
			var input = document.getElementById(item + '-' + type1);
			if (input) {
				var disp = document.getElementById(item + '-' + type2);
				if (disp) {
					disp.value = input.value;
				}
				ssettings.set(section, item, parseFloat(input.value));
			}
		}
	}, {
		key: 'setNumber',
		value: function setNumber(section, item, value) {
			value = Utils.roundTo2(value || ssettings.get(section, item));
			var range = document.getElementById(item + '-range');
			if (range) range.value = value;
			var number = document.getElementById(item + '-number');
			if (number) number.value = value;
		}
	}, {
		key: 'updateValue',
		value: function updateValue(section, item) {
			ssettings.set(section, item, document.getElementById(item).value);
		}
	}, {
		key: 'setValue',
		value: function setValue(section, item, value) {
			value = value || ssettings.get(section, item);
			if (typeof value === 'number') value = Utils.roundTo2(value);
			var elem = document.getElementById(item);
			if (elem) elem.value = value;
		}
	}, {
		key: 'updateBoolean',
		value: function updateBoolean(section, item) {
			ssettings.set(section, item, document.getElementById(item).value === 'true');
		}
	}, {
		key: 'setBoolean',
		value: function setBoolean(section, item, value) {
			value = value || ssettings.get(section, item);
			var elem = document.getElementById(item);
			if (elem) elem.value = value ? 'true' : 'false';
		}
	}, {
		key: 'geolocate',
		value: function geolocate() {
			if (navigator && navigator.geolocation) {
				if (devicePosition) {
					SettingsControl.successCallback(devicePosition);
				} else {
					navigator.geolocation.getCurrentPosition(SettingsControl.successCallback, SettingsControl.errorCallback);
				}
				return true;
			}
			return false;
		}
	}, {
		key: 'setLocationValues',
		value: function setLocationValues() {
			var latitude = ssettings.get('location', 'latitude');
			var longitude = ssettings.get('location', 'longitude');
			var altitude = ssettings.get('location', 'altitude');
			if (latitude == 500 || longitude == 500) {
				var altRange = document.getElementById('altitude-range');
				if (altRange) altRange.value = altitude;
				var altNumber = document.getElementById('altitude-number');
				if (altNumber) altNumber.value = altitude;
				if (!SettingsControl.geolocate()) {
					ssettings.set('location', 'latitude', 40.0);
					ssettings.set('location', 'longitude', -100.0);
				}
			} else {
				var latRange = document.getElementById('latitude-range');
				if (latRange) latRange.value = latitude;
				document.getElementById('latitude-number').value = latitude;
				var longRange = document.getElementById('longitude-range');
				if (longRange) longRange.value = longitude;
				document.getElementById('longitude-number').value = longitude;
				var altRange = document.getElementById('altitude-range');
				if (altRange) altRange.value = altitude;
				var _altNumber = document.getElementById('altitude-number');
				if (_altNumber) _altNumber.value = altitude;
			}
			SettingsControl.setValue('location', 'planet');
		}
	}, {
		key: 'successCallback',
		value: function successCallback(position) {
			ssettings.set('location', 'latitude', Utils.roundTo1(position.coords.latitude));
			ssettings.set('location', 'longitude', Utils.roundTo1(position.coords.longitude));
			SettingsControl.setNumber('location', 'latitude');
			SettingsControl.setNumber('location', 'longitude');
			if (isMobile && !isApple) {
				requestCompassCorrection();
			}
		}
	}, {
		key: 'errorCallback',
		value: function errorCallback() {
			var latitude = ssettings.get('location', 'latitude');
			var longitude = ssettings.get('location', 'longitude');
			if (latitude == 500 || longitude == 500) {
				ssettings.set('location', 'latitude', 40.0);
				ssettings.set('location', 'longitude', -100.0);
				SettingsControl.setNumber('location', 'latitude', 40.0);
				SettingsControl.setNumber('location', 'longitude', -100.0);
			}
		}
	}, {
		key: 'setViewValues',
		value: function setViewValues() {
			SettingsControl.setNumber('view', 'elevation');
			SettingsControl.setNumber('view', 'rotation');
			SettingsControl.setNumber('view', 'zoom');
			SettingsControl.setBoolean('view', 'lines');
		}
	}, {
		key: 'updateTimeRate',
		value: function updateTimeRate(section, item) {
			var val;
			if (typeof item === 'number') {
				val = item;
			} else {
				val = parseInt(document.getElementById(item).value);
			}
			time.setRate(val);
			if (val != 1) {
				ssettings.set('time', 'realtime', false);
			}
			ssettings.set('time', 'rate', val);
		}
	}, {
		key: 'toggleTimeStopped',
		value: function toggleTimeStopped() {
			if (time.stopped) {
				time.start();
			} else {
				time.stop();
				ssettings.set('time', 'realtime', false);
			}
			ssettings.set('time', 'stopped', time.stopped);
			SettingsControl.setTimeValues();
		}
	}, {
		key: 'intToString',
		value: function intToString(number, minDigits) {
			var str = '' + number;
			for (var ct = minDigits - str.length; ct > 0; ct--) {
				str = '0' + str;
			}
			return str;
		}
	}, {
		key: 'realTime',
		value: function realTime() {
			time.setRate(1);
			time.start();
			time.setTime(Date.now());
			ssettings.set('time', 'realtime', true);
			ssettings.set('time', 'rate', 1);
			ssettings.set('time', 'stopped', false);
			SettingsControl.setTimeValues();
		}
	}, {
		key: 'changeTime',
		value: function changeTime(timeMod) {
			time.incrementTime(timeMod);
			ssettings.set('time', 'realtime', false);
			ssettings.set('time', 'timeset', time.getTime());
			SettingsControl.setTimeValues();
		}
	}, {
		key: 'enableOptionElement',
		value: function enableOptionElement(elem, enabled) {
			if (enabled) {
				elem.style = {};
				elem.className = 'option';
				elem.onclick = SettingsControl.realTime;
			} else {
				elem.style.color = 'grey';
				elem.className = 'nonoption';
				elem.onclick = null;
			}
		}
	}, {
		key: 'setTimeValues',
		value: function setTimeValues() {
			if (document.getElementById('real-time')) {
				SettingsControl.enableOptionElement(document.getElementById('real-time'), !(ssettings.get('time', 'realtime') && time.getRate() == 1 && !time.stopped));
				document.getElementById('time-rate').value = time.getRate();
				var datetime = new Date(time.getTime());
				document.getElementById('datetime-year').innerHTML = SettingsControl.intToString(datetime.getUTCFullYear(), 4);
				document.getElementById('datetime-month').innerHTML = SettingsControl.intToString(datetime.getUTCMonth() + 1, 2);
				document.getElementById('datetime-date').innerHTML = SettingsControl.intToString(datetime.getUTCDate(), 2);
				document.getElementById('datetime-hours').innerHTML = SettingsControl.intToString(datetime.getUTCHours(), 2);
				document.getElementById('datetime-minutes').innerHTML = SettingsControl.intToString(datetime.getUTCMinutes(), 2);
				document.getElementById('datetime-seconds').innerHTML = SettingsControl.intToString(datetime.getUTCSeconds(), 2);
				document.getElementById('datetime-millis').innerHTML = SettingsControl.intToString(datetime.getUTCMilliseconds(), 3);
				document.getElementById('toggle-clock').value = time.stopped ? 'Start Clock' : 'Stop Clock';
				document.getElementById('clock-state').innerHTML = time.stopped ? 'Clock is Stopped' : 'Clock is Started';
			}
		}
	}, {
		key: 'setStarValues',
		value: function setStarValues() {
			SettingsControl.setNumber('stars', 'starradius');
			SettingsControl.setNumber('stars', 'starbrightness');
			SettingsControl.setNumber('stars', 'colorlevel');
		}
	}, {
		key: 'setPlanetValues',
		value: function setPlanetValues() {
			SettingsControl.setNumber('planets', 'planetmag');
			SettingsControl.setValue('planets', 'planetcolor');
			SettingsControl.setNumber('planets', 'sunmoonmag');
			SettingsControl.setNumber('planets', 'sunbrightness');
		}
	}, {
		key: 'setPlanetLocations',
		value: function setPlanetLocations(unixtime, fromPosition, homePlanet) {
			if (isMobile) return;
			var sunMagElem = document.getElementById('sun_mag');
			if (sunMagElem === null) return;
			if (homePlanet === planets.earth) {
				sunMagElem.innerHTML = 'Sun/Moon Magnification';
			} else if (homePlanet === planets.moon) {
				sunMagElem.innerHTML = 'Sun/Earth Magnification';
			} else {
				sunMagElem.innerHTML = 'Sun Magnification';
			}
			for (var planetName in planets) {
				if (planets.hasOwnProperty(planetName)) {
					var element = document.getElementById(planetName + '-location');
					var element2 = document.getElementById(planetName + '-hp');
					if (element) {
						var planet = planets[planetName];
						if (planet !== homePlanet) {
							element.style.display = 'block';
							element.innerHTML = planet.getDataString(unixtime, fromPosition);
							element2.style.display = 'block';
						} else {
							element.style.display = 'none';
							element2.style.display = 'none';
							var elementGeo = document.getElementById('geolocate');
							elementGeo.style.display = planetName === 'earth' ? 'block' : 'none';
						}
					}
				}
			}
		}
	}, {
		key: 'initValues',
		value: function initValues(window, isMobileIn) {
			screenfull = window.screenfull;
			isMobile = isMobileIn;
			SettingsControl.setLocationValues();
			SettingsControl.setViewValues();
			SettingsControl.setTimeValues();
			SettingsControl.setStarValues();
			SettingsControl.setPlanetValues();
		}
	}, {
		key: 'toggleFullScreen',
		value: function toggleFullScreen() {
			if (screenfull.enabled) {
				screenfull.toggle();
			}
		}
	}, {
		key: 'showFullScreenMenu',
		value: function showFullScreenMenu() {
			var menu = document.querySelector('#fullscreen');
			menu.style.left = '0';
			menu.style.right = '0';
			menu.style.top = '0';
			menu.style.bottom = '0';
			menu.style.margin = 'auto';
			menu.style.height = '180px';
			menu.style.width = '200px';
			menu.style.display = 'block';
		}
	}, {
		key: 'dismissFullScreenMenu',
		value: function dismissFullScreenMenu(event) {
			event.preventDefault();
			event.stopPropagation();
			var menu = document.querySelector('#fullscreen');
			menu.style.display = 'none';
		}
	}, {
		key: 'requestFullScreen',
		value: function requestFullScreen(event) {
			SettingsControl.dismissFullScreenMenu(event);
			if (screenfull.enabled) {
				screenfull.request();
			}
		}
	}, {
		key: 'restoreLocationDefaults',
		value: function restoreLocationDefaults() {
			ssettings.restoreDefaults('location');
			SettingsControl.setLocationValues();
		}
	}, {
		key: 'restoreViewDefaults',
		value: function restoreViewDefaults() {
			ssettings.restoreDefaults('view');
			SettingsControl.setViewValues();
		}
	}, {
		key: 'restoreTimeDefaults',
		value: function restoreTimeDefaults() {
			ssettings.restoreDefaults('time');
			time.setRate(ssettings.get('time', 'rate'));
			if (ssettings.get('time', 'realtime')) {
				time.setTime(Date.now());
			} else {
				time.setTime('time', 'timeset');
			}
			SettingsControl.setTimeValues();
		}
	}, {
		key: 'restoreStarDefaults',
		value: function restoreStarDefaults() {
			ssettings.restoreDefaults('stars');
			SettingsControl.setStarValues();
		}
	}, {
		key: 'restorePlanetDefaults',
		value: function restorePlanetDefaults() {
			ssettings.restoreDefaults('planets');
			SettingsControl.setPlanetValues();
		}
	}, {
		key: 'restoreAllDefaults',
		value: function restoreAllDefaults() {
			SettingsControl.restoreLocationDefaults();
			SettingsControl.restoreViewDefaults();
			SettingsControl.restoreTimeDefaults();
			SettingsControl.restoreStarDefaults();
			SettingsControl.restorePlanetDefaults();
		}
	}]);
	return SettingsControl;
}();

var radius = distance * 1.2;
var Bands = function () {
	function Bands(parent, isMobile) {
		classCallCheck(this, Bands);
		this.parent = parent;
		this._bandGroup = new THREE$1.Group();
		this.visible = false;
		this.bandWidth = isMobile ? 1400 * unit : 700 * unit;
		this.bandGeom = new THREE$1.CylinderBufferGeometry(1, 1, 1400 * unit, 128, 1, true);
		this._createBands();
		this._createEcliptic();
	}
	createClass(Bands, [{
		key: 'setVisible',
		value: function setVisible(visible) {
			if (visible && !this.visible) {
				this.parent.add(this._bandGroup);
				this.parent.add(this._eclipticMesh);
			} else if (!visible && this.visible) {
				this.parent.remove(this._bandGroup);
				this.parent.remove(this._eclipticMesh);
			}
			this.visible = visible;
		}
	}, {
		key: 'setZoom',
		value: function setZoom(zoom) {
			var bands = this._bandGroup.children;
			var len = bands.length;
			for (var idx = 0; idx < len; idx++) {
				Bands._zoomBand(zoom, bands[idx]);
			}
			Bands._zoomBand(zoom, this._eclipticMesh);
		}
	}, {
		key: '_createBands',
		value: function _createBands() {
			var bandMaterial = new THREE$1.MeshBasicMaterial({
				color: 0x080808,
				transparent: false,
				side: THREE$1.BackSide
			});
			var specialBandMaterial = new THREE$1.MeshBasicMaterial({
				color: 0x111100,
				transparent: false,
				side: THREE$1.BackSide
			});
			var band = this._createBand(radius, Math.PI / 2, 0, specialBandMaterial);
			band.bands_baseScale = band.scale.clone();
			this._bandGroup.add(band);
			for (var idx = 15; idx < 180; idx += 15) {
				band = this._createBand(radius, Math.PI / 2, idx * Math.PI / 180, bandMaterial);
				band.bands_baseScale = band.scale.clone();
				this._bandGroup.add(band);
			}
			for (var idx = 1; idx < 18; idx++) {
				var phi = idx * Math.PI / 18;
				band = this._createBand(radius * Math.sin(phi), 0, 0, idx == 9 ? specialBandMaterial : bandMaterial, new THREE$1.Vector3(0, radius * Math.cos(phi), 0));
				band.scale.y /= Math.sin(phi);
				band.bands_baseScale = band.scale.clone();
				this._bandGroup.add(band);
			}
		}
	}, {
		key: '_createBand',
		value: function _createBand(radius, phi, theta, material, position) {
			var mesh = new THREE$1.Mesh(this.bandGeom, material);
			mesh.rotation.set(0, theta - Math.PI / 2, phi);
			mesh.scale.set(radius, 1, radius);
			if (position) {
				mesh.position.copy(position);
			} else {
				mesh.position.set(0, -300 * unit, 0);
			}
			return mesh;
		}
	}, {
		key: '_createEcliptic',
		value: function _createEcliptic() {
			var eclipticMaterial = new THREE$1.MeshBasicMaterial({
				color: 0x110011,
				transparent: false,
				side: THREE$1.BackSide
			});
			this._eclipticMesh = this._createBand(radius, 0, 0, eclipticMaterial);
			this._eclipticMesh.bands_baseScale = this._eclipticMesh.scale.clone();
		}
	}, {
		key: 'orientBands',
		value: function orientBands(phi, theta) {
			this._bandGroup.rotation.set(0, theta + Math.PI / 2, phi);
		}
	}, {
		key: 'orientEcliptic',
		value: function orientEcliptic(phi, theta) {
			this._eclipticMesh.rotation.set(0, theta - Math.PI / 2, -phi);
		}
	}], [{
		key: '_zoomBand',
		value: function _zoomBand(zoom, band) {
			band.scale.copy(band.bands_baseScale);
			band.scale.y /= zoom;
		}
	}]);
	return Bands;
}();
Bands.prototype.setPlanet = function () {
	var sph = new THREE.Spherical();
	return function (planet) {
		this.orientBands(planet.northPole.phi, planet.northPole.theta);
		planet.computeOrbitalPole(undefined, sph);
		this.orientEcliptic(sph.phi, sph.theta);
	};
}();

var v2tmp1 = new THREE$1.Vector2();
var v2tmp2 = new THREE$1.Vector2();
var v3tmp1 = new THREE$1.Vector3();
var Geometry = function () {
	function Geometry() {
		classCallCheck(this, Geometry);
	}
	createClass(Geometry, null, [{
		key: 'spheresIntersect',
		value: function spheresIntersect(p1, r1, p2, r2) {
			var sum = r1 + r2;
			return p1.distanceToSquared(p2) <= sum * sum;
		}
	}, {
		key: 'pointInRectangle',
		value: function pointInRectangle(p, r) {
			v2tmp1.subVectors(p, r[0]);
			v2tmp2.subVectors(r[1], r[0]);
			var dot1 = v2tmp1.dot(v2tmp2);
			if (dot1 < 0) return false;
			var dot2 = v2tmp2.lengthSq();
			if (dot1 > dot2) return false;
			v2tmp2.subVectors(r[3], r[0]);
			dot1 = v2tmp1.dot(v2tmp2);
			if (dot1 < 0) return false;
			dot2 = v2tmp2.lengthSq();
			if (dot1 > dot2) return false;
			return true;
		}
	}, {
		key: 'pointOnLineSeg',
		value: function pointOnLineSeg(p, q1, q2) {
			v2tmp1.subVectors(p, q1);
			v2tmp2.subVectors(q2, q1);
			var dot = v2tmp1.dot(v2tmp2);
			var normSq = v2tmp2.lengthSq();
			return dot >= 0 && dot <= normSq && v2tmp1.lengthSq() === dot * dot / normSq;
		}
	}, {
		key: 'orientation',
		value: function orientation(p, q, r) {
			var det = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
			return det === 0 ? 0 : det > 0 ? 1 : 2;
		}
	}, {
		key: 'lineSegmentsIntersect',
		value: function lineSegmentsIntersect(p1, p2, q1, q2) {
			if ((p1.x - p2.x) * (q1.y - q2.y) === (p1.y - p2.y) * (q1.x - q2.x)) {
				return Geometry.pointOnLineSeg(p1, q1, q2) || Geometry.pointOnLineSeg(p2, q1, q2) || Geometry.pointOnLineSeg(q1, p1, p2) || Geometry.pointOnLineSeg(q2, p1, p2);
			} else {
				var o1 = Geometry.orientation(p1, p2, q1);
				var o2 = Geometry.orientation(p1, p2, q2);
				var o3 = Geometry.orientation(q1, q2, p1);
				var o4 = Geometry.orientation(q1, q2, p2);
				return o1 !== o2 && o3 !== o4;
			}
		}
	}, {
		key: 'rectanglesIntersect',
		value: function rectanglesIntersect(p, q) {
			if (Geometry.pointInRectangle(p[0], q) || Geometry.pointInRectangle(q[0], p)) {
				return true;
			}
			for (var idx = 0; idx < 4; idx++) {
				for (var jdx = 0; jdx < 4; jdx++) {
					if (Geometry.lineSegmentsIntersect(p[idx], p[(idx + 1) % 4], q[jdx], q[(jdx + 1) % 4])) return true;
				}
			}
			return false;
		}
	}, {
		key: 'circleIntersectsLineSeg',
		value: function circleIntersectsLineSeg(c, rsq, p1, p2) {
			v2tmp1.subVectors(c, p1);
			v2tmp2.subVectors(p2, p1);
			var dot1 = v2tmp1.dot(v2tmp2);
			if (dot1 < 0) return false;
			var dot2 = v2tmp2.lengthSq();
			if (dot1 > dot2) return false;
			var dot3 = v2tmp1.lengthSq();
			return dot3 * (1 - dot1 / (dot2 * dot3)) <= rsq;
		}
	}, {
		key: 'circleIntersectsRectangle',
		value: function circleIntersectsRectangle(c, r, p1, p2, p3, p4) {
			if (Geometry.pointInRectangle(c, [p1, p2, p3, p4])) return true;
			var rsq = r * r;
			if (c.distanceToSquared(p1) <= rsq || c.distanceToSquared(p2) <= rsq || c.distanceToSquared(p3) <= rsq || c.distanceToSquared(p4) <= rsq) {
				return true;
			}
			if (Geometry.circleIntersectsLineSeg(c, rsq, p1, p2) || Geometry.circleIntersectsLineSeg(c, rsq, p2, p3) || Geometry.circleIntersectsLineSeg(c, rsq, p3, p4) || Geometry.circleIntersectsLineSeg(c, rsq, p4, p1)) {
				return true;
			}
			return false;
		}
	}, {
		key: 'findAngle',
		value: function findAngle(p, q) {
			var s1 = new THREE.Spherical();
			var s2 = new THREE.Spherical();
			s1.setFromVector3(p);
			s2.setFromVector3(q);
			return Geometry.findAngleSpherical(s1, s2);
		}
	}, {
		key: 'findAngleSpherical',
		value: function findAngleSpherical(s1, s2) {
			var dphi = s2.phi - s1.phi;
			var dtheta = s2.theta - s1.theta;
			return Math.atan2(dphi, Math.sin(s1.phi) * dtheta);
		}
	}, {
		key: 'findVectorInTangentPlane',
		value: function findVectorInTangentPlane(p, q) {
			var s1 = new THREE.Spherical();
			var s2 = new THREE.Spherical();
			s1.setFromVector3(p);
			s2.setFromVector3(q);
			var dphi = s2.phi - s1.phi;
			var dtheta = s2.theta - s1.theta;
			return new THREE.Vector3(s1.radius * dtheta * Math.sin(s1.phi), s2.radius * dphi, 0);
		}
	}, {
		key: 'rotateVector2',
		value: function rotateVector2(v, angle, target) {
			target = target || new THREE.Vector2();
			target.set(Math.cos(angle) * v.x - Math.sin(angle) * v.y, Math.sin(angle) * v.x + Math.cos(angle) * v.y);
		}
	}, {
		key: 'findNearSideOfBox',
		value: function findNearSideOfBox(p, box) {
			if (box.containsPoint(p)) {
				return null;
			}
			var p2 = box.clampPoint(p);
			if (p2.x === box.min.x || p2.x === box.max.x) {
				return new THREE.Line3(new THREE.Vector3(p2.x, box.min.y, 0), new THREE.Vector3(p2.x, box.max.y, 0));
			} else {
				return new THREE.Line3(new THREE.Vector3(box.min.x, p2.y, 0), new THREE.Vector3(box.max.x, p2.y, 0));
			}
		}
	}, {
		key: 'findAngleToLine',
		value: function findAngleToLine(p, dist, radius, line) {
			var nearest = line.closestPointToPoint(p);
			var d = p.distanceTo(nearest);
			nearest.sub(p);
			var angleToNearest = Math.atan2(nearest.y, nearest.x);
			var angle = Math.acos(Math.max(Math.min((d - radius) / dist, 1), -1));
			return { left: angle - angleToNearest, right: angle + angleToNearest };
		}
	}, {
		key: 'findExcludedAngles',
		value: function findExcludedAngles(p, d, r, q, w, h, angle) {
			if (p.distanceTo(q) > d + r + w + h) {
				return null;
			}
			var p2 = new THREE.Vector3(p.x, p.y, p.z).sub(q);
			var n = new THREE.Vector3(q.x, q.y, q.z).normalize();
			p2.applyAxisAngle(n, Math.PI / 2 - angle);
			p2.add(q);
			var s1 = new THREE.Spherical();
			var s2 = new THREE.Spherical();
			s1.setFromVector3(p);
			s2.setFromVector3(q);
			p2 = new THREE.Vector2(s2.radius * Math.sin(s2.phi) * (s1.theta - s2.theta), s2.radius * (s1.phi - s2.phi));
			var box = new THREE.Box2(new THREE.Vector2(-h / 2, 0), new THREE.Vector2(h / 2, w));
			var line = Geometry.findNearSideOfBox(p2, box);
			if (line) {
				var interval = Geometry.findAngleToLine(new THREE.Vector3(p2.x, p2.y, 0), d, r, line);
				interval.left -= Math.PI / 2 - angle;
				interval.right -= Math.PI / 2 - angle;
				return interval;
			} else {
				return { left: 0, right: 2 * Math.PI };
			}
		}
	}, {
		key: 'distanceFn',
		value: function distanceFn(xVtr, yVtr, radius, pos) {
			var tmp1 = new THREE$1.Vector3();
			var tmp2 = new THREE$1.Vector3();
			return function (theta) {
				tmp1.copy(xVtr);
				tmp1.multiplyScalar(Math.cos(theta));
				tmp2.copy(yVtr);
				tmp2.multiplyScalar(Math.sin(theta));
				tmp1.add(tmp2);
				tmp1.multiplyScalar(radius);
				return pos.distanceTo(tmp1);
			};
		}
	}, {
		key: 'sumInvDistanceFn',
		value: function sumInvDistanceFn(center, xVtr, yVtr, radius, entities, posFn) {
			var tmp1 = new THREE$1.Vector3();
			var tmp2 = new THREE$1.Vector3();
			return function (theta) {
				theta = theta[0];
				tmp1.copy(xVtr);
				tmp1.multiplyScalar(Math.cos(theta));
				tmp2.copy(yVtr);
				tmp2.multiplyScalar(Math.sin(theta));
				tmp1.add(tmp2);
				tmp1.multiplyScalar(radius);
				tmp1.add(center);
				var val = 0;
				for (var idx = 0; idx < entities.length; idx++) {
					var pos = posFn(entities[idx]);
					var increm = 1 / tmp1.distanceToSquared(pos);
					val += isNaN(increm) ? Infinity : increm;
				}
				return val * 1.0e21;
			};
		}
	}, {
		key: 'getOrthonormal',
		value: function getOrthonormal(normal, v1, v2) {
			if (normal.x === 0) {
				v1.set(1, 0, 0);
			} else {
				v1.set(normal.y, -normal.x, 0);
				v1.normalize();
			}
			v2.copy(v1);
			v2.cross(normal);
			v2.normalize();
		}
	}, {
		key: 'signedAngle',
		value: function signedAngle(u, v, normal) {
			var theta = u.angleTo(v);
			v3tmp1.crossVectors(u, v);
			if (v3tmp1.dot(normal) > 0) theta *= -1;
			return theta;
		}
	}, {
		key: 'pushAwayFunction',
		value: function pushAwayFunction(sigmaSquared) {
			return function (dSquared) {
				return Math.exp(-dSquared / sigmaSquared);
			};
		}
	}, {
		key: 'pointToLineDistanceSquared',
		value: function pointToLineDistanceSquared(pt, line) {
			line.closestPointToPoint(pt, true, v3tmp1);
			return pt.distanceToSquared(v3tmp1);
		}
	}, {
		key: 'lineDistanceSquared',
		value: function lineDistanceSquared(line1, line2) {
			if (line1.start === line1.end) {
				return Geometry.pointToLineDistanceSquared(line1.start, line2);
			} else if (line2.start === line2.end) {
				return Geometry.pointToLineDistanceSquared(line2.start, line1);
			} else if (Geometry.lineSegmentsIntersect(line1.start, line1.end, line2.start, line2.end)) {
				return 0;
			} else {
				return Math.min(Geometry.pointToLineDistanceSquared(line1.start, line2), Geometry.pointToLineDistanceSquared(line1.end, line2), Geometry.pointToLineDistanceSquared(line2.start, line1), Geometry.pointToLineDistanceSquared(line2.end, line1));
			}
		}
	}, {
		key: 'pushFunctionLine',
		value: function pushFunctionLine(line1, r1, r2) {
			if (line1.start === line1.end) {
				return Geometry.pushFunctionLine(line1.start, r1, r2);
			}
			var sigma = r1 + r2;
			var sigmaSquared = sigma * sigma;
			var pushAway = Geometry.pushAwayFunction(sigmaSquared);
			return function (line2) {
				if (Geometry.lineDistanceSquared(line1, line2) > 2.5 * sigmaSquared) {
					return 0;
				}
				var start = line2.start;
				var delta = new THREE$1.Vector3().subVectors(line2.end, start);
				var u = new THREE$1.Vector3();
				var v = new THREE$1.Vector3();
				function coeff(t) {
					u.copy(delta);
					u.multiplyScalar(t);
					v.addvectors(start, u);
					var dSquared = Geometry.pointToLineDistanceSquared(v, line1);
					return pushAway(dSquared);
				}
				var sol = numeric.dopri(0, 1, coeff);
				return sol.y[sol.y.length - 1];
			};
		}
	}, {
		key: 'pushFunctionPoint',
		value: function pushFunctionPoint(pt, r1, r2) {
			var sigma = r1 + r2;
			var sigmaSquared = sigma * sigma;
			var pushAway = Geometry.pushAwayFunction(sigmaSquared);
			return function (line2) {
				if (Geometry.pointToLineDistanceSquared(pt, line2) > 2.5 * sigmaSquared) {
					return 0;
				}
				var start = line2.start;
				var delta = new THREE$1.Vector3().subVectors(line2.end, start);
				var u = new THREE$1.Vector3();
				var v = new THREE$1.Vector3();
				function coeff(t) {
					u.copy(delta);
					u.multiplyScalar(t);
					v.addvectors(start, u);
					var dSquared = pt.distanceTo(v);
					return pushAway(dSquared);
				}
				var sol = numeric.dopri(0, 1, coeff);
				return sol.y[sol.y.length - 1];
			};
		}
	}]);
	return Geometry;
}();

var v3tmp$2 = new THREE$1.Vector3();
var stringAscends = Text.stringAscends;
var stringDescends = Text.stringDescends;
var baseOpacity = 0.9;
var baseFontSize = 24;
var geometry = new THREE$1.PlaneBufferGeometry(1, 1);
function createLabelPlane(colorIndex, label, fontSize, opacity, split, fontData) {
	if (!label) return null;
	var labels = split ? label.split(' ') : [label];
	fontSize = fontSize || baseFontSize;
	opacity = opacity || baseOpacity;
	var textureData = getTextureData(labels, fontSize, fontData, opacity, colorIndex);
	var texture = textureData.texture;
	var material = textureData.materials[colorIndex];
	var mesh = new THREE$1.Mesh(geometry, material);
	var width = textureData.width;
	var height = textureData.height;
	mesh.radius = Math.sqrt(width * width + height * height) / 2;
	mesh.width = width;
	mesh.height = height;
	mesh.scale.set(texture.image.width, texture.image.height, 1);
	mesh.scaleFactor = 1;
	return mesh;
}
var textureCache = {};
function getTextureData(labels, fontSize, fontStyle, opacity, colorIndex) {
	fontStyle = fontStyle || '';
	if (fontStyle) fontStyle += ' ';
	var font = fontStyle + fontSize + 'px sans-serif';
	var key = JSON.stringify({ labels: labels, font: font, opacity: opacity });
	var textureData = textureCache[key];
	if (!textureData) {
		var canvas = StarLabel.createCanvas();
		var context = canvas.getContext('2d');
		context.font = font;
		var ascends = stringAscends(labels);
		var descends = stringDescends(labels);
		var codescent = descends ? 0 : fontSize / 8;
		var ascent = ascends ? fontSize / 8 : 0;
		var descent = descends ? fontSize / 8 : 0;
		var lineHeight = fontSize + ascent - codescent;
		var height = labels.length * lineHeight;
		var width = 0;
		var metrics = void 0;
		var idx = void 0;
		for (idx = 0; idx < labels.length; idx++) {
			metrics = context.measureText(' ' + labels[idx] + ' ');
			width = Math.max(width, metrics.width);
		}
		canvas.width = width;
		canvas.height = height;
		var htOffset = canvas.height - height;
		context.font = font;
		context.textAlign = 'center';
		context.fillStyle = 'rgb(' + Math.round(255 * opacity) + ',' + Math.round(255 * opacity) + ',' + Math.round(255 * opacity) + ')';
		for (idx = 0; idx < labels.length; idx++) {
			context.fillText(labels[idx], canvas.width / 2, htOffset + (idx + 1) * lineHeight - descent - fontSize / 4);
		}
		textureData = {
			texture: new THREE$1.CanvasTexture(canvas),
			width: width,
			height: height,
			materials: []
		};
		textureCache[key] = textureData;
	}
	var material = textureData.materials[colorIndex];
	if (!material) {
		var texture = textureData.texture;
		var color = new THREE$1.Color(colors[colorIndex]);
		var _material = new THREE$1.MeshBasicMaterial({ alphaMap: texture,
			transparent: true,
			color: color,
			side: THREE$1.FrontSide });
		textureData.materials[colorIndex] = _material;
	}
	return textureData;
}
var StarLabel = function () {
	function StarLabel(colorIndex, label, labelData, fontSize, opacity, split, fontInfo) {
		classCallCheck(this, StarLabel);
		this.labelMesh = createLabelPlane(colorIndex, label, fontSize, opacity, split, fontInfo);
		this.label = label;
		this.isCircle = label.length <= 2;
		this.scaleFactor = 1.0;
		if (labelData) {
			var vtr = labelData.vtr;
			this.vtr = new THREE$1.Vector3(vtr.x, vtr.y, vtr.z);
			var orthogVtr = labelData.orthogVtr;
			this.orthogVtr = new THREE$1.Vector3(orthogVtr.x, orthogVtr.y, orthogVtr.z);
			this.minZoom = labelData.minZoom;
		}
		this.setScaleFactor(StarLabel.baseStarScaleFactor);
	}
	createClass(StarLabel, [{
		key: 'setScaleFactor',
		value: function setScaleFactor(scaleFactor) {
			var oldFactor = this.scaleFactor;
			this.labelMesh.scale.multiplyScalar(scaleFactor / oldFactor);
			this.labelMesh.width *= scaleFactor / oldFactor;
			this.labelMesh.height *= scaleFactor / oldFactor;
			this.labelMesh.radius *= scaleFactor / oldFactor;
			this.scaleFactor = scaleFactor;
		}
	}, {
		key: 'getPosition',
		value: function getPosition() {
			return this.labelMesh.position;
		}
	}, {
		key: 'getPositionOffset',
		value: function getPositionOffset() {
			return this.labelMesh.radius;
		}
	}, {
		key: 'intersectsStar',
		value: function intersectsStar(star) {
			return this.intersectsDisk(star.getPosition(), star.radius);
		}
	}, {
		key: 'intersects',
		value: function intersects(starLabel) {
			if (starLabel.isCircle) {
				return this.intersectsDisk(starLabel.labelMesh.position, starLabel.labelMesh.radius);
			} else {
				return this.intersectsRectangularLabel(starLabel);
			}
		}
	}, {
		key: 'getLocalRectangle',
		value: function getLocalRectangle(p1, p2, p3, p4) {
			var mesh = this.labelMesh;
			p1.set(mesh.width / 2, mesh.height / 2);
			p2.set(mesh.width / 2, -mesh.height / 2);
			p3.set(-mesh.width / 2, -mesh.height / 2);
			p4.set(-mesh.width / 2, mesh.height / 2);
		}
	}, {
		key: 'intersectsDisk',
		value: function intersectsDisk(center, radius) {
			var mesh = this.labelMesh;
			var dsq = mesh.position.distanceToSquared(center);
			var sumOfRadiiSq = (mesh.radius + radius) * (mesh.radius + radius);
			if (dsq > sumOfRadiiSq) return false;
			if (this.isCircle) {
				return true;
			} else {
				var p1 = new THREE$1.Vector2();
				var p2 = new THREE$1.Vector2();
				var p3 = new THREE$1.Vector2();
				var p4 = new THREE$1.Vector2();
				this.getLocalRectangle(p1, p2, p3, p4);
				v3tmp$2.subVectors(center, mesh.position);
				var c = new THREE$1.Vector2(v3tmp$2.dot(this.vtr), v3tmp$2.dot(this.orthogVtr));
				return Geometry.circleIntersectsRectangle(c, radius, p1, p2, p3, p4);
			}
		}
	}, {
		key: 'getGlobalRectangle',
		value: function getGlobalRectangle(p1, p2, p3, p4) {
			var mesh = this.labelMesh;
			var center = mesh.position;
			var tmp1 = new THREE$1.Vector3().copy(this.vtr).multiplyScalar(mesh.width / 2);
			var tmp2 = new THREE$1.Vector3().copy(this.orthogVtr).multiplyScalar(mesh.height / 2);
			p1.addVectors(tmp1, tmp2);
			p1.add(center);
			tmp2.multiplyScalar(-1);
			p2.addVectors(tmp1, tmp2);
			p2.add(center);
			tmp1.multiplyScalar(-1);
			p3.addVectors(tmp1, tmp2);
			p3.add(center);
			tmp2.multiplyScalar(-1);
			p4.addVectors(tmp1, tmp2);
			p4.add(center);
		}
	}, {
		key: 'intersectsRectangularLabel',
		value: function intersectsRectangularLabel(rectLabel) {
			var mesh = this.labelMesh;
			var center = rectLabel.labelMesh.position;
			var radius = rectLabel.labelMesh.radius;
			var dsq = mesh.position.distanceToSquared(center);
			var sumOfRadiiSq = (mesh.radius + radius) * (mesh.radius + radius);
			if (dsq > sumOfRadiiSq) return false;
			if (this.isCircle) {
				return rectLabel.intersectsDisk(mesh.position, mesh.radius);
			} else {
				var p1 = new THREE$1.Vector3();
				var p2 = new THREE$1.Vector3();
				var p3 = new THREE$1.Vector3();
				var p4 = new THREE$1.Vector3();
				rectLabel.getGlobalRectangle(p1, p2, p3, p4);
				var q1 = new THREE$1.Vector2();
				var q2 = new THREE$1.Vector2();
				var q3 = new THREE$1.Vector2();
				var q4 = new THREE$1.Vector2();
				this.localizeVector(p1, q1);
				this.localizeVector(p2, q2);
				this.localizeVector(p3, q3);
				this.localizeVector(p4, q4);
				var r1 = new THREE$1.Vector2();
				var r2 = new THREE$1.Vector2();
				var r3 = new THREE$1.Vector2();
				var r4 = new THREE$1.Vector2();
				this.getLocalRectangle(r1, r2, r3, r4);
				return Geometry.rectanglesIntersect([q1, q2, q3, q4], [r1, r2, r3, r4]);
			}
		}
	}, {
		key: 'localizeVector',
		value: function localizeVector(p, q) {
			var p_rel = new THREE$1.Vector3().copy(p);
			p_rel.sub(this.labelMesh.position);
			q = q || new THREE$1.Vector2();
			q.set(p_rel.dot(this.vtr), p_rel.dot(this.orthogVtr));
			return q;
		}
	}, {
		key: 'setVisible',
		value: function setVisible(visible, group) {
			var parent = this.labelMesh.parent;
			if (!visible) {
				if (parent) {
					parent.remove(this.labelMesh);
				}
			} else {
				if (parent && parent !== group) {
					parent.remove(this.labelMesh);
					group.add(this.labelMesh);
				} else if (!parent) {
					group.add(this.labelMesh);
				}
			}
		}
	}, {
		key: 'lookAt',
		value: function lookAt(lookAtPos, up) {
			if (!this.isCircle) {
				this.labelMesh.up.copy(this.orthogVtr);
				if (this.orthogVtr.dot(up) < 0) {
					this.labelMesh.up.multiplyScalar(-1);
				}
			} else {
				this.labelMesh.up.copy(up);
			}
			this.labelMesh.lookAt(lookAtPos);
		}
	}], [{
		key: 'createCanvas',
		value: function createCanvas() {
			return document.createElement('canvas');
		}
	}]);
	return StarLabel;
}();

var baseStarScaleFactor = distance / 1000;
var v3tmp$1 = new THREE$1.Vector3();
var LabeledStar = function (_DecoratedStar) {
	inherits(LabeledStar, _DecoratedStar);
	function LabeledStar(starData, zoom, colorLevel, baseBrightness, baseRadius) {
		classCallCheck(this, LabeledStar);
		var _this = possibleConstructorReturn(this, (LabeledStar.__proto__ || Object.getPrototypeOf(LabeledStar)).call(this, starData, zoom, colorLevel, baseBrightness, baseRadius));
		var letter = _this.getLetter();
		var colorCode = _this.getNameColorCode();
		_this.normal = new THREE$1.Vector3();
		_this.normal.copy(_this.mesh.position);
		_this.normal.normalize();
		if (letter) {
			_this.letterLabel = new StarLabel(colorCode, letter, starData.letterLabel);
		}
		if (_this.isMain()) {
			var shortName = _this.getShortName() || letter;
			_this.shortNameLabel = new StarLabel(colorCode, shortName, starData.shortNameLabel);
		}
		return _this;
	}
	createClass(LabeledStar, [{
		key: 'setLabelPosition',
		value: function setLabelPosition(zoom, lookAtPos, up, shortName) {
			var unitVtr = v3tmp$1;
			var labelObj = shortName ? this.shortNameLabel : this.letterLabel;
			unitVtr.copy(labelObj.vtr);
			var starScaleFactor = baseStarScaleFactor / Math.max(1, zoom - 0.2);
			labelObj.setScaleFactor(starScaleFactor);
			var pos = labelObj.getPosition();
			pos.addVectors(this.mesh.position, unitVtr.multiplyScalar(this.radius + labelObj.getPositionOffset()));
			labelObj.lookAt(lookAtPos, up);
		}
	}, {
		key: 'orientLabel',
		value: function orientLabel(lookAtPos, up, shortName) {
			var labelObj = shortName ? this.shortNameLabel : this.letterLabel;
			labelObj.lookAt(lookAtPos, up);
		}
	}, {
		key: 'intersectsStarOrLabel',
		value: function intersectsStarOrLabel(otherStar, starLabel, main) {
			if (otherStar.index !== this.index) {
				if (starLabel.intersectsStar(otherStar)) {
					return true;
				}
				var otherLabel = main ? otherStar.shortNameLabel : otherStar.letterLabel;
				if (otherStar.index < this.index && starLabel.intersects(otherLabel)) {
					return true;
				}
			}
			return false;
		}
	}, {
		key: 'setLabelVisibility',
		value: function setLabelVisibility(main, zoom) {
			if (main && !this.shortNameLabel) return false;
			var visible = true;
			var starList = main ? mainStars : allStars;
			var starLabel = main ? this.shortNameLabel : this.letterLabel;
			if (starLabel.minZoom !== undefined) {
				visible = starLabel.minZoom <= zoom;
				var _labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
				starLabel.setVisible(visible, _labelGroup);
				return visible;
			}
			if (main) {
				for (var idx = 0; idx < LabeledStar.shadows.length && visible; idx++) {
					visible = visible && !this.intersectsStarOrLabel(LabeledStar.shadows[idx], starLabel, main);
				}
			}
			for (var _idx = 0; _idx < starList.length && visible; _idx++) {
				var star = starList[_idx];
				visible = visible && !this.intersectsStarOrLabel(star, starLabel, main);
			}
			var labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
			starLabel.setVisible(visible, labelGroup);
			return visible;
		}
	}, {
		key: 'isMain',
		value: function isMain() {
			if (this.main === undefined) {
				this.main = this.constell !== '' && (this.magnitude <= 3.9 || !!this.getWellKnownName());
			}
			return this.main;
		}
	}, {
		key: 'getLabelReach',
		value: function getLabelReach(label) {
			return this.radius + 2 * label.labelMesh.radius;
		}
	}, {
		key: 'findNearbyStars',
		value: function findNearbyStars(label, candidates, nearbyStars) {
			nearbyStars = nearbyStars || [];
			var labelReach = this.getLabelReach(label);
			var len = candidates.length;
			for (var idx = 0; idx < len; idx++) {
				var star1 = candidates[idx];
				if (this !== star1) {
					var dist = this.mesh.position.distanceToSquared(star1.mesh.position);
					var maxDist = Math.pow(labelReach + star1.getLabelReach(label), 2);
					if (maxDist > dist) {
						nearbyStars.push(star1);
					}
				}
			}
			return nearbyStars;
		}
	}, {
		key: 'computeLabelVectors',
		value: function computeLabelVectors(shortName) {
			var label = void 0;
			label = shortName ? this.shortNameLabel : this.letterLabel;
			if (!label) return;
			label.normal = this.normal.clone();
			if (label.vtr) {
				return;
			}
			var xVtr = new THREE$1.Vector3();
			var yVtr = new THREE$1.Vector3();
			Geometry.getOrthonormal(this.normal, xVtr, yVtr);
			var nearbyStars = [];
			this.findNearbyStars(label, shortName ? mainStars : allStars, nearbyStars);
			if (nearbyStars.length === 0) {
				label.vtr = xVtr;
				label.orthogVtr = yVtr;
				return;
			}
			var radius = this.radius + label.labelMesh.radius / 4;
			var f = Geometry.sumInvDistanceFn(this.getPosition(), xVtr, yVtr, radius, nearbyStars, function (star) {
				return star.getPosition();
			});
			var val = f([0]);
			var start = 0;
			var cand = 0;
			for (var idx = 1; idx < 16; idx++) {
				cand += Math.PI / 2;
				var val2 = f([cand]);
				if (val2 < val) {
					start = cand;
				}
			}
			var result = numeric.uncmin(f, [start]);
			var theta = result.solution[0] % (2 * Math.PI);
			label.vtr = xVtr;
			label.vtr.multiplyScalar(Math.cos(theta));
			var tmp = new THREE$1.Vector3();
			tmp.copy(yVtr);
			tmp.multiplyScalar(Math.sin(theta));
			label.vtr.add(tmp);
			label.orthogVtr = label.vtr.clone();
			label.orthogVtr.cross(this.normal);
		}
	}, {
		key: 'setStarLabelVisible',
		value: function setStarLabelVisible(main, visible) {
			var starLabel = main ? this.shortNameLabel : this.letterLabel;
			if (starLabel) {
				var labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
				starLabel.setVisible(visible, labelGroup);
			}
		}
	}], [{
		key: 'initStars',
		value: function initStars(group, zoom, colorLevel, baseBrightness, baseRadius) {
			zoom = zoom || ssettings.get('view', 'zoom');
			baseBrightness = baseBrightness || ssettings.get('stars', 'starbrightness');
			baseRadius = baseRadius || 1000 * ssettings.get('stars', 'starradius');
			colorLevel = colorLevel || ssettings.get('stars', 'colorlevel');
			StarLabel.baseStarScaleFactor = baseStarScaleFactor;
			LabeledStar.infoTextGroup = new THREE$1.Group();
			LabeledStar.infoTextGroup.name = 'infoTextGroup';
			group.add(LabeledStar.infoTextGroup);
			LabeledStar.letterGroup = new THREE$1.Group();
			LabeledStar.letterGroup.name = 'letterGroup';
			LabeledStar.infoTextGroup.add(LabeledStar.letterGroup);
			LabeledStar.shortNameGroup = new THREE$1.Group();
			LabeledStar.shortNameGroup.name = 'letterGroup';
			LabeledStar.infoTextGroup.add(LabeledStar.shortNameGroup);
			for (var idx = 0; idx < allStars.length; idx++) {
				var star = new LabeledStar(allStars[idx], zoom, colorLevel, baseBrightness, baseRadius);
				star.stardata = allStars[idx];
				star.index = idx;
				allStars[idx] = star;
				if (star.radius >= .01) {
					star.addToGroup(group);
				}
			}
			for (var _idx2 = 0; _idx2 < mainStars.length; _idx2++) {
				mainStars[_idx2] = allStars[mainStars[_idx2]];
			}
			for (var _idx3 = 0; _idx3 < allStars.length; _idx3++) {
				var _star = allStars[_idx3];
				if (_star.main) _star.computeLabelVectors(true);
				_star.computeLabelVectors(false);
			}
		}
	}, {
		key: 'updateStars',
		value: function updateStars(group, zoom, colorLevel, baseBrightness, baseRadius) {
			zoom = zoom || ssettings.get('view', 'zoom');
			baseBrightness = baseBrightness || ssettings.get('stars', 'starbrightness');
			baseRadius = baseRadius || 1000 * ssettings.get('stars', 'starradius');
			colorLevel = colorLevel || ssettings.get('stars', 'colorlevel');
			for (var idx = 0; idx < allStars.length; idx++) {
				allStars[idx].updateBrightnessAndRadius(zoom, colorLevel, baseBrightness, baseRadius);
				if (allStars[idx].radius < .01) {
					allStars[idx].removeFromGroup();
				} else {
					allStars[idx].addToGroup(group);
				}
			}
		}
	}, {
		key: 'setLabelPositionAndVisibility',
		value: function setLabelPositionAndVisibility(camera, up, main) {
			var starList = main ? mainStars : allStars;
			camera.getWorldPosition(v3tmp$1);
			if (main) {
				for (var idx = 0; idx < LabeledStar.shadows.length; idx++) {
					LabeledStar.shadows[idx].updatePositionEtc();
				}
				var onscreen = LabeledStar.shadows.concat(mainStars);
				for (var _idx4 = 0; _idx4 < LabeledStar.shadows.length; _idx4++) {
					var shadow = LabeledStar.shadows[_idx4];
					shadow.setLabelPosition(camera.zoom, onscreen, v3tmp$1, up, main);
					shadow.setLabelVisibility(main);
				}
			}
			for (var _idx5 = 0; _idx5 < starList.length; _idx5++) {
				var star = starList[_idx5];
				if (!main || star.main                                                     ) {
						star.setLabelPosition(camera.zoom, v3tmp$1, up, main);
						star.setLabelVisibility(main, camera.zoom);
					} else {
					star.setStarLabelVisible(main, false);
				}
			}
		}
	}, {
		key: 'orientLabels',
		value: function orientLabels(camera, up, main) {
			camera.getWorldPosition(v3tmp$1);
			var starList = LabeledStar.shadows;
			if (main) {
				for (var idx = 0; idx < starList.length; idx++) {
					var shadow = starList[idx];
					if (!main || shadow.main)
                                                                                                        {
							shadow.orientLabel(v3tmp$1, up, main);
						}
				}
			}
			starList = main ? mainStars : allStars;
			for (var _idx6 = 0; _idx6 < starList.length; _idx6++) {
				var star = starList[_idx6];
				if (!main || star.main)                                                     {
						star.orientLabel(v3tmp$1, up, main);
					}
			}
		}
	}, {
		key: 'updatePlanetLabels',
		value: function updatePlanetLabels(camera, up, main) {
			if (!main) return;
			var starList = mainStars;
			camera.getWorldPosition(v3tmp$1);
			for (var idx = 0; idx < LabeledStar.shadows.length; idx++) {
				LabeledStar.shadows[idx].updatePositionEtc();
			}
			var onscreen = LabeledStar.shadows.concat(mainStars);
			var shadowLen = LabeledStar.shadows.length;
			for (var _idx7 = 0; _idx7 < shadowLen; _idx7++) {
				var shadow = LabeledStar.shadows[_idx7];
				shadow.setLabelPosition(camera.zoom, onscreen, v3tmp$1, up, main);
				shadow.setLabelVisibility(main);
			}
			var starLen = starList.length;
			for (var _idx8 = 0; _idx8 < starLen; _idx8++) {
				var star = starList[_idx8];
				var starLabel = star.shortNameLabel;
				var visible = starLabel.minZoom <= camera.zoom;
				for (var jdx = 0; jdx < shadowLen && visible; jdx++) {
					var _shadow = LabeledStar.shadows[jdx];
					if (_shadow.shortNameLabel.labelMesh.parent) {
						visible = visible && !star.intersectsStarOrLabel(_shadow, starLabel, main);
					}
				}
			}
		}
	}]);
	return LabeledStar;
}(DecoratedStar);

var baseStarScaleFactor$1 = distance / 1000;
var v3tmp$3 = new THREE$1.Vector3();
var v3tmp2 = new THREE$1.Vector3();
var ShadowStar = function () {
	function ShadowStar(planet, camera) {
		classCallCheck(this, ShadowStar);
		this.planet = planet;
		this.camera = camera;
		this.shortNameLabel = new StarLabel(colors.length - 2, planet.name);
		this.position = new THREE$1.Vector3();
		this.normal = new THREE$1.Vector3();
		this.updatePositionEtc();
		this.main = true;
	}
	createClass(ShadowStar, [{
		key: 'updatePositionEtc',
		value: function updatePositionEtc() {
			this.planet.mesh.getWorldPosition(v3tmp$3);
			this.camera.getWorldPosition(v3tmp2);
			this.position.subVectors(v3tmp$3, v3tmp2);
			var ratio = distance / this.position.length();
			this.position.multiplyScalar(ratio);
			this.position.add(v3tmp2);
			this.radius = this.planet.radius * ratio;
			this.normal.copy(this.position);
			this.normal.normalize();
		}
	}, {
		key: 'getPosition',
		value: function getPosition() {
			return this.position;
		}
	}, {
		key: 'computeLabelVectors',
		value: function computeLabelVectors(shortName, onscreen) {
			if (!shortName) return;
			var label = this.shortNameLabel;
			var radius = this.radius + label.labelMesh.radius;
			var xVtr = new THREE$1.Vector3();
			var yVtr = new THREE$1.Vector3();
			Geometry.getOrthonormal(this.normal, xVtr, yVtr);
			var f = Geometry.sumInvDistanceFn(this.getPosition(), xVtr, yVtr, radius, onscreen, function (thing) {
				return thing.getPosition();
			});
			var val = f([0]);
			var start = 0;
			var cand = 0;
			for (var idx = 1; idx < 16; idx++) {
				cand += Math.PI / 2;
				var val2 = f([cand]);
				if (val2 < val) {
					start = cand;
				}
			}
			var result = numeric.uncmin(f, [start]);
			var theta = result.solution[0] % (2 * Math.PI);
			label.vtr = xVtr.clone();
			label.vtr.multiplyScalar(Math.cos(theta));
			var tmp = new THREE$1.Vector3();
			tmp.copy(yVtr);
			tmp.multiplyScalar(Math.sin(theta));
			label.vtr.add(tmp);
			label.orthogVtr = label.vtr.clone();
			label.orthogVtr.cross(this.normal);
			label.normal = this.normal.clone();
		}
	}, {
		key: 'setLabelPosition',
		value: function setLabelPosition(zoom, onscreen, lookAtPos, up, shortName) {
			if (!shortName) return;
			this.computeLabelVectors(shortName, onscreen);
			var unitVtr = new THREE$1.Vector3();
			var labelObj = shortName ? this.shortNameLabel : this.letterLabel;
			unitVtr.copy(labelObj.vtr);
			var starScaleFactor = baseStarScaleFactor$1 / Math.max(1, zoom - 0.2);
			labelObj.setScaleFactor(starScaleFactor);
			var pos = labelObj.getPosition();
			pos.addVectors(this.getPosition(), unitVtr.multiplyScalar(this.radius + labelObj.getPositionOffset()));
			labelObj.lookAt(lookAtPos, up);
		}
	}, {
		key: 'setStarLabelVisible',
		value: function setStarLabelVisible(main, visible) {
			var starLabel = main ? this.shortNameLabel : this.letterLabel;
			if (starLabel) {
				var labelGroup = main ? LabeledStar.shortNameGroup : LabeledStar.letterGroup;
				starLabel.setVisible(visible, labelGroup);
			}
		}
	}, {
		key: 'setLabelVisibility',
		value: function setLabelVisibility(main) {
			if (!main) return;
			var visible = !(this.planet === Viewer.getViewer().homePlanet);
			this.setStarLabelVisible(main, visible);
		}
	}, {
		key: 'orientLabel',
		value: function orientLabel(lookAtPos, up, shortName) {
			if (this.planet !== Viewer.getViewer().homePlanet) {
				this.orientLabelInner(lookAtPos, up, shortName);
			}
		}
	}], [{
		key: 'init',
		value: function init(camera) {
			LabeledStar.shadows = [];
			var shadows = LabeledStar.shadows;
			shadows.push(new ShadowStar(planets.jupiter, camera));
			shadows.push(new ShadowStar(planets.saturn, camera));
			shadows.push(new ShadowStar(planets.earth, camera));
			shadows.push(new ShadowStar(planets.venus, camera));
			shadows.push(new ShadowStar(planets.mars, camera));
			shadows.push(new ShadowStar(planets.mercury, camera));
			shadows.push(new ShadowStar(planets.uranus, camera));
			shadows.push(new ShadowStar(planets.neptune, camera));
		}
	}]);
	return ShadowStar;
}();
ShadowStar.prototype.orientLabelInner = LabeledStar.prototype.orientLabel;
ShadowStar.prototype.getLabelReach = LabeledStar.prototype.getLabelReach;
ShadowStar.prototype.findNearbyStars = LabeledStar.prototype.findNearbyStars;

var radians = Utils.radians;
var baseOpacity$1 = 0.9;
var baseStarScaleFactor$2 = distance / 1000;
var labelManager = null;
var LabelManager = function () {
	function LabelManager(camera, renderer) {
		classCallCheck(this, LabelManager);
		this.camera = camera;
		this.renderer = renderer;
		this.up = new THREE$1.Vector3();
		this.displayGroups = [];
		this.shortNameGroup = new THREE$1.Group();
		this.commonGroup = new THREE$1.Group();
		this.commonGroup.visible = false;
		LabeledStar.infoTextGroup.add(this.commonGroup);
		this.displayGroups.push(LabeledStar.shortNameGroup);
		this.displayGroups.push(LabeledStar.letterGroup);
		this.displayMode = 0;
		this.enabled = true;
	}
	createClass(LabelManager, [{
		key: 'displayOff',
		value: function displayOff() {
			return this.displayMode === this.noDisplay;
		}
	}, {
		key: 'nextDisplayMode',
		value: function nextDisplayMode() {
			this.displayMode = (this.displayMode + 1) % this.displayModeMax;
			this.setUpDirection();
			for (var idx = 0; idx < this.displayModeMax - 1; idx++) {
				if (this.displayMode === idx + 1) {
					LabeledStar.setLabelPositionAndVisibility(this.camera, this.up, idx === 0);
					this.displayGroups[idx].visible = true;
					this.commonGroup.visible = true;
				} else {
					this.displayGroups[idx].visible = false;
				}
			}
			if (this.displayOff()) {
				this.commonGroup.visible = false;
			}
		}
	}, {
		key: 'orientDisplay',
		value: function orientDisplay() {
			if (this.enabled && !this.displayOff()) {
				this.setUpDirection();
				LabeledStar.orientLabels(this.camera, this.up, this.displayMode === 1);
			}
		}
	}, {
		key: 'updateDisplay',
		value: function updateDisplay(starLabels, planetLabels) {
			if (this.enabled && !this.displayOff()) {
				this.setUpDirection();
				if (starLabels) {
					LabeledStar.setLabelPositionAndVisibility(this.camera, this.up, this.displayMode === 1);
				} else if (planetLabels) {
					LabeledStar.updatePlanetLabels(this.camera, this.up, this.displayMode === 1);
				}
				LabeledStar.orientLabels(this.camera, this.up, this.displayMode === 1);
				for (var constell in constellations) {
					if (constellations.hasOwnProperty(constell)) {
						var constellation = constellations[constell];
						this.orientConstellationLabels(constellation, this.camera.zoom);
					}
				}
			}
		}
	}, {
		key: 'setUpDirection',
		value: function setUpDirection() {
			Utils.findScreenUpDirection(this.camera, this.renderer, this.up);
		}
	}, {
		key: 'orientConstellationLabels',
		value: function orientConstellationLabels(constellation, zoom) {
			zoom = zoom || this.camera.zoom;
			var starScaleFactor = baseStarScaleFactor$2 / Math.max(1, zoom - 0.2);
			var labelObjs = constellation.labelObjs;
			if (!labelObjs) return;
			var labelObj;
			for (var idx = 0; idx < labelObjs.length; idx++) {
				labelObj = labelObjs[idx];
				labelObj.labelMesh.up.copy(this.up);
				labelObj.labelMesh.lookAt(this.camera.position);
				labelObj.setScaleFactor(starScaleFactor);
			}
		}
	}, {
		key: 'addConstellationLabels',
		value: function addConstellationLabels(zoom) {
			zoom = zoom || this.camera.zoom;
			var constell;
			var labelObj, labelPos;
			var split = true;
			for (var cstl in constellations) {
				if (cstl !== '' && constellations.hasOwnProperty(cstl)) {
					constell = constellations[cstl];
					constell.labelObjs = [];
					for (var idx = 0; idx < constell.labelPos.length; idx++) {
						labelPos = constell.labelPos[idx];
						labelObj = new StarLabel(constell.color, constell.nom.toUpperCase(), undefined, 22, baseOpacity$1 - 0.2, split, 'italic');
						var spherical = new THREE$1.Spherical(distance * 1.0002, radians(90 - labelPos.latitude), radians(90 + labelPos.longitude));
						labelObj.getPosition().setFromSpherical(spherical);
						constell.labelPos[idx] = labelObj.getPosition().clone();
						this.commonGroup.add(labelObj.labelMesh);
						constell.labelObjs.push(labelObj);
					}
					this.orientConstellationLabels(constell, zoom);
				}
			}
		}
	}], [{
		key: 'createLabelManager',
		value: function createLabelManager(camera, renderer) {
			labelManager = new LabelManager(camera, renderer);
			return labelManager;
		}
	}, {
		key: 'getLabelManager',
		value: function getLabelManager() {
			return labelManager;
		}
	}]);
	return LabelManager;
}();
Object.assign(LabelManager.prototype, {
	noDisplay: 0,
	shortNames: 1,
	all: 2,
	greekOrBright: 3,
	bsNos: 4,
	greekLettersBright: 5,
	greekLetters: 6,
	displayModeMax: 3
});

var contextMenu = void 0;
var isMobile$1 = navigator.userAgent.indexOf('Mobile') >= 0;
var isApple$2 = navigator.userAgent.indexOf('Mac OS X') >= 0;
var initContextMenu = function initContextMenu(onActivate, onDeactivate) {
	function getPosition(e) {
		var posx = 0;
		var posy = 0;
		if (!e) e = window.event;
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		} else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return {
			x: posx,
			y: posy
		};
	}
	function positionMenu(clickCoords, menu) {
		clickCoordsX = clickCoords.x;
		clickCoordsY = clickCoords.y;
		menuWidth = menu.offsetWidth + 4;
		menuHeight = menu.offsetHeight + 4;
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		if (isMobile$1 && isApple$2) {
			menu.style.left = '0px';
			menu.style.top = '0px';
		} else {
			if (windowWidth - clickCoordsX < menuWidth) {
				menu.style.left = windowWidth - menuWidth + 'px';
			} else {
				menu.style.left = clickCoordsX - 15 + 'px';
			}
			if (windowHeight - clickCoordsY < menuHeight) {
				menu.style.top = windowHeight - menuHeight + 'px';
			} else {
				menu.style.top = clickCoordsY - 15 + 'px';
			}
		}
	}
	var clickCoordsX = void 0;
	var clickCoordsY = void 0;
	var menuWidth = void 0;
	var menuHeight = void 0;
	var windowWidth = void 0;
	var windowHeight = void 0;
	var menu = document.querySelector('#controls');
	function init() {
		if (!isMobile$1) {
			contextListener();
			keyupListener();
		}
		var acc = document.getElementsByClassName('accordion');
		var i = void 0;
		for (i = 0; i < acc.length; i++) {
			acc[i].addEventListener('click', function (event) {
				event.stopPropagation();
				event.preventDefault();
				this.classList.toggle('active');
				var panel = this.nextElementSibling;
				if (panel.style.display === 'block') {
					panel.style.display = 'none';
				} else {
					panel.style.display = 'block';
				}
			}, { passive: false });
		}
	}
	var listener = function listener(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		listener2(getPosition(e));
	};
	var listener2 = function listener2(clickCoords) {
		positionMenu(clickCoords, menu);
		if (menu.style.display === 'block') {
			menu.style.display = 'none';
			menu.removeEventListener('mouseenter', onActivate, { passive: false });
			menu.removeEventListener('mouseleave', onDeactivate, { passive: false });
			onDeactivate();
		} else {
			menu.addEventListener('mouseenter', onActivate, { passive: false });
			menu.addEventListener('mouseleave', onDeactivate, { passive: false });
			menu.style.display = 'block';
		}
	};
	function contextListener() {
		document.addEventListener('contextmenu', listener, true);
	}
	function toggleMenuOff() {
		menu.style.display = 'none';
		menu.removeEventListener('mouseenter', onActivate, { passive: false });
		menu.removeEventListener('mouseleave', onDeactivate, { passive: false });
		onDeactivate();
	}
	function keyupListener() {
		window.onkeyup = function (e) {
			if (e.keyCode === 27) {
				toggleMenuOff();
			}
		};
	}
	function menuOn() {
		return isMobile$1 ? window.disablePPointerEvents : menu.style.display === 'block';
	}
	init();
	contextMenu = {
		menuOn: menuOn,
		menuOff: toggleMenuOff,
		listener: listener2
	};
};
function dismissContextMenu() {
	contextMenu.menuOff();
}

var CameraControl = function CameraControl(camera, renderer) {
	this.camera = camera;
	this.renderer = renderer;
	this.enabled = true;
	this.startX = 0;
	this.startY = 0;
	this.startElevation = 0;
	this.startRotation = 0;
	this.enabled = true;
	this.callback = null;
	document.addEventListener('mousedown', mousedown, { passive: false });
	document.addEventListener('touchstart', touchstart, { passive: false });
	var _this = this;
	this.dispose = function () {
		document.removeEventListener('mousedown', mousedown, { passive: false });
		document.removeEventListener('mousemove', mousemove, { passive: false });
		document.removeEventListener('mouseup', mouseup, { passive: false });
		document.removeEventListener('touchstart', touchstart, { passive: false });
		document.removeEventListener('touchmove', touchmove, { passive: false });
		document.removeEventListener('touchend', touchend, { passive: false });
	};
	function mousedown(event) {
		if (_this.enabled === false) return;
		if (event.button != THREE$1.MOUSE.LEFT) return;
		event.preventDefault();
		event.stopPropagation();
		_this.startX = event.clientX;
		_this.startY = event.clientY;
		var angles = _this.startCallback();
		_this.startElevation = angles.elevation;
		_this.startRotation = angles.rotation;
		document.addEventListener('mousemove', mousemove, { passive: false });
		document.addEventListener('mouseup', mouseup, { passive: false });
	}
	function touchstart(event) {
		if (_this.enabled === false) return;
		switch (event.touches.length) {
			case 1:
				_this.startX = event.touches[0].clientX;
				_this.startY = event.touches[0].clientY;
				var angles = _this.startCallback();
				_this.startElevation = angles.elevation;
				_this.startRotation = angles.rotation;
				document.addEventListener('touchmove', touchmove, { passive: false });
				document.addEventListener('touchend', touchend, { passive: false });
				break;
			default:
				break;
		}
	}
	function reportChange(x, y) {
		if (_this.changeCallback) {
			var angles = _this.getAngleChange(x, y);
			_this.startElevation += angles.elevation;
			_this.startElevation = Math.max(Math.min(_this.startElevation, 89), -89);
			_this.startRotation += angles.rotation;
			_this.startRotation %= 360;
			_this.changeCallback(_this.startElevation, _this.startRotation);
		}
	}
	function mouseup(event) {
		if (_this.enabled === false) return;
		if (event.button != THREE$1.MOUSE.LEFT) return;
		event.preventDefault();
		document.removeEventListener('mousemove', mousemove, { passive: false });
		document.removeEventListener('mouseup', mouseup, { passive: false });
	}
	function touchend(event) {
		if (_this.enabled === false) return;
		document.removeEventListener('touchmove', touchmove, { passive: false });
		document.removeEventListener('touchend', touchend, { passive: false });
	}
	function mousemove(event) {
		if (_this.enabled === false) return;
		if (event.button != THREE$1.MOUSE.LEFT) return;
		event.preventDefault();
		event.stopPropagation();
		reportChange(event.clientX, event.clientY);
	}
	function touchmove(event) {
		if (_this.enabled === false) return;
		switch (event.touches.length) {
			case 1:
				event.preventDefault();
				reportChange(event.touches[0].clientX, event.touches[0].clientY);
				break;
			default:
				break;
		}
	}
	this.disable = function () {
		this.enabled = false;
		document.removeEventListener('mousemove', mousemove, { passive: false });
		document.removeEventListener('mouseup', mouseup, { passive: false });
		document.removeEventListener('touchmove', touchmove, { passive: false });
		document.removeEventListener('touchend', touchend, { passive: false });
	};
	this.enable = function () {
		this.enabled = true;
	};
};
var vtmp = new THREE$1.Vector3();
var v2tmp = new THREE$1.Vector2();
CameraControl.prototype.getAngleChange = function (currX, currY) {
	this.camera.helper.position.copy(this.camera.position);
	this.camera.helper.position.multiplyScalar(10000);
	Utils.toScreenPosition(this.camera.helper, this.camera, this.renderer, vtmp, v2tmp);
	var factor = this.camera.rotation.x > 0 ? 1 : -1;
	var height = this.renderer.domElement.height * this.camera.zoom;
	var deltaAngle = {
		elevation: (currY - this.startY) * this.camera.fov / height,
		rotation: -(currX - this.startX) * this.camera.fov / height
	};
	if (v2tmp !== null && v2tmp.y > (currY + this.startY) / 2) {
		factor *= -1;
	}
	deltaAngle.rotation *= factor;
	this.startX = currX;
	this.startY = currY;
	return deltaAngle;
};

var ZoomControl = function ZoomControl(domElement) {
	this.domElement = domElement || document;
	this.enabled = true;
	this.enableZoom = true;
	this.zoomSpeed = 1.0;
	this.mouseButton = THREE$1.MOUSE.MIDDLE;
	this.active = false;
	this.dispose = function () {
		scope.domElement.removeEventListener('mousedown', onMouseDown, false);
		scope.domElement.removeEventListener('wheel', onMouseWheel, false);
		scope.domElement.removeEventListener('touchstart', onTouchStart, false);
		scope.domElement.removeEventListener('touchend', onTouchEnd, false);
		scope.domElement.removeEventListener('touchmove', onTouchMove, false);
		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
	};
	var scope = this;
	var zoomStart = new THREE$1.Vector2();
	var zoomEnd = new THREE$1.Vector2();
	var zoomDelta = new THREE$1.Vector2();
	function getZoomScale(rate) {
		rate = rate || scope.zoomSpeed;
		return Math.pow(0.95, rate);
	}
	function handleMouseDownZoom(event) {
		zoomStart.set(event.clientX, event.clientY);
	}
	function handleMouseMoveZoom(event) {
		zoomEnd.set(event.clientX, event.clientY);
		zoomDelta.subVectors(zoomEnd, zoomStart);
		if (scope.zoomCallback && zoomDelta.y !== 0) {
			var scale = getZoomScale();
			scope.zoomCallback(zoomDelta.y < 0 ? 1 / scale : scale);
		}
		zoomStart.copy(zoomEnd);
	}
	function handleMouseWheel(event) {
		if (scope.zoomCallback && event.deltaY !== 0) {
			var scale = getZoomScale();
			scope.zoomCallback(event.deltaY > 0 ? 1 / scale : scale);
		}
	}
	function handleTouchStartZoom(event) {
		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;
		var distance = Math.sqrt(dx * dx + dy * dy);
		zoomStart.set(0, distance);
	}
	function handleTouchMoveZoom(event) {
		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;
		var distance = Math.sqrt(dx * dx + dy * dy);
		zoomEnd.set(0, distance);
		zoomDelta.subVectors(zoomEnd, zoomStart);
		if (scope.zoomCallback && zoomDelta.y !== 0) {
			var scale = getZoomScale(1.5);
			scope.zoomCallback(zoomDelta.y > 0 ? 1 / scale : scale);
		}
		zoomStart.copy(zoomEnd);
	}
	function onMouseDown(event) {
		if (scope.enabled === false) return;
		if (scope.enableZoom === false) return;
		if (event.button !== scope.mouseButton) return;
		event.preventDefault();
		handleMouseDownZoom(event);
		scope.active = true;
		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('mouseup', onMouseUp, false);
	}
	function onMouseMove(event) {
		if (scope.enabled === false) return;
		if (scope.enableZoom === false) return;
		if (scope.active === false) return;
		event.preventDefault();
		handleMouseMoveZoom(event);
	}
	function onMouseUp(event) {
		if (scope.enabled === false) return;
		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
		scope.active = false;
	}
	function onMouseWheel(event) {
		if (scope.enabled === false || scope.enableZoom === false || scope.active) return;
		event.preventDefault();
		event.stopPropagation();
		handleMouseWheel(event);
	}
	function onTouchStart(event) {
		if (scope.enabled === false) return;
		switch (event.touches.length) {
			case 2:
				if (scope.enableZoom === false) return;
				handleTouchStartZoom(event);
				scope.active = true;
				break;
			default:
				scope.active = false;
		}
	}
	function onTouchMove(event) {
		if (scope.enabled === false) return;
		if (scope.active === false) return;
		if (scope.enableZoom === false) return;
		switch (event.touches.length) {
			case 2:
				event.preventDefault();
				event.stopPropagation();
				handleTouchMoveZoom(event);
				break;
			default:
		}
	}
	function onTouchEnd(event) {
		if (scope.enabled === false) return;
		scope.active = false;
	}
	scope.domElement.addEventListener('mousedown', onMouseDown, false);
	scope.domElement.addEventListener('wheel', onMouseWheel, false);
	scope.domElement.addEventListener('touchstart', onTouchStart, false);
	scope.domElement.addEventListener('touchend', onTouchEnd, false);
	scope.domElement.addEventListener('touchmove', onTouchMove, false);
};
ZoomControl.prototype = Object.create(THREE$1.EventDispatcher.prototype);
ZoomControl.prototype.constructor = ZoomControl;
ZoomControl.prototype.enable = function () {
	this.enabled = true;
};
ZoomControl.prototype.disable = function () {
	this.enabled = false;
};

var Controls = function () {
	function Controls(camera, renderer) {
		classCallCheck(this, Controls);
		var cameraControl = new CameraControl(camera, renderer);
		cameraControl.startCallback = function () {
			var angles = {};
			angles.elevation = ssettings.get('view', 'elevation');
			angles.rotation = ssettings.get('view', 'rotation');
			return angles;
		};
		cameraControl.changeCallback = function (elevation, rotation) {
			if (elevation > 89) {
				elevation = 89;
			} else if (elevation < -89) {
				elevation = -89;
			} else {
				elevation = Math.round(elevation * 10) / 10;
			}
			rotation = Math.round(rotation * 10) / 10;
			if (rotation > 180) {
				rotation -= 360;
			} else if (rotation < -180) {
				rotation += 360;
			}
			ssettings.set('view', 'elevation', elevation);
			ssettings.set('view', 'rotation', rotation);
		};
		var zoomControl = new ZoomControl(renderer.domElement);
		zoomControl.zoomCallback = function (scale) {
			var zoom = scale * ssettings.get('view', 'zoom');
			zoom = Math.max(Math.min(zoom, 50), 0.5);
			ssettings.set('view', 'zoom', zoom);
		};
		this._cameraControl = cameraControl;
		this._zoomControl = zoomControl;
	}
	createClass(Controls, [{
		key: 'enable',
		value: function enable() {
			this._cameraControl.enable();
			this._zoomControl.enable();
		}
	}, {
		key: 'disable',
		value: function disable() {
			this._cameraControl.disable();
			this._zoomControl.disable();
		}
	}]);
	return Controls;
}();

var xaxis = Utils.xaxis;
exports.disablePPointerEvents = false;
var disableMouseEvents = false;
var settingsElem = null;
var pos = new THREE$1.Vector3();
function isInElem(elem, pageX, pageY) {
	if (!elem) return false;
	var domRect = elem.getBoundingClientRect();
	return domRect.x <= pageX && pageX <= domRect.x + domRect.width && domRect.y <= pageY && pageY <= domRect.y + domRect.height;
}
exports.controls = null;
var refreshObj = {};
function init(window, isMobile, isApple) {
	SettingsControl.initValues(window, isMobile);
	var raycaster = new THREE$1.Raycaster();
	var mouse = new THREE$1.Vector2();
	var scene = new THREE$1.Scene();
	scene.background = new THREE$1.Color(0x000000);
	var fov = isMobile ? 45 : 60;
	var viewer$$1 = Viewer.createViewer(fov, window.innerWidth / window.innerHeight, 0.00001, 1.3 * distance);
	var renderer = new THREE$1.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
	renderer.setClearColor(new THREE$1.Color(0x000000, 1.0), 0);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.physicallyCorrectLights = true;
	var group = new THREE$1.Group();
	group.name = 'group';
	scene.add(group);
	var solarSystem = new THREE$1.Group();
	solarSystem.name = 'solarSystem';
	group.add(solarSystem);
	var pointLight = new THREE$1.PointLight(0xffffff, ssettings.get('planets', 'sunbrightness'), distance - unit, 2);
	scene.add(pointLight);
	solarSystem.rotateOnAxis(xaxis, Utils.radians(j2000obliquity));
	LabeledStar.initStars(group);
	DecoratedPlanet.init(solarSystem);
	ShadowStar.init(viewer$$1.camera);
	var unixtime = time.getTime();
	addPlanets(unixtime);
	var bands = new Bands(group, isMobile);
	bands.setVisible(ssettings.get('view', 'lines'));
	viewer$$1.setHomePlanet(ssettings.get('location', 'planet'));
	bands.setPlanet(viewer$$1.homePlanet);
	viewer$$1.setLatLong(ssettings.get('location', 'latitude'), ssettings.get('location', 'longitude'));
	viewer$$1.rotateDegrees(ssettings.get('view', 'elevation'), ssettings.get('view', 'rotation'));
	viewer$$1.setZoom(ssettings.get('view', 'zoom'));
	viewer$$1.updateProjectionMatrix();
	exports.controls = new Controls(viewer$$1.camera, renderer);
	var webglDiv = document.getElementById('WebGL-output');
	webglDiv.style.width = '100%';
	webglDiv.style.height = '100%';
	webglDiv.appendChild(renderer.domElement);
	var labelManager = LabelManager.createLabelManager(viewer$$1.camera, renderer);
	labelManager.addConstellationLabels();
	if (isMobile) labelManager.nextDisplayMode();
	refresh();
	var options1 = { passive: false };
	if (!disableMouseEvents) {
		document.addEventListener('mousedown', onDocumentMouseDown, options1);
		document.addEventListener('mousemove', onDocumentMouseMove, options1);
		document.addEventListener('mouseout', onDocumentMouseOut, options1);
		document.addEventListener('click', onDocumentMouseUp, options1);
	} else {
		document.addEventListener('click', function (ev) {
			if (!exports.disablePPointerEvents) {
				ev.stopPropagation();
				ev.preventDefault();
			}
		}, options1);
	}
	document.addEventListener('touchstart', onDocumentTouchStart, options1);
	document.addEventListener('touchmove', onDocumentTouchMove, options1);
	document.addEventListener('touchend', onDocumentTouchEnd, options1);
	window.addEventListener('resize', onWindowResize);
	var refreshTurnedOn = true;
	refreshSeries();
	function addPlanets(unixtime) {
		refreshPlanets(unixtime);
	}
	function refreshPlanets(unixtime) {
		unixtime = unixtime || time.getTime();
		DecoratedPlanet.updatePlanetPositionsAndRotations(unixtime);
		getPositionInSolarSystem(viewer$$1.camera, pos);
		SettingsControl.setPlanetLocations(unixtime, pos, viewer$$1.homePlanet);
	}
	function redraw() {
		LabeledStar.updateStars(group);
		labelManager.updateDisplay();
		var unixtime = time.getTime();
		redrawPlanets(unixtime);
		viewer$$1.setCameraPosition();
	}
	function getPositionInSolarSystem(obj) {
		var local = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new THREE$1.Vector3();
		obj.parent.updateMatrixWorld();
		obj.getWorldPosition(local);
		solarSystem.updateMatrixWorld();
		solarSystem.worldToLocal(local);
		return local;
	}
	function render() {
		renderer.render(scene, viewer$$1.camera);
	}
	function refresh(starLabels, planetLabels) {
		if (!(isMobile && exports.disablePPointerEvents)) {
			var timeNow = time.getTime();
			refreshPlanets(timeNow);
			if (starLabels) LabeledStar.updateStars(group);
			labelManager.updateDisplay(starLabels, planetLabels);
			render();
		}
	}
	refreshObj.refresh = refresh;
	function refreshSeries() {
		if (document.hidden) {
			refreshTurnedOn = false;
		}
		if (refreshTurnedOn) {
			var timeNow = time.getTime();
			ssettings.set('time', 'timeset', timeNow);
			setTimeout(refreshSeries, 5000 / viewer$$1.getZoom());
		}
	}
	document.addEventListener('visibilitychange', function ()         {
		if (!document.hidden && !refreshTurnedOn) {
			refreshTurnedOn = true;
			refreshSeries();
		} else if (document.hidden) {
			refreshTurnedOn = false;
		}
	}, false);
	loadFont();
	function loadFont() {
		var loader = new THREE$1.FontLoader();
		loader.load('js/three.js/fonts/helvetiker_regular.typeface.json', function (font) {
			if (font) {
				redraw();
				viewer$$1.displayDirectionText(font);
				render();
			}
		});
	}
	function onWindowResize() {
		viewer$$1.onWindowResize();
		renderer.setSize(window.innerWidth, window.innerHeight);
		render();
	}
	var downX = 0;
	var downY = 0;
	function onDocumentMouseDown(event) {
		if (exports.disablePPointerEvents || event.button !== 0) return;
		if (event.button == 0 && event.buttons == 1) {
			downX = event.clientX;
			downY = event.clientY;
		}
	}
	function onDocumentTouchStart(event) {
		if (exports.disablePPointerEvents) return;
		event.preventDefault();
		var touches = event.changedTouches || event.touches;
		switch (touches.length) {
			case 1:
				if (isInElem(settingsElem, touches[0].pageX, touches[0].pageY)) return;
				downX = touches[0].pageX;
				downY = touches[0].pageY;
				break;
			default:
				break;
		}
	}
	function onDocumentMouseMove(event) {
		if (exports.disablePPointerEvents || event.buttons !== 0) return;
		var rect = renderer.domElement.getBoundingClientRect();
		mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(mouse, viewer$$1.camera);
		var msg = document.getElementById('msg');
		if (msg === null) return;
		msg.innerHTML = '';
		var displayed = {};
		var intersections = raycaster.intersectObjects(planetMeshes);
		var unixtime = time.getTime();
		if (intersections.length > 0) {
			getPositionInSolarSystem(viewer$$1.camera, pos);
		}
		for (var idx = 0; idx < intersections.length; idx++) {
			if (!displayed[intersections[idx]]) {
				var planet = intersections[idx].object.planet;
				var text = planet.getDataString(unixtime, pos);
				if (msg.innerHTML != '') {
					msg.innerHTML += '<br>';
				}
				msg.innerHTML += text;
				displayed[intersections[idx]] = true;
			}
		}
		intersections = raycaster.intersectObjects(group.children);
		for (var idx = 0; idx < intersections.length; idx++) {
			if (!displayed[intersections[idx]] && intersections[idx].object.star) {
				if (msg.innerHTML != '') {
					msg.innerHTML += '<br>';
				}
				msg.innerHTML += intersections[idx].object.star.getDataString();
				displayed[intersections[idx]] = true;
			}
		}
		if (msg.innerHTML != '') {
			var msgWidth = msg.offsetWidth + 4;
			var msgHeight = msg.offsetHeight + 4;
			if (window.innerWidth - (event.clientX + 0) < msgWidth) {
				msg.style.left = window.innerWidth - msgWidth + 'px';
			} else {
				msg.style.left = event.clientX + 8 + 'px';
			}
			if (event.clientY < msgHeight + 16) {
				msg.style.top = event.clientY + 16 + 'px';
			} else {
				msg.style.top = event.clientY - 16 - msgHeight + 'px';
			}
			msg.style.opacity = 0.8;
			msg.style.display = '';
		} else {
			msg.style.display = 'none';
		}
	}
	function onDocumentMouseOut() {
		var msg = document.getElementById('msg');
		if (msg === null) return;
		msg.style.display = 'none';
	}
	function onDocumentMouseUp(event) {
		if (exports.disablePPointerEvents || event.button !== 0) return;
		mouseUp(event, event.clientX, event.clientY);
	}
	function onDocumentTouchMove(ev) {
		if (exports.disablePPointerEvents) return;
		var touches = ev.changedTouches || ev.touches;
		if (touches.length === 1 && isInElem(settingsElem, touches[0].pageX, touches[0].pageY)) {
			return;
		}
	}
	function onDocumentTouchEnd(event) {
		if (exports.disablePPointerEvents) return;
		var touches = event.changedTouches || event.touches;
		switch (touches.length) {
			case 1:
				if (isInElem(settingsElem, touches[0].pageX, touches[0].pageY)) return;
				mouseUp(event, touches[0].pageX, touches[0].pageY);
				break;
			default:
				break;
		}
	}
	function mouseUp(event, posX, posY) {
		var dist = Math.sqrt((downX - posX) * (downX - posX) + (downY - posY) * (downY - posY));
		if (dist < 5) {
			labelManager.nextDisplayMode();
			refresh();
		} else {
			refresh();
		}
	}
	initContextMenu(function () {
		exports.controls.disable();
		exports.disablePPointerEvents = true;
	}, function () {
		exports.controls.enable();
		exports.disablePPointerEvents = false;
	});
	ssettings.addListener('location', 'planet', function () {
		viewer$$1.setHomePlanet(ssettings.get('location', 'planet'));
		bands.setPlanet(viewer$$1.homePlanet);
		refresh();
	});
	ssettings.addListener('location', 'latitude', function (e) {
		viewer$$1.setLatLong(e, ssettings.get('location', 'longitude'));
		viewer$$1.updateProjectionMatrix();
		refresh();
	});
	ssettings.addListener('location', 'longitude', function (e) {
		viewer$$1.setLatLong(ssettings.get('location', 'latitude'), e);
		viewer$$1.updateProjectionMatrix();
		refresh();
	});
	ssettings.addListener('location', 'altitude', function (val) {
		SettingsControl.setNumber('location', 'altitude', val);
		viewer$$1.setAltitude(val);
		viewer$$1.updateProjectionMatrix();
		refresh();
	});
	ssettings.addListener('location', 'restore', function ()        {
		viewer$$1.setCameraPosition();
		viewer$$1.updateProjectionMatrix();
		refresh();
	});
	ssettings.addListener('view', 'elevation', function (elev) {
		SettingsControl.setNumber('view', 'elevation', elev);
		viewer$$1.rotateDegrees(elev, ssettings.get('view', 'rotation'));
		refresh();
	});
	ssettings.addListener('view', 'rotation', function (rot) {
		SettingsControl.setNumber('view', 'rotation', rot);
		viewer$$1.rotateDegrees(ssettings.get('view', 'elevation'), rot);
		refresh();
	});
	ssettings.addListener('view', 'zoom', function (val) {
		SettingsControl.setNumber('view', 'zoom', val);
		viewer$$1.setZoom(val);
		viewer$$1.updateProjectionMatrix();
		bands.setZoom(val);
		refresh(true, true);
	});
	ssettings.addListener('view', 'lines', function (val) {
		SettingsControl.setBoolean('view', 'lines', val);
		bands.setVisible(val);
		render();
	});
	ssettings.addListener('view', 'restore', function () {
		viewer$$1.rotateDegrees(ssettings.get('view', 'elevation'), ssettings.get('view', 'rotation'));
		bands.setVisible(ssettings.get('view', 'lines'));
		viewer$$1.setZoom(ssettings.get('view', 'zoom'));
		viewer$$1.updateProjectionMatrix();
		refresh(true, true);
	});
	function redrawStars() {
		refresh(true);
	}
	ssettings.addListener('view', 'zoom', redrawStars);
	ssettings.addListener('stars', 'starradius', redrawStars);
	ssettings.addListener('stars', 'starbrightness', redrawStars);
	ssettings.addListener('stars', 'colorlevel', redrawStars);
	ssettings.addListener('stars', 'restore', redrawStars);
	function redrawPlanets() {
		DecoratedPlanet.updatePlanetRadii();
		refreshPlanets(false, true);
		render();
	}
	function updatePlanetColor() {
		DecoratedPlanet.updatePlanetColors();
		refreshPlanets();
		render();
	}
	ssettings.addListener('planets', 'planetmag', redrawPlanets);
	ssettings.addListener('planets', 'planetcolor', updatePlanetColor);
	ssettings.addListener('planets', 'sunmoonmag', redrawPlanets);
	ssettings.addListener('planets', 'sunbrightness', function (val) {
		pointLight.intensity = val;
		refresh(false, true);
	});
	ssettings.addListener('planets', 'restore', redrawPlanets);
	function timeUpdate() {
		SettingsControl.setTimeValues();refresh(false, true);
	}
	ssettings.addListener('time', 'realtime', timeUpdate);
	ssettings.addListener('time', 'rate', timeUpdate);
	ssettings.addListener('time', 'timeset', timeUpdate);
	ssettings.addListener('time', 'restore', timeUpdate);
}
if (!Detector.webgl) {
	var warning = Detector.getWebGLErrorMessage();
	document.getElementById('WebGL-output').appendChild(warning);
}

exports.init = init;
exports.ssettings = ssettings;
exports.SettingsControl = SettingsControl;
exports.refreshObj = refreshObj;
exports.disableMouseEvents = disableMouseEvents;
exports.setTrueNorth = setTrueNorth;
exports.setDirectionFromCompass = setDirectionFromCompass;
exports.setNoDOC = setNoDOC;
exports.absoluteOrientationHandler = absoluteOrientationHandler;
exports.deviceOrientationHandler = deviceOrientationHandler;
exports.dismissContextMenu = dismissContextMenu;

Object.defineProperty(exports, '__esModule', { value: true });

})));
