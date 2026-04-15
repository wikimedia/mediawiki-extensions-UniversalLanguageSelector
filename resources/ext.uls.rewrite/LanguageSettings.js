'use strict';

const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );
const { ENTRYPOINT_TYPE, ULS_MODE } = EntrypointRegistry;
const { cdxIconSettings } = require( '../icons.json' );

try {
	EntrypointRegistry.register( ENTRYPOINT_TYPE.QUICK_ACTIONS, {
		id: 'language-settings',
		shouldShow: () => true,
		getConfig: () => ( {
			label: mw.msg( 'ext-uls-open-language-settings' ),
			icon: cdxIconSettings,
			handler: ( event ) => {
				// TODO: Rebuild the existing language settings dialog using Vue,
				// and use it here instead of the old one.
				const $target = $( event.target );
				const $ulsContainer = $target.parents( '.uls-rewrite' );
				mw.loader.using( 'ext.uls.displaysettings' ).then( () => {
					const ulsContainerOffsetTop = $ulsContainer.offset().top;
					$target.languagesettings( {
						autoOpen: true,
						onPosition: function () {
							return {
								top: ulsContainerOffsetTop,
								// Position the dialog in the center.
								left: '50%',
								transform: 'translateX(-50%)',
								// If the width is too small, make it as wide as needed,
								// because we transform it later.
								width: 'max-content'
							};
						}
					} );
				} );
			}
		} )
	}, [ ULS_MODE.INTERFACE, ULS_MODE.CONTENT ] );
} catch ( e ) {
	// If the entry point registry is not available, we can safely ignore the error
	// since it only means that the quick action won't be registered.
}
