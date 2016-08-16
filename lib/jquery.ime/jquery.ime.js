/*! jquery.ime - v0.1.0+20160816
* https://github.com/wikimedia/jquery.ime
* Copyright (c) 2016 Santhosh Thottingal; Licensed GPL, MIT */
( function ( $ ) {
	'use strict';
	var TextEntryFactory, TextEntry, FormWidgetEntry, ContentEditableEntry,
		defaultInputMethod;

	// rangy is defined in the rangy library
	/*global rangy */

	/**
	 * Just initializes an empty static object.
	 * Similar to initClass in https://www.mediawiki.org/wiki/OOjs
	 *
	 * @param {Function} fn
	 */
	function initClass( fn ) {
		fn.static = fn.static || {};
	}

	/**
	 * Inheritance. Uses pattern similar to OOjs (https://www.mediawiki.org/wiki/OOjs).
	 * Extend prototype and static methods and properties of child constructor from
	 * a parent constructor.
	 *
	 * @param {Function} targetFn
	 * @param {Function} originFn
	 */
	function inheritClass( targetFn, originFn ) {
		targetFn.parent = originFn;
		targetFn.prototype = $.extend( {}, originFn.prototype );
		targetFn.prototype.constructor = originFn.constructor;
		targetFn.static = $.extend( {}, originFn.static );
	}

	/**
	 * IME Class
	 *
	 * @class
	 * @constructor
	 * @param {HTMLElement} element Element on which to listen for events
	 * @param {TextEntry} textEntry Text entry object to use to get/set text
	 * @param {Object} [options]
	 * @param {Function} [options.helpHandler] Called for each input method row in the selector
	 * @param {Object} [options.helpHandler.imeSelector]
	 * @param {string} [options.helpHandler.ime] Id of the input method
	 */
	function IME( element, textEntry, options ) {
		this.$element = $( element );
		this.textEntry = textEntry;
		// This needs to be delayed here since extending language list happens at DOM ready
		$.ime.defaults.languages = arrayKeys( $.ime.languages );
		this.options = $.extend( {}, $.ime.defaults, options );
		if ( this.options.imePath ) {
			// Set the global IME path from the one specified to the instance
			// TODO: remove this functionality and force clients to set the global
			// IME path
			$.ime.path = this.options.imePath;
		}
		this.active = false;
		this.shifted = false;
		this.inputmethod = null;
		this.language = null;
		this.context = '';
		if ( this.options.showSelector ) {
			this.selector = this.$element.imeselector( this.options );
		}
		this.listen();
	}

	IME.prototype = {
		constructor: IME,

		/**
		 * Listen for events and bind to handlers
		 */
		listen: function () {
			this.$element.on( 'keypress.ime', $.proxy( this.keypress, this ) );
			this.$element.on( 'keyup.ime', $.proxy( this.keyup, this ) );
			this.$element.on( 'keydown.ime', $.proxy( this.keydown, this ) );
			this.$element.on( 'destroy.ime', $.proxy( this.destroy, this ) );
			this.$element.on( 'enable.ime', $.proxy( this.enable, this ) );
			this.$element.on( 'disable.ime', $.proxy( this.disable, this ) );
		},

		/**
		 * Return a list of available language codes
		 *
		 * @return {string[]} Available language codes
		 */
		getLanguageCodes: function () {
			return $.ime.defaults.languages;
		},

		/**
		 * Return the autonym for an available language code
		 *
		 * @param {string} languageCode The language code
		 * @return {string} The autonym
		 */
		getAutonym: function ( languageCode ) {
			return $.ime.languages[ languageCode ].autonym;
		},

		/**
		 * Return a list of available input method ids for a language
		 *
		 * @param {string} languageCode An available language code
		 * @return {string[]} Available input method ids for that language
		 */
		getInputMethodIds: function ( languageCode ) {
			return $.ime.languages[ languageCode ].inputmethods;
		},

		/**
		 * Return the name of an input method
		 *
		 * @param {string} inputMethodId The id of an input method
		 * @return {string} The input method's name
		 * @see IME#load
		 */
		getInputMethodName: function ( inputMethodId ) {
			return $.ime.sources[ inputMethodId ].name;
		},

		/**
		 * Return a list of input method info { id: ..., name: ... } for a language.
		 *
		 * @param {string} languageCode An available language code
		 * @return {Object[]} Info object for each available input method
		 */
		getInputMethods: function ( languageCode ) {
			return this.getInputMethodIds( languageCode ).map( function ( inputMethodId ) {
				return {
					id: inputMethodId,
					name: $.ime.sources[ inputMethodId ].name
				};
			} );
		},

		/**
		 * Transliterate a given string input based on context and input method definition.
		 * If there are no matching rules defined, returns the original string.
		 *
		 * @param {string} input
		 * @param {string} context
		 * @param {boolean} altGr whether altGr key is pressed or not
		 * @return {Object} Transliteration object
		 * @return {boolean} return.noop Whether to consider input processed or passed through.
		 * @return {string} return.output The transliterated input or input unmodified.
		 */
		transliterate: function ( input, context, altGr ) {
			var patterns, regex, rule, replacement, i, retval;

			if ( altGr ) {
				patterns = this.inputmethod.patterns_x || [];
			} else {
				patterns = this.inputmethod.patterns || [];
			}

			if ( this.shifted ) {
				// if shift is pressed give priority for the patterns_shift
				// if exists.
				// Example: Shift+space where shift does not alter the keycode
				patterns = ( this.inputmethod.patterns_shift || [] )
					.concat( patterns );
			}

			if ( $.isFunction( patterns ) ) {
				// For backwards compatibility, allow the rule functions to return plain
				// string. Determine noop by checking whether input is different from
				// output. If the rule function returns object, just return it as-is.
				retval = patterns.call( this, input, context );
				if ( typeof retval === 'string' ) {
					return { noop: input === retval, output: retval };
				}

				return retval;
			}

			for ( i = 0; i < patterns.length; i++ ) {
				rule = patterns[ i ];
				regex = new RegExp( rule[ 0 ] + '$' );

				// Last item in the rules.
				// It can also be a function, because the replace
				// method can have a function as the second argument.
				replacement = rule.slice( -1 )[ 0 ];

				// Input string match test
				if ( regex.test( input ) ) {
					// Context test required?
					if ( rule.length === 3 ) {
						if ( new RegExp( rule[ 1 ] + '$' ).test( context ) ) {
							return { noop: false, output: input.replace( regex, replacement ) };
						}
					} else {
						return { noop: false, output: input.replace( regex, replacement ) };
					}
				}
			}

			// No matches, return the input
			return { noop: true, output: input };
		},

		keyup: function ( e ) {
			if ( e.which === 16 ) { // shift key
				this.shifted = false;
			}
		},

		keydown: function ( e ) {
			if ( e.which === 16 ) { // shift key
				this.shifted = true;
			}
		},

		/**
		 * Keypress handler
		 *
		 * @param {jQuery.Event} e Event
		 * @return {boolean}
		 */
		keypress: function ( e ) {
			var altGr = false,
				c, input, replacement;

			if ( !this.active ) {
				return true;
			}

			if ( !this.inputmethod ) {
				return true;
			}

			// handle backspace
			if ( e.which === 8 ) {
				// Blank the context
				this.context = '';
				return true;
			}

			if ( e.altKey || e.altGraphKey ) {
				altGr = true;
			}

			// Don't process ASCII control characters except linefeed,
			// as well as anything involving Ctrl, Meta and Alt,
			// but do process extended keymaps
			if ( ( e.which < 32 && e.which !== 13 && !altGr ) || e.ctrlKey || e.metaKey ) {
				// Blank the context
				this.context = '';

				return true;
			}

			c = String.fromCharCode( e.which );

			// Append the character being typed to the preceding few characters,
			// to provide context for the transliteration regexes.
			input = this.textEntry.getTextBeforeSelection( this.inputmethod.maxKeyLength );
			replacement = this.transliterate( input + c, this.context, altGr );

			// Update the context
			this.context += c;

			if ( this.context.length > this.inputmethod.contextLength ) {
				// The buffer is longer than needed, truncate it at the front
				this.context = this.context.substring(
					this.context.length - this.inputmethod.contextLength
				);
			}

			// Allow rules to explicitly define whether we match something.
			// Otherwise we cannot distinguish between no matching rule and
			// rule that provides identical output but consumes the event
			// to prevent normal behavior. See Udmurt layout which uses
			// altgr rules to allow typing the original character.
			if ( replacement.noop ) {
				return true;
			}

			this.textEntry.replaceTextAtSelection( input.length, replacement.output );

			e.stopPropagation();

			return false;
		},

		/**
		 * Check whether the input method is active or not
		 *
		 * @return {boolean}
		 */
		isActive: function () {
			return this.active;
		},

		/**
		 * Disable the input method
		 */
		disable: function () {
			this.active = false;
			$.ime.preferences.setIM( 'system' );
		},

		/**
		 * Enable the input method
		 */
		enable: function () {
			this.active = true;
		},

		/**
		 * Toggle the active state of input method
		 */
		toggle: function () {
			this.active = !this.active;
		},

		/**
		 * Destroy the binding of ime to the editable element
		 */
		destroy: function () {
			$( 'body' ).off( '.ime' );
			this.$element.off( '.ime' ).removeData( 'ime' ).removeData( 'imeselector' );
		},

		/**
		 * Get the current input method
		 *
		 * @return {string} Current input method id
		 */
		getIM: function () {
			return this.inputmethod;
		},

		/**
		 * Set the current input method
		 *
		 * @param {string} inputmethodId
		 * @fires imeLanguageChange
		 */
		setIM: function ( inputmethodId ) {
			this.inputmethod = $.ime.inputmethods[ inputmethodId ];
			$.ime.preferences.setIM( inputmethodId );
			this.$element.trigger( 'imeMethodChange' );
		},

		/**
		 * Set the current Language
		 *
		 * @param {string} languageCode
		 * @fires imeLanguageChange
		 * @return {boolean}
		 */
		setLanguage: function ( languageCode ) {
			if ( !$.ime.languages[ languageCode ] ) {
				debug( 'Language ' + languageCode + ' is not known to jquery.ime.' );

				return false;
			}

			this.language = languageCode;
			$.ime.preferences.setLanguage( languageCode );
			this.$element.trigger( 'imeLanguageChange' );
			return true;
		},

		/**
		 * Get current language
		 *
		 * @return {string}
		 */
		getLanguage: function () {
			return this.language;
		},

		/**
		 * load an input method by given id
		 *
		 * @param {string} inputmethodId
		 * @return {jQuery.Promise}
		 */
		load: function ( inputmethodId ) {
			return $.ime.load( inputmethodId );
		}
	};

	/**
	 * TextEntry factory
	 *
	 * @class
	 * @constructor
	 */
	TextEntryFactory = function IMETextEntryFactory() {
		this.TextEntryClasses = [];
	};

	/* Inheritance */

	initClass( TextEntryFactory );

	/* Methods */

	/**
	 * Register a TextEntry class, with priority over previous registrations
	 *
	 * @param {TextEntry} TextEntryClass Class to register
	 */
	TextEntryFactory.prototype.register = function ( TextEntryClass ) {
		this.TextEntryClasses.unshift( TextEntryClass );
	};

	/**
	 * Wrap an editable element with the appropriate TextEntry class
	 *
	 * @param {jQuery} $element The element to wrap
	 * @return {TextEntry|undefined} A TextEntry, or undefined if no match
	 */
	TextEntryFactory.prototype.wrap = function ( $element ) {
		var i, len, TextEntryClass;
		for ( i = 0, len = this.TextEntryClasses.length; i < len; i++ ) {
			TextEntryClass = this.TextEntryClasses[ i ];
			if ( TextEntryClass.static.canWrap( $element ) ) {
				return new TextEntryClass( $element );
			}
		}
		return undefined;
	};

	/* Initialization */

	TextEntryFactory.static.singleton = new TextEntryFactory();

	/**
	 * Generic text entry
	 *
	 * @class
	 * @abstract
	 */
	TextEntry = function IMETextEntry() {
	};

	/* Inheritance */

	initClass( TextEntry );

	/* Static methods */

	/**
	 * Test whether can wrap this type of element
	 *
	 * @param {jQuery} $element The element to wrap
	 * @return {boolean} Whether the element can be wrapped
	 */
	TextEntry.static.canWrap = function () {
		return false;
	};

	/* Abstract methods */

	/**
	 * Get text immediately before the current selection start.
	 *
	 * This SHOULD return the empty string for non-collapsed selections.
	 *
	 * @param {number} maxLength Maximum number of chars (code units) to return
	 * @return {string} Up to maxLength of text
	 */
	TextEntry.prototype.getTextBeforeSelection = null;

	/**
	 * Replace the currently selected text and/or text before the selection
	 *
	 * @param {number} precedingCharCount Number of chars before selection to replace
	 * @param {string} newText Replacement text
	 */
	TextEntry.prototype.replaceTextAtSelection = null;

	/**
	 * TextEntry class for input/textarea widgets
	 *
	 * @class
	 * @constructor
	 * @param {jQuery} $element The element to wrap
	 */
	FormWidgetEntry = function IMEFormWidgetEntry( $element ) {
		this.$element = $element;
	};

	/* Inheritance */

	inheritClass( FormWidgetEntry, TextEntry );

	/* Static methods */

	/**
	 * @inheritdoc TextEntry
	 */
	FormWidgetEntry.static.canWrap = function ( $element ) {
		return $element.is( 'input:not([type]), input[type=text], input[type=search], textarea' ) &&
			!$element.prop( 'readonly' ) &&
			!$element.prop( 'disabled' ) &&
			!$element.hasClass( 'noime' );
	};

	/* Instance methods */

	/**
	 * @inheritdoc TextEntry
	 */
	FormWidgetEntry.prototype.getTextBeforeSelection = function ( maxLength ) {
		var pos = this.getCaretPosition();
		return this.$element.val().substring(
			Math.max( 0, pos.start - maxLength ),
			pos.start
		);
	};

	/**
	 * @inheritdoc TextEntry
	 */
	FormWidgetEntry.prototype.replaceTextAtSelection = function ( precedingCharCount, newText ) {
		var selection,
			length,
			newLines,
			start,
			scrollTop,
			pos,
			element = this.$element.get( 0 );

		if ( typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number' ) {
			// IE9+ and all other browsers
			start = element.selectionStart;
			scrollTop = element.scrollTop;

			// Replace the whole text of the text area:
			// text before + newText + text after.
			// This could be made better if range selection worked on browsers.
			// But for complex scripts, browsers place cursor in unexpected places
			// and it's not possible to fix cursor programmatically.
			// Ref Bug https://bugs.webkit.org/show_bug.cgi?id=66630
			element.value = element.value.substring( 0, start - precedingCharCount ) +
				newText +
				element.value.substring( element.selectionEnd, element.value.length );

			// restore scroll
			element.scrollTop = scrollTop;
			// set selection
			element.selectionStart = element.selectionEnd = start - precedingCharCount + newText.length;
		} else {
			// IE8 and lower
			pos = this.getCaretPosition();
			selection = element.createTextRange();
			length = element.value.length;
			// IE doesn't count \n when computing the offset, so we won't either
			newLines = element.value.match( /\n/g );

			if ( newLines ) {
				length = length - newLines.length;
			}

			selection.moveStart( 'character', pos.start - precedingCharCount );
			selection.moveEnd( 'character', pos.end - length );

			selection.text = newText;
			selection.collapse( false );
			selection.select();
		}
	};

	/**
	 * Get the current selection offsets inside the widget
	 *
	 * @return {Object} return Offsets in chars (0 means first offset *or* no selection in widget)
	 * @return {number} return.start Selection start
	 * @return {number} return.end Selection end
	 */
	FormWidgetEntry.prototype.getCaretPosition = function () {
		var el = this.$element.get( 0 ),
			start = 0,
			end = 0,
			normalizedValue,
			range,
			textInputRange,
			len,
			newLines,
			endRange;

		if ( typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number' ) {
			start = el.selectionStart;
			end = el.selectionEnd;
		} else {
			// IE
			range = document.selection.createRange();

			if ( range && range.parentElement() === el ) {
				len = el.value.length;
				normalizedValue = el.value.replace( /\r\n/g, '\n' );
				newLines = normalizedValue.match( /\n/g );

				// Create a working TextRange that lives only in the input
				textInputRange = el.createTextRange();
				textInputRange.moveToBookmark( range.getBookmark() );

				// Check if the start and end of the selection are at the very end
				// of the input, since moveStart/moveEnd doesn't return what we want
				// in those cases
				endRange = el.createTextRange();
				endRange.collapse( false );

				if ( textInputRange.compareEndPoints( 'StartToEnd', endRange ) > -1 ) {
					if ( newLines ) {
						start = end = len - newLines.length;
					} else {
						start = end = len;
					}
				} else {
					start = -textInputRange.moveStart( 'character', -len );

					if ( textInputRange.compareEndPoints( 'EndToEnd', endRange ) > -1 ) {
						end = len;
					} else {
						end = -textInputRange.moveEnd( 'character', -len );
					}
				}
			}
		}
		return { start: start, end: end };
	};

	TextEntryFactory.static.singleton.register( FormWidgetEntry );

	/**
	 * TextEntry class for ContentEditable
	 *
	 * @class
	 * @constructor
	 * @param {jQuery} $element The element to wrap
	 */
	ContentEditableEntry = function IMEContentEditableEntry( $element ) {
		this.$element = $element;
	};

	/* Inheritance */

	inheritClass( ContentEditableEntry, TextEntry );

	/* Static methods */

	/**
	 * @inheritdoc TextEntry
	 */
	ContentEditableEntry.static.canWrap = function ( $element ) {
		return $element.is( '[contenteditable]' ) && !$element.hasClass( 'noime' );
	};

	/* Instance methods */

	/**
	 * @inheritdoc TextEntry
	 */
	ContentEditableEntry.prototype.getTextBeforeSelection = function ( maxLength ) {
		var range = this.getSelectedRange();
		if ( !range || !range.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE ) {
			return '';
		}
		return range.startContainer.nodeValue.substring(
			Math.max( 0, range.startOffset - maxLength ),
			range.startOffset
		);
	};

	/**
	 * @inheritdoc SelectionWrapper
	 */
	ContentEditableEntry.prototype.replaceTextAtSelection = function ( precedingCharCount, newText ) {
		var range, textNode, textOffset, newOffset, newRange;

		if ( !this.getSelectedRange() ) {
			return;
		}

		// Trigger any externally registered jQuery compositionstart event listeners.
		// TODO: Try node.dispatchEvent( new CompositionEvent(...) ) so listeners not
		// registered using jQuery will also get triggered, then fallback gracefully for
		// browsers that do not support it.
		this.$element.trigger( 'compositionstart' );

		range = this.getSelectedRange();

		if ( !range.collapsed ) {
			range.deleteContents();
		}

		if ( range.startContainer.nodeType === Node.TEXT_NODE ) {
			// Alter this text node's content and move the cursor
			textNode = range.startContainer;
			textOffset = range.startOffset;
			textNode.nodeValue =
				textNode.nodeValue.substr( 0, textOffset - precedingCharCount ) +
				newText +
				textNode.nodeValue.substr( textOffset );
			newOffset = textOffset - precedingCharCount + newText.length;
			newRange = rangy.createRange();
			newRange.setStart( range.startContainer, newOffset );
			newRange.setEnd( range.startContainer, newOffset );
			rangy.getSelection().setSingleRange( newRange );
		} else {
			// XXX assert precedingCharCount === 0
			// Insert a new text node with the new text
			textNode = document.createTextNode( newText );
			range.startContainer.insertBefore(
				textNode,
				range.startContainer.childNodes[ range.startOffset ]
			);
			newRange = rangy.createRange();
			newRange.setStart( textNode, textNode.length );
			newRange.setEnd( textNode, textNode.length );
			rangy.getSelection().setSingleRange( newRange );
		}

		// Trigger any externally registered jQuery compositionend / input event listeners.
		// TODO: Try node.dispatchEvent( new CompositionEvent(...) ) so listeners not
		// registered using jQuery will also get triggered, then fallback gracefully for
		// browsers that do not support it.
		this.$element.trigger( 'compositionend' );
		this.$element.trigger( 'input' );
	};

	/**
	 * Get the selection range inside the wrapped element, or null
	 *
	 * @return {Range|null} The selection range
	 */
	ContentEditableEntry.prototype.getSelectedRange = function () {
		var sel, range;
		rangy.init();
		sel = rangy.getSelection();
		if ( sel.rangeCount === 0 ) {
			return null;
		}
		range = sel.getRangeAt( 0 );
		if ( !this.$element[ 0 ].contains( range.commonAncestorContainer ) ) {
			return null;
		}
		return range;
	};

	TextEntryFactory.static.singleton.register( ContentEditableEntry );

	/* Exports */

	/**
	 * jQuery plugin ime
	 *
	 * @param {Object} option
	 */
	$.fn.ime = function ( option ) {
		return this.each( function () {
			var data, textEntry,
				$this = $( this ),
				options = typeof option === 'object' && option;

			data = $this.data( 'ime' );
			if ( !data ) {
				textEntry = TextEntryFactory.static.singleton.wrap( $this );
				if ( textEntry === undefined ) {
					return;
				}
				data = new IME( this, textEntry, options );
				$this.data( 'ime', data );
			}

			if ( typeof option === 'string' ) {
				data[ option ]();
			}
		} );
	};

	$.ime = {};
	$.ime.inputmethods = {};
	$.ime.sources = {};
	$.ime.preferences = {};
	$.ime.languages = {};

	/**
	 * @property {string} Relative/absolute path for the rules folder of jquery.ime
	 */
	$.ime.path = '../';
	$.ime.textEntryFactory = TextEntryFactory.static.singleton;
	$.ime.TextEntry = TextEntry;
	$.ime.inheritClass = inheritClass;

	defaultInputMethod = {
		contextLength: 0,
		maxKeyLength: 1
	};

	/**
	 * load an input method by given id
	 *
	 * @param {string} inputmethodId
	 * @return {jQuery.Promise}
	 */
	$.ime.load = function ( inputmethodId ) {
		var dependency,
			deferred = $.Deferred();

		if ( $.ime.inputmethods[ inputmethodId ] ) {
			return deferred.resolve();
		}

		// Validate the input method id.
		if ( !$.ime.sources[ inputmethodId ] ) {
			return deferred.reject();
		}

		dependency = $.ime.sources[ inputmethodId ].depends;
		if ( dependency && !$.ime.inputmethods[ dependency ] ) {
			$.ime.load( dependency ).done( function () {
				$.ime.load( inputmethodId ).done( function () {
					deferred.resolve();
				} );
			} );

			return deferred;
		}

		debug( 'Loading ' + inputmethodId );
		deferred = $.ajax( {
			url: $.ime.path + $.ime.sources[ inputmethodId ].source,
			dataType: 'script',
			cache: true
		} ).done( function () {
			debug( inputmethodId + ' loaded' );
		} ).fail( function ( jqxhr, settings, exception ) {
			debug( 'Error in loading inputmethod ' + inputmethodId + ' Exception: ' + exception );
		} );

		return deferred.promise();
	};

	$.ime.register = function ( inputMethod ) {
		$.ime.inputmethods[ inputMethod.id ] = $.extend( {}, defaultInputMethod, inputMethod );
	};

	/**
	 * Set the relative/absolute path to rules/ (for loading input methods)
	 *
	 * @param {string} path The relative/absolute path in which rules/ lies
	 */
	$.ime.setPath = function ( path ) {
		$.ime.path = path;
	};

	// default options
	$.ime.defaults = {
		languages: [], // Languages to be used- by default all languages
		helpHandler: null, // Called for each ime option in the menu
		showSelector: true
	};

	/**
	 * private function for debugging
	 */
	function debug( $obj ) {
		if ( window.console && window.console.log ) {
			window.console.log( $obj );
		}
	}

	function arrayKeys( obj ) {
		return $.map( obj, function ( element, index ) {
			return index;
		} );
	}
}( jQuery ) );

