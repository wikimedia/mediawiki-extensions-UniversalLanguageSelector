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

	const DEFAULT_LIST_SIZE = 9;

	/**
	 * @param {Array} target
	 * @param {Array} source
	 * @param {string|string[]|undefined} items Language code, or list of language codes
	 */
	function addMatchWithoutDuplicate( target, source, items ) {
		let i;
		if ( items === undefined ) {
			return;
		}
		items = !Array.isArray( items ) ? [ items ] : items;
		for ( i = 0; i < items.length; i++ ) {
			if (
				// Only add if unique and matches source
				!target.includes( items[ i ] ) &&
				source.includes( items[ i ] )
			) {
				target.push( items[ i ] );
			}
		}
	}

	/**
	 * Get user-defined assistant languages on wikis with Translate extension.
	 *
	 * Where available, they're languages deemed useful by the user.
	 *
	 * @return {string[]|undefined} Language codes
	 */
	function getAssistantLanguages() {
		const assistantLanguages = mw.user.options.get( 'translate-editlangs' );
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
	 * Get site-specific highlighted languages. Mostly used on Wikimedia sites.
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
	 * @param {Object} [options]
	 * @param {number} [options.max] maximum number of languages to show
	 * in the compacted list. This defaults to DEFAULT_LIST_SIZE.
	 */
	function CompactInterlanguageList( listElement, options ) {
		this.listElement = listElement;
		this.options = options || {};

		/**
		 * @private
		 * @property {Object} interlanguageList
		 */
		this.interlanguageList = mw.uls.getInterlanguageListFromNodes(
			listElement.querySelectorAll( '.interlanguage-link-target' )
		);

		/**
		 * @private
		 * @property {Object} interlanguageList
		 */
		this.compactList = null;

		this.$trigger = null;
		this.compactSize = 0;
		this.listSize = 0;
	}

	/**
	 * Initialize the plugin
	 */
	CompactInterlanguageList.prototype.init = function () {
		const max = this.options.max || DEFAULT_LIST_SIZE;

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
	};

	/**
	 * Render the compacted interlanguage list and triggers
	 */
	CompactInterlanguageList.prototype.render = function () {
		for ( const language in this.compactList ) {
			this.compactList[ language ].parentNode.style.display = '';
		}
		// If there is an interlanguage selector in the page already
		// there is no need to add a trigger and Codex styles (T353850).
		mw.loader.using( '@wikimedia/codex' ).then( () => {
			this.addTrigger();
		} );

		mw.hook( 'mw.uls.compactlinks.initialized' ).fire( true );
	};

	/**
	 * Get the compacted interlanguage list as associative array
	 *
	 * @return {Object}
	 */
	CompactInterlanguageList.prototype.getCompactList = function () {
		const compactedList = {};
		const languages = Object.keys( this.interlanguageList );
		const compactLanguages = this.compact( languages );

		for ( let i = 0; i < compactLanguages.length; i++ ) {
			const language = compactLanguages[ i ];
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
			this.getLangsInText.bind( this ),
			this.getLangsWithBadges.bind( this ),
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
		let compactLanguages = [];

		const strategies = this.getCompactStrategies();
		for ( let i = 0; i < strategies.length; i++ ) {
			const found = strategies[ i ]( languages );
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
		const languagesInText = [];
		Array.prototype.forEach.call( document.querySelectorAll( '#mw-content-text [lang]' ), ( el ) => {
			const lang = mw.uls.convertMediaWikiLanguageCodeToULS( el.lang );
			if ( !languagesInText.includes( lang ) ) {
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
			this.listElement.querySelectorAll( '[class*="badge"] a.interlanguage-link-target' ),
			( el ) => mw.uls.convertMediaWikiLanguageCodeToULS( el.lang )
		);
	};

	/**
	 * Hide languages in the interlanguage list.
	 *
	 * The most relevant ones are unhidden in #render.
	 */
	CompactInterlanguageList.prototype.hideOriginal = function () {
		const links = this.listElement.querySelectorAll( '.interlanguage-link' );
		let i = links.length;
		while ( i-- ) {
			links[ i ].style.display = 'none';
		}
	};

	/**
	 * Add the trigger at the bottom of the language list.
	 *
	 * Click handler is setup in ext.uls.interface module.
	 */
	CompactInterlanguageList.prototype.addTrigger = function () {
		const trigger = document.createElement( 'button' );
		// TODO: Should we have a different class name where the CLS styles are attached?
		trigger.className = 'mw-interlanguage-selector cdx-button';
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
	 * Performance cost of calling createCompactList(), as of 2021-02-10.
	 *
	 * Summary:
	 * - DOM Queries: 5
	 *   * createCompactList (1 querySelector)
	 *   * CompactInterlanguageList constructor (1 querySelectorAll)
	 *   * getLangsWithBadges (1 querySelectorAll)
	 *   * getLangsInText (1 querySelectorAll)
	 *   * hideOriginal (1 querySelectorAll)
	 * - DOM Writes: 1 + 2N
	 *   * addTrigger (1 appendChild)
	 *   * hideOriginal (1N Element.style)
	 *   * render (1N Element.style) // N defaults to 9
	 * - Misc: 1
	 *   * addTrigger (1 mw.Message#parser)
	 */
	function createCompactList() {
		const listElement = document.querySelector( '.mw-portlet-lang ul, #p-lang ul' );
		if ( !listElement ) {
			// Not all namespaces will have a list of languages.
			return;
		}
		const compactList = new CompactInterlanguageList( listElement );
		compactList.init();

	}

	// Early execute of createCompactList
	if ( document.readyState === 'interactive' ) {
		createCompactList();
	} else {
		$( createCompactList );
	}

}() );
