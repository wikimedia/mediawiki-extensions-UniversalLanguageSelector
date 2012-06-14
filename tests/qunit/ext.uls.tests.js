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

test( "-- Initial check", function() {
	expect( 2 );
	ok( $.fn.uls, "$.fn.uls is defined" );
} );

}());
