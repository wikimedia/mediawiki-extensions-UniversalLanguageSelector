<?php
/**
 * ResourceLoaderModule subclass for loading the json
 * based localization to client-side code.
 *
 * @file
 * @ingroup Extensions
 * @author Santhosh Thottingal
 */

/**
 * Packages a remote schema as a JavaScript ResourceLoader module.
 * @since 2013.11
 */
class ResourceLoaderULSJsonMessageModule extends ResourceLoaderModule {
	/**
	 * Part of the ResourceLoader module interface.
	 * Declares the core ext.uls.i18n module as a dependency.
	 * @param ResourceLoaderContext $context
	 * @return string[] Module names.
	 */
	function getDependencies( ResourceLoaderContext $context = null ) {
		return array( 'ext.uls.i18n' );
	}

	/**
	 * Gets the last modified timestamp of this module.
	 * The last modified timestamp controls caching.
	 * @param ResourceLoaderContext $context
	 * @return int Unix timestamp.
	 */
	function getModifiedTime( ResourceLoaderContext $context ) {
		$code = $context->getLanguage();
		if ( !Language::isValidCode( $code ) ) {
			$code = 'en';
		}

		$mtimes = array_map(
			'filemtime',
			ULSJsonMessageLoader::getFilenames( $code )
		);
		// Make sure we have at least one entry
		$mtimes[] = 1;

		return max( $mtimes );
	}

	/**
	 * Get the message strings for the current UI language. Uses
	 * mw.uls.loadLocalization to register them on the frontend.
	 * @param ResourceLoaderContext $context
	 * @return string JavaScript code.
	 */
	function getScript( ResourceLoaderContext $context ) {
		$code = $context->getLanguage();
		if ( !Language::isValidCode( $code ) ) {
			$code = 'en';
		}

		$params = array( $code, ULSJsonMessageLoader::getMessages( $code ) );

		return Xml::encodeJsCall( 'mw.uls.loadLocalization', $params );
	}
}
