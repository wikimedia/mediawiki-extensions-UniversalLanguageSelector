/**
 * ULS-based display settings panel
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

( function( $ ) {
	"use strict";
	var template = '<div><h3>Display Settings</h3></div>'
			+ '<div><h4>Select Language</h4></div>'
			+ '<div class="row">'
			+ '<button class="two columns toggle button down">English</button>'
			+ '<button class="two columns offset-by-one toggle button">Deutsch</button>'
			+ '<button class="two columns offset-by-one toggle button">עברית</button>'
			+ '<button id="uls-more-languages" class="two columns offset-by-one toggle button"">...</button>'
			+ '</div>'
			+ '<div class="row"><h4>Font Settings</h4></div>'
			+ '<div  class="row">'
			+ '<label class="checkbox"><input type="checkbox" checked id="webfonts-enable-checkbox" />'
			+ '<strong>Download fonts automatically when needed</strong> '
			+ 'Web fonts will be downloaded when text in special scripts is displayed. '
			+ '<a href="#">More Information</a>'
			+ '</span></label>'
			+ '</div>'
			+ '<div class="row"><h5>Select your preferred fonts to use</h5></div>'
			+ '<div class="row">'
			+ '<div class="six columns">Fonts for English</div>'
			+ '<select class="three columns end uls-font-select"></select></div>'
			+ '</div>'
			+ '<div class="row"></div>'
			+ '<div class="row language-settings-buttons">'
			+ '<button class="three columns offset-by-three blue button">Cancel</button>'
			+ '<button  class="four columns offset-by-one active blue button">Apply changes</button>'
			+ '</div>'; // FIXME too much hardcoding.

	var displaySettings = {
		name: "Display",
		description: "Set the fonts for languages",

		render: function() {
			return template;
		},

		listen: function() {
			var $webfonts = $( 'body' ).data( 'webfonts' );
			var fonts = $webfonts.list( 'en' ); // FIXME
			var $fontSelector = $( 'select.uls-font-select' );
			$.each( fonts, function( key, font ) {
				$fontSelector.append( $( "<option></option>" )
					.attr( "value", font ).text( font ) );
			} );
			$( "button.toggle.button" ).click( function() {
				$( "button.toggle.button" ).removeClass( "down" );
				$( this ).addClass( "down" );
			} );
			// $( '#uls-more-languages' ).uls({
			// });
		}
	};

	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		display: displaySettings
	} );
} ) ( jQuery );
