<?php

namespace UniversalLanguageSelector;

use MediaWiki\Output\OutputPage;

/**
 * This class parses font specification ini files to a central list.
 *
 * @author Niklas Laxström
 * @since 2016.04
 */
class FontRepoCompiler {
	/** @var string */
	protected $fsPath;
	/** @var string */
	protected $webPath;

	/**
	 * @param string $fsPath
	 * @param string $webPath
	 */
	public function __construct( $fsPath, $webPath ) {
		$this->fsPath = $fsPath;
		$this->webPath = $webPath;
	}

	/**
	 * @return array
	 */
	public function getRepository() {
		$files = $this->getFilesFromPath( $this->fsPath );

		$fonts = [];
		$languages = [];

		foreach ( $files as $file ) {
			$conf = $this->parseFile( $file );
			$fontPath = dirname( $file );

			foreach ( $conf as $fontname => $font ) {
				$fontLanguages = $this->getLanguages( $font );
				$this->appendLanguages( $languages, $fontLanguages, $fontname );
				$fonts[$fontname] = $this->getFontInfo( $font, $fontPath );
			}
		}

		ksort( $languages );
		ksort( $fonts );

		return [
			'base' => $this->webPath,
			'languages' => $languages,
			'fonts' => $fonts
		];
	}

	/**
	 * @param string $fspath
	 * @return array|false
	 */
	public function getFilesFromPath( $fspath ) {
		return glob( "$fspath/*/font.ini" );
	}

	/**
	 * @param string $filepath
	 * @return array|false
	 */
	public function parseFile( $filepath ) {
		return parse_ini_file( $filepath, true );
	}

	/**
	 * @param array $font
	 * @return array
	 */
	public function getLanguages( array $font ) {
		if ( !isset( $font['languages'] ) ) {
			return [];
		}

		$languages = explode( ',', $font['languages'] );
		$languages = array_map( 'trim', $languages );

		return $languages;
	}

	/**
	 * @param array &$languages
	 * @param array $fontLanguages
	 * @param string $fontname
	 */
	public function appendLanguages( &$languages, $fontLanguages, $fontname ) {
		foreach ( $fontLanguages as $rcode ) {
			$code = str_replace( '*', '', $rcode );

			if ( !isset( $languages[$code] ) ) {
				$languages[$code] = [ 'system' ];
			}

			if ( str_contains( $rcode, '*' ) ) {
				if ( $languages[$code][0] === 'system' ) {
					unset( $languages[$code][0] );
				}
				array_unshift( $languages[$code], $fontname );
			} else {
				$languages[$code][] = $fontname;
			}
		}
	}

	/**
	 * @param array $font
	 * @param string $fontpath
	 * @return array
	 */
	public function getFontInfo( $font, $fontpath ) {
		$info = [];
		$fontdir = basename( $fontpath );

		if ( isset( $font['fontweight'] ) ) {
			$info['fontweight'] = $font['fontweight'];
		}

		if ( isset( $font['fontstyle'] ) ) {
			$info['fontstyle'] = $font['fontstyle'];
		}

		foreach ( [ 'woff2' ] as $format ) {
			if ( isset( $font[$format] ) ) {
				$info[$format] = OutputPage::transformFilePath( $fontdir, $fontpath, $font[$format] );
			}
		}

		// If font formats are not explicitly defined, scan the directory.
		if ( !isset( $info['woff2'] ) ) {
			foreach ( glob( "$fontpath/*.woff2", GLOB_BRACE ) as $fontfile ) {
				$type = substr( $fontfile, strrpos( $fontfile, '.' ) + 1 );
				$info[$type] = OutputPage::transformFilePath( $fontdir, $fontpath, basename( $fontfile ) );
			}
		}

		// Font variants
		if ( isset( $font['bold'] ) ) {
			$info['variants']['bold'] = $font['bold'];
		}

		if ( isset( $font['bolditalic'] ) ) {
			$info['variants']['bolditalic'] = $font['bolditalic'];
		}

		if ( isset( $font['italic'] ) ) {
			$info['variants']['italic'] = $font['italic'];
		}

		return $info;
	}
}
