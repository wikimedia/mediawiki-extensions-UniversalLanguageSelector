<?php
/**
 * JavaScript and CSS resource definitions.
 *
 * @file
 * @license GPL-2.0+
 */

$resourcePaths = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'UniversalLanguageSelector'
);

global $wgResourceModules;
$wgResourceModules['ext.uls.languagenames'] = array(
	'class' => 'ResourceLoaderULSModule'
);

$wgResourceModules['ext.uls.messages'] = array(
	'class' => 'ResourceLoaderULSJsonMessageModule',
	'dependencies' => 'ext.uls.i18n',
);

$wgResourceModules['ext.uls.buttons'] = array(
	'styles' => 'resources/css/ext.uls.buttons.css',
) + $resourcePaths;

$wgResourceModules['ext.uls.displaysettings'] = array(
	'scripts' => 'resources/js/ext.uls.displaysettings.js',
	'styles' => 'resources/css/ext.uls.displaysettings.css',
	'dependencies' => array(
		// Common dependencies come from languagesettings
		'ext.uls.languagesettings',
		'ext.uls.mediawiki',
		'ext.uls.webfonts',
		'mediawiki.api.parse',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.geoclient'] = array(
	'scripts' => 'resources/js/ext.uls.geoclient.js',
) + $resourcePaths;

$wgResourceModules['ext.uls.ime'] = array(
	'scripts' => 'resources/js/ext.uls.ime.js',
	'dependencies' => array(
		'ext.uls.init',
		'ext.uls.preferences',
		'ext.uls.mediawiki',
		'ext.uls.messages',
		'jquery.ime',
		'mediawiki.notify',
	),
	'messages' => array(
		'uls-ime-helppage',
	),
) + $resourcePaths;

// Styles for users who disabled JavaScript
$wgResourceModules['ext.uls.nojs'] = array(
	'styles' => 'resources/css/ext.uls.nojs.css',
	'position' => 'top',
) + $resourcePaths;

// Initialization of MW ULS functionality
$wgResourceModules['ext.uls.init'] = array(
	'scripts' => 'resources/js/ext.uls.init.js',
	'styles' => 'resources/css/ext.uls.css',
	'skinStyles' => array(
		'monobook' => 'resources/css/ext.uls-monobook.css',
	),
	'dependencies' => array(
		'mediawiki.api',
		'mediawiki.cookie',
		'jquery.client',
		'jquery.cookie',
	),
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['ext.uls.eventlogger'] = array(
	'scripts' => 'resources/js/ext.uls.eventlogger.js',
	'dependencies' => array(
		'mediawiki.user',
		'schema.UniversalLanguageSelector',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.i18n'] = array(
	'scripts' => 'resources/js/ext.uls.i18n.js',
	'dependencies' => array(
		'jquery.i18n',
		'mediawiki.util',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.inputsettings'] = array(
	'scripts' => 'resources/js/ext.uls.inputsettings.js',
	'styles' => 'resources/css/ext.uls.inputsettings.css',
	'dependencies' => array(
		'ext.uls.ime',
		// Common dependencies come from languagesettings
		'ext.uls.languagesettings',
		'ext.uls.mediawiki',
		'jquery.ime',
	),
) + $resourcePaths;

// Interface language selection module
$wgResourceModules['ext.uls.interface'] = array(
	'scripts' => 'resources/js/ext.uls.interface.js',
	'dependencies' => array(
		'ext.uls.init',
		'jquery.tipsy',
		'mediawiki.jqueryMsg',
		'mediawiki.user',
		// We cannot delay the loading of the basic webfonts library
		// because it is required immediately after page load
		'ext.uls.webfonts',
	),
	'messages' => array(
		'uls-plang-title-languages',
		'ext-uls-select-language-settings-icon-tooltip',
		'ext-uls-undo-language-tooltip-text',
		'ext-uls-language-settings-preferences-link',
	),
	'position' => 'top',
) + $resourcePaths;

$wgResourceModules['ext.uls.languagesettings'] = array(
	'scripts' => 'resources/js/ext.uls.languagesettings.js',
	'styles' => 'resources/css/ext.uls.languagesettings.css',
	'dependencies' => array(
		'ext.uls.buttons',
		'ext.uls.messages',
		'ext.uls.preferences',
		// The grid styles are used here,
		// but ULS itself is lazy-loaded
		'jquery.uls.grid',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.preferences'] = array(
	'scripts' => 'resources/js/ext.uls.preferences.js',
	'dependencies' => array(
		'mediawiki.user',
		'mediawiki.api',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.compactlinks'] = array(
	'scripts' => 'resources/js/ext.uls.compactlinks.js',
	'styles' => 'resources/css/ext.uls.compactlinks.css',
	'dependencies' => array(
		'ext.uls.mediawiki',
		'ext.uls.init',
		'jquery.uls.compact',
		'mediawiki.language',
		'mediawiki.ui.button',
	),
	'messages' => array(
		'ext-uls-compact-link-count',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.webfonts'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.js',
	'dependencies' => array(
		'ext.uls.init',
		'ext.uls.preferences',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.webfonts.fonts'] = array(
	'dependencies' => array(
		'jquery.webfonts',
		'jquery.uls.data',
		'ext.uls.webfonts.repository',
	),
) + $resourcePaths;

$wgResourceModules['ext.uls.webfonts.repository'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.repository.js',
	'targets' => array( 'desktop', 'mobile' ),
) + $resourcePaths;

$wgResourceModules['ext.uls.webfonts.mobile'] = array(
	'scripts' => 'resources/js/ext.uls.webfonts.mobile.js',
	'targets' => array( 'mobile' ),
	'dependencies' => array(
		'jquery.webfonts',
		'ext.uls.webfonts.repository',
	),
) + $resourcePaths;

$wgResourceModules['jquery.ime'] = array(
	'scripts' => 'lib/jquery.ime/jquery.ime.js',
	'styles' => 'lib/jquery.ime/css/jquery.ime.css',
) + $resourcePaths;

// This module sets default options for the language selector that are
// suitable for MediaWiki and loads necessary dependencies like grid,
// messages and jquery.uls itself.
$wgResourceModules['ext.uls.mediawiki'] = array(
	'scripts' => 'resources/js/ext.uls.mediawiki.js',
	'dependencies' => array(
		'ext.uls.init',
		'ext.uls.languagenames',
		'ext.uls.messages',
		'jquery.uls',
		'jquery.uls.grid',
		'mediawiki.util',
	),
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
		'jquery.uls.data',
		'jquery.uls.grid',
	),
) + $resourcePaths;

$wgResourceModules['jquery.uls.compact'] = array(
	'styles' => 'lib/jquery.uls/css/jquery.uls.compact.css',
	'dependencies' => 'jquery.uls',
) + $resourcePaths;

$wgResourceModules['jquery.uls.data'] = array(
	'scripts' => array(
		'lib/jquery.uls/src/jquery.uls.data.js',
		'lib/jquery.uls/src/jquery.uls.data.utils.js',
	),
	'targets' => array( 'desktop', 'mobile' ),
) + $resourcePaths;

$wgResourceModules['jquery.uls.grid'] = array(
	'position' => 'top',
	'styles' => 'lib/jquery.uls/css/jquery.uls.grid.css',
) + $resourcePaths;

$wgResourceModules['jquery.webfonts'] = array(
	'scripts' => 'lib/jquery.webfonts.js',
	'targets' => array( 'desktop', 'mobile' ),
) + $resourcePaths;

$wgResourceModules['ext.uls.pt'] = array(
	'styles' => 'resources/css/ext.uls.pt.css',
) + $resourcePaths;

$wgResourceModules['ext.uls.interlanguage'] = array(
	'styles' => 'resources/css/ext.uls.interlanguage.css',
) + $resourcePaths;

// A module named rangy is defined in VisualExtension with more features of rangy.
// Here we need only the core library. This module is loaded dynamically from
// client when rangy is undefined. If VE is present rangy will be defined, the module
// defined in VE will be used. ie, This get loaded only when VE is not present and
// user trying to type in a contenteditable
$wgResourceModules['rangy.core'] = array(
	'scripts' => 'lib/rangy/rangy-core.js',
) + $resourcePaths;
