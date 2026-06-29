'use strict';

const Vue = require( 'vue' );
Vue.createMwApp = Vue.createMwApp || Vue.createApp;
const { shallowMount } = require( '@vue/test-utils' );
const EntrypointActionButton = require( '../../../resources/ext.uls.rewrite/entrypoints/EntrypointActionButton.vue' );

describe( 'EntrypointActionButton', () => {
	it( 'renders <a> link when action has a url', () => {
		const wrapper = shallowMount( EntrypointActionButton, {
			props: { action: { label: 'Translate', url: 'https://example.org' } }
		} );
		const link = wrapper.find( 'a' );
		expect( link.exists() ).toBe( true );
		expect( link.attributes( 'href' ) ).toBe( 'https://example.org' );
		expect( link.text() ).toContain( 'Translate' );
	} );

	it( 'renders <cdx-button> and calls handler on click when action has no url', async () => {
		const handler = jest.fn();
		const wrapper = shallowMount( EntrypointActionButton, {
			props: { action: { label: 'Open settings', handler } }
		} );
		expect( wrapper.find( 'a' ).exists() ).toBe( false );

		await wrapper.findComponent( { name: 'CdxButton' } ).trigger( 'click' );
		expect( handler ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'applies the buttonAction class to the link', () => {
		const wrapper = shallowMount( EntrypointActionButton, {
			props: {
				action: { label: 'Go', url: '/go' },
				buttonAction: 'default'
			}
		} );
		expect( wrapper.find( 'a' ).classes() ).toContain( 'cdx-button--action-default' );
	} );

	it( 'renders icon with default size when action has an icon', () => {
		const wrapper = shallowMount( EntrypointActionButton, {
			props: { action: { label: 'Translate', url: 'https://example.org', icon: 'translate' } }
		} );
		const icon = wrapper.findComponent( { name: 'CdxIcon' } );
		expect( icon.exists() ).toBe( true );
		expect( icon.props( 'icon' ) ).toBe( 'translate' );
		expect( icon.props( 'size' ) ).toBe( 'medium' );
	} );

	it( 'renders icon with specified size when iconSize is passed', () => {
		const wrapper = shallowMount( EntrypointActionButton, {
			props: {
				action: { label: 'Translate', url: 'https://example.org', icon: 'translate' },
				iconSize: 'small'
			}
		} );
		const icon = wrapper.findComponent( { name: 'CdxIcon' } );
		expect( icon.exists() ).toBe( true );
		expect( icon.props( 'size' ) ).toBe( 'small' );
	} );

	it( 'icon does not exist when action has no icon', () => {
		const wrapper = shallowMount( EntrypointActionButton, {
			props: { action: { label: 'Translate', url: 'https://example.org' } }
		} );
		const icon = wrapper.findComponent( { name: 'CdxIcon' } );
		expect( icon.exists() ).toBe( false );
	} );
} );
