# UniversalLanguageSelector component

The `UniversalLanguageSelector` (ULS) component is a Vue-based interface for selecting languages, with additional features such as search with typeahead, suggested languages, and extensible entry points for additional actions.

It is part of the UniversalLanguageSelector extension and is designed to work with the Codex design system.

## Contents
* [Vue.js usage](#vuejs-usage)
    * [Props](#props)
    * [Events](#events)
    * [Slots](#slots)
    * [The mode prop](#the-mode-prop)
    * [Language annotations](#language-annotations)
* [JavaScript usage (The "Just JS" approach)](#javascript-usage-the-just-js-approach)
    * [Configuration](#configuration)
    * [Example](#example)
* [Entry points and extensibility](#entry-points-and-extensibility)

## Vue.js usage

The component can be used directly in other Vue applications. To use it, you must first ensure the `ext.uls.rewrite` module is loaded and then `require` it.

```javascript
mw.loader.using( [ 'ext.uls.rewrite' ] ).then( () => {
    const { UniversalLanguageSelector } = require( 'ext.uls.rewrite' );

    // You can now register it in your Vue component:
    // components: {
    //     UniversalLanguageSelector
    // }
} );
```

### Props

| Prop | Type | Default | Description                                                                                                            |
|------|------|---------|------------------------------------------------------------------------------------------------------------------------|
| `triggerElement` | `HTMLElement` | **Required** | The element that triggers the ULS to open/close. Used for positioning.                                                 |
| `visible` | `boolean` | `false` | Whether the selector is visible.                                                                                       |
| `selectableLanguages` | `Object` | `null` | Map of language codes to autonyms. If `null`, the initial list will be empty, and languages will only appear once searched for. |
| `selected` | `Array` | `[]` | List of currently selected language codes.                                                                             |
| `placeholder` | `string` | `null` | Placeholder text for the search input.                                                                                 |
| `searchApiUrl` | `string` | `null` | Optional API URL for server-side language search.                                                                      |
| `hideSuggestedLanguages`| `boolean` | `false` | Whether to hide the suggested languages section.                                                                       |
| `suggestedLanguages` | `Array` | `null` | List of language codes to show as suggestions.                                                                         |
| `displayLanguageCode` | `string` | `''` | Language code for the selector's items.                                                                                |
| `languageAnnotations` | `Object` | `{}` | Annotations for language items, keyed by language code. See [Language annotations](#language-annotations) for details. |
| `mode` | `string` | **Required** | The mode for ULS: `'interface'` or `'content'`.                                                                        |
| `floatingOptions` | `Object` | `{ placement: 'bottom-end' }` | Overrides for Floating UI configuration.                                                                               |

### Events

| Event | Arguments | Description |
|-------|-----------|-------------|
| `close` | None | Emitted when the selector should be closed. |
| `select` | `{ code: string, value: string }` | Emitted when a language is selected. |

### Slots

| Slot Name | Props | Description |
|-----------|-------|-------------|
| `language-item` | `{ item: string, annotations: Object }` | Customizes the rendering of each language item in the list. |

### The `mode` prop

The `mode` prop determines the context in which the ULS is being used and affects which entry points and features are available.

*   **`interface`**: Used when the selector is for changing the user interface language (e.g., menus, buttons, system messages). This is typical for the personal language settings in the top toolbar.
*   **`content`**: Used when the selector is for choosing the language of the page content (e.g., selecting which language version of an article to read). This mode enables additional entry points like "Missing languages" which helps users find or request content that isn't yet available in their preferred language.

In most cases, the `interface` mode is the correct choice.

### Language annotations

The `languageAnnotations` prop allows you to provide additional metadata and styling for specific languages in the list. It is an object where the keys are language codes and the values are objects with the following properties:

| Property | Type        | Description |
|----------|-------------|-------------|
| `classes` | `string\|Array` | CSS classes to apply to the language item element. |
| `description` | `string`    | A secondary label or description shown below the language name. |
| `dir` | `string`    | Text direction for the language item (`'ltr'` or `'rtl'`). |
| *Custom* | `any`       | Any additional properties will be preserved and passed to the `language-item` slot. |

Example of passing custom data to a slot:
```javascript
// Configuration
{
    languageAnnotations: {
        fr: {
            customStatus: 'Beta',
            classes: 'is-beta'
        }
    }
}

// In your Vue template
<template #language-item="{ item, annotations }">
    <span>{{ item }}</span>
    <span v-if="annotations.customStatus" class="badge">
        {{ annotations.customStatus }}
    </span>
</template>
```
---
## JavaScript usage (The "Just JS" approach)

The `createUniversalLanguageSelector` factory function can be used to create an instance of the language selector. It handles creating the Vue application and provides a simple interface to interact with it.

### Configuration

The `createUniversalLanguageSelector` function accepts a `config` object with the following properties:

*   `triggerElement`: (Required) Element that triggers the ULS.
*   `mode`: (Required) Either `'interface'` or `'content'`.
*   `selectableLanguages`: (Optional) Map of language codes to autonyms.
*   `selected`: (Optional) Array of selected language codes.
*   `placeholder`: (Optional) Search input placeholder.
*   `displayLanguageCode`: (Optional) Language code for the selector's items.
*   `languageAnnotations`: (Optional) Annotations (CSS classes) for language items.
*   `onSelect`: (Optional) Callback function when a language is selected.
*   `onClose`: (Optional) Callback function when the ULS is closed.
*   `floatingOptions`: (Optional) Floating UI configuration.
*   `slots`: (Optional) Vue slots to customize the ULS content.

### Example

```javascript
mw.loader.using( [ 'ext.uls.rewrite' ] ).then( () => {
    const { createUniversalLanguageSelector } = require( 'ext.uls.rewrite' );

    const mountPoint = document.createElement( 'div' );
    document.body.appendChild( mountPoint );

    const app = createUniversalLanguageSelector( {
        triggerElement: document.getElementById( 'my-trigger' ),
        mode: 'interface',
        onSelect: ( language ) => {
            console.log( 'Selected language:', language.code );
        }
    } );

    const ulsVm = app.mount( mountPoint );

    // You can control the ULS using the VM methods:
    ulsVm.toggle(); // Toggles the visibility of the selector.
    ulsVm.close();  // Closes the selector and triggers the onClose callback.
} );
```

---
## Entry points and extensibility

The `UniversalLanguageSelector` component is extensible through the `EntrypointRegistry`. This allows other extensions to register custom actions or information panels within the ULS interface.

Common entry point types include:
*   `QUICK_ACTIONS`: Actions shown at the bottom of the selector.
*   `MISSING_CONTENT_LANGUAGES`: Shown when content is missing in certain languages.
*   `EMPTY_SEARCH`: Shown when no search results are found.
*   `EMPTY_LIST`: Shown when the language list is empty.

For detailed documentation on how to register and use entry points, please refer to the [Entry points documentation](docs/Entrypoints.md).
