/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ethiopiansalarycalculator.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  transform: async (config, path) => {
    // Customize priorities for key pages
    let priority = 0.7
    if (path === '/') priority = 1.0
    if (path.startsWith('/calculator')) priority = 0.9
    if (path.startsWith('/about')) priority = 0.5
    return {
      loc: path,
      changefreq: 'weekly',
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    }
  },
  additionalPaths: async (config) => {
    // Add any dynamic or extra routes manually here if needed
    return [
      await config.transform(config, '/calculator'),
      await config.transform(config, '/about'),
    ]
  },
}
