<?php

include __DIR__ . '/spyc.php';
$data = file_get_contents( 'langdb.yaml' );
$parsed = spyc_load( $data );
$json = json_encode( $parsed );
$js = "window.langdb = $json;";
file_put_contents( 'langdb.js', $js );