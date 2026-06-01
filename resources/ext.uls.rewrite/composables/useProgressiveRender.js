'use strict';

const { ref, onUnmounted } = require( 'vue' );

/**
 * Progressively raise a render limit so a large list paints its first
 * screenful immediately and then fills in the rest in the background, during
 * idle time, without waiting for the user to scroll.
 *
 * @param {number} [initial=40] Number of rows to render on the first paint.
 * @param {number} [chunk=50] Number of rows to add per idle slice. Kept small
 *   so each render step is a short task that does not freeze input.
 * @return {Object} renderLimit ref plus a growTo() control.
 */
function useProgressiveRender( initial = 40, chunk = 50 ) {
	const renderLimit = ref( initial );
	let target = initial;
	let scheduled = false;
	let cancelled = false;

	function step() {
		scheduled = false;
		if ( cancelled || renderLimit.value >= target ) {
			return;
		}
		renderLimit.value = Math.min( renderLimit.value + chunk, target );
		schedule();
	}

	function schedule() {
		if ( !scheduled && !cancelled && renderLimit.value < target ) {
			scheduled = true;
			// Yield to active input
			mw.requestIdleCallback( step, { timeout: 200 } );
		}
	}

	/**
	 * Schedule rows up to `count` to render over the coming idle slices.
	 *
	 * @param {number} count
	 */
	const growTo = ( count ) => {
		target = Math.max( target, count );
		schedule();
	};

	onUnmounted( () => {
		cancelled = true;
	} );

	return { renderLimit, growTo };
}

module.exports = useProgressiveRender;
