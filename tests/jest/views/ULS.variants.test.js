'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

const RENDER_LIST = { global: { stubs: { LanguageList: false } } };

describe( 'UniversalLanguageSelector - variants', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'renders the variants section when the selected language has variants', () => {
		wrapper = createWrapper( {
			selected: [ 'zh' ],
			variantsByLanguage: {
				zh: {
					'zh-hans': '简体中文',
					'zh-hant': '繁體中文'
				}
			}
		}, RENDER_LIST );

		const variantsSection = wrapper.find( '.uls-rewrite__section--variants' );
		expect( variantsSection.exists() ).toBe( true );

		const title = variantsSection.find( '.uls-rewrite__section-title' );
		expect( title.text() ).toBe( 'ext-uls-variants-title' );

		const items = variantsSection.findAll( '.uls-rewrite__language-item' );
		expect( items.length ).toBe( 2 );
		expect( items.at( 0 ).attributes( 'data-language-code' ) ).toBe( 'zh-hans' );
		expect( items.at( 1 ).attributes( 'data-language-code' ) ).toBe( 'zh-hant' );
	} );

	it( 'does not render the variants section when the selected language has no variants', () => {
		wrapper = createWrapper( {
			selected: [ 'en' ],
			variantsByLanguage: {
				zh: {
					'zh-hans': '简体中文',
					'zh-hant': '繁體中文'
				}
			}
		}, RENDER_LIST );

		const variantsSection = wrapper.find( '.uls-rewrite__section--variants' );
		expect( variantsSection.exists() ).toBe( false );
	} );

	it( 'renders variants with annotations when variantAnnotationsByLanguage is provided', () => {
		wrapper = createWrapper( {
			selected: [ 'zh' ],
			variantsByLanguage: {
				zh: {
					'zh-hans': '简体中文',
					'zh-hant': '繁體中文'
				}
			},
			variantAnnotationsByLanguage: {
				zh: {
					'zh-hans': { description: 'Simplified' },
					'zh-hant': { description: 'Traditional' }
				}
			}
		}, RENDER_LIST );

		const variantsSection = wrapper.find( '.uls-rewrite__section--variants' );
		const items = variantsSection.findAll( '.uls-rewrite__language-item' );

		const annotation1 = items.at( 0 ).find( '.uls-rewrite__language-item--description' );
		expect( annotation1.exists() ).toBe( true );
		expect( annotation1.text() ).toBe( 'Simplified' );

		const annotation2 = items.at( 1 ).find( '.uls-rewrite__language-item--description' );
		expect( annotation2.exists() ).toBe( true );
		expect( annotation2.text() ).toBe( 'Traditional' );
	} );

	it( 'hides the variants section when there is an active search query', async () => {
		wrapper = createWrapper( {
			selected: [ 'zh' ],
			variantsByLanguage: {
				zh: {
					'zh-hans': '简体中文',
					'zh-hant': '繁體中文'
				}
			}
		}, RENDER_LIST );

		expect( wrapper.find( '.uls-rewrite__section--variants' ).exists() ).toBe( true );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		await activeInput.find( 'input' ).setValue( 'foo' );

		expect( wrapper.find( '.uls-rewrite__section--variants' ).exists() ).toBe( false );
	} );
} );
