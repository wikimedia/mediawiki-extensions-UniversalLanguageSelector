/**
 * ULS Interface language selector
 *
 * Copyright (C) 2012-2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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

	$( document ).ready( function () {
		var $ulsTrigger, previousLanguages, previousLang,
			currentLang = mw.config.get( 'wgUserLanguage' );

		$ulsTrigger = $( '.uls-trigger' );
		previousLanguages = mw.uls.getPreviousLanguages() || [];
		previousLang = previousLanguages.slice( -1 )[0];

		function displaySettings() {
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

		function inputSettings() {
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

		function addDisplaySettings( uls ) {
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

		function addInputSettings( uls ) {
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
				if ( $.fn.languagesettings ) {
					addDisplaySettings( this );
					addInputSettings( this );
				}
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
			// show only if the ULS panel is not shown
			if ( !$ulsTrigger.data( 'uls' ).shown ) {
				showTipsy( 3000 );
			}
		} );

		// hide the tooltip when clicked on uls trigger
		$ulsTrigger.on( 'click', function () {
			hideTipsy();
		} );
	} );
}( jQuery, mediaWiki, window, document ) );
