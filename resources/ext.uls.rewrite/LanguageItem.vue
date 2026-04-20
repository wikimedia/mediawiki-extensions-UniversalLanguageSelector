<template>
	<li
		:lang="!lang ? code : null"
		:dir="!lang ? annotations.dir : null"
		:data-language-code="code"
		class="uls-rewrite__language-item"
		:class="[
			{
				'uls-rewrite__language-item--highlighted': isHighlighted,
				'uls-rewrite__language-item--selected': isSelected
			},
			annotations.classes
		]"
		:aria-selected="isSelected"
		role="option"
		tabindex="-1"
		@click.exact.prevent="$emit( 'select', code, name )"
		@mouseenter="$emit( 'hover' )"
	>
		<slot :item="name" :annotations="annotations">
			{{ name }}
		</slot>
		<span v-if="annotations.description" class="uls-rewrite__language-item--description">
			<bdi>{{ annotations.description }}</bdi>
		</span>
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
		annotations: {
			type: Object,
			default: () => ( { classes: [] } )
		}
	},
	emits: [ 'select', 'hover' ]
} );
</script>
