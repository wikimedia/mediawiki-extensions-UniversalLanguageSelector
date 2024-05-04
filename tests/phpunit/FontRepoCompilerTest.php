<?php

namespace UniversalLanguageSelector\Tests;

use UniversalLanguageSelector\FontRepoCompiler;

/**
 * @covers \UniversalLanguageSelector\FontRepoCompiler
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class FontRepoCompilerTest extends \PHPUnit\Framework\TestCase {

	public function testGetLanguages() {
		$instance = new FontRepoCompiler( '', '' );

		$result = $instance->getLanguages( [ 'languages' => 'de, en' ] );
		$this->assertSame( [ 'de', 'en' ], $result );
	}

	public function testAppendLanguages() {
		$instance = new FontRepoCompiler( '', '' );

		$languages = [ 'de' => [] ];
		$fontLanguages = [ 'de', 'en', 'fr*' ];

		$instance->appendLanguages( $languages, $fontLanguages, 'dummyFontName' );
		$this->assertSame( [
			'de' => [ 'dummyFontName' ],
			'en' => [ 'system', 'dummyFontName' ],
			'fr' => [ 'dummyFontName' ],
		], $languages );
	}

	public function testGetAllBasicFontInfo() {
		$instance = new FontRepoCompiler( '', '' );

		$givenInfo = [
			'fontweight' => 'dummyFontWeight',
			'fontstyle' => 'dummyFontStyle',
			'woff2' => 'Alef-Regular.woff2',
			'bold' => 'dummyBold',
			'bolditalic' => 'dummyBoldItalic',
			'italic' => 'dummyItalic',
		];

		$result = $instance->getFontInfo( $givenInfo, __DIR__ . '/../../data/fontrepo/fonts/Alef' );
		$this->assertSame( [
			'fontweight' => 'dummyFontWeight',
			'fontstyle' => 'dummyFontStyle',
			'woff2' => 'Alef/Alef-Regular.woff2?a2499',
			'variants' => [
				'bold' => 'dummyBold',
				'bolditalic' => 'dummyBoldItalic',
				'italic' => 'dummyItalic',
			],
		], $result );
	}

	public function testScanForWoffFiles() {
		$instance = new FontRepoCompiler( '', '' );

		$result = $instance->getFontInfo( [], __DIR__ . '/../../data/fontrepo/fonts/Alef' );
		$this->assertSame( [
			'woff2' => 'Alef/Alef-Regular.woff2?a2499',
		], $result );
	}

	public function testGetRepository() {
		$path = __DIR__ . '/../../data/fontrepo/fonts';
		$instance = new FontRepoCompiler( $path, 'dummyPath' );

		$result = $instance->getRepository();
		$this->assertSame( 'dummyPath', $result['base'], 'base' );
		$this->assertContainsOnly( 'array', $result['languages'], 'languages' );
		$this->assertContainsOnly( 'array', $result['fonts'], 'fonts' );
	}

}
