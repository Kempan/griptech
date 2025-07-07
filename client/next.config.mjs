import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */

const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s3-wamaya.s3.eu-north-1.amazonaws.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "wamaya.se",
				port: "",
				pathname: "/**",
			},
		],
	},
	// async redirects() {
	// 	return [
	// 		{
	// 			source: '/admin/dashboard',
	// 			destination: '/admin',
	// 			permanent: true, // Use `true` for a 301(permanent) redirect, `false` for a 302(temporary) redirect
	// 		},
	// 	];
	// },
};

export default withNextIntl(nextConfig);
