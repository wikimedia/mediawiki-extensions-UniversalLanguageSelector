/*!
 * Loaded when setlang query paramter is set on the page.
 *
 * @private
 * @since 2020.01
 *
 * Copyright (C) 2019-2020 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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

	function removeSetlangFromHistory() {
		var urlWithoutSetlang = removeParam( 'setlang' );
		history.replaceState( null, 'no-setlang-url', urlWithoutSetlang );
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
			removeSetlangFromHistory();
			ulsDialog.close();
		} );
	}

	$( function () {
		var setLangCode = mw.config.get( 'wgULSSetLangCode' ),
			setLangName = mw.config.get( 'wgULSSetLangName' ),
			currentLangCode = mw.config.get( 'wgULSCurrentLangCode' ),
			$ulsDialog, ulsSetLangDialog;

		if ( currentLangCode === setLangCode ) {
			removeSetlangFromHistory();
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
