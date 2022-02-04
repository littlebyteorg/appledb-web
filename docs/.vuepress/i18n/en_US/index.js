module.exports = {
  search: 'Search',
  
  locales: {
    lang: 'en-US',
    title: 'AppleDB',
    description: 'JSON database and API of Apple firmwares and jailbraeks',
  },
  
  themeConfig: {
  	selectLanguageName: "English",
  	backToHome: "Take me home",
  	contributorsText: "Contributors",
  	editLinkText: "Edit this page",
  	lastUpdatedText: "Last Updated",
  	openInNewWindow: "Open in new window",
  	selectLanguageAriaLabel: "Select language",
  	toggleDarkMode: "Toggle dark mode",
  	toggleSidebar: "Toggle sidebar",
      
    navbar: require('./navbar'),
    chart: require('./chart'),
  }
};