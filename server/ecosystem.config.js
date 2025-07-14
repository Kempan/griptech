// ecosystem.config.js - SECURE VERSION
module.exports = {
	apps: [
		{
			name: "griptech-prod",
			script: "dist/src/index.js",
			// instances: 2,
			// exec_mode: "cluster",
			env: {
				NODE_ENV: "production",
				PORT: 80,
			},
			max_memory_restart: "500M",
			min_uptime: "10s",
			max_restarts: 5,
			restart_delay: 4000,

			// Auto restart settings
			watch: false,
			ignore_watch: ["node_modules", "logs"],

			// Source map support
			source_map_support: true,

			// Graceful shutdown
			kill_timeout: 5000,
		},
		{
			// Development configuration
			name: "griptech-dev",
			script: "npm",
			args: "run dev",
			cwd: "./server", // Run from server directory
			env: {
				NODE_ENV: "development",
				PORT: 3001,
			},
			watch: true,
			watch_delay: 1000,
			ignore_watch: ["node_modules", "logs", ".git"],
			instances: 1,
			exec_mode: "fork",
		},
	],
};
