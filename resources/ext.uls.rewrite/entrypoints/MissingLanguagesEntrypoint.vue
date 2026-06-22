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
const useEntrypointActions = require( '../composables/useEntrypointActions.js' );

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
		},
		preferredLanguages: {
			type: Array,
			default: () => []
		}
	},
	emits: [ 'click' ],
	setup( props ) {
		const missingLanguagesCodes = computed( () => {
			const source = props.preferredLanguages.length > 0 ?
				props.preferredLanguages :
				props.suggestions;

			return source.filter( ( code ) => !props.languages[ code ] );
		} );

		const missingLanguagesNames = computed( () => missingLanguagesCodes.value
			.map( ( code ) => $.uls.data.getAutonym( code ) )
			.filter( Boolean )
		);

		const context = computed( () => ( {
			languages: props.languages,
			suggestions: props.suggestions,
			preferredLanguages: props.preferredLanguages,
			missingLanguages: missingLanguagesCodes.value
		} ) );

		const actions = useEntrypointActions( props.entrypoints, context );

		/**
		 * @param {string[]} names
		 * @return {mw.Message}
		 */
		const getLabelContent = ( names ) => {
			// The banner always invites translating "and more" languages, since
			// content is missing in other languages beyond the named ones too.
			if ( names.length >= 2 ) {
				return mw.message( 'ext-uls-missing-languages-label-multiple', names[ 0 ], names[ 1 ] );
			}

			return mw.message( 'ext-uls-missing-languages-label-single', names[ 0 ] );
		};

		const labelContent = computed( () => {
			const actionLabels = actions.value.reduce( ( acc, action ) => {
				if ( action.label ) {
					return acc.concat( action.label );
				}
				return acc;
			}, [] );

			if ( actionLabels.length > 0 ) {
				return getLabelContent( actionLabels );
			}

			return getLabelContent( missingLanguagesNames.value );
		} );

		return {
			labelContent,
			cdxIconNext,
			actions
		};
	}
} );
</script>
