<?php
/**
 * Script to create language names index.
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
	$dir = __DIR__;
	$IP = "$dir/../../..";
}
require_once ( "$IP/maintenance/Maintenance.php" );
class LanguageNameIndexer extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( "Script to create language names index." );
	}

	public function execute() {
		if ( method_exists( 'Language', 'fetchLanguageNames' ) ) {
			$languages = Language::fetchLanguageNames( null, 'all' ); // since 1.20
		} else {
			$languages = Language::getLanguageNames( false );
		}

		$all = array();
		$buckets = array();
		foreach ( $languages as $code => $name ) {
			$all[$code][strtolower( $name )] = true;
			$langnames = LanguageNames::getNames( $code, 0, 2 );
			foreach ( $langnames as $langCode => $langName ) {
				$all[$langCode][] = strtolower( $langName );
			}
		}

		foreach ( $all as $code => $names ) {
			foreach ( $names as $index => $name ) {
				$bucket = LanguageNameSearch::getIndex( $name );
				$buckets[$bucket][$name] = $code;
			}
		}
		$this->output( "Total buckets: " . count( $buckets ) . "\n" );
		file_put_contents( 'langnames.ser', serialize( $buckets ) );
	}
}

$maintClass = 'LanguageNameIndexer';
require_once( RUN_MAINTENANCE_IF_MAIN );
