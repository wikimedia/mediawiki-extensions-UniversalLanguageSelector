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
			'localBasePath' => __DIR__,
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
	/**
	 * Add the template for the ULS to the body.
	 * Hooks: SkinAfterContent
	 * TODO: move to JavaScript side
	 * TODO: hardcoded English
	 */
	public static function addTemplate( &$data, $skin ) {
		global $wgContLang;
		$languages = Language::fetchLanguageNames( $wgContLang->getCode() );
		$languageData = htmlspecialchars( FormatJSON::encode( $languages ) );
		$data .= "
		<div class=\"uls-menu\" data-languages=\"" . $languageData . "\">
			<span class=\"icon-close\"></span>
			<div class=\"uls-menu-header\">
				<div class=\"uls-menu-header-left\">
					<h1>" . wfMsgHtml( 'uls-select-content-language' ) . "</h1>
				</div>
				<div class=\"uls-menu-header-right\">
					<div class='uls-worldmap'>
						 <div class='uls-region' id='uls-region-1' data-region='1'>
							<a>North America<br>Latin America<br>South America</a>
						 </div>
						 <div class='uls-region' id='uls-region-2' data-region='2'>
							<a>Europe<br>Middle East<br>Africa</a>
						 </div>
						 <div class='uls-region' id='uls-region-3' data-region='3'>
							<a>Asia<br>Australia<br>Pacific</a>
						</div>
					</div>
				</div>
			</div>
			<div style=\"clear: both\"></div>
			<div class=\"uls-lang-selector\">
				<form action=\"#\" class=\"filterform\">
					<input type=\"text\" placeholder=\"Language search\" id=\"languagefilter\"
						class=\"filterinput\">
					<span class=\"search-button\"></span>
				</form>
				<div class=\"uls-language-list\" >
					<ul class=\"uls-language-filter-result\" >
					</ul>
				</div>
			</div>
		</div>";
		return true;
	}
}
