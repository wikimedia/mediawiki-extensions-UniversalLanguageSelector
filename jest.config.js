'use strict';

module.exports = {
	rootDir: __dirname,
	clearMocks: true,
	collectCoverage: true,
	collectCoverageFrom: [
		'resources/ext.uls.rewrite/**/*.{js,vue}'
	],
	coveragePathIgnorePatterns: [
		'/resources/ext.uls.rewrite/lib/',
		'/resources/ext.uls.rewrite/dist/'
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
		'^mediawiki\\.languageselector\\.core$': '<rootDir>/tests/jest/mocks/uls-mocks.js',
		'^mediawiki\\.languageselector\\.lookup$': '<rootDir>/tests/jest/mocks/uls-mocks.js'
	},
	testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		customExportConditions: [ 'node', 'node-addons' ]
	},
	testMatch: [
		'<rootDir>/tests/jest/**/*.test.js'
	],
	setupFilesAfterEnv: [
		'<rootDir>/tests/jest/jest.setup.js'
	],
	transform: {
		'^.+\\.vue$': '@vue/vue3-jest',
		'^.+\\.js$': 'babel-jest'
	}
};
