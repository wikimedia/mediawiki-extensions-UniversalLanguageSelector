/*
 * @author Amir E. Aharoni
 * Utilities for querying the language db.
 */
(function ( $ ) {
	"use strict";

	// Constants
	var scriptIndex = 0,
		regionsIndex = 1;

	/*
	 * Returns the script group of a script or 'Other' if it doesn't
	 * belong to any group.
	 */
	$.uls.data.groupOfScript = function( script ) {
		for ( var group in $.uls.data.scriptgroups ) {
			if ( $.inArray( script, $.uls.data.scriptgroups[group] ) != -1 ) {
				return group;
			}
		}

		return 'Other';
	}

} )( jQuery );
