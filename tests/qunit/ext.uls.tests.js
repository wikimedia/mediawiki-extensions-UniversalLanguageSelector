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

( function () {
	'use strict';

	QUnit.module( 'ext.uls', QUnit.newMwEnvironment() );

	QUnit.test( 'Initial check', ( assert ) => {
		assert.strictEqual( typeof $.fn.uls, 'function', '$.fn.uls is defined' );
	} );

	QUnit.test( 'Custom langdb', ( assert ) => {
		// This is a custom non-standard language code used in MW.
		// If it's not defined, then, for example,
		// its direction cannot be acquired using the langdb utils.
		assert.strictEqual( $.uls.data.getDir( 'als' ), 'ltr', 'The direction of custom MW language als is ltr.' );
	} );

	QUnit.test( 'Common languages', ( assert ) => {
		var i, foundTagalog, languagesInPH;

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
		assert.true(
			foundTagalog,
			'Tagalog is one of the languages presented to users in the Philippines.'
		);
	} );
}() );
