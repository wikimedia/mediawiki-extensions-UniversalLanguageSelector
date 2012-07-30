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
define( 'ULS_VERSION', '2012-07-20' );

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'UniversalLanguageSelector',
	'version' => '0.1',
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

$dir = __DIR__ ;

// Internationalization
$wgExtensionMessagesFiles['UniversalLanguageSelector'] = "$dir/UniversalLanguageSelector.i18n.php";

// Register auto load for the page class
$wgAutoloadClasses['UniversalLanguageSelectorHooks'] = "$dir/UniversalLanguageSelector.hooks.php";
$wgAutoloadClasses['ApiLanguageSearch'] = "$dir/api/ApiLanguageSearch.php";
$wgAutoloadClasses['LanguageNameSearch'] = "$dir/data/LanguageNameSearch.php";

$wgHooks['BeforePageDisplay'][] = 'UniversalLanguageSelectorHooks::addModules';
$wgHooks['PersonalUrls'][] = 'UniversalLanguageSelectorHooks::addTrigger';
$wgHooks['SkinAfterContent'][] = 'UniversalLanguageSelectorHooks::addTemplate';
$wgHooks['ResourceLoaderTestModules'][] = 'UniversalLanguageSelectorHooks::addTestModules';
$wgAPIModules['languagesearch'] = 'ApiLanguageSearch';
$wgHooks['UserGetLanguageObject'][] = 'UniversalLanguageSelectorHooks::getLanguage';

$wgResourceModules['ext.uls.init'] = array(
	'scripts' => 'resources/ext.uls.init.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'mediawiki.Uri',
		'ext.uls.core',
	),
	'position' => 'top',
);

$wgResourceModules['ext.uls.data'] = array(
	'scripts' => 'data/ext.uls.data.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
);

$wgResourceModules['ext.uls.lcd'] = array(
	'scripts' => 'resources/ext.uls.lcd.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'styles' => 'resources/css/ext.uls.lcd.css',
);

$wgResourceModules['ext.uls.core'] = array(
	'scripts' => array(
		'resources/ext.uls.core.js',
		'resources/ext.uls.languagefilter.js',
		'resources/ext.uls.data.utils.js',
	),
	'styles' => array(
		'resources/css/ext.uls.css',
		'resources/css/ext.uls.grid.css',
	),
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'ext.uls.data',
		'ext.uls.lcd',
	),
	'position' => 'top',
);
