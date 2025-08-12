<?php
/**
 * Language name search API
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

use LanguageNameSearch;
use MediaWiki\Api\ApiBase;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * @ingroup API
 */
class ApiLanguageSearch extends ApiBase {
	/**
	 * @inheritDoc
	 */
	public function execute() {
		$params = $this->extractRequestParams();
		$search = $params['search'];
		$typos = $params['typos'];
		$searches = LanguageNameSearch::search( $search, $typos, $this->getLanguage()->getCode() );
		$result = $this->getResult();
		$result->addValue( null, $this->getModuleName(), $searches );
	}

	/**
	 * @inheritDoc
	 */
	public function getAllowedParams(): array {
		return [
			'search' => [
				ParamValidator::PARAM_REQUIRED => true
			],
			'typos' => [
				ParamValidator::PARAM_REQUIRED => false,
				ParamValidator::PARAM_TYPE => 'integer',
				ParamValidator::PARAM_DEFAULT => 1
			],
		];
	}

	/**
	 * @inheritDoc
	 */
	protected function getExamplesMessages(): array {
		return [
			'action=languagesearch&search=Te'
				=> 'apihelp-languagesearch-example-1',
			'action=languagesearch&search=ഫി'
				=> 'apihelp-languagesearch-example-2',
			'action=languagesearch&search=ഫി&typos=1'
				=> 'apihelp-languagesearch-example-3',
		];
	}

	/**
	 * @inheritDoc
	 */
	public function getHelpUrls(): string {
		return 'https://www.mediawiki.org/wiki/Special:MyLanguage/API:Languagesearch';
	}
}
