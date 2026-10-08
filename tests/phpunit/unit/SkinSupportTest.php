<?php

declare( strict_types = 1 );

namespace UniversalLanguageSelector\Tests;

use MediaWiki\Config\HashConfig;
use MediaWiki\Skin\Skin;
use MediaWiki\User\User;
use MediaWikiUnitTestCase;
use UniversalLanguageSelector\SkinSupport;

/**
 * @covers \UniversalLanguageSelector\SkinSupport
 * @license GPL-2.0-or-later
 */
class SkinSupportTest extends MediaWikiUnitTestCase {
	private const SKIN_CONFIG = [
		'core-only' => [
			'CoreFeaturesOnly' => true,
			'Features' => [
				'LanguageDescriptions' => true,
				'LanguageSettingsQuickAction' => false,
			],
			'FloatingPlacement' => 'bottom-start',
		],
		'header' => [
			'LanguageInHeaderConfig' => 'InHeader',
			'LanguageInMainMenuConfig' => 'InMainMenu',
		],
	];

	private function newSkin( string $name, array $settings = [], bool $isAnon = true ): Skin {
		$user = $this->createMock( User::class );
		$user->method( 'isAnon' )->willReturn( $isAnon );
		$skin = $this->createMock( Skin::class );
		$skin->method( 'getSkinName' )->willReturn( $name );
		$skin->method( 'getConfig' )->willReturn( new HashConfig( $settings ) );
		$skin->method( 'getUser' )->willReturn( $user );
		return $skin;
	}

	private static function userStatus( bool $loggedOut, bool $loggedIn = true ): array {
		return [ 'logged_out' => $loggedOut, 'logged_in' => $loggedIn ];
	}

	public function testAddsOnlyCoreFeatures() {
		$skinSupport = new SkinSupport( self::SKIN_CONFIG );
		$this->assertTrue( $skinSupport->addsOnlyCoreFeatures( $this->newSkin( 'core-only' ) ) );
		$this->assertFalse( $skinSupport->addsOnlyCoreFeatures( $this->newSkin( 'other' ) ) );
	}

	public function testGetConfigVars() {
		$skinSupport = new SkinSupport( self::SKIN_CONFIG );
		$this->assertSame( [
			'wgULSDisplaySettingsInInterlanguage' => false,
			'wgULSSkinFeatures' => [
				'languageDescriptions' => true,
				'languageSettingsQuickAction' => false,
			],
			'wgULSFloatingPlacement' => 'bottom-start',
		], $skinSupport->getConfigVars( 'core-only' ) );
		$this->assertSame( [
			'wgULSDisplaySettingsInInterlanguage' => false,
			'wgULSSkinFeatures' => [
				'languageDescriptions' => false,
				'languageSettingsQuickAction' => true,
			],
			'wgULSFloatingPlacement' => null,
		], $skinSupport->getConfigVars( 'other' ) );
	}

	public static function provideLanguageButtonPlacement(): array {
		return [
			'header only' => [ true, false, true, false ],
			'main menu only' => [ false, true, false, null ],
			'header and main menu' => [ true, true, true, null ],
			'neither' => [ false, false, false, true ],
		];
	}

	/**
	 * @dataProvider provideLanguageButtonPlacement
	 */
	public function testLanguageButtonPlacement(
		bool $inHeader, bool $inMainMenu, bool $expectedHeaderButton, ?bool $expectedCompactLinks
	) {
		$skinSupport = new SkinSupport( self::SKIN_CONFIG );
		$skin = $this->newSkin( 'header', [
			'InHeader' => self::userStatus( $inHeader ),
			'InMainMenu' => self::userStatus( $inMainMenu ),
		] );
		$this->assertSame( $expectedHeaderButton, $skinSupport->hasHeaderLanguageButton( $skin ) );
		$this->assertSame( $expectedCompactLinks, $skinSupport->getSkinCompactLinksOverride( $skin ) );
	}

	public function testLanguageButtonPlacementUsesUserStatus() {
		$skinSupport = new SkinSupport( self::SKIN_CONFIG );
		$settings = [
			'InHeader' => self::userStatus( false, true ),
			'InMainMenu' => self::userStatus( false, false ),
		];
		$this->assertFalse( $skinSupport->hasHeaderLanguageButton( $this->newSkin( 'header', $settings ) ) );
		$this->assertTrue( $skinSupport->hasHeaderLanguageButton( $this->newSkin( 'header', $settings, false ) ) );
	}

	public function testUndeclaredLanguageButtonPlacement() {
		$skinSupport = new SkinSupport( self::SKIN_CONFIG );
		$skin = $this->newSkin( 'other' );
		$this->assertFalse( $skinSupport->hasHeaderLanguageButton( $skin ) );
		$this->assertNull( $skinSupport->getSkinCompactLinksOverride( $skin ) );
	}
}
