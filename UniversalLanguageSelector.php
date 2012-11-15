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
	echo( "This file is an extension to the MediaWiki software and cannot be used standalone.\n" );
	die( -1 );
}
/**
 * Version number used in extension credits and in other placed where needed.
 */
define( 'ULS_VERSION', '2012-08-30' );

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
 * This is what Wikipedia does.
 *
 * The service should return jsonp that uses the supplied callback parameter.
 */
$wgULSGeoService = 'http://freegeoip.net/json/';

/**
 * IME system of ULS can be disabled by setting this value false;
 */
$wgULSIMEEnabled = true;

/**
 * Try to use preferred interface language for anonymous users.
 * Do not use if you are caching anonymous page views without
 * taking Accept-Language into account.
 */
$wgULSLanguageDetection = true;

/**
 * Enable language selection. If language selection is disabled, the classes
 * and RL modules are registered for the use of other extensions, but no
 * language selection toolbar is shown, and it will not be possible to change 
 * the interface language using a cookie.
 */
$wgULSEnable = true;

$dir = __DIR__;

// Internationalization
$wgExtensionMessagesFiles['UniversalLanguageSelector'] = "$dir/UniversalLanguageSelector.i18n.php";

// Register auto load for the page class
$wgAutoloadClasses['UniversalLanguageSelectorHooks'] = "$dir/UniversalLanguageSelector.hooks.php";
$wgAutoloadClasses['ApiLanguageSearch'] = "$dir/api/ApiLanguageSearch.php";
$wgAutoloadClasses['LanguageNameSearch'] = "$dir/data/LanguageNameSearch.php";

$wgHooks['BeforePageDisplay'][] = 'UniversalLanguageSelectorHooks::addModules';
$wgHooks['PersonalUrls'][] = 'UniversalLanguageSelectorHooks::addTrigger';
$wgHooks['ResourceLoaderTestModules'][] = 'UniversalLanguageSelectorHooks::addTestModules';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'UniversalLanguageSelectorHooks::addConfig';
$wgHooks['MakeGlobalVariablesScript'][] = 'UniversalLanguageSelectorHooks::addVariables';
$wgAPIModules['languagesearch'] = 'ApiLanguageSearch';
$wgHooks['UserGetLanguageObject'][] = 'UniversalLanguageSelectorHooks::getLanguage';

$wgResourceModules['ext.uls.init'] = array(
	'scripts' => 'resources/js/ext.uls.init.js',
	'styles' => 'resources/css/ext.uls.css',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'mediawiki.Uri',
		'jquery.tipsy',
		'jquery.uls',
		'jquery.i18n',
		'ext.uls.displaysettings',
		'ext.uls.inputsettings',
	),
	'position' => 'top',
);

$wgResourceModules['ext.uls.geoclient'] = array(
	'scripts' => 'resources/js/ext.uls.geoclient.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['ext.uls.preferences'] = array(
	'scripts' => 'resources/js/ext.uls.preferences.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'mediawiki.user',
		'mediawiki.api',
		'jquery.jStorage',
	),
);

$wgResourceModules['ext.uls.languagesettings'] = array(
	'scripts' => 'resources/js/ext.uls.languagesettings.js',
	'styles' => 'resources/css/ext.uls.languagesettings.css',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'ext.uls.preferences',
	),
);

$wgResourceModules['ext.uls.webfonts'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'jquery.webfonts',
		'ext.uls.webfonts.repository',
		'ext.uls.preferences',
	),
);
$wgResourceModules['ext.uls.ime'] = array(
		'scripts' => 'resources/js/ext.uls.ime.js',
		'localBasePath' => $dir,
		'remoteExtPath' => 'UniversalLanguageSelector',
		'dependencies' => array(
			'jquery.ime',
			'ext.uls.preferences',
		),
);


$wgResourceModules['ext.uls.displaysettings'] = array(
	'scripts' => 'resources/js/ext.uls.displaysettings.js',
	'styles' => 'resources/css/ext.uls.displaysettings.css',
	'localBasePath' => $dir,
	'dependencies' => array(
		'ext.uls.languagesettings',
		'ext.uls.webfonts',
		'jquery.i18n',
	),
	'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['ext.uls.inputsettings'] = array(
		'scripts' => 'resources/js/ext.uls.inputsettings.js',
		'styles' => 'resources/css/ext.uls.inputsettings.css',
		'localBasePath' => $dir,
		'dependencies' => array(
			'ext.uls.languagesettings',
			'ext.uls.ime',
			'jquery.i18n',
		),
		'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['jquery.uls'] = array(
	'scripts' => array(
		'lib/jquery.uls/jquery.uls.js',
	),
	'styles' => array(
		'lib/jquery.uls/css/jquery.uls.css',
	),
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'jquery.i18n',
	),
	'position' => 'top',
);

$wgResourceModules['jquery.webfonts'] = array(
	'scripts' => 'lib/jquery.webfonts.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['ext.uls.webfonts.repository'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.repository.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['jquery.i18n'] = array(
		'scripts' => 'lib/jquery.i18n.js',
		'localBasePath' => $dir,
		'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['jquery.ime'] = array(
		'scripts' => 'lib/jquery.ime/jquery.ime.js',
		'styles' => array(
			'lib/jquery.ime/css/jquery.ime.css',
		),
		'localBasePath' => $dir,
		'remoteExtPath' => 'UniversalLanguageSelector',
);
