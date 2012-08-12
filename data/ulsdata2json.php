<?php
/**
 * Script to create the language data in JSON format for ULS.
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

// Standard boilerplate to define $IP
if ( getenv( 'MW_INSTALL_PATH' ) !== false ) {
	$IP = getenv( 'MW_INSTALL_PATH' );
} else {
	$dir = __DIR__; $IP = "$dir/../../..";
}
require_once( "$IP/maintenance/commandLine.inc" );
include __DIR__ . '/spyc.php';

$data = file_get_contents( 'langdb.yaml' );
$parsed = spyc_load( $data );
$json = FormatJSON::encode( $parsed, true );
$languageNames = FormatJSON::encode( Language::fetchLanguageNames(), true );
$js = <<<JAVASCRIPT
( function ( $ ) {
	$.uls = {};
	$.uls.data = $json;
	$.uls.data.autonyms = $languageNames;
} )( jQuery );

JAVASCRIPT;
file_put_contents( 'ext.uls.data.js', $js );
