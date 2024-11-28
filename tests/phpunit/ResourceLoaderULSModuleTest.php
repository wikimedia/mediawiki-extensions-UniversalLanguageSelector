<?php

namespace UniversalLanguageSelector\Tests;

use MediaWiki\Request\FauxRequest;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\ResourceLoader;
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

		$context = new Context( $this->createMock( ResourceLoader::class ),
			new FauxRequest( [ 'lang' => 'en' ] )
		);

		$script = $instance->getScript( $context );
		$this->assertStringStartsWith( 'mw.config.set({"wgULSLanguages":{"', $script );

		$this->assertTrue( $instance->enableModuleContentVersion() );
	}

}
