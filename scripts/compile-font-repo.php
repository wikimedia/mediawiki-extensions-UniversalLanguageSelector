<?php
/**
 * @author Niklas Laxström
 * @license GPL-2.0-or-later
 * @file
 */

namespace UniversalLanguageSelector;

use MediaWiki\Json\FormatJson;
use MediaWiki\Maintenance\Maintenance;

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
		$this->addDescription( 'Creates JavaScript font repository.' );
	}

	public function execute() {
		$base = dirname( __DIR__ );

		$compiler = new FontRepoCompiler(
			"$base/data/fontrepo/fonts",
			'../data/fontrepo/fonts/'
		);

		$list = $compiler->getRepository();

		$json = FormatJson::encode( $list, "\t" );
		$js = <<<JAVASCRIPT
// Do not edit! This file is generated from data/fontrepo by scripts/compile-font-repo.php
( function () {
	$.webfonts = $.webfonts || {};
	$.webfonts.repository = $json;
}() );

JAVASCRIPT;
		file_put_contents( "$base/resources/js/ext.uls.webfonts.repository.js", $js );

		$this->output( "Done.\n" );
	}
}

$maintClass = CompileFontRepo::class;
require_once RUN_MAINTENANCE_IF_MAIN;
