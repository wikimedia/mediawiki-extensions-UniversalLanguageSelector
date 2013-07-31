<?php
/**
 * Initialisation file for MediaWiki extension UniversalLanguageSelector.
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

if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This file is an extension to the MediaWiki software and cannot be used standalone.\n";
	die( -1 );
}
/**
 * Version number used in extension credits and in other placed where needed.
 */
define( 'ULS_VERSION', '2013-06-17' );

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'UniversalLanguageSelector',
	'version' => '[https://www.mediawiki.org/wiki/MLEB MLEB 2013.07]',
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
 * query param.

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
 * Disable the input methods feature for all users by default. Can still
 * be enabled manually by the user.
 */
$wgULSIMEEnabled = true;

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
 * Array of jQuery selectors of elements on which IME must not be enabled.
 *
 * @since 2013.07
 */
$wgULSNoImeSelectors = array( '#wpCaptchaWord' );

$dir = __DIR__;

// Internationalization
$wgExtensionMessagesFiles['UniversalLanguageSelector'] = "$dir/UniversalLanguageSelector.i18n.php";

// Register auto load for the page class
$wgAutoloadClasses['UniversalLanguageSelectorHooks'] = "$dir/UniversalLanguageSelector.hooks.php";
$wgAutoloadClasses['ResourceLoaderULSModule'] = "$dir/ResourceLoaderULSModule.php";
$wgAutoloadClasses['ApiLanguageSearch'] = "$dir/api/ApiLanguageSearch.php";
$wgAutoloadClasses['ApiULSLocalization'] = "$dir/api/ApiULSLocalization.php";
$wgAutoloadClasses['LanguageNameSearch'] = "$dir/data/LanguageNameSearch.php";

$wgHooks['BeforePageDisplay'][] = 'UniversalLanguageSelectorHooks::addModules';
$wgHooks['PersonalUrls'][] = 'UniversalLanguageSelectorHooks::addPersonalBarTrigger';
$wgHooks['ResourceLoaderTestModules'][] = 'UniversalLanguageSelectorHooks::addTestModules';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'UniversalLanguageSelectorHooks::addConfig';
$wgHooks['MakeGlobalVariablesScript'][] = 'UniversalLanguageSelectorHooks::addVariables';
$wgAPIModules['languagesearch'] = 'ApiLanguageSearch';
$wgAPIModules['ulslocalization'] = 'ApiULSLocalization';
$wgHooks['UserGetLanguageObject'][] = 'UniversalLanguageSelectorHooks::getLanguage';
$wgHooks['SkinTemplateOutputPageBeforeExec'][] =
	'UniversalLanguageSelectorHooks::onSkinTemplateOutputPageBeforeExec';


$wgDefaultUserOptions['uls-preferences'] = '';
$wgHooks['GetPreferences'][] = 'UniversalLanguageSelectorHooks::onGetPreferences';

$wgExtensionFunctions[] = function() {
	global $wgHooks, $wgResourceModules, $wgULSEventLogging, $wgULSGeoService;

	if ( $wgULSGeoService === true ) {
		$wgHooks['BeforePageDisplay'][] = function( &$out ) {
			/** @var OutputPage $out */
			$out->addScript( '<script src="//bits.wikimedia.org/geoiplookup"></script>' );
			return true;
		};
	}

	// If EventLogging integration is enabled, first ensure that the
	// EventLogging extension is present, then declare schema module.
	// If it is not present, emit a warning and disable logging.
	if ( $wgULSEventLogging ) {
		if ( class_exists( 'ResourceLoaderSchemaModule' ) ) {
			/// @see https://meta.wikimedia.org/wiki/Schema:UniversalLanguageSelector
			$wgResourceModules['schema.UniversalLanguageSelector'] = array(
				'class'  => 'ResourceLoaderSchemaModule',
				'schema' => 'UniversalLanguageSelector',
				'revision' => 5573536,
			);
		} else {
			wfWarn( 'UniversalLanguageSelector is configured to use EventLogging, but '
					. 'the extension is is not available. Disabling wgULSEventLogging.' );
			$wgULSEventLogging = false;
		}
	}

	return true;
};

require "$dir/Resources.php";
