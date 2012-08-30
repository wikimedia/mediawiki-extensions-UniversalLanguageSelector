( function( mw, $ ) {
	"use strict";

	window.setGeo = function ( data ) {
		window.GEO = data;
	}
	var settings = {
		cache: true,
		dataType: "jsonp",
		jsonpCallback: "setGeo"
	};
	$.ajax( mw.config.get( 'wgULSGeoService' ), settings );

}( mediaWiki, jQuery ) );
