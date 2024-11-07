/*!
 * Loaded when setlang query parameter is set on the page.
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
	let $cancelBtn, $acceptBtn;

	function getHeading( languageName ) {
		return $( '<h4>' ).text(
			mw.msg( 'ext-uls-setlang-heading', languageName )
		);
	}

	function getMessage( languageName, languageCode ) {
		return $( '<p>' ).append(
			mw.message(
				'ext-uls-setlang-message',
				languageName,
				languageCode
			).parseDom()
		);
	}

	function getButtons() {
		$cancelBtn = $( '<button>' )
			.addClass( 'cdx-button uls-setlang-cancel' )
			.text( mw.msg( 'ext-uls-setlang-cancel' ) );

		$acceptBtn = $( '<button>' )
			.addClass( 'cdx-button cdx-button--type-primary cdx-button--action-progressive active uls-setlang-apply' )
			.text( mw.msg( 'ext-uls-setlang-accept' ) );

		return $( '<div>' )
			.addClass( 'language-setlang-buttons' )
			.append(
				$cancelBtn,
				$acceptBtn
			);
	}

	function toggleLoading( $btnSubmit, isLoading ) {
		$btnSubmit
			.text( mw.msg( isLoading ? 'ext-uls-setlang-loading' : 'ext-uls-setlang-accept' ) )
			.prop( 'disabled', isLoading );
	}

	/**
	 * @return {string}
	 */
	function currentUrlWithoutSetLang() {
		const url = new URL( location.href );
		url.searchParams.delete( 'setlang' );
		return url.toString();
	}

	function removeSetLangFromHistory() {
		if ( new URL( location.href ).searchParams.has( 'setlang' ) ) {
			history.replaceState( null, '', currentUrlWithoutSetLang() );
		}
	}

	function updateLanguage( langCode ) {
		const api = new mw.Api();
		return api.postWithToken( 'csrf', {
			action: 'ulssetlang',
			languagecode: langCode,
			formatversion: 2
		} ).done( () => {
			location.replace( currentUrlWithoutSetLang() );
		} ).fail( ( code, result ) => {
			const apiErrorInfo = result.error && result.error.info ||
				mw.msg( 'ext-uls-setlang-unknown-error' );
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
		$acceptBtn.on( 'click', () => {
			toggleLoading( $acceptBtn, true );
			updateLanguage( mw.config.get( 'wgULSSetLangCode' ) ).fail( () => {
				toggleLoading( $acceptBtn, false );
			} );
		} );

		$cancelBtn.on( 'click', () => {
			ulsDialog.close();
		} );
	}

	$( () => {
		const setLangCode = mw.config.get( 'wgULSSetLangCode' ),
			setLangName = mw.config.get( 'wgULSSetLangName' ),
			currentLangCode = mw.config.get( 'wgULSCurrentLangCode' );

		if ( currentLangCode === setLangCode ) {
			removeSetLangFromHistory();
			return;
		}

		// Setup and show the dialog
		const $ulsDialog = createSetLangDialog( setLangName, setLangCode );
		const ulsSetLangDialog = new mw.uls.Dialog( {
			container: $ulsDialog,
			hasOverlay: true,
			afterClose: removeSetLangFromHistory
		} );

		addSetLangDialogEvents( ulsSetLangDialog );

		setTimeout( ulsSetLangDialog.open );
	} );

}() );
