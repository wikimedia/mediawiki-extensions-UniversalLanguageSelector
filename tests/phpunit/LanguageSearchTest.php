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

	public function searchDataProvider() {
		return [
			[ 'ഹിന്ദി', [
				'hi' => 'ഹിന്ദി'
			]
			],
			[ 'മല', [
				'mg' => 'മലഗാസി',
				'ml' => 'മലയാളം',
				'ms' => 'മലെയ്',
			]
			],
			[ 'Φινλαν', [
				'fi' => 'φινλανδικά',
			]
			],
			[ 'blargh', []
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
			[ 'മലയളം', [
				'ml' => 'മലയാളം',
			]
			],
			[ 'punja', [
				'pa' => class_exists( LanguageNames::class ) ? 'punjabi' : 'punjaabi sennii',
				'pnb' => 'punjabi western',
			]
			],
			[ 'castellano', [
				'es' => 'castellano',
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
			[ 'qartuli', [
				'ka' => 'qartuli',
			]
			],
			[ 'nihongo', [
				'ja' => 'nihongo',
			]
			],
			[ 'にほんご', [
				'ja' => 'にほんご',
			]
			],
			[ 'valencia', [
				'ca' => 'valencia',
			]
			],
			[ 'chinese', [
				'zh' => 'chinese',
				'zh-cn' => 'chinese (china)',
				'zh-hk' => 'chinese (hong kong)',
				'zh-min-nan' => 'chinese (min nan)',
				'zh-sg' => 'chinese (singapore)',
				'zh-tw' => 'chinese (taiwan)',
				'zh-hans' => 'chinese simplified',
				'zh-hant' => 'chinese traditional',
				'zh-classical' => 'chinese — classical chinese',
				'gan' => 'chinese — gan chinese',
				'hak' => 'chinese — hakka chinese',
				'nan' => 'chinese — isi-min nan chinese',
				'wuu' => 'chinese — isi-wu chinese',
				'hsn' => 'chinese — isi-xiang chinese',
				'lzh' => 'chinese — literary chinese',
				'cdo' => 'chinese — min dong chinese',
			]
			],
			[ 'finish', [
				'fi' => 'finnish'
			]
			],
		];
	}
}
