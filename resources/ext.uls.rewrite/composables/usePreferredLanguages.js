const { ref, onMounted } = require( 'vue' );
const PREFERENCE_NAME = 'mw-preferred-languages';

module.exports = function usePreferredLanguages() {
	const preferredLanguages = ref( [] );

	onMounted( () => {
		if ( mw.user.isNamed() ) {
			let languages = mw.user.options.get( PREFERENCE_NAME );
			if ( languages ) {
				try {
					languages = JSON.parse( languages );
				} catch ( e ) {
					languages = [];
				}
			}
			preferredLanguages.value = Array.isArray( languages ) ? languages : [];
		}
	} );

	return {
		preferredLanguages
	};
};
