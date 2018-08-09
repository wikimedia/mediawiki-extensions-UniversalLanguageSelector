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
 * @license GPL-2.0-or-later
 * @license MIT
 */
class LanguageNameSearch {
	/**
	 * Find languages with fuzzy matching.
	 * The order of results is following:
	 * 1: exact language code match
	 * 2: exact language name match in any language
	 * 3: prefix language name match in any language
	 * 4: infix language name match in any language
	 *
	 * The returned language name for autocompletion is the first one that
	 * matches in this list:
	 * 1: exact match in [user, autonym, any other language]
	 * 2: prefix match in [user, autonum, any other language]
	 * 3: inline match in [user, autonym, any other language]
	 *
	 * @param string $searchKey
	 * @param int $typos
	 * @param string|null $userLanguage Language tag.
	 * @return array
	 */
	public static function search( $searchKey, $typos = 0, $userLanguage = null ) {
		$results = [];
		$searchKey = mb_strtolower( $searchKey );

		// Always prefer exact language code match
		if ( Language::isKnownLanguageTag( $searchKey ) ) {
			$name = mb_strtolower( Language::fetchLanguageName( $searchKey, $userLanguage ) );
			// Check if language code is a prefix of the name
			if ( strpos( $name, $searchKey ) === 0 ) {
				$results[$searchKey] = $name;
			} else {
				$results[$searchKey] = "$searchKey – $name";
			}
		}

		$index = self::getIndex( $searchKey );
		$bucketsForIndex = [];
		if ( isset( LanguageNameSearchData::$buckets[$index] ) ) {
			$bucketsForIndex = LanguageNameSearchData::$buckets[$index];
		}

		// types are 'prefix', 'infix' (in this order!)
		foreach ( $bucketsForIndex as $bucketType => $bucket ) {
			foreach ( $bucket as $name => $code ) {
				// We can skip checking languages we already have in the list
				if ( isset( $results[ $code ] ) ) {
					continue;
				}

				// Apply fuzzy search
				if ( !self::matchNames( $name, $searchKey, $typos ) ) {
					continue;
				}

				// Once we find a match, figure out the best name to display to the user
				// If $userLanguage is not provided (null), it is the same as autonym
				$candidates = [
					mb_strtolower( Language::fetchLanguageName( $code, $userLanguage ) ),
					mb_strtolower( Language::fetchLanguageName( $code, null ) ),
					$name
				];

				foreach ( $candidates as $candidate ) {
					if ( $searchKey === $candidate ) {
						$results[$code] = $candidate;
						continue 2;
					}
				}

				foreach ( $candidates as $candidate ) {
					if ( self::matchNames( $candidate, $searchKey, $typos ) ) {
						$results[$code] = $candidate;
						continue 2;
					}
				}
			}
		}

		return $results;
	}

	public static function matchNames( $name, $searchKey, $typos ) {
		return strrpos( $name, $searchKey, -strlen( $name ) ) !== false
			|| ( $typos > 0 && self::levenshteinDistance( $name, $searchKey ) <= $typos );
	}

	public static function getIndex( $name ) {
		$codepoint = self::getCodepoint( $name );

		if ( $codepoint < 4000 ) {
			// For latin etc. we need smaller buckets for speed
			return $codepoint;
		} else {
			// Try to group names of same script together
			return $codepoint - ( $codepoint % 1000 );
		}
	}

	/**
	 * Get the code point of first letter of string
	 *
	 * @param string $str
	 * @return int Code point of first letter of string
	 */
	public static function getCodepoint( $str ) {
		$values = [];
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
				if ( $values === [] ) {
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
	 * @param string $str1
	 * @param string $str2
	 * @return int
	 */
	public static function levenshteinDistance( $str1, $str2 ) {
		if ( $str1 === $str2 ) {
			return 0;
		}
		$length1 = mb_strlen( $str1, 'UTF-8' );
		$length2 = mb_strlen( $str2, 'UTF-8' );
		if ( $length1 === 0 ) {
			return $length2;
		}
		if ( $length1 < $length2 ) {
			return self::levenshteinDistance( $str2, $str1 );
		}
		$prevRow = range( 0, $length2 );
		for ( $i = 0; $i < $length1; $i++ ) {
			$currentRow = [];
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
