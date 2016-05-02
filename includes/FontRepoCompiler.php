<?php

/**
 * This class parses font specification ini files to a central list.
 * @author Niklas Laxström
 * @since 2016.04
 */
class FontRepoCompiler {
	protected $fsPath;
	protected $webPath;

	public function __construct( $fsPath, $webPath ) {
		$this->fsPath = $fsPath;
		$this->webPath = $webPath;
	}

	public function getRepository() {
		$files = $this->getFilesFromPath( $this->fsPath );

		$fonts = array();
		$languages = array();

		foreach ( $files as $file ) {
			$conf = $this->parseFile( $file );
			$fontPath = dirname( $file );

			// Ugly hack to populate version to all fonts in a set
			$version = null;
			foreach ( $conf as $fontname => $font ) {
				$fontLanguages = $this->getLanguages( $font );
				$this->appendLanguages( $languages, $fontLanguages, $fontname );
				$fonts[$fontname] = $this->getFontInfo( $font, $fontPath, $version );
			}
		}

		ksort( $languages );
		ksort( $fonts );

		return array(
			'base' => $this->webPath,
			'languages' => $languages,
			'fonts' => $fonts
		);
	}


	public function getFilesFromPath( $fspath ) {
		return glob( "$fspath/*/font.ini" );
	}

	public function parseFile( $filepath ) {
		return parse_ini_file( $filepath, true );
	}

	public function getLanguages( array $font ) {
		if ( !isset( $font['languages'] ) ) {
			return array();
		}

		$languages = explode( ',', $font['languages'] );
		$languages = array_map( 'trim', $languages );

		return $languages;
	}

	public function appendLanguages( &$languages, $fontLanguages, $fontname ) {
		foreach ( $fontLanguages as $rcode ) {
			$code = str_replace( '*', '', $rcode );

			if ( !isset( $languages[$code] ) ) {
				$languages[$code] = array( 'system' );
			}

			if ( strpos( $rcode, '*' ) !== false ) {
				if ( $languages[$code][0] === 'system' ) {
					unset( $languages[$code][0] );
				}
				array_unshift( $languages[$code], $fontname );
			} else {
				$languages[$code][] = $fontname;
			}
		}
	}

	public function getFontInfo( $font, $fontpath, &$version ) {
		$info = array();
		$fontdir = basename( $fontpath );

		$version = $info['version'] = isset( $font['version'] ) ? $font['version'] : $version;

		if ( isset( $font['fontweight'] ) ) {
			$info['fontweight'] = $font['fontweight'];
		}

		if ( isset( $font['fontstyle'] ) ) {
			$info['fontstyle'] = $font['fontstyle'];
		}

		if ( isset( $font['ttf'] ) ) {
			$info['ttf'] = $fontdir . '/' . $font['ttf'];
		}

		if ( isset( $font['svg'] ) ) {
			$info['svg'] = $fontdir . '/' . $font['svg'];
		}

		if ( isset( $font['eot'] ) ) {
			$info['eot'] = $fontdir . '/' . $font['eot'];
		}

		if ( isset( $font['woff'] ) ) {
			$info['woff'] = $fontdir . '/' . $font['woff'];
		}

		if ( isset( $font['woff2'] ) ) {
			$info['woff2'] = $fontdir . '/' . $font['woff2'];
		}

		// If font formats are not explicitly defined, scan the directory.
		if ( !isset( $info['ttf'] ) ) {
			foreach ( glob( "$fontpath/*.{eot,ttf,woff,woff2,svg}", GLOB_BRACE ) as $fontfile ) {
				$type = substr( $fontfile, strrpos( $fontfile, '.' ) + 1 );
				$info[$type] = $fontdir . '/' . basename( $fontfile );
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
