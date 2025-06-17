import type { Config } from 'jest';

const config: Config = {
	verbose: true,
	rootDir: '.',
	moduleNameMapper: {
		'@/(.*)': '<rootDir>/src/$1',
	},
	testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
	preset: 'ts-jest',
};

export default config;
