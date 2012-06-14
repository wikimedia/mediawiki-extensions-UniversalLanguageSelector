<?php
/**
 * Hooks for UniversalLanguageSelector extension
 *
 * @file
 * @ingroup Extensions
 */

class UniversalLanguageSelectorHooks {

	/**
	 * BeforePageDisplay hook handler.
	 * @param $out OutputPage
	 * @param $skin Skin
	 * @return bool
	 */
	public static function addModules( $out, $skin ) {
		$out->addModules( 'ext.uls.init' );
		return true;
	}
	/**
	 * ResourceLoaderTestModules hook handler.
	 * @param $testModules: array of javascript testing modules. 'qunit' is fed using tests/qunit/QUnitTestResources.php.
	 * @param $resourceLoader object
	 * @return bool
	 */
	public static function addTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.uls.tests'] = array(
			'scripts' => array( 'tests/qunit/ext.uls.tests.js' ),
			'dependencies' => array( 'ext.uls.init' ),
			'localBasePath' => dirname( __FILE__ ),
			'remoteExtPath' => 'UniversalLanguageSelector',
		);
		return true;
	}
	/**
	 * Add some tabs for navigation for users who do not use Ajax interface.
	 * Hooks: SkinTemplateNavigation, SkinTemplateTabs
	 */
	static function addTrigger( array &$personal_urls, &$title ) {
		global $wgLang;
		$tabindex = 2;
		$personal_urls = array( 'uls'=> array(
					'text' =>  $wgLang->getLanguageName( $wgLang->getCode() ),
					'href' => '#',
					'class' => 'uls-trigger',
					'active' => true
				) ) + $personal_urls;
		return true;
	}

}
