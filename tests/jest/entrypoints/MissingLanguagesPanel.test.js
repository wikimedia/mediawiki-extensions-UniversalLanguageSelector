'use strict';

const { shallowMount } = require( '@vue/test-utils' );
const MissingLanguagesPanel = require( '../../../resources/ext.uls.rewrite/entrypoints/MissingLanguagesPanel.vue' );
const EntrypointActionButton = require( '../../../resources/ext.uls.rewrite/entrypoints/EntrypointActionButton.vue' );
const { cdxIconEllipsis } = require( '../../../resources/ext.uls.rewrite/icons.json' );

describe( 'MissingLanguagesPanel', () => {
	const mountOptions = ( props = {} ) => ( {
		global: {
			mocks: {
				$i18n: ( key ) => ( {
					text: () => key,
					toString: () => key
				} )
			}
		},
		props
	} );

	it( 'renders nothing when actions is empty', () => {
		const wrapper = shallowMount( MissingLanguagesPanel, mountOptions( {
			actions: []
		} ) );

		const actionButtons = wrapper.findAllComponents( EntrypointActionButton );
		expect( actionButtons.length ).toBe( 0 );
	} );

	it( 'renders action button and ellipsis when there is one action', () => {
		const actions = [
			{ label: 'French', url: 'https://fr.wikipedia.org' }
		];
		const wrapper = shallowMount( MissingLanguagesPanel, mountOptions( {
			actions
		} ) );

		const actionButtons = wrapper.findAllComponents( EntrypointActionButton );
		expect( actionButtons.length ).toBe( 2 );

		// Verify first action button
		expect( actionButtons.at( 0 ).props( 'action' ) ).toEqual( actions[ 0 ] );

		// Verify ellipsis action button
		const ellipsisAction = actionButtons.at( 1 ).props( 'action' );
		expect( ellipsisAction.icon ).toBe( cdxIconEllipsis );
		expect( ellipsisAction.url ).toBe( actions[ 0 ].url );
		expect( ellipsisAction.ariaLabel ).toBe( actions[ 0 ].label );
	} );

	it( 'renders at most 2 actions plus an ellipsis button when there are many actions', () => {
		const actions = [
			{ label: 'French', url: 'https://fr.wikipedia.org' },
			{ label: 'Spanish', url: 'https://es.wikipedia.org' },
			{ label: 'German', url: 'https://de.wikipedia.org' }
		];
		const wrapper = shallowMount( MissingLanguagesPanel, mountOptions( {
			actions
		} ) );

		const actionButtons = wrapper.findAllComponents( EntrypointActionButton );
		// Max 2 actions displayed + 1 ellipsis = 3 buttons
		expect( actionButtons.length ).toBe( 3 );

		// Verify first action button
		expect( actionButtons.at( 0 ).props( 'action' ) ).toEqual( actions[ 0 ] );

		// Verify second action button
		expect( actionButtons.at( 1 ).props( 'action' ) ).toEqual( actions[ 1 ] );

		// Verify ellipsis action button matches the first action's URL
		const ellipsisAction = actionButtons.at( 2 ).props( 'action' );
		expect( ellipsisAction.icon ).toBe( cdxIconEllipsis );
		expect( ellipsisAction.url ).toBe( actions[ 0 ].url );
		expect( ellipsisAction.ariaLabel ).toBe( actions[ 0 ].label );
	} );
} );
