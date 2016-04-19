/*!
 * Compact the interlanguage links in the sidebar
 *
 * Copyright (C) 2012-2014 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland, Niharika Kohli
 * and other contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU GPL-2.0+
 * @licence MIT License
 */

( function ( $, mw ) {
	'use strict';

	/**
	 * For the given array, remove duplicates
	 *
	 * @param {Array} originalArray
	 * @return {Array} de-duplicated array
	 */
	function unique( originalArray ) {
		var uniqueArray = [];

		$.each( originalArray, function ( i, v ) {
			if ( $.inArray( v, uniqueArray ) === -1 ) {
				uniqueArray.push( v );
			}
		} );

		return uniqueArray;
	}

	/**
	 * @class
	 */
	function CompactInterlanguageList( interlanguageList, options ) {
		this.$interlanguageList = $( interlanguageList );
		this.options = $.extend( {}, $.fn.compactInterlanguageList.defaults, options );
		this.interlanguageList = {};
		this.compactList = {};
		this.$trigger = null;
		this.compactSize = 0;
		this.listSize = 0;
		this.init();
	}

	CompactInterlanguageList.prototype = {
		/**
		 * Initialize the plugin
		 */
		init: function () {
			var max = this.options.max;
			this.interlanguageList = this.getInterlanguageList();
			this.listSize = this.getListSize();

			if ( this.listSize <= max ) {
				// Not enough languages to compact the list
				return;
			}

			// If we're only a bit beyond max, limit to 7 instead of 9.
			// FIXME: This assumes the max is 9.
			this.compactSize = ( this.listSize <= 12 ) ? 7 : max;
			this.compactList = this.getCompactList();
			this.hideOriginal();
			this.render();
			this.listen();
		},

		/**
		 * Render the compacted interlanguage list and triggers
		 */
		render: function () {
			var language;

			for ( language in this.compactList ) {
				this.compactList[ language ].element.parentNode.style.display = '';
			}

			this.addTrigger();
		},

		/**
		 * Bind to event handlers and listen for events
		 */
		listen: function () {
			var languages,
				compactLinks = this,
				dir = $( 'html' ).prop( 'dir' ),
				ulsLanguageList = {};

			languages = $.map( compactLinks.interlanguageList, function ( language, languageCode ) {
				ulsLanguageList[ languageCode ] = language.autonym;

				return languageCode;
			} );

			// Attach ULS to the trigger
			compactLinks.$trigger.uls( {
				onReady: function () {
					this.$menu.addClass( 'interlanguage-uls-menu' );
				},
				/**
				 * Language selection handler
				 *
				 * @param {string} language language code
				 */
				onSelect: function ( language ) {
					var previousLanguages = mw.uls.getPreviousLanguages();

					compactLinks.$trigger.removeClass( 'selector-open' );

					previousLanguages.push( language );
					previousLanguages = unique( previousLanguages );
					mw.uls.setPreviousLanguages( previousLanguages );
					location.href = compactLinks.interlanguageList[ language ].href;
				},
				onVisible: function () {
					var offset, height, width, triangleWidth;
					// The panel is positioned carefully so that our pointy triangle,
					// which is implemented as a square box rotated 45 degrees with
					// rotation origin in the middle. See the corresponding style file.

					// These are for the trigger
					offset = compactLinks.$trigger.offset();
					width = compactLinks.$trigger.outerWidth();
					height = compactLinks.$trigger.outerHeight();

					// Triangle width is: Math.sqrt( 2 * Math.pow( 25, 2 ) ) / 2 =~ 17.7;
					// Box width = 24 + 1 for border.
					// The resulting value is rounded up 20 to have a small space between.
					triangleWidth = 20;

					if ( dir === 'rtl' ) {
						this.left = offset.left - this.$menu.outerWidth() - triangleWidth;
					} else {
						this.left = offset.left + width + triangleWidth;
					}
					// Offset -250px from the middle of the trigger
					this.top = offset.top + ( height / 2 ) - 250;

					this.$menu.css( {
						left: this.left,
						top: this.top
					} );
					compactLinks.$trigger.addClass( 'selector-open' );
				},
				languageDecorator: function ( $languageLink, language ) {
					// set href and text exactly same as what was in
					// interlanguage link. The ULS autonym might be different in some
					// cases like sr. In ULS it is "српски", while in interlanguage links
					// it is "српски / srpski"
					$languageLink
						.prop( 'href', compactLinks.interlanguageList[ language ].href )
						.text( compactLinks.interlanguageList[ language ].autonym );
				},
				onCancel: function () {
					compactLinks.$trigger.removeClass( 'selector-open' );
				},
				// Use compact version of ULS
				compact: true,
				languages: ulsLanguageList,
				// Show common languages
				quickList: compactLinks.filterByCommonLanguages( languages )
			} );
		},

		/**
		 * Get the compacted interlanguage list as associative array
		 *
		 * @return {Object}
		 */
		getCompactList: function () {
			var language, languages, compactLanguages, i,
				compactedList = {};

			languages = $.map( this.interlanguageList, function ( item, languageCode ) {
				return languageCode;
			} );

			compactLanguages = this.compact( languages );

			for ( i = 0; i < compactLanguages.length; i++ ) {
				language = compactLanguages[ i ];
				compactedList[ language ] = this.interlanguageList[ language ];
			}

			return compactedList;
		},

		/**
		 * Compact a given array of languages
		 *
		 * @param {Array} languages
		 * @return {Array} Compacted array
		 */
		compact: function ( languages ) {
			var compactLanguages = [];

			compactLanguages = compactLanguages.concat(
				// Add user-defined assistant languages on wikis with Translate extension.
				this.filterByAssistantLanguages( languages ),

				// Add previously selected languages.
				// Previous languages are always the better suggestion
				// because the user has explicitly chosen them.
				this.filterByPreviousLanguages( languages ),

				// Add all common languages to the beginning of array.
				// These are the most probable languages predicted by ULS.
				this.filterByCommonLanguages( languages ),

				// Finally add the whole languages array too.
				// We will remove duplicates and cut down to required size.
				languages
			);
			// Remove duplicates
			compactLanguages = unique( compactLanguages );

			// Cut to compact size and sort
			compactLanguages = compactLanguages.slice( 0, this.compactSize ).sort();

			return compactLanguages;
		},

		/**
		 * Filter the language list by previous languages.
		 * Not all previous languages will be present in interlanguage links,
		 * so we are filtering them.
		 *
		 * @return {Array} List of language codes supported by the article
		 */
		filterByPreviousLanguages: function ( languages ) {
			var previousLanguages = mw.uls.getPreviousLanguages();

			return $.grep( previousLanguages, function ( language ) {
				return $.inArray( language, languages ) >= 0;
			} );
		},

		/**
		 * Filter the language list by common languages.
		 * Common languages are the most probable languages predicted by ULS.
		 *
		 * @return {Array} List of language codes supported by the article
		 */
		filterByCommonLanguages: function ( languages ) {
			var commonLanguages = mw.uls.getFrequentLanguageList();

			return $.grep( commonLanguages, function ( language ) {
				return $.inArray( language, languages ) >= 0;
			} );
		},

		/**
		 * Filter the language list by Translate's assistant languages.
		 * Where available, they're languages deemed useful by the user.
		 *
		 * @return {Array} List of those language codes which are supported by article
		 */
		filterByAssistantLanguages: function ( languages ) {
			var assistantLanguages = mw.user.options.get( 'translate-editlangs' );

			if ( assistantLanguages && assistantLanguages !== 'default' ) {
				return $.grep( assistantLanguages.split( /,\s*/ ), function ( language ) {
					return $.inArray( language, languages ) >= 0;
				} );
			}

			return [];
		},

		/**
		 * Find out the existing languages supported
		 * by the article and fetch their href.
		 *
		 * @return {Object} List of existing language codes and their hrefs
		 */
		getInterlanguageList: function () {
			var interlanguageList = {};

			this.$interlanguageList.find( 'li.interlanguage-link > a' ).each( function () {
				var langCode = this.getAttribute( 'lang' );

				// We keep interlanguageList with redirect resolved language codes as keys.
				langCode = $.uls.data.isRedirect( langCode ) || langCode;
				interlanguageList[ langCode ] = {
					href: this.getAttribute( 'href' ),
					autonym: $( this ).text(),
					element: this
				};
			} );

			return interlanguageList;
		},

		/**
		 * Get the size of the interlanguage list
		 */
		getListSize: function () {
			return $.map( this.interlanguageList, function ( item, languageCode ) {
				return languageCode;
			} ).length;
		},

		/**
		 * Hide the original interlanguage list
		 */
		hideOriginal: function () {
			this.$interlanguageList.find( '.interlanguage-link' ).css( 'display', 'none' );
		},

		/**
		 * Add the trigger at the bottom of the language list
		 */
		addTrigger: function () {
			var $trigger;

			$trigger = $( '<button>' )
				.addClass( 'mw-interlanguage-selector mw-ui-button' )
				.html( $.i18n(
					'ext-uls-compact-link-count',
					mw.language.convertNumber( this.listSize - this.compactSize )
				) );

			this.$interlanguageList.append( $trigger );
			this.$trigger = $trigger;
		}
	};

	/**
	 * CompactInterlanguageList Plugin
	 *
	 * @param {Object} [option]
	 */
	$.fn.compactInterlanguageList = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'compactinterlanguagelist' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				data = new CompactInterlanguageList( this, options );
				$this.data( 'compactinterlanguagelist', data );
			}

			if ( typeof option === 'string' ) {
				data[ option ]();
			}
		} );
	};

	/**
	 * Defaults
	 */
	$.fn.compactInterlanguageList.defaults = {
		// Compact the list to this size
		max: 9
	};

	$( document ).ready( function () {
		$( '#p-lang ul' ).compactInterlanguageList();
	} );
}( jQuery, mediaWiki ) );
