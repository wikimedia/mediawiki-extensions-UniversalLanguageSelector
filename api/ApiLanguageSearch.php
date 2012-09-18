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
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

/**
 * @ingroup API
 */
class ApiLanguageSearch extends ApiBase {

	public function getCustomPrinter() {
		return $this->getMain()->createPrinterByName( 'json' );
	}

	public function execute() {
		$params = $this->extractRequestParams();
		$search = $params['search'];
		$typos = $params['typos'];
		$searches = LanguageNameSearch::search( $search, $typos );
		$result = $this->getResult();
		$result->addValue( null, $this->getModuleName(), $searches );
	}

	public function getAllowedParams() {
		return array(
			'search' => array(
				ApiBase::PARAM_REQUIRED => true
			),
			'typos' => array(
				ApiBase::PARAM_REQUIRED => false,
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_DFLT => 1
			),
		);
	}

	public function getParamDescription() {
		return array(
			'search' => 'Search string',
			'typos' => 'Number of spelling mistakes allowed in the search string',
		);
	}

	public function getDescription() {
		return 'Search for language names in any script';
	}

	public function getExamples() {
		return array(
			'api.php?action=languagesearch&search=Te',
			'api.php?action=languagesearch&search=ഫി',
			'api.php?action=languagesearch&search=ഫി&typos=1',
		);
	}

	public function getVersion() {
		return __CLASS__ . ': ' . ULS_VERSION;
	}
}
