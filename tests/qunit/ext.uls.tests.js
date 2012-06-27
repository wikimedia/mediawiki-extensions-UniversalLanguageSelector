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
}

test( "-- Initial check", function() {
	expect( 1 );
	ok( $.fn.uls, "$.fn.uls is defined" );
} );

test( "-- $.uls.data testing", function() {
	expect( 1 );

	// Unless we actually want some scripts to be in the 'Other' group.
	strictEqual( orphanScript(), '', 'No orphan scripts found.' );
} );

}());
