'use strict';

describe( 'usePreferredLanguages', () => {
	beforeEach( () => {
		jest.resetModules();
	} );

	// Helper to require the module dynamically within each test.
	// loadPreferredLanguages() runs immediately at require() time
	function initPreferredLanguages() {
		const usePreferredLanguages = require( '../../../resources/ext.uls.rewrite/composables/usePreferredLanguages.js' );
		return usePreferredLanguages();
	}

	it( 'returns empty array when user is not named', () => {
		mw.user.isNamed.mockReturnValue( false );

		const { preferredLanguages } = initPreferredLanguages();

		expect( preferredLanguages.value ).toEqual( [] );
	} );

	it( 'returns empty array when user is named but preference is missing', () => {
		mw.user.isNamed.mockReturnValue( true );
		mw.user.options.get.mockReturnValue( null );

		const { preferredLanguages } = initPreferredLanguages();

		expect( preferredLanguages.value ).toEqual( [] );
		expect( mw.user.options.get ).toHaveBeenCalledWith( 'mw-preferred-languages' );
	} );

	it( 'returns empty array when preference contains invalid JSON', () => {
		mw.user.isNamed.mockReturnValue( true );
		mw.user.options.get.mockReturnValue( 'invalid-json{' );

		const { preferredLanguages } = initPreferredLanguages();

		expect( preferredLanguages.value ).toEqual( [] );
	} );

	it( 'returns empty array when preference is not an array', () => {
		mw.user.isNamed.mockReturnValue( true );
		mw.user.options.get.mockReturnValue( '"not-an-array"' );

		const { preferredLanguages } = initPreferredLanguages();

		expect( preferredLanguages.value ).toEqual( [] );
	} );

	it( 'returns the parsed preference array when valid', () => {
		mw.user.isNamed.mockReturnValue( true );
		mw.user.options.get.mockReturnValue( '["fr","es"]' );

		const { preferredLanguages } = initPreferredLanguages();

		expect( preferredLanguages.value ).toEqual( [ 'fr', 'es' ] );
	} );

	it( 'subscribes to mw.uls.preferredlanguages.save hook and updates state when fired', () => {
		mw.user.isNamed.mockReturnValue( false );

		let hookCallback;
		mw.hook.mockImplementation( ( hookName ) => {
			if ( hookName === 'mw.uls.preferredlanguages.save' ) {
				return {
					add: ( cb ) => {
						hookCallback = cb;
					},
					fire: jest.fn()
				};
			}
			return { add: jest.fn(), fire: jest.fn() };
		} );

		const { preferredLanguages } = initPreferredLanguages();

		expect( preferredLanguages.value ).toEqual( [] );
		expect( typeof hookCallback ).toBe( 'function' );

		// Fire with custom data
		hookCallback( [ 'de', 'ja' ] );
		expect( preferredLanguages.value ).toEqual( [ 'de', 'ja' ] );

		// Fire with no data (reload from options)
		mw.user.isNamed.mockReturnValue( true );
		mw.user.options.get.mockReturnValue( '["zh"]' );
		hookCallback();
		expect( preferredLanguages.value ).toEqual( [ 'zh' ] );
	} );
} );
