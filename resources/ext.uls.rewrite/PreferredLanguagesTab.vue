<template>
	<div class="uls-rewrite_preferred-languages">
		<h3>{{ $i18n( 'ext-uls-preferred-languages-settings-title' ).text() }}</h3>
		<h4>{{ $i18n( 'ext-uls-preferred-languages-label' ).text() }}</h4>
		<p>{{ $i18n( 'ext-uls-preferred-languages-help', MAX_LANGUAGES ).text() }}</p>
		<cdx-field class="uls-rewrite_preferred-languages-field">
			<template #help-text>
				<div class="uls-rewrite_preferred-languages-help-text">
					<span v-i18n-html="statusMessage"></span>
					<span v-if="limitReached" class="uls-rewrite_languages-limit-reached">
						{{ $i18n( 'ext-uls-preferred-languages-limit-reached' ).text() }}
					</span>
				</div>
			</template>
			<language-selector
				:is-multiple="true"
				:selectable-languages="selectableLanguages"
				:selected="selectedLanguages"
				:search-api-url="searchApiUrl"
				:placeholder="placeholder"
				:menu-config="menuConfig"
				@update:selected="onUpdateSelected"
			></language-selector>
		</cdx-field>
	</div>
</template>

<script>
const { defineComponent, ref, computed } = require( 'vue' );
const { LanguageSelector } = require( 'mediawiki.languageselector.lookup' );
const { CdxField } = require( '../codex.js' );
const supportedLanguages = require( '../supportedLanguages.json' );
const MAX_LANGUAGES = 10;
const menuConfig = {
	visibleItemLimit: 10
};

module.exports = exports = defineComponent( {
	name: 'PreferredLanguagesTab',
	components: {
		LanguageSelector,
		CdxField
	},
	props: {
		initialLanguages: {
			type: Array,
			default: () => []
		}
	},
	emits: [ 'change' ],
	setup( props, { emit } ) {
		const selectedLanguages = ref( props.initialLanguages );
		const selectableLanguages = ref( supportedLanguages );
		const searchApiUrl = mw.util.wikiScript( 'api' );
		const placeholder = mw.msg( 'ext-uls-preferred-languages-input-placeholder' );

		const limitReached = computed( () => selectedLanguages.value.length >= MAX_LANGUAGES );

		const statusMessage = computed( () => mw.message(
			'ext-uls-preferred-languages-status',
			selectedLanguages.value.length,
			MAX_LANGUAGES
		) );

		const onUpdateSelected = ( newValue ) => {
			if ( newValue.length > MAX_LANGUAGES ) {
				return;
			}
			selectedLanguages.value = newValue;
			emit( 'change', newValue );
		};

		return {
			selectableLanguages,
			selectedLanguages,
			searchApiUrl,
			placeholder,
			limitReached,
			statusMessage,
			onUpdateSelected,
			MAX_LANGUAGES,
			menuConfig
		};
	}
} );
</script>
