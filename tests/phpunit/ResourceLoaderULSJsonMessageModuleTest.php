<?php

namespace UniversalLanguageSelector\Tests;

use ResourceLoaderULSJsonMessageModule;

/**
 * @covers \ResourceLoaderULSJsonMessageModule
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class ResourceLoaderULSJsonMessageModuleTest extends \PHPUnit\Framework\TestCase {
	use \PHPUnit4And6Compat;

	public function testAllReturnValues() {
		$instance = new ResourceLoaderULSJsonMessageModule();

		$context = $this->createMock( \ResourceLoaderContext::class );
		$context->method( 'getLanguage' )
			->willReturn( 'en' );

		$this->assertContainsOnly( 'string', $instance->getDependencies(), 'dependencies' );
		$this->assertContainsOnly( 'string', $instance->getTargets(), 'targets' );

		$summary = $instance->getDefinitionSummary( $context );
		$lastElement = end( $summary );
		$this->assertArrayHasKey( 'fileHashes', $lastElement );
		$this->assertContainsOnly( 'string', $lastElement['fileHashes'] );

		$script = $instance->getScript( $context );
		$this->assertStringStartsWith( 'mw.uls.loadLocalization("en",{"', $script );
	}

}
