<template>
	<ul
		:id="listboxId || null"
		class="uls-rewrite__body__language-list"
		role="listbox"
		:aria-label="listboxLabel || null"
		:lang="lang || null"
		:dir="dir || null"
	>
		<li
			v-for="( code, index ) in languageCodes"
			:id="optionId( index )"
			:key="code"
			:lang="!lang ? code : null"
			:data-language-code="code"
			class="uls-rewrite__language-item"
			:class="[
				{
					'uls-rewrite__language-item--highlighted': isHighlighted( index ),
					'uls-rewrite__language-item--selected': selectedValuesSet.has( code ),
					'uls-rewrite__language-item--unavailable': unavailableLanguagesSet.has( code )
				},
				annotationsByCode[ code ].classes
			]"
			:aria-selected="selectedValuesSet.has( code )"
			role="option"
			tabindex="-1"
			@click.exact.prevent="select( code )"
			@mouseenter="$emit( 'highlight', index + indexOffset )"
		>
			<span
				class="uls-rewrite__language-item-title"
				:dir="!lang ? annotationsByCode[ code ].dir : null"
			>
				<slot
					name="language-item"
					:item="displayNames[ code ]"
					:annotations="annotationsByCode[ code ]"
					:is-available="!unavailableLanguagesSet.has( code )"
				>
					{{ displayNames[ code ] }}
				</slot>
			</span>
			<span
				v-if="annotationsByCode[ code ].description"
				class="uls-rewrite__language-item--description"
				:dir="!lang ? annotationsByCode[ code ].dir : null"
			>
				{{ annotationsByCode[ code ].description }}
			</span>
		</li>
	</ul>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );

// Shared empty object so codes without annotations don't allocate per render.
const EMPTY_ANNOTATIONS = Object.freeze( {} );

module.exports = defineComponent( {
	name: 'LanguageList',
	props: {
		languageCodes: {
			type: Array,
			required: true
		},
		languages: {
			type: Object,
			required: true
		},
		lang: {
			type: String,
			default: ''
		},
		dir: {
			type: String,
			default: ''
		},
		highlightedIndex: {
			type: Number,
			default: -1
		},
		indexOffset: {
			type: Number,
			default: 0
		},
		// Base id for option ids. Each option's id is derived from this plus its
		// global index, Used by the combobox input for aria-activedescendant.
		idPrefix: {
			type: String,
			default: ''
		},
		// Id for this section's listbox, referenced by the input's aria-controls.
		listboxId: {
			type: String,
			default: ''
		},
		// Accessible name for the listbox
		listboxLabel: {
			type: String,
			default: ''
		},
		selectedValuesSet: {
			type: Object, // Set
			required: true
		},
		unavailableLanguagesSet: {
			type: Object, // Set
			default: () => new Set()
		},
		languageAnnotations: {
			type: Object,
			default: () => ( {} )
		}
	},
	emits: [ 'select', 'highlight' ],
	setup( props, { emit } ) {
		// Resolve display names once for the whole list instead of in a
		// per-item computed. Falls back to the autonym, then the code itself.
		const displayNames = computed( () => {
			const map = {};
			for ( const code of props.languageCodes ) {
				map[ code ] = props.languages[ code ] ||
					$.uls.data.getAutonym( code ) ||
					code;
			}
			return map;
		} );

		// Resolve each code's annotations once per data change, mirroring
		// displayNames, instead of calling a helper repeatedly per row.
		const annotationsByCode = computed( () => {
			const map = {};
			for ( const code of props.languageCodes ) {
				map[ code ] = props.languageAnnotations[ code ] || EMPTY_ANNOTATIONS;
			}
			return map;
		} );

		const isHighlighted = ( index ) => props.highlightedIndex === ( index + props.indexOffset );

		const optionId = ( index ) => props.idPrefix ?
			`${ props.idPrefix }-option-${ index + props.indexOffset }` :
			null;

		const select = ( code ) => {
			if ( props.unavailableLanguagesSet.has( code ) ) {
				return;
			}
			emit( 'select', code, displayNames.value[ code ] );
		};

		return {
			displayNames,
			annotationsByCode,
			isHighlighted,
			optionId,
			select
		};
	}
} );
</script>