( function ( $ ) {
	'use strict';

	var selectorTemplate, MutationObserver;

	function IMESelector( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, IMESelector.defaults, options );
		this.active = false;
		this.$imeSetting = null;
		this.$menu = null;
		this.inputmethod = null;
		this.timer = null;
		this.init();
		this.listen();
	}

	IMESelector.prototype = {
		constructor: IMESelector,

		init: function () {
			this.prepareSelectorMenu();
			this.position();
			this.$imeSetting.hide();
		},

		prepareSelectorMenu: function () {
			// TODO: In this approach there is a menu for each editable area.
			// With correct event mapping we can probably reduce it to one menu.
			this.$imeSetting = $( selectorTemplate );
			this.$menu = $( '<div class="imeselector-menu" role="menu">' );
			this.$menu.append(
				imeListTitle(),
				imeList(),
				toggleMenuItem(),
				languageListTitle()
			);

			this.prepareLanguageList();
			this.$menu.append( this.helpLink() );

			if ( $.i18n ) {
				this.$menu.i18n();
			}

			this.$imeSetting.append( this.$menu );
			$( 'body' ).append( this.$imeSetting );
		},

		stopTimer: function () {
			if ( this.timer ) {
				clearTimeout( this.timer );
				this.timer = null;
			}

			this.$imeSetting.stop( true, true );
		},

		resetTimer: function () {
			var imeselector = this;

			this.stopTimer();

			this.timer = setTimeout(
				function () {
					imeselector.$imeSetting.animate( {
						opacity: 0,
						marginTop: '-20px'
					}, 500, function () {
						imeselector.$imeSetting.hide();
						// Restore properties for the next time it becomes visible:
						imeselector.$imeSetting.css( 'opacity', 1 );
						imeselector.$imeSetting.css( 'margin-top', 0 );
					} );
				}, this.options.timeout
			);
		},

		focus: function () {
			// Hide all other IME settings and collapse open menus
			$( 'div.imeselector' ).hide();
			$( 'div.imeselector-menu' ).removeClass( 'ime-open' );
			this.$imeSetting.show();
			this.resetTimer();
		},

		show: function () {
			this.$menu.addClass( 'ime-open' );
			this.stopTimer();
			this.$imeSetting.show();

			return false;
		},

		hide: function () {
			this.$menu.removeClass( 'ime-open' );
			this.resetTimer();

			return false;
		},

		toggle: function () {
			if ( this.$menu.hasClass( 'ime-open' ) ) {
				this.hide();
			} else {
				this.show();
			}
		},

		/**
		 * Bind the events and listen
		 */
		listen: function () {
			var imeselector = this;

			imeselector.$imeSetting.on( 'click.ime', function ( e ) {
				var t = $( e.target );

				if ( t.hasClass( 'imeselector-toggle' ) ) {
					imeselector.toggle();
				}

				return false;
			} );

			imeselector.$element.on( 'blur.ime', function () {
				if ( !imeselector.$imeSetting.hasClass( 'ime-onfocus' ) ) {
					imeselector.$imeSetting.hide();
					imeselector.hide();
				}
			} );

			// Hide the menu when clicked outside
			$( 'html' ).click( function () {
				imeselector.hide();
			} );

			// ... but when clicked on window do not propagate it.
			this.$menu.on( 'click', function ( event ) {
				event.stopPropagation();
			} );

			imeselector.$imeSetting.mouseenter( function () {
				// We don't want the selector to disappear
				// while the user is trying to click it
				imeselector.stopTimer();
				imeselector.$imeSetting.addClass( 'ime-onfocus' );
			} ).mouseleave( function () {
				imeselector.resetTimer();
				imeselector.$imeSetting.removeClass( 'ime-onfocus' );
			} );

			imeselector.$menu.on( 'click.ime', 'li', function () {
				imeselector.$element.focus();

				return false;
			} );

			imeselector.$menu.on( 'click.ime', 'li.ime-im', function () {
				imeselector.selectIM( $( this ).data( 'ime-inputmethod' ) );
				imeselector.$element.trigger( 'setim.ime', $( this ).data( 'ime-inputmethod' ) );

				return false;
			} );

			imeselector.$menu.on( 'click.ime', 'li.ime-lang', function () {
				var im = imeselector.selectLanguage( $( this ).attr( 'lang' ) );

				imeselector.$element.trigger( 'setim.ime', im );

				return false;
			} );

			imeselector.$menu.on( 'click.ime', 'div.ime-disable', function () {
				imeselector.disableIM();

				return false;
			} );

			// Just make it work as a regular link
			imeselector.$menu.on( 'click.ime', '.ime-help-link', function ( e ) {
				e.stopPropagation();
			} );

			imeselector.$element.on( 'focus.ime', function ( e ) {
				imeselector.selectLanguage( imeselector.decideLanguage() );
				imeselector.focus();
				e.stopPropagation();
			} );

			imeselector.$element.attrchange( function ( ) {
				if ( imeselector.$element.is( ':hidden' ) ) {
					imeselector.$imeSetting.hide();
				}
			} );

			// Possible resize of textarea
			imeselector.$element.on( 'mouseup.ime', $.proxy( this.position, this ) );
			imeselector.$element.on( 'keydown.ime', $.proxy( this.keydown, this ) );

			// Update IM selector position when the window is resized
			// or the browser window is zoomed in or zoomed out
			$( window ).resize( function () {
				imeselector.position();
			} );
		},

		/**
		 * Keydown event handler. Handles shortcut key presses
		 *
		 * @context {HTMLElement}
		 * @param {jQuery.Event} e
		 */
		keydown: function ( e ) {
			var ime = $( e.target ).data( 'ime' ),
				firstInputmethod,
				previousInputMethods,
				languageCode;

			this.focus(); // shows the trigger in case it is hidden

			if ( isShortcutKey( e ) ) {
				if ( ime.isActive() ) {
					this.disableIM();
					this.$element.trigger( 'setim.ime', 'system' );
				} else {
					if ( this.inputmethod !== null ) {
						this.selectIM( this.inputmethod.id );
						this.$element.trigger( 'setim.ime', this.inputmethod.id );
					} else {
						languageCode = this.decideLanguage();
						this.selectLanguage( languageCode );

						if ( !ime.isActive() && $.ime.languages[ languageCode ] ) {
							// Even after pressing toggle shortcut again, it is still disabled
							// Check if there is a previously used input method.
							previousInputMethods = $.ime.preferences.getPreviousInputMethods();

							if ( previousInputMethods[ 0 ] ) {
								this.selectIM( previousInputMethods[ 0 ] );
							} else {
								// Provide the default input method in this case.
								firstInputmethod = $.ime.languages[ languageCode ].inputmethods[ 0 ];
								this.selectIM( firstInputmethod );
							}
						}
					}
				}

				e.preventDefault();
				e.stopPropagation();

				return false;
			}

			return true;
		},

		/**
		 * Position the im selector relative to the edit area
		 */
		position: function () {
			var menuWidth, menuTop, menuLeft, elementPosition,
				top, left, cssTop, cssLeft, verticalRoom, overflowsOnRight,
				imeSelector = this,
				rtlElement = this.$element.css( 'direction' ) === 'rtl',
				$window = $( window );

			this.focus(); // shows the trigger in case it is hidden

			elementPosition = this.$element.offset();
			top = elementPosition.top + this.$element.outerHeight();
			left = elementPosition.left;

			// RTL element position fix
			if ( !rtlElement ) {
				left = elementPosition.left + this.$element.outerWidth() -
					this.$imeSetting.outerWidth();
			}

			// While determining whether to place the selector above or below the input box,
			// take into account the value of scrollTop, to avoid the selector from always
			// getting placed above the input box since window.height would be less than top
			// if the page has been scrolled.
			verticalRoom = $window.height() + $( document ).scrollTop() - top;

			if ( verticalRoom < this.$imeSetting.outerHeight() ) {
				top = elementPosition.top - this.$imeSetting.outerHeight();
				menuTop = this.$menu.outerHeight() +
					this.$imeSetting.outerHeight();

				// Flip the menu to the top only if it can fit in the space there
				if ( menuTop < top ) {
					this.$menu
						.addClass( 'ime-position-top' )
						.css( 'top', -menuTop );
				}
			}

			cssTop = top;
			cssLeft = left;
			this.$element.parents().each( function () {
				if ( $( this ).css( 'position' ) === 'fixed' ) {
					imeSelector.$imeSetting.css( 'position', 'fixed' );
					cssTop -= $( document ).scrollTop();
					cssLeft -= $( document ).scrollLeft();
					return false;
				}
			} );

			this.$imeSetting.css( {
				top: cssTop,
				left: cssLeft
			} );

			menuWidth = this.$menu.width();
			overflowsOnRight = ( left - $( document ).scrollLeft() + menuWidth ) > $window.width();

			// Adjust horizontal position if there's
			// not enough space on any side
			if ( menuWidth > left ||
				rtlElement && overflowsOnRight
			) {
				if ( rtlElement ) {
					if ( overflowsOnRight ) {
						this.$menu.addClass( 'ime-right' );
						menuLeft = this.$imeSetting.outerWidth() - menuWidth;
					} else {
						menuLeft = 0;
					}
				} else {
					this.$menu.addClass( 'ime-right' );
					menuLeft = elementPosition.left;
				}

				this.$menu.css( 'left', menuLeft );
			}
		},

		/**
		 * Select a language
		 *
		 * @param {string} languageCode
		 * @return {string|bool} Selected input method id or false
		 */
		selectLanguage: function ( languageCode ) {
			var ime, imePref, language;

			// consider language codes case insensitive
			languageCode = languageCode && languageCode.toLowerCase();

			ime = this.$element.data( 'ime' );
			imePref = $.ime.preferences.getIM( languageCode );
			language = $.ime.languages[ languageCode ];

			this.setMenuTitle( this.getAutonym( languageCode ) );

			if ( !language ) {
				return false;
			}

			if ( ime.getLanguage() === languageCode ) {
				// Nothing to do. It is same as the current language,
				// but check whether the input method changed.
				if ( ime.inputmethod && ime.inputmethod.id !== imePref ) {
					this.selectIM( $.ime.preferences.getIM( languageCode ) );
				}

				return $.ime.preferences.getIM( languageCode );
			}

			this.$menu.find( 'li.ime-lang' ).show();
			this.$menu.find( 'li[lang=' + languageCode + ']' ).hide();

			this.prepareInputMethods( languageCode );
			this.hide();
			// And select the default inputmethod
			ime.setLanguage( languageCode );
			this.inputmethod = null;
			this.selectIM( $.ime.preferences.getIM( languageCode ) );

			return $.ime.preferences.getIM( languageCode );
		},

		/**
		 * Get the autonym by language code.
		 *
		 * @param {string} languageCode
		 * @return {string} The autonym
		 */
		getAutonym: function ( languageCode ) {
			return $.ime.languages[ languageCode ]
				&& $.ime.languages[ languageCode ].autonym;
		},

		/**
		 * Set the title of the selector menu.
		 *
		 * @param {string} title
		 */
		setMenuTitle: function ( title ) {
			this.$menu.find( '.ime-list-title' ).text( title );
		},

		/**
		 * Decide on initial language to select
		 */
		decideLanguage: function () {
			if ( $.ime.preferences.getLanguage() ) {
				// There has been an override by the user,
				// so return the language selected by user
				return $.ime.preferences.getLanguage();
			}

			if ( this.$element.attr( 'lang' ) &&
				$.ime.languages[ this.$element.attr( 'lang' ) ]
			) {
				return this.$element.attr( 'lang' );
			}

			// There is either no IMs for the given language attr
			// or there is no lang attr at all.
			return $.ime.preferences.getDefaultLanguage();
		},

		/**
		 * Select an input method
		 *
		 * @param {string} inputmethodId
		 */
		selectIM: function ( inputmethodId ) {
			var imeselector = this,
				ime;

			if ( !inputmethodId ) {
				return;
			}

			this.$menu.find( '.ime-checked' ).removeClass( 'ime-checked' );
			this.$menu.find( 'li[data-ime-inputmethod=' + inputmethodId + ']' )
				.addClass( 'ime-checked' );
			ime = this.$element.data( 'ime' );

			if ( inputmethodId === 'system' ) {
				this.disableIM();

				return;
			}

			ime.load( inputmethodId ).done( function () {
				imeselector.inputmethod = $.ime.inputmethods[ inputmethodId ];
				imeselector.hide();
				ime.enable();
				ime.setIM( inputmethodId );
				imeselector.$imeSetting.find( 'a.ime-name' ).text(
					$.ime.sources[ inputmethodId ].name
				);

				imeselector.position();

				// Save this preference
				$.ime.preferences.save();
			} );
		},

		/**
		 * Disable the inputmethods (Use the system input method)
		 */
		disableIM: function () {
			this.$menu.find( '.ime-checked' ).removeClass( 'ime-checked' );
			this.$menu.find( 'div.ime-disable' ).addClass( 'ime-checked' );
			this.$element.data( 'ime' ).disable();
			this.$imeSetting.find( 'a.ime-name' ).text( '' );
			this.hide();
			this.position();

			// Save this preference
			$.ime.preferences.save();
		},

		/**
		 * Prepare language list
		 */
		prepareLanguageList: function () {
			var languageCodeIndex,
				$languageListWrapper,
				$languageList,
				languageList,
				$languageItem,
				$language,
				languageCode,
				language;

			// Language list can be very long, so we use a container with
			// overflow auto
			$languageListWrapper = $( '<div class="ime-language-list-wrapper">' );
			$languageList = $( '<ul class="ime-language-list">' );

			if ( $.isFunction( this.options.languages ) ) {
				languageList = this.options.languages();
			} else {
				languageList = this.options.languages;
			}

			for ( languageCodeIndex in languageList ) {
				languageCode = languageList[ languageCodeIndex ];
				language = $.ime.languages[ languageCode ];

				if ( !language ) {
					continue;
				}

				$languageItem = $( '<a>' )
					.attr( 'href', '#' )
					.text( this.getAutonym( languageCode ) )
					.addClass( 'selectable-row-item autonym' );
				$language = $( '<li class="ime-lang selectable-row">' ).attr( 'lang', languageCode );
				$language.append( $languageItem );
				$languageList.append( $language );
			}

			$languageListWrapper.append( $languageList );
			this.$menu.append( $languageListWrapper );

			if ( this.options.languageSelector ) {
				this.$menu.append( this.options.languageSelector() );
			}
		},

		/**
		 * Prepare input methods in menu for the given language code
		 *
		 * @param {string} languageCode
		 */
		prepareInputMethods: function ( languageCode ) {
			var language = $.ime.languages[ languageCode ],
				$imeList = this.$menu.find( '.ime-list' ),
				imeSelector = this;

			$imeList.empty();

			$.each( language.inputmethods, function ( index, inputmethod ) {
				var $imeItem, $inputMethod, source, name;

				source = $.ime.sources[ inputmethod ];
				if ( !source ) {
					return;
				}
				name = source.name;

				$imeItem = $( '<a>' )
					.attr( 'href', '#' )
					.text( name )
					.addClass( 'selectable-row-item' );

				$inputMethod = $( '<li>' )
					.attr( 'data-ime-inputmethod', inputmethod )
					.addClass( 'ime-im selectable-row' )
					.append( '<span class="ime-im-check"></span>', $imeItem );

				if ( imeSelector.options.helpHandler ) {
					$inputMethod.append( imeSelector.options.helpHandler.call( imeSelector, inputmethod ) );
				}

				$imeList.append( $inputMethod );
			} );
		},

		/**
		 * Create a help link element.
		 *
		 * @return {jQuery}
		 */
		helpLink: function () {
			return $( '<div class="ime-help-link selectable-row">' )
				.append( $( '<a>' ).text( 'Help' )
					.addClass( 'selectable-row-item' )
					.attr( {
						href: 'http://github.com/wikimedia/jquery.ime',
						target: '_blank',
						'data-i18n': 'jquery-ime-help'
					} )
				);
		}
	};

	IMESelector.defaults = {
		defaultLanguage: 'en',
		timeout: 2500 // Milliseconds after which IME widget hides itself.
	};

	/*
	 * imeselector PLUGIN DEFINITION
	 */

	$.fn.imeselector = function ( options ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'imeselector' );

			if ( !data ) {
				$this.data( 'imeselector', ( data = new IMESelector( this, options ) ) );
			}

			if ( typeof options === 'string' ) {
				data[ options ].call( $this );
			}
		} );
	};

	$.fn.imeselector.Constructor = IMESelector;

	function languageListTitle() {
		return $( '<h3>' )
			.addClass( 'ime-lang-title' )
			.attr( 'data-i18n', 'jquery-ime-other-languages' )
			.text( 'Other languages' );
	}

	function imeList() {
		return $( '<ul>' ).addClass( 'ime-list' );
	}

	function imeListTitle() {
		return $( '<h3>' ).addClass( 'ime-list-title autonym' );
	}

	function toggleMenuItem() {
		return $( '<div class="ime-disable selectable-row">' ).append(
			$( '<span>' )
				.attr( {
					'class': 'ime-disable-link',
					'data-i18n': 'jquery-ime-disable-text'
				} )
				.addClass( 'ime-checked' )
				.text( 'System input method' ),
			$( '<span>' )
				.addClass( 'ime-disable-shortcut' )
				.text( 'CTRL+M' )
		);
	}

	selectorTemplate = '<div class="imeselector imeselector-toggle">' +
		'<a class="ime-name imeselector-toggle" href="#"></a>' +
		'<b class="ime-setting-caret imeselector-toggle"></b></div>';

	MutationObserver = window.MutationObserver ||
		window.WebKitMutationObserver ||
		window.MozMutationObserver;

	/**
	 * Check whether a keypress event corresponds to the shortcut key
	 *
	 * @param {event} event
	 * @return {boolean} true if the key is a shortcut key
	 */
	function isShortcutKey( event ) {
		// 77 - The letter M, for Ctrl-M
		return event.ctrlKey && !event.altKey && ( event.which === 77 );
	}

	function isDOMAttrModifiedSupported() {
		var p = document.createElement( 'p' ),
			flag = false;

		if ( p.addEventListener ) {
			p.addEventListener( 'DOMAttrModified', function () {
				flag = true;
			}, false );
		} else if ( p.attachEvent ) {
			p.attachEvent( 'onDOMAttrModified', function () {
				flag = true;
			} );
		} else {
			return false;
		}

		p.setAttribute( 'id', 'target' );

		return flag;
	}

	$.fn.attrchange = function ( callback ) {
		var observer;

		if ( MutationObserver ) {
			observer = new MutationObserver( function ( mutations ) {
				mutations.forEach( function ( e ) {
					callback.call( e.target, e.attributeName );
				} );
			} );

			return this.each( function () {
				observer.observe( this, {
					subtree: false,
					attributes: true
				} );
			} );
		} else if ( isDOMAttrModifiedSupported() ) {
			return this.on( 'DOMAttrModified', function ( e ) {
				callback.call( this, e.originalEvent.attrName );
			} );
		} else if ( 'onpropertychange' in document.body ) {
			return this.on( 'propertychange', function () {
				callback.call( this, window.event.propertyName );
			} );
		}
	};
}( jQuery ) );

