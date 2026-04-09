<template>
	<div
		v-if="showEntrypoint"
		class="uls-rewrite__missing-languages"
		@click.stop="$emit( 'click' )"
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
		const maxMissingLanguagesToDisplay = 4;
		const missingLanguagesCodes = computed( () => props.suggestions
			.filter( ( code ) => !props.languages[ code ] )
		);

		const missingLanguagesNames = computed( () => missingLanguagesCodes.value
			.map( ( code ) => $.uls.data.getAutonym( code ) )
			.filter( Boolean )
		);

		const missingLanguagesNamesToDisplay =
			computed( () => missingLanguagesNames.value.slice( 0, maxMissingLanguagesToDisplay ) );

		const labelContent = computed( () => {
			const count = missingLanguagesNames.value.length;
			const names = missingLanguagesNamesToDisplay.value;

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

		// Filter relevant actions based on shouldShow method.
		const showEntrypoint = computed( () => props.entrypoints
			.some( ( entryPoint ) => entryPoint.shouldShow( context.value ) )
		);

		return {
			showEntrypoint,
			labelContent,
			cdxIconNext
		};
	}
} );
</script>
