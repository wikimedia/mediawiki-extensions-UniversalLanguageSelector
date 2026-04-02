/**
 * Registry for managing ULS (Universal Language Selector) Entry Points.
 *
 * This registry allows different components or extensions to register themselves
 * as entry points in various types of the ULS interface (e.g., quick actions,
 * missing languages, empty search results). Entry points can be registered
 * for specific modes (interface or content).
 */

/**
 * @typedef {Object} EntryPoint
 * @property {string} id Unique identifier for the entry point.
 * @property {function(Object):boolean} shouldShow Function that returns true if the entry
 *  point should be displayed. It receives the ULS state/props as an argument.
 * @property {function(Object):(Object|Array<Object>)} getConfig Function that returns the
 *  configuration for the entry point (e.g., label, icon, handler).
 */

/**
 * Constants for the entry point types.
 *
 * @enum {string}
 */
const ENTRYPOINT_TYPE = Object.freeze( {
	/**
	 * Type for entry points related to missing content languages.
	 * Only available in 'content' mode.
	 */
	MISSING_CONTENT_LANGUAGES: 'missing-content-languages',
	/** Type for quick actions at the bottom of the language selector. */
	QUICK_ACTIONS: 'quick-actions',
	/** Type for entry points shown when no search results are found. */
	EMPTY_SEARCH: 'empty-search',
	/** Type for entry points shown when the language list is empty. */
	EMPTY_LIST: 'empty-list'
} );

/**
 * Constants for the ULS modes.
 *
 * @enum {string}
 */
const ULS_MODE = Object.freeze( {
	/** Mode used when ULS is for content language selection. */
	CONTENT: 'content',
	/** Mode used when ULS is for interface language selection. */
	INTERFACE: 'interface'
} );

const EntrypointRegistry = function () {
	let isLocked = false;

	const allModes = Object.values( ULS_MODE );

	/** @type {Object<string, string[]>} */
	const allowedModesByType = {
		[ ENTRYPOINT_TYPE.MISSING_CONTENT_LANGUAGES ]: [ ULS_MODE.CONTENT ],
		[ ENTRYPOINT_TYPE.QUICK_ACTIONS ]: allModes,
		[ ENTRYPOINT_TYPE.EMPTY_SEARCH ]: allModes,
		[ ENTRYPOINT_TYPE.EMPTY_LIST ]: allModes
	};

	/** @type {Object<string, Object<string, EntryPoint[]>>} */
	const registry = {};

	/**
	 * Locks the registry to prevent further registrations.
	 * To be called by the ULS component when it mounts.
	 */
	const lock = () => {
		isLocked = true;
	};

	/**
	 * Register a new entry point.
	 *
	 * @example
	 * EntrypointRegistry.register(
	 *   EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
	 *   { id: 'my-action', shouldShow: () => true, getConfig: () => ({ ... }) },
	 *   [ EntrypointRegistry.ULS_MODE.CONTENT ]
	 * );
	 *
	 * @param {string} type Type for which this entry point should be registered.
	 *  Use the EntrypointRegistry.ENTRYPOINT_TYPE constant for this.
	 * @param {EntryPoint} entryPoint
	 * @param {Array<string>|string} modes Modes for which this entry point should be
	 * registered. Use the EntrypointRegistry.ULS_MODE constants.
	 * @throws {Error} If the registry is locked (ULS already mounted).
	 * @throws {Error} If type or mode is invalid.
	 * @throws {Error} If a mode is not supported by the specified type.
	 */
	const register = ( type, entryPoint, modes ) => {
		if ( isLocked ) {
			throw new Error(
				`[ULS EntrypointRegistry] Too late! Extension "${ entryPoint.id }"
				tried to register after ULS was mounted. `
			);
		}

		if ( !modes || ( Array.isArray( modes ) && modes.length === 0 ) ) {
			throw new Error(
				`[ULS EntrypointRegistry] Entry point "${ entryPoint.id }" in "${ type }"
				must specify at least one mode.`
			);
		}

		if ( !entryPoint.id || typeof entryPoint.id !== 'string' ) {
			throw new Error(
				`[ULS EntrypointRegistry] Entry point in "${ type }" missing valid 'id'. Should be a non-empty string.`
			);
		}

		if ( !allowedModesByType[ type ] ) {
			throw new Error(
				`[ULS EntrypointRegistry] Invalid type "${ type }" for entry point "${ entryPoint.id }".`
			);
		}

		if ( typeof entryPoint.shouldShow !== 'function' || typeof entryPoint.getConfig !== 'function' ) {
			throw new Error(
				`[ULS EntrypointRegistry] Entry point "${ entryPoint.id }" in "${ type }"
				must have 'shouldShow' and 'getConfig' methods.`
			);
		}

		const modesArray = Array.isArray( modes ) ? modes : [ modes ];

		modesArray.forEach( ( mode ) => {
			if ( !allowedModesByType[ type ].includes( mode ) ) {
				throw new Error(
					`[ULS EntrypointRegistry] Mode "${ mode }" is not supported for type "${ type }" (entry point "${ entryPoint.id }").`
				);
			}

			if ( !registry[ type ] ) {
				registry[ type ] = {};
			}

			if ( !registry[ type ][ mode ] ) {
				registry[ type ][ mode ] = [];
			}

			registry[ type ][ mode ].push( entryPoint );
		} );
	};

	/**
	 * Get registered entry points for a given type and mode.
	 *
	 * @param {string} type Use EntrypointRegistry.ENTRYPOINT_TYPE.
	 * @param {string} mode Use EntrypointRegistry.ULS_MODE.
	 * @return {Array<EntryPoint>}
	 */
	const getRegisteredEntrypoints = ( type, mode ) => {
		if ( !registry[ type ] || !registry[ type ][ mode ] ) {
			return [];
		}

		return registry[ type ][ mode ];
	};

	return {
		lock,
		register,
		getRegisteredEntrypoints,
		ENTRYPOINT_TYPE,
		ULS_MODE
	};
};

module.exports = new EntrypointRegistry();
