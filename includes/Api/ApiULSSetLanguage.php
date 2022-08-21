<?php
/**
 * Update user's preferred language.
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
 * @license GPL-2.0-or-later
 * @license MIT
 */

namespace UniversalLanguageSelector\Api;

use ApiBase;
use ApiMain;
use DeferredUpdates;
use MediaWiki\Languages\LanguageNameUtils;
use MediaWiki\User\UserOptionsManager;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * @ingroup API
 */
class ApiULSSetLanguage extends ApiBase {
	/** @var UserOptionsManager */
	private $userOptionsManager;
	/** @var LanguageNameUtils */
	private $languageNameUtils;

	/**
	 * @param ApiMain $main
	 * @param string $action
	 * @param UserOptionsManager $userOptionsManager
	 * @param LanguageNameUtils $languageNameUtils
	 */
	public function __construct(
		ApiMain $main,
		$action,
		UserOptionsManager $userOptionsManager,
		LanguageNameUtils $languageNameUtils
	) {
		parent::__construct( $main, $action );
		$this->userOptionsManager = $userOptionsManager;
		$this->languageNameUtils = $languageNameUtils;
	}

	public function execute() {
		$request = $this->getRequest();
		if ( !$request->wasPosted() ) {
			$this->dieWithError( [ 'apierror-mustbeposted', $request->getText( 'action' ) ] );
		}

		$languageCode = $request->getRawVal( 'languagecode', '' );
		if ( !$this->languageNameUtils->isSupportedLanguage( $languageCode ) ) {
			$this->dieWithError(
				[ 'apierror-invalidlang', $this->encodeParamName( 'languagecode' ) ]
			);
		}

		$user = $this->getUser();
		if ( !$user->isRegistered() ) {
			if ( $this->getConfig()->get( 'ULSAnonCanChangeLanguage' ) ) {
				// Anonymous users can change language.
				// Use a cookie that also can changed by JavaScript.
				$request->response()->setCookie(
					'language',
					$languageCode,
					0,
					[ 'httpOnly' => false ]
				);
				return;
			}

			$this->dieWithError( [ 'apierror-ulssetlang-anon-notallowed' ] );
		}

		$updateUser = $user->getInstanceForUpdate();
		$this->userOptionsManager->setOption( $updateUser, 'language', $languageCode );
		// Sync the DB on post-send
		DeferredUpdates::addCallableUpdate( static function () use ( $updateUser ) {
			$updateUser->saveSettings();
		} );
	}

	public function getAllowedParams() {
		return [
			'languagecode' => [
				ParamValidator::PARAM_REQUIRED => true,
			]
		];
	}

	public function isInternal() {
		// Try to scare people away from using this externally
		return true;
	}

	public function needsToken() {
		return 'csrf';
	}
}
