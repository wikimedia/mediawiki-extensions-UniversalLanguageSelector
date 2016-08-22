/*!
 * ULS GeoIP client
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

( function ( $, mw ) {
	'use strict';

	var geo,
		cacheAge = 60 * 60 * 8, // 8 hours
		service = mw.config.get( 'wgULSGeoService' );

	// This is not supposed to happen. For sanity prefer existing value.
	if ( window.Geo ) {
		return;
	}

	// Using cache for speed and to be nice for the service. Using cookies over
	// localstorage because cookies support automatic expiring and are supported
	// everywhere where as localstorage might not. This cookie is not currently
	// read server side.
	geo = mw.cookie.get( 'ULSGeo' );
	if ( geo ) {
		try {
			window.Geo = JSON.parse( geo );
			return;
		} catch ( e ) {}
	}

	$.getJSON( service ).done( function ( data ) {
		window.Geo = data;
		mw.cookie.set( 'ULSGeo', JSON.stringify( data ), cacheAge );
	} );
}( jQuery, mediaWiki ) );
