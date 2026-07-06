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
} );
