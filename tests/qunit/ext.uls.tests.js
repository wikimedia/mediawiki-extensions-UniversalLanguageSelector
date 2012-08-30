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
var orphanScripts = function () {
	var result = [];

	for ( var language in $.uls.data.languages ) {
		var script = $.uls.data.script( language );
		if ( $.uls.data.groupOfScript( script ) === 'Other' ) {
			result.push( script );
		}
	}

	return result;
};

/*
 * Runs over all script codes mentioned in langdb and checks whether
 * they have something that looks like an autonym.
 */
var languagesWithoutAutonym = function () {
	var result = [];

	for ( var language in $.uls.data.languages ) {
		if ( typeof $.uls.data.autonym( language ) !== 'string' ) {
			result.push( language );
		}
	}

	return result;
};

test( "-- Initial check", function() {
	expect( 1 );
	ok( $.fn.uls, "$.fn.uls is defined" );
} );

test( "-- $.uls.data testing", function() {
	expect( 24 );

	strictEqual( $.uls.data.autonyms()['he'], 'עברית', 'Correct autonym is returned for Hebrew using autonyms().' );

	// This test assumes that we don't want any scripts to be in the 'Other'
	// group. Actually, this may become wrong some day.
	deepEqual( orphanScripts(), [], 'All scripts belong to script groups.' );
	deepEqual( languagesWithoutAutonym(), [], 'All languages have autonyms.' );

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
	deepEqual( allLanguagesByRegionAndScript['4']['AS']['SouthEastAsian']['Bugi'], ['bug'], 'All languages in the Buginese script in Asia were selected' );

	deepEqual( $.uls.data.languagesInRegion( 'AU' ), ["en-gb", "en", "hif-latn", "hif", "mi", "na"], "languages of region AU are selected correctly" );
	deepEqual( $.uls.data.languagesInRegions( ['NA', 'WW'] ),
		[
			"akz", "ase", "avk", "cho", "chr", "chy", "cr-cans", "cr-latn", "cr",
			"en-ca", "en", "eo", "es-formal", "es", "esu", "fr",
			"haw", "ht", "ia", "ie", "ik", "ike-cans", "ike-latn", "io",
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

	deepEqual( $.uls.data.regionsInGroup( 2 ), ["NA", "LA", "SA"], "regions in group 2 are selected correctly" );
	deepEqual( $.uls.data.regionsInGroup( 1 ), ["WW"], "regions in group 1 are selected correctly" );

	var languagesByScriptInNA = $.uls.data.languagesByScriptInRegion( 'NA' );
	deepEqual( languagesByScriptInNA['Cans'], ["cr-cans", "cr", "ike-cans", "iu"], "correct languages in Cans in NA selected" );

	strictEqual( $.uls.data.autonym( 'pa' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected' );

	var languagesByScriptGroupInEMEA = $.uls.data.languagesByScriptGroupInRegions( $.uls.data.regionsInGroup( 3 ) );
	deepEqual( languagesByScriptGroupInEMEA['WestCaucasian'], ['hy', 'ka', 'xmf'], 'Correct languages in WestCaucasian script group in EMEA selected' );

	var allLanguagesByScriptGroup = $.uls.data.allLanguagesByScriptGroup();
	deepEqual( allLanguagesByScriptGroup['Greek'], ['el', 'grc', 'pnt', 'ruq-grek', 'tsd'], 'All languages in the Greek script found' );

	deepEqual( $.uls.data.allRegions(), ['WW', 'NA', 'LA', 'SA', 'EU', 'ME', 'AF', 'AS', 'PA', 'AU'], 'All regions found' );

	// autonyms: gn: avañe'ẽ, de: deutsch, hu: magyar, fi: suomi
	deepEqual( ['de', 'fi', 'gn', 'hu'].sort( $.uls.data.sortByAutonym ), ['gn', 'de', 'hu', 'fi'], 'Languages are correctly sorted by autonym' );

	strictEqual( $.uls.data.isRtl( "te" ), false, "Telugu language is not RTL" );
	strictEqual( $.uls.data.isRtl( "dv" ), true, "Divehi language is RTL" );

	ok( $.inArray( "sah", $.uls.data.languagesInTerritory( "RU" ) ) > -1, "Sakha language is spoken in Russia" );
} );

}() );
