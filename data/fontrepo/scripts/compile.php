<?php

if ( isset( $_SERVER['REQUEST_METHOD'] ) ) {
	exit( "compile.php should be run from the command line\n" );
}

if ( !is_dir( '../fonts/' ) ) {
	exit( "compile.php should be run from the data/fontrepo/scripts directory\n" );
}

$list = array();
$list['base'] = '../data/fontrepo/fonts/';
foreach ( glob( '../fonts/*/font.ini' ) as $inifile ) {
	$conf = parse_ini_file( $inifile, true );
	$languages = array();
	$version = null;
	foreach ( $conf as $fontname => $font ) {

		if ( isset( $font['languages'] ) ) {
			$languages = explode( ',', $font['languages'] );
			foreach ( $languages as $rcode ) {
				$rcode = trim( $rcode );
				$code = str_replace( '*', '', $rcode );
				if ( !isset( $list['languages'][$code] ) ) {
					$list['languages'][$code] = array( 'system' );
				}
				if ( strpos( $rcode, '*' ) !== false ) {
					unset( $list['languages'][$code][0] );
					array_unshift( $list['languages'][$code], $fontname );
				} else {
					$list['languages'][$code][] = $fontname;
				}
			}
		}
		if ( isset( $font['version'] ) ) {
			$version = $font['version'];
		}
		$list['fonts'][$fontname] = array(
			'version' => $version,
		);

		if ( isset( $font['fontweight'] ) ) {
			$list['fonts'][$fontname]['fontweight'] = $font['fontweight'];
		}
		if ( isset( $font['fontstyle'] ) ) {
			$list['fonts'][$fontname]['fontstyle'] = $font['fontstyle'];
		}

		$dir = dirname( $inifile );

		if ( isset( $font['ttf'] ) ) {
			$list['fonts'][$fontname]['ttf'] = basename( $dir ) . '/' . $font['ttf'];
		}
		if ( isset( $font['svg'] ) ) {
			$list['fonts'][$fontname]['svg'] = basename( $dir ) . '/' . $font['svg'];
		}
		if ( isset( $font['eot'] ) ) {
			$list['fonts'][$fontname]['eot'] = basename( $dir ) . '/' . $font['eot'];
		}
		if ( isset( $font['woff'] ) ) {
			$list['fonts'][$fontname]['woff'] = basename( $dir ) . '/' . $font['woff'];
		}
		if ( isset( $font['woff2'] ) ) {
			$list['fonts'][$fontname]['woff2'] = basename( $dir ) . '/' . $font['woff2'];
		}

		// If font formats are not explicitly defined, scan the directory.
		if ( !isset( $list['fonts'][$fontname]['ttf'] ) ) {
			foreach ( glob( "$dir/*.{eot,ttf,woff,woff2,svg}", GLOB_BRACE ) as $fontfile ) {
				$type = substr( $fontfile, strrpos( $fontfile, '.' ) + 1 );
				$list['fonts'][$fontname][$type] = str_replace( dirname( $dir ) . '/', '', $fontfile );
			}
		}

		// Font variants
		if ( isset( $font['bold'] ) ) {
			$list['fonts'][$fontname]['variants']['bold'] = $font['bold'];
		}
		if ( isset( $font['bolditalic'] ) ) {
			$list['fonts'][$fontname]['variants']['bolditalic'] = $font['bolditalic'];
		}
		if ( isset( $font['italic'] ) ) {
			$list['fonts'][$fontname]['variants']['italic'] = $font['italic'];
		}
	}
}

ksort( $list['languages'] );
ksort( $list['fonts'] );

$json = json_encode( $list );
$js = <<<JAVASCRIPT
// Do not edit! This file is generated from data/fontrepo by data/fontrepo/scripts/compile.php
( function ( $ ) {
	$.webfonts = $.webfonts || {};
	$.webfonts.repository = $json;
}( jQuery ) );

JAVASCRIPT;
file_put_contents( '../../../resources/js/ext.uls.webfonts.repository.js', $js );

echo "Done.\n";
