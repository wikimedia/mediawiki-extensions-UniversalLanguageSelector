( function( mw, $ ) {
	"use strict";

	mw.uls.setGeo = function ( data ) {
		window.GEO = data;
	};

	var settings = {
		cache: true,
		dataType: "jsonp",
		jsonpCallback: "mw.uls.setGeo"
	};
	$.ajax( mw.config.get( 'wgULSGeoService' ), settings );

}( mediaWiki, jQuery ) );
