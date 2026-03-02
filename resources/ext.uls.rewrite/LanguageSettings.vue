<template>
	<span></span>
</template>

<script>
const { defineComponent } = require( 'vue' );
const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );
const { cdxIconSettings } = require( '../icons.json' );

try {
	EntrypointRegistry.register( 'quick-actions', {
		id: 'language-settings',
		shouldShow: () => true,
		getConfig: () => ( {
			label: mw.msg( 'ext-uls-open-language-settings' ),
			icon: cdxIconSettings,
			handler: ( event ) => {
				// TODO: Rebuild the existing language settings dialog using Vue,
				// and use it here instead of the old one.
				const $target = $( event.target );
				mw.loader.using( 'ext.uls.displaysettings' ).then( () => {
					$target.languagesettings( { autoOpen: true } );
				} );
			}
		} )
	} );
} catch ( e ) {
	// If the entry point registry is not available, we can safely ignore the error
	// since it only means that the quick action won't be registered.
}

module.exports = defineComponent( {
	name: 'LanguageSettings'
} );
</script>
