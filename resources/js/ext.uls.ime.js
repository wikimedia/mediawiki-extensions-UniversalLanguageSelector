/**
 * ULS-Webfonts integration
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
( function ( $, mw, document, undefined ) {
	'use strict';

	var mwImeRulesPath, inputSelector, inputPreferences;

	mwImeRulesPath = mw.config.get( 'wgExtensionAssetsPath' )
		+ '/UniversalLanguageSelector/lib/jquery.ime/';
	inputSelector = 'input:not([type]), input[type=text], input[type=search], textarea';

	inputPreferences = mw.uls.preferences();

	function getLanguagesWithIME () {
		var language,
			availableLanguages = {};

		for ( language in $.ime.languages ) {
			availableLanguages[language] = mw.config.get( 'wgULSLanguages' )[language];
		}

		return availableLanguages;
	}

	function getIMELanguageList () {
		var unique = [],
			imeLanguageList,
			previousIMELanguages;

		previousIMELanguages = $.ime.preferences.getPreviousLanguages() || [];
		imeLanguageList = previousIMELanguages.concat( mw.uls.getFrequentLanguageList() );

		$.each( imeLanguageList, function ( i, v ) {
			if ( $.inArray( v, unique ) === -1 ) {
				unique.push( v );
			}
		} );

		return unique.slice( 0, 6 );
	}

	$( document ).ready( function () {
		// MediaWiki specific overrides for jquery.webfonts
		$.extend( $.ime.defaults, {
			imePath: mwImeRulesPath
		} );

		$( 'body' ).on( 'focus', inputSelector, function () {
			var $input = $( this );

			$input.ime( {
				languages: getIMELanguageList(),
				languageSelector: function () {
					var $ulsTrigger;

					$ulsTrigger = $( '<a>' ).text( '...' );
					$ulsTrigger.uls( {
						onSelect: function ( language ) {
							$input.data( 'ime' ).setLanguage( language );
						},
						languages: getLanguagesWithIME(),
						top: $input.offset().top,
						left: $input.offset().left
					} );
					return $ulsTrigger;
				}
			} );
		} );

		$.extend( $.ime.preferences, {

			save: function ( callback ) {
				inputPreferences.set( 'ime', this.registry );
				inputPreferences.save( callback );
			},

			load: function () {
				this.registry = inputPreferences.get( 'ime' ) || this.registry;
			}
		} );

		 $.ime.preferences.load();
	} );


}( jQuery, mediaWiki, document ) );
