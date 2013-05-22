/**
 * ULS preferences system for MediaWiki.
 * Local storage for anonymous users, preferences for logged in users.
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

( function ( $, mw, undefined ) {
	'use strict';

	var ULSPreferences,
		cachedOptionsToken = null;

	/**
	 * Post to options API with correct token.
	 * If we have no token, get one and try to post.
	 * If we have a cached token try using that,
	 * and if it fails, blank out the cached token and start over.
	 *
	 * @param params {Object} API parameters
	 * @param ok {Function} callback for success
	 * @param err {Function} [optional] error callback
	 * @return {jqXHR}
	 */
	function saveOptionsWithToken( params, ok, err ) {
		if ( cachedOptionsToken === null ) {
			// We don't have a valid cached token, so get a fresh one and try posting.
			// We do not trap any 'badtoken' or 'notoken' errors, because we don't want
			// an infinite loop. If this fresh token is bad, something else is very wrong.
			return getOptionsToken( function ( token ) {
				params.token = token;
				new mw.Api().post( params, ok, err );
			}, err );
		} else {
			params.token = cachedOptionsToken;

			return new mw.Api().post( params, {
				ok: ok,
				err: function ( code, result ) {
					// We do have a token, but it might be expired.
					// So if it is 'bad', then start over with a new token.
					if ( code === 'badtoken' ) {
						// force a new token, clear any old one
						cachedOptionsToken = null;
						saveOptionsWithToken( params, ok, err );
					} else {
						err( code, result );
					}
				}
			} );
		}
	}

	/**
	 * Api helper to grab an options token
	 *
	 * token callback has signature ( String token )
	 * error callback has signature ( String code, Object results, XmlHttpRequest xhr, Exception exception )
	 * Note that xhr and exception are only available for 'http_*' errors
	 * code may be any http_* error code (see mw.Api), or 'token_missing'
	 *
	 * @param tokenCallback {Function} received token callback
	 * @param err {Function} error callback
	 * @return {jqXHR}
	 */
	function getOptionsToken( tokenCallback, err ) {
		return new mw.Api().get( {
			action: 'tokens',
			type: 'options'
		}, {
			ok: function ( data ) {
				var token;

				// If token type is not available for this user,
				// key 'translationreviewtoken' is missing or can contain Boolean false
				if ( data.tokens && data.tokens.optionstoken ) {
					token = data.tokens.optionstoken;
					cachedOptionsToken = token;
					tokenCallback( token );
				} else {
					err( 'token-missing', data );
				}
			},
			err: err,
			// Due to the API assuming we're logged out if we pass the callback-parameter,
			// we have to disable jQuery's callback system, and instead parse JSON string,
			// by setting 'jsonp' to false.
			jsonp: false
		} );
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
			if ( this.isAnon ) {
				this.preferences = $.jStorage.get( this.preferenceName );
			} else {
				var options = mw.user.options.get( this.preferenceName );
				this.preferences = $.parseJSON( options );
			}
			this.preferences = this.preferences || {};
		},

		/**
		 * Set the preference
		 *
		 * @param {String} key
		 * @param value
		 */
		set: function ( key, value ) {
			this.preferences[key] = value;
		},

		/**
		 * Get a preference value for the given preference name
		 *
		 * @param key
		 */
		get: function ( key ) {
			return this.preferences[key];
		},

		/**
		 * Save the preferences
		 *
		 * @param callback
		 */
		save: function ( callback ) {
			var ulsPreferences = this;

			callback = callback || $.noop;
			if ( this.isAnon ) {
				// Anonymous user. Save preferences in local storage
				$.jStorage.set( this.preferenceName, this.preferences );
				callback.call( this, true );
			} else {

				// Logged in user. Use MW APIs to change preferences
				saveOptionsWithToken( {
					action: 'options',
					optionname: ulsPreferences.preferenceName,
					optionvalue: $.toJSON( ulsPreferences.preferences )
				}, function () {
					callback.call( this, true );
				}, function () {
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
