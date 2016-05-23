<?php
/**
 *
 * @author Niklas Laxström
 * @license GPL-2.0+
 * @file
 */

// Standard boilerplate to define $IP
if ( getenv( 'MW_INSTALL_PATH' ) !== false ) {
	$IP = getenv( 'MW_INSTALL_PATH' );
} else {
	$dir = __DIR__;
	$IP = "$dir/../../..";
}
require_once "$IP/maintenance/Maintenance.php";

class CompileFontRepo extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->mDescription = 'Creates JavaScript font repository.';
	}

	public function execute() {
		$base = dirname( __DIR__ );

		$compiler = new FontRepoCompiler(
			"$base/data/fontrepo/fonts",
			'../data/fontrepo/fonts/'
		);

		$list = $compiler->getRepository();

		$json = FormatJson::encode( $list );
		$js = <<<JAVASCRIPT
// Do not edit! This file is generated from data/fontrepo by data/fontrepo/scripts/compile.php
( function ( $ ) {
	$.webfonts = $.webfonts || {};
	$.webfonts.repository = $json;
}( jQuery ) );

JAVASCRIPT;
		file_put_contents( "$base/resources/js/ext.uls.webfonts.repository.js", $js );

		$this->output( "Done.\n" );
	}
}

$maintClass = 'CompileFontRepo';
require_once DO_MAINTENANCE;
