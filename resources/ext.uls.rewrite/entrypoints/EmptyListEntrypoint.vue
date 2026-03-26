<template>
	<div>
		<p>{{ $i18n( 'ext-uls-no-languages-entrypoint-description' ) }}</p>
		<span
			v-for="( action, index ) in emptyListEntrypoints"
			:key="index"
		>
			<cdx-button
				v-if="action.handler"
				weight="quiet"
				@click="action.handler"
			>
				<cdx-icon v-if="action.icon" :icon="action.icon"></cdx-icon>
				{{ action.label }}
			</cdx-button>
			<a
				v-else-if="action.url"
				:href="action.url"
				class="cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--action-progressive cdx-button--weight-quiet"
			>
				<cdx-icon v-if="action.icon" :icon="action.icon"></cdx-icon>
				{{ action.label }}
			</a>
		</span>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../codex.js' );

module.exports = defineComponent( {
	name: 'EmptyListEntrypoint',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		emptyListActions: {
			type: Array,
			required: true
		},
		suggestions: {
			type: Array,
			required: true
		},
		languages: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		const context = computed( () => ( {
			suggestions: props.suggestions,
			languages: props.languages
		} ) );

		// 1. Filter relevant actions based on shouldShow method.
		// 2. Get their config.
		// 3. Validate the config & flatten the array.
		const emptyListEntrypoints = computed( () => props.emptyListActions
			.filter( ( entryPoint ) => entryPoint.shouldShow( context.value ) )
			.map( ( entryPoint ) => entryPoint.getConfig( context.value ) )
			.filter( ( config ) => config !== null && ( Array.isArray( config ) ? config.length > 0 : true ) )
			.reduce( ( acc, val ) => acc.concat( val ), [] )
		);

		return {
			emptyListEntrypoints
		};
	}
} );
</script>
