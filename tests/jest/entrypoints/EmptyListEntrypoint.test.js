'use strict';

const Vue = require( 'vue' );
Vue.createMwApp = Vue.createMwApp || Vue.createApp;
const { shallowMount } = require( '@vue/test-utils' );
const EmptyListEntrypoint = require( '../../../resources/ext.uls.rewrite/entrypoints/EmptyListEntrypoint.vue' );
const EntrypointActionButton = require( '../../../resources/ext.uls.rewrite/entrypoints/EntrypointActionButton.vue' );

describe( 'EmptyListEntrypoint', () => {
	const config = { label: 'Action 1', url: 'https://example.org' };
	const mockEntrypoint = {
		shouldShow: () => true,
		getConfig: () => config
	};

	it( 'renders the description paragraph and action buttons', () => {
		const wrapper = shallowMount( EmptyListEntrypoint, {
			global: {
				mocks: {
					$i18n: ( key ) => ( {
						text: () => key,
						toString: () => key
					} )
				}
			},
			props: {
				entrypoints: [ mockEntrypoint ],
				suggestions: [],
				languages: []
			}
		} );

		// Verify description is rendered
		expect( wrapper.find( 'p' ).text() ).toBe( 'ext-uls-empty-state-entrypoint-description' );

		// Verify EntrypointActionButton components are rendered
		const actionButtons = wrapper.findAllComponents( EntrypointActionButton );
		expect( actionButtons.length ).toBe( 1 );
		expect( actionButtons.at( 0 ).props( 'action' ) ).toEqual( config );
	} );

	it( 'does not render action buttons when shouldShow is false', () => {
		const mockEntrypointHidden = {
			shouldShow: () => false,
			getConfig: () => config
		};
		const wrapper = shallowMount( EmptyListEntrypoint, {
			global: {
				mocks: {
					$i18n: ( key ) => ( {
						text: () => key,
						toString: () => key
					} )
				}
			},
			props: {
				entrypoints: [ mockEntrypointHidden ],
				suggestions: [],
				languages: []
			}
		} );

		const actionButtons = wrapper.findAllComponents( EntrypointActionButton );
		expect( actionButtons.length ).toBe( 0 );
	} );
} );
