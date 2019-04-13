<?php
/**
 * Hooks for UniversalLanguageSelector extension.
 *
 * Copyright (C) 2012-2018 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon
 * Harris, Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland
 * and other contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 * @license MIT
 */

class UniversalLanguageSelectorHooks {

	/**
	 * Used when extension registration in use which skips the main php file
	 */
	public static function setVersionConstant() {
		define( 'ULS_VERSION', '2018-10-26' );
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
			ExtensionRegistry::getInstance()->isLoaded( 'BetaFeatures' ) &&
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
	 * @param User $user
	 * @param bool $autoCreate
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
	 * Hook: BeforePageDisplay
	 */
	public static function addModules( $out, $skin ) {
		global $wgULSPosition, $wgULSGeoService;

		// Soft dependency to Wikibase client. Don't enable CLL if links are managed manually.
		$excludedLinks = $out->getProperty( 'noexternallanglinks' );
		$override = is_array( $excludedLinks ) && in_array( '*', $excludedLinks );
		if ( !$override && self::isCompactLinksEnabled( $out->getUser() ) ) {
			$out->addModules( 'ext.uls.compactlinks' );
		}

		if ( is_string( $wgULSGeoService ) ) {
			$out->addModules( 'ext.uls.geoclient' );
		}

		if ( self::isToolbarEnabled( $out->getUser() ) ) {
			// Enable UI language selection for the user.
			$out->addModules( 'ext.uls.interface' );
		}

		if ( $wgULSPosition === 'personal' ) {
			$out->addModuleStyles( 'ext.uls.pt' );
		} else {
			$out->addModuleStyles( 'ext.uls.interlanguage' );
		}

		if ( $out->getTitle()->isSpecial( 'Preferences' ) ) {
			$out->addModuleStyles( 'ext.uls.preferencespage' );
		}
	}

	/**
	 * @param array &$testModules array of javascript testing modules. 'qunit' is fed
	 * using tests/qunit/QUnitTestResources.php.
	 * @param ResourceLoader $resourceLoader
	 * Hook: ResourceLoaderTestModules
	 */
	public static function addTestModules( array &$testModules, ResourceLoader $resourceLoader ) {
		$testModules['qunit']['ext.uls.tests'] = [
			'scripts' => [ 'tests/qunit/ext.uls.tests.js' ],
			'dependencies' => [ 'jquery.uls', 'ext.uls.init', 'ext.uls.preferences' ],
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'UniversalLanguageSelector',
		];
	}

	/**
	 * Add some tabs for navigation for users who do not use Ajax interface.
	 * Hook: PersonalUrls
	 * @param array &$personal_urls
	 * @param Title &$title
	 * @param SkinTemplate $context SkinTemplate object providing context
	 */
	public static function addPersonalBarTrigger(
		array &$personal_urls,
		&$title,
		SkinTemplate $context
	) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'personal' ) {
			return;
		}

		if ( !self::isToolbarEnabled( $context->getUser() ) ) {
			return;
		}

