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

( function () {
"use strict";

module( "ext.uls", QUnit.newMwEnvironment() );

/*
 * Runs over all script codes mentioned in langdb and checks whether
 * they belong to the 'Other' group.
 */
var orphanScript = function () {
	for ( var language in $.uls.data.languages ) {
		var script = $.uls.data.script( language );
		if ( $.uls.data.groupOfScript( script ) === 'Other' ) {
			return script;
		}
	}

	return '';
};

test( "-- Initial check", function() {
	expect( 1 );
	ok( $.fn.uls, "$.fn.uls is defined" );
} );

test( "-- $.uls.data testing", function() {
	expect( 18 );

	// This test assumes that we don't want any scripts to be in the 'Other'
	// group. Actually, this may become wrong some day.
	strictEqual( orphanScript(), '', 'No orphan scripts found.' );
	strictEqual(
		$.uls.data.groupOfScript( 'Beng' ),
		'SouthAsian',
		'Bengali script belongs to the SouthAsian group.'
	);
	strictEqual(
		$.uls.data.scriptGroupOfLanguage( 'iu' ),
		'NativeAmerican',
		'The script of the Inupiaq language belongs to the NativeAmerican group.'
	);

	strictEqual( $.uls.data.script( 'ii' ), 'Yiii', 'Correct script of the Yi language was selected' );
	deepEqual( $.uls.data.regions( 'lzz' ), [ 'EU', 'ME' ], 'Correct regions of the Laz language were selected' );
	strictEqual( $.uls.data.regions( 'no-such-language' ), 'UNKNOWN', "The region of an invalid language is 'UNKNOWN'" );

	var allLanguagesByRegionAndScript = $.uls.data.allLanguagesByRegionAndScript();
	deepEqual( allLanguagesByRegionAndScript['3']['AS']['SouthEastAsian']['Bugi'], ['bug'], 'All languages in the Buginese script in Asia were selected' );

	deepEqual( $.uls.data.languagesInRegion( 'AU' ), ["en-gb", "en", "hif-latn", "hif", "mi", "na"], "languages of region AU are selected correctly" );
	deepEqual( $.uls.data.languagesInRegions( ['NA', 'WW'] ),
		[
			"akz", "ase", "avk", "cho", "chr", "chy", "cr", "en-ca", "en", "eo", "es-formal", "es", "esu",
			"haw", "ht", "ia", "ie", "ik", "ike-cans", "ike-latn", "ike", "io",
			"iu", "jam", "jbo", "kl", "lfn", "mic", "mus", "nah", "nov", "nv",
			"pdc", "pdt", "sei", "simple", "srn", "tokipona",
			"vo", "yi", "yua"
		],
		"languages of regions NA and WW are selected correctly"
	);

	deepEqual( $.uls.data.languagesInScript( 'Knda' ), ["kn", "tcy"], "languages in script Knda are selected correctly" );
	deepEqual( $.uls.data.languagesInScripts( ['Geor', 'Armn'] ),
		["hy", "ka", "xmf"],
		"languages in scripts Geor and Armn are selected correctly"
	);

	deepEqual( $.uls.data.regionsInGroup( 1 ), ["NA", "LA", "SA"], "regions in group 1 are selected correctly" );
	deepEqual( $.uls.data.regionsInGroup( 4 ), ["WW"], "regions in group 4 are selected correctly" );

	var languagesByScriptInNA = $.uls.data.languagesByScriptInRegion( 'NA' );
	deepEqual( languagesByScriptInNA['Cans'], ["cr", "ike-cans", "iu"], "correct languages in Cans in NA selected" );

	strictEqual( $.uls.data.autonym( 'pa' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected' );

	var languagesByScriptGroupInEMEA = $.uls.data.languagesByScriptGroupInRegions( $.uls.data.regionsInGroup( 2 ) );
	deepEqual( languagesByScriptGroupInEMEA['WestCaucasian'], ['hy', 'ka', 'xmf'], 'Correct languages in WestCaucasian script group selected' );

	var allLanguagesByScriptGroup = $.uls.data.allLanguagesByScriptGroup();
	deepEqual( allLanguagesByScriptGroup['Greek'], ['el', 'grc', 'pnt', 'ruq-grek', 'tsd'], 'All languages in the Greek script found' );

	deepEqual( $.uls.data.allRegions(), ['NA', 'LA', 'SA', 'EU', 'ME', 'AF', 'AS', 'PA', 'AU', 'WW'], 'All regions found' );
} );

}() );
