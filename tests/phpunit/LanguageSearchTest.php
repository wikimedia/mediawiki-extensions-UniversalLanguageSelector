<?php
/**
 * PHPUnit tests for UniversalLanguageSelector extension.
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

use MediaWiki\Extension\CLDR\LanguageNames;

/**
 * @covers \LanguageNameSearch
 * @covers \LanguageNameSearchData
 */
class LanguageSearchTest extends PHPUnit\Framework\TestCase {
	/**
	 * @dataProvider searchDataProvider
	 */
	public function testSearch( $searchKey, $expected ) {
		$actual = LanguageNameSearch::search( $searchKey, 1, 'en' );
		// This is for better error messages
		$this->assertEquals( $expected, $actual );
		// This is for identical order
		$this->assertSame( $expected, $actual );
	}

	public static function searchDataProvider() {
		return [
			[ 'blargh', []
			],
			[ 'castellano', [
				'es' => 'castellano',
			]
			],
			[ 'chinese', [
				// Presence of CLDR extension affects the results
				'zh' => class_exists( LanguageNames::class ) ? 'chinese' : 'chines',
				'zh-cn' => 'chinese (china)',
				'zh-hk' => 'chinese (hong kong)',
				'zh-mo' => 'chinese (macau)',
				'zh-my' => 'chinese (malaysia)',
				'zh-sg' => 'chinese (singapore)',
				'zh-tw' => 'chinese (taiwan)',
				'cdo' => 'chinese min dong',
				'zh-min-nan' => 'chinese min nan',
				'zh-hans' => 'chinese simplificate',
				'zh-hant' => 'chinese traditional',
				'hak' => 'chinese — hakka chinese',
				'gan' => 'chinese — isi-gan chinese',
				'nan' => 'chinese — isi-min nan chinese',
				'wuu' => 'chinese — isi-wu chinese',
				'hsn' => 'chinese — isi-xiang chinese',
				'zh-classical' => 'chinese — literary chinese',
				'lzh' => 'chinesesch — klassescht chinesesch',
			]
			],
			[ 'finnisj', [
				'fi' => 'finnish'
			]
			],
			[ 'hayeren', [
				'hy' => 'hayeren',
			]
			],
			[ 'kartuli', [
				'ka' => 'kartuli',
			]
			],
			[ 'nihongo', [
				'ja' => 'nihongo',
			]
			],
			[ 'musi', [
				'mos' => 'mosi',
				'mui' => class_exists( LanguageNames::class ) ? 'musi' : 'musi palembang',
			]
			],
			[ 'palembang', [
				'mui' => 'palembang',
			]
			],
			[ 'punja', [
				// Presence of CLDR extension affects the results
				'pa' => class_exists( LanguageNames::class ) ? 'punjabi' : 'punjaabi sennii',
				'pa-guru' => 'punjabi (gurmukhi-skrift)',
				'pnb' => 'punjabi western'
			]
			],
			[ 'qartuli', [
				'ka' => 'qartuli',
			]
			],
			[ 'tonga', [
				'to' => 'tonga',
				'toi' => 'tonga (botatwe)',
				'tog' => 'tonga (niasa)',
				'ts' => 'tsonga',
				'nr' => 'tonga — enetepēra ki te tonga',
				'hax' => 'tonga — haira ki te tonga',
				'st' => 'tonga — hōto ki te tonga',
				'es-419' => 'tonga — pāniora amerikana ki te tonga',
				'slh' => 'tonga — ratūti ki te tonga',
				'tce' => 'tonga — tatōne ki te tonga',
				'alt' => 'tonga — ātai ki te tonga',
				'crj' => 'tonga-mā-rāwhiti — kirī tonga-mā-rāwhiti',
			]
			],
			[ 'valencia', [
				'ca' => 'valencia',
			]
			],
			[ 'Φινλαν', [
				'fi' => 'φινλανδικά',
			]
			],
			[ 'טגר', [
				'tig' => 'טגרה',
				'ti' => 'טגריניה',
			]
			],
			[ 'טיגר', [
				'tig' => 'טיגרה',
				'ti' => 'טיגריניה',
			]
			],
			[ 'תגר', [
				'tig' => 'תגרה',
				'ti' => 'תגריניה',
			]
			],
			[ 'תיגר', [
				'tig' => 'תיגרה',
				'ti' => 'תיגריניה',
			]
			],
			[ 'الفرنسية', [
				'fr' => 'الفرنسية',
				'fr-ch' => 'الفرنسية السويسرية',
				'fro' => 'الفرنسية القديمة',
				'frc' => 'الفرنسية الكاجونية',
				'crs' => 'الفرنسية الكريولية السيشيلية',
				'fr-ca' => 'الفرنسية الكندية',
				'frm' => 'الفرنسية الوسطى',
			]
			],
			[ 'മല', [
				'mg' => 'മലഗാസി',
				'ml' => 'മലയാളം',
				'pqm' => 'മലിസീറ്റ്-പസാമക്വുഡി',
				'ms' => 'മലെയ്',
			]
			],
			[ 'മലയളം', [
				'ml' => 'മലയാളം',
			]
			],
			[ 'ഹിന്ദി', [
				'hi' => 'ഹിന്ദി',
			]
			],
			[ 'にほんご', [
				'ja' => 'にほんご',
			]
			],
		];
	}
}
