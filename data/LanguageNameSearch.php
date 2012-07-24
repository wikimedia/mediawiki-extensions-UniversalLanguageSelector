<?php
/**
 * Cross-Language Language name search
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
class LanguageNameSearch {
	static $languagenames;
	public function init() {
		self::$languagenames = unserialize( file_get_contents( __DIR__ . '/langnames.ser' ) );
	}

	public static function search( $searchKey ) {
		$results = array();
		if ( self::$languagenames === null ) {
			self::init();
		}
		$bucket = self::$languagenames[self::getIndex( $searchKey )];
		foreach ( $bucket as $name => $code ) {
			// Prefix search
			if ( strpos( $name, $searchKey, 0 ) === 0 ) {
				$results[$code] = $name;
			}
		}
		return $results;
	}
	public static function getIndex( $name ) {
		$codepoint = self::getCodepoint( $name );
		if ( $codepoint < 1000 ) {
			$bucket = $codepoint;
		} else {
			$bucket = $codepoint % 1000;
		}
		if ( !isset( $buckets[$bucket] ) ) {
			$buckets[$bucket] = array();
		}
		return $bucket;
	}
	/**
	 * Get the code point of first letter of string
	 *
	 * @return integer Code point of first letter of string
	 */
	static function getCodepoint( $str ) {
		$unicode = array();
		$values = array();
		$lookingFor = 1;
		for ( $i = 0; $i < strlen( $str ); $i++ ) {
			$thisValue = ord( $str[$i] );
			if ( $thisValue < 128 ) {
				return $thisValue;
			} else { // Codepoints larger than 127 are represented by multi-byte sequences,
				if ( count( $values ) === 0 ) {
					// 224 is the lowest non-overlong-encoded codepoint.
					$lookingFor = ( $thisValue < 224 ) ? 2 : 3;
				}
				$values[] = $thisValue;
				if ( count( $values ) === $lookingFor ) {
					// Refer http://en.wikipedia.org/wiki/UTF-8#Description
					$number = ( $lookingFor === 3 ) ? ( ( $values[0] % 16 ) * 4096 ) + ( ( $values[1] % 64 ) * 64 ) + ( $values[2] % 64 ) : ( ( $values[0] % 32 ) * 64 ) + ( $values[
1] % 64 );
					return $number;
				}
			}
		}
	}
}
