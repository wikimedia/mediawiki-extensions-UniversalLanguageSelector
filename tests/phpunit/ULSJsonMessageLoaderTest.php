<?php

namespace UniversalLanguageSelector\Tests;

use ULSJsonMessageLoader;

/**
 * @covers \ULSJsonMessageLoader
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class ULSJsonMessageLoaderTest extends \PHPUnit\Framework\TestCase {
	use \PHPUnit4And6Compat;

	public function testGetFilenamesWithBadInput() {
		$instance = new ULSJsonMessageLoader();

		$this->setExpectedException( \Exception::class );
		$instance->getFilenames( null );
	}

	public function testGetMessagesWithBadInput() {
		$instance = new ULSJsonMessageLoader();

		$this->setExpectedException( \Exception::class );
		$instance->getMessages( null );
	}

	public function testWithInvalidLanguageCode() {
		$instance = new ULSJsonMessageLoader();
		$languageCode = '0';

		$filenames = $instance->getFilenames( $languageCode );
		$this->assertSame( [], $filenames );

		$messages = $instance->getMessages( $languageCode );
		$this->assertSame( [], $messages );
	}

	public function testWithValidLanguageCode() {
		$instance = new ULSJsonMessageLoader();
		$languageCode = 'en';

		$filenames = $instance->getFilenames( $languageCode );
		$this->assertContainsOnly( 'string', $filenames );

		$messages = $instance->getMessages( $languageCode );
		unset( $messages['@metadata'] );
		$this->assertContainsOnly( 'string', array_keys( $messages ) );
		$this->assertContainsOnly( 'string', $messages );
	}

}
