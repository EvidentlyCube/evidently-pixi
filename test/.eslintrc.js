module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['plugin:@typescript-eslint/recommended'],
	rules: {
		"@typescript-eslint/indent": ["error", 'tab'],
		"@typescript-eslint/no-explicit-any": [0],
		"@typescript-eslint/explicit-function-return-type": [0],
		"@typescript-eslint/no-inferrable-types": [0],
		"@typescript-eslint/no-empty-function": [0],
	}
};