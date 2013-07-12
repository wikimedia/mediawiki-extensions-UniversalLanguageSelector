<?php
/**
 * JavaScript and CSS resource definitions.
 *
 * @file
 * @license GPL2+
 */

$resourcePaths = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'UniversalLanguageSelector'
);

$wgResourceModules['ext.uls.languagenames'] = array(
	'class' => 'ResourceLoaderULSModule'
);

$wgResourceModules['ext.uls.displaysettings'] = array(
	'scripts' => 'resources/js/ext.uls.displaysettings.js',
	'styles' => 'resources/css/ext.uls.displaysettings.css',
	'dependencies' => array(
		'ext.uls.languagesettings',
		'ext.uls.webfonts',
		'jquery.i18n',
		'mediawiki.api.parse',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.geoclient'] = array(
	'scripts' => 'resources/js/ext.uls.geoclient.js',
) + $resourcePaths;

$wgResourceModules['ext.uls.ime'] = array(
	'scripts' => 'resources/js/ext.uls.ime.js',
	'dependencies' => array(
		'jquery.ime',
		'ext.uls.init',
		'ext.uls.preferences',
	),
) + $resourcePaths;

// Styles for users who disabled JavaScript
$wgResourceModules['ext.uls.nojs'] = array(
	'styles' => 'resources/css/ext.uls.nojs.css',
	'position' => 'top',
) + $resourcePaths;

// Base ULS module
$wgResourceModules['ext.uls.init'] = array(
	'scripts' => 'resources/js/ext.uls.init.js',
	'styles' => 'resources/css/ext.uls.css',
	'skinStyles' => array(
		'monobook' => 'resources/css/ext.uls-monobook.css',
	),
	'dependencies' => array(
		'ext.uls.languagenames',
		'mediawiki.Uri',
		'mediawiki.util',
		'jquery.json',
		'jquery.uls',
		'ext.uls.i18n',
	),
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['ext.uls.i18n'] = array(
	'scripts' => 'resources/js/ext.uls.i18n.js',
	'dependencies' => 'jquery.i18n',
) + $resourcePaths;

$wgResourceModules['ext.uls.inputsettings'] = array(
	'scripts' => 'resources/js/ext.uls.inputsettings.js',
	'styles' => 'resources/css/ext.uls.inputsettings.css',
	'dependencies' => array(
		'ext.uls.languagesettings',
		'ext.uls.ime',
		'jquery.i18n',
	),
	'messages' => array(
		'uls-ime-helppage',
	),
) + $resourcePaths;

// Interface language selection module
$wgResourceModules['ext.uls.interface'] = array(
	'scripts' => 'resources/js/ext.uls.interface.js',
	'dependencies' => array(
		'ext.uls.init',
		'jquery.tipsy',
		'ext.uls.displaysettings',
		'ext.uls.inputsettings',
	),
	'messages' => array(
		'uls-plang-title-languages',
	),
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['ext.uls.languagesettings'] = array(
	'scripts' => 'resources/js/ext.uls.languagesettings.js',
	'styles' => 'resources/css/ext.uls.languagesettings.css',
	'dependencies' => 'ext.uls.preferences',
) + $resourcePaths;

$wgResourceModules['ext.uls.preferences'] = array(
	'scripts' => 'resources/js/ext.uls.preferences.js',
	'dependencies' => array(
		'mediawiki.user',
		'mediawiki.api',
		'jquery.jStorage',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.webfonts'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.js',
	'dependencies' => array(
		'jquery.webfonts',
		'ext.uls.init',
		'ext.uls.webfonts.repository',
		'ext.uls.preferences',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.webfonts.repository'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.repository.js',
) + $resourcePaths;

$wgResourceModules['jquery.i18n'] = array(
	'scripts' => array(
		'lib/jquery.i18n/jquery.i18n.js',
		'lib/jquery.i18n/jquery.i18n.parser.js',
		'lib/jquery.i18n/jquery.i18n.emitter.js',
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
) + $resourcePaths;

$wgResourceModules['jquery.ime'] = array(
	'scripts' => 'lib/jquery.ime/jquery.ime.js',
	'styles' => 'lib/jquery.ime/css/jquery.ime.css',
) + $resourcePaths;

$wgResourceModules['jquery.uls'] = array(
	'scripts' => array(
		'lib/jquery.uls/src/jquery.uls.core.js',
		'lib/jquery.uls/src/jquery.uls.lcd.js',
		'lib/jquery.uls/src/jquery.uls.languagefilter.js',
		'lib/jquery.uls/src/jquery.uls.regionfilter.js',
	),
	'styles' => array(
		'lib/jquery.uls/css/jquery.uls.css',
		'lib/jquery.uls/css/jquery.uls.lcd.css',
	),
	'dependencies' => array(
		'jquery.i18n',
		'jquery.uls.grid',
		'jquery.uls.data',
	),
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['jquery.uls.compact'] = array(
	'styles' => 'lib/jquery.uls/css/jquery.uls.compact.css',
	'dependencies' => 'jquery.uls',
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['jquery.uls.data'] = array(
	'scripts' => array(
		'lib/jquery.uls/src/jquery.uls.data.js',
		'lib/jquery.uls/src/jquery.uls.data.utils.js',
	),
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['jquery.uls.grid'] = array(
	'styles' => 'lib/jquery.uls/css/jquery.uls.grid.css',
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['jquery.webfonts'] = array(
	'scripts' => 'lib/jquery.webfonts.js',
) + $resourcePaths;