		// The element id will be 'pt-uls'
		$langCode = $context->getLanguage()->getCode();
		$personal_urls = [
			'uls' => [
				'text' => Language::fetchLanguageName( $langCode ),
				'href' => '#',
				'class' => 'uls-trigger',
				'active' => true
			]
		] + $personal_urls;
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
	 * @param string &$code
	 * @param IContextSource $context
	 */
	public static function getLanguage( User $user, &$code, IContextSource $context ) {
		global $wgULSAnonCanChangeLanguage, $wgULSLanguageDetection;

		if ( $wgULSLanguageDetection ) {
			// Vary any caching based on the header value. Note that
			// we need to vary regardless of whether we end up using
			// the header or not, so that requests without the header
			// don't show up for people with it.
			$context->getOutput()->addVaryHeader( 'Accept-Language' );
		}

		if ( !self::isToolbarEnabled( $user ) ) {
			return;
		}

		$request = $context->getRequest();

		$languageToSave = $request->getText( 'setlang' );
		if ( !$languageToSave && $request->getText( 'uselang' ) ) {
			// uselang can be used for temporary override of language preference
			// when setlang is not provided
			return;
		}

		// Registered users - simple
		if ( !$user->isAnon() ) {
			// Language change
			if ( Language::isSupportedLanguage( $languageToSave ) ) {
				// Apply immediately
				$user->setOption( 'language', $languageToSave );
				$code = $languageToSave;
				// Promise to sync the DB on post-send
				DeferredUpdates::addCallableUpdate( function () use ( $user ) {
					$user->saveSettings();
				} );
			}

			// Otherwise just use what is stored in preferences
			return;
		}

		// If using cookie storage for anons is OK, read/write from that
		if ( $wgULSAnonCanChangeLanguage ) {
			// Language change
			if ( Language::isSupportedLanguage( $languageToSave ) ) {
				$request->response()->setCookie( 'language', $languageToSave );
				$code = $languageToSave;

				return;
			}

			// Try cookie
			$languageToUse = $request->getCookie( 'language', null, '' );
			if ( Language::isSupportedLanguage( $languageToUse ) ) {
				$code = $languageToUse;

				return;
			}
		}

		// As last resort, try Accept-Language headers if allowed
		if ( $wgULSLanguageDetection ) {
			// We added a Vary header at the top of this function,
			// since we're depending upon the Accept-Language header
			$preferred = $request->getAcceptLang();
			$default = self::getDefaultLanguage( $preferred );
			if ( $default !== '' ) {
				$code = $default;
			}
		}
	}

	/**
	 * Hook: ResourceLoaderGetConfigVars
	 * @param array &$vars
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
			$wgInterwikiSortingSortPrepend;

		// Place constant stuff here (not depending on request context)

		if ( is_string( $wgULSGeoService ) ) {
			$vars['wgULSGeoService'] = $wgULSGeoService;
		}

		$vars['wgULSIMEEnabled'] = $wgULSIMEEnabled;
		$vars['wgULSWebfontsEnabled'] = $wgULSWebfontsEnabled;
		$vars['wgULSPosition'] = $wgULSPosition;
		$vars['wgULSAnonCanChangeLanguage'] = $wgULSAnonCanChangeLanguage;
		$vars['wgULSEventLogging'] = $wgULSEventLogging
			&& ExtensionRegistry::getInstance()->isLoaded( 'EventLogging' );
		$vars['wgULSImeSelectors'] = $wgULSImeSelectors;
		$vars['wgULSNoImeSelectors'] = $wgULSNoImeSelectors;
		$vars['wgULSNoWebfontsSelectors'] = $wgULSNoWebfontsSelectors;

		if ( is_string( $wgULSFontRepositoryBasePath ) ) {
			$vars['wgULSFontRepositoryBasePath'] = $wgULSFontRepositoryBasePath;
		} else {
			$vars['wgULSFontRepositoryBasePath'] = $wgExtensionAssetsPath .
				'/UniversalLanguageSelector/data/fontrepo/fonts/';
		}

		if ( isset( $wgInterwikiSortingSortPrepend ) && $wgInterwikiSortingSortPrepend !== [] ) {
			$vars['wgULSCompactLinksPrepend'] = $wgInterwikiSortingSortPrepend;
		}
	}

	/**
	 * Hook: MakeGlobalVariablesScript
	 * @param array &$vars
	 * @param OutputPage $out
	 */
	public static function addVariables( &$vars, OutputPage $out ) {
		global $wgULSAnonCanChangeLanguage;

		// Place request context dependent stuff here

		$user = $out->getUser();
		$loggedIn = $user->isLoggedIn();

		// Do not output accept languages if there is risk it will get cached across requests
		if ( $wgULSAnonCanChangeLanguage || $loggedIn ) {
			$vars['wgULSAcceptLanguageList'] = array_keys( $out->getRequest()->getAcceptLang() );
		}

		if ( $loggedIn && class_exists( Babel::class ) ) {
			$userLanguageInfo = Babel::getCachedUserLanguageInfo( $user );

			// This relies on the fact that Babel levels are 'N' and
			// the digits 0 to 5 as strings, and that in reverse
			// ASCII order they will be 'N', '5', '4', '3', '2', '1', '0'.
			arsort( $userLanguageInfo );

			$vars['wgULSBabelLanguages'] = array_keys( $userLanguageInfo );
		}

		// An optimization to avoid loading all of uls.data just to get the autonym
		$langCode = $out->getLanguage()->getCode();
		$vars['wgULSCurrentAutonym'] = Language::fetchLanguageName( $langCode );
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
			// We use this class to hide this from no-JS users
			'cssclass' => 'uls-preferences-link-wrapper',
			'default' => "<a id='uls-preferences-link' role='button' tabindex='0'>" .
				wfMessage( 'ext-uls-language-settings-preferences-link' )->escaped() . "</a>",
		];

