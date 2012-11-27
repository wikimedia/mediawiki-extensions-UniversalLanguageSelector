( function ( $ ) {
	'use strict';

	function IME ( element, options ) {
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

		getIM: function () {
			return this.inputmethod;
		},

		setIM: function ( inputmethodId ) {
			this.inputmethod = $.ime.inputmethods[inputmethodId];
			$.ime.preferences.setIM( inputmethodId );
		},

		setLanguage: function ( languageCode ) {
			this.language = languageCode;
			$.ime.preferences.setLanguage( languageCode );
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
		}
	};

	$.fn.ime = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'ime' ),
				options = typeof option === 'object' && option;

			if ( $this.prop( 'readonly' ) || $this.prop( 'disabled' ) ) {
				return;
			}
			if ( $this.hasClass( 'noime' ) ) {
				return;
			}
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
		'am-transliteration': {
			name: 'Transliteration',
			source: 'rules/am/am-transliteration.js'
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
		'as-transliteration': {
			name: 'প্ৰতিৰূপান্তৰণ',
			source: 'rules/as/as-transliteration.js'
		},
		'be-latin': {
			name: 'Łacinka',
			source: 'rules/be/be-latin.js'
		},
		'be-transliteration': {
			name: 'Transliteration',
			source: 'rules/be/be-transliteration.js'
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
			name: 'ইন্‌স্ক্ৰিপ্ত',
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
		'da-normforms': {
			name: 'Normal forms',
			source: 'rules/da/da-normforms.js'
		},
		'eo-transliteration': {
			name: 'Transliteration',
			source: 'rules/eo/eo-transliteration.js'
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
		'is-normforms': {
			name: 'Normal forms',
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
		'sv-normforms': {
			name: 'Normal forms',
			source: 'rules/sv/sv-normforms.js'
		},
		'ta-inscript': {
			name: 'இன்ஸ்கிரிப்ட்',
			source: 'rules/ta/ta-inscript.js'
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
			name: 'ઇનસ્ક્રિપ્ટ',
			source: 'rules/gu/gu-inscript.js'
		},
		'gu-transliteration': {
			name: 'લિપ્યાંતરણ',
			source: 'rules/gu/gu-transliteration.js'
		},
		'ka-transliteration': {
			name: 'ტრანსლიტერაცია',
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
		'kn-kgp': {
			name: 'KGP/Nudi/KP Rao',
			source: 'rules/kn/kn-kgp.js'
		},
		'kok-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/kok/kok-inscript2.js'
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
		'ne-inscript': {
			name: 'इनस्क्रिप्ट',
			source: 'rules/ne/ne-inscript.js'
		},
		'ne-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/ne/ne-inscript2.js'
		},
		'ne-transliteration': {
			name: 'Transliteration',
			source: 'rules/ne/ne-transliteration.js'
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
			name: 'Transliteration',
			source: 'rules/or/or-transliteration.js'
		},
		'or-inscript': {
			name: 'Inscript',
			source: 'rules/or/or-inscript.js'
		},
		'or-lekhani': {
			name: 'ଲେଖନୀ',
			source: 'rules/or/or-lekhani.js'
		},
		'se-normforms': {
			name: 'Normal forms',
			source: 'rules/se/se-normforms.js'
		},
		'te-inscript': {
			name: 'ఇన్‍స్క్రిప్ట్',
			source: 'rules/te/te-inscript.js'
		},
		'te-transliteration': {
			name: 'లిప్యంతరీకరణ',
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
		'ru-jcuken': {
			name: 'ЙЦУКЕН',
			source: 'rules/ru/ru-jcuken.js'
		},
		'sa-inscript': {
			name: 'Inscript',
			source: 'rules/sa/sa-inscript.js'
		},
		'sa-inscript2': {
			name: 'इनस्क्रिप्ट २',
			source: 'rules/sa/sa-inscript2.js'
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
		},
		'mn-cyrl': {
			name: 'Cyrillic',
			source: 'rules/mn/mn-cyrl.js'
		},
		'ipa-sil': {
			name: 'International Phonetic Alphabet - SIL',
			source: 'rules/fonipa/ipa-sil.js'
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
		'be': {
			autonym: 'беларуская',
			inputmethods: [ 'be-transliteration', 'be-latin' ]
		},
		'be-tarask': {
			autonym: 'беларуская (тарашкевіца)',
			inputmethods: [ 'be-transliteration', 'be-latin' ]
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
			autonym: 'बोड़ो',
			inputmethods: [ 'brx-inscript' ]
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
		'en': {
			autonym: 'English',
			inputmethods: [ 'ipa-sil' ]
		},
		'eo': {
			autonym: 'Esperanto',
			inputmethods: [ 'eo-transliteration' ]
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
			inputmethods: [ 'ka-transliteration' ]
		},
		'kbd': {
			autonym: 'адыгэбзэ (къэбэрдеибзэ)',
			inputmethods: [ 'cyrl-palochka' ]
		},
		'kn': {
			autonym: 'ಕನ್ನಡ',
			inputmethods: [ 'kn-transliteration', 'kn-inscript', 'kn-kgp' ]
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
		'mai': {
			autonym: 'मैथिली',
			inputmethods: [ 'mai-inscript' ]
		},
		'ml': {
			autonym: 'മലയാളം',
			inputmethods: [ 'ml-transliteration', 'ml-inscript' ]
		},
		'mn': {
			autonym: 'Монгол',
			inputmethods: [ 'mn-cyrl' ]
		},
		'mr': {
			autonym: 'मराठी',
			inputmethods: [ 'mr-transliteration', 'mr-inscript2', 'mr-inscript' ]
		},
		'ne': {
			autonym: 'नेपाली',
			inputmethods: [ 'ne-transliteration', 'ne-inscript2', 'ne-inscript' ]
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
			inputmethods: [ 'ru-jcuken' ]
		},
		'sah': {
			autonym: 'саха тыла',
			inputmethods: [ 'sah-transliteration' ]
		},
		'sa': {
			autonym: 'संस्कृत',
			inputmethods: [ 'sa-transliteration', 'sa-inscript2', 'sa-inscript' ]
		},
		'se': {
			autonym: 'Davvisámegiella',
			inputmethods: [ 'se-normforms' ]
		},
		'shi': {
			autonym: 'ⵜⵉⴼⵉⵏⴰⵖ',
			inputmethods: [ 'ber-tfng' ]
		},
		'si': {
			autonym: 'සිංහල',
			inputmethods: [ 'si-singlish', 'si-wijesekara' ]
		},
		'sv': {
			autonym: 'Svenska',
			inputmethods: [ 'sv-normforms' ]
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
		this.$imeSetting = null;
		this.$menu = null;
		this.inputmethod = null;
		this.init();
		this.listen();
		this.timer = null;
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
			// Hide all other IME settings
			$( 'div.imeselector' ).hide();
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

		/**
		 * Bind the events and listen
		 */
		listen: function () {
			var imeselector = this;

			$( 'html' ).on( 'click.ime', function () {
				imeselector.hide();
				if ( imeselector.$element.is( ':hidden' ) ) {
					imeselector.$imeSetting.hide();
				}
			} );

			imeselector.$element.on( 'blur.ime', function () {
				if ( !imeselector.$imeSetting.hasClass( 'onfocus' ) ) {
					imeselector.$imeSetting.hide();
					imeselector.hide();
				}
			} );

			imeselector.$imeSetting.mouseenter( function () {
				imeselector.$imeSetting.addClass( 'onfocus' );
			} ).mouseleave( function () {
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

			imeselector.$imeSetting.on( 'click.ime', $.proxy( this.show, this ) );

			imeselector.$element.on( 'focus.ime', function ( e ) {
				imeselector.selectLanguage( $.ime.preferences.getLanguage() );
				imeselector.focus();
				e.stopPropagation();
			} );

			imeselector.$element.attrchange( function ( attrName ) {
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
						this.selectLanguage ( $.ime.preferences.getLanguage() );
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
			var position = this.$element.offset();

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

	var selectorTemplate = '<div class="imeselector">'
		+ '<a class="ime-name imeselector-toggle" href="#"></a>'
		+ '<b class="ime-setting-caret"></b></div>';

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

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
		|| window.MozMutationObserver;

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
			language : 'en',
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
