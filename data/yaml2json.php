<?php
/**
 * Script to create the language data in json format for ULS
 */
include __DIR__ . '/spyc.php';
$data = file_get_contents( 'langdb.yaml' );
$parsed = spyc_load( $data );
$json = json_encode( $parsed );
$js = "( function ( $ ) {\n"
		."\t$.uls = {};\n"
		."\t$.uls.data = $json;\n"
		."} )( jQuery );\n";
file_put_contents( 'ext.uls.data.js', $js );