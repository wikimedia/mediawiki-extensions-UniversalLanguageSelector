/**
 * ULS startup script.
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

( function ( $, mw, window, document, undefined ) {
	'use strict';

	// MediaWiki override for ULS defaults.
	$.fn.uls.defaults = $.extend( $.fn.uls.defaults, {
		languages: mw.config.get( 'wgULSLanguages' ),
		searchAPI: mw.util.wikiScript( 'api' ) + '?action=languagesearch'
	} );

	// No need of IME in language search bar of ULS
	$.fn.uls.Constructor.prototype.render = function () {
		this.$languageFilter.addClass( 'noime' );
	};

	var currentLang = mw.config.get( 'wgUserLanguage' );
	mw.uls = mw.uls || {};
	mw.uls.previousLanguagesCookie = 'uls-previous-languages';
	/**
	 * Change the language of wiki using setlang URL parameter
	 * @param {String} language
	 */
	mw.uls.changeLanguage = function ( language ) {
		var uri = new mw.Uri( window.location.href );
		uri.extend( {
			setlang: language
		} );
		window.location.href = uri.toString();
	};

	mw.uls.setPreviousLanguages = function ( previousLanguages ) {
		$.cookie( mw.uls.previousLanguagesCookie, $.toJSON( previousLanguages ) );
	};

	mw.uls.getPreviousLanguages = function () {
		var previousLanguages = $.cookie( mw.uls.previousLanguagesCookie );
		if ( !previousLanguages ) {
			return [];
		}
		// return last 5 language changes
		return $.parseJSON( previousLanguages ).slice( -5 );
	};

	mw.uls.getBrowserLanguage = function () {
		return ( window.navigator.language || window.navigator.userLanguage ).split( '-' )[0];
	};

	mw.uls.getAcceptLanguageList = function () {
		return mw.config.get( 'wgULSAcceptLanguageList' );
	};

	mw.uls.getFrequentLanguageList = function () {
		var countryCode,
			unique = [],
			list = [
				mw.config.get( 'wgUserLanguage' ),
				mw.config.get( 'wgContentLanguage' ),
				mw.uls.getBrowserLanguage()
			]
				.concat( mw.uls.getPreviousLanguages() )
				.concat( mw.uls.getAcceptLanguageList() );

		countryCode = mw.uls.getCountryCode();
		if ( countryCode ) {
			list = list.concat( $.uls.data.getLanguagesInTerritory( countryCode ) );
		}

		$.each( list, function ( i, v ) {
			if ( $.inArray( v, unique ) === -1 ) {
				unique.push( v );
			}
		} );

		// Filter out unknown and unsupported languages
		unique = $.grep( unique, function ( langCode ) {
			return $.fn.uls.defaults.languages[langCode];
		} );

		return unique;
	};

	/**
	 * i18n initialization
	 */
	function i18nInit () {
		var extensionPath, locales, i18n;

		extensionPath = mw.config.get( 'wgExtensionAssetsPath' )
			+ '/UniversalLanguageSelector/';

		locales = mw.config.get( 'wgULSi18nLocales' );
		i18n = $.i18n( {
			locale: currentLang,
			messageLocationResolver: function ( locale, messageKey ) {
				// Namespaces are not available in jquery.i18n yet. Developers prefix
				// the message key with a unique namespace like ext-uls-*

				if ( messageKey.indexOf( 'uls' ) === 0 ) {
					if ( $.inArray( locale, locales['uls'] ) >= 0 ) {
						return extensionPath + 'lib/jquery.uls/i18n/' + locale + '.json';
					}

					return false;
				}

				if ( messageKey.indexOf( 'ext-uls' ) === 0 ) {
					if ( $.inArray( locale, locales['ext-uls'] ) >= 0 ) {
						return extensionPath + 'i18n/' + locale + '.json';
					}

					return false;
				}
			}
		} );

	}

	$( document ).ready( function () {
		var $ulsTrigger, previousLanguages, previousLang;

		// JavaScript side i18n initialization
		i18nInit();

		$ulsTrigger = $( '.uls-trigger' );
		previousLanguages = mw.uls.getPreviousLanguages() || [];
		previousLang = previousLanguages.slice( -1 )[0];

		function displaySettings () {
			var $displaySettingsTitle, displaySettingsText, $displaySettings;

			displaySettingsText = $.i18n( 'ext-uls-display-settings-desc' );
			$displaySettingsTitle = $( '<div data-i18n="ext-uls-display-settings-title">' )
				.addClass( 'settings-title' )
				.attr( 'title', displaySettingsText );
			$displaySettings = $( '<div>' )
				.addClass( 'display-settings-block' )
				.prop( 'id', 'display-settings-block' )
				.append( $displaySettingsTitle );
			return $displaySettings;
		}

		function inputSettings () {
			var $inputSettingsTitle, inputSettingsText, $inputSettings;

			inputSettingsText = $.i18n( 'ext-uls-input-settings-desc' );
			$inputSettingsTitle = $( '<div data-i18n="ext-uls-input-settings-title">' )
				.addClass( 'settings-title' )
				.attr( 'title', inputSettingsText );
			$inputSettings = $( '<div>' )
				.addClass( 'input-settings-block' )
				.prop( 'id', 'input-settings-block' )
				.append( $inputSettingsTitle );
			return $inputSettings;
		}

		function addDisplaySettings ( uls ) {
			var $displaySettings, position;

			$displaySettings = displaySettings();
			uls.$menu.find( '#settings-block' ).append( $displaySettings );
			position = uls.position();

			$displaySettings.languagesettings( {
				defaultModule: 'display',
				onClose: function () {
					uls.show();
				},
				top: position.top,
				left: position.left
			} );

			$displaySettings.on( 'click', function () {
				uls.hide();
			} );
		}

		function addInputSettings ( uls ) {
			var $inputSettings, position;

			$inputSettings = inputSettings();
			uls.$menu.find( '#settings-block' ).append( $inputSettings );
			position = uls.position();

			$inputSettings.languagesettings( {
				defaultModule: 'input',
				onClose: function () {
					uls.show();
				},
				top: position.top,
				left: position.left
			} );

			$inputSettings.on( 'click', function () {
				uls.hide();
			} );
		}

		$ulsTrigger.uls( {
			onReady: function () {
				addDisplaySettings( this );
				addInputSettings( this );
			},
			onSelect: function ( language ) {
				mw.uls.changeLanguage( language );
			},
			languages: mw.config.get( 'wgULSLanguages' ),
			searchAPI: mw.util.wikiScript( 'api' ) + '?action=languagesearch',
			quickList: function () {
				return mw.uls.getFrequentLanguageList();
			}
		} );

		if ( !previousLang ) {
			previousLanguages.push( currentLang );
			mw.uls.setPreviousLanguages( previousLanguages );
			// Do not show tooltip.
			return true;
		}

		if ( previousLang === currentLang ) {
			// Do not show tooltip.
			return true;
		}

		previousLanguages.push( currentLang );
		mw.uls.setPreviousLanguages( previousLanguages );

		// Attach a tipsy tooltip to the trigger
		$ulsTrigger.tipsy( {
			gravity: 'n',
			delayOut: 3000,
			html: true,
			fade: true,
			trigger: 'manual',
			title: function () {
				var link;

				link = $( '<a>' ).text( $.uls.data.getAutonym( previousLang ) )
					.attr( {
						href: '#',
						'class': 'uls-prevlang-link',
						lang: previousLang,
						dir: $.uls.data.getDir( previousLang )
					} );
				// Get the html of the link by wrapping it in div first
				link = $( '<div>' ).html( link ).html();
				return $.i18n( 'ext-uls-undo-language-tooltip-text', link );
			}
		} );

		function showTipsy( timeout ) {
			var tipsyTimer = 0;

			$ulsTrigger.tipsy( 'show' );
			// if the mouse is over the tooltip, do not hide
			$( '.tipsy' ).on( 'mouseover', function () {
				window.clearTimeout( tipsyTimer );
			} );
			$( '.tipsy' ).on( 'mouseout', function () {
				tipsyTimer = window.setTimeout( function () {
					hideTipsy();
				}, timeout );
			} );
			// Event handler for links in the tooltip
			$( 'a.uls-prevlang-link' ).on( 'click', function () {
				mw.uls.changeLanguage( $( this ).attr( 'lang' ) );
			} );
			tipsyTimer = window.setTimeout( function () {
				hideTipsy();
			}, timeout );
		}

		function hideTipsy() {
			$ulsTrigger.tipsy( 'hide' );
		}

		// Show the tipsy tooltip on page load.
		showTipsy( 6000 );

		// manually show the tooltip
		$ulsTrigger.on( 'mouseover', function () {
			showTipsy( 3000 );
		} );
		// hide the tooltip when clicked on uls trigger
		$ulsTrigger.on( 'click', function () {
			hideTipsy();
		} );
	} );
}( jQuery, mediaWiki, window, document ) );
