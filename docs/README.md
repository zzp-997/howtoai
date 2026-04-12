# mes-pda
mes项目pda

# 项目技术
vue3 + vue-router + pinia + tailwindcss

# 项目UI框架 tdesign
https://tdesign.tencent.com/mobile-vue/getting-started

# 项目开发注意事项
1. 项目中使用postcssPxToViewport实现了px转vw的转换，在项目中无需再进行转换，直接UI设计图对应的px尺寸即可。
2. 页面中无需引入关于vue的东西，如：import { ref } from 'vue'。使用AutoImport做了全局自动引入处理
3. 项目中只需引入所用到的api、组件以及静态文件即可
4. utils/common下的所有方法都是全局引入的，无需手动引入，可直接使用
   如：isEmpty notEmpty showToast showErrorDialog playSuccessVoice playErrorVoice等等常用的公用方法
5. 项目中使用tailwindcss技术，尽可能避免写css样式(若需更改UI框架默认样式除外)，能使用tailwindcss的就使用，这样可以减少冗余的样式代码。
6. 使用tailwindcss时设计单位尺寸的尽量使用px写法，例如：w-[300px]代表宽度为300px，300px为ui设计图尺寸
   原因：
     1. 提高代码可读性，无需去对照tailwindcss文档去看响应的尺寸
     2. 便于后续维护，无需再去对照设计图去修改尺寸
     3. 便于后续适配，无需再去修改tailwindcss的配置文件去适配不同尺寸的设备, 通过postcssPxToViewport自动转换

# 项目公用组件
1. root 根组件
   自带TabBar标题栏，页面的根组件，无需注册直接使用
2. popup 弹出层组件
   根据ui设计进行封装的弹窗层组件，默认高度1029px
3. pagingView 支持下拉刷新和上拉加载的组件
   自带下拉刷新和上拉加载功能，无需注册直接使用
   直接传入api函数即可实现下拉刷新和上拉加载，详细使用方法见pagingView.vue