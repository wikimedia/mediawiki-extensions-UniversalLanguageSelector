const { ref } = require( 'vue' );
const PREFERENCE_NAME = 'mw-preferred-languages';

function loadPreferredLanguages() {
	if ( !mw.user.isNamed() ) {
		return [];
	}
	const raw = mw.user.options.get( PREFERENCE_NAME );
	if ( !raw ) {
		return [];
	}
	let parsed;
	try {
		parsed = JSON.parse( raw );
	} catch ( e ) {
		return [];
	}
	return Array.isArray( parsed ) ? parsed : [];
}

module.exports = function usePreferredLanguages() {
	const preferredLanguages = ref( loadPreferredLanguages() );

	return {
		preferredLanguages
	};
};
