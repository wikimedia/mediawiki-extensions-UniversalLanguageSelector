<template>
	<div class="uls-rewrite__header__panel" @click.stop>
		<cdx-button
			weight="quiet"
			:aria-label="$i18n( 'ext-uls-open-language-selector' )"
			@click="$emit( 'back' )"
		>
			<cdx-icon :icon="cdxIconArrowPrevious"></cdx-icon>
		</cdx-button>
		<span class="uls-rewrite__header__panel-title">
			{{ title }}
		</span>
		<cdx-button
			v-if="isMobile"
			weight="quiet"
			:aria-label="$i18n( 'ext-uls-close-button-label' )"
			@click="$emit( 'close' )">
			<cdx-icon :icon="cdxIconClose"></cdx-icon>
		</cdx-button>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../codex.js' );
const { cdxIconArrowPrevious, cdxIconClose } = require( '../icons.json' );

module.exports = defineComponent( {
	name: 'LanguageSelectorPanelHeader',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		title: {
			type: String,
			required: true
		},
		isMobile: {
			type: Boolean,
			default: false
		}
	},
	emits: [ 'back', 'close' ],
	setup() {
		return {
			cdxIconArrowPrevious,
			cdxIconClose
		};
	}
} );
</script>
