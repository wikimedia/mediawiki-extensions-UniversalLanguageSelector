'use strict';

const { shallowMount } = require( '@vue/test-utils' );

const mockApiGet = jest.fn();

function setMobileMode( isMobile ) {
	window.matchMedia.mockImplementation( ( query ) => ( {
		matches: isMobile,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn()
	} ) );
}

const createWrapper = ( props = {}, options = {} ) => {
	const UniversalLanguageSelector = require( '../../../resources/ext.uls.rewrite/UniversalLanguageSelector.vue' );
	const trigger = document.createElement( 'button' );
	// Split the global mount options out so caller-supplied options merge
	// with the defaults instead of replacing them wholesale.
	const { global: globalOptions = {}, ...restOptions } = options;
	return shallowMount( UniversalLanguageSelector, {
		global: {
			...globalOptions,
			mocks: {
				$i18n: ( key ) => ( { text: () => key, toString: () => key } ),
				...globalOptions.mocks
			},
			stubs: {
				CdxSearchInput: false,
				...globalOptions.stubs
			}
		},
		props: {
			triggerElement: trigger,
			visible: true,
			selectableLanguages: { en: 'English', fr: 'Français' },
			selected: [ 'en' ],
			mode: 'interface',
			...props
		},
		...restOptions
	} );
};

module.exports = {
	mockApiGet,
	setMobileMode,
	createWrapper
};
