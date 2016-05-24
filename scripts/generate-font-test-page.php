<?php
/**
 *
 * @author Niklas Laxström
 * @license GPL-2.0+
 * @file
 */

// Standard boilerplate to define $IP
if ( getenv( 'MW_INSTALL_PATH' ) !== false ) {
	$IP = getenv( 'MW_INSTALL_PATH' );
} else {
	$dir = __DIR__;
	$IP = "$dir/../../..";
}
require_once "$IP/maintenance/Maintenance.php";

class GenerateFontTestPage extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->mDescription = 'Creates a HTML page with text for all fonts.';
	}

	public function execute() {
		$base = dirname( __DIR__ );

		$relpath = '../data/fontrepo/fonts';
		$compiler = new FontRepoCompiler( "$base/data/fontrepo/fonts", $relpath );

		$list = $compiler->getRepository();

		$corpus = file_get_contents( __DIR__ . '/../data/langsamples.json' );
		$corpus = FormatJson::decode( $corpus, true );

		$body = '';

		foreach ( $list['languages'] as $code => $fonts ) {
			foreach ( $fonts as $fontname ) {
				if ( $fontname === 'system' ) {
					continue;
				}

				$class = 'font-' . substr( md5( $fontname ), 0, 6 );
				$body .= Html::element(
					'div',
					[ 'class' => "$class sax" ],
					"[$code/$fontname] {$corpus[$code]}"
				);
			}
		}

		$css = ".sax { white-space: nowrap; overflow: hidden; }\n\n";
		$formats = [ 'woff2', 'woff', 'ttf' ];

		foreach ( $list['fonts'] as $fontname => $font ) {
			$class = 'font-' . substr( md5( $fontname ), 0, 6 );

			$css .= "@font-face {\n\tfont-family: '$fontname';\n\tsrc:\n";

			$xus = [];
			foreach ( $formats as $format ) {
				if ( !isset( $font[$format] ) ) {
					continue;
				}
				$xus[] = "\turl('$relpath/{$font[$format]}') format('$format')";
			}

			$css .= implode( ",\n", $xus );

			$css .= ";\n}\n\n";

			$css .= ".$class {\n\tfont-family: '$fontname';\n}\n\n";
		}

		// Charset is needed, because Edge is so brilliant that it thinks this page full of UTF-8
		// is actually in some legacy encoding and does not provide way to change it ;)
		$html = <<<HTML
<html>
<head>
<meta charset="UTF-8">
<style>
$css
</style>
</head>
<body>
$body
</body>
HTML;

		file_put_contents( "$base/tests/all-fonts.html", $html );
		$this->output( "Done.\n" );
	}
}

$maintClass = 'GenerateFontTestPage';
require_once DO_MAINTENANCE;
