/** Registry for managing ULS Entry Points. */

/**
 * @typedef {Object} EntryPoint
 * @property {string} id
 * @property {function(Object):boolean} shouldShow
 * @property {function(Object):(Object|Array<Object>)} getConfig
 */

const EntrypointRegistry = function () {
	let isLocked = false;

	const registry = {
		'missing-languages': [],
		'quick-actions': [],
		'empty-search': [],
		'empty-list': []
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
	 * @throws {Error} If the registry is locked (ULS already mounted).
	 */
	const register = ( type, entryPoint ) => {
		if ( isLocked ) {
			throw new Error(
				`[ULS EntrypointRegistry] Too late! Extension "${ entryPoint.id }"
				tried to register after ULS was mounted. `
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

		registry[ type ].push( entryPoint );
	};

	const getRegisteredEntrypoints = ( type ) => registry[ type ] || [];

	return {
		lock,
		register,
		getRegisteredEntrypoints
	};
};

module.exports = new EntrypointRegistry();
