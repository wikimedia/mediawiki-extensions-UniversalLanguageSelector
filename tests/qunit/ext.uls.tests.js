/*!
 * QUnit tests for ULS.
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

	QUnit.module( 'ext.uls', QUnit.newMwEnvironment() );

	QUnit.test( 'Initial check', function ( assert ) {
		QUnit.expect( 1 );

		assert.ok( $.fn.uls, '$.fn.uls is defined' );
	} );

	QUnit.test( 'Custom langdb', function ( assert ) {
		QUnit.expect( 1 );

		// This is a custom non-standard language code used in MW.
		// If it's not defined, then, for example,
		// its direction cannot be acquired using the langdb utils.
		assert.strictEqual( $.uls.data.getDir( 'als' ), 'ltr', 'The direction of custom MW language als is ltr.' );
	} );

	QUnit.test( 'User preferences', function ( assert ) {
		var prefName, prefs, prefsToSave, readPrefs;

		QUnit.expect( 2 );

		// 'gofanim' means "fonts" in Hebrew.
		// Here it's used as a meaningless word, to test
		// the preferences without changing anything useful.
		prefName = 'gofanim';
		prefs = mw.uls.preferences();
		prefsToSave = {};

		prefsToSave[ prefName ] = {
			fonts: {
				qqy: 'Megafont'
			}
		};

		prefs.set( prefName, prefsToSave );

		readPrefs = prefs.get( prefName );
		assert.strictEqual(
			readPrefs[ prefName ].fonts.qqy,
			'Megafont',
			'Correct value for the font name'
		);

		QUnit.stop();
		prefs.save( function ( successSave ) {
			QUnit.start();
			assert.ok( successSave, 'Options saving API did not produce an error.' );

			// Delete old options
			prefs.set( prefName, undefined );
			QUnit.stop();
			prefs.save( function () {
				QUnit.start();
			} );
		} );
	} );

	QUnit.test( 'Common languages', function ( assert ) {
		var i, foundTagalog, languagesInPH;

		QUnit.expect( 1 );

		// Bug 49847
		foundTagalog = false;
		languagesInPH = mw.uls.getFrequentLanguageList( 'PH' );

		for ( i = 0; i < languagesInPH.length; i++ ) {
			if ( $.uls.data.isRedirect( languagesInPH[ i ] ) === 'tl' ||
				languagesInPH[ i ] === 'tl'
			) {
				foundTagalog = true;

				break;
			}
		}
		assert.ok(
			foundTagalog,
			'Tagalog is one of the languages presented to users in the Philippines.'
		);
	} );
}( jQuery, mediaWiki ) );
