<?php
/**
 * ResourceLoader module for client-side loading of json-based localization.
 *
 * @file
 * @ingroup Extensions
 * @author Santhosh Thottingal
 */

namespace UniversalLanguageSelector;

use MediaWiki\Html\Html;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\Module;

/**
 * ResourceLoader module for client-side loading of json-based localization.
 */
class ResourceLoaderULSJsonMessageModule extends Module {
	/**
	 * Part of the ResourceLoader module interface.
	 * Declares the core ext.uls.i18n module as a dependency.
	 * @suppress PhanParamSignatureRealMismatchParamType, UnusedSuppression -- T308443
	 * @param Context|null $context
	 * @return string[] Module names.
	 */
	public function getDependencies( ?Context $context = null ) {
		return [ 'ext.uls.i18n' ];
	}

	/**
	 * @suppress PhanParamSignatureRealMismatchParamType, UnusedSuppression -- T308443
	 * @param Context $context
	 * @return array
	 */
	public function getDefinitionSummary( Context $context ) {
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
	 * @suppress PhanParamSignatureRealMismatchParamType, UnusedSuppression -- T308443
	 * @param Context $context
	 * @return string JavaScript code.
	 */
	public function getScript( Context $context ) {
		$code = $context->getLanguage();
		$params = [ $code, ULSJsonMessageLoader::getMessages( $code ) ];

		return Html::encodeJsCall( 'mw.uls.loadLocalization', $params );
	}
}
