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

( function( $, mw ) {
	"use strict";

	$( document ).ready( function() {
		var $ulsTrigger = $( '.uls-trigger' ),
			previousLang = $.cookie( 'uls-previous-language' ),
			currentLang = mw.config.get( 'wgUserLanguage' );

		/**
		 * Change the language of wiki using setlang URL parameter
		 * @param {String} language
		 */
		function changeLanguage( language ) {
			$.cookie( 'uls-previous-language', currentLang );
			var uri = new mw.Uri( window.location.href );
			uri.extend( {
				setlang: language
			} );
			window.location.href = uri.toString();
		}

		function displaySettings() {
			var $displaySettingsTitle = $( '<div>' )
					.addClass( 'settings-title' )
					.text( 'Display settings' ),
				$displaySettingsText = $( '<span>' )
					.addClass( 'settings-text' )
					.text( 'Set language for menus and fonts.' ),
				$displaySettings = $( '<div>' )
					.addClass( 'display-settings-block' )
					.prop( 'id', 'display-settings-block' )
					.append( $displaySettingsTitle )
					.append( $displaySettingsText );
			return $displaySettings;
		}

		// Extend the render api of ULS to add display and input settings.
		$.fn.uls.Constructor.prototype = $.extend( {}, $.fn.uls.Constructor.prototype, {
			render: function() {
				var $displaySettings = displaySettings();
				var that = this;
				this.$menu.find( "div#settings-block" ).append( $displaySettings );
				$displaySettings.languagesettings();
				$displaySettings.on( 'click', function() {
					that.hide();
				} );
			}
		} );

		$ulsTrigger.uls( {
			onSelect: function( language ) {
				changeLanguage( language );
			},
			languages: mw.config.get( 'wgULSLanguages' ),
			searchAPI: mw.util.wikiScript( 'api' ) + "?action=languagesearch"
		} );

		if ( !previousLang || previousLang === currentLang ) {
			// Do not show tooltip.
			return true;
		}

		var tipsyTimer;
		// Current language is the cookie value for 'uls-previous-language'
		$.cookie( 'uls-previous-language', currentLang );
		// Attach a tipsy tooltip to the trigger
		$ulsTrigger.tipsy( {
			gravity: 'n',
			delayOut: 3000,
			html: true,
			fade: true,
			trigger: 'manual',
			title: function() {
				var prevLangName = $.uls.data.autonym( previousLang ),
					linkClass = 'uls-lang-link',
					title = "Language changed from <a href='#' lang = '" +
						previousLang + "' class = '" + linkClass + "' >" +
						prevLangName + "</a>";
				return title;
			}
		} );
		// Show the tipsy tooltip on page load.
		$ulsTrigger.tipsy( 'show' );
		tipsyTimer = setTimeout( function() {
				$ulsTrigger.tipsy('hide');
			},
			// The timeout after page reloading is longer,
			// to give the user a better chance to see it.
			6000
		);
		$( '.tipsy' ).live( 'mouseout', function( e ) {
			tipsyTimer = setTimeout( function() {
				$ulsTrigger.tipsy('hide');
				},
				3000 // hide the link in 3 seconds
			);
		} );
		// if the mouse is over the tooltip, do not hide
		$( '.tipsy' ).live( 'mouseover', function( e ) {
			clearTimeout( tipsyTimer );
		} );
		// manually show the tooltip
		$ulsTrigger.bind( 'mouseover', function( e ) {
			$( this ).tipsy( 'show' );
		} );
		// hide the tooltip when clicked on uls trigger
		$ulsTrigger.bind( 'click', function( e ) {
			$( this ).tipsy( 'hide' );
		} );
		// Event handler for links in the tooltip
		$( 'a.uls-lang-link' ).live( 'click', function() {
			changeLanguage( $(this).attr( 'lang' ) );
		} );
	} );
} )( jQuery, mediaWiki );
