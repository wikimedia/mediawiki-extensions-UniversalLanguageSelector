'use strict';

module.exports = {
	clearMocks: true,
	collectCoverage: true,
	collectCoverageFrom: [
		'resources/ext.uls.rewrite/**/*.{js,vue}'
	],
	coverageProvider: 'v8',
	coverageReporters: [
		'text'
	],
	moduleFileExtensions: [
		'js',
		'json',
		'vue'
	],
	moduleNameMapper: {
		'^vue$': '<rootDir>/node_modules/vue',
		'icons.json$': '@wikimedia/codex-icons',
		'mediawiki.codex.typeaheadSearch': '@wikimedia/codex',
		'\\bcodex\\.js$': '@wikimedia/codex',
		'\\blanguage-data\\.json$': '<rootDir>/tests/jest/mocks/language-data.json',
		'^ext\\.uls\\.rewrite\\.entrypoints$': '<rootDir>/resources/ext.uls.rewrite/EntrypointRegistry.js',
		'^mediawiki\\.languageselector\\.core$': '<rootDir>/../../resources/src/mediawiki.languageselector/core.js',
		'^mediawiki\\.languageselector\\.lookup$': '<rootDir>/../../resources/src/mediawiki.languageselector/lookup.js'
	},
	testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		customExportConditions: [ 'node', 'node-addons' ]
	},
	testMatch: [
		'<rootDir>/tests/jest/**/*.test.js'
	],
	transform: {
		'^.+\\.vue$': '@vue/vue3-jest',
		'^.+\\.js$': 'babel-jest'
	}
};