		if ( $wgULSCompactLanguageLinksBetaFeature === false ) {
			$preferences['compact-language-links'] = [
				'type' => 'check',
				'section' => 'rendering/languages',
				'label-message' => [
					'ext-uls-compact-language-links-preference',
					'mediawikiwiki:Special:MyLanguage/Universal_Language_Selector/Compact_Language_Links'
				]
			];
		}
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
					'ltr' => "$imagesDir/compact-links-ltr.svg",
					'rtl' => "$imagesDir/compact-links-rtl.svg",
				],
				'info-link' =>
					'https://www.mediawiki.org/wiki/Special:MyLanguage/' .
					'Universal_Language_Selector/Compact_Language_Links',
				'discussion-link' =>
					'https://www.mediawiki.org/wiki/Talk:Universal_Language_Selector/Compact_Language_Links',
			];
		}
	}

	/**
	 * Hook: SkinTemplateOutputPageBeforeExec
	 * @param Skin $skin
	 * @param QuickTemplate $template
	 */
	public static function onSkinTemplateOutputPageBeforeExec( Skin $skin,
		QuickTemplate $template
	) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'interlanguage' ) {
			return;
		}

		if ( !self::isToolbarEnabled( $skin->getUser() ) ) {
			return;
		}

		// Set to an empty array, just to make sure that the section appears
		if ( $template->get( 'language_urls' ) === false ) {
			$template->set( 'language_urls', [] );
		}
	}

	/**
	 * Add basic webfonts support to the mobile interface (via MobileFrontend extension)
	 * Hook: EnterMobileMode
	 * @param MobileContext $context
	 */
	public static function onEnterMobileMode( $context ) {
		global $wgULSEnable, $wgULSMobileWebfontsEnabled;

		// Currently only supported in mobile Beta mode
		if ( $wgULSEnable && $wgULSMobileWebfontsEnabled && $context->isBetaGroupMember() ) {
			$context->getOutput()->addModules( 'ext.uls.webfonts.mobile' );
		}
	}

	/**
	 * Conditionally register modules.
	 *
	 * @param ResourceLoader $resourceLoader
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader $resourceLoader ) {
		global $wgVersion;

		$modules = [];
		$modules['ext.uls.displaysettings'] = [
			'scripts' => 'js/ext.uls.displaysettings.js',
			'styles' => 'css/ext.uls.displaysettings.less',
			'dependencies' => [
				'ext.uls.languagesettings',
				'ext.uls.mediawiki',
				'ext.uls.webfonts',
				'mediawiki.api',
				'mediawiki.ui.checkbox',
				'mediawiki.ui.button',
				'mediawiki.user'
			],
			'localBasePath' => __DIR__ . '/../resources',
			'remoteExtPath' => 'UniversalLanguageSelector/resources'
		];
		$modules['ext.uls.preferences'] = [
			'scripts' => 'js/ext.uls.preferences.js',
			'dependencies' => [
				'mediawiki.user',
				'mediawiki.api'
			],
			'localBasePath' => __DIR__ . '/../resources',
			'remoteExtPath' => 'UniversalLanguageSelector/resources'
		];
		if ( version_compare( $wgVersion, '1.32', '<' ) ) {
			// Support: MediaWiki 1.31 and earlier (T200168)
			$modules['ext.uls.displaysettings']['dependencies'][] = 'mediawiki.api.parse';
			$modules['ext.uls.preferences']['dependencies'][] = 'mediawiki.api.options';
		}

		$resourceLoader->register( $modules );
	}
}
