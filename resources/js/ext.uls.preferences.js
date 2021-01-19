/*!
 * ULS preferences system for MediaWiki.
 * Localstorage for anonymous users, preferences for logged in users.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

( function () {
	'use strict';

	var ULSPreferences, instance;

	ULSPreferences = function () {
		// This violates coding conventions for localstorage:
		// https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript#Keys
		this.preferenceName = 'uls-preferences';
		this.username = mw.user.getName();
		this.isAnon = mw.user.isAnon();
		this.preferences = null;
		this.init();
	};

	ULSPreferences.prototype = {
		init: function () {
			if ( this.isAnon ) {
				this.preferences = mw.storage.getObject( this.preferenceName );
			} else {
				try {
					this.preferences = JSON.parse( mw.user.options.get( this.preferenceName ) );
				} catch ( e ) {
				}
			}

			if ( !$.isPlainObject( this.preferences ) ) {
				this.preferences = {};
			}
		},

		/**
		 * Set the preference
		 *
		 * @param {string} key
		 * @param {Mixed} value
		 */
		set: function ( key, value ) {
			this.preferences[ key ] = value;
		},

		/**
		 * Get a preference value for the given preference name
		 *
		 * @param {string} key
		 * @return {Mixed}
		 */
		get: function ( key ) {
			return this.preferences[ key ];
		},

		/**
		 * Save the preferences
		 *
		 * @param {Function} callback
		 */
		save: function ( callback ) {
			var self = this;

			callback = callback || function () {};
			if ( this.isAnon ) {
				// Anonymous user. Save preferences in local storage
				mw.storage.setObject( this.preferenceName, this.preferences );
				callback.call( this, true );
			} else {
				// Logged in user. Use MW APIs to change preferences
				new mw.Api().saveOption(
					this.preferenceName,
					JSON.stringify( this.preferences )
				).done( function () {
					callback.call( self, true );
				} ).fail( function () {
					callback.call( self, false );
				} );
			}
		}
	};

	module.exports = function () {
		instance = instance || new ULSPreferences();
		return instance;
	};
}() );
