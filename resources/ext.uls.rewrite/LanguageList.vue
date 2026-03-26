<template>
	<ul class="uls-rewrite__body__language-list" role="listbox">
		<language-item
			v-for="( languageCode, index ) in languageCodes"
			:key="languageCode"
			:code="languageCode"
			:name="languages[languageCode]"
			:is-highlighted="highlightedIndex === ( index + indexOffset )"
			:is-selected="selectedValuesSet.has( languageCode )"
			@select="( ...args ) => $emit( 'select', ...args )"
			@mousemove="$emit( 'highlight', index + indexOffset )"
		>
			<template #default="slotProps">
				<slot name="language-item" :item="slotProps.item"></slot>
			</template>
		</language-item>
	</ul>
</template>

<script>
const { defineComponent } = require( 'vue' );
const LanguageItem = require( './LanguageItem.vue' );

module.exports = defineComponent( {
	name: 'LanguageList',
	components: {
		LanguageItem
	},
	props: {
		languageCodes: {
			type: Array,
			required: true
		},
		languages: {
			type: Object,
			required: true
		},
		highlightedIndex: {
			type: Number,
			default: -1
		},
		indexOffset: {
			type: Number,
			default: 0
		},
		selectedValuesSet: {
			type: Object, // Set
			required: true
		}
	},
	emits: [ 'select', 'highlight' ]
} );
</script>
