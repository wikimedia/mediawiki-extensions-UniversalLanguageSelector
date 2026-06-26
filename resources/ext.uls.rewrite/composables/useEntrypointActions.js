'use strict';

const { computed, inject } = require( 'vue' );

/**
 * Vue provide/inject key under which a language selector provides a function
 * that closes it. This composable injects it and passes it to entrypoints as
 * `close` in the shouldShow/getConfig context, so an action can close the
 * selector before acting (e.g. before opening another dialog).
 */
const CLOSE_SELECTOR_KEY = 'closeULSDialog';

/**
 * Resolves a list of entrypoints into a flat list of action configs.
 *
 * For each entrypoint, shouldShow(context) is called; if it returns true,
 * getConfig(context) is collected. Null configs and empty-array configs
 * are dropped, and configs returned as arrays are flattened into the
 * result.
 *
 * The context also carries a `close` function (when a language selector
 * provides one) so an action can close the selector before acting, e.g.
 * before opening the language settings dialog.
 *
 * @param {Array<Object>} entrypoints
 * @param {import('vue').Ref<Object>} context Reactive context passed to
 *  shouldShow/getConfig. Use a computed ref so the result re-evaluates
 *  when context changes.
 * @return {import('vue').ComputedRef<Array<Object>>}
 */
module.exports = function useEntrypointActions( entrypoints, context ) {
	const close = inject( CLOSE_SELECTOR_KEY, null );
	return computed( () => {
		const resolvedContext = Object.assign( {}, context.value, { close } );
		return entrypoints
			.filter( ( entryPoint ) => entryPoint.shouldShow( resolvedContext ) )
			.map( ( entryPoint ) => entryPoint.getConfig( resolvedContext ) )
			.filter( ( config ) => config !== null &&
				( Array.isArray( config ) ? config.length > 0 : true ) )
			.reduce( ( acc, config ) => acc.concat( config ), [] );
	} );
};

module.exports.CLOSE_SELECTOR_KEY = CLOSE_SELECTOR_KEY;
