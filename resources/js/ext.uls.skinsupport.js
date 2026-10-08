/**
 * What ULS does differently on each skin.
 */

'use strict';

/**
 * @return {boolean} Whether the new language selector is enabled for this page.
 */
function isULSV2Enabled() {
	return !!mw.config.get( 'wgULSLanguageSelectorV2Enabled' );
}

/**
 * @return {boolean} Whether the content selector offers the language settings action.
 */
function hasLanguageSettingsQuickAction() {
	return mw.config.get( 'skin' ) !== 'minerva';
}

/**
 * @return {boolean} Whether the content selector shows language descriptions.
 */
function hasLanguageDescriptions() {
	return mw.config.get( 'skin' ) === 'minerva';
}

/**
 * @return {string|null} Floating placement for the content selector, or null for the default.
 */
function getFloatingPlacement() {
	return mw.config.get( 'skin' ) === 'minerva' ? 'bottom-start' : null;
}

/**
 * @return {boolean} Whether the skin shows an empty language dropdown on this page.
 */
function hasEmptyLanguageDropdown() {
	return mw.config.get( 'skin' ) === 'vector-2022' &&
		!!mw.config.get( 'wgULSisLanguageSelectorEmpty' );
}

/**
 * @return {boolean} Whether ULS binds the content language selector on this page.
 */
function isContentLanguageSelectorEnabled() {
	return !!(
		mw.config.get( 'wgULSisCompactLinksEnabled' ) ||
		mw.config.get( 'wgVector2022LanguageInHeader' ) ||
		// Minerva renders its own trigger, but only for the new selector
		( mw.config.get( 'skin' ) === 'minerva' && isULSV2Enabled() )
	);
}

module.exports = {
	hasLanguageSettingsQuickAction,
	hasLanguageDescriptions,
	getFloatingPlacement,
	hasEmptyLanguageDropdown,
	isContentLanguageSelectorEnabled
};
