'use strict';

const { ref } = require( 'vue' );

const countryCode = ref( null );

/**
 * Composable for getting the user's country code based on GeoIP data.
 * To enable this feature, window.Geo must be set. It should be an object
 * containing a 'country' or 'country_code' property.
 *
 * @return {Object}
 */
module.exports = function useCountryCode() {
	if ( window.Geo ) {
		countryCode.value = window.Geo.country || window.Geo.country_code;
	}

	return {
		/**
		 * @return {string|null} The country code if available.
		 */
		getCountryCode: () => countryCode.value
	};
};
