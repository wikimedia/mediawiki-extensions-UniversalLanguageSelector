<template>
	<li
		:lang="!lang ? code : null"
		:data-language-code="code"
		class="uls-rewrite__language-item"
		:class="[
			{
				'uls-rewrite__language-item--highlighted': isHighlighted,
				'uls-rewrite__language-item--selected': isSelected
			},
			customClasses
		]"
		:aria-selected="isSelected"
		role="option"
		tabindex="-1"
		@click="$emit( 'select', code, name )"
		@mouseenter="$emit( 'hover' )"
	>
		<slot :item="name">
			{{ name }}
		</slot>
	</li>
</template>

<script>
const { defineComponent } = require( 'vue' );

module.exports = exports = defineComponent( {
	name: 'LanguageItem',
	props: {
		code: {
			type: String,
			required: true
		},
		name: {
			type: [ String, Object ],
			required: true
		},
		lang: {
			type: String,
			default: ''
		},
		isHighlighted: {
			type: Boolean,
			default: false
		},
		isSelected: {
			type: Boolean,
			default: false
		},
		customClasses: {
			type: [ String, Array, Object ],
			default: () => ( [] )
		}
	},
	emits: [ 'select', 'hover' ]
} );
</script>
