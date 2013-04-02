<?php
/**
 * JavaScript and CSS resource definitions.
 *
 * @file
 * @license GPL2+
 */

/* Base ULS module */
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

$wgResourceModules['ext.uls.geoclient'] = array(
	'scripts' => 'resources/js/ext.uls.geoclient.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
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

// Base ULS module
$wgResourceModules['ext.uls.init'] = array(
	'scripts' => 'resources/js/ext.uls.init.js',
	'styles' => 'resources/css/ext.uls.css',
	'skinStyles' => array(
		'monobook' => 'resources/css/ext.uls-monobook.css',
	),
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'mediawiki.Uri',
		'mediawiki.util',
		'jquery.json',
		'jquery.uls',
		'jquery.i18n',
	),
	'position' => 'top',
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

// Interface language selection module
$wgResourceModules['ext.uls.interface'] = array(
	'scripts' => 'resources/js/ext.uls.interface.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'ext.uls.init',
		'jquery.tipsy',
		'ext.uls.displaysettings',
		'ext.uls.inputsettings',
		'ext.uls.geoclient',
	),
	'position' => 'top',
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
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'jquery.i18n',
		'jquery.uls.grid',
		'jquery.uls.data',
	),
	'position' => 'top',
);

$wgResourceModules['jquery.uls.compact'] = array(
	'styles' => array(
		'lib/jquery.uls/css/jquery.uls.compact.css',
	),
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'dependencies' => array(
		'jquery.uls',
	),
	'position' => 'top',
);

$wgResourceModules['jquery.uls.data'] = array(
	'scripts' => array(
		'lib/jquery.uls/src/jquery.uls.data.js',
		'lib/jquery.uls/src/jquery.uls.data.utils.js',
	),
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'position' => 'top',
);

$wgResourceModules['jquery.uls.grid'] = array(
	'styles' => array(
		'lib/jquery.uls/css/jquery.uls.grid.css',
	),
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
	'position' => 'top',
);

$wgResourceModules['jquery.webfonts'] = array(
	'scripts' => 'lib/jquery.webfonts.js',
	'localBasePath' => $dir,
	'remoteExtPath' => 'UniversalLanguageSelector',
);
