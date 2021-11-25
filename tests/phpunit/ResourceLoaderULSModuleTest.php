<?php

namespace UniversalLanguageSelector\Tests;

use UniversalLanguageSelector\ResourceLoaderULSModule;

/**
 * @covers \UniversalLanguageSelector\ResourceLoaderULSModule
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class ResourceLoaderULSModuleTest extends \PHPUnit\Framework\TestCase {

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
