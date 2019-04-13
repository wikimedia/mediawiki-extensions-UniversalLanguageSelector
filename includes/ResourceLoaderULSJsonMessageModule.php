<?php
/**
 * ResourceLoader module for client-side loading of json-based localization.
 *
 * @file
 * @ingroup Extensions
 * @author Santhosh Thottingal
 */

/**
 * ResourceLoader module for client-side loading of json-based localization.
 */
class ResourceLoaderULSJsonMessageModule extends ResourceLoaderModule {
	/**
	 * Part of the ResourceLoader module interface.
	 * Declares the core ext.uls.i18n module as a dependency.
	 * @param ResourceLoaderContext|null $context
	 * @return string[] Module names.
	 */
	public function getDependencies( ResourceLoaderContext $context = null ) {
		return [ 'ext.uls.i18n' ];
	}

	/**
	 * Get supported mobile targets
	 * @return string[] supported targets
	 */
	public function getTargets() {
		return [ 'desktop', 'mobile' ];
	}

	/**
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	public function getDefinitionSummary( ResourceLoaderContext $context ) {
		$code = $context->getLanguage();
		$fileHashes = array_map(
			[ __CLASS__, 'safeFileHash' ],
			ULSJsonMessageLoader::getFilenames( $code )
		);

		$summary = parent::getDefinitionSummary( $context );
		$summary[] = [
			'fileHashes' => $fileHashes
		];
		return $summary;
	}

	/**
	 * Get the message strings for the current UI language. Uses
	 * mw.uls.loadLocalization to register them on the frontend.
	 * @param ResourceLoaderContext $context
	 * @return string JavaScript code.
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$code = $context->getLanguage();
		$params = [ $code, ULSJsonMessageLoader::getMessages( $code ) ];

		return Xml::encodeJsCall( 'mw.uls.loadLocalization', $params );
	}
}
