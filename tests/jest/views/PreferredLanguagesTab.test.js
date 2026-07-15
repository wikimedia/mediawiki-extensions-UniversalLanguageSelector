'use strict';

const { mount } = require( '@vue/test-utils' );
const PreferredLanguagesTab = require( '../../../resources/ext.uls.rewrite/PreferredLanguagesTab.vue' );
const { LanguageSelector } = require( 'mediawiki.languageselector.lookup' );

describe( 'PreferredLanguagesTab', () => {
	let wrapper;

	const createWrapper = ( props = {}, options = {} ) => (
		mount( PreferredLanguagesTab, {
			global: {
				directives: {
					'i18n-html': ( el, binding ) => {
						el.innerHTML = binding.value ? binding.value.parse() : '';
					}
				},
				mocks: {
					$i18n: ( key ) => ( { text: () => key } )
				}
			},
			props: {
				initialLanguages: [],
				...props
			},
			...options
		} )
	);

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'does not show limit reached message when below limit', () => {
		wrapper = createWrapper( {
			initialLanguages: [ 'en', 'fr' ]
		} );

		expect( wrapper.find( '.uls-rewrite_languages-limit-reached' ).exists() ).toBe( false );
	} );

	it( 'shows limit reached message when at or above limit', () => {
		wrapper = createWrapper( {
			initialLanguages: [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ]
		} );

		const limitMsg = wrapper.find( '.uls-rewrite_languages-limit-reached' );
		expect( limitMsg.exists() ).toBe( true );
		expect( limitMsg.text() ).toBe( 'ext-uls-preferred-languages-limit-reached' );
	} );

	it( 'updates selection and emits change event when a valid selection is updated', async () => {
		wrapper = createWrapper( {
			initialLanguages: [ 'en' ]
		} );

		const lookup = wrapper.findComponent( LanguageSelector );
		await lookup.vm.$emit( 'update:selected', [ 'en', 'fr', 'es' ] );

		expect( wrapper.vm.selectedLanguages ).toEqual( [ 'en', 'fr', 'es' ] );
		expect( wrapper.emitted( 'change' ) ).toBeTruthy();
		expect( wrapper.emitted( 'change' )[ 0 ][ 0 ] ).toEqual( [ 'en', 'fr', 'es' ] );
	} );
} );
