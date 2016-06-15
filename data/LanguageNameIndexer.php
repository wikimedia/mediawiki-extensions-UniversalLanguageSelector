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

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__  . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class LanguageNameIndexer extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Script to create language names index.' );
	}

	public function execute() {
		$languages = Language::fetchLanguageNames( null, 'all' );

		$buckets = [];
		foreach ( $languages as $sourceLanguage => $autonym ) {
			$translations = LanguageNames::getNames( $sourceLanguage, 0, 2 );
			foreach ( $translations as $targetLanguage => $translation ) {
				$translation = mb_strtolower( $translation );
				$bucket = LanguageNameSearch::getIndex( $translation );
				$buckets[$bucket][$translation] = $targetLanguage;
			}
		}

		$this->output( 'Total buckets: ' . count( $buckets ) . "\n" );
		file_put_contents( 'langnames.ser', serialize( $buckets ) );
	}
}

$maintClass = 'LanguageNameIndexer';
require_once RUN_MAINTENANCE_IF_MAIN;
