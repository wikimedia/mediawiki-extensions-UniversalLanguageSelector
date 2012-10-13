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
	"use strict";

	mw.uls = mw.uls || {};
	mw.uls.setGeo = function ( data ) {
		window.GEO = data;
	};

	mw.uls.getCountryCode = function () {
		return window.GEO.country || window.GEO.country_code;
	};

	var settings = {
		cache: true,
		dataType: "jsonp",
		jsonpCallback: "mw.uls.setGeo"
	};
	$.ajax( mw.config.get( 'wgULSGeoService' ), settings );

}( mediaWiki, jQuery ) );
