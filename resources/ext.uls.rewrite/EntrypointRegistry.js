/** Registry for managing ULS Entry Points. */

/**
 * @typedef {Object} EntryPoint
 * @property {string} id
 * @property {function(Object):boolean} shouldShow
 * @property {function(Object):(Object|Array<Object>)} getConfig
 */

const EntrypointRegistry = function () {
	let isLocked = false;

	const createTypeRegistry = () => ( {
		interface: [],
		content: []
	} );

	const registry = {
		'missing-languages': createTypeRegistry(),
		'quick-actions': createTypeRegistry(),
		'empty-search': createTypeRegistry(),
		'empty-list': createTypeRegistry()
	};

	/**
	 * Locks the registry.
	 * To be called by the ULS component when it mounts.
	 */
	const lock = () => {
		isLocked = true;
	};

	/**
	 * Register a new entry point.
	 *
	 * @param {string} type
	 * @param {EntryPoint} entryPoint
	 * @param {Array<string>|string} modes Modes for which this entry point should be
	 * registered. Valid values: 'interface', 'content'.
	 * @throws {Error} If the registry is locked (ULS already mounted).
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

		if ( !registry[ type ] ) {
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
			if ( !registry[ type ][ mode ] ) {
				throw new Error(
					`[ULS EntrypointRegistry] Invalid mode "${ mode }" for entry point "${ entryPoint.id }".`
				);
			}

			registry[ type ][ mode ].push( entryPoint );
		} );
	};

	/**
	 * Get registered entry points for a given type and mode.
	 *
	 * @param {string} type
	 * @param {string} mode
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
		getRegisteredEntrypoints
	};
};

module.exports = new EntrypointRegistry();
