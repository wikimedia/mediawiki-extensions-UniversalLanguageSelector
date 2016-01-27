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
		'Deprecated PHP entry point used for UniversalLanguageSelector extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	); */
	return;
} else {
	die( 'Universal Language Selector extension requires MediaWiki 1.25 or later' );
}
