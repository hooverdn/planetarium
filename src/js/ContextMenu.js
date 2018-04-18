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

// Based on
//  https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

let contextMenu;

// we should look at screen size among other things to decide how to do the menu
// do we need an "Android" clause as heliocentric-mobile.html?
let isMobile = navigator.userAgent.indexOf( 'Mobile' ) >= 0;
let isApple = navigator.userAgent.indexOf( 'Mac OS X' ) >= 0;



let initContextMenu = function ( onActivate, onDeactivate ) {

	//
	// Helper Functions
	//

	// function clickInsideElement( e, className ) {

	// 	let el = e.srcElement || e.target;

	// 	if ( !! el && el.classList ) {

	// 		if ( el.classList.contains( className ) ) {

	// 			return el;

	// 		} else {

	// 			while ( el = el.parentNode ) {

	// 				if ( !! el && el.classList && el.classList.contains( className ) ) {

	// 					return el;

	// 				}

	// 			}

	// 		}

	// 	}

	// 	return false;

	// }

	function getPosition( e ) {

		let posx = 0;
		let posy = 0;

		if ( ! e ) e = window.event;

		if ( e.pageX || e.pageY ) {

			posx = e.pageX;
			posy = e.pageY;

		} else if ( e.clientX || e.clientY ) {

			posx = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;

		}

		return {
			x: posx,
			y: posy,
		};

	}

	function positionMenu( clickCoords, menu ) {

		clickCoordsX = clickCoords.x;
		clickCoordsY = clickCoords.y;

		menuWidth = menu.offsetWidth + 4;
		menuHeight = menu.offsetHeight + 4;

		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;

		if ( isMobile && isApple ) {

			menu.style.left = '0px';
			menu.style.top = '0px';

		} else {

			if ( ( windowWidth - clickCoordsX ) < menuWidth ) {

				menu.style.left = windowWidth - menuWidth + 'px';

			} else {

				menu.style.left = ( clickCoordsX - 15 ) + 'px';

			}
			if ( ( windowHeight - clickCoordsY ) < menuHeight ) {

				menu.style.top = windowHeight - menuHeight + 'px';

			} else {

				menu.style.top = ( clickCoordsY - 15 ) + 'px';

			}

		}

	}


	//
	// Core Functions
	//

	let clickCoordsX;
	let clickCoordsY;

	//let menuItems = menu.querySelectorAll(".context-menu_item");
	let menuWidth;
	let menuHeight;

	let windowWidth;
	let windowHeight;
	let menu = document.querySelector( '#controls' );


	function init() {

		if ( ! isMobile ) {

			contextListener();
			//clickListener();
			keyupListener();

		}
		let acc = document.getElementsByClassName( 'accordion' );
		let i;

		for ( i = 0; i < acc.length; i ++ ) {

			acc[ i ].addEventListener( 'click', function ( event ) {

				event.stopPropagation();
				event.preventDefault();

				/* Toggle between adding and removing the "active" class,
                   to highlight the button that controls the panel */
				this.classList.toggle( 'active' );

				/* Toggle between hiding and showing the active panel */
				let panel = this.nextElementSibling;
				if ( panel.style.display === 'block' ) {

					panel.style.display = 'none';

				} else {

					panel.style.display = 'block';

				}

			}, { passive: false } );

		}

	}

	let listener = function ( e ) {

		if ( e ) {

			e.stopPropagation();
			e.preventDefault();

		}
		listener2( getPosition( e ) );

	};

	let listener2 = function ( clickCoords ) {

		positionMenu( clickCoords, menu );
		if ( menu.style.display === 'block' ) {

			menu.style.display = 'none';
			menu.removeEventListener( 'mouseenter', onActivate, { passive: false } );
		    menu.removeEventListener( 'mouseleave', onDeactivate, { passive: false } );
			onDeactivate();

		} else {

			menu.addEventListener( 'mouseenter', onActivate, { passive: false } );
		    menu.addEventListener( 'mouseleave', onDeactivate, { passive: false } );
			menu.style.display = 'block';

		}

	};

	function contextListener() {

		document.addEventListener( 'contextmenu', listener, true );

	}

	function toggleMenuOff() {

		menu.style.display = 'none';
		menu.removeEventListener( 'mouseenter', onActivate, { passive: false } );
		menu.removeEventListener( 'mouseleave', onDeactivate, { passive: false } );
		onDeactivate();
		//console.log( 'toggleMenuOff' );

	}

	// function clickListener() {

	// 	document.addEventListener(

	// 		'click',
	// 		function ( e ) {

	// 			let touches = e.changedTouches || e.touches;

	// 			if ( touches && touches.length !== 1 ) return;

	// 			//let clickeElIsLink = clickInsideElement( e, 'controls' );

	// 			// if ( !clickeElIsLink && menuOn() ) {
	// 			//     toggleMenuOff();
	// 			//     e.preventDefault();
	// 			//     e.stopPropagation();
	// 			// }

	// 		}, true );

	// }

	function keyupListener() {

		window.onkeyup = function ( e ) {

			if ( e.keyCode === 27 ) {

				toggleMenuOff();

			}

		};

	}

	function menuOn() {

		return isMobile ? window.disablePPointerEvents : menu.style.display === 'block';

	}

	init();

	contextMenu = {
		menuOn: menuOn,
		menuOff: toggleMenuOff,
		listener: listener2,
	};

};


function dismissContextMenu() {

	contextMenu.menuOff();

}

export { contextMenu, initContextMenu, dismissContextMenu };
