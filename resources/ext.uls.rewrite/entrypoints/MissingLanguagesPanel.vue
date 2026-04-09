<template>
	<div class="uls-rewrite__missing-languages-panel">
		<p class="uls-rewrite__missing-languages-panel__description">
			{{ $i18n( 'ext-uls-missing-languages-panel-description' ) }}
		</p>
		<div class="uls-rewrite__missing-languages-panel__actions">
			<a
				v-for="( action, index ) in actions"
				:key="index"
				:href="action.url"
				class="cdx-button
					cdx-button--fake-button
					cdx-button--fake-button--enabled
					cdx-button--action-progressive
					cdx-button--weight-quiet"
			>
				<cdx-icon
					v-if="action.icon"
					:icon="action.icon"
					size="small"
				></cdx-icon>
				{{ action.label }}
			</a>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxIcon } = require( '../../codex.js' );

module.exports = defineComponent( {
	name: 'MissingLanguagesPanel',
	components: {
		CdxIcon
	},
	props: {
		entrypoints: {
			type: Array,
			required: true
		},
		languages: {
			type: Object,
			default: () => {}
		},
		suggestions: {
			type: Array,
			default: () => []
		}
	},
	setup( props ) {
		const missingLanguagesCodes = computed( () => props.suggestions
			.filter( ( code ) => !props.languages[ code ] )
		);

		const context = computed( () => ( {
			languages: props.languages,
			suggestions: props.suggestions,
			missingLanguages: missingLanguagesCodes.value
		} ) );

		const actions = computed( () => props.entrypoints
			.filter( ( entryPoint ) => entryPoint.shouldShow( context.value ) )
			.map( ( entryPoint ) => entryPoint.getConfig( context.value ) )
			.filter( ( config ) => config !== null &&
				( Array.isArray( config ) ? config.length > 0 : true ) )
			.reduce( ( acc, val ) => acc.concat( val ), [] )
			.slice( 0, 2 )
		);

		return {
			actions
		};
	}
} );
</script>
