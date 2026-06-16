'use strict';

let unmountCallback = null;
// Mock vue's onUnmounted hook to capture the cleanup callback
jest.mock( 'vue', () => {
	const original = jest.requireActual( 'vue' );
	return Object.assign( {}, original, {
		onUnmounted: jest.fn( ( cb ) => {
			unmountCallback = cb;
		} )
	} );
} );

// Mock MediaWiki global
let scheduledCallback = null;
let scheduledOptions = null;
global.mw = {
	requestIdleCallback: jest.fn( ( cb, options ) => {
		// capture the callback and options passed by schedule()
		scheduledCallback = cb;
		scheduledOptions = options;
	} )
};

const useProgressiveRender = require( '../../../resources/ext.uls.rewrite/composables/useProgressiveRender.js' );

describe( 'useProgressiveRender', () => {
	beforeEach( () => {
		unmountCallback = null;
		scheduledCallback = null;
		scheduledOptions = null;
		mw.requestIdleCallback.mockClear();
	} );

	it( 'initializes with default limit and does not schedule idle callback', () => {
		const { renderLimit } = useProgressiveRender();

		expect( renderLimit.value ).toBe( 40 );
		expect( mw.requestIdleCallback ).not.toHaveBeenCalled();
	} );

	it( 'initializes with custom limit', () => {
		const { renderLimit } = useProgressiveRender( 15 );

		expect( renderLimit.value ).toBe( 15 );
		expect( mw.requestIdleCallback ).not.toHaveBeenCalled();
	} );

	it( 'does not schedule callback if growTo count is less than or equal to current limit', () => {
		const { growTo, renderLimit } = useProgressiveRender( 40 );

		growTo( 30 );
		expect( renderLimit.value ).toBe( 40 );
		expect( mw.requestIdleCallback ).not.toHaveBeenCalled();

		growTo( 40 );
		expect( renderLimit.value ).toBe( 40 );
		expect( mw.requestIdleCallback ).not.toHaveBeenCalled();
	} );

	it( 'progressively renders in chunks up to target', () => {
		const { growTo, renderLimit } = useProgressiveRender( 40, 25 );

		growTo( 80 );
		expect( renderLimit.value ).toBe( 40 ); // Growth is async via idle callback
		expect( mw.requestIdleCallback ).toHaveBeenCalledTimes( 1 );

		// Run first step (adds chunk of 25)
		const firstCallback = scheduledCallback;
		scheduledCallback = null;
		firstCallback();

		expect( renderLimit.value ).toBe( 65 ); // 40 + 25
		expect( mw.requestIdleCallback ).toHaveBeenCalledTimes( 2 );

		// Run second step (reaches 80 target)
		const secondCallback = scheduledCallback;
		scheduledCallback = null;
		secondCallback();

		expect( renderLimit.value ).toBe( 80 ); // Math.min(65 + 25, 80)
		expect( mw.requestIdleCallback ).toHaveBeenCalledTimes( 2 ); // No more scheduling
		expect( scheduledCallback ).toBeNull();
	} );

	it( 'passes a timeout option to requestIdleCallback and does not re-schedule while a step is already pending', () => {
		const { growTo } = useProgressiveRender( 40, 25 );

		// growTo calls multiple times while the step is still pending
		// it does not queue additional requestIdleCallback calls
		growTo( 41 ); // target 41 > 40 -> schedule
		growTo( 80 ); // target 80 but already in scheduled
		expect( mw.requestIdleCallback ).toHaveBeenCalledTimes( 1 );
		expect( scheduledOptions ).toEqual( { timeout: 200 } );
	} );

	it( 'stops rendering if component is unmounted', () => {
		const { growTo, renderLimit } = useProgressiveRender( 40, 25 );

		growTo( 80 );
		expect( mw.requestIdleCallback ).toHaveBeenCalledTimes( 1 );

		// Trigger unmount cleanup
		expect( unmountCallback ).toBeDefined();
		unmountCallback();

		// Run scheduled callback
		const callback = scheduledCallback;
		callback();

		// Should not change the limit since it is cancelled
		expect( renderLimit.value ).toBe( 40 );
	} );
} );
