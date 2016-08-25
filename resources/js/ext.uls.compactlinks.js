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

	var DEFAULT_LIST_SIZE = 9;

	/**
	 * Concatenate two arrays, remove duplicates
	 *
	 * @param {Array} a First array
	 * @param {Array} b Second array
	 * @return {Array} Resulting array
	 */
	function concatWithoutDuplicates( a, b ) {
		return a.concat( b.filter( function ( item ) {
			return a.indexOf( item ) < 0;
		} ) );
	}

	/**
	 * Normalize a language code for ULS usage.
	 *
	 * MediaWiki language codes (especially on WMF sites) are inconsistent
	 * with ULS codes. We need to use ULS codes to access the proper data.
	 *
	 * @param {string} code
	 * @return {string} Normalized language code
	 */
	function convertMediaWikiLanguageCodeToULS( code ) {
		code = code.toLowerCase();
		return $.uls.data.isRedirect( code ) || code;
	}

	/**
	 * @class
	 */
	function CompactInterlanguageList( interlanguageList, options ) {
		this.$interlanguageList = $( interlanguageList );
		this.options = options || {};
		this.interlanguageList = {};
		this.compactList = {};
		this.commonInterlanguageList = null;
		this.$trigger = null;
		this.compactSize = 0;
		this.listSize = 0;
	}

	/**
	 * Initialize the plugin
	 */
	CompactInterlanguageList.prototype.init = function () {
		var self = this,
			max = this.options.max || DEFAULT_LIST_SIZE;

		this.interlanguageList = this.getInterlanguageList();
		this.listSize = Object.keys( this.interlanguageList ).length;

		if ( this.listSize <= max ) {
			// Not enough languages to compact the list
			return;
		}

		// If we're only a bit beyond max, limit to 7 instead of 9.
		// FIXME: This assumes the max is 9.
		self.compactSize = ( self.listSize <= 12 ) ? 7 : max;
		self.compactList = self.getCompactList();
		self.hideOriginal();
		self.render();
		self.listen();
	};

	/**
	 * Render the compacted interlanguage list and triggers
	 */
	CompactInterlanguageList.prototype.render = function () {
		var language;

		for ( language in this.compactList ) {
			this.compactList[ language ].element.parentNode.style.display = '';
		}

		this.addTrigger();
	};

	/**
	 * Attaches the actual selector to the trigger.
	 *
	 * @param {jQuery} $trigger Element to use as trigger.
	 */
	CompactInterlanguageList.prototype.createSelector = function ( $trigger ) {
		var languages,
			self = this,
			dir = $( 'html' ).prop( 'dir' ),
			ulsLanguageList = {};

		languages = $.map( this.interlanguageList, function ( language, languageCode ) {
			ulsLanguageList[ languageCode ] = language.autonym;

			return languageCode;
		} );

		// Attach ULS to the trigger
		$trigger.uls( {
			onReady: function () {
				this.$menu.addClass( 'interlanguage-uls-menu' );
			},
			/**
			 * Language selection handler
			 *
			 * @param {string} language language code
			 */
			onSelect: function ( language ) {
				self.$trigger.removeClass( 'selector-open' );
				mw.uls.addPreviousLanguage( language );
				location.href = self.interlanguageList[ language ].href;
			},
			onVisible: function () {
				var offset, height, width, triangleWidth;
				// The panel is positioned carefully so that our pointy triangle,
				// which is implemented as a square box rotated 45 degrees with
				// rotation origin in the middle. See the corresponding style file.

				// These are for the trigger
				offset = $trigger.offset();
				width = $trigger.outerWidth();
				height = $trigger.outerHeight();

				// Triangle width is: Math.sqrt( 2 * Math.pow( 16, 2 ) ) / 2 =~ 11.3;
				// Box width = 16 + 1 for border.
				// The resulting value is rounded up 14 to have a small space between.
				triangleWidth = 14;

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
				$trigger.addClass( 'selector-open' );
			},
			languageDecorator: function ( $languageLink, language ) {
				var data = self.interlanguageList[ language ];
				// set href and text exactly same as what was in
				// interlanguage link. The ULS autonym might be different in some
				// cases like sr. In ULS it is "српски", while in interlanguage links
				// it is "српски / srpski"
				$languageLink
					.prop( 'href', data.href )
					.text( data.autonym );

				// This code is to support badges used in Wikimedia
				$languageLink.parent().addClass( data.element.parentNode.className );
			},
			onCancel: function () {
				$trigger.removeClass( 'selector-open' );
			},
			languages: ulsLanguageList,
			// Show common languages
			quickList: self.getCommonLanguages( languages )
		} );
	};

	/**
	 * Bind to event handlers and listen for events
	 */
	CompactInterlanguageList.prototype.listen = function () {
		var self = this;

		this.$trigger.one( 'click', function () {
			// Load the ULS now.
			mw.loader.using( 'ext.uls.mediawiki' ).done( function () {
				self.createSelector( self.$trigger );
				self.$trigger.click();
			} );
		} );
	};

	/**
	 * Get the compacted interlanguage list as associative array
	 *
	 * @return {Object}
	 */
	CompactInterlanguageList.prototype.getCompactList = function () {
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
	};

	/**
	 * Get compacting strategies.
	 * The items will be executed in the given order till the required
	 * compact size is achieved. Each item should be an array and should
	 * take the whole language list as argument.
	 *
	 * @return {Function[]} Array of comacting functions
	 */
	CompactInterlanguageList.prototype.getCompactStrategies = function () {
		return [
			// Add user-defined assistant languages on wikis with Translate extension.
			filterByAssistantLanguages,
			// Add previously selected languages.
			// Previous languages are always the better suggestion
			// because the user has explicitly chosen them.
			filterByPreviousLanguages,
			// Site specific highlights, mostly used on Wikimedia sites
			filterBySitePicks,
			// Add all common languages to the beginning of array.
			// These are the most probable languages predicted by ULS.
			this.getCommonLanguages,
			// Add languages that are present in the article content.
			this.filterByLangsInText,
			// Add languages in which there are featured articles.
			this.filterByBadges,
			// Some global fallbacks to avoid showing languages in the beginning of the alphabet
			getExtraCommonLanguages,
			// Finally add the whole languages array too.
			// We will remove duplicates and cut down to required size.
			this.finalFallback
		];
	};

	/**
	 * Compact a given array of languages
	 *
	 * @param {Array} languages
	 * @return {Array} Compacted array
	 */
	CompactInterlanguageList.prototype.compact = function ( languages ) {
		var i, strategies,
			compactLanguages = [];

		strategies = this.getCompactStrategies();
		for ( i = 0; i < strategies.length; i++ ) {
			compactLanguages = concatWithoutDuplicates(
				compactLanguages, strategies[ i ].call( this, languages )
			);
			if ( compactLanguages.length >= this.compactSize ) {
				// We have more than enough items. Stop here.
				compactLanguages = compactLanguages.slice( 0, this.compactSize );
				break;
			}
		}

		return compactLanguages;
	};

	/**
	 * Filter the language list by previous languages.
	 * Not all previous languages will be present in interlanguage links,
	 * so we are filtering them.
	 *
	 * @return {Array} List of language codes supported by the article
	 */
	function filterByPreviousLanguages( languages ) {
		var previousLanguages = mw.uls.getPreviousLanguages();

		return $.grep( previousLanguages, function ( language ) {
			return $.inArray( language, languages ) >= 0;
		} );
	}

	/**
	 * Filter the language list by site picks.
	 *
	 * @return {Array} List of language codes supported by the article
	 */
	function filterBySitePicks( languages ) {
		var picks = mw.config.get( 'wgULSCompactLinksPrepend' ) || [];

		return $.grep( picks, function ( language ) {
			return $.inArray( language, languages ) >= 0;
		} );
	}

	/**
	 * Filter the language list by common languages.
	 * Common languages are the most probable languages predicted by ULS.
	 *
	 * @return {Array} List of language codes supported by the article
	 */
	function filterByCommonLanguages( languages ) {
		var commonLanguages = mw.uls.getFrequentLanguageList();

		return $.grep( commonLanguages, function ( language ) {
			return $.inArray( language, languages ) >= 0;
		} );
	}

	/**
	 * Filter the language list by globally common languages, i.e.
	 * this list is not user specific.
	 *
	 * @return {Array} List of language codes supported by the article
	 */
	function getExtraCommonLanguages( languages ) {
		var commonLanguages = [ 'zh', 'en', 'hi', 'ur', 'es', 'ar', 'ru', 'id', 'ms', 'pt',
				'fr', 'de', 'bn', 'ja', 'pnb', 'pa', 'jv', 'te', 'ta', 'ko', 'mr', 'tr', 'vi',
				'it', 'fa', 'sv', 'nl', 'pl' ];

		return $.grep( commonLanguages, function ( language ) {
			return $.inArray( language, languages ) >= 0;
		} );
	}

	/**
	 * Filter the language list by Translate's assistant languages.
	 * Where available, they're languages deemed useful by the user.
	 *
	 * @return {Array} List of those language codes which are supported by article
	 */
	function filterByAssistantLanguages( languages ) {
		var assistantLanguages = mw.user.options.get( 'translate-editlangs' );

		if ( assistantLanguages && assistantLanguages !== 'default' ) {
			return $.grep( assistantLanguages.split( /,\s*/ ), function ( language ) {
				return $.inArray( language, languages ) >= 0;
			} );
		}

		return [];
	}

	/**
	 * Filter the language list by languages that appear in
	 * the page's text. This is done by looking for HTML elements with
	 * a "lang" attribute—they are likely to appear in a foreign name,
	 * for example.
	 *
	 * The reader doesn't necessarily know this language, but it
	 * appears relevant to the page.
	 *
	 * @return {Array} List of language codes supported by the article
	 */
	CompactInterlanguageList.prototype.filterByLangsInText = function ( languages ) {
		var languagesInText = [];

		$( '#mw-content-text [lang]' ).each( function ( i, el ) {
			var lang = convertMediaWikiLanguageCodeToULS( $( el ).attr( 'lang' ) );
			if ( $.inArray( lang, languagesInText ) === -1 && $.inArray( lang, languages ) >= 0 ) {
				languagesInText.push( lang );
			}
		} );

		return languagesInText;
	};

	/**
	 * Filter the language list by languages the page in which
	 * has any kind of a badge, such as "featured article".
	 * The "badge-*" classes are added by Wikibase.
	 *
	 * The reader doesn't necessarily know this language, but it
	 * appears relevant to the page.
	 *
	 * @return {Array} List of language codes in which there are articles with badges
	 */
	CompactInterlanguageList.prototype.filterByBadges = function () {
		return $( '#p-lang' ).find( '[class*="badge"]' ).map( function ( i, el ) {
			return convertMediaWikiLanguageCodeToULS( $( el ).find( 'a' ).attr( 'lang' ) );
		} ).toArray();
	};

	/**
	 * Find out the existing languages supported
	 * by the article and fetch their href.
	 *
	 * @return {Object} List of existing language codes and their hrefs
	 */
	CompactInterlanguageList.prototype.getInterlanguageList = function () {
		var interlanguageList = {};

		this.$interlanguageList.find( 'li.interlanguage-link > a' ).each( function () {
			var langCode = convertMediaWikiLanguageCodeToULS( this.getAttribute( 'lang' ) );

			interlanguageList[ langCode ] = {
				href: this.getAttribute( 'href' ),
				autonym: $( this ).text(),
				element: this
			};
		} );

		return interlanguageList;
	};

	/**
	 * Get common languages - the most probable languages predicted by ULS.
	 *
	 * @param {Array} languages Array of all languages.
	 */
	CompactInterlanguageList.prototype.getCommonLanguages = function ( languages ) {
		if ( this.commonInterlanguageList === null ) {
			this.commonInterlanguageList = filterByCommonLanguages( languages );
		}

		return this.commonInterlanguageList;
	};

	CompactInterlanguageList.prototype.finalFallback = function ( languages ) {
		return languages;
	};

	/**
	 * Hide the original interlanguage list
	 */
	CompactInterlanguageList.prototype.hideOriginal = function () {
		this.$interlanguageList.find( '.interlanguage-link' ).css( 'display', 'none' );
	};

	/**
	 * Add the trigger at the bottom of the language list
	 */
	CompactInterlanguageList.prototype.addTrigger = function () {
		var $trigger;

		$trigger = $( '<button>' )
			.addClass( 'mw-interlanguage-selector mw-ui-button' )
			.prop( 'title', mw.msg( 'ext-uls-compact-link-info' ) )
			.text( mw.msg(
				'ext-uls-compact-link-count',
				mw.language.convertNumber( this.listSize - this.compactSize )
			) );

		this.$interlanguageList.append( $trigger );
		this.$trigger = $trigger;
	};

	function createCompactList() {
		var compactList = new CompactInterlanguageList( $( '#p-lang ul' ), {
			// Compact the list to this size
			max: 9
		} );
		compactList.init();

	}

	// Early execute of createCompactList
	if ( document.readyState === 'interactive' ) {
		createCompactList();
	} else {
		$( document ).ready( createCompactList );
	}

}( jQuery, mediaWiki ) );
