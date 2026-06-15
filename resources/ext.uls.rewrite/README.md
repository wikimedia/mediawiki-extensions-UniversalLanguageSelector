# UniversalLanguageSelector component

The `UniversalLanguageSelector` (ULS) component is a Vue-based interface for selecting languages, with additional features such as search with typeahead, suggested languages, and extensible entry points for additional actions.

It is part of the UniversalLanguageSelector extension and is designed to work with the Codex design system.

## Contents
* [Module map](#module-map)
* [Vue.js usage](#vuejs-usage)
    * [Props](#props)
    * [Events](#events)
    * [Slots](#slots)
    * [The mode prop](#the-mode-prop)
    * [Language annotations](#language-annotations)
* [JavaScript usage (The "Just JS" approach)](#javascript-usage-the-just-js-approach)
    * [Configuration](#configuration)
    * [Example](#example)
    * [Instance methods](#instance-methods)
* [Responsive behavior](#responsive-behavior)
* [Keyboard interactions](#keyboard-interactions)
* [Positioning (Floating UI)](#positioning-floating-ui)
* [Styling and CSS namespace](#styling-and-css-namespace)
    * [Language Item Markers](#language-item-markers)
* [Entry points and extensibility](#entry-points-and-extensibility)

## Module map

This directory contributes four ResourceLoader modules. They are intentionally split so that callers only load what they need:

| Module | Defined in | Contents | When to depend on it |
|--------|------------|----------|----------------------|
| `ext.uls.rewrite` | `extension.json` | The Vue component, the `createUniversalLanguageSelector` factory, the Codex components used by the UI, language data, icons, and the bundled Floating UI. | When you actually need to mount the language selector. Pulls in Vue + Codex, so it's the heaviest of the bunch. |
| `ext.uls.rewrite.entrypoints` | `EntrypointRegistry.js` | The standalone entry-point registry only (`ENTRYPOINT_TYPE`, `ULS_MODE`, `register`, `getRegisteredEntrypoints`, `lock`). | When your extension needs to **register** an entry point. It has no Vue / Codex dependencies, so it can be loaded very early during page setup (before ULS mounts and locks the registry). |
| `ext.uls.rewrite.languagesettings` | `LanguageSettings.js` | Registers the "Language settings" quick action that opens the legacy ULS settings dialog. | Loaded by the host page so that the settings action is available out of the box. Depends only on `ext.uls.rewrite.entrypoints`; the legacy settings dialog is loaded lazily via `mw.loader.using` when the action is invoked. |
| `ext.uls.preferredlanguages` | (defined elsewhere in `extension.json`) | Bundles `PreferredLanguagesTab.vue`, which renders the unified `LanguageSelector` component (from `mediawiki.languageselector.lookup`) in multi-select mode. Used by the Preferences page. Lives in this directory but is **not** part of the `ext.uls.rewrite` module. | When rendering the "Preferred languages" tab on Special:Preferences. |

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
| `placeholder` | `string` | `null` | Placeholder text for the search input. When `null`, falls back to the localized `ext-uls-placeholder-search` message. |
| `hideActiveLanguages`| `boolean` | `false` | Whether to hide current active languages from the suggested and all-languages lists. This does not hide languages from the preferred languages list. |
| `searchApiUrl` | `string` | `null` | Optional API URL for server-side language search. |
| `displayLanguageCode` | `string` | `''` | Language code used to render language item labels. When empty, items are rendered using each language's autonym. |
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
| `language-item` | `{ item: string|Object, annotations: Object, isAvailable: boolean }` | Customizes the rendering of each language item in the list. |

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
<template #language-item="{ item, annotations, isAvailable }">
    <span :class="{ 'is-unavailable': !isAvailable }">{{ item }}</span>
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
*   `selected`: (Optional) Array of selected language codes. The wrapper tracks this internally; mutate it from outside via the `updateSelected()` instance method (see below).
*   `visible`: (Optional) Whether the ULS should be visible on mount. Defaults to `true`. Note that this differs from the underlying `visible` prop, which defaults to `false` — the factory opens the selector immediately so that the typical "create and show" call site stays a one-liner.
*   `placeholder`: (Optional) Search input placeholder. When omitted, falls back to the localized `ext-uls-placeholder-search` message.
*   `displayLanguageCode`: (Optional) Language code used to render language item labels. Defaults to each language's autonym.
*   `languageAnnotations`: (Optional) Annotations (CSS classes, descriptions, custom data) for language items, keyed by language code.
*   `hideActiveLanguages`: (Optional) Whether to hide current active languages from the suggested and all-languages lists (does not hide from preferred languages).
*   `onSelect`: (Optional) Callback function when a language is selected. Receives `{ code, value }`.
*   `onClose`: (Optional) Callback function when the ULS is closed.
*   `floatingOptions`: (Optional) Floating UI configuration overrides (e.g. `{ placement: 'bottom-start' }`). See [Positioning (Floating UI)](#positioning-floating-ui).
*   `slots`: (Optional) Vue slots to customize the ULS content (e.g. a `language-item` render function).

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

    // You can control the ULS using the VM methods — see "Instance methods" below.
    ulsVm.toggle();
} );
```

### Instance methods

The object returned by `app.mount( … )` exposes the following methods:

| Method | Description |
|--------|-------------|
| `toggle()` | Toggles the visibility of the selector. If currently visible, it will be closed (and `onClose` fired); otherwise it is shown. |
| `close()` | Closes the selector and triggers the `onClose` callback. |
| `select( language )` | Programmatically dispatches a selection. Closes the selector and invokes the `onSelect` callback with the given `language` object (`{ code, value }`). Useful when an external UI element should behave as if the user had picked a language from the list. |
| `updateSelected( newSelected )` | Replaces the wrapper's tracked list of selected language codes. Call this after the parent application's selection state changes so that features such as `hideActiveLanguages` and the "active language" highlight stay in sync. |

---
## Responsive behavior

The selector adapts to the viewport width. When `window.innerWidth` is below `768px`, the component switches to a mobile layout:

*   The popup is rendered as a full-screen modal (`aria-modal="true"`) instead of being positioned relative to the trigger element.
*   A header with a title and a close button is shown above the search input.
*   Floating UI positioning is bypassed in this mode.

The viewport width is observed via a `resize` listener, so the layout will switch on the fly if the window crosses the threshold while the selector is open.

## Keyboard interactions

The selector ships with full keyboard support out of the box:

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move the highlight up/down through the visible language list. The highlighted item is auto-scrolled into view. |
| `Enter` | Select the currently highlighted item. If nothing is highlighted but an autocomplete suggestion is showing, the first list item is selected. If the search query exactly matches a known language code, that language is selected. If only a single search result remains, it is selected. |
| `Esc` | Close the selector (emits the `close` event / triggers the `onClose` callback). |
| `Tab` or `→` | Accept the ghosted autocomplete suggestion, replacing the search input contents with the completed language name. `→` only accepts when the cursor is at the end of the input. |

## Positioning (Floating UI)

The popup is positioned with a copy of [Floating UI](https://floating-ui.com/) bundled at `dist/floating-ui.js` (the file is shipped with the module to avoid runtime dependencies on an external package).

By default, the component uses these middleware:

*   `offset( 8 )` — 8px gap between the trigger element and the popup.
*   `flip()` — flips the popup to the opposite side when there is not enough room in the configured placement.
*   `shift()` — shifts the popup along the main axis to keep it inside the viewport.

The default placement is `'bottom-end'`. Pass `floatingOptions` to override placement or merge additional Floating UI configuration:

```javascript
floatingOptions: {
    placement: 'bottom-start'
}
```

Note that positioning is only applied in desktop mode; on mobile the popup is rendered as a full-screen modal (see [Responsive behavior](#responsive-behavior)).

## Styling and CSS namespace

Although the component itself is named `UniversalLanguageSelector`, every CSS class it emits uses the **`uls-rewrite`** BEM prefix (e.g. `.uls-rewrite`, `.uls-rewrite__header`, `.uls-rewrite__language-item`, `.uls-rewrite--mobile`). Use this prefix when writing site- or extension-level overrides, and prefer extending existing modifiers (e.g. the auto-applied density modifiers `uls-rewrite--density-low|medium|high`) over targeting deep selectors.

### Language Item Markers

The language selector supports adding markers (icons, badges, progress dots) to language items through CSS. Items support both start and end markers simultaneously without text shift or wrap-around.

Markers are placed in fixed-width gutters (20px by default) on either side of the language name and description.

Feel free to add an appropriate `margin-top` to align the marker with the text baseline.

#### 1. Markers at the Start (e.g. Featured Article stars)

Use the `::before` pseudo-element.

Example for a custom start marker:
```css
.uls-rewrite__language-item.my-badge::before {
    content: "";
    width: 12px;
    height: 12px;
    background-image: url( path/to/icon.svg );
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    /* Optional: add margin-top if the icon isn't perfectly balanced with text baseline */
}
```

#### 2. Markers at the End (e.g. Translate progress dots)

Use the `::after` pseudo-element.

Example:
```css
.uls-rewrite__language-item.my-extension-progress::after {
    content: "";
    width: 12px;
    height: 12px;
    background-color: green;
    border-radius: 50%;
}
```

#### 3. Both Markers

You can combine both markers on a single item.

Example:
```css
.uls-rewrite__language-item.featured-and-incomplete::before {
    content: "";
    width: 12px;
    height: 12px;
    background-image: url( path/to/star.svg );
    background-size: contain;
}

.uls-rewrite__language-item.featured-and-incomplete::after {
    content: "";
    width: 8px;
    height: 8px;
    background-color: orange;
    border-radius: 50%;
}
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

---
## Testing

The ULS rewrite code is covered by Jest unit tests.

### Running the tests

To run the entire extension test suite, including Grunt linters and Jest tests:
```bash
npm test
```

To run only the Jest unit tests:
```bash
npm run jest
```

To run a specific test suite (e.g., progressive render tests):
```bash
npm run jest -- tests/jest/composables/useProgressiveRender.test.js
```