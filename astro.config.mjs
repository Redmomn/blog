import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, kvCache, r2 } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import webhookNotifier from "@emdash-cms/plugin-webhook-notifier";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	cache: {
		provider: cacheCloudflare(),
	},
	routeRules: {
		"/": {
			maxAge: 300,
			swr: 86400,
		},
		"/posts": {
			maxAge: 300,
			swr: 86400,
		},
		"/posts/[slug]": {
			maxAge: 300,
			swr: 86400,
		},
		"/pages/[slug]": {
			maxAge: 300,
			swr: 86400,
		},
		"/category/[slug]": {
			maxAge: 300,
			swr: 86400,
		},
		"/tag/[slug]": {
			maxAge: 300,
			swr: 86400,
		},
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			siteUrl: "https://redmomn.cc",
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({
				binding: "MEDIA",
				publicUrl: "https://blog.oss.redmomn.cc",
			}),
			images: false,
			objectCache: kvCache({
				binding: "CACHE",
			}),
			plugins: [formsPlugin(), webhookNotifier],
			// sandboxed: [webhookNotifier],
			// sandboxRunner: sandbox(),
			// marketplace: "https://marketplace.emdashcms.com",
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
