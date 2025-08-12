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
	 * @param Context|null $context
	 * @return string[] Module names.
	 */
	public function getDependencies( ?Context $context = null ): array {
		return [ 'ext.uls.i18n' ];
	}

	public function getDefinitionSummary( Context $context ): array {
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
	 * @param Context $context
	 * @return string JavaScript code.
	 */
	public function getScript( Context $context ): string {
		$code = $context->getLanguage();
		$params = [ $code, ULSJsonMessageLoader::getMessages( $code ) ];

		return Html::encodeJsCall( 'mw.uls.loadLocalization', $params );
	}
}
