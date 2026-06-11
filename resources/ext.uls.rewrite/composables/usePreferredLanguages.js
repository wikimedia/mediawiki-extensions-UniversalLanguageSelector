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

const preferredLanguages = ref( loadPreferredLanguages() );

/**
 * Refresh the preferred languages
 *
 * @param {string[]} [data] Updated preferred languages. If not provided,
 *  reloads from mw.user.options.
 */
function refresh( data ) {
	preferredLanguages.value = data || loadPreferredLanguages();
}

// Listen for updates from the settings panel
mw.hook( 'mw.uls.preferredlanguages.save' ).add( refresh );

module.exports = function usePreferredLanguages() {
	return {
		preferredLanguages
	};
};
