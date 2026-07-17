'use strict';

const { nextTick } = require( 'vue' );
const { setMobileMode, createWrapper: baseCreateWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - close behaviour', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		setMobileMode( false );
	} );

	const createWrapper = ( props = {}, options = {} ) => baseCreateWrapper( {
		onClose: async () => {
			await wrapper.setProps( { visible: false } );
		},
		...props
	}, options );

	it( 'emits the close event when escape key is pressed', async () => {
		wrapper = createWrapper();

		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );

		const container = wrapper.find( '.uls-rewrite' );
		await container.trigger( 'keydown.esc' );

		expect( wrapper.emitted().close ).toBeTruthy();
		expect( wrapper.emitted().close ).toHaveLength( 1 );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( false );
	} );

	it( 'emits the close event when the close button is clicked on mobile', async () => {
		setMobileMode( true );
		wrapper = createWrapper();

		const { CdxButton } = require( '@wikimedia/codex' );

		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );

		const closeButton = wrapper.findComponent( CdxButton );
		expect( closeButton.exists() ).toBe( true );
		await closeButton.trigger( 'click' );

		expect( wrapper.emitted().close ).toBeTruthy();
		expect( wrapper.emitted().close ).toHaveLength( 1 );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( false );
	} );

	it( 'emits the close event when clicking outside the selector', async () => {
		// Attach to the document so the click target is genuinely outside
		// the rendered selector, not just outside a detached node
		wrapper = createWrapper( {}, { attachTo: document.body } );

		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );

		// Dispatch a click event on the body to simulate a click outside
		const clickEvent = new MouseEvent( 'click', {
			bubbles: true,
			cancelable: true
		} );
		document.body.dispatchEvent( clickEvent );

		// Wait for Vue's render cycle to finish updating the props
		await nextTick();

		expect( wrapper.emitted().close ).toBeTruthy();
		expect( wrapper.emitted().close ).toHaveLength( 1 );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( false );
	} );

	it( 'does not emit the close event when clicking inside the selector', async () => {
		wrapper = createWrapper( {}, { attachTo: document.body } );

		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );

		// A real bubbling click from inside the selector reaches the
		// document listener with a target the selector contains
		const clickEvent = new MouseEvent( 'click', {
			bubbles: true,
			cancelable: true
		} );
		wrapper.get( '.uls-rewrite__header' ).element.dispatchEvent( clickEvent );

		await nextTick();

		expect( wrapper.emitted().close ).toBeUndefined();
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );
	} );

	it( 'emits visible-change on mount and when visibility changes', async () => {
		wrapper = createWrapper();

		expect( wrapper.emitted( 'visible-change' )[ 0 ] ).toEqual( [ true, false ] );

		await wrapper.setProps( { visible: false } );

		expect( wrapper.emitted( 'visible-change' )[ 1 ] ).toEqual( [ false, false ] );
	} );

	it( 'clears the search query and returns to the main view when hidden', async () => {
		// Real panel header: switching views calls its focusTitle() method,
		// which the default stub does not have.
		wrapper = createWrapper( {}, {
			global: { stubs: { LanguageSelectorPanelHeader: false } }
		} );

		await wrapper.get( '.uls-rewrite__search-active' ).setValue( 'xyz' );
		wrapper.vm.showQuickActionsPanel( [] );
		await nextTick();
		expect( wrapper.vm.currentView ).toBe( 'quick-actions' );

		await wrapper.setProps( { visible: false } );

		expect( wrapper.vm.searchQuery ).toBe( '' );
		expect( wrapper.vm.currentView ).toBe( 'main' );
	} );

	it( 'restores focus to the trigger element when hidden', async () => {
		const trigger = document.createElement( 'button' );
		const focusSpy = jest.spyOn( trigger, 'focus' );
		wrapper = createWrapper( { triggerElement: trigger } );
		await nextTick();

		await wrapper.setProps( { visible: false } );

		expect( focusSpy ).toHaveBeenCalled();
	} );

	it( 'does not steal focus when another control holds focus on close', async () => {
		const trigger = document.createElement( 'button' );
		const focusSpy = jest.spyOn( trigger, 'focus' );
		const outsideButton = document.createElement( 'button' );
		document.body.appendChild( outsideButton );

		wrapper = createWrapper( { triggerElement: trigger } );
		await nextTick();
		outsideButton.focus();

		await wrapper.setProps( { visible: false } );

		expect( focusSpy ).not.toHaveBeenCalled();
		outsideButton.remove();
	} );
} );
