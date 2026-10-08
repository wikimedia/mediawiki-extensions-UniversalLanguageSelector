<?php

declare( strict_types = 1 );
/**
 * What ULS does differently on each skin.
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 * @license MIT
 */

namespace UniversalLanguageSelector;

use MediaWiki\Skin\Skin;

class SkinSupport {
	/**
	 * Checks whether language is in the main menu.
	 */
	private function isLanguageInMainMenu( Skin $skin ): bool {
		$languageInMainMenuConfig = $skin->getConfig()->get( 'VectorLanguageInMainMenu' );
		$userStatus = $skin->getUser()->isAnon() ? 'logged_out' : 'logged_in';
		return $languageInMainMenuConfig[ $userStatus ] ?? true;
	}

	/**
	 * Checks whether language is in header.
	 */
	private function isLanguageInHeader( Skin $skin ): bool {
		$languageInHeaderConfig = $skin->getConfig()->get( 'VectorLanguageInHeader' );
		$userStatus = $skin->getUser()->isAnon() ? 'logged_out' : 'logged_in';
		return $languageInHeaderConfig[ $userStatus ] ?? true;
	}

	/**
	 * Whether the skin shows a language button in the page header.
	 */
	public function hasHeaderLanguageButton( Skin $skin ): bool {
		return $skin->getSkinName() === 'vector-2022' && $this->isLanguageInHeader( $skin );
	}

	/**
	 * Whether compact links is on or off because of the skin's language button placement.
	 *
	 * @return bool|null Null when the skin leaves it to the wiki config and user preference
	 */
	public function getSkinCompactLinksOverride( Skin $skin ): ?bool {
		// Unless the languages are also in the main menu (as on Russian WP)
		if ( $skin->getSkinName() === 'vector-2022' && !$this->isLanguageInMainMenu( $skin ) ) {
			return !$this->isLanguageInHeader( $skin );
		}
		return null;
	}

	/**
	 * Whether ULS adds only its core features on this skin (T237036).
	 */
	public function addsOnlyCoreFeatures( Skin $skin ): bool {
		return $skin->getSkinName() === 'minerva';
	}
}
