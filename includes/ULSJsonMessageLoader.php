<?php
/**
 * Json formatted MessageLoader for ULS
 *
 * Copyright (C) 2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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
 * @since 2013.11
 */

class ULSJsonMessageLoader {
	/**
	 * Returns all message files that are used to load messages for the given
	 * language.
	 * @param string $language Language code.
	 * @return string[]
	 */
	public static function getFilenames( $language ) {
		$filenames = [];

		$languages = Language::getFallbacksFor( $language );
		// Prepend the requested language code
		// to load them all in one loop
		array_unshift( $languages, $language );

		// jQuery.uls localization
		foreach ( $languages as $language ) {
			$filenames[] = __DIR__ . "/../lib/jquery.uls/i18n/$language.json";
		}

		// mediaWiki.uls localization
		foreach ( $languages as $language ) {
			$filenames[] = __DIR__ . "/../i18n/$language.json";
		}

		$filenames = array_filter( $filenames, function( $filename ) {
			return file_exists( $filename );
		} );

		return $filenames;
	}

	/**
	 * Get messages for the given language.
	 * @param string $language Language code.
	 * @return array
	 */
	public static function getMessages( $language ) {
		$contents = [];

		foreach ( self::getFilenames( $language ) as $filename ) {
			$contents += self::loadI18nFile( $filename );
		}

		return $contents;
	}

	/**
	 * Load messages from a json file.
	 * @param string $filename Directory of the json file.
	 * @return array
	 */
	protected static function loadI18nFile( $filename ) {
		$contents = file_get_contents( $filename );

		return json_decode( $contents, true );
	}
}
