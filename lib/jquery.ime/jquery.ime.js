( function ( $ ) {
	'use strict';

	function IME ( element, options ) {
		this.$element = $( element );
		// This needs to be delayed here since extending language list happens at DOM ready
		$.ime.defaults.languages = Object.keys( $.ime.languages );
		this.options = $.extend( {}, $.ime.defaults, options );
		this.active = false;
		this.inputmethod = null;
		this.context = '';
		this.selector = this.$element.imeselector( this.options );
		this.listen();
	}

	IME.prototype = {
		constructor: IME,

		listen: function () {
			this.$element.on( 'keypress', $.proxy( this.keypress, this ) );
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
			pos = getCaretPosition( this.$element );
			startPos = pos[0];
			endPos = pos[1];

			// Get the last few characters before the one the user just typed,
			// to provide context for the transliteration regexes.
			// We need to append c because it hasn't been added to $this.val() yet
			input = lastNChars( this.$element.val() || this.$element.text(), startPos,
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

			// it is a noop
			if ( replacement === input ) {
				return true;
			}

			// Drop a common prefix, if any
			divergingPos = firstDivergence( input, replacement );
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

		setIM: function ( inputmethodId ) {
			this.inputmethod = $.ime.inputmethods[inputmethodId];
			$.ime.preferences.setIM( inputmethodId );
		},

		setLanguage: function( languageCode ) {
			$.ime.preferences.setLanguage( languageCode );
		},

		load: function ( name, callback ) {
			var ime = this, dependency;

			if ( $.ime.inputmethods[name] ) {
				if ( callback ) {
					callback.call( ime );
				}

				return true;
			}

			dependency =  $.ime.sources[name].depends;
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
		}
	};

	$.fn.ime = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'ime' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'ime', ( data = new IME( this, options ) ) );
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
	function debug ( $obj ) {
		if ( window.console && window.console.log ) {
			window.console.log( $obj );
		}
	}

	/**
	 *
	 */
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

	/**
	 *
	 */
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
	function firstDivergence ( a, b ) {
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
	function lastNChars ( str, pos, n ) {
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

	$.extend( $.ime.sources, {
		'en-capitalize': {
			name: 'Capitalize', // XXX This can be the name written in its own script?
			source: 'rules/en/capitalize.js'
		},
		'am-transliteration': {
			name: 'Transliteration',
			source: 'rules/am/am-transliteration.js'
		},
		'as-avro': {
			name: 'Avro',
			source: 'rules/as/as-avro.js'
		},
		'as-bornona': {
			name: 'Bornona',
			source: 'rules/as/as-bornona.js'
		},
		'as-inscript': {
			name: 'InScript',
			source: 'rules/as/as-inscript.js'
		},
		'as-transliteration': {
			name: 'Transliteration',
			source: 'rules/as/as-transliteration.js'
		},
		'ber-tfng': {
			name: 'Tifinagh',
			source: 'rules/ber/ber-tfng.js'
		},
		'bn-avro': {
			name: 'Avro',
			source: 'rules/bn/bn-avro.js'
		},
		'bn-inscript': {
			name: 'InScript',
			source: 'rules/bn/bn-inscript.js'
		},
		'bn-nkb': {
			name: 'National Keyboard',
			source: 'rules/bn/bn-nkb.js'
		},
		'bn-probhat': {
			name: 'Probhat',
			source: 'rules/bn/bn-probhat.js'
		},
		'brx-inscript': {
			name: 'Inscript',
			source: 'rules/brx/brx-inscript.js'
		},
		'cyrl-palochka': {
			name: 'Palochka',
			source: 'rules/cyrl/cyrl-palochka.js'
		},
		'eo-transliteration': {
			name: 'Transliteration',
			source: 'rules/eo/eo-transliteration.js'
		},
		'hi-transliteration': {
			name: 'Transliteration',
			source: 'rules/hi/hi-transliteration.js'
		},
		'hi-inscript': {
			name: 'InScript',
			source: 'rules/hi/hi-inscript.js'
		},
		'mai-inscript': {
			name: 'InScript',
			source: 'rules/mai/mai-inscript.js',
			depends: 'hi-inscript'
		},
		'hi-bolnagri': {
			name: 'BolNagri',
			source: 'rules/hi/hi-bolnagri.js'
		},
		'ml-transliteration': {
			name: 'Transliteration',
			source: 'rules/ml/ml-transliteration.js'
		},
		'ml-inscript': {
			name: 'InScript',
			source: 'rules/ml/ml-inscript.js'
		},
		'ta-inscript': {
			name: 'InScript',
			source: 'rules/ta/ta-inscript.js'
		},
		'ta-transliteration': {
			name: 'Transliteration',
			source: 'rules/ta/ta-transliteration.js'
		},
		'ta-99': {
			name: 'Tamil 99',
			source: 'rules/ta/ta-99.js'
		},
		'ta-bamini': {
			name: 'Bamini',
			source: 'rules/ta/ta-bamini.js'
		},
		'de': {
			name: 'Deutsch',
			source: 'rules/de/de.js'
		},
		'he-standard-2012': {
			name: 'Hebrew 2012 (from English)',
			source: 'rules/he/he-standard-2012.js'
		},
		'he-standard-2012-extonly': {
			name: 'Hebrew 2012',
			source: 'rules/he/he-standard-2012-extonly.js'
		},
		'gu-inscript': {
			name: 'Inscript',
			source: 'rules/gu/gu-inscript.js'
		},
		'gu-transliteration': {
			name: 'Transliteration',
			source: 'rules/gu/gu-transliteration.js'
		},
		'ka-transliteration': {
			name: 'Transliteration',
			source: 'rules/ka/ka-transliteration.js'
		},
		'kn-inscript': {
			name: 'Inscript',
			source: 'rules/kn/kn-inscript.js'
		},
		'kn-transliteration': {
			name: 'Transliteration',
			source: 'rules/kn/kn-transliteration.js'
		},
		'mr-inscript': {
			name: 'Inscript',
			source: 'rules/mr/mr-inscript.js'
		},
		'mr-transliteration': {
			name: 'Transliteration',
			source: 'rules/mr/mr-transliteration.js'
		},
		'ne-inscript': {
			name: 'Inscript',
			source: 'rules/ne/ne-inscript.js'
		},
		'ne-transliteration': {
			name: 'Transliteration',
			source: 'rules/ne/ne-transliteration.js'
		},
		'or-transliteration': {
			name: 'Transliteration',
			source: 'rules/or/or-transliteration.js'
		},
		'or-inscript': {
			name: 'Inscript',
			source: 'rules/or/or-inscript.js'
		},
		'or-lekhani': {
			name: 'Lekhani',
			source: 'rules/or/or-lekhani.js'
		},
		'te-inscript': {
			name: 'Inscript',
			source: 'rules/te/te-inscript.js'
		},
		'te-transliteration': {
			name: 'Transliteration',
			source: 'rules/te/te-transliteration.js'
		},
		'pa-inscript': {
			name: 'Inscript',
			source: 'rules/pa/pa-inscript.js'
		},
		'pa-transliteration': {
			name: 'Transliteration',
			source: 'rules/pa/pa-transliteration.js'
		},
		'pa-phonetic': {
			name: 'Phonetic',
			source: 'rules/pa/pa-phonetic.js'
		},
		'ru-transliteration': {
			name: 'Transliteration',
			source: 'rules/ru/ru-transliteration.js'
		},
		'sa-inscript': {
			name: 'Inscript',
			source: 'rules/sa/sa-inscript.js'
		},
		'sa-transliteration': {
			name: 'Transliteration',
			source: 'rules/sa/sa-transliteration.js'
		},
		'sah-transliteration': {
			name: 'Transliteration',
			source: 'rules/sah/sah-transliteration.js'
		},
		'si-singlish': {
			name: 'Singlish',
			source: 'rules/si/si-singlish.js'
		},
		'si-wijesekara': {
			name: 'Wijesekara',
			source: 'rules/si/si-wijesekara.js'
		},
		'ur-transliteration': {
			name: 'Transliteration',
			source: 'rules/ur/ur-transliteration.js'
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
		'as': {
			autonym: 'অসমীয়া',
			inputmethods: [ 'as-transliteration', 'as-avro', 'as-bornona', 'as-inscript' ]
		},
		'av': {
			autonym: 'авар',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'ber': {
			autonym: 'ⵜⵉⴼⵉⵏⴰⵖ',
			inputmethods: [ 'ber-tfng' ]
		},
		'bn': {
			autonym: 'বাংলা',
			inputmethods: [ 'bn-avro', 'bn-inscript', 'bn-nkb', 'bn-probhat' ]
		},
		'brx': {
			autonym: 'बड़ो',
			inputmethods: [ 'brx-inscript' ]
		},
		'ce': {
			autonym: 'нохчийн',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'de': {
			autonym: 'Deutsch',
			inputmethods: [ 'de' ]
		},
		'en': {
			autonym: 'English',
			inputmethods: [ 'en-capitalize' ]
		},
		'eo': {
			autonym: 'Esperanto',
			inputmethods: [ 'eo-transliteration' ]
		},
		'gom': {
			autonym: 'कोंकणी',
			inputmethods: [ 'hi-transliteration', 'hi-inscript' ]
		},
		'gu': {
			autonym: 'ગુજરાતી',
			inputmethods: [ 'gu-transliteration', 'gu-inscript' ]
		},
		'he': {
			autonym: 'עברית',
			inputmethods: [ 'he-standard-2012-extonly', 'he-standard-2012' ]
		},
		'hi': {
			autonym: 'हिन्दी',
			inputmethods: [ 'hi-transliteration', 'hi-inscript', 'hi-bolnagri' ]
		},
		'hne': {
			autonym: 'छत्तीसगढ़ी',
			inputmethods: [ 'hi-transliteration' ]
		},
		'ka': {
			autonym: 'ქართული ენა',
			inputmethods: [ 'ka-transliteration' ]
		},
		'kbd': {
			autonym: 'адыгэбзэ (къэбэрдеибзэ)',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'kn': {
			autonym: 'ಕನ್ನಡ',
			inputmethods: [ 'kn-transliteration', 'kn-inscript' ]
		},
		'lbe': {
			autonym: 'лакку',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'lez': {
			autonym: 'лезги',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'mai': {
			autonym: 'मैथिली',
			inputmethods: [ 'mai-inscript' ]
		},
		'ml': {
			autonym: 'മലയാളം',
			inputmethods: [ 'ml-transliteration', 'ml-inscript' ]
		},
		'mr': {
			autonym: 'मराठी',
			inputmethods: [ 'mr-transliteration', 'mr-inscript' ]
		},
		'ne': {
			autonym: 'नेपाली',
			inputmethods: [ 'ne-transliteration', 'ne-inscript' ]
		},
		'new': {
			autonym: 'नेपाल भाषा',
			inputmethods: [ 'hi-transliteration', 'hi-inscript' ]
		},
		'or': {
			autonym: 'ଓଡ଼ିଆ',
			inputmethods: [ 'or-transliteration', 'or-lekhani', 'or-inscript' ]
		},
		'pa': {
			autonym: 'ਪੰਜਾਬੀ',
			inputmethods: [ 'pa-transliteration', 'pa-inscript', 'pa-phonetic' ]
		},
		'rif': {
			autonym: 'ⵜⵉⴼⵉⵏⴰⵖ',
			inputmethods: [ 'ber-tfng' ]
		},
		'ru': {
			autonym: 'русский',
			inputmethods: [ 'ru-transliteration' ]
		},
		'sah': {
			autonym: 'саха тыла',
			inputmethods: [ 'sah-transliteration' ]
		},
		'sa': {
			autonym: 'संस्कृत',
			inputmethods: [ 'sa-transliteration', 'sa-inscript' ]
		},
		'shi': {
			autonym: 'ⵜⵉⴼⵉⵏⴰⵖ',
			inputmethods: [ 'ber-tfng' ]
		},
		'si': {
			autonym: 'සිංහල',
			inputmethods: [ 'si-singlish', 'si-wijesekara' ]
		},
		'ta': {
			autonym: 'தமிழ்',
			inputmethods: [ 'ta-transliteration', 'ta-99', 'ta-inscript', 'ta-bamini' ]
		},
		'tcy': {
			autonym: 'ತುಳು',
			inputmethods: [ 'kn-transliteration' ]
		},
		'te': {
			autonym: 'తెలుగు',
			inputmethods: [ 'te-transliteration', 'te-inscript' ]
		},
		'tkr': {
			autonym: 'цӀаӀхна миз',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'ur': {
			autonym: 'اردو',
			inputmethods: [ 'ur-transliteration' ]
		}
	} );

}( jQuery ) );

( function ( $ ) {
	'use strict';

	function IMESelector ( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, IMESelector.defaults, options );
		this.active = false;
		this.$imeSetting = $( selectorTemplate );
		this.$menu = $( '<ul class="imeselector-menu" role="menu">' );
		this.inputmethod = null;
		this.shown = false;
		this.init();
		this.listen();
	}

	IMESelector.prototype = {
		constructor: IMESelector,

		init: function () {
			this.prepareSelectorMenu();
			this.$imeSetting.append( this.$menu );
			this.$element.after( this.$imeSetting );
			this.position();
			this.$imeSetting.hide();
		},

		prepareSelectorMenu: function() {
			this.$menu.append( imeList() );
			this.$menu.append( toggleMenuItem() );
			this.$menu.append( languageListTitle() );
			this.prepareLanguageList();
			this.$menu.append( helpLink() );
		},

		focus: function ( ) {
			// Hide all other IME settings
			$( 'div.imeselector' ).hide();
			this.$imeSetting.show();
		},

		toggle: function () {
			var isActive = this.$menu.hasClass( 'open' );

			this.$menu.removeClass( 'open' );

			if ( !isActive ) {
				this.$menu.toggleClass( 'open' );
			}

			return false;
		},

		/**
		 * Bind the events and listen
		 */
		listen: function () {
			var imeselector = this;

			$( 'html' ).on( 'click', function () {
				imeselector.$menu.removeClass( 'open' );
			} );

			imeselector.$menu.on( 'click', 'li.ime-im', function ( e ) {
				var inputmethodId = $( this ).data( 'ime-inputmethod' );
				imeselector.selectIM( inputmethodId );
				e.stopPropagation();
			} );

			imeselector.$menu.on( 'click', 'li.ime-lang', function ( e ) {
				var language = $( this ).attr( 'lang' );
				imeselector.selectLanguage( language );
				e.stopPropagation();
			} );

			imeselector.$menu.on( 'click', 'li.ime-disable-link', function ( e ) {
				imeselector.disableIM();
				e.stopPropagation();
			} );

			imeselector.$element.on( 'focus', function() {
				imeselector.selectLanguage( $.ime.preferences.getLanguage() );
				imeselector.focus( );
			} );

			// Possible resize of textarea
			imeselector.$element.on( 'mouseup', $.proxy( this.position, this ) );
			imeselector.$element.on( 'keydown', $.proxy( this.keydown, this ) );

			imeselector.$imeSetting.on( 'click', $.proxy( this.toggle, this ) );
		},

		/**
		 * Keydown event handler. Handles shortcut key presses
		 *
		 * @context {HTMLElement}
		 * @param {jQuery.Event} e
		 */
		keydown: function ( e ) {
			var ime = $( e.target ).data( 'ime' );

			if ( isShortcutKey( e ) ) {
				ime.toggle();

				if ( ime.isActive() ) {
					if ( this.inputmethod !== null ) {
						this.selectIM( this.inputmethod.id );
					}
				} else {
					this.disableIM();
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
			var position = this.$element.position();

			this.$imeSetting.css( 'top', position.top + this.$element.outerHeight() );
			this.$imeSetting.css( 'left', position.left + this.$element.outerWidth()
				- this.$imeSetting.outerWidth() );
		},

		/**
		 * Select a language
		 *
		 * @param languageCode
		 */
		selectLanguage: function ( languageCode ) {
			var imeselector = this,
				ime = this.$element.data( 'ime' ),
				languageName = $.ime.languages[languageCode].autonym;

			this.$menu.find( 'li.ime-lang' ).show();
			this.$menu.find( 'li[lang=' + languageCode + ']' ).hide();

			//imeselector.$menu.find( 'li.ime-im' ).remove();
			this.$menu.find( 'li.ime-list-title' ).text( languageName );
			this.prepareInputMethods( languageCode );
			imeselector.$menu.removeClass( 'open' );

			// And select the default inputmethod
			imeselector.selectIM( $.ime.preferences.getIM( languageCode ) );
			ime.setLanguage( languageCode );
		},

		/**
		 * Select an input method
		 *
		 * @param inputmethodId
		 */
		selectIM: function ( inputmethodId ) {
			var imeselector = this,
				ime;

			this.$menu.find( 'li.ime-im.checked' ).removeClass( 'checked' );
			this.$menu.find( 'li.ime-disable-link' ).removeClass( 'checked' );
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
				//imeselector.$element.focus();
				imeselector.$menu.removeClass( 'open' );
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
			var imeselector = this,
				ime = imeselector.$element.data( 'ime' );

			this.$menu.find( 'li.ime-im.checked' ).removeClass( 'checked' );
			this.$menu.find( 'li.ime-disable-link' ).addClass( 'checked' );
			ime.disable();
			imeselector.$imeSetting.find( 'a.ime-name' ).text( '' );
			this.$menu.removeClass( 'open' );
			imeselector.position();
			// save this preference
			$.ime.preferences.save();
		},

		/**
		 * Prepare language list
		 */
		prepareLanguageList: function () {
			var imeselector = this, languageCodeIndex = 0, $languageListDiv, $languageList, languageList;

			// Language list can be very long. So we use a container with
			// overflow auto.
			$languageListDiv = $( '<div class="ime-language-list">' );
			$languageList = $( '<ul class="ime-language-list">' );

			if ( $.isFunction( this.options.languages ) ) {
				languageList = this.options.languages();
			} else {
				languageList = this.options.languages;
			}

			for( languageCodeIndex in languageList ) {
				var $languageItem, $language, languageCode, language;

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

			$languageListDiv.append( $languageList );
			imeselector.$menu.append( $languageListDiv );

			if ( this.options.languageSelector ) {
				imeselector.$menu.append( this.options.languageSelector() );
			}
		},

		/**
		 * Prepare input methods in menu for the given language code
		 *
		 * @param languageCode
		 */
		prepareInputMethods: function ( languageCode ) {
			var imeselector = this,
				language = $.ime.languages[languageCode],
				$imeList;

			$imeList = imeselector.$menu.find( 'div.ime-list' );
			$imeList.empty();

			$.each( language.inputmethods, function ( index, inputmethod ) {
				var name = $.ime.sources[inputmethod].name,
					$imeItem = $( '<a>' ).attr( 'href', '#' ).text( name ),
					$inputMethod = $( '<li data-ime-inputmethod=' + inputmethod + '>' );

				$inputMethod.append( '<span class="ime-im-check">' ).append( $imeItem );
				$inputMethod.addClass( 'ime-im' );
				$imeList.append( $inputMethod );
			} );
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

	// Private functions
	function helpLink () {
		return $( '<li class="ime-help-link">' )
			.append( $( '<a>' )
			.attr( 'href', '#' )
			.text( 'Help' ) ); // TODO i18n
	}

	function languageListTitle () {
		return $( '<li class="ime-lang-title">' )
			.text( 'Other languages' ); // TODO i18n
	}

	function imeList () {
		return $( '<li class="ime-list-title"></li><li><div class="ime-list"/></li>' );
	}

	function toggleMenuItem () {
		return $( '<li class="ime-disable-link">' )
			.append( $( '<a>' )
				.attr( 'href', '#' )
				.text( 'System input method' )
				.append( '<span>CTRL+M</span>' )
			);
	}

	var selectorTemplate = '<div class="imeselector">'
		+ '<a class="ime-name imeselector-toggle" href="#"></a>'
		+ '<b class="caret"></b></div>';

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

}( jQuery ) );

( function ( $ ) {
	'use strict';

	$.extend( $.ime.preferences, {
		registry: {
			language : 'en',
			previousLanguages: [], // array of previous languages
			imes: {
				'en': 'system'
			}
		},

		setLanguage: function ( language ) {
			this.registry.language = language;
			if ( !this.registry.previousLanguages ) {
				this.registry.previousLanguages = [];
			}
			//Add to the previous languages, but avoid duplicates.
			if ( $.inArray( language, this.registry.previousLanguages ) === -1 ) {
				this.registry.previousLanguages.push( language );
			}
		},

		getLanguage: function () {
			return this.registry.language;
		},

		getPreviousLanguages: function () {
			return this.registry.previousLanguages;
		},

		// Set the given IM as the last used for the language
		setIM: function ( inputMethod ) {
			if( !this.registry.imes ){
				this.registry.imes= {};
			}
			this.registry.imes[this.getLanguage()] = inputMethod;
		},

		// Return the last used or the default IM for language
		getIM: function ( language ) {
			if( !this.registry.imes ){
				this.registry.imes= {};
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