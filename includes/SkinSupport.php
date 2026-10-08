<?php

declare( strict_types = 1 );
/**
 * What ULS does differently on each skin.
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 * @license MIT
 */

namespace UniversalLanguageSelector;

use MediaWiki\Skin\Skin;

class SkinSupport {
	private const DEFAULT_FEATURES = [
		'LanguageDescriptions' => false,
		'LanguageSettingsQuickAction' => true,
	];

	/**
	 * @param array $skinConfig The UniversalLanguageSelectorSkinConfig attribute, keyed by skin name
	 */
	public function __construct(
		private readonly array $skinConfig,
	) {
	}

	private function getSkinConfig( string $skinName ): array {
		return $this->skinConfig[ $skinName ] ?? [];
	}

	/**
	 * Reads the setting that the skin names under $key, for the current user.
	 *
	 * @return bool|null Null when the skin does not declare $key
	 */
	private function getUserStatusSetting( Skin $skin, string $key ): ?bool {
		$configName = $this->getSkinConfig( $skin->getSkinName() )[ $key ] ?? null;
		if ( $configName === null ) {
			return null;
		}
		$values = $skin->getConfig()->get( $configName );
		$userStatus = $skin->getUser()->isAnon() ? 'logged_out' : 'logged_in';
		return (bool)( $values[ $userStatus ] ?? true );
	}

	/**
	 * Whether the skin shows a language button in the page header.
	 */
	public function hasHeaderLanguageButton( Skin $skin ): bool {
		return $this->getUserStatusSetting( $skin, 'LanguageInHeaderConfig' ) ?? false;
	}

	/**
	 * Whether compact links is on or off because of the skin's language button placement.
	 *
	 * @return bool|null Null when the skin leaves it to the wiki config and user preference
	 */
	public function getSkinCompactLinksOverride( Skin $skin ): ?bool {
		$isLanguageInHeader = $this->getUserStatusSetting( $skin, 'LanguageInHeaderConfig' );
		// Unless the languages are also in the main menu (as on Russian WP)
		if (
			$isLanguageInHeader === null ||
			$this->getUserStatusSetting( $skin, 'LanguageInMainMenuConfig' )
		) {
			return null;
		}
		return !$isLanguageInHeader;
	}

	/**
	 * Whether ULS adds only its core features on this skin (T237036).
	 */
	public function addsOnlyCoreFeatures( Skin $skin ): bool {
		return (bool)( $this->getSkinConfig( $skin->getSkinName() )['CoreFeaturesOnly'] ?? false );
	}

	/**
	 * Static config vars for the skin, with defaults for the keys it does not declare.
	 */
	public function getConfigVars( string $skinName ): array {
		$skinConfig = $this->getSkinConfig( $skinName );
		$features = ( $skinConfig['Features'] ?? [] ) + self::DEFAULT_FEATURES;
		return [
			'wgULSDisplaySettingsInInterlanguage' => $skinConfig['ULSDisplaySettingsInInterlanguage'] ?? false,
			'wgULSSkinFeatures' => [
				'languageDescriptions' => (bool)$features['LanguageDescriptions'],
				'languageSettingsQuickAction' => (bool)$features['LanguageSettingsQuickAction'],
			],
			'wgULSFloatingPlacement' => $skinConfig['FloatingPlacement'] ?? null,
		];
	}
}
