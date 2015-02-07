/**
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
	 * @param {Array} originalArray
	 * @return de-duplicated array
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
			this.interlanguageList = this.getInterlanguageList();
			this.listSize = this.getListSize();

			if ( this.listSize <= this.options.max ) {
				// Not enough languages to compact the list
				return;
			}

			// If the interlanguage list is of moderate size, the compact size is 7.
			this.compactSize = ( this.listSize <= 12 ) ? 7 : this.options.max;
			this.hideOriginal();
			this.compactList = this.getCompactList();
			this.render();
			this.listen();
		},

		/**
		 * Render the compacted interlanguage list and triggers
		 */
		render: function () {
			var language;

			for ( language in this.compactList ) {
				this.showLanguage( language );
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
				interlanguageListLeft,
				interlanguageListWidth,
				ulsLanguageList = {};

			languages = $.map( compactLinks.interlanguageList, function ( language, languageCode ) {
				ulsLanguageList[ languageCode ] = language.autonym;

				return languageCode;
			} );

			// Calculate the left and width values
			interlanguageListLeft = compactLinks.$interlanguageList.offset().left;
			interlanguageListWidth = compactLinks.$interlanguageList.width();
			// Attach ULS to the trigger
			compactLinks.$trigger.uls( {
				onReady: function () {
					this.$menu.addClass( 'interlanguage-uls-menu' );
				},
				/**
				 * Language selection handler
				 * @param {string} language language code
				 */
				onSelect: function ( language ) {
					var previousLanguages = mw.uls.getPreviousLanguages();

					previousLanguages.push( language );
					previousLanguages = unique( previousLanguages );
					mw.uls.setPreviousLanguages( previousLanguages );
					window.location.href = compactLinks.interlanguageList[ language ].href;
				},
				onVisible: function () {
					// Calculate the positioning of the panel
					// according to the position of the trigger icon
					if ( dir === 'rtl' ) {
						this.left = interlanguageListLeft - this.$menu.width();
					} else {
						this.left = interlanguageListLeft + interlanguageListWidth;
					}
					this.$menu.css( 'left', this.left );
				},
				languageDecorator: function ( $languageLink, language ) {
					// set href according to language
					$languageLink.prop( 'href', compactLinks.interlanguageList[ language ].href );
				},
				// Use compact version of ULS
				compact: true,
				// Top position of the language selector. Top it 250px above to take care of
				// caret pointing the trigger. See .interlanguage-uls-menu:after style definition
				top: compactLinks.$trigger.offset().top - compactLinks.$trigger.height() / 2 - 250,
				// List of languages to be shown
				languages: ulsLanguageList,
				// Show common languages
				quickList: compactLinks.filterByCommonLanguages( languages )
			} );
		},

		/**
		 * Get the compacted interlanguage list as associative array
		 * @return {Object}
		 */
		getCompactList: function () {
			var language, languages, compactLanguages, index,
				compactedList = {};

			languages = $.map( this.interlanguageList, function ( element, index ) {
				return index;
			} );

			compactLanguages = this.compact( languages );

			for ( index = 0; index < compactLanguages.length; index++ ) {
				language = compactLanguages[ index ];
				compactedList[ language ] = this.interlanguageList[ language ];
			}

			return compactedList;
		},

		/**
		 * Compact a given array of languages
		 * @param {Array} languages
		 * @return {Array} compacted array
		 */
		compact: function ( languages ) {
			var compactLanguages = [];

			// Add user-defined assistant languages on wikis with Translate extension.
			compactLanguages = compactLanguages.concat( this.filterByAssistantLanguages() );

			// Add previously selected languages.
			// Previous languages are always the better suggestion
			// because the user has explicitly chosen them.
			compactLanguages = compactLanguages.concat( this.filterByPreviousLanguages() );

			// Add all common languages to the beginning of array.
			// These are the most probable languages predicted by ULS.
			compactLanguages = compactLanguages.concat( this.filterByCommonLanguages( languages ) );

			// Finally add the whole languages array too.
			// We will remove duplicates and cut down to required size.
			compactLanguages = compactLanguages.concat( languages );

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
		 * @return {Object} List of existing language codes and their hrefs
		 */
		getInterlanguageList: function getInterlanguageList() {
			var interlanguageList = {};

			this.$interlanguageList.find( 'li.interlanguage-link > a' ).each( function () {
				var $this = $( this );

				interlanguageList[ $this.attr( 'lang' ) ] = {
					href: $this.attr( 'href' ),
					autonym: $this.text()
				};
			} );

			return interlanguageList;
		},

		/**
		 * Get the size of the interlanguage list
		 */
		getListSize: function () {
			return $.map( this.interlanguageList, function ( item, index ) {
				return index;
			} ).length;
		},

		/**
		 * Hide the original interlanguage list
		 */
		hideOriginal: function () {
			this.$interlanguageList.find( '.interlanguage-link' ).hide();
		},

		/**
		 * Add the trigger at the bottom of the language list
		 */
		addTrigger: function () {
			var $trigger;

			$trigger = $( '<button>' )
				.addClass( 'mw-interlanguage-selector mw-ui-button active' )
				.html( $.i18n(
					'ext-uls-compact-link-count',
					mw.language.convertNumber( this.listSize - this.compactSize )
				) );

			this.$interlanguageList.append( $trigger );
			this.$trigger = $trigger;
		},

		/**
		 * Show a language from the interlanguage list
		 * @param {string} language
		 */
		showLanguage: function ( language ) {
			this.$interlanguageList.find( '.interwiki-' + language ).show();
		}
	};

	/**
	 * CompactInterlanguageList Plugin
	 * @param {Object} [option]
	 */
	$.fn.compactInterlanguageList = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'compactinterlanguagelist' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'compactinterlanguagelist', ( data = new CompactInterlanguageList( this, options ) ) );
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
		max: 9 // Compact the list to this size
	};

	$( document ).ready( function () {
		$( '#p-lang ul' ).compactInterlanguageList();
	} );
}( jQuery, mediaWiki ) );
