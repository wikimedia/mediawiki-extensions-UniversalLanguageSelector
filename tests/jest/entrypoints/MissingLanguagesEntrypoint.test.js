'use strict';

const Vue = require( 'vue' );
Vue.createMwApp = Vue.createMwApp || Vue.createApp;
const { shallowMount } = require( '@vue/test-utils' );
const MissingLanguagesEntrypoint = require( '../../../resources/ext.uls.rewrite/entrypoints/MissingLanguagesEntrypoint.vue' );

describe( 'MissingLanguagesEntrypoint', () => {
	const mockAction = { label: 'Translate' };
	const mockEntrypoint = {
		shouldShow: () => true,
		getConfig: () => mockAction
	};

	beforeAll( () => {
		// Mock jQuery ULS autonym database helper
		global.$ = {
			uls: {
				data: {
					getAutonym: jest.fn( ( code ) => {
						const autonyms = { fr: 'français', es: 'español', de: 'Deutsch' };
						return autonyms[ code ] || code;
					} )
				}
			}
		};

		// Mock mw.message to serialize keys and arguments for assertion
		global.mw = {
			message: jest.fn( ( key, ...params ) => ( {
				text: () => params.length ? `${ key }:[${ params.join( ',' ) }]` : key,
				parse: () => params.length ? `${ key }:[${ params.join( ',' ) }]` : key
			} ) )
		};
	} );

	const mockEntrypointNoLabel = {
		shouldShow: () => true,
		getConfig: () => ( { url: 'https://example.org' } )
	};

	const mountOptions = ( props = {}, entrypoint = mockEntrypoint ) => ( {
		global: {
			directives: {
				'i18n-html': ( el, binding ) => {
					const val = binding.value;
					el.innerHTML = ( val && typeof val.text === 'function' ) ? val.text() : val;
				}
			}
		},
		props: {
			entrypoints: [ entrypoint ],
			languages: { en: 'English' }, // english is present
			suggestions: [ 'fr' ], // french is missing
			preferredLanguages: [],
			...props
		}
	} );

	it( 'renders as a native button and emits click with the actions', async () => {
		const wrapper = shallowMount( MissingLanguagesEntrypoint, mountOptions() );
		const root = wrapper.find( 'button.uls-rewrite__missing-languages' );

		expect( root.exists() ).toBe( true );
		expect( root.attributes( 'type' ) ).toBe( 'button' );

		await root.trigger( 'click' );
		expect( wrapper.emitted( 'click' ) ).toHaveLength( 1 );
		expect( wrapper.emitted( 'click' )[ 0 ][ 0 ] ).toEqual( [ mockAction ] );
	} );

	it( 'renders single language missing message when one suggestion is missing', () => {
		const wrapper = shallowMount( MissingLanguagesEntrypoint, mountOptions( {
			suggestions: [ 'en', 'fr' ], // en present, fr missing
			languages: { en: 'English' }
		}, mockEntrypointNoLabel ) );
		const label = wrapper.find( '.uls-rewrite__missing-languages__label' );
		expect( label.text() ).toBe( 'ext-uls-missing-languages-label-single:[français]' );
	} );

	it( 'renders 2 languages missing message when two or more suggestions are missing', () => {
		const wrapper = shallowMount( MissingLanguagesEntrypoint, mountOptions( {
			suggestions: [ 'en', 'fr', 'es', 'de' ], // fr, es, de missing
			languages: { en: 'English' }
		}, mockEntrypointNoLabel ) );
		const label = wrapper.find( '.uls-rewrite__missing-languages__label' );
		// Should list the first two missing autonyms
		expect( label.text() ).toBe( 'ext-uls-missing-languages-label-multiple:[français,español]' );
	} );

	it( 'uses preferredLanguages instead of suggestions when preferredLanguages is populated', () => {
		const wrapper = shallowMount( MissingLanguagesEntrypoint, mountOptions( {
			suggestions: [ 'de' ], // de missing suggestions
			preferredLanguages: [ 'es' ], // es missing preferred languages
			languages: { en: 'English' }
		}, mockEntrypointNoLabel ) );
		const label = wrapper.find( '.uls-rewrite__missing-languages__label' );
		// Should use preferredLanguages ('es' -> español)
		expect( label.text() ).toBe( 'ext-uls-missing-languages-label-single:[español]' );
	} );
} );
