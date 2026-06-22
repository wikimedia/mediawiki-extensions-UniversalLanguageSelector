'use strict';

const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );
const { ENTRYPOINT_TYPE, ULS_MODE } = EntrypointRegistry;
const { cdxIconSettings } = require( '../icons.json' );

const MODULES = [ 'ext.uls.displaysettings', 'ext.uls.preferredlanguages' ];

let prefetched = false;
// Stable anchor the dialog binds to.
let $settingsAnchor = null;

try {
	EntrypointRegistry.register( ENTRYPOINT_TYPE.QUICK_ACTIONS, {
		id: 'language-settings',
		shouldShow: () => {
			if ( !prefetched ) {
				mw.loader.load( MODULES );
				prefetched = true;
			}
			return true;
		},
		getConfig: () => ( {
			label: mw.msg( 'ext-uls-open-language-settings' ),
			icon: cdxIconSettings,
			handler: ( event ) => {
				// TODO: Rebuild the existing language settings dialog using Vue,
				// and use it here instead of the old one.
				const $ulsContainer = $( event.target ).parents( '.uls-rewrite' );
				mw.loader.using( MODULES ).then( () => {
					const ulsContainerOffsetTop = $ulsContainer.offset().top;
					const onPosition = function () {
						return {
							top: ulsContainerOffsetTop,
							// Position the dialog in the center.
							left: '50%',
							transform: 'translateX(-50%)'
						};
					};

					if ( !$settingsAnchor ) {
						$settingsAnchor = $( '<div>' ).appendTo( document.body );
					}

					$settingsAnchor.languagesettings( { autoOpen: true, onPosition } );
				} );
			}
		} )
	}, [ ULS_MODE.INTERFACE, ULS_MODE.CONTENT ] );
} catch ( e ) {
	// If the entry point registry is not available, we can safely ignore the error
	// since it only means that the quick action won't be registered.
}
