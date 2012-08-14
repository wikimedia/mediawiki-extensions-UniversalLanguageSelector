<?php

$list = array();
$list['base'] = '../data/fontrepo/fonts/';
foreach ( glob( '../fonts/*/font.ini' ) as $inifile ) {
	$conf = parse_ini_file( $inifile, true );
	foreach ( $conf as $fontname => $font ) {
		foreach ( explode( ',', $font['languages'] ) as $rcode ) {
			$rcode = trim( $rcode );
			$code = str_replace( '*', '', $rcode );
			if ( !isset( $list['languages'][$code] ) ) {
				$list['languages'][$code] = array();
			}
			if ( strpos( $rcode, '*' ) !== false ) {
				array_unshift( $list['languages'][$code], $fontname );
			} else {
				$list['languages'][$code][] = $fontname;
			}
		}
		$list['fonts'][$fontname] = array(
			'version' => $font['version'],
			'license' => @$font['license'],
		);

		$dir = dirname( $inifile );
		foreach ( glob( "$dir/*.{eot,ttf,woff,svg}", GLOB_BRACE ) as $fontfile ) {
			$type = substr( $fontfile, strrpos( $fontfile, '.' ) + 1 );
			$list['fonts'][$fontname][$type] = str_replace( dirname( $dir ) . '/', '', $fontfile );
		}
	}
}

ksort( $list['languages'] );
ksort( $list['fonts'] );

$json = json_encode( $list );
$js = <<<JAVASCRIPT
// Please do not edit. This file is generated from data/fontrepo by data/fontrepo/scripts/compile.php
( function ( $ ) {
	$.webfonts = $.webfonts || {};
	$.webfonts.repository = $json;
} )( jQuery );
JAVASCRIPT;
file_put_contents( '../../../resources/js/ext.uls.webfonts.repository.js', $js );