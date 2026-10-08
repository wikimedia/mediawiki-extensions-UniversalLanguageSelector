<?php

declare( strict_types = 1 );

use MediaWiki\MediaWikiServices;
use MediaWiki\Registration\ExtensionRegistry;
use UniversalLanguageSelector\SkinSupport;

/** @phpcs-require-sorted-array */
return [
	'UniversalLanguageSelector.SkinSupport' => static function ( MediaWikiServices $services ): SkinSupport {
		return new SkinSupport(
			ExtensionRegistry::getInstance()->getAttribute( 'UniversalLanguageSelectorSkinConfig' )
		);
	},
];
