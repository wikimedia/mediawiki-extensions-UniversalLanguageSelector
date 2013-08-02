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
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */
require_once __DIR__ . '/../../data/LanguageNameSearch.php';
class LanguageSearchTest extends PHPUnit_Framework_TestCase {

	/**
	 * @dataProvider searchDataProvider
	 */
	public function testSearch( $searchKey, $result ) {
		$this->assertEquals( $result, LanguageNameSearch::search( $searchKey, 1 ) );
	}

	public function searchDataProvider() {
		return array(
			array( "ഹിന്ദി", array(
				'hi' => 'ഹിന്ദി'
			)
			),
			array( "മല", array(
				'ml' => "മലയാളം",
				'mg' => 'മലഗാസി',
				'ms' => 'മലയ',
			)
			),
			array( "Φινλαν", array(
				'fi' => 'Φινλανδικά',
			)
			),
			array( 'blah', array()
			),
			array( "الفرنسية", array(
				'fr' => 'الفرنسية',
				'fr-ca' => 'الفرنسية الكندية',
				'fr-ch' => 'الفرنسية السويسرية',
				'frm' => 'الفرنسية الوسطى',
				'fro' => 'الفرنسية القديمة',
			)
			),
			array( "മലയളം", array(
				'ml' => "മലയാളം",
			)
			),
			array( "finish", array(
				'fi' => 'finnish'
			)
			),
		);
	}
}
