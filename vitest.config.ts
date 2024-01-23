import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 500000,
		deps: {
			inline: [
				'@onflow/flow-js-testing',
			],
		},
		poolOptions: {
			threads: {
				singleThread: true
			}
		}
	},
})
