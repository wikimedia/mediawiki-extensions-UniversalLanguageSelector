'use strict';

let scheduledCallback = null;
mw.requestIdleCallback = jest.fn( ( cb ) => {
	scheduledCallback = cb;
} );

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - progressive rendering integration', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'slices visible language codes progressively when total languages exceed renderLimit and grows on idle callback', async () => {
		const { generateLanguages } = require( '../mocks/uls-test-helpers.js' );

		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 50 )
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// 1. Initially (before idle callback runs), the list is sliced to the renderLimit (40 items)
		let items = wrapper.findAll( '.uls-rewrite__section--all .uls-rewrite__language-item' );
		expect( items ).toHaveLength( 40 );

		// 2. Simulate requestIdleCallback firing to progressively render the rest of the list
		expect( scheduledCallback ).toBeDefined();
		scheduledCallback();
		await wrapper.vm.$nextTick();

		// 3. After the idle slice step executes, the limit grows and renders the full list (50 items)
		items = wrapper.findAll( '.uls-rewrite__section--all .uls-rewrite__language-item' );
		expect( items ).toHaveLength( 50 );
	} );
} );
