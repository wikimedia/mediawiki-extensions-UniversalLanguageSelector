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
	protected static $languagenames;

	public static function init() {
		self::$languagenames = unserialize( file_get_contents( __DIR__ . '/langnames.ser' ) );
	}

	public static function search( $searchKey, $typos = 0 ) {
		if ( self::$languagenames === null ) {
			self::init();
		}

		// @todo: Shouldn't this be unicode aware?
		$searchKey = strtolower( $searchKey );
		$index = self::getIndex( $searchKey );

		if ( !isset( self::$languagenames[$index] ) ) {
			return array();
		}

		$bucket = self::$languagenames[$index];

		$results = array();
		foreach ( $bucket as $name => $code ) {
			// Prefix search
			if ( strpos( $name, $searchKey, 0 ) === 0 ) {
				$results[$code] = $name;
				continue;
			}
			if ( $typos > 0 && self::levenshteinDistance( $name, $searchKey ) === $typos ) {
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

		return $bucket;
	}

	/**
	 * Get the code point of first letter of string
	 *
	 * @param $str string
	 * @return integer Code point of first letter of string
	 */
	static function getCodepoint( $str ) {
		$values = array();
		$lookingFor = 1;
		$strLen = strlen( $str );
		$number = 0;

		for ( $i = 0; $i < $strLen; $i++ ) {
			$thisValue = ord( $str[$i] );
			if ( $thisValue < 128 ) {
				$number = $thisValue;

				break;
			} else {
				// Codepoints larger than 127 are represented by multi-byte sequences
				if ( count( $values ) === 0 ) {
					// 224 is the lowest non-overlong-encoded codepoint.
					$lookingFor = ( $thisValue < 224 ) ? 2 : 3;
				}

				$values[] = $thisValue;
				if ( count( $values ) === $lookingFor ) {
					// Refer http://en.wikipedia.org/wiki/UTF-8#Description
					if ( $lookingFor === 3 ) {
						$number = ( $values[0] % 16 ) * 4096;
						$number += ( $values[1] % 64 ) * 64;
						$number += $values[2] % 64;
					} else {
						$number = ( $values[0] % 32 ) * 64;
						$number += $values[1] % 64;
					}

					break;
				}
			}
		}

		return $number;
	}

	/**
	 * Calculate the Levenshtein distance between two strings
	 * @param $str1
	 * @param $str2
	 * @return integer
	 */
	static function levenshteinDistance( $str1, $str2 ) {
		$length1 = mb_strlen( $str1, 'UTF-8' );
		$length2 = mb_strlen( $str2, 'UTF-8' );
		if ( $length1 < $length2 ) {
			return self::levenshteinDistance( $str2, $str1 );
		}
		if ( $length1 === 0 ) {
			return $length2;
		}
		if ( $str1 === $str2 ) {
			return 0;
		}
		$prevRow = range( 0, $length2 );
		for ( $i = 0; $i < $length1; $i++ ) {
			$currentRow = array();
			$currentRow[0] = $i + 1;
			$c1 = mb_substr( $str1, $i, 1, 'UTF-8' );
			for ( $j = 0; $j < $length2; $j++ ) {
				$c2 = mb_substr( $str2, $j, 1, 'UTF-8' );
				$insertions = $prevRow[$j + 1] + 1;
				$deletions = $currentRow[$j] + 1;
				$substitutions = $prevRow[$j] + ( ( $c1 !== $c2 ) ? 1 : 0 );
				$currentRow[] = min( $insertions, $deletions, $substitutions );
			}
			$prevRow = $currentRow;
		}

		return $prevRow[$length2];
	}
}
