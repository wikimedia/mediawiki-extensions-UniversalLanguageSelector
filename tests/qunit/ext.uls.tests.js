/**
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

( function ( $ ) {
	'use strict';

	module( 'ext.uls', QUnit.newMwEnvironment() );

	test( '-- Initial check', function () {
		expect( 1 );
		ok( $.fn.uls, '$.fn.uls is defined' );
	} );

	test( '-- Custom langdb', function () {
		expect( 1 );

		// This is a custom non-standard language code used in MW.
		// If it's not defined, then, for example,
		// its direction cannot be acquired using the langdb utils.
		strictEqual( $.uls.data.getDir( 'als' ), 'ltr', 'The direction of custom MW language als is ltr.' );
	} );

	test( '-- User preferences', function () {
		expect( 2 );

		// 'gofanim' means "fonts" in Hebrew.
		// Here it's used as a meaningless word, to test
		// the preferences without changing anything useful.
		var prefName = 'gofanim',
			prefs = mw.uls.preferences(),
			prefsToSave = {},
			readPrefs;

		prefsToSave[prefName] = {
			'fonts': {
				'qqy': 'Megafont'
			},
			'webfonts-enabled': true
		};

		prefs.set( prefName, prefsToSave );
		stop();
		prefs.save( function ( successSave ) {
			start();
			ok( successSave, 'Options saving API did not produce an error.' );
		} );

		readPrefs = prefs.get( prefName );
		strictEqual( readPrefs[prefName].fonts.qqy, 'Megafont', 'Correct value for the font name' );

		// Delete old options
		prefs.set( prefName, undefined );
		prefs.save();
	} );
}( jQuery ) );
