'use strict';

const { shallowMount } = require( '@vue/test-utils' );
const QuickActionsPanel = require( '../../../resources/ext.uls.rewrite/entrypoints/QuickActionsPanel.vue' );
const EntrypointActionButton = require( '../../../resources/ext.uls.rewrite/entrypoints/EntrypointActionButton.vue' );

describe( 'QuickActionsPanel', () => {
	it( 'renders action buttons for each action', () => {
		const actions = [
			{ label: 'Action 1', url: 'https://example.org' },
			{ label: 'Action 2', handler: () => {} }
		];
		const wrapper = shallowMount( QuickActionsPanel, {
			props: {
				actions
			}
		} );

		// Verify EntrypointActionButton components are rendered
		const actionButtons = wrapper.findAllComponents( EntrypointActionButton );
		expect( actionButtons.length ).toBe( 2 );

		// Verify first action button props
		const button1 = actionButtons.at( 0 );
		expect( button1.props( 'action' ).label ).toBe( actions[ 0 ].label );
		expect( button1.props( 'action' ).url ).toBe( actions[ 0 ].url );

		// Verify second action button props
		const button2 = actionButtons.at( 1 );
		expect( button2.props( 'action' ).label ).toBe( actions[ 1 ].label );
		expect( button2.props( 'action' ).handler ).toBe( actions[ 1 ].handler );
	} );
} );
