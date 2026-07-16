'use strict';

const { ref } = require( 'vue' );
const useEntrypointActions = require( '../../../resources/ext.uls.rewrite/composables/useEntrypointActions.js' );

// useEntrypointActions is used inside setup() in production; mock inject()
// to avoid the warning when calling it directly.
jest.mock( 'vue', () => {
	const original = jest.requireActual( 'vue' );
	return Object.assign( {}, original, {
		inject: jest.fn( ( key, defaultValue ) => defaultValue )
	} );
} );

describe( 'useEntrypointActions', () => {
	it( 'shouldShow(context) is called and getConfig(context) is collected', () => {
		const context = ref( { show: true, value: 'A' } );

		const entrypoint1 = {
			shouldShow: ( ctx ) => ctx.show,
			getConfig: ( ctx ) => ( { label: ctx.value } )
		};

		const entrypoint2 = {
			shouldShow: () => false,
			getConfig: () => ( { label: 'B' } )
		};

		// Basic filtering and resolved config
		const actions = useEntrypointActions( [ entrypoint1, entrypoint2 ], context );
		expect( actions.value ).toEqual( [ { label: 'A' } ] );

		// Reactive context update propagation
		context.value = { show: true, value: 'C' };
		expect( actions.value ).toEqual( [ { label: 'C' } ] );

		// shouldShow evaluates to false
		context.value = { show: false, value: 'C' };
		expect( actions.value ).toEqual( [] );
	} );

	it( 'handles null configs and flattens array configs', () => {
		const context = ref( {} );

		const entrypointNull = {
			shouldShow: () => true,
			getConfig: () => null
		};

		const entrypointArray = {
			shouldShow: () => true,
			getConfig: () => [ { label: 'Item 1' }, { label: 'Item 2' } ]
		};

		const entrypointEmptyArray = {
			shouldShow: () => true,
			getConfig: () => []
		};

		const actions = useEntrypointActions(
			[ entrypointNull, entrypointArray, entrypointEmptyArray ],
			context
		);

		expect( actions.value ).toEqual( [
			{ label: 'Item 1' },
			{ label: 'Item 2' }
		] );
	} );
} );
