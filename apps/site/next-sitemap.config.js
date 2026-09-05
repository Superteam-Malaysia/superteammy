/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://my.superteam.fun',
  generateRobotsTxt: true,
  exclude: ['/dashboard', '/dashboard/*', '/borneo/admin', '/borneo/admin/*'],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/dashboard', '/borneo/admin'] },
    ],
  },
};
