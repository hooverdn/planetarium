// Based on
//  https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

var initContextMenu = function( onActivate, onDeactivate) {
    "use strict";

    //
    // Helper Functions
    //

    function clickInsideElement( e, className ) {
        var el = e.srcElement || e.target;

        if (!!el && el.classList) {
            if ( el.classList.contains(className) ) {
                return el;
            } else {
                while ( el = el.parentNode ) {
                    if ( !!el && el.classList && el.classList.contains(className) ) {
                        return el;
                    }
                }
            }
        }

        return false;
    }

    function getPosition(e) {
        var posx = 0;
        var posy = 0;
        
        if (!e) var e = window.event;
        
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
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

    function positionMenu(clickCoords, menu) {

        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        // we should look at screen size among other things to decide how to do the menu

        if ( isMobile && isApple ) {

            menu.style.left = '0px';
            menu.style.top = '0px';

        } else {
            
            if ( (windowWidth - clickCoordsX) < menuWidth ) {
                menu.style.left = windowWidth - menuWidth + 'px';
            } else {
                menu.style.left = (clickCoordsX - 15) + 'px';
            }
            if ( (windowHeight - clickCoordsY) < menuHeight ) {
                menu.style.top = windowHeight - menuHeight + 'px';
            } else {
                menu.style.top = (clickCoordsY - 15) + 'px';
            }
        }

    }

    
    //
    // Core Functions
    //

    var contextMenuClassName = "context-menu";
    var contextMenuItemClassName = "context-menu__item";
    var contextMenuLinkClassName = "context-menu__link";
    
    var taskItemClassName = 'task';
    var taskItemInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    //var menuItems = menu.querySelectorAll(".context-menu_item");
    var menuState = 0;
    var menuWidth;
    var menuHeight;
    var menuPosition;
    var menuPositionX;
    var menuPositionY;

    var windowWidth;
    var windowHeight;
    var menu = document.querySelector('#controls');
    
    
    function init() {
        //contextListener();
        //clickListener();
        //keyupListener();
        
        var acc = document.getElementsByClassName("accordion");
        var i;

        for (i = 0; i < acc.length; i++) {
            acc[ i ].addEventListener( click, function( event ) {

                event.stopPropagation();
                event.preventDefault();

                /* Toggle between adding and removing the "active" class,
                   to highlight the button that controls the panel */
                this.classList.toggle("active");

                /* Toggle between hiding and showing the active panel */
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            }, { passive: false } );
        }
    }

    var listener = function (e) {

        if (e ) e.preventDefault();

        listener2( getPosition( e ) );

    }

    var listener2 = function ( clickCoords ) {

        positionMenu(clickCoords, menu);
        if (menu.style.display === "block") {

            menu.style.display = "none";
            menu.removeEventListener( 'mouseenter', onActivate, { passive: false } );
		    menu.removeEventListener( 'mouseleave', onDeactivate, { passive: false } );
            onDeactivate();

        } else {

            menu.addEventListener( 'mouseenter', onActivate, { passive: false } );
		    menu.addEventListener( 'mouseleave', onDeactivate, { passive: false } );
            menu.style.display = "block";

        }
    }

    // function contextListener() {

    //     document.addEventListener( "contextmenu", listener, true);

    // }
    
    function toggleMenuOff() {

        var menu = document.querySelector('#controls');
        menu.style.display = "none";
        menu.removeEventListener( 'mouseenter', onActivate, { passive: false } );
		menu.removeEventListener( 'mouseleave', onDeactivate, { passive: false } );
        onDeactivate();
        //console.log( 'toggleMenuOff' );

    }

    function isMobileApple() {

        var userAgent = navigator.userAgent;

        return userAgent.indexOf( 'Mac OS X' ) >= 0 &&
            userAgent.indexOf( 'Mobile' ) >= 0;


    }
    
    // function clickListener() {
    //     document.addEventListener(
    //         isMobileApple() ? 'touchstart' : 'click',
    //         function (e) {

    //             var touches = e.changedTouches || e.touches;

    //             if ( touches && touches.length !== 1 ) return;

    //             var clickeElIsLink = clickInsideElement( e, 'controls' );

    //             // if ( !clickeElIsLink && menuOn() ) {
    //             //     toggleMenuOff();
    //             //     e.preventDefault();
    //             //     e.stopPropagation();               
    //             // }
    //         }, true );
    // }

    // function keyupListener() {
    //     window.onkeyup = function (e) {
    //         if ( e.keyCode === 27 ) {
    //             toggleMenuOff();
    //         }
    //     };
    // }

    function menuItemListener( link ) {
        toggleMenuOff();
    }

    function menuOn() {

        return disablePPointerEvents;

    }
    
    init();

    return {
        menuOn: menuOn,
        menuOff: toggleMenuOff,
        listener: listener2,
    };
};

var contextMenu;

function dismissContextMenu() {

    contextMenu.menuOff();

};
