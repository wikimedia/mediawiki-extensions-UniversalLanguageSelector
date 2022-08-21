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

namespace UniversalLanguageSelector;

use Config;
use ExtensionRegistry;
use Html;
use IBufferingStatsdDataFactory;
use IContextSource;
use MediaWiki\Babel\Babel;
use MediaWiki\Extension\BetaFeatures\BetaFeatures;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Hook\UserGetLanguageObjectHook;
use MediaWiki\Languages\LanguageNameUtils;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use MediaWiki\Skins\Hook\SkinAfterPortletHook;
use MediaWiki\User\UserOptionsLookup;
use MobileContext;
use OutputPage;
use RequestContext;
use Skin;
use SkinTemplate;
use User;

/**
 * @phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName
 */
class Hooks implements
	BeforePageDisplayHook,
	UserGetLanguageObjectHook,
	ResourceLoaderGetConfigVarsHook,
	MakeGlobalVariablesScriptHook,
	GetPreferencesHook,
	SkinAfterPortletHook
{

	/** @var Config */
	private $config;

	/** @var UserOptionsLookup */
	private $userOptionsLookup;

	/** @var IBufferingStatsdDataFactory */
	private $statsdDataFactory;

	/** @var LanguageNameUtils */
	private $languageNameUtils;

	/**
	 * @param Config $config
	 * @param UserOptionsLookup $userOptionsLookup
	 * @param IBufferingStatsdDataFactory $statsdDataFactory
	 * @param LanguageNameUtils $languageNameUtils
	 */
	public function __construct(
		Config $config,
		UserOptionsLookup $userOptionsLookup,
		IBufferingStatsdDataFactory $statsdDataFactory,
		LanguageNameUtils $languageNameUtils
	) {
		$this->config = $config;
		$this->userOptionsLookup = $userOptionsLookup;
		$this->statsdDataFactory = $statsdDataFactory;
		$this->languageNameUtils = $languageNameUtils;
	}

	public static function setVersionConstant() {
		define( 'ULS_VERSION', '2020-07-20' );
	}

	/**
	 * Whether user visible ULS features are enabled (language changing, input methods, web
	 * fonts, language change undo tooltip).
	 * @return bool
	 */
	private function isEnabled(): bool {
		return (bool)$this->config->get( 'ULSEnable' );
	}

	/**
	 * Whether ULS Compact interlanguage links enabled
	 *
	 * @param User $user
	 * @return bool
	 */
	private function isCompactLinksEnabled( User $user ) {
		// Whether any user visible features are enabled
		if ( !$this->config->get( 'ULSEnable' ) ) {
			return false;
		}

		if ( $this->config->get( 'ULSCompactLanguageLinksBetaFeature' ) === true &&
			$this->config->get( 'InterwikiMagic' ) === true &&
			$this->config->get( 'HideInterlanguageLinks' ) === false &&
			ExtensionRegistry::getInstance()->isLoaded( 'BetaFeatures' ) &&
			BetaFeatures::isFeatureEnabled( $user, 'uls-compact-links' )
		) {
			// Compact language links is a beta feature in this wiki. Check the user's
			// preference.
			return true;
		}

		if ( $this->config->get( 'ULSCompactLanguageLinksBetaFeature' ) === false ) {
			// Compact language links is a default feature in this wiki.
			// Check user preference
			return $this->userOptionsLookup
				->getBoolOption( $user, 'compact-language-links' );
		}

		return false;
	}

	/**
	 * @param OutputPage $out
	 * @param Skin $skin
	 * Hook: BeforePageDisplay
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$unsupportedSkins = [ 'minerva', 'apioutput' ];
		if ( in_array( $skin->getSkinName(), $unsupportedSkins ) ) {
			return;
		}
		// Soft dependency to Wikibase client. Don't enable CLL if links are managed manually.
		$excludedLinks = $out->getProperty( 'noexternallanglinks' );
		$override = is_array( $excludedLinks ) && in_array( '*', $excludedLinks );
		$isCompactLinksEnabled = $this->isCompactLinksEnabled( $out->getUser() );
		$config = [
			'wgULSPosition' => $this->config->get( 'ULSPosition' ),
			'wgULSisCompactLinksEnabled' => $isCompactLinksEnabled,
		];

		// Load compact links if no mw-interlanguage-selector element is present in the page HTML.
		// We use the same mechanism as Skin::getDefaultModules and check the HTML for the presence in the HTML,
		// using the class as the heuristic.
		// Note if the element is rendered by the skin, its assumed that no collapsing is needed.
		// See T264824 for more information.
		if ( !$override && $isCompactLinksEnabled &&
			strpos( $out->getHTML(), 'mw-interlanguage-selector' ) === false
		) {
			$out->addModules( 'ext.uls.compactlinks' );
		}

		if ( is_string( $this->config->get( 'ULSGeoService' ) ) ) {
			$out->addModules( 'ext.uls.geoclient' );
		}

		if ( $this->isEnabled() ) {
			// Enable UI language selection for the user.
			$out->addModules( 'ext.uls.interface' );
		}

		// This is added here, and not in onResourceLoaderGetConfigVars to allow skins and extensions
		// to vary it. For example, ContentTranslation special pages depend on being able to change it.
		$out->addJsConfigVars( $config );

		if ( $this->config->get( 'ULSPosition' ) === 'personal' ) {
			$out->addModuleStyles( 'ext.uls.pt' );
		} else {
			$out->addModuleStyles( 'ext.uls.interlanguage' );
		}

		if ( $out->getTitle()->isSpecial( 'Preferences' ) ) {
			$out->addModuleStyles( 'ext.uls.preferencespage' );
		}

		$this->handleSetLang( $out );
	}

	/**
	 * Handle setlang query parameter; and decide if the setlang related scripts
	 * have to be loaded.
	 * @param OutputPage $out
	 * @return void
	 */
	protected function handleSetLang( OutputPage $out ): void {
		$languageToSet = $this->getSetLang( $out );

		if ( !$languageToSet ) {
			return;
		}

		$this->statsdDataFactory->increment( 'uls.setlang_used' );

		$user = $out->getUser();
		if ( !$user->isRegistered() && !$out->getConfig()->get( 'ULSAnonCanChangeLanguage' ) ) {
			// User is anon, and cannot change language, return.
			return;
		}

		$out->addModules( 'ext.uls.setlang' );
	}

	/**
	 * @param SkinTemplate $skin
	 * @param array &$links
	 */
	public function onSkinTemplateNavigation__Universal( SkinTemplate $skin, array &$links ) {
		// In modern skins which separate out the user menu,
		// e.g. Vector. (T282196)
		// this should appear in the `user-interface-preferences` menu.
		// For older skins not separating out the user menu this will be prepended.
		if ( isset( $links['user-interface-preferences'] ) ) {
			$links['user-interface-preferences'] = $this->addPersonalBarTrigger(
				$links['user-interface-preferences'],
				$skin
			);
		}
	}

	/**
	 * Add some tabs for navigation for users who do not use Ajax interface.
	 * @param array &$personal_urls
	 * @param SkinTemplate $context SkinTemplate object providing context
	 * @return array of modified personal urls
	 */
	private function addPersonalBarTrigger(
		array &$personal_urls,
		SkinTemplate $context
	) {
		if ( $this->config->get( 'ULSPosition' ) !== 'personal' ) {
			return $personal_urls;
		}

		if ( !$this->isEnabled() ) {
			return $personal_urls;
		}

		// The element id will be 'pt-uls'
		$langCode = $context->getLanguage()->getCode();

		return [
			'uls' => [
				'text' => $this->languageNameUtils->getLanguageName( $langCode ),
				'href' => '#',
				// Skin meta data to allow skin (e.g. Vector) to add icons
				'icon' => 'wikimedia-language',
				// Skin meta data to allow skin (e.g. Vector) to convert to button.
				'button' => true,
				'link-class' => [ 'uls-trigger' ],
				'active' => true
			]
		] + $personal_urls;
	}

	/**
	 * @param float[] $preferred
	 * @return string
	 */
	protected function getDefaultLanguage( array $preferred ) {
		$supported = $this->languageNameUtils->getLanguageNames( LanguageNameUtils::AUTONYMS, 'mwfile' );

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
	public function onUserGetLanguageObject( $user, &$code, $context ) {
		if ( $this->config->get( 'ULSLanguageDetection' ) ) {
			// Vary any caching based on the header value. Note that
			// we need to vary regardless of whether we end up using
			// the header or not, so that requests without the header
			// don't show up for people with it.
			$context->getOutput()->addVaryHeader( 'Accept-Language' );
		}

		if ( !$this->isEnabled() ) {
			return;
		}

		$request = $context->getRequest();

		if (
			// uselang can be used for temporary override of language preference
			$request->getRawVal( 'uselang' ) ||
			// Registered user: use preferences, only when safe to load - T267445
			( $user->isSafeToLoad() && $user->isRegistered() )
		) {
			return;
		}

		// If using cookie storage for anons is OK, read from that
		if ( $this->config->get( 'ULSAnonCanChangeLanguage' ) ) {
			// Try to set the language based on the cookie
			$languageToUse = $request->getCookie( 'language', null, '' );
			if ( $this->languageNameUtils->isSupportedLanguage( $languageToUse ) ) {
				$code = $languageToUse;

				return;
			}
		}

		// As last resort, try Accept-Language headers if allowed
		if ( $this->config->get( 'ULSLanguageDetection' ) ) {
			// We added a Vary header at the top of this function,
			// since we're depending upon the Accept-Language header
			$preferred = $request->getAcceptLang();
			$default = $this->getDefaultLanguage( $preferred );
			if ( $default !== '' ) {
				$code = $default;
			}
		}
	}

	/**
	 * Hook: ResourceLoaderGetConfigVars
	 * @param array &$vars
	 * @param string $skin
	 * @param Config $config
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		$extRegistry = ExtensionRegistry::getInstance();
		$skinConfig = $extRegistry->getAttribute( 'UniversalLanguageSelectorSkinConfig' )[ $skin ] ?? [];
		// Place constant stuff here (not depending on request context)

		if ( is_string( $config->get( 'ULSGeoService' ) ) ) {
			$vars['wgULSGeoService'] = $config->get( 'ULSGeoService' );
		}

		$vars['wgULSIMEEnabled'] = $config->get( 'ULSIMEEnabled' );
		$vars['wgULSWebfontsEnabled'] = $config->get( 'ULSWebfontsEnabled' );
		$vars['wgULSAnonCanChangeLanguage'] = $config->get( 'ULSAnonCanChangeLanguage' );
		$vars['wgULSImeSelectors'] = $config->get( 'ULSImeSelectors' );
		$vars['wgULSNoImeSelectors'] = $config->get( 'ULSNoImeSelectors' );
		$vars['wgULSNoWebfontsSelectors'] = $config->get( 'ULSNoWebfontsSelectors' );
		$vars['wgULSDisplaySettingsInInterlanguage'] = $skinConfig['ULSDisplaySettingsInInterlanguage'] ?? false;

		if ( is_string( $config->get( 'ULSFontRepositoryBasePath' ) ) ) {
			$vars['wgULSFontRepositoryBasePath'] = $config->get( 'ULSFontRepositoryBasePath' );
		} else {
			$vars['wgULSFontRepositoryBasePath'] = $config->get( 'ExtensionAssetsPath' ) .
				'/UniversalLanguageSelector/data/fontrepo/fonts/';
		}

		if ( $config->has( 'InterwikiSortingSortPrepend' ) &&
			$config->get( 'InterwikiSortingSortPrepend' ) !== []
		) {
			$vars['wgULSCompactLinksPrepend'] = $config->get( 'InterwikiSortingSortPrepend' );
		}
	}

	/**
	 * Hook: MakeGlobalVariablesScript
	 * @param array &$vars
	 * @param OutputPage $out
	 */
	public function onMakeGlobalVariablesScript( &$vars, $out ): void {
		// Place request context dependent stuff here
		$user = $out->getUser();
		$loggedIn = $user->isRegistered();

		// Do not output accept languages if there is risk it will get cached across requests
		if ( $out->getConfig()->get( 'ULSAnonCanChangeLanguage' ) || $loggedIn ) {
			$vars['wgULSAcceptLanguageList'] = array_keys( $out->getRequest()->getAcceptLang() );
		}

		if ( $loggedIn && ExtensionRegistry::getInstance()->isLoaded( 'Babel' ) ) {
			$userLanguageInfo = Babel::getCachedUserLanguageInfo( $user );

			// This relies on the fact that Babel levels are 'N' and
			// the digits 0 to 5 as strings, and that in reverse
			// ASCII order they will be 'N', '5', '4', '3', '2', '1', '0'.
			arsort( $userLanguageInfo );

			$vars['wgULSBabelLanguages'] = array_keys( $userLanguageInfo );
		}

		// An optimization to avoid loading all of uls.data just to get the autonym
		$langCode = $out->getLanguage()->getCode();
		$vars['wgULSCurrentAutonym'] = $this->languageNameUtils->getLanguageName( $langCode );

		$setLangCode = $this->getSetLang( $out );
		if ( $setLangCode ) {
			$vars['wgULSCurrentLangCode'] = $langCode;
			$vars['wgULSSetLangCode'] = $setLangCode;
			$vars['wgULSSetLangName'] = $this->languageNameUtils->getLanguageName( $setLangCode );
		}
	}

	public function onGetPreferences( $user, &$preferences ) {
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
			'default' => "<a id='uls-preferences-link' class='uls-settings-trigger' role='button' tabindex='0'>" .
				wfMessage( 'ext-uls-language-settings-preferences-link' )->escaped() . "</a>",
		];

		if ( $this->config->get( 'ULSCompactLanguageLinksBetaFeature' ) === false ) {
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

	public function onGetBetaFeaturePreferences( $user, array &$prefs ) {
		if ( $this->config->get( 'ULSCompactLanguageLinksBetaFeature' ) === true &&
			$this->config->get( 'InterwikiMagic' ) === true &&
			$this->config->get( 'HideInterlanguageLinks' ) === false
		) {
			$extensionAssetsPath = $this->config->get( 'ExtensionAssetsPath' );
			$imagesDir = "$extensionAssetsPath/UniversalLanguageSelector/resources/images";
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
	 * @param Skin $skin
	 * @param string $name
	 * @param string &$content
	 */
	public function onSkinAfterPortlet( $skin, $name, &$content ) {
		if ( $name !== 'lang' ) {
			return;
		}

		// @todo: document what this block is for.
		if ( $skin->getSkinName() !== 'vector-2022' && $this->config->get( 'ULSPosition' ) !== 'interlanguage' ) {
			return;
		}

		if ( !$this->isEnabled() ) {
			return;
		}

		// An empty span will force the language portal to always display in
		// the skins that support it! e.g. Vector. (T275147)
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
	public function onEnterMobileMode( MobileContext $context ) {
		// Currently only supported in mobile Beta mode
		if ( $this->config->get( 'ULSEnable' ) &&
			$this->config->get( 'ULSMobileWebfontsEnabled' ) &&
			$context->isBetaGroupMember()
		) {
			$context->getOutput()->addModules( 'ext.uls.webfonts.mobile' );
		}
	}

	private function getSetLang( OutputPage $out ): ?string {
		$setLangCode = $out->getRequest()->getRawVal( 'setlang' );
		if ( $setLangCode && $this->languageNameUtils->isSupportedLanguage( $setLangCode ) ) {
			return $setLangCode;
		}

		return null;
	}
}
