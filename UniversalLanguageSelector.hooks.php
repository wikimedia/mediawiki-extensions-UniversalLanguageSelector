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
	// Used when extension registration in use which skips the main php file
	public static function setVersionConstant() {
		define( 'ULS_VERSION', '2015-06-08' );
	}

	/**
	 * Whether ULS user toolbar (language selection and settings) is enabled.
	 *
	 * @param User $user
	 * @return bool
	 */
	public static function isToolbarEnabled( $user ) {
		global $wgULSEnable, $wgULSEnableAnon;

		if ( !$wgULSEnable ) {
			return false;
		}
		if ( !$wgULSEnableAnon && $user->isAnon() ) {
			return false;
		}

		return true;
	}

	/**
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 * Hook: BeforePageDisplay
	 */
	public static function addModules( $out, $skin ) {
		global $wgULSCompactLinks, $wgULSPosition, $wgULSGeoService, $wgULSEventLogging,
			$wgInterwikiMagic, $wgHideInterlanguageLinks;

		// Load the style for users without JS, to hide the useless links
		$out->addModuleStyles( 'ext.uls.nojs' );

		// If EventLogging integration is enabled, load the schema module
		// and the event logging functions module
		if ( $wgULSEventLogging ) {
			$out->addModules( array(
				'schema.UniversalLanguageSelector',
				'ext.uls.eventlogger',
			) );
		}

		// If the extension is enabled, basic features (API, language data) available.
		$out->addModules( 'ext.uls.init' );

		// If compact ULS beta feature is enabled and is actually functional
		// (see onGetBetaFeaturePreferences)
		if ( $wgULSCompactLinks &&
			$wgInterwikiMagic === true &&
			$wgHideInterlanguageLinks === false &&
			class_exists( 'BetaFeatures' ) &&
			BetaFeatures::isFeatureEnabled( $out->getUser(), 'uls-compact-links' )
		) {
			$out->addModules( 'ext.uls.compactlinks' );
		}

		if ( is_string( $wgULSGeoService ) ) {
			$out->addModules( 'ext.uls.geoclient' );
		} elseif ( $wgULSGeoService === true ) {
			$out->addScript( '<script src="//meta.wikimedia.org/geoiplookup"></script>' );
		}

		if ( self::isToolbarEnabled( $out->getUser() ) ) {
			// Enable UI language selection for the user.
			$out->addModules( 'ext.uls.interface' );
		}

		if ( $wgULSPosition === 'personal' ) {
			$out->addModules( 'ext.uls.pt' );
		} else {
			$out->addModules( 'ext.uls.interlanguage' );
		}

		return true;
	}

	public static function onEventLoggingRegisterSchemas( array &$schemas ) {
		$schemas['UniversalLanguageSelector'] = 7327441;
	}

	/**
	 * @param $testModules array of javascript testing modules. 'qunit' is fed
	 * using tests/qunit/QUnitTestResources.php.
	 * @param ResourceLoader $resourceLoader
	 * @return bool
	 * Hook: ResourceLoaderTestModules
	 */
	public static function addTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.uls.tests'] = array(
			'scripts' => array( 'tests/qunit/ext.uls.tests.js' ),
			'dependencies' => array( 'jquery.uls', 'ext.uls.init', 'ext.uls.preferences' ),
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'UniversalLanguageSelector',
		);

		return true;
	}

	/**
	 * Add some tabs for navigation for users who do not use Ajax interface.
	 * Hook: PersonalUrls
	 */
	static function addPersonalBarTrigger( array &$personal_urls, &$title ) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'personal' ) {
			return true;
		}

		$context = RequestContext::getMain();
		if ( !self::isToolbarEnabled( $context->getUser() ) ) {
			return true;
		}

		// The element id will be 'pt-uls'
		$lang = $context->getLanguage();
		$personal_urls = array(
			'uls' => array(
				'text' => $lang->fetchLanguageName( $lang->getCode() ),
				'href' => '#',
				'class' => 'uls-trigger autonym',
				'active' => true
			)
		) + $personal_urls;

		return true;
	}

	/**
	 * @param array $preferred
	 * @return string
	 */
	protected static function getDefaultLanguage( array $preferred ) {
		$supported = Language::fetchLanguageNames( null, 'mwfile' );

		// look for a language that is acceptable to the client
		// and known to the wiki.
		foreach ( $preferred as $code => $weight ) {
			if ( isset( $supported[$code] ) ) {
				return $code;
			}
		}

		// Some browsers might only send codes like de-de.
		// Try with bare code.
		foreach ( $preferred as $code => $weight ) {
			$parts = explode( '-', $code, 2 );
			$code = $parts[0];
			if ( isset( $supported[$code] ) ) {
				return $code;
			}
		}

		return '';
	}

	/**
	 * Hook to UserGetLanguageObject
	 * @param User $user
	 * @param string $code
	 * @param IContextSource $context
	 * @return bool
	 */
	public static function getLanguage( User $user, &$code, IContextSource $context ) {
		global $wgULSAnonCanChangeLanguage, $wgULSLanguageDetection;

		if ( !self::isToolbarEnabled( $user ) ) {
			return true;
		}

		$request = $context->getRequest();

		$languageToSave = $request->getText( 'setlang' );
		if ( $request->getText( 'uselang' ) && !$languageToSave ) {
			// uselang can be used for temporary override of language preference
			// when setlang is not provided
			return true;
		}

		// Registered users - simple
		if ( !$user->isAnon() ) {
			// Language change
			if ( Language::isSupportedLanguage( $languageToSave ) ) {
				// Apply immediately
				$user->setOption( 'language', $languageToSave );
				$code = $languageToSave;
				// Promise to sync the DB on post-send
				DeferredUpdates::addCallableUpdate( function() use ( $user ) {
					$user->saveSettings();
				} );
			}

			// Otherwise just use what is stored in preferences
			return true;
		}

		// Logged out users - less simple
		if ( !$wgULSAnonCanChangeLanguage ) {
			return true;
		}

		// Language change
		if ( Language::isSupportedLanguage( $languageToSave ) ) {
			$request->response()->setcookie( 'language', $languageToSave );
			$code = $languageToSave;

			return true;
		}

		// Try cookie
		$languageToUse = $request->getCookie( 'language', null, '' );
		if ( Language::isSupportedLanguage( $languageToUse ) ) {
			$code = $languageToUse;

			return true;
		}

		// As last resort, try Accept-Language headers if allowed
		if ( $wgULSLanguageDetection ) {
			$preferred = $request->getAcceptLang();
			$default = self::getDefaultLanguage( $preferred );
			if ( $default !== '' ) {
				$code = $default;
			}
		}

		// Fall back to other hooks or content language
		return true;
	}

	/**
	 * Hook: ResourceLoaderGetConfigVars
	 * @param array $vars
	 * @return bool
	 */
	public static function addConfig( &$vars ) {
		global $wgULSGeoService,
			$wgULSIMEEnabled, $wgULSWebfontsEnabled,
			$wgULSPosition, $wgULSNoWebfontsSelectors,
			$wgULSAnonCanChangeLanguage,
			$wgULSEventLogging,
			$wgULSImeSelectors, $wgULSNoImeSelectors,
			$wgULSFontRepositoryBasePath,
			$wgExtensionAssetsPath;

		// Place constant stuff here (not depending on request context)
		if ( is_string( $wgULSGeoService ) ) {
			$vars['wgULSGeoService'] = $wgULSGeoService;
		}

		$vars['wgULSIMEEnabled'] = $wgULSIMEEnabled;
		$vars['wgULSWebfontsEnabled'] = $wgULSWebfontsEnabled;
		$vars['wgULSPosition'] = $wgULSPosition;
		$vars['wgULSAnonCanChangeLanguage'] = $wgULSAnonCanChangeLanguage;
		$vars['wgULSEventLogging'] = $wgULSEventLogging && class_exists( 'ResourceLoaderSchemaModule' );
		$vars['wgULSImeSelectors'] = $wgULSImeSelectors;
		$vars['wgULSNoImeSelectors'] = $wgULSNoImeSelectors;
		$vars['wgULSNoWebfontsSelectors'] = $wgULSNoWebfontsSelectors;

		if ( is_string( $wgULSFontRepositoryBasePath ) ) {
			$vars['wgULSFontRepositoryBasePath'] = $wgULSFontRepositoryBasePath;
		} else {
			$vars['wgULSFontRepositoryBasePath'] = $wgExtensionAssetsPath .
				'/UniversalLanguageSelector/data/fontrepo/fonts/';
		}

		return true;
	}

	/**
	 * Hook: MakeGlobalVariablesScript
	 * @param array $vars
	 * @param OutputPage $out
	 * @return bool
	 */
	public static function addVariables( &$vars, OutputPage $out ) {
		// Place request context dependent stuff here
		$vars['wgULSAcceptLanguageList'] = array_keys( $out->getRequest()->getAcceptLang() );

		// An optimization to avoid loading all of uls.data just to get the autonym
		$lang = $out->getLanguage();
		$vars['wgULSCurrentAutonym'] = $lang->fetchLanguageName( $lang->getCode() );

		return true;
	}

	public static function onGetPreferences( $user, &$preferences ) {
		$preferences['uls-preferences'] = array(
			'type' => 'api',
		);

		// A link shown for accessing ULS language settings from preferences screen
		$preferences['languagesettings'] = array(
			'type' => 'info',
			'raw' => true,
			'section' => 'personal/i18n',
			'default' => "<a id='uls-preferences-link' href='#'></a>",
			// The above link will have text set from javascript. Just to avoid
			// showing the link when javascript is disabled.
		);

		return true;
	}

	public static function onGetBetaFeaturePreferences( $user, &$prefs ) {
		global $wgExtensionAssetsPath, $wgULSCompactLinks,
			$wgHideInterlanguageLinks, $wgInterwikiMagic;

		if ( $wgULSCompactLinks &&
			$wgInterwikiMagic === true &&
			$wgHideInterlanguageLinks === false
		) {
			$imagesDir = "$wgExtensionAssetsPath/UniversalLanguageSelector/resources/images";
			$prefs['uls-compact-links'] = array(
				'label-message' => 'uls-betafeature-label',
				'desc-message' => 'uls-betafeature-desc',
				'screenshot' => array(
					'ltr' => "$imagesDir/compact-links-ltr.png",
					'rtl' => "$imagesDir/compact-links-rtl.png",
				),
				'info-link' =>
					'https://www.mediawiki.org/wiki/Universal_Language_Selector/Design/Interlanguage_links',
				'discussion-link' =>
					'https://www.mediawiki.org/wiki/Talk:Universal_Language_Selector/Design/Interlanguage_links',
			);
		}
	}

	/**
	 * Hook: SkinTemplateOutputPageBeforeExec
	 * @param Skin $skin
	 * @param QuickTemplate $template
	 * @return bool
	 */
	public static function onSkinTemplateOutputPageBeforeExec( Skin &$skin,
		QuickTemplate &$template
	) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'interlanguage' ) {
			return true;
		}

		if ( !self::isToolbarEnabled( $skin->getUser() ) ) {
			return true;
		}

		// A dummy link, just to make sure that the section appears
		$template->data['language_urls'][] = array(
			'href' => '#',
			'text' => '',
			'class' => 'uls-p-lang-dummy',
		);

		return true;
	}

	/**
	 * Add basic webfonts support to the mobile interface (via MobileFrontend extension)
	 * Hook: EnterMobileMode
	 * @param MobileContext $context
	 * @return bool
	 */
	public static function onEnterMobileMode( $context ) {
		global $wgULSEnable, $wgULSMobileWebfontsEnabled;

		// Currently only supported in mobile Beta mode
		if ( $wgULSEnable && $wgULSMobileWebfontsEnabled && $context->isBetaGroupMember() ) {
			$context->getOutput()->addModules( 'ext.uls.webfonts.mobile' );
		}

		return true;
	}

	/**
	 * Conditionally register jquery.18n (backwards copatbility for those on pre-MediaWiki 1.26).
	 *
	 * @param ResourceLoader $resourceLoader
	 * @return boolean true
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		global $wgResourceModules;

		if (
			(
				(
					is_callable( array( $resourceLoader, 'isModuleRegistered' ) ) &&
					!$resourceLoader->isModuleRegistered( 'jquery.i18n' )
				)
				||
				$resourceLoader->getModule( 'jquery.i18n' ) === null
			)
			&&
			!isset( $wgResourceModules[ 'jquery.i18n' ] )
		) {
			$resourceLoader->register( array(
				'jquery.i18n' => array(
					'scripts' => array(
						'lib/jquery.i18n/jquery.i18n.js',
						'lib/jquery.i18n/jquery.i18n.messagestore.js',
						'lib/jquery.i18n/jquery.i18n.parser.js',
						'lib/jquery.i18n/jquery.i18n.emitter.js',
						'lib/jquery.i18n/jquery.i18n.emitter.bidi.js',
						'lib/jquery.i18n/jquery.i18n.language.js',
					),
					'dependencies' => 'mediawiki.libs.pluralruleparser',
					'languageScripts' => array(
						'bs' => 'lib/jquery.i18n/languages/bs.js',
						'dsb' => 'lib/jquery.i18n/languages/dsb.js',
						'fi' => 'lib/jquery.i18n/languages/fi.js',
						'ga' => 'lib/jquery.i18n/languages/ga.js',
						'he' => 'lib/jquery.i18n/languages/he.js',
						'hsb' => 'lib/jquery.i18n/languages/hsb.js',
						'hu' => 'lib/jquery.i18n/languages/hu.js',
						'hy' => 'lib/jquery.i18n/languages/hy.js',
						'la' => 'lib/jquery.i18n/languages/la.js',
						'ml' => 'lib/jquery.i18n/languages/ml.js',
						'os' => 'lib/jquery.i18n/languages/os.js',
						'ru' => 'lib/jquery.i18n/languages/ru.js',
						'sl' => 'lib/jquery.i18n/languages/sl.js',
						'uk' => 'lib/jquery.i18n/languages/uk.js',
					),
					'targets' => array( 'desktop', 'mobile' ),
					'localBasePath' => __DIR__,
					'remoteExtPath' => 'UniversalLanguageSelector',
				)
			) );
		}

		return true;
	}
}
