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
	protected $targets = [ 'desktop', 'mobile' ];

	/**
	 * Get all the dynamic data for the content language to an array.
	 *
	 * @param string $languageCode Language code
	 * @return array
	 */
	protected function getData( $languageCode ) {
		$vars = [];
		$vars['wgULSLanguages'] = Language::fetchLanguageNames(
			$languageCode,
			'mwfile'
		);

		return $vars;
	}

	/**
	 * @param $context ResourceLoaderContext
	 * @return string JavaScript code
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$languageCode = $context->getLanguage();
		$out = '';
		foreach ( $this->getData( $languageCode ) as $key => $value ) {
			$out .= Xml::encodeJsCall( 'mw.config.set', [ $key, $value ] );
		}

		return $out;
	}

	/**
	 * Gets the last modified time for this module depending on the given
	 * context.
	 *
	 * @param $context ResourceLoaderContext
	 * @return int Unix timestamp
	 */
	public function getModifiedTime( ResourceLoaderContext $context ) {
		$languageCode = $context->getLanguage();

		$cache = wfGetCache( CACHE_ANYTHING );

		// Since we are updating the timestamp on hash change, we need to
		// cache the hash per language to avoid updating the timestamp when
		// different languages are being requested.
		$key = wfMemcKey(
			'uls',
			'modulemodifiedhash',
			$this->getName(),
			$languageCode
		);

		$data = $this->getData( $languageCode );
		$hash = md5( serialize( $data ) );

		$result = $cache->get( $key );
		if ( is_array( $result ) && $result['hash'] === $hash ) {
			return $result['timestamp'];
		}
		$timestamp = wfTimestamp();
		$cache->set( $key, [
			'hash' => $hash,
			'timestamp' => $timestamp,
		] );

		return $timestamp;
	}
}
