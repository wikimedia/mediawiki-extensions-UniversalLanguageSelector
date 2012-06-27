/**
 * QUnit tests for ULS
 *
 * @file
 * @author Santhosh Thottingal
 * @copyright Copyright © 2012 Santhosh Thottingal
 * @license http://www.gnu.org/copyleft/gpl.html GNU General Public License 2.0 or later
 */
( function () {

module( "ext.uls", QUnit.newMwEnvironment() );

/*
 * Runs over all script codes mentioned in langdb and checks whether
 * they belong to the 'Other' group.
 */
var orphanScript = function () {
	for ( var language in $.uls.data.languages ) {
		var script = $.uls.data.languages[language][0];
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
	expect( 12 );

	// This test assumes that we don't want any scripts to be in the 'Other'
	// group. Actually, this may become wrong some day.
	strictEqual( orphanScript(), '', 'No orphan scripts found.' );
	strictEqual( $.uls.data.groupOfScript( 'Beng' ), 'SouthAsian', 'Bengali script belongs to the SouthAsian group.' );

	strictEqual( $.uls.data.script( 'ii' ), 'Yiii', 'Correct script of the Yi language was selected' );
	deepEqual( $.uls.data.regions( 'lzz' ), [ 'EU', 'ME' ], 'Correct regions of the Laz language were selected' );

	deepEqual( $.uls.data.languagesInRegion( 'AU' ), ["en", "en-gb", "hif", "hif-latn", "mi", "na"], "languages of region AU are selected correctly" );
	deepEqual( $.uls.data.languagesInRegions( ['NA', 'WW'] ),
		[
			"avk", "cho", "chr", "chy", "cr", "en", "en-ca", "eo", "es",
			"haw", "ht", "ia", "ie", "ik", "ike-cans", "ike-latn", "io",
			"iu", "jam", "jbo", "kl", "lfn", "mus", "nah", "nov", "nv",
			"pdc", "pdt", "sei", "simple", "srn", "tokipona",
			"vo", "yi"
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

	languagesByScriptInNA = $.uls.data.languagesByScriptInRegion( 'NA' );
	deepEqual( languagesByScriptInNA['Cans'], ["cr", "ike-cans", "iu"], "correct languages in Cans in NA selected" );

	strictEqual( $.uls.data.autonym( 'pa' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected' );
} );

}() );
