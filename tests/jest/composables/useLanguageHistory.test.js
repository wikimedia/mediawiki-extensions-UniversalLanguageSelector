'use strict';

// Mock minimum globals before requiring the composable
global.mw = {
	storage: {
		get: jest.fn(),
		set: jest.fn()
	}
};

const useLanguageHistory = require( '../../../resources/ext.uls.rewrite/composables/useLanguageHistory.js' );

describe( 'useLanguageHistory', () => {
	const PREVIOUS_LANGUAGE_STORAGE_KEY = 'uls-previous-languages';
	const MAX_PREVIOUS_LANGUAGES = 8;

	describe( 'loading from storage', () => {
		it( 'loads an empty array if storage is empty', () => {
			mw.storage.get.mockReturnValue( null );
			const { previousLanguages } = useLanguageHistory();
			expect( previousLanguages.value ).toEqual( [] );
			expect( mw.storage.get ).toHaveBeenCalledWith( PREVIOUS_LANGUAGE_STORAGE_KEY );
		} );

		it( 'loads parsing errors as empty array', () => {
			mw.storage.get.mockReturnValue( '{invalid-json' );
			const { previousLanguages } = useLanguageHistory();
			expect( previousLanguages.value ).toEqual( [] );
		} );

		it( 'loads valid languages list from storage', () => {
			mw.storage.get.mockReturnValue( JSON.stringify( [ 'fr', 'es', 'de' ] ) );
			const { previousLanguages } = useLanguageHistory();
			expect( previousLanguages.value ).toEqual( [ 'fr', 'es', 'de' ] );
		} );
	} );

	describe( 'adding languages', () => {
		it( 'does nothing if language code is falsy', () => {
			mw.storage.get.mockReturnValue( JSON.stringify( [ 'fr' ] ) );
			const { previousLanguages, addLanguageToHistory } = useLanguageHistory();

			addLanguageToHistory( '' );
			expect( previousLanguages.value ).toEqual( [ 'fr' ] );
			expect( mw.storage.set ).not.toHaveBeenCalled();
		} );

		it( 'adds language to the front of the list and saves to storage', () => {
			mw.storage.get.mockReturnValue( JSON.stringify( [ 'fr', 'es' ] ) );
			const { previousLanguages, addLanguageToHistory } = useLanguageHistory();

			addLanguageToHistory( 'de' );
			expect( previousLanguages.value ).toEqual( [ 'de', 'fr', 'es' ] );
			expect( mw.storage.set ).toHaveBeenCalledWith(
				PREVIOUS_LANGUAGE_STORAGE_KEY,
				JSON.stringify( [ 'de', 'fr', 'es' ] )
			);
		} );

		it( 'remove duplicates and moves the added language to the front', () => {
			mw.storage.get.mockReturnValue( JSON.stringify( [ 'fr', 'es', 'de' ] ) );
			const { previousLanguages, addLanguageToHistory } = useLanguageHistory();

			addLanguageToHistory( 'es' );
			expect( previousLanguages.value ).toEqual( [ 'es', 'fr', 'de' ] );
			expect( mw.storage.set ).toHaveBeenCalledWith(
				PREVIOUS_LANGUAGE_STORAGE_KEY,
				JSON.stringify( [ 'es', 'fr', 'de' ] )
			);
		} );

		it( 'limits the size of history', () => {
			mw.storage.get.mockReturnValue( JSON.stringify(
				[ 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8' ]
			) );
			const { previousLanguages, addLanguageToHistory } = useLanguageHistory();

			addLanguageToHistory( 'l9' );
			expect( previousLanguages.value ).toEqual(
				[ 'l9', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7' ]
			);
			expect( previousLanguages.value.length ).toBe( MAX_PREVIOUS_LANGUAGES );
			expect( mw.storage.set ).toHaveBeenCalledWith(
				PREVIOUS_LANGUAGE_STORAGE_KEY,
				JSON.stringify( [ 'l9', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7' ] )
			);
		} );
	} );
} );
