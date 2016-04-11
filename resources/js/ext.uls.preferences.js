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

( function ( $, mw ) {
	'use strict';

	var ULSPreferences;

	/**
	 * Wrapper for localStorage, falls back to cookie
	 * when localStorage not supported by browser.
	 */
	function preferenceStore() {

		// If value is detected, set new or modify store
		return {
			/*
			 * Set the value to the given key
			 * @param {string} key
			 * @param {Object} value value to be set
			 */
			set: function ( key, value ) {
				// Convert object values to JSON
				if ( typeof value === 'object' ) {
					value = JSON.stringify( value );
				}

				try {
					localStorage.setItem( key, value );
				} catch ( e ) {}
			},
			/*
			 * Returns the value of the given key
			 * @param {string} key
			 * @return {Object} value of the key
			 */
			get: function ( key ) {
				var data;

				try {
					data = JSON.parse( localStorage.getItem( key ) );
				} catch ( e ) {}

				return data;
			}
		};
	}

	ULSPreferences = function () {
		this.preferenceName = 'uls-preferences';
		this.username = mw.user.getName();
		this.isAnon = mw.user.isAnon();
		this.preferences = null;
		this.init();
	};

	ULSPreferences.prototype = {
		/**
		 * Initialize
		 */
		init: function () {
			var options;

			if ( this.isAnon ) {
				this.preferences = preferenceStore().get( this.preferenceName );
			} else {
				options = mw.user.options.get( this.preferenceName );
				if ( !options ) {
					options = '{}';
				}
				// Try to parse JSON
				try {
					this.preferences = JSON.parse( options );
				} catch ( e ) {
					this.preferences = {};
				}
			}

			this.preferences = this.preferences || {};
		},

		/**
		 * Set the preference
		 *
		 * @param {string} key
		 * @param {mixed} value
		 */
		set: function ( key, value ) {
			this.preferences[ key ] = value;
		},

		/**
		 * Get a preference value for the given preference name
		 *
		 * @param {string} key
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
			var ulsPreferences = this;

			callback = callback || $.noop;
			if ( this.isAnon ) {
				// Anonymous user. Save preferences in local storage
				preferenceStore().set( this.preferenceName, this.preferences );
				callback.call( this, true );
			} else {
				// Logged in user. Use MW APIs to change preferences
				new mw.Api().saveOption(
					ulsPreferences.preferenceName,
					JSON.stringify( ulsPreferences.preferences )
				).done( function () {
					callback.call( this, true );
				} ).fail( function () {
					callback.call( this, false );
				} );
			}
		}
	};

	mw.uls = mw.uls || {};
	mw.uls.preferences = function () {
		var data = $( 'body' ).data( 'preferences' );

		if ( !data ) {
			$( 'body' ).data( 'preferences', ( data = new ULSPreferences() ) );
		}
		return data;
	};

}( jQuery, mediaWiki ) );
