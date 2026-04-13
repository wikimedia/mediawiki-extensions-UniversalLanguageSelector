<template>
	<div
		v-if="actions.length > 0"
		class="uls-rewrite__missing-languages"
		@click.stop="$emit( 'click', actions )"
	>
		<span
			v-i18n-html="labelContent"
			class="uls-rewrite__missing-languages__label"
		></span>
		<cdx-icon :icon="cdxIconNext" size="small"></cdx-icon>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxIcon } = require( '../../codex.js' );
const { cdxIconNext } = require( '../../icons.json' );

module.exports = defineComponent( {
	name: 'MissingLanguagesEntrypoint',
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
	emits: [ 'click' ],
	setup( props ) {
		const missingLanguagesCodes = computed( () => props.suggestions
			.filter( ( code ) => !props.languages[ code ] )
		);

		const missingLanguagesNames = computed( () => missingLanguagesCodes.value
			.map( ( code ) => $.uls.data.getAutonym( code ) )
			.filter( Boolean )
		);

		const labelContent = computed( () => {
			const count = missingLanguagesNames.value.length;
			const names = missingLanguagesNames.value;

			if ( count > 2 ) {
				return mw.message( 'ext-uls-missing-languages-label-more', names[ 0 ], names[ 1 ] );
			}

			return mw.message( 'ext-uls-missing-languages-label', mw.language.listToText( names ) );
		} );

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
		);

		return {
			labelContent,
			cdxIconNext,
			actions
		};
	}
} );
</script>
