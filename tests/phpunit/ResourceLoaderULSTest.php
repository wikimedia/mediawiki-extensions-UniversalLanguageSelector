<?php
/**
 * PHP Unit tests for ResourceLoaderULSModule class.
 *
 * @file
 * @ingroup Extensions
 *
 * @author Santhosh Thottingal
 */

/**
 * @covers ResourceLoaderULSModule
 */
class ResourceLoaderULSModuleMemcachedTest extends MediaWikiTestCase {
	/**
	 * Test whether the modified time of the RL module varies
	 * correctly with language code.
	 * @covers ResourceLoaderSchemaModule::getModifiedTime
	 */
	public function testModifiedTime() {
		$request = new WebRequest();
		$module = new ResourceLoaderULSModule();

		$request->setVal( 'lang', 'he' );
		$context = new ResourceLoaderContext(
			new ResourceLoader(), $request );
		$mtimeHebrew = $module->getModifiedTime( $context );
		// sleep for 1 second
		sleep( 1 );
		$request->setVal( 'lang', 'hi' );
		$context = new ResourceLoaderContext( new ResourceLoader(), $request );
		$mtimeHindi = $module->getModifiedTime( $context );
		$this->assertGreaterThan( $mtimeHebrew, $mtimeHindi, 'Hindi has recent timestamp than Hebrew' );

		// sleep for 1 second
		sleep( 1 );
		$request->setVal( 'lang', 'he' );
		$context = new ResourceLoaderContext( new ResourceLoader(), $request );
		$mtimeHebrewNew = $module->getModifiedTime( $context );
		$this->assertEquals( $mtimeHebrewNew, $mtimeHebrew, 'Hebrew timestamp remained same' );

		// sleep for 1 second
		sleep( 1 );
		$request->setVal( 'lang', 'hi' );
		$context = new ResourceLoaderContext( new ResourceLoader(), $request );
		$mtimeHindiNew = $module->getModifiedTime( $context );
		$this->assertEquals( $mtimeHindi, $mtimeHindiNew, 'Hindi timestamp remained same' );
	}
}
