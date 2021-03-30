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

use MediaWiki\MediaWikiServices;

class UniversalLanguageSelectorHooks {

	/**
	 * Used when extension registration in use which skips the main php file
	 */
	public static function setVersionConstant() {
		global $wgHooks;
		define( 'ULS_VERSION', '2020-07-20' );
		// The SkinAfterPortlet hook was introduced in version >= 1.35.
		// It is the same as BaseTemplateAfterPortlet with the exception of its parameters.
		if ( interface_exists( MediaWiki\Skins\Hook\SkinAfterPortletHook::class ) ) {
			$wgHooks['SkinAfterPortlet'][] = "UniversalLanguageSelectorHooks::onSkinAfterPortlet";
		} else {
			$wgHooks['BaseTemplateAfterPortlet'][] = "UniversalLanguageSelectorHooks::onBaseTemplateAfterPortlet";
		}
	}

	/**
	 * Whether ULS user toolbar (language selection and settings) is enabled.
	 *
	 * @param User $user
	 * @return bool
	 */
	private static function isToolbarEnabled( User $user ) {
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
	private static function isCompactLinksEnabled( User $user ) {
		global $wgULSEnable, $wgInterwikiMagic,
			$wgHideInterlanguageLinks, $wgULSCompactLanguageLinksBetaFeature;

		// Whether any user visible features are enabled
		if ( !$wgULSEnable ) {
			return false;
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
			$services = MediaWikiServices::getInstance();
			if ( method_exists( $services, 'getUserOptionsLookup' ) ) {
				// MW 1.35 +
				return $services->getUserOptionsLookup()
					->getBoolOption( $user, 'compact-language-links' );
			} else {
				return $user->getBoolOption( 'compact-language-links' );
			}
		}

		return false;
	}

	/**
	 * @param OutputPage $out
	 * @param Skin $skin
	 * Hook: BeforePageDisplay
	 */
	public static function addModules( OutputPage $out, Skin $skin ) {
		global $wgULSPosition, $wgULSGeoService;
		$unsupportedSkins = [ 'minerva' ];
		if ( in_array( $skin->getSkinName(), $unsupportedSkins ) ) {
			return;
		}
		// Soft dependency to Wikibase client. Don't enable CLL if links are managed manually.
		$excludedLinks = $out->getProperty( 'noexternallanglinks' );
		$override = is_array( $excludedLinks ) && in_array( '*', $excludedLinks );
		$config = [
			'wgULSPosition' => $wgULSPosition,
		];

		// Load compact links if no mw-interlanguage-selector element is present in the page HTML.
		// We use the same mechanism as Skin::getDefaultModules and check the HTML for the presence in the HTML,
		// using the class as the heuristic.
		// Note if the element is rendered by the skin, its assumed that no collapsing is needed.
		// See T264824 for more information.
		if ( !$override && self::isCompactLinksEnabled( $out->getUser() ) &&
			strpos( $out->getHTML(), 'mw-interlanguage-selector' ) === false
		) {
			$out->addModules( 'ext.uls.compactlinks' );
		}

		if ( is_string( $wgULSGeoService ) ) {
			$out->addModules( 'ext.uls.geoclient' );
		}

		if ( self::isToolbarEnabled( $out->getUser() ) ) {
			// Enable UI language selection for the user.
			$out->addModules( 'ext.uls.interface' );
		}

		// This is added here, and not in addConfig to allow skins and extensions to vary it
		// For example, ContentTranslation special pages depend on being able to change it.
		$out->addJsConfigVars( $config );

		if ( $wgULSPosition === 'personal' ) {
			$out->addModuleStyles( 'ext.uls.pt' );
		} else {
			$out->addModuleStyles( 'ext.uls.interlanguage' );
		}

		if ( $out->getTitle()->isSpecial( 'Preferences' ) ) {
			$out->addModuleStyles( 'ext.uls.preferencespage' );
		}

		self::handleSetLang( $out );
	}

	/**
	 * Handle setlang query parameter; and decide if the setlang related scripts
	 * have to be loaded.
	 * @param OutputPage $out
	 * @return void
	 */
	protected static function handleSetLang( OutputPage $out ): void {
		$languageToSet = self::getSetLang( $out );

		if ( !$languageToSet ) {
			return;
		}

		MediaWikiServices::getInstance()->getStatsdDataFactory()
				->increment( 'uls.setlang_used' );

		$user = $out->getUser();
		if ( $user->isAnon() && !$out->getConfig()->get( 'ULSAnonCanChangeLanguage' ) ) {
			// User is anon, and cannot change language, return.
			return;
		}

		$out->addModules( 'ext.uls.setlang' );
	}

	/**
	 * @param ResourceLoader $resourceLoader
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader $resourceLoader ) {
		global $wgVersion;

		// Support: MediaWiki 1.34
		$hasOldNotify = version_compare( $wgVersion, '1.35', '<' );

		$tpl = [
			'localBasePath' => dirname( __DIR__ ) . '/resources',
			'remoteExtPath' => 'UniversalLanguageSelector/resources',
		];

		$modules = [
			"ext.uls.ime" => $tpl + [
				"scripts" => "js/ext.uls.ime.js",
				"dependencies" => array_merge( [
					"ext.uls.common",
					"ext.uls.preferences",
					"ext.uls.mediawiki",
					"ext.uls.messages",
					"jquery.ime",
				], $hasOldNotify ? [ 'mediawiki.notify' ] : [] ),
				"messages" => [
					"uls-ime-helppage"
				],
			],
			"ext.uls.setlang" => $tpl + [
				"styles" => [
					"css/ext.uls.dialog.less",
					"css/ext.uls.setlang.less"
				],
				"scripts" => [
					"js/ext.uls.dialog.js",
					"js/ext.uls.setlang.js"
				],
				"dependencies" => array_merge( [
					"mediawiki.api",
					"mediawiki.ui.button",
					"mediawiki.Uri"
				], $hasOldNotify ? [ 'mediawiki.notify' ] : [] ),
				"messages" => [
					"ext-uls-setlang-error",
					"ext-uls-setlang-unknown-error",
					"ext-uls-setlang-heading",
					"ext-uls-setlang-message",
					"ext-uls-setlang-accept",
					"ext-uls-setlang-cancel",
					"ext-uls-setlang-loading"
				],
			],
		];

		$resourceLoader->register( $modules );
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

		if (
			// uselang can be used for temporary override of language preference
			$request->getText( 'uselang' ) ||
			// Registered user: use preferences
			!$user->isAnon()
		) {
			return;
		}

		// If using cookie storage for anons is OK, read from that
		if ( $wgULSAnonCanChangeLanguage ) {
			// Try to set the language based on the cookie
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
	 * @param string $skin
	 */
	public static function addConfig( array &$vars, $skin ) {
		global $wgULSGeoService,
			$wgULSIMEEnabled, $wgULSWebfontsEnabled,
			$wgULSNoWebfontsSelectors,
			$wgULSAnonCanChangeLanguage,
			$wgULSImeSelectors, $wgULSNoImeSelectors,
			$wgULSFontRepositoryBasePath,
			$wgExtensionAssetsPath,
			$wgInterwikiSortingSortPrepend;

		$extRegistry = ExtensionRegistry::getInstance();
		$skinConfig = $extRegistry->getAttribute( 'UniversalLanguageSelectorSkinConfig' )[ $skin ] ?? [];
		// Place constant stuff here (not depending on request context)

		if ( is_string( $wgULSGeoService ) ) {
			$vars['wgULSGeoService'] = $wgULSGeoService;
		}

		$vars['wgULSIMEEnabled'] = $wgULSIMEEnabled;
		$vars['wgULSWebfontsEnabled'] = $wgULSWebfontsEnabled;
		$vars['wgULSAnonCanChangeLanguage'] = $wgULSAnonCanChangeLanguage;
		$vars['wgULSImeSelectors'] = $wgULSImeSelectors;
		$vars['wgULSNoImeSelectors'] = $wgULSNoImeSelectors;
		$vars['wgULSNoWebfontsSelectors'] = $wgULSNoWebfontsSelectors;
		$vars['wgULSDisplaySettingsInInterlanguage'] = $skinConfig['ULSDisplaySettingsInInterlanguage'] ?? false;

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
	public static function addVariables( array &$vars, OutputPage $out ) {
		// Place request context dependent stuff here
		$user = $out->getUser();
		$loggedIn = $user->isRegistered();

		// Do not output accept languages if there is risk it will get cached across requests
		if ( $out->getConfig()->get( 'ULSAnonCanChangeLanguage' ) || $loggedIn ) {
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

		$setLangCode = self::getSetLang( $out );
		if ( $setLangCode ) {
			$vars['wgULSCurrentLangCode'] = $langCode;
			$vars['wgULSSetLangCode'] = $setLangCode;
			$vars['wgULSSetLangName'] = Language::fetchLanguageName( $setLangCode );
		}
	}

	public static function onGetPreferences( $user, array &$preferences ) {
		global $wgULSCompactLanguageLinksBetaFeature;

		// T259037: Does not work well on Minerva
		$skin = RequestContext::getMain()->getSkin();
		if ( $skin->getSkinName() === 'minerva' ) {
			return;
		}

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

	public static function onGetBetaFeaturePreferences( $user, array &$prefs ) {
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
	 * Kept for backward compatability with MW < 1.35, and older versions of skins
	 * such as Vector and Timeless
	 * @param QuickTemplate $template
	 * @param string $name
	 * @param string &$content
	 */
	public static function onBaseTemplateAfterPortlet(
		QuickTemplate $template,
		string $name,
		string &$content
	) {
		global $wgULSPosition;

		if ( $wgULSPosition !== 'interlanguage' ) {
			return;
		}

		if ( !self::isToolbarEnabled( $template->getSkin()->getUser() ) ) {
			return;
		}

		// Set to an empty array, just to make sure that the section appears
		if ( $template->get( 'language_urls' ) === false ) {
			$template->set( 'language_urls', [] );
		}
	}

	/**
	 * @param Skin $skin
	 * @param string $name
	 * @param string &$content
	 */
	public static function onSkinAfterPortlet(
		Skin $skin,
		string $name,
		string &$content
	) {
		global $wgULSPosition;

		if ( $name !== 'lang' ) {
			return;
		}

		if ( $wgULSPosition !== 'interlanguage' ) {
			return;
		}

		if ( !self::isToolbarEnabled( $skin->getUser() ) ) {
			return;
		}

		// An empty span will force the language portal to always display in
		// the skins that support it! e.g. Vector.
		if ( count( $skin->getLanguages() ) === 0 ) {
			// If no languages force it on.
			$content .= Html::element(
				'span',
				[
					'class' => 'uls-after-portlet-link',
				],
				''
			);
		}
	}

	/**
	 * Add basic webfonts support to the mobile interface (via MobileFrontend extension)
	 * Hook: EnterMobileMode
	 * @param MobileContext $context
	 */
	public static function onEnterMobileMode( MobileContext $context ) {
		global $wgULSEnable, $wgULSMobileWebfontsEnabled;

		// Currently only supported in mobile Beta mode
		if ( $wgULSEnable && $wgULSMobileWebfontsEnabled && $context->isBetaGroupMember() ) {
			$context->getOutput()->addModules( 'ext.uls.webfonts.mobile' );
		}
	}

	private static function getSetLang( OutputPage $out ): ?string {
		$setLangCode = $out->getRequest()->getText( 'setlang' );
		if ( $setLangCode && Language::isSupportedLanguage( $setLangCode ) ) {
			return $setLangCode;
		}

		return null;
	}
}
