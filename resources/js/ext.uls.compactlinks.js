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
 * @licence GNU GPL-2.0-or-later
 * @licence MIT License
 */

( function () {
	'use strict';

	var DEFAULT_LIST_SIZE = 9;

	/**
	 * @param {Array} target
	 * @param {Array} source
	 * @param {string|string[]|undefined} items Language code, or list of language codes
	 */
	function addMatchWithoutDuplicate( target, source, items ) {
		var i;
		if ( items === undefined ) {
			return;
		}
		items = !Array.isArray( items ) ? [ items ] : items;
		for ( i = 0; i < items.length; i++ ) {
			if (
				// Only add if unique and matches source
				target.indexOf( items[ i ] ) === -1 &&
				source.indexOf( items[ i ] ) !== -1
			) {
				target.push( items[ i ] );
			}
		}
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
	 * Get user-defined assistant languages on wikis with Translate extension.
	 *
	 * Where available, they're languages deemed useful by the user.
	 *
	 * @return {string[]|undefined} Language codes
	 */
	function getAssistantLanguages() {
		var assistantLanguages = mw.user.options.get( 'translate-editlangs' );
		if ( !assistantLanguages || assistantLanguages === 'default' ) {
			return;
		}

		return assistantLanguages.split( /,\s*/ );
	}

	/**
	 * Get previously selected languages.
	 *
	 * Previous languages are a good suggestion because the user has
	 * explicitly chosen them in the past.
	 *
	 * @return {string[]} Language codes
	 */
	function getPreviousLanguages() {
		return mw.uls.getPreviousLanguages();
	}

	/**
	 * Get languages from the Babel box on the user's user page.
	 *
	 * @return {string[]|undefined} Language codes
	 */
	function getBabelLanguages() {
		return mw.config.get( 'wgULSBabelLanguages' );
	}

	/**
	 * Get site-specific highlighted languags. Mostly used on Wikimedia sites.
	 *
	 * @return {string[]|undefined} Language codes
	 */
	function getSitePicks() {
		return mw.config.get( 'wgULSCompactLinksPrepend' );
	}

	/**
	 * Get probable languages predicted by ULS.
	 *
	 * @return {string[]} Language codes
	 */
	function getCommonLanguages() {
		return mw.uls.getFrequentLanguageList();
	}

	/**
	 * Get globally common languages.
	 *
	 * These are not user-specific. This helps to avoid biasing the compact list
	 * to language codes that sort to the beginning of the alphabet in the
	 * final stage.
	 *
	 * @return {string[]} Language codes
	 */
	function getExtraCommonLanguages() {
		return [
			'zh', 'en', 'hi', 'ur', 'es', 'ar', 'ru', 'id', 'ms', 'pt',
			'fr', 'de', 'bn', 'ja', 'pnb', 'pa', 'jv', 'te', 'ta', 'ko', 'mr', 'tr', 'vi',
			'it', 'fa', 'sv', 'nl', 'pl'
		];
	}

	/**
	 * The final strategy is the original interlanguage list.
	 *
	 * @param {string[]} languages Language codes
	 * @return {string[]} Language codes
	 */
	function getFinalFallback( languages ) {
		return languages;
	}

	/**
	 * @class
	 * @constructor
	 * @param {HTMLElement} listElement Interlanguage list element
	 * @param {Object} options
	 */
	function CompactInterlanguageList( listElement, options ) {
		this.listElement = listElement;
		this.options = options || {};

		/**
		 * @private
		 * @property {Object} interlanguageList
		 */
		this.interlanguageList = null;

		/**
		 * @private
		 * @property {Object} interlanguageList
		 */
		this.compactList = null;

		this.commonInterlanguageList = null;
		this.$trigger = null;
		this.compactSize = 0;
		this.listSize = 0;
	}

	/**
	 * Initialize the plugin
	 */
	CompactInterlanguageList.prototype.init = function () {
		var max = this.options.max || DEFAULT_LIST_SIZE;

		this.interlanguageList = this.getInterlanguageList();
		this.listSize = Object.keys( this.interlanguageList ).length;

		if ( this.listSize <= max ) {
			// Not enough languages to compact the list
			mw.hook( 'mw.uls.compactlinks.initialized' ).fire( false );
			return;
		}

		// If we're only a bit beyond max, limit to 7 instead of 9.
		// FIXME: This assumes the max is 9.
		this.compactSize = ( this.listSize <= 12 ) ? 7 : max;
		this.compactList = this.getCompactList();
		this.hideOriginal();
		this.render();
		this.listen();
	};

	/**
	 * Render the compacted interlanguage list and triggers
	 */
	CompactInterlanguageList.prototype.render = function () {
		var language;

		for ( language in this.compactList ) {
			this.compactList[ language ].parentNode.style.display = '';
		}

		this.addTrigger();

		mw.hook( 'mw.uls.compactlinks.initialized' ).fire( true );
	};

	/**
	 * Attaches the actual selector to the trigger.
	 *
	 * @param {jQuery} $trigger Element to use as trigger.
	 */
	CompactInterlanguageList.prototype.createSelector = function ( $trigger ) {
		var languageCode,
			languages = Object.keys( this.interlanguageList ),
			self = this,
			ulsLanguageList = {};

		for ( languageCode in this.interlanguageList ) {
			ulsLanguageList[ languageCode ] = this.interlanguageList[ languageCode ].textContent;
		}

		// Attach ULS to the trigger
		$trigger.uls( {
			onReady: function () {
				this.$menu.addClass( 'interlanguage-uls-menu' );
			},
			/**
			 * Language selection handler
			 *
			 * @param {string} language language code
			 * @param {Object} event jQuery event object
			 */
			onSelect: function ( language, event ) {
				self.$trigger.removeClass( 'selector-open' );
				mw.uls.addPreviousLanguage( language );

				// Switch the current tab to the new language,
				// unless it was Ctrl-click or Command-click
				if ( !event.metaKey && !event.shiftKey ) {
					location.href = self.interlanguageList[ language ].href;
				}
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

				// Triangle width is: who knows now, but this still looks fine.
				triangleWidth = 12;

				if ( offset.left > $( window ).width() / 2 ) {
					this.left = offset.left - this.$menu.outerWidth() - triangleWidth;
					this.$menu.removeClass( 'selector-left' ).addClass( 'selector-right' );
				} else {
					this.left = offset.left + width + triangleWidth;
					this.$menu.removeClass( 'selector-right' ).addClass( 'selector-left' );
				}
				// Offset from the middle of the trigger
				this.top = offset.top + ( height / 2 ) - 27;

				this.$menu.css( {
					left: this.left,
					top: this.top
				} );
				$trigger.addClass( 'selector-open' );
			},
			languageDecorator: function ( $languageLink, language ) {
				var element = self.interlanguageList[ language ];
				// Set href, text, and tooltip exactly same as what was in
				// interlanguage link. The ULS autonym might be different in some
				// cases like sr. In ULS it is "српски", while in interlanguage links
				// it is "српски / srpski"
				$languageLink
					.prop( {
						href: element.href,
						title: element.title
					} )
					.text( element.textContent );

				// This code is to support badges used in Wikimedia
				$languageLink.parent().addClass( element.parentNode.className );
			},
			onCancel: function () {
				$trigger.removeClass( 'selector-open' );
			},
			languages: ulsLanguageList,
			ulsPurpose: 'compact-language-links',
			// Show common languages
			quickList: self.getCommonLanguages( languages ),
			noResultsTemplate: function () {
				var $defaultTemplate = $.fn.lcd.defaults.noResultsTemplate.call( this );
				// Customize the message
				$defaultTemplate
					.find( '.uls-no-results-found-title' )
					.data( 'i18n', 'ext-uls-compact-no-results' );
				return $defaultTemplate;
			}
		} );
	};

	/**
	 * Bind to event handlers and listen for events
	 */
	CompactInterlanguageList.prototype.listen = function () {
		var self = this;

		this.$trigger.one( 'click', function () {
			// Load the ULS now.
			mw.loader.using( 'ext.uls.mediawiki' ).then( function () {
				self.createSelector( self.$trigger );
				self.$trigger.trigger( 'click' );
			} );
		} );
	};

	/**
	 * Get the compacted interlanguage list as associative array
	 *
	 * @return {Object}
	 */
	CompactInterlanguageList.prototype.getCompactList = function () {
		var language, languages, compactLanguages, i, compactedList;

		compactedList = {};
		languages = Object.keys( this.interlanguageList );
		compactLanguages = this.compact( languages );

		for ( i = 0; i < compactLanguages.length; i++ ) {
			language = compactLanguages[ i ];
			compactedList[ language ] = this.interlanguageList[ language ];
		}

		return compactedList;
	};

	/**
	 * Get compacting strategies.
	 *
	 * The items will be executed in the given order till the required
	 * compact size is achieved. Each strategy is given two arrays: `candidates`
	 * and `languages`. The candidates array is a list the callback should add to.
	 * The languages list contains language codes actually available for the current
	 * page, the callback may use this to optimise their search for candidates,
	 * although compact() will filter out irrelevant candidates so strategies should
	 * only use this if it helps narrow their search for candidates, avoid needless
	 * filtering that compact() will do already.
	 *
	 * @return {Function[]} Array of compacting functions
	 */
	CompactInterlanguageList.prototype.getCompactStrategies = function () {
		return [
			getAssistantLanguages,
			getPreviousLanguages,
			getBabelLanguages,
			getSitePicks,
			getCommonLanguages,
			this.getLangsInText,
			this.getLangsWithBadges,
			getExtraCommonLanguages,
			getFinalFallback
		];
	};

	/**
	 * Compact a given array of languages
	 *
	 * @param {Array} languages
	 * @return {Array} Compacted array
	 */
	CompactInterlanguageList.prototype.compact = function ( languages ) {
		var i, strategies, found,
			compactLanguages = [];

		strategies = this.getCompactStrategies();
		for ( i = 0; i < strategies.length; i++ ) {
			found = strategies[ i ]( languages );
			// Add language codes from 'found' that are also in 'languages'
			// to 'compactLanguages' (if not already in there).
			addMatchWithoutDuplicate( compactLanguages, languages, found );
			if ( compactLanguages.length >= this.compactSize ) {
				// We have more than enough items. Stop here.
				compactLanguages = compactLanguages.slice( 0, this.compactSize );
				break;
			}
		}

		return compactLanguages;
	};

	/**
	 * Get language codes that are used in the page's text content.
	 *
	 * This is done by looking for HTML elements with a "lang" attribute—they
	 * are likely to appear in a foreign name, for example.
	 *
	 * The reader doesn't necessarily know this language, but it
	 * appears relevant to the page.
	 *
	 * @return {string[]} Language codes
	 */
	CompactInterlanguageList.prototype.getLangsInText = function () {
		var languagesInText = [];
		Array.prototype.forEach.call( document.querySelectorAll( '#mw-content-text [lang]' ), function ( el ) {
			var lang = convertMediaWikiLanguageCodeToULS( el.lang );
			if ( languagesInText.indexOf( lang ) === -1 ) {
				languagesInText.push( lang );
			}
		} );

		return languagesInText;
	};

	/**
	 * Get languages in which a related page has any kind of a badge,
	 * such as "featured article". The "badge-*" classes are added by Wikibase.
	 *
	 * @return {string[]} Language codes
	 */
	CompactInterlanguageList.prototype.getLangsWithBadges = function () {
		return Array.prototype.map.call(
			document.querySelectorAll( '#p-lang [class*="badge"]' ),
			function ( el ) {
				return convertMediaWikiLanguageCodeToULS(
					el.querySelector( '.interlanguage-link-target' ).lang
				);
			}
		);
	};

	/**
	 * Get the list of languages links.
	 *
	 * @return {Object} Map of language codes to elements.
	 */
	CompactInterlanguageList.prototype.getInterlanguageList = function () {
		var interlanguageList = {};

		Array.prototype.forEach.call( this.listElement.querySelectorAll( '.interlanguage-link-target' ), function ( el ) {
			var langCode = convertMediaWikiLanguageCodeToULS( el.lang );
			interlanguageList[ langCode ] = el;
		} );

		return interlanguageList;
	};

	/**
	 * Get common languages - the most probable languages predicted by ULS.
	 *
	 * @param {string[]} languages Language codes
	 * @return {string[]} List of all common language codes
	 */
	CompactInterlanguageList.prototype.getCommonLanguages = function ( languages ) {
		if ( this.commonInterlanguageList === null ) {
			this.commonInterlanguageList = mw.uls.getFrequentLanguageList()
				.filter( function ( language ) {
					return languages.indexOf( language ) >= 0;
				} );
		}

		return this.commonInterlanguageList;
	};

	/**
	 * Hide languages in the interlanguage list.
	 *
	 * The most relevant ones are unhidden in #render.
	 */
	CompactInterlanguageList.prototype.hideOriginal = function () {
		var links = this.listElement.querySelectorAll( '.interlanguage-link' ),
			i = links.length;
		while ( i-- ) {
			links[ i ].style.display = 'none';
		}
	};

	/**
	 * Add the trigger at the bottom of the language list
	 */
	CompactInterlanguageList.prototype.addTrigger = function () {
		var trigger = document.createElement( 'button' );
		trigger.className = 'mw-interlanguage-selector mw-ui-button';
		trigger.title = mw.message( 'ext-uls-compact-link-info' ).plain();
		// Use text() because the message needs {{PLURAL:}}
		trigger.textContent = mw.message(
			'ext-uls-compact-link-count',
			mw.language.convertNumber( this.listSize - this.compactSize )
		).text();

		this.listElement.appendChild( trigger );
		this.$trigger = $( trigger );
	};

	/**
	 * Performance cost of calling createCompactList(), as of 2018-09-10.
	 *
	 * Summary:
	 * - DOM Queries: 5 + 1N
	 *   * createCompactList (1 querySelector)
	 *   * getLangsWithBadges (1N querySelector, 1 querySelectorAll)
	 *   * getInterlanguageList (1 querySelectorAll)
	 *   * getLangsInText (1 querySelectorAll)
	 *   * hideOriginal (1 querySelectorAll)
	 * - DOM Writes: 1 + 2N
	 *   * addTrigger (1 appendChild)
	 *   * hideOriginal (1N Element.style)
	 *   * render (1N Element.style)
	 * - Misc: 1
	 *   * addTrigger (1 mw.Message#parser)
	 */
	function createCompactList() {
		var listElement, compactList;
		listElement = document.querySelector( '#p-lang ul' );
		if ( !listElement ) {
			// Not all namespaces/pages/actions have #p-lang.
			return;
		}
		compactList = new CompactInterlanguageList( listElement, {
			// Compact the list to this size
			max: 9
		} );
		compactList.init();

	}

	// Early execute of createCompactList
	if ( document.readyState === 'interactive' ) {
		createCompactList();
	} else {
		$( createCompactList );
	}

}() );
