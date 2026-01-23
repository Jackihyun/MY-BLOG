/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			'pretendard-regular': [
  				'Pretendard-Regular',
  				'sans-serif'
  			],
  			'pretendard-semibold': [
  				'Pretendard-Semibold',
  				'sans-serif'
  			],
  			'pretendard-bold': [
  				'Pretendard-Bold',
  				'sans-serif'
  			],
  			'roboto-regular': [
  				'Roboto-Regular',
  				'sans-serif'
  			],
  			'roboto-medium': [
  				'Roboto-Medium',
  				'sans-serif'
  			],
  			'roboto-bold': [
  				'Roboto-Bold',
  				'sans-serif'
  			]
  		},
  		typography: '(theme) => ({\r\n        DEFAULT: {\r\n          css: {\r\n            maxWidth: "none",\r\n            color: theme("colors.gray.700"),\r\n            a: {\r\n              color: theme("colors.blue.500"),\r\n              "&:hover": {\r\n                color: theme("colors.blue.600"),\r\n              },\r\n            },\r\n            "h1, h2, h3, h4": {\r\n              scrollMarginTop: "80px",\r\n            },\r\n            code: {\r\n              backgroundColor: theme("colors.gray.100"),\r\n              padding: "0.25rem 0.5rem",\r\n              borderRadius: "0.25rem",\r\n              fontWeight: "400",\r\n            },\r\n            "code::before": {\r\n              content: '"',\r\n            },\r\n            "code::after": {\r\n              content: '"',\r\n            },\r\n            pre: {\r\n              backgroundColor: theme("colors.gray.900"),\r\n              code: {\r\n                backgroundColor: "transparent",\r\n                padding: 0,\r\n              },\r\n            },\r\n          },\r\n        },\r\n        invert: {\r\n          css: {\r\n            color: theme("colors.gray.300"),\r\n            a: {\r\n              color: theme("colors.blue.400"),\r\n              "&:hover": {\r\n                color: theme("colors.blue.300"),\r\n              },\r\n            },\r\n            code: {\r\n              backgroundColor: theme("colors.gray.800"),\r\n            },\r\n          },\r\n        },\r\n      })',
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/typography"),
      require("tailwindcss-animate")
],
};
