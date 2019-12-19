( function () {
	'use strict';
	var $cancelBtn, $acceptBtn;

	function getHeading( languageName ) {
		return $( '<h4>' ).text(
			mw.msg( 'ext-uls-setlang-heading', languageName )
		);
	}

	function getMessage( languageName, languageCode ) {
		return $( '<p>' ).html(
			mw.message(
				'ext-uls-setlang-message',
				languageName,
				languageCode
			).parse()
		);
	}

	function getButtons() {
		$cancelBtn = $( '<button>' )
			.addClass( 'mw-ui-button uls-setlang-cancel' )
			.text( mw.msg( 'ext-uls-setlang-cancel' ) );

		$acceptBtn = $( '<button>' )
			.addClass( 'mw-ui-button mw-ui-progressive active uls-setlang-apply' )
			.text( mw.msg( 'ext-uls-setlang-accept' ) );

		return $( '<div>' )
			.addClass( 'language-setlang-buttons' )
			.append(
				$cancelBtn,
				$acceptBtn
			);
	}

	function toggleLoading( $btnSubmit, isLoading ) {
		if ( isLoading ) {
			$btnSubmit.text( mw.msg( 'ext-uls-setlang-loading' ) );
		} else {
			$btnSubmit.text( mw.msg( 'ext-uls-setlang-accept' ) );
		}

		$btnSubmit.prop( 'disabled', isLoading );
	}

	function removeParam( key ) {
		var uri = new mw.Uri();
		delete uri.query[ key ];
		return uri.toString();
	}

	function updateLanguage( langCode ) {
		var api = new mw.Api();
		return api.postWithToken( 'csrf', {
			action: 'ulssetlang',
			languagecode: langCode,
			formatversion: 2
		} ).done( function () {
			location.replace( removeParam( 'setlang' ) );
		} ).fail( function ( code, result ) {
			var apiErrorInfo = mw.msg( 'ext-uls-setlang-unknown-error' );
			if ( result.error && result.error.info ) {
				apiErrorInfo = result.error.info;
			}
			mw.notify(
				mw.msg( 'ext-uls-setlang-error', apiErrorInfo ),
				{
					type: 'error',
					tag: 'uls-setlang-error'
				}
			);
		} );
	}

	function createSetLangDialog( languageName, languageCode ) {
		return $( '<div>' )
			.addClass( 'uls-setlang-dialog' )
			.append(
				getHeading( languageName ),
				getMessage( languageName, languageCode ),
				getButtons()
			).appendTo( document.body );
	}

	function addSetLangDialogEvents( ulsDialog ) {
		$acceptBtn.on( 'click', function () {
			toggleLoading( $acceptBtn, true );
			updateLanguage( mw.config.get( 'wgULSSetLangCode' ) ).fail( function () {
				toggleLoading( $acceptBtn, false );
			} );
		} );

		$cancelBtn.on( 'click', function () {
			var urlWithoutSetlang = removeParam( 'setlang' );
			history.replaceState( null, 'no-setlang-url', urlWithoutSetlang );
			ulsDialog.close();
		} );
	}

	$( function () {
		var setLangCode = mw.config.get( 'wgULSSetLangCode' ),
			setLangName = mw.config.get( 'wgULSSetLangName' ),
			currentLangCode = mw.config.get( 'wgULSCurrentLangCode' ),
			$ulsDialog, ulsSetLangDialog;

		if ( currentLangCode === setLangCode ) {
			return;
		}

		// Setup and show the dialog
		$ulsDialog = createSetLangDialog( setLangName, setLangCode );
		ulsSetLangDialog = new mw.uls.Dialog( {
			container: $ulsDialog,
			hasOverlay: true
		} );

		addSetLangDialogEvents( ulsSetLangDialog );

		setTimeout( ulsSetLangDialog.open );
	} );

}() );
