/* eslint-disable no-implicit-globals */
var commonInterlanguageList;

/**
 * @param {string[]} languageCodes array of language codes available
 * @return {Array} of languages filtered to those commonly used
 */
function filterForCommonLanguagesForUser( languageCodes ) {
	if ( commonInterlanguageList === null ) {
		commonInterlanguageList = mw.uls.getFrequentLanguageList()
			.filter( function ( language ) {
				return languageCodes.indexOf( language ) >= 0;
			} );
	}

	return commonInterlanguageList;
}

/**
 * @param {Object} languagesObject mapping language codes to DOMElements
 * @return {Object} mapping language codes to the textContent of DOMElements
 */
function languageObjectTextContent( languagesObject ) {
	var newLanguageObject = {};
	Object.keys( languagesObject ).forEach( function ( langCode ) {
		newLanguageObject[ langCode ] = languagesObject[ langCode ].textContent;
	} );
	return newLanguageObject;
}

/**
 * Launches an instance of UniversalLanguageSelector for changing to another
 * article language.
 *
 * @param {jQuery.Object} $trigger for opening ULS dialog
 * @param {Object} languagesObject of the available languages, mapping
 *   code (string) to Element
 */
function launchULS( $trigger, languagesObject ) {
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
			$trigger.removeClass( 'selector-open' );
			mw.uls.addPreviousLanguage( language );

			// Switch the current tab to the new language,
			// unless it was Ctrl-click or Command-click
			if ( !event.metaKey && !event.shiftKey ) {
				location.href = languagesObject[ language ].href;
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
			var element = languagesObject[ language ];
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
			// eslint-disable-next-line mediawiki/class-doc
			$languageLink.parent().addClass( element.parentNode.className );
		},
		onCancel: function () {
			$trigger.removeClass( 'selector-open' );
		},
		languages: languageObjectTextContent( languagesObject ),
		ulsPurpose: 'compact-language-links',
		// Show common languages
		quickList: filterForCommonLanguagesForUser(
			Object.keys( languagesObject )
		),
		noResultsTemplate: function () {
			var $defaultTemplate = $.fn.lcd.defaults.noResultsTemplate.call( this );
			// Customize the message
			$defaultTemplate
				.find( '.uls-no-results-found-title' )
				.data( 'i18n', 'ext-uls-compact-no-results' );
			return $defaultTemplate;
		}
	} );
}

module.exports = launchULS;
