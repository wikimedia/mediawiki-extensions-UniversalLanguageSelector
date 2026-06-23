<template>
	<div class="uls-rewrite__missing-languages-panel">
		<p class="uls-rewrite__missing-languages-panel__description">
			{{ $i18n( 'ext-uls-missing-languages-panel-description' ) }}
		</p>
		<div class="uls-rewrite__missing-languages-panel__actions">
			<entrypoint-action-button
				v-for="( action, index ) in limitedActions"
				:key="index"
				:action="action"
				button-action="default"
				icon-size="small"
			></entrypoint-action-button>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { cdxIconEllipsis } = require( '../../icons.json' );
const EntrypointActionButton = require( './EntrypointActionButton.vue' );

// Per the design, surface at most two suggested languages in the panel.
const MAX_MISSING_LANGUAGES_TO_DISPLAY = 2;

module.exports = defineComponent( {
	name: 'MissingLanguagesPanel',
	components: {
		EntrypointActionButton
	},
	props: {
		actions: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		const limitedActions = computed( () => {
			const actions = props.actions.slice( 0, MAX_MISSING_LANGUAGES_TO_DISPLAY );

			// Always offer an ellipsis button that leads to the same destination
			// as the first language, inviting the user to pick a different one.
			if ( props.actions.length ) {
				actions.push( {
					icon: cdxIconEllipsis,
					url: props.actions[ 0 ].url,
					ariaLabel: props.actions[ 0 ].label
				} );
			}

			return actions;
		} );
		return {
			limitedActions
		};
	}
} );
</script>
