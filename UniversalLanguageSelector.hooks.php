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
	 * Whether ULS Compact interlanguage links enabled
	 *
	 * @param User $user
	 * @return bool
	 */
	public static function isCompactLinksEnabled( $user ) {
		global $wgULSEnable, $wgInterwikiMagic,
			$wgULSCompactLinksEnableAnon,
			$wgHideInterlanguageLinks, $wgULSCompactLanguageLinksBetaFeature;

		// Whether any user visible features are enabled
		if ( !$wgULSEnable ) {
			return false;
		}

		if ( $user->isAnon() && $wgULSCompactLinksEnableAnon ) {
			return true;
		}

		if ( $wgULSCompactLanguageLinksBetaFeature === true &&
			$wgInterwikiMagic === true &&
			$wgHideInterlanguageLinks === false &&
			class_exists( 'BetaFeatures' ) &&
			BetaFeatures::isFeatureEnabled( $user, 'uls-compact-links' )
		) {
			// Compact language links is a beta feature in this wiki. Check the user's
			// preference.
			return true;
		}

		if ( $wgULSCompactLanguageLinksBetaFeature === false ) {
			// Compact language links is a default feature in this wiki.
			// Check user preference
			return $user->getBoolOption( 'compact-language-links' );
		}

		return false;
	}

	/**
	 * Sets user preference to enable the Compact language links if the
	 * user account is new.
	 *
	 * To be removed once no longer needed.
	 */
	public static function onLocalUserCreated( User $user, $autoCreate ) {
		if ( RequestContext::getMain()->getConfig()->get( 'ULSCompactLinksForNewAccounts' ) ) {
			$user->setOption( 'compact-language-links', 1 );
			$user->saveSettings();
		}
	}

	/**
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 * Hook: BeforePageDisplay
	 */
	public static function addModules( $out, $skin ) {
		global $wgULSPosition, $wgULSGeoService, $wgULSEventLogging;

		// Load the style for users without JS, to hide the useless links
		$out->addModuleStyles( 'ext.uls.nojs' );

		// If EventLogging integration is enabled, load the schema module
		// and the event logging functions module
		if ( $wgULSEventLogging ) {
			$out->addModules( 'ext.uls.eventlogger' );
		}

		// If the extension is enabled, basic features (API, language data) available.
		$out->addModules( 'ext.uls.init' );

		if ( self::isCompactLinksEnabled( $out->getUser() ) ) {
			$out->addModules( 'ext.uls.compactlinks' );
		}

		if ( $wgULSGeoService ) {
			$out->addModules( 'ext.uls.geoclient' );
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
	public static function addTestModules( array &$testModules, ResourceLoader $resourceLoader ) {
		$testModules['qunit']['ext.uls.tests'] = [
			'scripts' => [ 'tests/qunit/ext.uls.tests.js' ],
			'dependencies' => [ 'jquery.uls', 'ext.uls.init', 'ext.uls.preferences' ],
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'UniversalLanguageSelector',
		];

		return true;
	}

	/**
	 * Add some tabs for navigation for users who do not use Ajax interface.
	 * Hook: PersonalUrls
	 */
	public static function addPersonalBarTrigger( array &$personal_urls, &$title ) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'personal' ) {
			return true;
		}

		$context = RequestContext::getMain();
		if ( !self::isToolbarEnabled( $context->getUser() ) ) {
			return true;
		}

		// The element id will be 'pt-uls'
		$langCode = $context->getLanguage()->getCode();
		$personal_urls = [
			'uls' => [
				'text' => Language::fetchLanguageName( $langCode ),
				'href' => '#',
				'class' => 'uls-trigger autonym',
				'active' => true
			]
		] + $personal_urls;

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
		if ( !$languageToSave && $request->getText( 'uselang' ) ) {
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
			$request->response()->setCookie( 'language', $languageToSave );
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
			$wgExtensionAssetsPath,
			$wgWBClientSettings;

		// Place constant stuff here (not depending on request context)

		if ( $wgULSGeoService === true ) {
			$wgULSGeoService = 'https://freegeoip.net/json/?callback=?';
		}
		if ( $wgULSGeoService ) {
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

		// Cannot check where whether CLL is enabled for a particular user. The overhead
		// of including this data is small.
		if ( isset( $wgWBClientSettings['sortPrepend'] ) ) {
			$vars['wgULSCompactLinksPrepend'] = $wgWBClientSettings['sortPrepend'];
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
		global $wgULSAnonCanChangeLanguage;

		// Place request context dependent stuff here

		// Do not output accept languages if there is risk it will get cached accross requests
		if ( $wgULSAnonCanChangeLanguage || $out->getUser()->isLoggedIn() ) {
			$vars['wgULSAcceptLanguageList'] = array_keys( $out->getRequest()->getAcceptLang() );
		}

		// An optimization to avoid loading all of uls.data just to get the autonym
		$langCode = $out->getLanguage()->getCode();
		$vars['wgULSCurrentAutonym'] = Language::fetchLanguageName( $langCode );

		return true;
	}

	public static function onGetPreferences( $user, &$preferences ) {
		global $wgULSCompactLanguageLinksBetaFeature;

		$preferences['uls-preferences'] = [
			'type' => 'api',
		];

		// A link shown for accessing ULS language settings from preferences screen
		$preferences['languagesettings'] = [
			'type' => 'info',
			'raw' => true,
			'section' => 'personal/i18n',
			'default' => "<a id='uls-preferences-link' href='#'></a>",
			// The above link will have text set from javascript. Just to avoid
			// showing the link when javascript is disabled.
		];

		if ( $wgULSCompactLanguageLinksBetaFeature === false ) {
			$preferences['compact-language-links'] = [
				'type' => 'check',
				'section' => 'rendering/languages',
				'label-message' => 'ext-uls-compact-language-links-preference'
			];
		}

		return true;
	}

	public static function onGetBetaFeaturePreferences( $user, &$prefs ) {
		global $wgExtensionAssetsPath, $wgULSCompactLanguageLinksBetaFeature,
			$wgHideInterlanguageLinks, $wgInterwikiMagic;

		if ( $wgULSCompactLanguageLinksBetaFeature === true &&
			$wgInterwikiMagic === true &&
			$wgHideInterlanguageLinks === false
		) {
			$imagesDir = "$wgExtensionAssetsPath/UniversalLanguageSelector/resources/images";
			$prefs['uls-compact-links'] = [
				'label-message' => 'uls-betafeature-label',
				'desc-message' => 'uls-betafeature-desc',
				'screenshot' => [
					'ltr' => "$imagesDir/compact-links-ltr.png",
					'rtl' => "$imagesDir/compact-links-rtl.png",
				],
				'info-link' =>
					'https://www.mediawiki.org/wiki/Universal_Language_Selector/Compact_Language_Links',
				'discussion-link' =>
					'https://www.mediawiki.org/wiki/Talk:Universal_Language_Selector/Compact_Language_Links',
			];
		}
	}

	/**
	 * Hook: SkinTemplateOutputPageBeforeExec
	 * @param Skin $skin
	 * @param QuickTemplate $template
	 * @return bool
	 */
	public static function onSkinTemplateOutputPageBeforeExec( Skin $skin,
		QuickTemplate $template
	) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'interlanguage' ) {
			return true;
		}

		if ( !self::isToolbarEnabled( $skin->getUser() ) ) {
			return true;
		}

		// A dummy link, just to make sure that the section appears
		$template->data['language_urls'][] = [
			'href' => '#',
			'text' => '',
			'class' => 'uls-p-lang-dummy',
		];

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
	public static function onResourceLoaderRegisterModules( ResourceLoader $resourceLoader ) {
		global $wgResourceModules, $wgULSEventLogging;

		if (
			(
				(
					is_callable( [ $resourceLoader, 'isModuleRegistered' ] ) &&
					!$resourceLoader->isModuleRegistered( 'jquery.i18n' )
				)
				||
				$resourceLoader->getModule( 'jquery.i18n' ) === null
			)
			&&
			!isset( $wgResourceModules[ 'jquery.i18n' ] )
		) {
			$resourceLoader->register( [
				'jquery.i18n' => [
					'scripts' => [
						'lib/jquery.i18n/jquery.i18n.js',
						'lib/jquery.i18n/jquery.i18n.messagestore.js',
						'lib/jquery.i18n/jquery.i18n.parser.js',
						'lib/jquery.i18n/jquery.i18n.emitter.js',
						'lib/jquery.i18n/jquery.i18n.emitter.bidi.js',
						'lib/jquery.i18n/jquery.i18n.language.js',
					],
					'dependencies' => 'mediawiki.libs.pluralruleparser',
					'languageScripts' => [
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
					],
					'targets' => [ 'desktop', 'mobile' ],
					'localBasePath' => __DIR__,
					'remoteExtPath' => 'UniversalLanguageSelector',
				]
			] );
		}

		if ( $wgULSEventLogging ) {
			$resourceLoader->register( [
				'ext.uls.eventlogger' => [
					'scripts' => 'js/ext.uls.eventlogger.js',
					'dependencies' => [
						'mediawiki.user',
						'schema.UniversalLanguageSelector',
					],
					'localBasePath' => __DIR__ . '/resources',
					'remoteExtPath' => 'UniversalLanguageSelector/resources',
				],
			] );
		}

		return true;
	}
}
