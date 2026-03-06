import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Comet 2.0",
	base: "/comet/",
	appearance: "dark",
	description: "Documentation for Comet",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Getting Started", link: "/setup/overview" },
			{ text: "API", link: "/api/globals/comet" }
		],

		sidebar: {
			"/setup/": [
				{
					text: "Getting Started",
					items: [
						{ text: "About Comet", link: "/setup/overview" },
						{ text: "Anatomy of a System", link: "/setup/systems" },
						{ text: "Internal Utility Systems", link: "/setup/utility-systems.md" },
						{ text: "User Interface", link: "/setup/ui.md" },
						{ text: "Housekeeping", link: "/setup/memory.md" },
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
