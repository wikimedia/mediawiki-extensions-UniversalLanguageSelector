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
	 * @param $testModules array of javascript testing modules. 'qunit' is fed using tests/qunit/QUnitTestResources.php.
	 * @param $resourceLoader ResourceLoader
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
		$personal_urls = array( 'uls' => array(
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
		$setlang = RequestContext::sanitizeLangCode( $setlang );
		// TODO: replace with core method once one exists
		$supported = Language::fetchLanguageNames( null, 'mwfile' );
		if ( !array_key_exists( $setlang, $supported ) ) {
			wfDebug( "Invalid user language code\n" );
			return true;
		}
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
		return true;
	}

	/**
	 * Hook: ResourceLoaderGetConfigVars
	 * @param $vars Array
	 * @return bool
	 */
	public static function addConfig( &$vars ) {
		global $wgContLang;
		$vars['wgULSLanguages'] = Language::fetchLanguageNames( $wgContLang->getCode(), 'mwfile' );
		return true;
	}

	/**
	 * Hook: MakeGlobalVariablesScript
	 * @param $vars Array
	 * @return bool
	 */
	public static function addVariables( &$vars, OutputPage $out ) {
		$vars['wgULSAcceptLanguageList'] = array_keys( $out->getRequest()->getAcceptLang() );
		return true;
	}
}
