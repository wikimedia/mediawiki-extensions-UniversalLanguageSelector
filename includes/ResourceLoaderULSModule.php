<?php
/**
 * ResourceLoader module for UniversalLanguageSelector
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
 * @author Niklas Laxström
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 * @license MIT
 */

/**
 * ResourceLoader module for UniversalLanguageSelector
 */
class ResourceLoaderULSModule extends ResourceLoaderModule {
	protected $targets = [ 'desktop', 'mobile' ];

	/**
	 * Get all the dynamic data for the content language to an array.
	 *
	 * @param string $languageCode Language code
	 * @return array
	 */
	private function getData( $languageCode ) {
		$vars = [];
		$vars['wgULSLanguages'] = Language::fetchLanguageNames(
			$languageCode,
			'mwfile'
		);
		return $vars;
	}

	/**
	 * @param ResourceLoaderContext $context
	 * @return string JavaScript code
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$languageCode = $context->getLanguage();
		return ResourceLoader::makeConfigSetScript( $this->getData( $languageCode ) );
	}

	/**
	 * @return bool
	 */
	public function enableModuleContentVersion() {
		return true;
	}
}
