<?php
/**
 * Initialisation file for MediaWiki extension UniversalLanguageSelector.
 *
 * Copyright (C) 2012-2014 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon
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
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'UniversalLanguageSelector' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['UniversalLanguageSelector'] = __DIR__ . '/i18n';
	/* wfWarn(
		'Deprecated PHP entry point used for UniversalLanguageSelector extension. Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	); */
	return;
}

if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This file is an extension to the MediaWiki software and cannot be used standalone.\n";
	die( -1 );
}
/**
 * Version number used in extension credits and in other placed where needed.
 */
define( 'ULS_VERSION', '2015-08-28' );

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'UniversalLanguageSelector',
	'version' => ULS_VERSION,
	'author' => array(
		'Alolita Sharma',
		'Amir Aharoni',
		'Arun Ganesh',
		'Brandon Harris',
		'Niklas Laxström',
		'Pau Giner',
		'Santhosh Thottingal',
		'Siebrand Mazeland'
	),
	'url' => 'https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector',
	'descriptionmsg' => 'uls-desc',
);

/**
 * ULS can use geolocation services to suggest languages based on the
 * country the user is vising from. Setting this to false will prevent
 * builtin geolocation from being used. You can provide your own geolocation
 * by setting window.Geo to object which has key 'country_code' or 'country'.
 * If set to true, it will query Wikimedia's geoip service.
 *
 * The service should return jsonp that uses the supplied callback parameter.
 */
$wgULSGeoService = true;

/**
 * Enable language selection, input methods and webfonts for everyone, unless
 * the behavior is overridden by the configuration variables below.
 *
 * Even if false the classes and resource loader modules are registered for the
 * use of other extensions. Language changing via cookie or setlang query
 * parameter is not possible.
 */
$wgULSEnable = true;

/**
 * Equivalent to $wgULSEnable for anonymous users only.
 *
 * Does not have any effect if $wgULSEnable is false.
 */
$wgULSEnableAnon = true;

/**
 * Allow anonymous users to change language with cookie and setlang
 * query parameter.
 *
 * Do not use if you are caching anonymous page views without
 * taking cookies into account.
 *
 * Does not have any effect if either of $wgULSEnable or
 * $wgULSEnableAnon is set to false.
 *
 * @since 2013.04
 */
$wgULSAnonCanChangeLanguage = true;

/**
 * Try to use preferred interface language for anonymous users.
 *
 * Do not use if you are caching anonymous page views without
 * taking Accept-Language into account.
 *
 * Does not have any effect if any of $wgULSEnable, $wgULSEnableAnon
 * or $wgULSAnonCanChangeLanguage is set to false.
 */
$wgULSLanguageDetection = true;

/**
 * Enable the input methods feature for all users by default.
 * Can be controlled by the user.
 */
$wgULSIMEEnabled = true;

/**
 * Enable the webfonts feature for all users by default.
 * Can be controlled by the user.
 * @since 2014.02
 */
$wgULSWebfontsEnabled = true;

/**
 * Set whether webfont support is loaded within the mobile interface (via the
 * MobileFrontend extension).
 */
$wgULSMobileWebfontsEnabled = false;

/**
 * The location and the form of the language selection trigger.
 * The possible values are:
 * 'personal': as a link near the username or the log in link in
 * the personal toolbar (default).
 * 'interlanguage': as an icon near the header of the list of interlanguage
 * links in the sidebar.
 *
 * @since 2013.04
 */
$wgULSPosition = 'personal';

/**
 * Whether to use EventLogging. The EventLogging extension must be installed
 * if this option is enabled.
 * @since 2013.06
 */
$wgULSEventLogging = false;

/**
 * Array of jQuery selectors of elements on which IME should be enabled.
 *
 * @since 2013.11
 */
$wgULSImeSelectors = array(
	'input:not([type])',
	'input[type=text]',
	'input[type=search]',
	'textarea',
	'[contenteditable]',
);

/**
 * Array of jQuery selectors of elements on which IME must not be enabled.
 *
 * @since 2013.07
 */
$wgULSNoImeSelectors = array( '#wpCaptchaWord', '.ve-ce-surface *' );

/**
 * Array of jQuery selectors of elements on which webfonts must not be applied.
 * By default exclude elements with .autonym because that style set font as
 * Autonym
 * @since 2013.09
 */
$wgULSNoWebfontsSelectors = array( '#p-lang li.interlanguage-link > a' );

/**
 * Base path of ULS font repository.
 * If not set, will be set to 'UniversalLanguageSelector/data/fontrepo/fonts/',
 * relative to $wgExtensionAssetsPath.
 * @since 2013.10
 */
$wgULSFontRepositoryBasePath = false;

/**
 * Whether the "Compact language links" Beta Feature is exposed. Requires
 * $wgULSPosition to be 'interlanguage'.
 *
 * Defaults to false.
 *
 * @since 2014.03
 */
$wgULSCompactLinks = false;

// Internationalization
$wgMessagesDirs['UniversalLanguageSelector'] = __DIR__ . '/i18n';

// Register auto load for the page class
$wgAutoloadClasses += array(
	'UniversalLanguageSelectorHooks' => __DIR__ . '/UniversalLanguageSelector.hooks.php',
	'ResourceLoaderULSModule' => __DIR__ . '/includes/ResourceLoaderULSModule.php',
	'ResourceLoaderULSJsonMessageModule' =>
		__DIR__ . '/includes/ResourceLoaderULSJsonMessageModule.php',
	'ApiLanguageSearch' => __DIR__ . '/api/ApiLanguageSearch.php',
	'ApiULSLocalization' => __DIR__ . '/api/ApiULSLocalization.php',
	'ULSJsonMessageLoader' => __DIR__ . '/includes/ULSJsonMessageLoader.php',
	'LanguageNameSearch' => __DIR__ . '/data/LanguageNameSearch.php',
);

$wgHooks['BeforePageDisplay'][] = 'UniversalLanguageSelectorHooks::addModules';
$wgHooks['EventLoggingRegisterSchemas'][] =
	'UniversalLanguageSelectorHooks::onEventLoggingRegisterSchemas';
$wgHooks['PersonalUrls'][] = 'UniversalLanguageSelectorHooks::addPersonalBarTrigger';
$wgHooks['ResourceLoaderRegisterModules'][] =
	'UniversalLanguageSelectorHooks::onResourceLoaderRegisterModules';
$wgHooks['ResourceLoaderTestModules'][] =
	'UniversalLanguageSelectorHooks::addTestModules';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'UniversalLanguageSelectorHooks::addConfig';
$wgHooks['MakeGlobalVariablesScript'][] = 'UniversalLanguageSelectorHooks::addVariables';
$wgAPIModules['languagesearch'] = 'ApiLanguageSearch';
$wgAPIModules['ulslocalization'] = 'ApiULSLocalization';
$wgHooks['UserGetLanguageObject'][] = 'UniversalLanguageSelectorHooks::getLanguage';
$wgHooks['SkinTemplateOutputPageBeforeExec'][] =
	'UniversalLanguageSelectorHooks::onSkinTemplateOutputPageBeforeExec';
$wgHooks['EnterMobileMode'][] = 'UniversalLanguageSelectorHooks::onEnterMobileMode';

$wgDefaultUserOptions['uls-preferences'] = '';
$wgHooks['GetPreferences'][] = 'UniversalLanguageSelectorHooks::onGetPreferences';
$wgHooks['GetBetaFeaturePreferences'][] =
	'UniversalLanguageSelectorHooks::onGetBetaFeaturePreferences';

require __DIR__ . '/Resources.php';
