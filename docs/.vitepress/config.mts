import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Comet v2.0",
	base: "/comet/",
	description: "Documentation for Comet v2.0",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Setup", link: "/setup/overview" },
			{ text: "API", link: "/api/globals/comet" }
		],

		sidebar: {
			"/setup/": [
				{
					text: "Getting Started",
					items: [
						{ text: "Overview", link: "/setup/overview" },
						{ text: "Project Setup", link: "/setup/setup" }
					]
				}
			],
			"/api/": [
				{
					text: "Globals",
					items: [
						{ text: "Comet", link: "/api/globals/comet" },
						{ text: "System", link: "/api/globals/system" },
						{ text: "Dependency", link: "/api/globals/dependency" },
						{ text: "Track", link: "/api/globals/tracker" },
						{ text: "Logger", link: "/api/globals/logger" }
					]
				},
				{
					text: "Internal Systems",
					items: [
						{ text: "History", link: "/api/modules/history" },
						{ text: "GUI", link: "/api/modules/gui" },
						{ text: "Studio", link: "/api/modules/studio" },
						{ text: "Audio", link: "/api/modules/audio" }
					]
				},
				{
					text: "Elements",
					items: [
						{ text: "View", link: "/api/interface/view" },
						{ text: "Button", link: "/api/interface/button" },
						{ text: "Menu", link: "/api/interface/menu" },
						{ text: "Action", link: "/api/interface/action" }
					]
				}
			]
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/neohertz/comet" }
		]
	}
});
