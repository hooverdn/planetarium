The Dogulean Planetarium
========================

### A Sky Map and Planetarium Based on three.js ###

The Dogulean Planetarium is a combination starmap and planetarium
presented via a 3-D model with three.js.

A deployed version of the planetarium can be found on
<a href="https://www.doguleez.com/3d/planetarium/index.html" target="_blank">
doguleez.com</a>.

The planetarium will behave a bit differently on a desktop or on a
mobile device.

On a mobile device, we assume that you will mainly want to go outside,
point your device in the general direction of something actually in
the sky, and see on your screen what it is.

On a desktop, you will probably be just exploring around rather than
looking at someing in the sky.  In particular, you will probably not
want to navigate by pointing your computer at things.  But you will
have a mouse or a touchpad and that will make it much easier for you
to interact with the controls on the context menu.  You will able to:

*  Take in the view from other planets.
*  Change your position on your planet.
*  Soar above your planet and look down at it.
*  Adjust the brightness and color intensity of stars.
*  Adjust the size of planets or of the Sun and Moon.
*  Travel in time or speed time up.
*  Point at a celestial object to get detailed information about it.

Reasonably current Chrome, Opera, Safari, and Edge are good browsers to use.
That is, not Firefox or IE.


### Building the Planetarium ###

First, install `node.js`, if necessary.  Then:

    $ git clone --recursive <planetarium url>
    $ cd planetarium
    $ npm install

Now do one of the following:

    $ npm run main

This concatenates the source javascript files with rollup.  Or:

    $ npm run watch

This does the same, then keeps running and processes any new changes.  Or:

	$ npm run build-uglify

This concatenates and compresses the source files.

Each of these commands puts its output in `js/planetarium.min.js`.
The `build-uglify` script also copies the concatenated,
uncompressed code to `js/planetarium.umd.js`.


### Serving the Planetarium ###

From the project root directory or from a directory
containing it, you can serve the planetarium though your favorite HTTP
server.  You will need to use an HTTP server rather than simply
reading `heliocentric.html` or `heliocentric-mobile.html` from file,
because browsers do not permit some WebGL operations for a page read
from file.

I use `http-server`, which you can install using `npm`.

    $ npm install http-server
    $ http-server -c-1 --cors

The "`-c-1`" is to prevent browser caching (because you are doing
development and always want the browser to use your latest code) and
the "`--cors`" is to tell the browser that it is ok to look up the
compass correction at your present position&mdash;the planetarium
needs that on a mobile device with a compass.

Now you should be able to access the planetarium at

    http://localhost:8080/index.html

This page gives instructions on how to use the planetarium, either
desktop version or mobile, whichever type of device you are using.

### Credits ###

With great thanks I wish to acknowledge the following sources.

Most star data comes from the 2017 US Naval Observatory
<a href="http://asa.usno.navy.mil/SecH/BrightStars.html" target="_blank">Table of Bright Stars</a>.

For planets other than the Sun (which is at the origin) and Moon,
positions are computed from their Keplerian elements as given in
<a href="https://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf" target="_blank">
Keplerian Elements for Approximate Positions of the Major Planets</a>
by E. M. Standish.  The methods we use to compute
positions are considerably simplified from those in that paper because
WebGL does much of the work for us.

I have borrowed Javascript code to compute the position of the Moon do this from
Martin V&eacute;zina's <a href="https://github.com/mgvez/planet-positions" target="_blank">Planet
Positions</a> project, which was itself translated from Matlab
code by David Eagle, based in turn on programs in *Lunar Tables
and Programs From 4000 B.C. TO A.D. 8000* by Michelle
Chapront-Touz&eacute; and Jean Chapront.

Data on radii, oblateness, and rotation rates of planets are taken
from <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank">NASA
planetary fact sheets</a>.

Planet textures come from various sources.
- Mercury, Mars, Jupiter, Saturn and its rings, Uranus and its
  rings, and Neptune from
  <a href="http://planetpixelemporium.com" target="_blank">JHT's Planetary Pixel Emporium</a>.
- The Moon image we are using doesn't seem to be online
  anymore, so I am not sure where it came from. 
- For Earth I have used the familiar
  <a href="https://visibleearth.nasa.gov/view.php?id=57735" target="_blank">Blue Marble</a> image from
  <a href="https://visibleearth.nasa.gov" target="_blank">NASA Visible Earth</a>.


I have used the <a href="http://www.numericjs.com" target="_blank"><code>numeric.js</code></a> javascript library to determine star
and planet label positions.

I am using Sindre Sorhus'd <a href="https://sindresorhus.com/screenfull.js" target="_blank">screenfull.js</a> to go fullscreen on Android devices.
