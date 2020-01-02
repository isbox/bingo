module.exports = {
  // 使用rollup打包成ES6标准模块输出
  esm: {
    type: 'rollup',
    importLibToEs: true,
    minify: true,
  },
  // 使用rollup打包成commonjs标准模块输出
  cjs: {
    type: 'rollup',
    minify: true,
    lazy: true
  },
  cssModules: {
    generateScopedName: 'bingo__[name][hash:base64:5]',
    camelCase: true
  },
  doc: {
    title: '标果组件库',
    typescript: false,
    notUseSpecifiers: true,
    theme: 'docz-theme-ztopia',
    // 深色主题
    themeConfig: {
      mode: 'dark',
      logo: {
        src: 'https://wxapptop.oss-cn-beijing.aliyuncs.com/upload_pic/z19122001/12718_ico.jpg'
      }
    },
    // 此处开启docz的css module的camelCase功能
    modifyBundlerConfig: (config) => {
      const len = config.module.rules.length;
      for (let i = 0; i < len; i++) {
        if (config.module.rules[i].test.toString() === /(\.module)?\.less$/.toString()) {
          config.module.rules[i].use[1].options.camelCase = true;
        }
      }
      return config;
    }
  }
}