( function ( $ ) {
	'use strict';

	$.extend( $.ime.preferences, {
		registry: {
			isDirty: false,
			language: null,
			previousLanguages: [], // array of previous languages
			previousInputMethods: [], // array of previous inputmethods
			imes: {
				en: 'system'
			}
		},

		setLanguage: function ( language ) {
			// Do nothing if there's no actual change
			if ( language === this.registry.language ) {
				return;
			}

			this.registry.language = language;
			this.registry.isDirty = true;
			if ( !this.registry.previousLanguages ) {
				this.registry.previousLanguages = [];
			}

			// Add to the previous languages, but avoid duplicates.
			if ( $.inArray( language, this.registry.previousLanguages ) === -1 ) {
				this.registry.previousLanguages.unshift( language );
				this.registry.previousLanguages = this.registry.previousLanguages.slice( 0, 5 );
			}
		},

		getLanguage: function () {
			return this.registry.language;
		},

		getDefaultLanguage: function () {
			return 'en';
		},

		getPreviousLanguages: function () {
			return this.registry.previousLanguages;
		},

		getPreviousInputMethods: function () {
			return this.registry.previousInputMethods;
		},

		// Set the given IM as the last used for the language
		setIM: function ( inputMethod ) {
			if ( !this.registry.imes ) {
				this.registry.imes = {};
			}

			// Do nothing if there's no actual change
			if ( inputMethod === this.registry.imes[ this.registry.language ] ) {
				return;
			}

			this.registry.imes[ this.getLanguage() ] = inputMethod;
			this.registry.isDirty = true;
			if ( !this.registry.previousInputMethods ) {
				this.registry.previousInputMethods = [];
			}

			// Add to the previous languages,
			if ( inputMethod !== 'system' ) {
				this.registry.previousInputMethods.unshift( inputMethod );
				this.registry.previousInputMethods = this.registry.previousInputMethods.slice( 0, 5 );
			}
		},

		// Return the last used or the default IM for language
		getIM: function ( language ) {
			if ( !this.registry.imes ) {
				this.registry.imes = {};
			}

			return this.registry.imes[ language ] || 'system';
		},

		save: function () {
			// save registry in cookies or localstorage
		},

		load: function () {
			// load registry from cookies or localstorage
		}
	} );
}( jQuery ) );

