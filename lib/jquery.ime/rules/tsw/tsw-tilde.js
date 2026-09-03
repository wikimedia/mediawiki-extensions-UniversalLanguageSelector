( function ( $ ) {
	'use strict';

	var tsishinginiTilde = {
		id: 'tsw-tilde',
		name: 'Tsishingini tilde',
		description: 'Tsishingini input keyboard',
		date: '2026-08-18',
		URL: 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:UniversalLanguageSelector/Input_methods/tsw-tilde',
		author: 'Toluwanimi Ayodele',
		license: 'GPLv3',
		version: '1.0',
		patterns: [
			// Special letters
			[ '~B', 'Ɓ' ],
			[ '~b', 'ɓ' ],
			[ '~D', 'Ɗ' ],
			[ '~d', 'ɗ' ],
			[ '~O', 'Ɔ' ],
			[ '~o', 'ɔ' ],
			// Combining macron below (for a̱, e̱, etc.) — type after the base letter
			[ '~_', '\u0331' ], // e.g., a~_ → a̱
			// Combining tilde above (for ẽ, etc.) — type after the base letter
			[ '~~', '\u0303' ], // e.g., e~~ → ẽ
			// Glottal stop (Modifier Letter Apostrophe, U+02BC — letter, not punctuation)
			[ "~'", '\u02BC' ],
			[ '~/', '\u0301' ], // combining acute (high tone), e.g. a~/ → á
			[ '~\\\\', '\u0300' ], // combining grave (low tone), e.g. a~\ → à
			[ '~\\^', '\u0302' ] // combining circumflex (falling tone), e.g. a~^ → â
		]
	};

	$.ime.register( tsishinginiTilde );
}( jQuery ) );
