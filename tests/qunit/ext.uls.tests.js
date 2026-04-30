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

	QUnit.test( 'BCP 47 redirects for non-standard MW codes (T391575)', ( assert ) => {
		const cases = [
			[ 'jv-x-bms', 'map-bms', 'Basa Banyumasan' ],
			[ 'nap-x-tara', 'roa-tara', 'Tarandíne' ],
			[ 'nrf', 'nrm', 'Nouormand' ],
			[ 'ro-cyrl-md', 'mo', 'Moldovan' ]
		];

		cases.forEach( ( [ bcp47, mwCode, name ] ) => {
			assert.strictEqual(
				$.uls.data.isRedirect( bcp47 ),
				mwCode,
				bcp47 + ' redirects to ' + mwCode + ' (' + name + ')'
			);
			assert.strictEqual(
				mw.uls.convertMediaWikiLanguageCodeToULS( bcp47 ),
				mwCode,
				'convertMediaWikiLanguageCodeToULS resolves ' + bcp47
			);
		} );
	} );

	QUnit.test( 'Common languages', ( assert ) => {
		// Bug 49847
		let foundTagalog = false;
		const languagesInPH = mw.uls.getFrequentLanguageList( 'PH' );

		for ( let i = 0; i < languagesInPH.length; i++ ) {
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
