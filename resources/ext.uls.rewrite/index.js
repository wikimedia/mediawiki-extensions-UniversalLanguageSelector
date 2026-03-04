'use strict';

const Vue = require( 'vue' );
const { h } = Vue;
const UniversalLanguageSelector = require( './UniversalLanguageSelector.vue' );

/**
 * Create a Vue application for the UniversalLanguageSelector component.
 *
 * @param {Object} config
 * @param {Object} config.triggerElement Element that triggers the ULS to open/close
 * @param {Object} config.selectableLanguages (Optional) List of languages that can be selected.
 * @param {string} [config.placeholder] (Optional) Placeholder text in the search input
 * @param {Function} [config.onClose] (Optional) Callback function to execute when the ULS is closed
 * @param {Function} [config.onSelect] (Optional) Callback function to execute when a language is
 * selected. Receives the selected language code and value as arguments.
 * @param {Object} [config.slots] (Optional) Vue slots to customize the ULS content
 * @param {boolean} [config.isMobile] (Optional) Whether to render the mobile version of the ULS.
 * By default, it checks the MediaWiki configuration for mobile mode.
 * @return {Object} The Vue application instance.
 */
function createUniversalLanguageSelector( config ) {
	const {
		triggerElement,
		selectableLanguages,
		selected,
		placeholder,
		onClose,
		onSelect,
		slots,
		isMobile
	} = config;

	return Vue.createMwApp( {
		name: 'UniversalLanguageSelectorWrapper',
		data() {
			return {
				visible: true,
				isMobile: isMobile,
				currentSelected: selected || []
			};
		},
		methods: {
			close() {
				this.visible = false;
				if ( onClose ) {
					onClose();
				}
			},
			toggle() {
				if ( this.visible ) {
					this.close();
				} else {
					this.visible = true;
				}
			},
			select( language ) {
				this.currentSelected = [ language.code ];
				this.visible = false;
				if ( onSelect ) {
					onSelect( language );
				}
			}
		},
		render() {
			const useMobileLayout = this.isMobile !== undefined ?
				this.isMobile :
				( typeof mw !== 'undefined' && !!mw.config.get( 'wgMFMode' ) );

			return h( UniversalLanguageSelector, {
				triggerElement: triggerElement,
				visible: this.visible,
				placeholder: placeholder,
				selectableLanguages: selectableLanguages,
				selected: this.currentSelected,
				onClose: this.close,
				onSelect: this.select,
				isMobile: useMobileLayout
			}, slots );
		}
	} );
}

module.exports = {
	UniversalLanguageSelector,
	createUniversalLanguageSelector
};