( function ( $ ) {
	'use strict';

	$.extend( $.ime.sources, {
		'am-transliteration': {
			name: 'ትራንስልተራትዖን',
			source: 'rules/am/am-transliteration.js'
		},
		'ak-qx': {
			name: 'Akan - QX replacement',
			source: 'rules/ak/ak-qx.js'
		},
		'ar-kbd': {
			name: 'أرابيك',
			source: 'rules/ar/ar-kbd.js'
		},
		'as-avro': {
			name: 'অভ্ৰ',
			source: 'rules/as/as-avro.js'
		},
		'as-bornona': {
			name: 'বৰ্ণনা',
			source: 'rules/as/as-bornona.js'
		},
		'as-inscript': {
			name: 'ইনস্ক্ৰিপ্ট',
			source: 'rules/as/as-inscript.js'
		},
		'as-inscript2': {
			name: 'ইনস্ক্ৰিপ্ট ২',
			source: 'rules/as/as-inscript2.js'
		},
		'as-phonetic': {
			name: 'ফনেটিক',
			source: 'rules/as/as-phonetic.js'
		},
		'as-rodali': {
			name: 'ৰ\'দালি',
			source: 'rules/as/as-rodali.js'
		},
		'as-transliteration': {
			name: 'প্ৰতিৰূপান্তৰণ',
			source: 'rules/as/as-transliteration.js'
		},
		'azb-kbd': {
			name: 'تۆرکجه',
			source: 'rules/azb/azb-kbd.js'
		},
		'batak-qwerty': {
			name: 'Batak QWERTY',
			source: 'rules/bbc/batak-qwerty.js'
		},
		'be-kbd': {
			name: 'Стандартная',
			source: 'rules/be/be-kbd.js'
		},
		'be-latin': {
			name: 'Łacinka',
			source: 'rules/be/be-latin.js'
		},
		'be-transliteration': {
			name: 'Транслітэрацыя',
			source: 'rules/be/be-transliteration.js'
		},
		'ber-tfng': {
			name: 'Tifinagh',
			source: 'rules/ber/ber-tfng.js'
		},
		'bgn-kbd': {
			name: 'روچ کپتین بلوچی',
			source: 'rules/bgn/bgn-kbd.js'
		},
		'bn-avro': {
			name: 'অভ্র',
			source: 'rules/bn/bn-avro.js'
		},
		'bn-inscript': {
			name: 'ইনস্ক্ৰিপ্ট',
			source: 'rules/bn/bn-inscript.js'
		},
		'bn-inscript2': {
			name: 'ইনস্ক্ৰিপ্ট ২',
			source: 'rules/bn/bn-inscript2.js'
		},
		'bn-nkb': {
			name: 'ন্যাশনাল কিবোর্ড',
			source: 'rules/bn/bn-nkb.js'
		},
		'bn-probhat': {
			name: 'প্রভাত',
			source: 'rules/bn/bn-probhat.js'
		},
		'bo-ewts': {
			name: 'Tibetan EWTS',
			source: 'rules/bo/bo-ewts.js'
		},
		'brx-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/brx/brx-inscript.js'
		},
		'brx-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/brx/brx-inscript2.js'
		},
		'ckb-transliteration-arkbd': {
			name: 'باشووری',
			source: 'rules/ckb/ckb-transliteration-arkbd.js'
		},
		'ckb-transliteration-fakbd': {
			name: 'ڕۆژھەڵاتی',
			source: 'rules/ckb/ckb-transliteration-fakbd.js'
		},
		'ckb-transliteration-lakbd': {
			name: 'لاتینی',
			source: 'rules/ckb/ckb-transliteration-lakbd.js'
		},
		'cv-cyr-altgr': {
			name: 'Чăвашла (AltGr)',
			source: 'rules/cv/cv-cyr-altgr.js'
		},
		'cv-lat-altgr': {
			name: 'Căvašla (AltGr)',
			source: 'rules/cv/cv-lat-altgr.js'
		},
		'cv-cyr-numbers': {
			name: 'Чăвашла (цифрилисем)',
			source: 'rules/cv/cv-cyr-numbers.js'
		},
		'cyrl-palochka': {
			name: 'Palochka',
			source: 'rules/cyrl/cyrl-palochka.js'
		},
		'da-normforms': {
			name: 'normalformer',
			source: 'rules/da/da-normforms.js'
		},
		'doi-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/doi/doi-inscript2.js'
		},
		'eo-transliteration': {
			name: 'transliterigo',
			source: 'rules/eo/eo-transliteration.js'
		},
		'eo-h': {
			name: 'Esperanto h',
			source: 'rules/eo/eo-h.js'
		},
		'eo-h-f': {
			name: 'Esperanto h fundamente',
			source: 'rules/eo/eo-h-f.js'
		},
		'eo-plena': {
			name: 'Esperanto plena',
			source: 'rules/eo/eo-plena.js'
		},
		'eo-q': {
			name: 'Esperanto q sistemo',
			source: 'rules/eo/eo-q.js'
		},
		'eo-vi': {
			name: 'Esperanto vi sistemo',
			source: 'rules/eo/eo-vi.js'
		},
		'eo-x': {
			name: 'Esperanto x sistemo',
			source: 'rules/eo/eo-x.js'
		},
		'fa-kbd': {
			name: 'فارسی',
			source: 'rules/fa/fa-kbd.js'
		},
		'fo-normforms': {
			name: 'Føroyskt',
			source: 'rules/fo/fo-normforms.js'
		},
		'fi-transliteration': {
			name: 'translitterointi',
			source: 'rules/fi/fi-transliteration.js'
		},
		'lud-transliteration': {
			name: 'lud',
			source: 'rules/lud/lud-transliteration.js'
		},
		'hi-transliteration': {
			name: 'लिप्यंतरण',
			source: 'rules/hi/hi-transliteration.js'
		},
		'hi-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/hi/hi-inscript.js'
		},
		'hi-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/hi/hi-inscript2.js'
		},
		'hi-phonetic': {
			name: 'फोनेटिक',
			source: 'rules/hi/hi-phonetic.js'
		},
		'is-normforms': {
			name: 'Venjuleg eyðublöð',
			source: 'rules/is/is-normforms.js'
		},
		'jv-transliteration': {
			name: 'Transliteration',
			source: 'rules/jv/jv-transliteration.js'
		},
		'mai-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/mai/mai-inscript.js',
			depends: 'hi-inscript'
		},
		'mai-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/mai/mai-inscript2.js',
			depends: 'hi-inscript2'
		},
		'hi-bolnagri': {
			name: 'बोलनागरी',
			source: 'rules/hi/hi-bolnagri.js'
		},
		'ml-transliteration': {
			name: 'ലിപ്യന്തരണം',
			source: 'rules/ml/ml-transliteration.js'
		},
		'ml-inscript': {
			name: 'ഇൻസ്ക്രിപ്റ്റ്',
			source: 'rules/ml/ml-inscript.js'
		},
		'ml-inscript2': {
			name: 'ഇൻസ്ക്രിപ്റ്റ് 2',
			source: 'rules/ml/ml-inscript2.js'
		},
		'sv-normforms': {
			name: 'Normal forms',
			source: 'rules/sv/sv-normforms.js'
		},
		'ta-inscript': {
			name: 'இன்ஸ்கிரிப்ட்',
			source: 'rules/ta/ta-inscript.js'
		},
		'ta-inscript2': {
			name: 'இன்ஸ்கிரிப்ட் 2',
			source: 'rules/ta/ta-inscript2.js'
		},
		'ta-transliteration': {
			name: 'எழுத்துப்பெயர்ப்பு',
			source: 'rules/ta/ta-transliteration.js'
		},
		'ta-99': {
			name: 'தமிழ்99',
			source: 'rules/ta/ta-99.js'
		},
		'ta-bamini': {
			name: 'பாமினி',
			source: 'rules/ta/ta-bamini.js'
		},
		'th-kedmanee': {
			name: 'เกษมณี',
			source: 'rules/th/th-kedmanee.js'
		},
		'th-pattachote': {
			name: 'ปัตตะโชติ',
			source: 'rules/th/th-pattachote.js'
		},
		'de-transliteration': {
			name: 'Deutsch Tilde',
			source: 'rules/de/de-transliteration.js'
		},
		'el-kbd': {
			name: 'Τυπική πληκτρολόγιο',
			source: 'rules/el/el-kbd.js'
		},
		'he-standard-2012': {
			name: 'עברית עם ניקוד על בסיס אנגלית',
			source: 'rules/he/he-standard-2012.js'
		},
		'he-standard-2012-extonly': {
			name: 'עברית עם ניקוד',
			source: 'rules/he/he-standard-2012-extonly.js'
		},
		'hr-kbd': {
			name: 'Croatian kbd',
			source: 'rules/hr/hr-kbd.js'
		},
		'hy-ephonetic': {
			name: 'Հնչյունային դասավորություն',
			source: 'rules/hy/hy-ephonetic.js'
		},
		'hy-typewriter': {
			name: 'Գրամեքենայի դասավորություն',
			source: 'rules/hy/hy-typewriter.js'
		},
		'hy-ephoneticalt': {
			name: 'Հնչյունային նոր (R→Ր, F→Թ)',
			source: 'rules/hy/hy-ephoneticalt.js'
		},
		'hy-emslegacy': {
			name: 'Մայքրոսոֆթի հին արևելահայերեն',
			source: 'rules/hy/hy-emslegacy.js'
		},
		'hy-wmslegacy': {
			name: 'Մայքրոսոֆթի հին արևմտահայերեն',
			source: 'rules/hy/hy-wmslegacy.js'
		},
		'gu-inscript': {
			name: 'ઇનસ્ક્રિપ્ટ',
			source: 'rules/gu/gu-inscript.js'
		},
		'gu-inscript2': {
			name: 'ઇનસ્ક્રિપ્ટ ૨',
			source: 'rules/gu/gu-inscript2.js'
		},
		'gu-phonetic': {
			name: 'ફોનૅટિક',
			source: 'rules/gu/gu-phonetic.js'
		},
		'gu-transliteration': {
			name: 'લિપ્યંતરણ',
			source: 'rules/gu/gu-transliteration.js'
		},
		'ka-transliteration': {
			name: 'ტრანსლიტერაცია',
			source: 'rules/ka/ka-transliteration.js'
		},
		'ka-kbd': {
			name: 'სტანდარტული კლავიატურის',
			source: 'rules/ka/ka-kbd.js'
		},
		'kk-arabic': {
			name: 'Kazakh Arabic transliteration',
			source: 'rules/kk/kk-arabic.js'
		},
		'kk-kbd': {
			name: 'Кирил',
			source: 'rules/kk/kk-kbd.js'
		},
		'km-nidakyk': {
			name: 'ក្តារ​ចុច​យូនីកូដ​ខ្មែរ (NiDA)',
			source: 'rules/km/km-nidakyk.js'
		},
		'kn-inscript': {
			name: 'ಇನ್ಸ್ಕ್ರಿಪ್ಟ್',
			source: 'rules/kn/kn-inscript.js'
		},
		'kn-inscript2': {
			name: 'ಇನ್\u200cಸ್ಕ್ರಿಪ್ಟ್ ೨',
			source: 'rules/kn/kn-inscript2.js'
		},
		'kn-transliteration': {
			name: 'ಲಿಪ್ಯಂತರಣ',
			source: 'rules/kn/kn-transliteration.js'
		},
		'kn-kgp': {
			name: 'KGP/Nudi/KP Rao',
			source: 'rules/kn/kn-kgp.js'
		},
		'ky-cyrl-alt': {
			name: 'Кыргыз Alt',
			source: 'rules/ky/ky-cyrl-alt.js'
		},
		'gom-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/gom/gom-inscript2.js'
		},
		'ks-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/ks/ks-inscript.js'
		},
		'ks-kbd': {
			name: 'Kashmiri Arabic',
			source: 'rules/ks/ks-kbd.js'
		},
		'ku-h': {
			name: 'Kurdî-h',
			source: 'rules/ku/ku-h.js'
		},
		'ku-tr': {
			name: 'Kurdî-tr',
			source: 'rules/ku/ku-tr.js'
		},
		'lo-kbd': {
			name: 'າຶກ',
			source: 'rules/lo/lo-kbd.js'
		},
		'lrc-kbd': {
			name: 'لۊری شومالی',
			source: 'rules/lrc/lrc-kbd.js'
		},
		mh: {
			name: 'Kajin M̧ajeļ',
			source: 'rules/mh/mh.js'
		},
		'mn-cyrl': {
			name: 'Кирилл',
			source: 'rules/mn/mn-cyrl.js'
		},
		'mni-inscript2': {
			name: 'ইনস্ক্ৰিপ্ট ২',
			source: 'rules/mni/mni-inscript2.js'
		},
		'mr-inscript': {
			name: 'मराठी लिपी',
			source: 'rules/mr/mr-inscript.js'
		},
		'mr-inscript2': {
			name: 'मराठी इनस्क्रिप्ट २',
			source: 'rules/mr/mr-inscript2.js'
		},
		'mr-transliteration': {
			name: 'अक्षरांतरण',
			source: 'rules/mr/mr-transliteration.js'
		},
		'mr-phonetic': {
			name: 'फोनेटिक',
			source: 'rules/mr/mr-phonetic.js'
		},
		'my-xkb': {
			name: 'မြန်မာဘာသာ xkb',
			source: 'rules/my/my-xkb.js'
		},
		'ne-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/ne/ne-inscript.js'
		},
		'ne-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/ne/ne-inscript2.js'
		},
		'ne-transliteration': {
			name: 'ट्रांस्लितेरेशन',
			source: 'rules/ne/ne-transliteration.js'
		},
		'ne-rom': {
			name: 'Romanized',
			source: 'rules/ne/ne-rom.js'
		},
		'ne-trad': {
			name: 'Traditional',
			source: 'rules/ne/ne-trad.js'
		},
		'nb-normforms': {
			name: 'Normal transliterasjon',
			source: 'rules/nb/nb-normforms.js'
		},
		'nb-tildeforms': {
			name: 'Tildemerket transliterasjon',
			source: 'rules/nb/nb-tildeforms.js'
		},
		'nn-tildeforms': {
			name: 'Tildemerkt transliterasjon',
			source: 'rules/nb/nb-tildeforms.js'
		},
		'or-transliteration': {
			name: 'ଟ୍ରାନ୍ସଲିଟରେସନ',
			source: 'rules/or/or-transliteration.js'
		},
		'or-OdiScript': {
			name: 'ଓଡ଼ିସ୍କ୍ରିପ୍ଟ',
			source: 'rules/or/or-OdiScript.js'
		},
		'or-inscript': {
			name: 'ଇନସ୍କ୍ରିପ୍ଟ',
			source: 'rules/or/or-inscript.js'
		},
		'or-inscript2': {
			name: 'ଇନସ୍କ୍ରିପ୍ଟ2',
			source: 'rules/or/or-inscript2.js'
		},
		'or-lekhani': {
			name: 'ଲେଖନୀ',
			source: 'rules/or/or-lekhani.js'
		},
		'or-phonetic': {
			name: 'ଫୋନେଟିକ',
			source: 'rules/or/or-phonetic.js'
		},
		'sd-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/sd/sd-inscript2.js'
		},
		'sdh-kbd': {
			name: 'کوردی خوارگ',
			source: 'rules/sdh/sdh-kbd.js'
		},
		'se-normforms': {
			name: 'Normal forms',
			source: 'rules/se/se-normforms.js'
		},
		'sk-kbd': {
			name: 'Štandardná',
			source: 'rules/sk/sk-kbd.js'
		},
		'sr-kbd': {
			name: 'Стандардна',
			source: 'rules/sr/sr-kbd.js'
		},
		'te-inscript': {
			name: 'ఇన్\u200dస్క్రిప్ట్',
			source: 'rules/te/te-inscript.js'
		},
		'te-inscript2': {
			name: 'ఇన్\u200dస్క్రిప్ట్ 2',
			source: 'rules/te/te-inscript2.js'
		},
		'te-apple': {
			name: 'ఆపిల్',
			source: 'rules/te/te-apple.js'
		},'te-modular': {
			name: 'మాడ్యులర్',
			source: 'rules/te/te-modular.js'
		},
		'te-transliteration': {
			name: 'లిప్యంతరీకరణ',
			source: 'rules/te/te-transliteration.js'
		},
		'pa-inscript': {
			name: 'ਇਨਸਕ੍ਰਿਪਟ',
			source: 'rules/pa/pa-inscript.js'
		},
		'pa-inscript2': {
			name: 'ਇਨਸਕ੍ਰਿਪਟ2',
			source: 'rules/pa/pa-inscript2.js'
		},
		'pa-jhelum': {
			name: 'ਜੇਹਲਮ',
			source: 'rules/pa/pa-jhelum.js'
		},
		'pa-transliteration': {
			name: 'ਲਿਪਾਂਤਰਨ',
			source: 'rules/pa/pa-transliteration.js'
		},
		'pa-phonetic': {
			name: 'ਫੋਨੇਟਿਕ',
			source: 'rules/pa/pa-phonetic.js'
		},
		'ru-jcuken': {
			name: 'ЙЦУКЕН',
			source: 'rules/ru/ru-jcuken.js'
		},
		'ru-kbd': {
			name: 'кбд',
			source: 'rules/ru/ru-kbd.js'
		},
		'ru-phonetic': {
			name: 'фонетический',
			source: 'rules/ru/ru-phonetic.js'
		},
		'ru-yawerty': {
			name: 'yawerty',
			source: 'rules/ru/ru-yawerty.js'
		},
		'sa-iast': {
			name: 'Romanized',
			source: 'rules/sa/sa-iast.js'
		},
		'sa-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/sa/sa-inscript.js'
		},
		'sa-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/sa/sa-inscript2.js'
		},
		'sa-transliteration': {
			name: 'लिप्यन्तरणम्',
			source: 'rules/sa/sa-transliteration.js'
		},
		'sah-transliteration': {
			name: 'Transliteration',
			source: 'rules/sah/sah-transliteration.js'
		},
		'sat-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/sat/sat-inscript2.js'
		},
		'sat-inscript2-ol-chiki': {
			name: 'inscript2 ᱚᱞ ᱪᱤᱠᱤ',
			source: 'rules/sat/sat-inscript2-ol-chiki.js'
		},
		'sat-sarjom-baha': {
			name: 'sarjom baha',
			source: 'rules/sat/sat-sarjom-baha.js'
		},
		'si-singlish': {
			name: 'සිංග්ලිෂ්',
			source: 'rules/si/si-singlish.js'
		},
		'si-wijesekara': {
			name: 'විජේසේකර',
			source: 'rules/si/si-wijesekara.js'
		},
		'ur-phonetic': {
			name: 'صوتی',
			source: 'rules/ur/ur-phonetic.js'
		},
		'ur-transliteration': {
			name: 'ٹرانسلٹریشن',
			source: 'rules/ur/ur-transliteration.js'
		},
		'ipa-sil': {
			name: 'International Phonetic Alphabet - SIL',
			source: 'rules/fonipa/ipa-sil.js'
		},
		'ipa-x-sampa': {
			name: 'International Phonetic Alphabet - X-SAMPA',
			source: 'rules/fonipa/ipa-x-sampa.js'
		},
		'udm-alt': {
			name: 'Удмурт ALT',
			source: 'rules/udm/udm-alt.js'
		},
		'uk-kbd': {
			name: 'кбд',
			source: 'rules/uk/uk-kbd.js'
		},
		'ug-kbd': {
			name: 'Uyghur kbd',
			source: 'rules/ug/ug-kbd.js'
		},
		'uz-kbd': {
			name: 'Uzbek kbd',
			source: 'rules/uz/uz-kbd.js'
		},
		'vec-GVU': {
			name: 'Venetian',
			source: 'rules/vec/vec-GVU.js'
		},
		'yo-alt': {
			name: 'Yorùbá Alt',
			source: 'rules/yo/yo-alt.js'
		}
	} );

	$.extend( $.ime.languages, {
		ady: {
			autonym: 'адыгэбзэ',
			inputmethods: [ 'cyrl-palochka' ]
		},
		ahr: {
			autonym: 'अहिराणी',
			inputmethods: [ 'mr-transliteration', 'mr-inscript' ]
		},
		ak: {
			autonym: 'Akan',
			inputmethods: [ 'ak-qx' ]
		},
		am: {
			autonym: 'አማርኛ',
			inputmethods: [ 'am-transliteration' ]
		},
		ar: {
			autonym: 'العربية',
			inputmethods: [ 'ar-kbd' ]
		},
		as: {
			autonym: 'অসমীয়া',
			inputmethods: [ 'as-transliteration', 'as-avro', 'as-bornona', 'as-inscript', 'as-phonetic', 'as-inscript2', 'as-rodali' ]
		},
		av: {
			autonym: 'авар',
			inputmethods: [ 'cyrl-palochka' ]
		},
		azb: {
			autonym: 'تۆرکجه',
			inputmethods: [ 'azb-kbd' ]
		},
		bbc: {
			autonym: 'Batak',
			inputmethods: [ 'batak-qwerty' ]
		},
		be: {
			autonym: 'беларуская',
			inputmethods: [ 'be-transliteration', 'be-latin', 'be-kbd' ]
		},
		'be-tarask': {
			autonym: 'беларуская (тарашкевіца)',
			inputmethods: [ 'be-transliteration', 'be-latin' ]
		},
		bh: {
			autonym: 'भोजपुरी',
			inputmethods: [ 'hi-transliteration' ]
		},
		bgn: {
			autonym: 'روچ کپتین بلوچی',
			inputmethods: [ 'bgn-kbd' ]
		},
		bho: {
			autonym: 'भोजपुरी',
			inputmethods: [ 'hi-transliteration' ]
		},
		bn: {
			autonym: 'বাংলা',
			inputmethods: [ 'bn-avro', 'bn-inscript', 'bn-nkb', 'bn-probhat', 'bn-inscript2' ]
		},
		bo: {
			autonym: 'བོད་ཡིག།',
			inputmethods: [ 'bo-ewts' ]
		},
		brx: {
			autonym: 'बोड़ो',
			inputmethods: [ 'brx-inscript', 'brx-inscript2' ]
		},
		ckb: {
			autonym: 'کوردیی ناوەندی',
			inputmethods: [ 'ckb-transliteration-arkbd', 'ckb-transliteration-fakbd', 'ckb-transliteration-lakbd' ]
		},
		ce: {
			autonym: 'нохчийн',
			inputmethods: [ 'cyrl-palochka' ]
		},
		cv: {
			autonym: 'Чăвашла',
			inputmethods: [ 'cv-cyr-altgr', 'cv-lat-altgr', 'cv-cyr-numbers' ]
		},
		da: {
			autonym: 'Dansk',
			inputmethods: [ 'da-normforms' ]
		},
		de: {
			autonym: 'Deutsch',
			inputmethods: [ 'de-transliteration' ]
		},
		diq: {
			autonym: 'Kirdkî',
			inputmethods: [ 'ku-h', 'ku-tr' ]
		},
		doi: {
			autonym: 'डोगरी',
			inputmethods: [ 'doi-inscript2' ]
		},
		en: {
			autonym: 'English',
			inputmethods: [ 'ipa-sil', 'ipa-x-sampa' ]
		},
		el: {
			autonym: 'Ελληνικά',
			inputmethods: [ 'el-kbd' ]
		},
		eo: {
			autonym: 'Esperanto',
			inputmethods: [ 'eo-transliteration', 'eo-h', 'eo-h-f', 'eo-plena', 'eo-q', 'eo-vi', 'eo-x' ]
		},
		fa: {
			autonym: 'فارسی',
			inputmethods: [ 'fa-kbd' ]
		},
		fo: {
			autonym: 'Føroyskt',
			inputmethods: [ 'fo-normforms' ]
		},
		fi: {
			autonym: 'Suomi',
			inputmethods: [ 'fi-transliteration' ]
		},
		lrc: {
			autonym: 'لۊری شومالی',
			inputmethods: [ 'lrc-kbd' ]
		},
		lud: {
			autonym: 'lüüdi',
			inputmethods: [ 'lud-transliteration' ]
		},
		gom: {
			autonym: 'गोवा कोंकणी / Gova Konknni',
			inputmethods: [ 'hi-transliteration', 'hi-inscript', 'gom-inscript2' ]
		},
		gu: {
			autonym: 'ગુજરાતી',
			inputmethods: [ 'gu-transliteration', 'gu-inscript', 'gu-inscript2', 'gu-phonetic' ]
		},
		he: {
			autonym: 'עברית',
			inputmethods: [ 'he-standard-2012-extonly', 'he-standard-2012' ]
		},
		hi: {
			autonym: 'हिन्दी',
			inputmethods: [ 'hi-transliteration', 'hi-inscript', 'hi-bolnagri', 'hi-phonetic', 'hi-inscript2' ]
		},
		hr: {
			autonym: 'Hrvatski',
			inputmethods: [ 'hr-kbd' ]
		},
		hy: {
			autonym: 'հայերեն',
			inputmethods: [ 'hy-ephonetic', 'hy-typewriter', 'hy-ephoneticalt', 'hy-emslegacy', 'hy-wmslegacy' ]
		},
		hne: {
			autonym: 'छत्तीसगढ़ी',
			inputmethods: [ 'hi-transliteration' ]
		},
		is: {
			autonym: 'Íslenska',
			inputmethods: [ 'is-normforms' ]
		},
		fonipa: {
			autonym: 'International Phonetic Alphabet',
			inputmethods: [ 'ipa-sil', 'ipa-x-sampa' ]
		},
		jv: {
			autonym: 'ꦧꦱꦗꦮ',
			inputmethods: [ 'jv-transliteration' ]
		},
		ka: {
			autonym: 'ქართული ენა',
			inputmethods: [ 'ka-transliteration', 'ka-kbd' ]
		},
		kbd: {
			autonym: 'адыгэбзэ (къэбэрдеибзэ)',
			inputmethods: [ 'cyrl-palochka' ]
		},
		kk: {
			autonym: 'Қазақша',
			inputmethods: [ 'kk-kbd', 'kk-arabic' ]
		},
		km: {
			autonym: 'ភាសា​ខ្មែរ',
			inputmethods: [ 'km-nidakyk' ]
		},
		kn: {
			autonym: 'ಕನ್ನಡ',
			inputmethods: [ 'kn-transliteration', 'kn-inscript', 'kn-kgp', 'kn-inscript2' ]
		},
		ks: {
			autonym: 'कॉशुर / کٲشُر',
			inputmethods: [ 'ks-inscript', 'ks-kbd' ]
		},
		ky: {
			autonym: 'Кыргыз',
			inputmethods: [ 'ky-cyrl-alt' ]
		},
		kab: {
			autonym: 'ⵜⴰⵇⴱⴰⵢⵍⵉⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		ku: {
			autonym: 'Kurdî',
			inputmethods: [ 'ku-h', 'ku-tr' ]
		},
		lbe: {
			autonym: 'лакку',
			inputmethods: [ 'cyrl-palochka' ]
		},
		lez: {
			autonym: 'лезги',
			inputmethods: [ 'cyrl-palochka' ]
		},
		lo: {
			autonym: 'ລາວ',
			inputmethods: [ 'lo-kbd' ]
		},
		mai: {
			autonym: 'मैथिली',
			inputmethods: [ 'mai-inscript', 'mai-inscript2' ]
		},
		mh: {
			autonym: 'Kajin M̧ajeļ',
			inputmethods: [ 'mh' ]
		},
		ml: {
			autonym: 'മലയാളം',
			inputmethods: [ 'ml-transliteration', 'ml-inscript', 'ml-inscript2' ]
		},
		mn: {
			autonym: 'Монгол',
			inputmethods: [ 'mn-cyrl' ]
		},
		mni: {
			autonym: 'Manipuri',
			inputmethods: [ 'mni-inscript2' ]
		},
		mr: {
			autonym: 'मराठी',
			inputmethods: [ 'mr-transliteration', 'mr-inscript2', 'mr-inscript', 'mr-phonetic' ]
		},
		my: {
			autonym: 'မြန်မာ',
			inputmethods: [ 'my-xkb' ]
		},
		ne: {
			autonym: 'नेपाली',
			inputmethods: [ 'ne-transliteration', 'ne-inscript2', 'ne-inscript', 'ne-rom', 'ne-trad' ]
		},
		'new': {
			autonym: 'नेपाल भाषा',
			inputmethods: [ 'hi-transliteration', 'hi-inscript' ]
		},
		nb: {
			autonym: 'Norsk (bokmål)',
			inputmethods: [ 'nb-normforms', 'nb-tildeforms' ]
		},
		nn: {
			autonym: 'Norsk (nynorsk)',
			inputmethods: [ 'nb-normforms', 'nn-tildeforms' ]
		},
		or: {
			autonym: 'ଓଡ଼ିଆ',
			inputmethods: [ 'or-phonetic', 'or-transliteration', 'or-inscript', 'or-inscript2', 'or-lekhani', 'or-OdiScript' ]
		},
		pa: {
			autonym: 'ਪੰਜਾਬੀ',
			inputmethods: [ 'pa-transliteration', 'pa-inscript', 'pa-phonetic', 'pa-inscript2', 'pa-jhelum' ]
		},
		rif: {
			autonym: 'ⵜⴰⵔⵉⴼⵉⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		ru: {
			autonym: 'русский',
			inputmethods: [ 'ru-jcuken', 'ru-kbd', 'ru-phonetic', 'ru-yawerty' ]
		},
		sah: {
			autonym: 'саха тыла',
			inputmethods: [ 'sah-transliteration' ]
		},
		sa: {
			autonym: 'संस्कृत',
			inputmethods: [ 'sa-transliteration', 'sa-inscript2', 'sa-inscript', 'sa-iast' ]
		},
		sat: {
			autonym: 'संताली (ᱥᱟᱱᱛᱟᱞᱤ)',
			inputmethods: [ 'sat-inscript2', 'sat-inscript2-ol-chiki', 'sat-sarjom-baha' ]
		},
		sd: {
			autonym: 'सिंधी',
			inputmethods: [ 'sd-inscript2' ]
		},
		sdh: {
			autonym: 'کوردی خوارگ',
			inputmethods: [ 'sdh-kbd' ]
		},
		se: {
			autonym: 'Davvisámegiella',
			inputmethods: [ 'se-normforms' ]
		},
		shi: {
			autonym: 'ⵜⴰⵛⵍⵃⵉⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		si: {
			autonym: 'සිංහල',
			inputmethods: [ 'si-singlish', 'si-wijesekara' ]
		},
		sk: {
			autonym: 'Slovenčina',
			inputmethods: [ 'sk-kbd' ]
		},
		sr: {
			autonym: 'Српски / srpski',
			inputmethods: [ 'sr-kbd' ]
		},
		sv: {
			autonym: 'Svenska',
			inputmethods: [ 'sv-normforms' ]
		},
		ta: {
			autonym: 'தமிழ்',
			inputmethods: [ 'ta-transliteration', 'ta-99', 'ta-inscript', 'ta-bamini', 'ta-inscript2' ]
		},
		tcy: {
			autonym: 'ತುಳು',
			inputmethods: [ 'kn-transliteration' ]
		},
		te: {
			autonym: 'తెలుగు',
			inputmethods: [ 'te-transliteration', 'te-inscript', 'te-inscript2', 'te-apple', 'te-modular' ]
		},
		th: {
			autonym: 'ไทย',
			inputmethods: [ 'th-kedmanee', 'th-pattachote' ]
		},
		tkr: {
			autonym: 'цӀаӀхна миз',
			inputmethods: [ 'cyrl-palochka' ]
		},
		tzm: {
			autonym: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		udm: {
			autonym: 'удмурт',
			inputmethods: [ 'udm-alt' ]
		},
		uk: {
			autonym: 'Українська',
			inputmethods: [ 'uk-kbd' ]
		},
		ug: {
			autonym: 'ئۇيغۇرچە / Uyghurche',
			inputmethods: [ 'ug-kbd' ]
		},
		ur: {
			autonym: 'اردو',
			inputmethods: [ 'ur-transliteration', 'ur-phonetic' ]
		},
		uz: {
			autonym: 'Oʻzbekcha',
			inputmethods: [ 'uz-kbd' ]
		},
		vec: {
			autonym: 'Venetian',
			inputmethods: [ 'vec-GVU' ]
		},
		yo: {
			autonym: 'Yorùbá',
			inputmethods: [ 'yo-alt' ]
		}
	} );

}( jQuery ) );
