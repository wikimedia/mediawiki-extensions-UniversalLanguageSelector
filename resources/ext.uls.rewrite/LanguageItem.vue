<template>
	<li
		:lang="!lang ? code : null"
		:data-language-code="code"
		class="uls-rewrite__language-item"
		:class="[
			{
				'uls-rewrite__language-item--highlighted': isHighlighted,
				'uls-rewrite__language-item--selected': isSelected,
				'uls-rewrite__language-item--unavailable': !isAvailable
			},
			annotations.classes
		]"
		:aria-selected="isSelected"
		role="option"
		tabindex="-1"
		@click.exact.prevent="select"
		@mouseenter="$emit( 'hover' )"
	>
		<span
			class="uls-rewrite__language-item-title"
			:dir="!lang ? annotations.dir : null"
		>
			<slot :item="displayName" :annotations="annotations" :is-available="isAvailable">
				{{ displayName }}
			</slot>
		</span>
		<span
			v-if="annotations.description"
			class="uls-rewrite__language-item--description"
			:dir="!lang ? annotations.dir : null"
		>
			{{ annotations.description }}
		</span>
	</li>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );

module.exports = exports = defineComponent( {
	name: 'LanguageItem',
	props: {
		code: {
			type: String,
			required: true
		},
		name: {
			type: [ String, Object ],
			required: false
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
		unavailableLanguagesSet: {
			type: Object, // Set
			default: () => new Set()
		},
		annotations: {
			type: Object,
			default: () => ( { classes: [] } )
		}
	},
	emits: [ 'select', 'hover' ],
	setup( props, { emit } ) {
		const isAvailable = computed( () => !props.unavailableLanguagesSet.has( props.code ) );

		const displayName = computed( () => props.name ||
			$.uls.data.getAutonym( props.code ) ||
			props.code
		);

		const select = () => {
			if ( isAvailable.value ) {
				emit( 'select', props.code, displayName.value );
			}
		};

		return {
			select,
			isAvailable,
			displayName
		};
	}
} );
</script>
