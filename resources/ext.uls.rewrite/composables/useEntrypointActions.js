'use strict';

const { computed } = require( 'vue' );

/**
 * Resolves a list of entrypoints into a flat list of action configs.
 *
 * For each entrypoint, shouldShow(context) is called; if it returns true,
 * getConfig(context) is collected. Null configs and empty-array configs
 * are dropped, and configs returned as arrays are flattened into the
 * result.
 *
 * @param {Array<Object>} entrypoints
 * @param {import('vue').Ref<Object>} context Reactive context passed to
 *  shouldShow/getConfig. Use a computed ref so the result re-evaluates
 *  when context changes.
 * @return {import('vue').ComputedRef<Array<Object>>}
 */
module.exports = function useEntrypointActions( entrypoints, context ) {
	return computed( () => entrypoints
		.filter( ( entryPoint ) => entryPoint.shouldShow( context.value ) )
		.map( ( entryPoint ) => entryPoint.getConfig( context.value ) )
		.filter( ( config ) => config !== null &&
			( Array.isArray( config ) ? config.length > 0 : true ) )
		.reduce( ( acc, config ) => acc.concat( config ), [] )
	);
};
