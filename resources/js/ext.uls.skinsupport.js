/**
 * What ULS does differently on each skin.
 */

'use strict';

const skinFeatures = mw.config.get( 'wgULSSkinFeatures' );

/**
 * @return {boolean} Whether the content selector offers the language settings action.
 */
function hasLanguageSettingsQuickAction() {
	return skinFeatures.languageSettingsQuickAction;
}

/**
 * @return {boolean} Whether the content selector shows language descriptions.
 */
function hasLanguageDescriptions() {
	return skinFeatures.languageDescriptions;
}

/**
 * @return {string|null} Floating placement for the content selector, or null for the default.
 */
function getFloatingPlacement() {
	return mw.config.get( 'wgULSFloatingPlacement' );
}

/**
 * @return {boolean} Whether the skin shows an empty language dropdown on this page.
 */
function hasEmptyLanguageDropdown() {
	return document.querySelector( '.mw-portlet-empty-language-selector-body' ) !== null;
}

/**
 * @return {boolean} Whether ULS binds the content language selector on this page.
 */
function isContentLanguageSelectorEnabled() {
	return !!mw.config.get( 'wgULSContentLanguageSelectorEnabled' );
}

module.exports = {
	hasLanguageSettingsQuickAction,
	hasLanguageDescriptions,
	getFloatingPlacement,
	hasEmptyLanguageDropdown,
	isContentLanguageSelectorEnabled
};
