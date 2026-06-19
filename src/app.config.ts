export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/workbench/index',
    'pages/mine/index',
    'pages/photo-task/index',
    'pages/capture-guide/index',
    'pages/photo-confirm/index',
    'pages/history/index',
    'pages/review-detail/index',
    'pages/compare/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2D7FF9',
    navigationBarTitleText: '正畸拍照助手',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#2D7FF9',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/workbench/index',
        text: '工作台'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
