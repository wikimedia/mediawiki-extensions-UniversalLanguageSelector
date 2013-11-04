<?php
/**
 * Resource loader module for UniversalLanguageSelector
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
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

/**
 * Resource loader module for providing MediaWiki language names.
 */
class ResourceLoaderULSModule extends ResourceLoaderModule {
	/**
	 * @var Language
	 */
	protected $language;
	protected $targets = array( 'desktop', 'mobile' );

	/**
	 * Get all the dynamic data for the content language to an array
	 *
	 * @return array
	 */
	protected function getData() {
		$vars = array();
		$vars['wgULSLanguages'] = Language::fetchLanguageNames(
			$this->language->getCode(), 'mwfile'
		);

		return $vars;
	}

	/**
	 * @param $context ResourceLoaderContext
	 * @return string: JavaScript code
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$this->language = Language::factory( $context->getLanguage() );
		$out = '';
		foreach ( $this->getData() as $key => $value ) {
			$out .= Xml::encodeJsCall( 'mw.config.set', array( $key, $value ) );
		}

		return $out;
	}

	/**
	 * @param $context ResourceLoaderContext
	 * @return array|int|Mixed
	 */
	public function getModifiedTime( ResourceLoaderContext $context ) {
		$this->language = Language::factory( $context->getLanguage() );
		$cache = wfGetCache( CACHE_ANYTHING );
		$key = wfMemcKey( 'resourceloader', 'ulsmodule', 'changeinfo' );

		$data = $this->getData();
		$hash = md5( serialize( $data ) );

		$result = $cache->get( $key );
		if ( is_array( $result ) && $result['hash'] === $hash ) {
			return $result['timestamp'];
		}
		$timestamp = wfTimestamp();
		$cache->set( $key, array(
			'hash' => $hash,
			'timestamp' => $timestamp,
		) );

		return $timestamp;
	}
}
