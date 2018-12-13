<?php

namespace UniversalLanguageSelector\Tests;

use ResourceLoaderULSModule;

/**
 * @covers \ResourceLoaderULSModule
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class ResourceLoaderULSModuleTest extends \PHPUnit\Framework\TestCase {
	use \PHPUnit4And6Compat;

	public function testAllReturnValues() {
		$instance = new ResourceLoaderULSModule();

		$context = $this->createMock( \ResourceLoaderContext::class );
		$context->method( 'getLanguage' )
			->willReturn( 'en' );

		$script = $instance->getScript( $context );
		$this->assertStringStartsWith( 'mw.config.set({"wgULSLanguages":{"', $script );

		$this->assertTrue( $instance->enableModuleContentVersion() );
	}

}
