<?php

namespace UniversalLanguageSelector\Tests;

use MediaWiki\ResourceLoader\Context;
use UniversalLanguageSelector\ResourceLoaderULSJsonMessageModule;

/**
 * @covers \UniversalLanguageSelector\ResourceLoaderULSJsonMessageModule
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class ResourceLoaderULSJsonMessageModuleTest extends \PHPUnit\Framework\TestCase {

	public function testAllReturnValues() {
		$instance = new ResourceLoaderULSJsonMessageModule();

		$context = $this->createMock( Context::class );
		$context->method( 'getLanguage' )
			->willReturn( 'en' );

		$this->assertContainsOnly( 'string', $instance->getDependencies(), 'dependencies' );

		$summary = $instance->getDefinitionSummary( $context );
		$lastElement = end( $summary );
		$this->assertArrayHasKey( 'fileHashes', $lastElement );
		$this->assertContainsOnly( 'string', $lastElement['fileHashes'] );

		$script = $instance->getScript( $context );
		$this->assertStringStartsWith( 'mw.uls.loadLocalization("en",{"', $script );
	}

}
