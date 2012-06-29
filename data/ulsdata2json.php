<?php
/**
 * Script to create the language data in json format for ULS
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
$json = json_encode( $parsed );
$languageNames = FormatJSON::encode( Language::fetchLanguageNames() );
$js = <<<EOD
( function ( $ ) {
	$.uls = {};
	$.uls.data = $json;
	$.uls.data.autonyms = $languageNames;
} )( jQuery );

EOD;
file_put_contents( 'ext.uls.data.js', $js );
