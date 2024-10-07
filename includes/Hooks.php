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

use ExtensionRegistry;
use IBufferingStatsdDataFactory;
use IContextSource;
use LanguageCode;
use MediaWiki\Babel\Babel;
use MediaWiki\Config\Config;
use MediaWiki\Extension\BetaFeatures\BetaFeatures;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Hook\UserGetLanguageObjectHook;
use MediaWiki\Html\Html;
use MediaWiki\Languages\LanguageNameUtils;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\OutputPage;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use MediaWiki\Skins\Hook\SkinAfterPortletHook;
use MediaWiki\User\User;
use MediaWiki\User\UserOptionsLookup;
use RequestContext;
use Skin;
use SkinTemplate;

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
	 * Checks whether language is in header.
	 *
	 * @param Skin $skin
	 * @return bool
	 */
	private function isLanguageInHeader( Skin $skin ): bool {
		$languageInHeaderConfig = $skin->getConfig()->get( 'VectorLanguageInHeader' );
		$userStatus = $skin->getUser()->isAnon() ? 'logged_out' : 'logged_in';
		return $languageInHeaderConfig[ $userStatus ] ?? true;
	}

	/**
	 * Whether ULS Compact interlanguage links enabled
	 *
	 * @param User $user
	 * @param Skin $skin
	 * @return bool
	 */
	private function isCompactLinksEnabled( User $user, Skin $skin ) {
		// Whether any user visible features are enabled
		if ( !$this->config->get( 'ULSEnable' ) ) {
			return false;
		}
		// Compact links should be disabled in Vector 2022 skin,
		// when the language button is displayed at the top of the content
		if ( $skin->getSkinName() === 'vector-2022' ) {
			return !$this->isLanguageInHeader( $skin );
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
	 * Adds Codex styles in a way that is compatible with MLEB.
	 *
	 * @param OutputPage $out
	 */
	private function loadCodexStyles( OutputPage $out ) {
		// Only needed for skins that do not load Codex.
		if ( !in_array( $out->getSkin()->getSkinName(), [ 'minerva', 'vector-2022' ] ) ) {
			$out->addModuleStyles( 'codex-search-styles' );
		}
	}

	/**
	 * @param OutputPage $out
	 * @param Skin $skin
	 * Hook: BeforePageDisplay
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$unsupportedSkins = [ 'minerva', 'apioutput' ];
		if ( in_array( $skin->getSkinName(), $unsupportedSkins, true ) ) {
			return;
		}
		// Soft dependency to Wikibase client. Don't enable CLL if links are managed manually.
		$excludedLinks = $out->getProperty( 'noexternallanglinks' );
		$override = is_array( $excludedLinks ) && in_array( '*', $excludedLinks, true );
		$isCompactLinksEnabled = $this->isCompactLinksEnabled( $out->getUser(), $skin );
		$isVector2022LanguageInHeader = $skin->getSkinName() === 'vector-2022' && $this->isLanguageInHeader( $skin );
		$config = [
			'wgULSPosition' => $this->config->get( 'ULSPosition' ),
			'wgULSisCompactLinksEnabled' => $isCompactLinksEnabled,
			'wgVector2022LanguageInHeader' => $isVector2022LanguageInHeader
		];

		if ( !$override && $isCompactLinksEnabled ) {
			$out->addModules( 'ext.uls.compactlinks' );
			// Add styles for the default button in the page.
			$this->loadCodexStyles( $out );
		}

		if ( is_string( $this->config->get( 'ULSGeoService' ) ) ) {
			$out->addModules( 'ext.uls.geoclient' );
		}

		if ( $this->isEnabled() ) {
			// Enable UI language selection for the user.
			$out->addModules( 'ext.uls.interface' );
			$this->loadCodexStyles( $out );

			$title = $out->getTitle();
			$isMissingPage = !$title || !$title->exists();
			// if current page doesn't exist or if it's a talk page, we should use a different layout inside ULS
			// according to T316559. Add JS config variable here, to let frontend know, when this is the case
			$config[ 'wgULSisLanguageSelectorEmpty' ] = $isMissingPage || $title->isTalkPage();
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
		$mwLangCode = $context->getLanguage()->getCode();

		return [
			'uls' => [
				'text' => $this->languageNameUtils->getLanguageName( $mwLangCode ),
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
	 * @param float[] $preferred Mapping of
	 *  'Preferred languages by lowercased BCP 47 language codes' => 'weight'
	 * @return string MediaWiki internal language code or empty string if there's no matched
	 *  language code
	 */
	protected function getDefaultLanguage( array $preferred ) {
		/** @var array supported List of Supported languages by MediaWiki internal language codes */
		$supported = $this->languageNameUtils
			->getLanguageNames( LanguageNameUtils::AUTONYMS, LanguageNameUtils::SUPPORTED );

		// Convert BCP 47 language code to MediaWiki internal language code and
		// look for a MediaWiki internal language code that is acceptable to the client
		// and known to the wiki.
		foreach ( $preferred as $bcp47LangCode => $weight ) {
			$mwLangCode = LanguageCode::bcp47ToInternal( $bcp47LangCode );
			if ( isset( $supported[$mwLangCode] ) ) {
				return $mwLangCode;
			}
		}

		// Some browsers might:
		// - Sent codes like 'zh-hant-tw':
		//   FIXME: Try 'zh-tw', 'zh-hant', 'zh' respectively
		// - Only send codes like 'de-de':
		//   Try with bare code 'de'
		foreach ( $preferred as $bcp47LangCode => $weight ) {
			$parts = explode( '-', $bcp47LangCode, 2 );
			$mwLangCode = $parts[0];
			if ( isset( $supported[$mwLangCode] ) ) {
				return $mwLangCode;
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

		$setLangCode = $this->getSetLang( $out );
		if ( $setLangCode ) {
			$vars['wgULSCurrentLangCode'] = $out->getLanguage()->getCode();
			$vars['wgULSSetLangCode'] = $setLangCode;
			$vars['wgULSSetLangName'] = $this->languageNameUtils->getLanguageName( $setLangCode );
		}
	}

	/**
	 * @param User $user User whose preferences are being modified
	 * @param array &$preferences Preferences description array, to be fed to an HTMLForm object
	 * @return bool|void True or no return value to continue or false to abort
	 */
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

	/**
	 * @param User $user
	 * @param array[] &$prefs
	 */
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

		// The ULS settings cog is only needed on projects which show the ULS button in the sidebar
		// e.g. it is shown in the personal menu
		if ( $this->config->get( 'ULSPosition' ) !== 'interlanguage' ) {
			return;
		}

		$hasLanguages = $skin->getLanguages() !== [];
		// For Vector 2022, the ULS settings cog is not needed for projects
		// where a dedicated language button in the header ($wgVectorLanguageInHeader is true).
		if ( $skin->getSkinName() === 'vector-2022' ) {
			$languageInHeaderConfig = $skin->getConfig()->get( 'VectorLanguageInHeader' );
			$languageInHeader = $languageInHeaderConfig[
				$skin->getUser()->isAnon() ? 'logged_out' : 'logged_in' ] ?? true;
			if ( $hasLanguages && $languageInHeader ) {
				return;
			}
		}

		if ( !$this->isEnabled() ) {
			return;
		}

		// An empty span will force the language portal to always display in
		// the skins that support it! e.g. Vector. (T275147)
		if ( !$hasLanguages ) {
			// If no languages force it on.
			$content .= Html::element(
				'span',
				[ 'class' => 'uls-after-portlet-link', ],
				''
			);
		}
	}

	/**
	 * @param OutputPage $out
	 * @return string|null
	 */
	private function getSetLang( OutputPage $out ): ?string {
		$setLangCode = $out->getRequest()->getRawVal( 'setlang' );
		if ( $setLangCode && $this->languageNameUtils->isSupportedLanguage( $setLangCode ) ) {
			return $setLangCode;
		}

		return null;
	}

	/**
	 * @param Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getModuleData( Context $context, Config $config ): array {
		$languageNameUtils = MediaWikiServices::getInstance()->getLanguageNameUtils();
		return [
			'currentAutonym' => $languageNameUtils->getLanguageName( $context->getLanguage() ),
		];
	}

	/**
	 * @param Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getModuleDataSummary( Context $context, Config $config ): array {
		return [
			'currentAutonym' => $context->getLanguage(),
		];
	}

}
