( function () {
	'use strict';

	var ULSDialog = function ( options ) {
		var $dialog = options.container,
			hasOverlay = options.hasOverlay,
			$overlay;

		function showOverlay() {
			if ( $overlay ) {
				$overlay.show();
				$( document.body ).addClass( 'uls-no-overflow' );
			}
		}

		function hideOverlay() {
			if ( $overlay ) {
				$overlay.hide();
				$( document.body ).removeClass( 'uls-no-overflow' );
			}
		}

		function open() {
			$dialog.show();
			showOverlay();
		}

		function close() {
			$dialog.hide();
			hideOverlay();
		}

		function elem() {
			return $dialog;
		}

		function addOverlay() {
			// Check if overlay is already there.
			if ( !$overlay ) {
				$overlay = $( '<div>' )
					.addClass( 'uls-overlay' )
					.on( 'click', close )
					.appendTo( document.body );
			}
		}

		$dialog.addClass( 'uls-dialog' );

		if ( hasOverlay ) {
			addOverlay();
		}

		return {
			open: open,
			close: close,
			elem: elem
		};
	};

	mw.uls = mw.uls || {};
	mw.uls.Dialog = ULSDialog;
}() );
