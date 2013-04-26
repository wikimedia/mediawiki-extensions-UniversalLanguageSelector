/**
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

( function ( mw, $ ) {
	'use strict';

	mw.uls = mw.uls || {};
	mw.uls.setGeo = function ( data ) {
		window.Geo = data;
	};

	var currentProto, httpOnly, settings,
		service = mw.config.get( 'wgULSGeoService' );

	// Call the service only if defined, and if the current
	// protocol is https, only if the service is not configured
	// with http:// as the protocol
	if ( service ) {
		httpOnly = service.substring( 0, 7 ) === 'http://';
		currentProto = document.location.protocol;
		if ( !httpOnly || currentProto === 'http:' ) {
			settings = {
				cache: true,
				dataType: 'jsonp',
				jsonpCallback: 'mw.uls.setGeo'
			};

			$.ajax( service, settings );
		}
	}

}( mediaWiki, jQuery ) );
