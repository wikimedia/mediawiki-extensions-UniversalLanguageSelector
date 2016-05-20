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

	public function getFilesFromPath( $fspath ) {
		return glob( "$fspath/*/font.ini" );
	}

	public function parseFile( $filepath ) {
		return parse_ini_file( $filepath, true );
	}

	public function getLanguages( array $font ) {
		if ( !isset( $font['languages'] ) ) {
			return [];
		}

		$languages = explode( ',', $font['languages'] );
		$languages = array_map( 'trim', $languages );

		return $languages;
	}

	public function appendLanguages( &$languages, $fontLanguages, $fontname ) {
		foreach ( $fontLanguages as $rcode ) {
			$code = str_replace( '*', '', $rcode );

			if ( !isset( $languages[$code] ) ) {
				$languages[$code] = [ 'system' ];
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

	public function getFontInfo( $font, $fontpath ) {
		$info = [];
		$fontdir = basename( $fontpath );

		if ( isset( $font['fontweight'] ) ) {
			$info['fontweight'] = $font['fontweight'];
		}

		if ( isset( $font['fontstyle'] ) ) {
			$info['fontstyle'] = $font['fontstyle'];
		}

		foreach ( [ 'ttf', 'woff', 'woff2' ] as $format ) {
			if ( isset( $font[$format] ) ) {
				$info[$format] = $this->getFontWebPath( $fontpath, $fontdir, $font[$format] );
			}
		}

		// If font formats are not explicitly defined, scan the directory.
		if ( !isset( $info['ttf'] ) ) {
			foreach ( glob( "$fontpath/*.{ttf,woff,woff2}", GLOB_BRACE ) as $fontfile ) {
				$type = substr( $fontfile, strrpos( $fontfile, '.' ) + 1 );
				$info[$type] = $this->getFontWebPath( $fontpath, $fontdir, basename( $fontfile ) );
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

	private function getFontWebPath( $path, $fontdir, $filename ) {
		if ( method_exists( 'OutputPage', 'transformFilePath' ) ) {
			return OutputPage::transformFilePath( $fontdir, $path, $filename );
		}

		// BC for MediaWiki <= 1.27
		$hash = md5_file( "$path/$filename" );
		return "$fontdir/$filename?" . substr( $hash, 0, 5 );
	}
}
