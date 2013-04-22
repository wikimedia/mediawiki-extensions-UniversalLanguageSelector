/*! jquery.ime - v0.1.0 - 2013-04-23
* https://github.com/wikimedia/jquery.ime
* Copyright (c) 2013 Santhosh Thottingal; Licensed GPL, MIT */
( function ( $ ) {
	'use strict';

	function IME( element, options ) {
		this.$element = $( element );
		// This needs to be delayed here since extending language list happens at DOM ready
		$.ime.defaults.languages = arrayKeys( $.ime.languages );
		this.options = $.extend( {}, $.ime.defaults, options );
		this.active = false;
		this.inputmethod = null;
		this.language = null;
		this.context = '';
		this.selector = this.$element.imeselector( this.options );
		this.listen();
	}

	IME.prototype = {
		constructor: IME,

		listen: function () {
			this.$element.on( 'keypress.ime', $.proxy( this.keypress, this ) );
			this.$element.on( 'destroy.ime', $.proxy( this.destroy, this ) );
			this.$element.on( 'enable.ime', $.proxy( this.enable, this ) );
			this.$element.on( 'disable.ime', $.proxy( this.disable, this ) );
		},

		/**
		 * Transliterate a given string input based on context and input method definition.
		 * If there are no matching rules defined, returns the original string.
		 *
		 * @param input
		 * @param context
		 * @param altGr bool whether altGr key is pressed or not
		 * @returns String transliterated string
		 */
		transliterate: function ( input, context, altGr ) {
			var patterns, regex, rule, replacement, i;

			if ( altGr ) {
				patterns = this.inputmethod.patterns_x || [];
			} else {
				patterns = this.inputmethod.patterns;
			}

			if ( $.isFunction( patterns ) ) {
				return patterns.call( this, input, context );
			}

			for ( i = 0; i < patterns.length; i++ ) {
				rule = patterns[i];
				regex = new RegExp( rule[0] + '$' );

				// Last item in the rules.
				// It can also be a function, because the replace
				// method can have a function as the second argument.
				replacement = rule.slice( -1 )[0];

				// Input string match test
				if ( regex.test( input ) ) {
					// Context test required?
					if ( rule.length === 3 ) {
						if ( new RegExp( rule[1] + '$' ).test( context ) ) {
							return input.replace( regex, replacement );
						}
					} else {
						// No context test required. Just replace.
						return input.replace( regex, replacement );
					}
				}
			}

			// No matches, return the input
			return input;
		},

		keypress: function ( e ) {
			var altGr = false,
				c, startPos, pos, endPos, divergingPos, input, replacement;

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

			// Don't process ASCII control characters (except linefeed),
			// as well as anything involving
			// Alt (except for extended keymaps), Ctrl and Meta
			if ( ( e.which < 32 && e.which !== 13 && !altGr ) || e.ctrlKey || e.metaKey ) {
				// Blank the context
				this.context = '';

				return true;
			}

			c = String.fromCharCode( e.which );

			// Get the current caret position. The user may have selected text to overwrite,
			// so get both the start and end position of the selection. If there is no selection,
			// startPos and endPos will be equal.
			pos = this.getCaretPosition( this.$element );
			startPos = pos[0];
			endPos = pos[1];

			// Get the last few characters before the one the user just typed,
			// to provide context for the transliteration regexes.
			// We need to append c because it hasn't been added to $this.val() yet
			input = this.lastNChars( this.$element.val() || this.$element.text(), startPos,
					this.inputmethod.maxKeyLength )
					+ c;

			replacement = this.transliterate( input, this.context, altGr );

			// Update the context
			this.context += c;

			if ( this.context.length > this.inputmethod.contextLength ) {
				// The buffer is longer than needed, truncate it at the front
				this.context = this.context.substring( this.context.length
						- this.inputmethod.contextLength );
			}

			// If replacement equals to input, no replacement is made, because
			// there's apparently nothing to do. However, there may be something
			// to do if AltGr was pressed. For example, if a layout is built in
			// a way that allows typing the original character instead of
			// the replacement by pressing it with AltGr.
			if ( !altGr && replacement === input ) {
				return true;
			}

			// Drop a common prefix, if any
			divergingPos = this.firstDivergence( input, replacement );
			input = input.substring( divergingPos );
			replacement = replacement.substring( divergingPos );
			replaceText( this.$element, replacement, startPos - input.length + 1, endPos );

			e.stopPropagation();
			return false;
		},

		isActive: function () {
			return this.active;
		},

		disable: function () {
			this.active = false;
			$.ime.preferences.setIM( 'system' );
		},

		enable: function () {
			this.active = true;
		},

		toggle: function () {
			this.active = !this.active;
		},

		destroy: function () {
			$( 'body' ).off( '.ime' );
			this.$element.off( '.ime' ).removeData( 'ime' ).removeData( 'imeselector' );
		},

		getIM: function () {
			return this.inputmethod;
		},

		setIM: function ( inputmethodId ) {
			this.inputmethod = $.ime.inputmethods[inputmethodId];
			$.ime.preferences.setIM( inputmethodId );
		},

		setLanguage: function ( languageCode ) {
			if ( $.inArray( languageCode, this.options.languages ) === -1 ) {
				debug( 'Language ' + languageCode + ' is not known to jquery.ime.' );
				return false;
			}

			this.language = languageCode;
			$.ime.preferences.setLanguage( languageCode );
			return true;
		},

		getLanguage: function () {
			return this.language;
		},

		load: function ( name, callback ) {
			var ime = this,
				dependency;

			if ( $.ime.inputmethods[name] ) {
				if ( callback ) {
					callback.call( ime );
				}

				return true;
			}

			dependency = $.ime.sources[name].depends;
			if ( dependency ) {
				this.load( dependency ) ;
			}

			$.ajax( {
				url: ime.options.imePath + $.ime.sources[name].source,
				dataType: 'script'
			} ).done( function () {
				debug( name + ' loaded' );

				if ( callback ) {
					callback.call( ime );
				}
			} ).fail( function ( jqxhr, settings, exception ) {
				debug( 'Error in loading inputmethod ' + name + ' Exception: ' + exception );
			} );
		},

		// Returns an array [start, end] of the beginning
		// and the end of the current selection in $element
		getCaretPosition: function ( $element ) {
			return getCaretPosition( $element );
		},

		/**
		 * Find the point at which a and b diverge, i.e. the first position
		 * at which they don't have matching characters.
		 *
		 * @param a String
		 * @param b String
		 * @return Position at which a and b diverge, or -1 if a === b
		 */
		firstDivergence: function ( a, b ) {
			return firstDivergence( a, b );
		},

		/**
		 * Get the n characters in str that immediately precede pos
		 * Example: lastNChars( 'foobarbaz', 5, 2 ) === 'ba'
		 *
		 * @param str String to search in
		 * @param pos Position in str
		 * @param n Number of characters to go back from pos
		 * @return Substring of str, at most n characters long, immediately preceding pos
		 */
		lastNChars: function ( str, pos, n ) {
			return lastNChars( str, pos, n );
		}
	};

	$.fn.ime = function ( option ) {
		return this.each( function () {
			var data,
				$this = $( this ),
				options = typeof option === 'object' && option;

			// Some exclusions: IME shouldn't be applied to textareas with
			// these properties.
			if ( $this.prop( 'readonly' ) ||
				$this.prop( 'disabled' ) ||
				$this.hasClass( 'noime' ) ) {
				return;
			}

			data = $this.data( 'ime' );

			if ( !data ) {
				data = new IME( this, options );
				$this.data( 'ime', data );
			}

			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.ime = {};
	$.ime.inputmethods = {};
	$.ime.sources = {};
	$.ime.preferences = {};
	$.ime.languages = {};

	var defaultInputMethod = {
		contextLength: 0,
		maxKeyLength: 1
	};

	$.ime.register = function ( inputMethod ) {
		$.ime.inputmethods[inputMethod.id] = $.extend( {}, defaultInputMethod, inputMethod );
	};

	// default options
	$.ime.defaults = {
		imePath: '../', // Relative/Absolute path for the rules folder of jquery.ime
		languages: [] // Languages to be used- by default all languages
	};

	// private function for debugging
	function debug( $obj ) {
		if ( window.console && window.console.log ) {
			window.console.log( $obj );
		}
	}

	// Returns an array [start, end] of the beginning
	// and the end of the current selection in $element
	function getCaretPosition( $element ) {
		var el = $element.get( 0 ),
			start = 0,
			end = 0,
			normalizedValue,
			range,
			textInputRange,
			len,
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

				// Create a working TextRange that lives only in the input
				textInputRange = el.createTextRange();
				textInputRange.moveToBookmark( range.getBookmark() );

				// Check if the start and end of the selection are at the very end
				// of the input, since moveStart/moveEnd doesn't return what we want
				// in those cases
				endRange = el.createTextRange();
				endRange.collapse( false );

				if ( textInputRange.compareEndPoints( 'StartToEnd', endRange ) > -1 ) {
					start = end = len;
				} else {
					start = -textInputRange.moveStart( 'character', -len );
					start += normalizedValue.slice( 0, start ).split( '\n' ).length - 1;

					if ( textInputRange.compareEndPoints( 'EndToEnd', endRange ) > -1 ) {
						end = len;
					} else {
						end = -textInputRange.moveEnd( 'character', -len );
						end += normalizedValue.slice( 0, end ).split( '\n' ).length - 1;
					}
				}
			}
		}

		return [ start, end ];
	}

	/**
	 * Helper function to get an IE TextRange object for an element
	 */
	function rangeForElementIE( e ) {
		if ( e.nodeName.toLowerCase() === 'input' ) {
			return e.createTextRange();
		} else {
			var sel = document.body.createTextRange();

			sel.moveToElementText( e );
			return sel;
		}
	}

	function replaceText( $element, replacement, start, end ) {
		var element = $element.get( 0 ),
			selection,
			length,
			newLines,
			scrollTop;

		if ( document.body.createTextRange ) {
			// IE
			selection = rangeForElementIE(element);
			length = element.value.length;
			// IE doesn't count \n when computing the offset, so we won't either
			newLines = element.value.match( /\n/g );

			if ( newLines ) {
				length = length - newLines.length;
			}

			selection.moveStart( 'character', start );
			selection.moveEnd( 'character', end - length );

			selection.text = replacement;
			selection.collapse( false );
			selection.select();
		} else {
			// All other browsers
			scrollTop = element.scrollTop;

			// This could be made better if range selection worked on browsers.
			// But for complex scripts, browsers place cursor in unexpected places
			// and it's not possible to fix cursor programmatically.
			// Ref Bug https://bugs.webkit.org/show_bug.cgi?id=66630
			element.value = element.value.substring( 0, start ) + replacement
					+ element.value.substring( end, element.value.length );
			// restore scroll
			element.scrollTop = scrollTop;
			// set selection
			element.selectionStart = element.selectionEnd = start + replacement.length;
		}
	}

	/**
	 * Find the point at which a and b diverge, i.e. the first position
	 * at which they don't have matching characters.
	 *
	 * @param a String
	 * @param b String
	 * @return Position at which a and b diverge, or -1 if a === b
	 */
	function firstDivergence( a, b ) {
		var minLength, i;

		minLength = a.length < b.length ? a.length : b.length;

		for ( i = 0; i < minLength; i++ ) {
			if ( a.charCodeAt( i ) !== b.charCodeAt( i ) ) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Get the n characters in str that immediately precede pos
	 * Example: lastNChars( 'foobarbaz', 5, 2 ) === 'ba'
	 *
	 * @param str String to search in
	 * @param pos Position in str
	 * @param n Number of characters to go back from pos
	 * @return Substring of str, at most n characters long, immediately preceding pos
	 */
	function lastNChars( str, pos, n ) {
		if ( n === 0 ) {
			return '';
		} else if ( pos <= n ) {
			return str.substr( 0, pos );
		} else {
			return str.substr( pos - n, n );
		}
	}

	function arrayKeys ( obj ) {
		var rv = [];
		$.each( obj, function ( key ) {
			rv.push( key );
		} );
		return rv;
	}
}( jQuery ) );

( function ( $ ) {
	'use strict';

	function IMESelector ( element, options ) {
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
			this.$menu.append( imeListTitle() )
				.append( imeList() )
				.append( toggleMenuItem() )
				.append( languageListTitle() );
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
						'opacity': 0,
						'marginTop': '-20px'
					}, 500, function () {
						imeselector.$imeSetting.hide();
						// Restore properties for next time it becomes visible:
						imeselector.$imeSetting.css( 'opacity', 1 );
						imeselector.$imeSetting.css( 'margin-top', 0 );
					} );
				}, 2500 );
		},

		focus: function () {
			// Hide all other IME settings and collapse open menus
			$( 'div.imeselector' ).hide();
			$( 'div.imeselector-menu' ).removeClass( 'open' );
			this.$imeSetting.show();
			this.resetTimer();
		},

		show: function () {
			this.$menu.addClass( 'open' );
			this.stopTimer();
			this.$imeSetting.show();
			return false;
		},

		hide: function () {
			this.$menu.removeClass( 'open' );
			this.resetTimer();
			return false;
		},

		toggle: function () {
			if ( this.$menu.hasClass( 'open' ) ) {
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
			} );

			imeselector.$element.on( 'blur.ime', function () {
				if ( !imeselector.$imeSetting.hasClass( 'onfocus' ) ) {
					imeselector.$imeSetting.hide();
					imeselector.hide();
				}
			} );

			imeselector.$imeSetting.mouseenter( function () {
				// We don't want the selector to disappear while the user is trying to click it
				imeselector.stopTimer();
				imeselector.$imeSetting.addClass( 'onfocus' );
			} ).mouseleave( function () {
				imeselector.resetTimer();
				imeselector.$imeSetting.removeClass( 'onfocus' );
			} );

			imeselector.$menu.on( 'click.ime', 'li', function() {
				imeselector.$element.focus();
			});

			imeselector.$menu.on( 'click.ime', 'li.ime-im', function ( e ) {
				imeselector.selectIM( $( this ).data( 'ime-inputmethod' ) );
				e.stopPropagation();
			} );

			imeselector.$menu.on( 'click.ime', 'li.ime-lang', function ( e ) {
				imeselector.selectLanguage( $( this ).attr( 'lang' ) );
				e.stopPropagation();
				e.preventDefault();
			} );

			imeselector.$menu.on( 'click.ime', 'div.ime-disable', function ( e ) {
				imeselector.disableIM();
				e.stopPropagation();
				e.preventDefault();
			} );

			imeselector.$element.on( 'focus.ime', function ( e ) {
				imeselector.selectLanguage( imeselector.decideLanguage() );
				imeselector.focus();
				e.stopPropagation();
			} );

			imeselector.$element.attrchange( function ( ) {
				if( imeselector.$element.is( ':hidden') ) {
					imeselector.$imeSetting.hide();
				}
			} );

			// Possible resize of textarea
			imeselector.$element.on( 'mouseup.ime', $.proxy( this.position, this ) );
			imeselector.$element.on( 'keydown.ime', $.proxy( this.keydown, this ) );
		},

		/**
		 * Keydown event handler. Handles shortcut key presses
		 *
		 * @context {HTMLElement}
		 * @param {jQuery.Event} e
		 */
		keydown: function ( e ) {
			var ime = $( e.target ).data( 'ime' );
			this.focus(); // shows the trigger in case it is hidden
			if ( isShortcutKey( e ) ) {
				if ( ime.isActive() ) {
					this.disableIM();
				} else {
					if ( this.inputmethod !== null ) {
						this.selectIM( this.inputmethod.id );
					} else {
						this.selectLanguage( this.decideLanguage() );
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
			this.focus();  // shows the trigger in case it is hidden
			var imeSelector = this,
				position, top, left, room;

			position = this.$element.offset();
			top = position.top + this.$element.outerHeight();
			left = position.left + this.$element.outerWidth()
				- this.$imeSetting.outerWidth();
			room = $( window ).height() - top;

			if ( room < this.$imeSetting.outerHeight() ) {
				top = position.top - this.$imeSetting.outerHeight();

				this.$menu.css( 'top',
						- ( this.$menu.outerHeight() +
						this.$imeSetting.outerHeight() )
					)
					.addClass( 'position-top' );
			}

			this.$element.parents().each( function() {
				if ( $( this ).css( 'position' ) === 'fixed' ) {
					imeSelector.$imeSetting.css( 'position', 'fixed' );
					return false;
				}
			} );

			this.$imeSetting.css( {
				top: top,
				left: left
			} );

			if ( parseInt( this.$menu.css( 'min-width' ) ) > left ) {
				this.$menu
					.css( { left: position.left } )
					.addClass( 'right' );
			}
		},

		/**
		 * Select a language
		 *
		 * @param languageCode
		 */
		selectLanguage: function ( languageCode ) {
			var language, ime;

			ime = this.$element.data( 'ime' );
			language = $.ime.languages[languageCode];

			if ( !language ) {
				return false;
			}

			if ( ime.getLanguage() === languageCode ) {
				// nothing to do. It is same as the current language
				return false;
			}

			this.$menu.find( 'li.ime-lang' ).show();
			this.$menu.find( 'li[lang=' + languageCode + ']' ).hide();

			this.$menu.find( '.ime-list-title' ).text( language.autonym );
			this.prepareInputMethods( languageCode );
			this.hide();
			// And select the default inputmethod
			ime.setLanguage( languageCode );
			this.inputmethod = null;
			this.selectIM( $.ime.preferences.getIM( languageCode ) );
		},

		/**
		 * Decide on initial language to select
		 *
		 */
		decideLanguage : function () {
			if( $.ime.preferences.getLanguage() ) {
				// There has been an override by the user return the language selected by user
				return $.ime.preferences.getLanguage();
			}
			if ( this.$element.attr('lang') &&
				$.ime.languages[this.$element.attr('lang')] ) {
					return this.$element.attr('lang');
			}
			// There is either no IMs for the given language attr or there is no lang attr at all.
			return $.ime.preferences.getDefaultLanguage();
		},

		/**
		 * Select an input method
		 *
		 * @param inputmethodId
		 */
		selectIM: function ( inputmethodId ) {
			var imeselector = this,
				ime;

			this.$menu.find( '.checked' ).removeClass( 'checked' );
			this.$menu.find( 'li.ime-disable' ).removeClass( 'checked' );
			this.$menu.find( 'li[data-ime-inputmethod=' + inputmethodId + ']' )
				.addClass( 'checked' );
			ime = this.$element.data( 'ime' );

			if ( inputmethodId === 'system' ) {
				this.disableIM();
				return;
			}

			if ( !inputmethodId ) {
				return;
			}

			ime.load( inputmethodId, function () {
				var name;

				imeselector.inputmethod = $.ime.inputmethods[inputmethodId];
				imeselector.hide();
				ime.enable();
				name = imeselector.inputmethod.name;
				ime.setIM( inputmethodId );
				imeselector.$imeSetting.find( 'a.ime-name' ).text( name );

				imeselector.position();

				// save this preference
				$.ime.preferences.save();
			} );
		},

		/**
		 * Disable the inputmethods (Use the system input method)
		 */
		disableIM: function () {
			this.$menu.find( '.checked' ).removeClass( 'checked' );
			this.$menu.find( 'div.ime-disable' ).addClass( 'checked' );
			this.$element.data( 'ime' ).disable();
			this.$imeSetting.find( 'a.ime-name' ).text( '' );
			this.hide();
			this.position();

			// save this preference
			$.ime.preferences.save();
		},

		/**
		 * Prepare language list
		 */
		prepareLanguageList: function () {
			var languageCodeIndex = 0,
				$languageListWrapper,
				$languageList,
				languageList,
				$languageItem,
				$language,
				languageCode,
				language;

			// Language list can be very long. So we use a container with
			// overflow auto.
			$languageListWrapper = $( '<div class="ime-language-list-wrapper">' );
			$languageList = $( '<ul class="ime-language-list">' );

			if ( $.isFunction( this.options.languages ) ) {
				languageList = this.options.languages();
			} else {
				languageList = this.options.languages;
			}

			for ( languageCodeIndex in languageList ) {
				languageCode = languageList[languageCodeIndex];
				language = $.ime.languages[languageCode];

				if ( !language ) {
					continue;
				}

				$languageItem = $( '<a>' ).attr( 'href', '#' ).text( language.autonym );
				$language = $( '<li class="ime-lang">' ).attr( 'lang', languageCode );
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
		 * @param languageCode
		 */
		prepareInputMethods: function ( languageCode ) {
			var language = $.ime.languages[languageCode],
				$imeList = this.$menu.find( '.ime-list' );

			$imeList.empty();

			$.each( language.inputmethods, function ( index, inputmethod ) {
				var name = $.ime.sources[inputmethod].name,
					$imeItem = $( '<a>' ).attr( 'href', '#' ).text( name ),
					$inputMethod = $( '<li data-ime-inputmethod=' + inputmethod + '>' );

				$inputMethod.append( '<span class="ime-im-check">' ).append( $imeItem );
				$inputMethod.addClass( 'ime-im' );
				$imeList.append( $inputMethod );
			} );
		},

		helpLink: function () {
			return $( '<div class="ime-help-link">' )
				.append( $( '<a>' ).text( 'Help' )
					.attr( {
						'href': 'http://github.com/wikimedia/jquery.ime',
						'target': '_blank',
						'data-i18n': 'jquery-ime-help'
					} )
				);
		}
	};

	IMESelector.defaults = {
		defaultLanguage: 'en'
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
				data[options].call( $this );
			}
		} );
	};

	$.fn.imeselector.Constructor = IMESelector;

	function languageListTitle () {
		return $( '<h3>' )
			.addClass( 'ime-lang-title' )
			.attr( 'data-i18n', 'jquery-ime-other-languages' )
			.text( 'Other languages' );
	}

	function imeList () {
		return  $( '<ul>' ).addClass( 'ime-list' );
	}

	function imeListTitle () {
		return  $( '<h3>' ).addClass( 'ime-list-title' );
	}

	function toggleMenuItem () {
		return $( '<div class="ime-disable">' )
			.append( $( '<span>' )
				.attr( {
					'class': 'ime-disable-link',
					'data-i18n': 'jquery-ime-disable-text'
				} )
				.text( 'System input method' )
			).append( $( '<span>' )
				.addClass( 'ime-disable-shortcut' )
				.text( 'CTRL+M' )
			);
	}

	var selectorTemplate = '<div class="imeselector imeselector-toggle">'
		+ '<a class="ime-name imeselector-toggle" href="#"></a>'
		+ '<b class="ime-setting-caret imeselector-toggle"></b></div>',

		MutationObserver = window.MutationObserver || window.WebKitMutationObserver
		|| window.MozMutationObserver;

	/**
	 * Check whether a keypress event corresponds to the shortcut key
	 *
	 * @param event Event object
	 * @return bool
	 */
	function isShortcutKey ( event ) {
		// 77 - The letter M, for Ctrl-M
		// 13 - The Enter key
		return event.ctrlKey && ( event.which === 77 || event.which === 13 );
	}

	function isDOMAttrModifiedSupported () {
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
		if ( MutationObserver ) {
			var observer,
				options = {
				subtree: false,
				attributes: true
			};

			observer = new MutationObserver( function ( mutations ) {
				mutations.forEach( function ( e ) {
					callback.call( e.target, e.attributeName );
				} );
			} );

			return this.each( function () {
				observer.observe( this, options );
			} );

		} else if ( isDOMAttrModifiedSupported() ) {
			return this.on( 'DOMAttrModified', function ( e ) {
				callback.call( this, e.attrName );
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
			language : null,
			previousLanguages: [], // array of previous languages
			imes: {
				'en': 'system'
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
				this.registry.previousLanguages.push( language );
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

		// Set the given IM as the last used for the language
		setIM: function ( inputMethod ) {
			if ( !this.registry.imes ) {
				this.registry.imes = {};
			}

			// Do nothing if there's no actual change
			if ( inputMethod === this.registry.imes[this.registry.language] ) {
				return;
			}

			this.registry.imes[this.getLanguage()] = inputMethod;
			this.registry.isDirty = true;
		},

		// Return the last used or the default IM for language
		getIM: function ( language ) {
			if ( !this.registry.imes ) {
				this.registry.imes = {};
			}
			return this.registry.imes[language] || $.ime.languages[language].inputmethods[0];
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
			name: 'ইন্‌স্ক্ৰিপ্ত',
			source: 'rules/as/as-inscript.js'
		},
		'as-inscript2': {
			name: 'ইন্‌স্ক্ৰিপ্ত ২',
			source: 'rules/as/as-inscript2.js'
		},
		'as-phonetic': {
			name: 'ফনেটিক',
			source: 'rules/as/as-phonetic.js'
		},
		'as-transliteration': {
			name: 'প্ৰতিৰূপান্তৰণ',
			source: 'rules/as/as-transliteration.js'
		},
		'be-kbd': {
			name: 'кбд',
			source: 'rules/be/be-kbd.js'
		},
		'be-latin': {
			name: 'Łacinka',
			source: 'rules/be/be-latin.js'
		},
		'be-transliteration': {
			name: 'Транслітератыён',
			source: 'rules/be/be-transliteration.js'
		},
		'ber-tfng': {
			name: 'Tifinagh',
			source: 'rules/ber/ber-tfng.js'
		},
		'bn-avro': {
			name: 'অভ্র',
			source: 'rules/bn/bn-avro.js'
		},
		'bn-inscript': {
			name: 'ইন্‌স্ক্ৰিপ্ত',
			source: 'rules/bn/bn-inscript.js'
		},
		'bn-inscript2': {
			name: 'ইন্‌স্ক্ৰিপ্ত ২',
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
		'brx-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/brx/brx-inscript.js'
		},
		'brx-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/brx/brx-inscript2.js'
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
		'fo-normforms': {
			name: 'Føroyskt',
			source: 'rules/fo/fo-normforms.js'
		},
		'fi-transliteration': {
			name: 'translitterointi',
			source: 'rules/fi/fi-transliteration.js'
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
		'de': {
			name: 'Deutsch',
			source: 'rules/de/de.js'
		},
		'el-kbd': {
			name: 'κπδ',
			source: 'rules/el/el-kbd.js'
		},
		'he-standard-2012': {
			name: 'חברו 2012 ( פרום אנגליש )',
			source: 'rules/he/he-standard-2012.js'
		},
		'he-standard-2012-extonly': {
			name: 'חברו 2012',
			source: 'rules/he/he-standard-2012-extonly.js'
		},
		'he-kbd': {
			name: 'כבד',
			source: 'rules/he/he-kbd.js'
		},
		'hr-kbd': {
			name: 'Croatian kbd',
			source: 'rules/hr/hr-kbd.js'
		},
		'hy-kbd': {
			name: 'կբդ',
			source: 'rules/hy/hy-kbd.js'
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
			name: 'લિપ્યાંતરણ',
			source: 'rules/gu/gu-transliteration.js'
		},
		'ka-transliteration': {
			name: 'ტრანსლიტერაცია',
			source: 'rules/ka/ka-transliteration.js'
		},
		'ka-kbd': {
			name: 'კბდ',
			source: 'rules/ka/ka-kbd.js'
		},
		'kk-arabic': {
			name: 'كذاك أرابيك ',
			source: 'rules/kk/kk-arabic.js'
		},
		'kk-kbd': {
			name: 'лив',
			source: 'rules/kk/kk-kbd.js'
		},
		'kn-inscript': {
			name: 'ಇನ್ಸ್ಕ್ರಿಪ್ಟ್',
			source: 'rules/kn/kn-inscript.js'
		},
		'kn-inscript2': {
			name: 'ಇನ್‌ಸ್ಕ್ರಿಪ್ಟ್ ೨',
			source: 'rules/kn/kn-inscript2.js'
		},
		'kn-transliteration': {
			name: 'எழுத்துப்பெயர்ப்பு',
			source: 'rules/kn/kn-transliteration.js'
		},
		'kn-kgp': {
			name: 'KGP/Nudi/KP Rao',
			source: 'rules/kn/kn-kgp.js'
		},
		'kok-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/kok/kok-inscript2.js'
		},
		'ks-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/ks/ks-inscript.js'
		},
		'ks-kbd': {
			name: 'kbd',
			source: 'rules/ks/ks-kbd.js'
		},
		'lo-kbd': {
			name: 'າຶກ',
			source: 'rules/lo/lo-kbd.js'
		},
		'mh': {
			name: 'Kajin M̧ajeļ',
			source: 'rules/mh/mh.js'
		},
		'mn-cyrl': {
			name: 'Кирилл',
			source: 'rules/mn/mn-cyrl.js'
		},
		'mni-inscript2': {
			name: 'ইন্‌স্ক্ৰিপ্ত ২',
			source: 'rules/mni/mni-inscript2.js'
		},
		'mr-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/mr/mr-inscript.js'
		},
		'mr-inscript2': {
			name: 'इनस्क्रिप्ट २',
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
		'my-kbd': {
			name: 'Burmese kbd',
			source: 'rules/my/my-kbd.js'
		},
		'my-xkb': {
				name: 'Burmese xkb',
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
		'no-normforms': {
			name: 'Normal transliterasjon',
			source: 'rules/no/no-normforms.js'
		},
		'no-tildeforms': {
			name: 'Tildemerket transliterasjon',
			source: 'rules/no/no-tildeforms.js'
		},
		'or-transliteration': {
			name: 'ଟରନସଲିତେରତିଓନ',
			source: 'rules/or/or-transliteration.js'
		},
		'or-inscript': {
			name: 'ଈନସକରିପତ',
			source: 'rules/or/or-inscript.js'
		},
		'or-inscript2': {
			name: 'ଈନସକରିପତ2',
			source: 'rules/or/or-inscript2.js'
		},
		'or-lekhani': {
			name: 'ଲେଖନୀ',
			source: 'rules/or/or-lekhani.js'
		},
		'or-phonetic': {
			name: 'ହୋନେତିକ',
			source: 'rules/or/or-phonetic.js'
		},
		'sd-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/sd/sd-inscript2.js'
		},
		'se-normforms': {
			name: 'Normal forms',
			source: 'rules/se/se-normforms.js'
		},
		'sk-kbd': {
			name: 'Slovak kbd',
			source: 'rules/sk/sk-kbd.js'
		},
		'sr-kbd': {
			name: 'кбд',
			source: 'rules/sr/sr-kbd.js'
		},
		'te-inscript': {
			name: 'ఇన్‍స్క్రిప్ట్',
			source: 'rules/te/te-inscript.js'
		},
		'te-inscript2': {
			name: 'ఇన్‍స్క్రిప్ట్ 2',
			source: 'rules/te/te-inscript2.js'
		},
		'te-transliteration': {
			name: 'లిప్యంతరీకరణ',
			source: 'rules/te/te-transliteration.js'
		},
		'pa-inscript': {
			name: 'ਇਨਸ੍ਕ੍ਰਿਪ੍ਟ',
			source: 'rules/pa/pa-inscript.js'
		},
		'pa-inscript2': {
			name: 'ਇਨਸ੍ਕ੍ਰਿਪ੍ਟ2',
			source: 'rules/pa/pa-inscript2.js'
		},
		'pa-jhelum': {
			name: 'ਜੇਹਲਮ',
			source: 'rules/pa/pa-jhelum.js'
		},
		'pa-transliteration': {
			name: 'ਤ੍ਰਾਨ੍ਸ੍ਲਿਤੇਰਾਤਿਓਂ',
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
		'sa-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/sa/sa-inscript.js'
		},
		'sa-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/sa/sa-inscript2.js'
		},
		'sa-transliteration': {
			name: 'ट्रन्स्लितेरतिओन्',
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
		}
	} );

	$.extend( $.ime.languages, {
		'ady': {
			autonym: 'адыгэбзэ',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'ahr': {
			autonym: 'अहिराणी',
			inputmethods: [ 'mr-transliteration', 'mr-inscript' ]
		},
		'am': {
			autonym: 'አማርኛ',
			inputmethods: [ 'am-transliteration' ]
		},
		'ar': {
			autonym: 'العربية',
			inputmethods: [ 'ar-kbd' ]
		},
		'as': {
			autonym: 'অসমীয়া',
			inputmethods: [ 'as-transliteration', 'as-avro', 'as-bornona', 'as-inscript', 'as-phonetic', 'as-inscript2' ]
		},
		'av': {
			autonym: 'авар',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'be': {
			autonym: 'беларуская',
			inputmethods: [ 'be-transliteration', 'be-latin', 'be-kbd' ]
		},
		'be-tarask': {
			autonym: 'беларуская (тарашкевіца)',
			inputmethods: [ 'be-transliteration', 'be-latin' ]
		},
		'bh': {
			autonym: 'भोजपुरी',
			inputmethods: [ 'hi-transliteration' ]
		},
		'bho': {
			autonym: 'भोजपुरी',
			inputmethods: [ 'hi-transliteration' ]
		},
		'bn': {
			autonym: 'বাংলা',
			inputmethods: [ 'bn-avro', 'bn-inscript', 'bn-nkb', 'bn-probhat', 'bn-inscript2' ]
		},
		'brx': {
			autonym: 'बोड़ो',
			inputmethods: [ 'brx-inscript', 'brx-inscript2' ]
		},
		'ce': {
			autonym: 'нохчийн',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'da': {
			autonym: 'Dansk',
			inputmethods: [ 'da-normforms' ]
		},
		'de': {
			autonym: 'Deutsch',
			inputmethods: [ 'de' ]
		},
		'doi': {
			autonym: 'डोगरी',
			inputmethods: [ 'doi-inscript2' ]
		},
		'en': {
			autonym: 'English',
			inputmethods: [ 'ipa-sil' ]
		},
		'el': {
			autonym: 'Ελληνικά',
			inputmethods: [ 'el-kbd' ]
		},
		'eo': {
			autonym: 'Esperanto',
			inputmethods: [ 'eo-transliteration', 'eo-h', 'eo-h-f', 'eo-plena', 'eo-q', 'eo-vi', 'eo-x' ]
		},
		'fo': {
			autonym: 'Føroyskt',
			inputmethods: [ 'fo-normforms' ]
		},
		'fi': {
			autonym: 'Suomi',
			inputmethods: [ 'fi-transliteration' ]
		},
		'gom': {
			autonym: 'कोंकणी',
			inputmethods: [ 'hi-transliteration', 'hi-inscript' ]
		},
		'gu': {
			autonym: 'ગુજરાતી',
			inputmethods: [ 'gu-transliteration', 'gu-inscript', 'gu-inscript2', 'gu-phonetic' ]
		},
		'he': {
			autonym: 'עברית',
			inputmethods: [ 'he-standard-2012-extonly', 'he-standard-2012', 'he-kbd' ]
		},
		'hi': {
			autonym: 'हिन्दी',
			inputmethods: [ 'hi-transliteration', 'hi-inscript', 'hi-bolnagri', 'hi-phonetic', 'hi-inscript2' ]
		},
		'hr': {
			autonym: 'Hrvatski',
			inputmethods: [ 'hr-kbd' ]
		},
		'hy': {
			autonym: 'Հայերեն',
			inputmethods: [ 'hy-kbd' ]
		},
		'hne': {
			autonym: 'छत्तीसगढ़ी',
			inputmethods: [ 'hi-transliteration' ]
		},
		'is': {
			autonym: 'Íslenska',
			inputmethods: [ 'is-normforms' ]
		},
		'fonipa': {
			autonym: 'International Phonetic Alphabet',
			inputmethods: [ 'ipa-sil' ]
		},
		'jv': {
			autonym: 'ꦧꦱꦗꦮ',
			inputmethods: [ 'jv-transliteration' ]
		},
		'ka': {
			autonym: 'ქართული ენა',
			inputmethods: [ 'ka-transliteration', 'ka-kbd' ]
		},
		'kbd': {
			autonym: 'адыгэбзэ (къэбэрдеибзэ)',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'kk': {
			autonym: 'Қазақша',
			inputmethods: [ 'kk-kbd', 'kk-arabic' ]
		},
		'kn': {
			autonym: 'ಕನ್ನಡ',
			inputmethods: [ 'kn-transliteration', 'kn-inscript', 'kn-kgp', 'kn-inscript2' ]
		},
		'ks': {
			autonym: 'कॉशुर / کٲشُر',
			inputmethods: [ 'ks-inscript', 'ks-kbd' ]
		},
		'kab': {
			autonym: 'ⵜⴰⵇⴱⴰⵢⵍⵉⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		'kok': {
			autonym: 'कोंकणी',
			inputmethods: [ 'kok-inscript2' ]
		},
		'lbe': {
			autonym: 'лакку',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'lez': {
			autonym: 'лезги',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'lo': {
			autonym: 'ລາວ',
			inputmethods: [ 'lo-kbd' ]
		},
		'mai': {
			autonym: 'मैथिली',
			inputmethods: [ 'mai-inscript', 'mai-inscript2' ]
		},
		'mh': {
			autonym: 'Kajin M̧ajeļ',
			inputmethods: [ 'mh' ]
		},
		'ml': {
			autonym: 'മലയാളം',
			inputmethods: [ 'ml-transliteration', 'ml-inscript', 'ml-inscript2' ]
		},
		'mn': {
			autonym: 'Монгол',
			inputmethods: [ 'mn-cyrl' ]
		},
		'mni': {
			autonym: 'Manipuri',
			inputmethods: [ 'mni-inscript2' ]
		},
		'mr': {
			autonym: 'मराठी',
			inputmethods: [ 'mr-transliteration', 'mr-inscript2', 'mr-inscript', 'mr-phonetic' ]
		},
		'my': {
			autonym: 'မြန်မာ',
			inputmethods: [ 'my-kbd', 'my-xkb' ]
		},
		'ne': {
			autonym: 'नेपाली',
			inputmethods: [ 'ne-transliteration', 'ne-inscript2', 'ne-inscript', 'ne-rom', 'ne-trad' ]
		},
		'new': {
			autonym: 'नेपाल भाषा',
			inputmethods: [ 'hi-transliteration', 'hi-inscript' ]
		},
		'no': {
			autonym: 'Norsk',
			inputmethods: [ 'no-normforms', 'no-tildeforms' ]
		},
		'nb': {
			autonym: 'Norsk (bokmål)',
			inputmethods: [ 'no-normforms', 'no-tildeforms' ]
		},
		'nn': {
			autonym: 'Norsk (nynorsk)',
			inputmethods: [ 'no-normforms', 'no-tildeforms' ]
		},
		'or': {
			autonym: 'ଓଡ଼ିଆ',
			inputmethods: [ 'or-transliteration', 'or-lekhani', 'or-inscript', 'or-phonetic', 'or-inscript2' ]
		},
		'pa': {
			autonym: 'ਪੰਜਾਬੀ',
			inputmethods: [ 'pa-transliteration', 'pa-inscript', 'pa-phonetic', 'pa-inscript2', 'pa-jhelum' ]
		},
		'rif': {
			autonym: 'ⵜⴰⵔⵉⴼⵉⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		'ru': {
			autonym: 'русский',
			inputmethods: [ 'ru-jcuken', 'ru-kbd', 'ru-phonetic', 'ru-yawerty' ]
		},
		'sah': {
			autonym: 'саха тыла',
			inputmethods: [ 'sah-transliteration' ]
		},
		'sa': {
			autonym: 'संस्कृत',
			inputmethods: [ 'sa-transliteration', 'sa-inscript2', 'sa-inscript' ]
		},
		'sat': {
			autonym: 'संताली',
			inputmethods: [ 'sat-inscript2']
		},
		'sd': {
			autonym: 'सिंधी',
			inputmethods: [ 'sd-inscript2' ]
		},
		'se': {
			autonym: 'Davvisámegiella',
			inputmethods: [ 'se-normforms' ]
		},
		'shi': {
			autonym: 'ⵜⴰⵛⵍⵃⵉⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		'si': {
			autonym: 'සිංහල',
			inputmethods: [ 'si-singlish', 'si-wijesekara' ]
		},
		'sk': {
			autonym: 'Slovenčina',
			inputmethods: [ 'sk-kbd' ]
		},
		'sr': {
			autonym: 'Српски / srpski',
			inputmethods: [ 'sr-kbd' ]
		},
		'sv': {
			autonym: 'Svenska',
			inputmethods: [ 'sv-normforms' ]
		},
		'ta': {
			autonym: 'தமிழ்',
			inputmethods: [ 'ta-transliteration', 'ta-99', 'ta-inscript', 'ta-bamini', 'ta-inscript2' ]
		},
		'tcy': {
			autonym: 'ತುಳು',
			inputmethods: [ 'kn-transliteration' ]
		},
		'te': {
			autonym: 'తెలుగు',
			inputmethods: [ 'te-transliteration', 'te-inscript', 'te-inscript2' ]
		},
		'th': {
			autonym: 'ไทย',
			inputmethods: [ 'th-kedmanee', 'th-pattachote' ]
		},
		'tkr': {
			autonym: 'цӀаӀхна миз',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'tzm': {
			autonym: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
			inputmethods: [ 'ber-tfng' ]
		},
		'uk': {
			autonym: 'Українська',
			inputmethods: [ 'uk-kbd' ]
		},
		'ug': {
			autonym: 'ئۇيغۇرچە / Uyghurche',
			inputmethods: [ 'ug-kbd' ]
		},
		'ur': {
			autonym: 'اردو',
			inputmethods: [ 'ur-transliteration', 'ur-phonetic' ]
		},
		'uz': {
			autonym: 'Oʻzbekcha',
			inputmethods: [ 'uz-kbd' ]
		}
	} );

}( jQuery ) );
