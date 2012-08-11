<?php
/**
 * Hooks for UniversalLanguageSelector extension.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
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
	 * Hook to UserGetLanguageObject
	 * @param  $user User
	 * @param  $code String
	 * @return bool
	 */
	public static function getLanguage( $user, &$code ) {
		global $wgRequest;
		if ( $wgRequest->getVal( 'uselang' ) ) {
			// uselang can be used for temporary override of language preference
			return true;
		}
		$setlang = $wgRequest->getVal( 'setlang' );
		if ( $setlang ) {
			if ( $user->isAnon() ) {
				$wgRequest->response()->setcookie( 'language', $setlang );
			} else {
				$user->setOption( 'language', $setlang );
				$user->saveSettings();
			}
			$code = $setlang;
		} else {
			if ( $user->isAnon() ) {
				$code = $wgRequest->getCookie( 'language' );
			} else {
				$code = $user->getOption( 'language' );
			}
		}
		$code = RequestContext::sanitizeLangCode( $code );
		return true;
	}
	/**
	 * Hook: ResourceLoaderGetConfigVars
	 * @param $vars Array
	 * @return bool
	  */
	public static function addConfig( &$vars ) {
		global $wgContLang;
		$languages = Language::fetchLanguageNames( $wgContLang->getCode() );
		$languageData = htmlspecialchars( FormatJSON::encode( $languages ) );
		$vars['wgULSLanguages'] = $languageData;
		return true;
	}

	/**
	 * Add the template for the ULS to the body.
	 * Hooks: SkinAfterContent
	 * TODO: move to JavaScript side
	 * TODO: hardcoded English
	 */
	public static function addTemplate( &$data, $skin ) {
		$data .= "
		<div class='uls-menu'>
			<div class='row'>
				<span class='icon-close'></span>
			</div>
			<div class='row'>
				<div class='four columns'>
					<h1>" . wfMsgHtml( 'uls-select-content-language' ) . "</h1>
				</div>
				<div class='three columns' id='settings-block'></div>
				<div class='five columns' id='map-block'>
					<div class='row'>
						<div class='three columns uls-region' id='uls-region-4' data-regiongroup='4'>
								<a>Worldwide</a>
						</div>
						<div class='nine columns'>
							<div class='row uls-worldmap'>
								 <div class='four columns uls-region' id='uls-region-1' data-regiongroup='1'>
									<a>America</a>
								 </div>
								 <div class='four columns uls-region' id='uls-region-2' data-regiongroup='2'>
									<a>Europe<br>Middle East<br>Africa</a>
								 </div>
								 <div class='four columns uls-region' id='uls-region-3' data-regiongroup='3'>
									<a>Asia<br>Australia<br>Pacific</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id='search' class='row'>
					<div class='one column'>
						<span class='search-label'></span>
					</div>
					<div class='ten columns'>
						<div id='search-input-block'>
							<input type='text' class='filterinput' id='filtersuggestion' disabled='true' autocomplete='off' role='textbox'  bound='true'/>
							<input type='text' class='filterinput' data-clear='languagefilter-clear' data-suggestion='filtersuggestion' id='languagefilter' placeholder='Language search' bound='true'/>
						</div>
					</div>
					<div class='one column'>
						<span id='languagefilter-clear'></span>
					</div>
				</div>
			<div class='row uls-language-list'></div>
			<div class='row uls-no-results-view'>
				<h2 class='ten columns end offset-by-one'>No results found for \"<span id='uls-no-found-search-term'></span>\"</h2>
				<div id='uls-no-found-more'>
					<div class='ten columns end offset-by-one'>
						<p>You can search by language name, script name, ISO code of language or you can browse by region:
							<a class='uls-region-link' data-region='NA' href='#'>America</a>,
							 <a class='uls-region-link' data-region='EU' href='#'>Europe</a>,
							 <a class='uls-region-link' data-region='ME' href='#'>Middle East</a>,
							 <a class='uls-region-link' data-region='AF' href='#'>Africa</a>,
							 <a class='uls-region-link' data-region='AS' href='#'>Asia</a>,
							 <a class='uls-region-link' data-region='PA' href='#'>Pacific</a> or
							 <a class='uls-region-link' data-region='WW' href='#'>Worldwide languages</a>.
						</p>
					</div>
				</div>
			</div>
		</div>";
		return true;
	}
}
