/**
 * Setup code for content language selector dialog
 */

let commonInterlanguageList = null;

/**
 * @param {string[]} languageCodes array of language codes available
 * @return {Array} of languages filtered to those commonly used
 */
function filterForCommonLanguagesForUser( languageCodes ) {
	if ( commonInterlanguageList === null ) {
		commonInterlanguageList = mw.uls.getFrequentLanguageList()
			.filter( ( language ) => languageCodes.includes( language ) );
	}

	return commonInterlanguageList;
}

/**
 * @param {Object} languagesObject mapping language codes to DOMElements
 * @return {Object} mapping language codes to the textContent of DOMElements
 */
function languageObjectTextContent( languagesObject ) {
	const newLanguageObject = {};
	Object.keys( languagesObject ).forEach( ( langCode ) => {
		newLanguageObject[ langCode ] = languagesObject[ langCode ].textContent;
	} );
	return newLanguageObject;
}

/**
 * Launches an instance of UniversalLanguageSelector for changing to another
 * article language.
 *
 * @param {jQuery.Object} $trigger for opening ULS dialog
 * @param {Object} languagesObject of the available languages, mapping code (string) to Element
 * @param {boolean} forCLS Whether to enable compact language links specific behavior
 */
function launchULS( $trigger, languagesObject, forCLS ) {
	const ulsConfig = {
		/**
		 * Language selection handler
		 *
		 * @param {string} language language code
		 * @param {Object} event jQuery event object
		 */
		onSelect: function ( language, event ) {
			$trigger.removeClass( 'selector-open' );
			mw.uls.addPreviousLanguage( language );

			// Switch the current tab to the new language, unless it was
			// {Ctrl,Shift,Command} activation on a link
			if (
				event.target instanceof HTMLAnchorElement &&
				( event.metaKey || event.shiftKey || event.ctrlKey )
			) {
				return;
			}

			// TODO: The name of this hook should probably be changed to reflect that it covers
			// both the user changing their interface language and the user switching to a
			// different language.
			mw.hook( 'mw.uls.interface.language.change' ).fire( language, 'content-language-switcher' );

			location.href = languagesObject[ language ].href;
		},
		onPosition: function () {
			// Override the default positioning. See https://phabricator.wikimedia.org/T276248
			// Default positioning of jquery.uls is middle of the screen under the trigger.
			// This code aligns it under the trigger and to the trigger edge depending on which
			// side of the page the trigger is - should work automatically for both LTR and RTL.
			// T295391 Used to add fixed positioning for Vector sticky header.
			const isInVectorStickyHeader = $trigger.attr( 'id' ) === 'p-lang-btn-sticky-header';
			// These are for the trigger.
			const offset = ( isInVectorStickyHeader ) ?
				$trigger.get( 0 ).getBoundingClientRect() :
				$trigger.offset();
			const width = $trigger.outerWidth();
			const height = $trigger.outerHeight();

			let positionCSS;
			if ( offset.left + ( width / 2 ) > $( window ).width() / 2 ) {
				// Midpoint of the trigger is on the right side of the viewport.
				positionCSS = {
					// Right edge of the dialog aligns with the right edge of the trigger.
					right: $( window ).width() - ( offset.left + width ),
					top: offset.top + height
				};
			} else {
				// Midpoint of the trigger is on the left side of the viewport.
				positionCSS = {
					// Left edge of the dialog aligns with the left edge of the trigger.
					left: offset.left,
					top: offset.top + height
				};
			}

			if ( isInVectorStickyHeader ) {
				positionCSS.zIndex = 5;
				positionCSS.position = 'fixed';
			}

			return positionCSS;
		},
		onVisible: function () {
			$trigger.addClass( 'selector-open' );

			// Note well that this hook is unstable.
			mw.hook( 'mw.uls.compact_language_links.open' ).fire( $trigger );
		},
		languageDecorator: function ( $languageLink, language ) {
			const element = languagesObject[ language ];
			// Set href, text, and tooltip exactly same as what was in
			// interlanguage link. The ULS autonym might be different in some
			// cases like sr. In ULS it is "српски", while in interlanguage links
			// it is "српски / srpski"
			$languageLink
				.prop( {
					href: element.href,
					title: element.title,
					hreflang: element.hreflang
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
			const $defaultTemplate = $.fn.lcd.defaults.noResultsTemplate.call( this );
			// Customize the message
			$defaultTemplate
				.find( '.uls-no-results-found-title' )
				.data( 'i18n', 'ext-uls-compact-no-results' );
			return $defaultTemplate;
		}
	};

	if ( forCLS ) {
		// Styles for these classes are defined in the ext.uls.compactlinks module
		ulsConfig.onReady = function () {
			// This class enables the caret
			this.$menu.addClass( 'interlanguage-uls-menu' );
		};
		ulsConfig.onPosition = function () {
			// Compact language links specific positioning with a caret
			let left;
			// The panel is positioned carefully so that our pointy triangle,
			// which is implemented as a square box rotated 45 degrees with
			// rotation origin in the middle. See the corresponding style file.

			// These are for the trigger
			const offset = $trigger.offset(),
				width = $trigger.outerWidth(),
				height = $trigger.outerHeight();

			// Triangle width is: who knows now, but this still looks fine.
			const triangleWidth = 12;

			const isRight = offset.left > $( window ).width() / 2;
			// selector-{left,right} control which side the caret appears.
			// It needs to match the positioning of the dialog.
			this.$menu.toggleClass( 'selector-left', !isRight )
				.toggleClass( 'selector-right', isRight );
			if ( isRight ) {
				left = -this.$menu.outerWidth() - triangleWidth;
			} else {
				left = width + triangleWidth;
			}

			return {
				left: offset.left + left,
				// Offset from the middle of the trigger
				top: offset.top + ( height / 2 ) - 27
			};
		};
	}

	// Attach ULS behavior to the trigger. ULS will be shown only once it is clicked.
	$trigger.uls( ulsConfig );
}

module.exports = launchULS;
