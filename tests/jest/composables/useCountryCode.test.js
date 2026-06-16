'use strict';

const useCountryCode = require( '../../../resources/ext.uls.rewrite/composables/useCountryCode.js' );

describe( 'useCountryCode', () => {
	// respect the camelcase and quote-props rules
	const countryCodeKey = 'country_code';

	beforeEach( () => {
		// Reset the module-level countryCode ref to null
		window.Geo = { country: null };
		window.Geo[ countryCodeKey ] = null;
		useCountryCode();
		delete window.Geo;
	} );

	afterEach( () => {
		delete window.Geo;
	} );

	it( 'returns null when window.Geo is not set', () => {
		const { getCountryCode } = useCountryCode();
		expect( getCountryCode() ).toBeNull();
	} );

	it( 'returns country from window.Geo.country when available', () => {
		window.Geo = { country: 'US' };
		const { getCountryCode } = useCountryCode();
		expect( getCountryCode() ).toBe( 'US' );
	} );

	it( 'returns country_code from window.Geo.country_code when country is not available', () => {
		window.Geo = {};
		window.Geo[ countryCodeKey ] = 'CA';
		const { getCountryCode } = useCountryCode();
		expect( getCountryCode() ).toBe( 'CA' );
	} );

	it( 'prioritizes country over country_code', () => {
		window.Geo = { country: 'FR' };
		window.Geo[ countryCodeKey ] = 'US';
		const { getCountryCode } = useCountryCode();
		expect( getCountryCode() ).toBe( 'FR' );
	} );
} );
