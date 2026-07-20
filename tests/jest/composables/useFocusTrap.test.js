'use strict';

const { defineComponent, ref, computed, h } = require( 'vue' );
const { mount } = require( '@vue/test-utils' );
const useFocusTrap = require( '../../../resources/ext.uls.rewrite/composables/useFocusTrap.js' );

describe( 'useFocusTrap', () => {
	let wrapper;

	// jsdom does not do layout, so getClientRects() is always empty there.
	// Pretend every element is rendered; visibility filtering is exercised
	// via the aria-hidden test case instead.
	beforeAll( () => {
		Element.prototype.getClientRects = jest.fn( () => [ {} ] );
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	const TestComponent = defineComponent( {
		name: 'FocusTrapHost',
		props: {
			active: {
				type: Boolean,
				default: true
			}
		},
		setup( props ) {
			const containerRef = ref( null );
			useFocusTrap( containerRef, computed( () => props.active ), document );
			return () => h( 'div', { ref: containerRef }, [
				h( 'button', { id: 'first' }, 'First' ),
				h( 'button', { id: 'middle' }, 'Middle' ),
				// Mirrors the typeahead ghost input: visually rendered but
				// hidden from assistive technology.
				h( 'div', { 'aria-hidden': 'true' }, [
					h( 'button', { id: 'ghost' }, 'Ghost' )
				] ),
				h( 'button', { id: 'last' }, 'Last' ),
				// Mirrors the language links: anchors with an href but
				// removed from the tab order.
				h( 'a', { id: 'link', href: '#', tabindex: '-1' }, 'Link' )
			] );
		}
	} );

	const mountTrap = ( props = {} ) => mount(
		TestComponent,
		{ props, attachTo: document.body }
	);

	const pressTab = ( shiftKey = false ) => {
		const event = new KeyboardEvent( 'keydown', {
			key: 'Tab',
			shiftKey,
			bubbles: true,
			cancelable: true
		} );
		document.dispatchEvent( event );
		return event;
	};

	it( 'wraps Tab from the last focusable element to the first, skipping tabindex="-1" elements', () => {
		wrapper = mountTrap();
		document.getElementById( 'last' ).focus();

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( true );
		// 'link' has tabindex="-1", so the trap must treat 'last' as the
		// final focusable element.
		expect( document.activeElement.id ).toBe( 'first' );
	} );

	it( 'wraps Shift+Tab from the first focusable element to the last, skipping aria-hidden elements', () => {
		wrapper = mountTrap();
		document.getElementById( 'first' ).focus();

		const event = pressTab( true );

		expect( event.defaultPrevented ).toBe( true );
		// 'ghost' is inside an aria-hidden wrapper, so the trap must treat
		// 'last' as the final focusable element.
		expect( document.activeElement.id ).toBe( 'last' );
	} );

	it( 'lets Tab through when focus is not at a boundary', () => {
		wrapper = mountTrap();
		document.getElementById( 'middle' ).focus();

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( false );
		expect( document.activeElement.id ).toBe( 'middle' );
	} );

	it( 'pulls focus back inside when it has escaped the container', () => {
		wrapper = mountTrap();
		const outside = document.createElement( 'button' );
		document.body.appendChild( outside );
		outside.focus();

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( true );
		expect( document.activeElement.id ).toBe( 'first' );
		outside.remove();
	} );

	it( 'does nothing while inactive', () => {
		wrapper = mountTrap( { active: false } );
		document.getElementById( 'last' ).focus();

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( false );
		expect( document.activeElement.id ).toBe( 'last' );
	} );

	it( 'stops trapping after unmount', () => {
		wrapper = mountTrap();
		document.getElementById( 'last' ).focus();
		wrapper.unmount();
		wrapper = null;

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( false );
	} );

	it( 'does nothing when containerRef.value is null', () => {
		const TestComponentNullContainer = defineComponent( {
			setup() {
				const containerRef = ref( null );
				useFocusTrap( containerRef, ref( true ), document );
				return () => h( 'div' );
			}
		} );
		wrapper = mount( TestComponentNullContainer, { attachTo: document.body } );

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( false );
	} );

	it( 'prevents default when container has no focusable elements', () => {
		const TestEmptyContainerComponent = defineComponent( {
			setup() {
				const containerRef = ref( null );
				useFocusTrap( containerRef, ref( true ), document );
				return () => h( 'div', { ref: containerRef }, [ 'No focusable elements here' ] );
			}
		} );
		wrapper = mount( TestEmptyContainerComponent, { attachTo: document.body } );

		const event = pressTab();

		expect( event.defaultPrevented ).toBe( true );
	} );
} );
