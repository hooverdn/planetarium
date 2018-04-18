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

function deepCopy( obj ) {

	return JSON.parse( JSON.stringify( obj ) );

}


class SSettings {

	constructor( defaults, source ) {

		this.source = source;
		var settingsJSON = source ? localStorage.getItem( source ) : null;
		this.settings = ( settingsJSON && JSON.parse( settingsJSON ) ) || {};

		if ( defaults ) {

			this.defaults = deepCopy( defaults );
			SSettings.reconcile( this.settings, this.defaults );
			localStorage.setItem( source, JSON.stringify( this.settings ) );

		}
		this.listeners = {};

	}

	/**
	 *  When the structure of settings changes &ndash; sections are
	 *  added or removed or values within a section are changed
	 *  &ndash; this will be reflected in changes to the default.
	 *  Method <code>reconcile</code> removes from
	 *  <code>settings</code> any settings or values that do not occur
	 *  in the defaults because they are obsolete.  Any sections or
	 *  values that occur in <code>defaults</code> but not in
	 *  <code>settings</code> are new and will be deep-copied into
	 *  <code>settings</code>.
	 *
	 *  <p>TO DO: Add a name mapping so that if there is just a name
	 *  change, no data in <code>settings</code> will be discarded.
	 */
	static reconcile( settings, defaults ) {

		var section;
		for ( section in settings ) {

			if ( settings.hasOwnProperty( section ) ) {

				if ( ! defaults.hasOwnProperty( section ) ) {

					// obsolete section
					delete settings[ section ];

				} else {

					var settingsSection = settings[ section ];
					var defaultsSection = defaults[ section ];

					if ( typeof settingsSection === 'object' &&
						 typeof defaultsSection === 'object' ) {

						// Reconcile common sections.
						this.reconcile( settingsSection, defaultsSection );

					} else if ( typeof settingsSection !== typeof defaultsSection ) {

						// type has changed - settings section must be obsolete
						settings[ section ] = deepCopy( defaultsSection );

					}

				}

			}

		}

		// 3. Any default that is not in the settings is new -- add it.
		for ( section in defaults ) {

			if ( ! settings.hasOwnProperty( section ) && defaults.hasOwnProperty( section ) ) {

				settings[ section ] = deepCopy( defaults[ section ] );

			}

		}

	}

	/**
	 *  Add change listener for a section/item.  Does not remove duplicates!
	 */
	addListener( section, item, listener ) {

		if ( ! this.listeners[ section ] ) {

			this.listeners[ section ] = {};

		}

		if ( ! this.listeners[ section ][ item ] ) {

			this.listeners[ section ][ item ] = [ listener ];

		} else {

			this.listeners[ section ][ item ].push( listener );

		}

	}

	/**
	 *  Remove change listener for section/item.
	 */
	//SSettings.prototype.removeListener( section, item, listener ) {
	//}

	fireListeners( section, item, val ) {

		if ( ! this.listeners[ section ] ) {

			return;

		}
		var listeners = this.listeners[ section ][ item ];
		if ( listeners ) {

			for ( var idx = 0; idx < listeners.length; idx ++ ) {

				listeners[ idx ]( val );

			}

		}

	}

	get( section, item, defaultVal ) {

		var sec = this.settings[ section ];
		return sec ? sec[ item ] : defaultVal;

	}

	set( section, item, value ) {

		if ( ! this.settings[ section ] || this.settings[ section ][ item ] !== value ) {

			if ( ! this.settings[ section ] ) {

				this.settings[ section ] = {};

			}
			this.settings[ section ][ item ] = value;

			if ( this.source ) {

				localStorage.setItem( this.source, JSON.stringify( this.settings ) );

			}

			this.fireListeners( section, item, value );

		}

	}

	restoreDefaults( section ) {

		if ( section ) {

			if ( this.defaults.hasOwnProperty( section ) ) {

				this.settings[ section ] = deepCopy( this.defaults[ section ] );
				localStorage.setItem( this.source, JSON.stringify( this.settings ) );
				this.fireListeners( section, 'restore' );

			}

		} else {

			this.settings = deepCopy( this.defaults );
			localStorage.setItem( this.source, JSON.stringify( this.settings ) );

		}

	}

}

var defaultSettings = {
	location: {
		planet: 'earth',
		latitude: 500,
		longitude: 500,
		altitude: 1,
	},
	view: {
		elevation: 25,
		rotation: 0,
		zoom: 1,
		lines: true,
	},
	planets: {
		planetmag: 40,
		planetcolor: 'natural',
		sunmoonmag: 5,
		sunbrightness: 1.2,
	},
	stars: {
		starradius: 1,
		starbrightness: 20,
		colorlevel: 5,
	},
	time: {
		realtime: true,
		rate: 1,
		timeset: 0,
		stopped: false,
	},
	compass: {
		correction: 500,
	},
};

const ssettings = new SSettings( defaultSettings, 'settings' );

export { SSettings, ssettings, defaultSettings };
