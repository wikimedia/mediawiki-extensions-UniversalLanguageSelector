<?php

declare( strict_types = 1 );

namespace UniversalLanguageSelector\Tests\Integration;

use MediaWiki\Registration\ExtensionRegistry;
use MediaWikiIntegrationTestCase;

/**
 * Checks the UniversalLanguageSelectorSkinConfig that the loaded skins declare.
 * Skins are loaded together with ULS in the shared gate, so this also runs on skin patches.
 *
 * @coversNothing
 * @license GPL-2.0-or-later
 */
class SkinConfigTest extends MediaWikiIntegrationTestCase {
	private const BOOLEAN_KEYS = [ 'CoreFeaturesOnly', 'ULSDisplaySettingsInInterlanguage' ];
	private const FEATURES = [ 'LanguageDescriptions', 'LanguageSettingsQuickAction' ];
	private const USER_STATUS_CONFIG_KEYS = [ 'LanguageInHeaderConfig', 'LanguageInMainMenuConfig' ];
	// Floating UI placements
	private const PLACEMENTS = [
		'top', 'top-start', 'top-end',
		'right', 'right-start', 'right-end',
		'bottom', 'bottom-start', 'bottom-end',
		'left', 'left-start', 'left-end',
	];

	private function getSkinConfig(): array {
		$skinConfig = ExtensionRegistry::getInstance()->getAttribute( 'UniversalLanguageSelectorSkinConfig' );
		if ( $skinConfig === [] ) {
			$this->markTestSkipped( 'No loaded skin declares UniversalLanguageSelectorSkinConfig' );
		}
		return $skinConfig;
	}

	public function testKnownKeys() {
		$knownKeys = array_merge(
			self::BOOLEAN_KEYS, self::USER_STATUS_CONFIG_KEYS, [ 'Features', 'FloatingPlacement' ]
		);
		foreach ( $this->getSkinConfig() as $skinName => $config ) {
			$this->assertIsArray( $config, $skinName );
			foreach ( array_keys( $config ) as $key ) {
				$this->assertContains( $key, $knownKeys, "$skinName declares an unknown key" );
			}
		}
	}

	public function testBooleanKeys() {
		foreach ( $this->getSkinConfig() as $skinName => $config ) {
			foreach ( self::BOOLEAN_KEYS as $key ) {
				$this->assertIsBool( $config[ $key ] ?? false, "$skinName: $key" );
			}
		}
	}

	public function testFeatures() {
		foreach ( $this->getSkinConfig() as $skinName => $config ) {
			$features = $config['Features'] ?? [];
			$this->assertIsArray( $features, "$skinName: Features" );
			foreach ( $features as $feature => $value ) {
				$this->assertContains( $feature, self::FEATURES, "$skinName declares an unknown feature" );
				$this->assertIsBool( $value, "$skinName: Features.$feature" );
			}
		}
	}

	public function testFloatingPlacement() {
		foreach ( $this->getSkinConfig() as $skinName => $config ) {
			$this->assertContains(
				$config['FloatingPlacement'] ?? 'bottom-end', self::PLACEMENTS, "$skinName: FloatingPlacement"
			);
		}
	}

	public function testUserStatusConfig() {
		$declared = [];
		foreach ( $this->getSkinConfig() as $skinName => $config ) {
			foreach ( self::USER_STATUS_CONFIG_KEYS as $key ) {
				if ( isset( $config[ $key ] ) ) {
					$declared[] = [ $skinName, $key, $config[ $key ] ];
				}
			}
		}
		if ( $declared === [] ) {
			$this->markTestSkipped( 'No loaded skin declares a setting name' );
		}

		$mainConfig = $this->getServiceContainer()->getMainConfig();
		foreach ( $declared as [ $skinName, $key, $configName ] ) {
			$this->assertTrue( $mainConfig->has( $configName ), "$skinName: $key names a missing setting" );
			// ULS reads only the logged_in and logged_out values
			$value = $mainConfig->get( $configName );
			$this->assertIsArray( $value, "$skinName: $configName" );
			$this->assertIsBool( $value['logged_in'] ?? null, "$skinName: $configName.logged_in" );
			$this->assertIsBool( $value['logged_out'] ?? null, "$skinName: $configName.logged_out" );
		}
	}
}
