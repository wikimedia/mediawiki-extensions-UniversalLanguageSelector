'use strict';

const { createWrapper, setMobileMode } = require( '../mocks/uls-test-helpers.js' );
const { useFloating, autoUpdate } = require( '../../../resources/ext.uls.rewrite/dist/floating-ui.js' );

describe( 'UniversalLanguageSelector - visible state', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		setMobileMode( false );
		jest.clearAllMocks();
	} );

	it( 'displays the language selector when visible is true', () => {
		wrapper = createWrapper( { visible: true } );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );
	} );

	it( 'does not display the language selector when visible is false', () => {
		wrapper = createWrapper( { visible: false } );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( false );
	} );

	it( 'passes whileElementsMounted: autoUpdate to useFloating', () => {
		wrapper = createWrapper( { visible: false } );
		expect( useFloating ).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.objectContaining( {
				whileElementsMounted: autoUpdate
			} )
		);
	} );

	it( 'passes null as floating reference when visible is false', () => {
		const trigger = document.createElement( 'button' );
		wrapper = createWrapper( { visible: false, triggerElement: trigger } );
		const [ floatingRef ] = useFloating.mock.calls[ useFloating.mock.calls.length - 1 ];
		expect( floatingRef.value ).toBeNull();
	} );

	it( 'passes triggerElement as floating reference when visible is true', () => {
		const trigger = document.createElement( 'button' );
		wrapper = createWrapper( { visible: true, triggerElement: trigger } );
		const [ floatingRef ] = useFloating.mock.calls[ useFloating.mock.calls.length - 1 ];
		expect( floatingRef.value ).toBe( trigger );
	} );

	it( 'updates floating reference dynamically when visible prop changes', async () => {
		const trigger = document.createElement( 'button' );
		wrapper = createWrapper( { visible: false, triggerElement: trigger } );
		const [ floatingRef ] = useFloating.mock.calls[ useFloating.mock.calls.length - 1 ];
		expect( floatingRef.value ).toBeNull();

		await wrapper.setProps( { visible: true } );
		expect( floatingRef.value ).toBe( trigger );

		await wrapper.setProps( { visible: false } );
		expect( floatingRef.value ).toBeNull();
	} );

	it( 'updates floating reference dynamically when triggerElement prop changes', async () => {
		const initialTrigger = document.createElement( 'button' );
		const newTrigger = document.createElement( 'button' );
		wrapper = createWrapper( { visible: true, triggerElement: initialTrigger } );
		const [ floatingRef ] = useFloating.mock.calls[ useFloating.mock.calls.length - 1 ];
		expect( floatingRef.value ).toBe( initialTrigger );

		await wrapper.setProps( { triggerElement: newTrigger } );
		expect( floatingRef.value ).toBe( newTrigger );
	} );

	it( 'keeps floating reference as null in mobile mode even when visible is true', () => {
		setMobileMode( true );
		const trigger = document.createElement( 'button' );
		wrapper = createWrapper( { visible: true, triggerElement: trigger } );
		const [ floatingRef ] = useFloating.mock.calls[ useFloating.mock.calls.length - 1 ];
		expect( floatingRef.value ).toBeNull();
	} );
} );
