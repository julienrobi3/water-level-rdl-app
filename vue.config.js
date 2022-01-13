module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/water-level-rdl-app/'
    : '/',
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
      enableBridge: false
    }
  }
}
