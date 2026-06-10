/**
 * NOTE: This is only used by ext.uls.rewrite,
 * which target to use Vue component
 */
( function () {
	'use strict';

	const PREFERENCE_NAME = 'mw-preferred-languages';

	function getLanguages() {
		if ( !mw.user.isNamed() ) {
			return [];
		}

		let languages = mw.user.options.get( PREFERENCE_NAME );
		if ( typeof languages === 'string' && languages !== '' ) {
			try {
				languages = JSON.parse( languages );
			} catch ( e ) {
				languages = [];
			}
		}

		return Array.isArray( languages ) ? languages : [];
	}

	let preferredLanguages = getLanguages();

	function PreferredLanguagesSettings( $parent ) {
		this.nameI18n = 'ext-uls-preferred-languages-settings-title';
		this.descriptionI18n = 'ext-uls-preferred-languages-desc';
		this.$parent = $parent;
		this.dirty = false;
		this.mountPoint = null;
		this.vueApp = null;
		this.selectedLanguages = preferredLanguages;
	}

	PreferredLanguagesSettings.prototype = {
		constructor: PreferredLanguagesSettings,

		render: function () {
			if ( this.vueApp ) {
				this.vueApp.unmount();
				this.vueApp = null;
			}

			this.$parent.$settingsPanel.empty();
			this.mountPoint = document.createElement( 'div' );
			this.$parent.$settingsPanel.append( this.mountPoint );

			const Vue = require( 'vue' );
			const PreferredLanguagesTab = require( '../ext.uls.rewrite/PreferredLanguagesTab.vue' );

			this.vueApp = Vue.createMwApp( PreferredLanguagesTab, {
				initialLanguages: this.selectedLanguages,
				onChange: ( newValue ) => {
					this.selectedLanguages = newValue;
					this.dirty = true;
					this.$parent.enableApplyButton();
				}
			} );
			this.vueApp.mount( this.mountPoint );
		},

		apply: function () {
			if ( !mw.user.isNamed() ) {
				return;
			}

			this.$parent.setBusy( true );

			new mw.Api().saveOption(
				PREFERENCE_NAME,
				JSON.stringify( this.selectedLanguages ),
				{ global: 'create' }
			)
				.then( () => {
					preferredLanguages = this.selectedLanguages;
					mw.user.options.set( PREFERENCE_NAME, JSON.stringify( preferredLanguages ) );
					this.dirty = false;
					this.$parent.hide();
				} )
				.catch( ( error ) => {
					mw.log.error( 'Error saving preferred languages:', error );
					mw.notify( mw.msg( 'ext-uls-preferred-languages-save-error' ), { type: 'error' } );
				} )
				.always( () => {
					this.$parent.setBusy( false );
					this.$parent.disableApplyButton();
				} );
		},

		cancel: function () {
			this.selectedLanguages = preferredLanguages;
			this.dirty = false;
			this.$parent.hide();
		},

		close: function () {
			if ( this.vueApp ) {
				this.vueApp.unmount();
				this.vueApp = null;
			}
			this.$parent.close();
		}
	};

	// Register this module to language settings modules
	if ( mw.user.isNamed() && mw.config.get( 'wgULSLanguageSelectorV2Enabled' ) ) {
		$.fn.languagesettings.modules = Object.assign( $.fn.languagesettings.modules || {}, {
			preferredlanguages: PreferredLanguagesSettings
		} );
	}
}() );
