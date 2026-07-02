'use strict';

const Vue = require( 'vue' );
Vue.createMwApp = Vue.createMwApp || Vue.createApp;
const { mount } = require( '@vue/test-utils' );
const QuickActionTrigger = require( '../../../resources/ext.uls.rewrite/entrypoints/QuickActionTrigger.vue' );
const { CdxButton, CdxIcon } = require( '../../../resources/ext.uls.rewrite/codex.js' );

describe( 'QuickActionTrigger', () => {
	beforeAll( () => {
		global.mw = {
			msg: jest.fn( ( key ) => key )
		};
	} );

	it( 'renders nothing when actions list is empty', () => {
		const wrapper = mount( QuickActionTrigger, {
			props: {
				entrypoints: []
			}
		} );
		expect( wrapper.find( '.uls-quick-action-trigger' ).exists() ).toBe( false );
	} );

	it( 'renders nothing when shouldShow is false for all entrypoints', () => {
		const mockEntrypoint = {
			shouldShow: () => false,
			getConfig: () => ( { label: 'Translate', url: 'https://example.org' } )
		};
		const wrapper = mount( QuickActionTrigger, {
			props: {
				entrypoints: [ mockEntrypoint ]
			}
		} );
		expect( wrapper.find( '.uls-quick-action-trigger' ).exists() ).toBe( false );
	} );

	describe( 'single action', () => {
		it( 'renders <a> link with icon when action has a url', () => {
			const action = { label: 'Translate', url: 'https://example.org', icon: 'translate' };
			const mockEntrypoint = {
				shouldShow: () => true,
				getConfig: () => action
			};

			const wrapper = mount( QuickActionTrigger, {
				props: {
					entrypoints: [ mockEntrypoint ]
				}
			} );

			const link = wrapper.find( 'a' );
			expect( link.exists() ).toBe( true );
			expect( link.attributes( 'href' ) ).toBe( 'https://example.org' );
			expect( link.attributes( 'aria-label' ) ).toBe( 'Translate' );

			const icon = wrapper.findComponent( CdxIcon );
			expect( icon.exists() ).toBe( true );
			expect( icon.props( 'icon' ) ).toBe( 'translate' );
		} );

		it( 'renders <cdx-button> with icon and triggers handler on click when action has no url', async () => {
			const handler = jest.fn();
			const action = { label: 'Settings', handler, icon: 'settings' };
			const mockEntrypoint = {
				shouldShow: () => true,
				getConfig: () => action
			};

			const wrapper = mount( QuickActionTrigger, {
				props: {
					entrypoints: [ mockEntrypoint ]
				}
			} );

			const button = wrapper.findComponent( CdxButton );
			expect( button.exists() ).toBe( true );
			expect( button.attributes( 'aria-label' ) ).toBe( 'Settings' );

			const icon = wrapper.findComponent( CdxIcon );
			expect( icon.exists() ).toBe( true );
			expect( icon.props( 'icon' ) ).toBe( 'settings' );

			await button.trigger( 'click' );
			expect( handler ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'multiple actions', () => {
		it( 'renders ellipsis button and emits trigger event on click', async () => {
			const action1 = { label: 'Translate', url: 'https://example.org' };
			const action2 = { label: 'Settings', handler: jest.fn() };
			const entrypoint1 = { shouldShow: () => true, getConfig: () => action1 };
			const entrypoint2 = { shouldShow: () => true, getConfig: () => action2 };

			const wrapper = mount( QuickActionTrigger, {
				props: {
					entrypoints: [ entrypoint1, entrypoint2 ]
				}
			} );

			const button = wrapper.findComponent( CdxButton );
			expect( button.exists() ).toBe( true );
			expect( button.attributes( 'aria-label' ) ).toBe( 'ext-uls-open-quick-actions' );

			await button.trigger( 'click' );
			expect( wrapper.emitted( 'trigger' ) ).toBeTruthy();
			expect( wrapper.emitted( 'trigger' )[ 0 ][ 0 ] ).toEqual( [ action1, action2 ] );
		} );

		it( 'onTriggerClick does nothing if actionToDisplay is falsy', () => {
			const wrapper = mount( QuickActionTrigger, {
				props: {
					entrypoints: []
				}
			} );
			expect( wrapper.vm.onTriggerClick() ).toBeUndefined();
			expect( wrapper.emitted( 'trigger' ) ).toBeFalsy();
		} );
	} );
} );
