export default {
        darkMode: 'class',
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			animation: {
				'text-gradient': 'text-gradient 1.5s linear infinite',
			},
			keyframes: {
				'text-gradient': {
					to: {
						backgroundPosition: '200% center',
					},
				},
			},
		},
		animation: {
			'pulse-slow': 'pulse 6s infinite cubic-bezier(0.4, 0, 0.6, 1)',
		},
	},
	plugins: [],
}
