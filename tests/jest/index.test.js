'use strict';

const { mount } = require( '@vue/test-utils' );

// Mock the child component to keep tests lightweight and completely isolated
jest.mock( '../../resources/ext.uls.rewrite/UniversalLanguageSelector.vue', () => ( {
	name: 'UniversalLanguageSelector',
	template: '<div><slot></slot></div>',
	props: [
		'visible'
		// more props here
	],
	emits: [ 'close', 'select' ]
} ) );

const { createUniversalLanguageSelector } = require( '../../resources/ext.uls.rewrite/index.js' );

describe( 'createUniversalLanguageSelector wrapper', () => {
	let config;

	beforeEach( () => {
		config = {
			triggerElement: document.createElement( 'button' ),
			mode: 'interface',
			placeholder: 'Search language',
			displayLanguageCode: 'en',
			languageAnnotations: { fr: 'French annotation' },
			selectableLanguages: [ 'en', 'fr', 'es' ],
			variantsByLanguage: { en: { 'en-us': 'US English' } },
			variantAnnotationsByLanguage: { en: { 'en-us': 'US English annotation' } },
			hideActiveLanguages: true,
			floatingOptions: { placement: 'bottom-start' },
			onSelect: jest.fn(),
			onClose: jest.fn()
		};
	} );

	it( 'uses default visibility if not specified', () => {
		const app = createUniversalLanguageSelector( config );
		const wrapper = mount( app._component );

		expect( wrapper.vm.visible ).toBe( true );

		const child = wrapper.findComponent( { name: 'UniversalLanguageSelector' } );
		expect( child.exists() ).toBe( true );
		expect( child.props( 'visible' ) ).toBe( true );
	} );

	it( 'uses specified visibility = false', () => {
		config.visible = false;
		const app = createUniversalLanguageSelector( config );
		const wrapper = mount( app._component );

		expect( wrapper.vm.visible ).toBe( false );

		const child = wrapper.findComponent( { name: 'UniversalLanguageSelector' } );
		expect( child.props( 'visible' ) ).toBe( false );
	} );

	it( 'trigger onClose callback on close() method call', async () => {
		const app = createUniversalLanguageSelector( config );
		const wrapper = mount( app._component );

		wrapper.vm.close();
		await wrapper.vm.$nextTick();
		expect( wrapper.vm.visible ).toBe( false );
		expect( config.onClose ).toHaveBeenCalled();

		const child = wrapper.findComponent( { name: 'UniversalLanguageSelector' } );
		expect( child.props( 'visible' ) ).toBe( false );
	} );

	it( 'trigger onSelect callback on select() method call', async () => {
		const app = createUniversalLanguageSelector( config );
		const wrapper = mount( app._component );

		wrapper.vm.select( 'fr' );
		await wrapper.vm.$nextTick();
		expect( wrapper.vm.visible ).toBe( false );
		expect( config.onSelect ).toHaveBeenCalledWith( 'fr' );

		const child = wrapper.findComponent( { name: 'UniversalLanguageSelector' } );
		expect( child.props( 'visible' ) ).toBe( false );
	} );

	it( 'toggles visibility on toggle() method call', async () => {
		const app = createUniversalLanguageSelector( config );
		const wrapper = mount( app._component );
		const child = wrapper.findComponent( { name: 'UniversalLanguageSelector' } );

		expect( wrapper.vm.visible ).toBe( true );
		expect( child.props( 'visible' ) ).toBe( true );

		wrapper.vm.toggle();
		await wrapper.vm.$nextTick();
		expect( wrapper.vm.visible ).toBe( false );
		expect( child.props( 'visible' ) ).toBe( false );

		wrapper.vm.toggle();
		await wrapper.vm.$nextTick();
		expect( wrapper.vm.visible ).toBe( true );
		expect( child.props( 'visible' ) ).toBe( true );
	} );

	it( 'sets visibility to true on open() method call', async () => {
		config.visible = false;
		const app = createUniversalLanguageSelector( config );
		const wrapper = mount( app._component );
		const child = wrapper.findComponent( { name: 'UniversalLanguageSelector' } );

		expect( wrapper.vm.visible ).toBe( false );
		expect( child.props( 'visible' ) ).toBe( false );

		wrapper.vm.open();
		await wrapper.vm.$nextTick();
		expect( wrapper.vm.visible ).toBe( true );
		expect( child.props( 'visible' ) ).toBe( true );
	} );
} );
