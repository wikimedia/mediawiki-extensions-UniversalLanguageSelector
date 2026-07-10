'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const { nextTick } = require( 'vue' );

describe( 'UniversalLanguageSelector - view panels switcher', () => {
	let wrapper;

	beforeEach( () => {
		wrapper = createWrapper( { visible: true }, {
			attachTo: document.body,
			global: {
				stubs: {
					LanguageSelectorPanelHeader: false
				}
			}
		} );
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'starts in VIEW.MAIN by default', () => {
		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.MAIN );
		expect( wrapper.findComponent( { name: 'LanguageSelectorPanelHeader' } ).exists() ).toBe( false );
		expect( wrapper.find( '.uls-rewrite__search-wrapper' ).exists() ).toBe( true );
	} );

	it( 'transitions to VIEW.MISSING_CONTENT_LANGUAGES and displays the correct panel header title', async () => {
		const mockActions = [ { label: 'Action 1', handler: jest.fn() } ];
		await wrapper.vm.showMissingLanguagesPanel( mockActions );

		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.MISSING_CONTENT_LANGUAGES );
		expect( wrapper.vm.panelTitle ).toBe( 'ext-uls-missing-languages-panel-title' );

		const header = wrapper.findComponent( { name: 'LanguageSelectorPanelHeader' } );
		expect( header.exists() ).toBe( true );
		expect( header.props( 'title' ) ).toBe( 'ext-uls-missing-languages-panel-title' );

		const panel = wrapper.findComponent( { name: 'MissingLanguagesPanel' } );
		expect( panel.exists() ).toBe( true );
		expect( panel.props( 'actions' ) ).toEqual( mockActions );

		// Verify focusTitle is called on the next tick and the title element is focused
		await nextTick();
		const titleElement = wrapper.find( '.uls-rewrite__header__panel-title' );
		expect( titleElement.exists() ).toBe( true );
		expect( document.activeElement ).toBe( titleElement.element );
	} );

	it( 'transitions to VIEW.QUICK_ACTIONS and displays the correct panel header title', async () => {
		const mockActions = [ { label: 'Action 2', handler: jest.fn() } ];
		await wrapper.vm.showQuickActionsPanel( mockActions );

		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.QUICK_ACTIONS );
		expect( wrapper.vm.panelTitle ).toBe( 'ext-uls-quick-actions-panel-title' );

		const header = wrapper.findComponent( { name: 'LanguageSelectorPanelHeader' } );
		expect( header.exists() ).toBe( true );
		expect( header.props( 'title' ) ).toBe( 'ext-uls-quick-actions-panel-title' );

		const panel = wrapper.findComponent( { name: 'QuickActionsPanel' } );
		expect( panel.exists() ).toBe( true );
		expect( panel.props( 'actions' ) ).toEqual( mockActions );

		// Verify focusTitle is called on the next tick and the title element is focused
		await nextTick();
		const titleElement = wrapper.find( '.uls-rewrite__header__panel-title' );
		expect( titleElement.exists() ).toBe( true );
		expect( document.activeElement ).toBe( titleElement.element );
	} );

	it( 'transitions back to VIEW.MAIN when back is triggered from the panel header', async () => {
		await wrapper.vm.showQuickActionsPanel( [] );
		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.QUICK_ACTIONS );

		const header = wrapper.findComponent( { name: 'LanguageSelectorPanelHeader' } );
		await header.vm.$emit( 'back' );

		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.MAIN );
		expect( wrapper.findComponent( { name: 'LanguageSelectorPanelHeader' } ).exists() ).toBe( false );
		expect( wrapper.find( '.uls-rewrite__search-wrapper' ).exists() ).toBe( true );
	} );

	it( 'transitions back to VIEW.MAIN when showLanguageSelector is called directly', async () => {
		await wrapper.vm.showQuickActionsPanel( [] );
		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.QUICK_ACTIONS );

		await wrapper.vm.showLanguageSelector();

		expect( wrapper.vm.currentView ).toBe( wrapper.vm.VIEW.MAIN );
		expect( wrapper.findComponent( { name: 'LanguageSelectorPanelHeader' } ).exists() ).toBe( false );
		expect( wrapper.find( '.uls-rewrite__search-wrapper' ).exists() ).toBe( true );
	} );
} );
