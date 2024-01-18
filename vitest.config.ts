import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 50000,
		deps: {
      inline: [
        '@onflow/flow-js-testing',
      ],
    },
	},
})
