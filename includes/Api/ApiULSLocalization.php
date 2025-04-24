<?php
/**
 * Localization API for ULS
 *
 * Copyright (C) 2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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

use MediaWiki\Api\ApiBase;
use MediaWiki\Api\ApiFormatRaw;
use MediaWiki\Api\ApiMain;
use MediaWiki\Languages\LanguageNameUtils;
use UniversalLanguageSelector\ULSJsonMessageLoader;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * @ingroup API
 */
class ApiULSLocalization extends ApiBase {
	private LanguageNameUtils $languageNameUtils;

	public function __construct(
		ApiMain $main,
		string $action,
		LanguageNameUtils $languageNameUtils
	) {
		parent::__construct( $main, $action );
		$this->languageNameUtils = $languageNameUtils;
	}

	/**
	 * @inheritDoc
	 */
	public function execute() {
		$this->getMain()->setCacheMode( 'public' );
		$this->getMain()->setCacheMaxAge( 2419200 );

		$params = $this->extractRequestParams();
		$language = $params['language'];
		if ( !$this->languageNameUtils->isValidCode( $language ) ) {
			$this->dieWithError( [ 'apierror-invalidlang', 'language' ], 'invalidlanguage' );
		}
		$contents = ULSJsonMessageLoader::getMessages( $language );
		// Output the file's contents raw
		$this->getResult()->addValue( null, 'text', json_encode( $contents ) );
		$this->getResult()->addValue( null, 'mime', 'application/json' );
	}

	/**
	 * @inheritDoc
	 */
	public function getCustomPrinter() {
		return new ApiFormatRaw(
			$this->getMain(),
			$this->getMain()->createPrinterByName( 'json' )
		);
	}

	/**
	 * @inheritDoc
	 */
	public function getAllowedParams() {
		return [
			'language' => [
				ParamValidator::PARAM_REQUIRED => true,
				ParamValidator::PARAM_TYPE => 'string',
			],
		];
	}

	/**
	 * @inheritDoc
	 */
	protected function getExamplesMessages() {
		return [
			'action=ulslocalization&language=ta'
				=> 'apihelp-ulslocalization-example-1',
			'action=ulslocalization&language=hi'
				=> 'apihelp-ulslocalization-example-2',
		];
	}

	/**
	 * @inheritDoc
	 */
	public function isInternal() {
		// Try to scare people away from using this externally
		return true;
	}
}
