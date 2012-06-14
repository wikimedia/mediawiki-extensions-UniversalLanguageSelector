/**
 * ULS startup script
 */
( function( $ ) {
	$( document ).ready( function() {
		/* Create a trigger somewhere in the page.
		$trigger = $("<a href='#'>")
			.addClass( 'uls-trigger' )
			.text("English"); // FIXME proper trigger text to go here.
		$('#mw-head').append( $trigger );*/
		// Bind ULS to the trigger.
		$('.uls-trigger').uls();
	} );
} )( jQuery );
