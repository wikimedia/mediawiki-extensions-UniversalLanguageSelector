( function ( $ ) {
	'use strict';

	function transVowel ( input ) {
		switch (input) {
			case 's':
				return 'ে';
			// XXX Rest of the vowel rules
		}
		return input;
	}

	function transConsonant ( input ) {
		switch (input) {
			case 'k':
				return 'ক';
			case 'l':
				return 'ত';
			// XXX Rest of the consonant rules
		}
		return input;
	}

	var bnNasir = {
		id: 'bn-nasir',
		name: 'Bengali Nasir keyboard',
		description: 'Bengali Nasir input method',
		contextLength: 1,
		maxKeyLength: 2,
		patterns: [
			// Independent vowel transliteration
			[ '([efrgtswaqt])', function ( $1, $2 ) {
				return transVowel( $1 );
			} ],
			// Prebase vowel sign + consonant transliteration
			[ '([িুেো])([a-z])', function ( $1, $2, $3 ) {
				return transConsonant( $3 ) + $2;
			} ],
			// consonant transliteration
			[ '([klmnopuv])', function ( $1, $2 ) {
				return transConsonant( $2 );
			} ]
		]
	};
	$.ime.register( bnNasir );

}( jQuery ) );
