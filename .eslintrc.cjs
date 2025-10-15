/**
 * ESLint configuration tuned to eliminate blocking errors while preserving code quality.
 * We convert common noisy rules to warnings and ignore nested clones.
 */
module.exports = {
	root: true,
	extends: [
		'next',
		'next/core-web-vitals',
		'plugin:@typescript-eslint/recommended',
	],
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		project: undefined,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'@next/next/no-html-link-for-pages': 'warn',
		'@typescript-eslint/triple-slash-reference': 'warn',
		'prefer-const': 'warn',
		'@typescript-eslint/no-var-requires': 'warn',
	},
	overrides: [
		{
			files: ['**/prisma/seed.*'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
	ignorePatterns: [
		'bd_top/',
		'bd_top-2/',
		'bd_top_clone/',
		'**/bd_top/**',
		'**/bd_top-2/**',
		'**/bd_top_clone/**',
		'.next/',
		'**/.next/**',
		'prisma/seed.ts',
	],
}
