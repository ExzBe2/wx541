Page({
  data: {
    version: '1.0.0',
    tools: [
      { id: 'compress', name: '图片压缩', icon: '📷', color: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', available: true },
      { id: 'resize', name: '尺寸调整', icon: '📐', color: 'linear-gradient(135deg, #34a853 0%, #1e8e3e 100%)', available: true },
      { id: 'format', name: '格式转换', icon: '🔄', color: 'linear-gradient(135deg, #fbbc05 0%, #f59e0b 100%)', available: true },
      { id: 'watermark', name: '水印添加', icon: '✏️', color: 'linear-gradient(135deg, #ea4335 0%, #d93026 100%)', available: true },
      { id: 'crop', name: '图片裁剪', icon: '✂️', color: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', available: false },
      { id: 'filter', name: '滤镜效果', icon: '🎨', color: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', available: false }
    ],
    userInfo: null,
    loading: true
  },

  onLoad: function () {
    const app = getApp()
    this.setData({
      version: app.globalData.version
    })
    this.loadUserInfo()
  },

  onShow: function() {
    this.loadUserInfo()
  },

  loadUserInfo: function() {
    const app = getApp()
    const userInfo = app.getUserInfo()
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        loading: false
      })
    } else {
      app.onCloudReady(() => {
        this.setData({
          userInfo: app.getUserInfo(),
          loading: false
        })
      })
    }
  },

  goToTool: function (e) {
    const toolId = e.currentTarget.dataset.tool
    const availableTools = ['compress', 'resize', 'format', 'watermark']
    
    if (availableTools.includes(toolId)) {
      wx.navigateTo({
        url: `/pages/${toolId}/${toolId}`
      })
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '图片工具 - 轻量高效的图片处理小程序',
      path: '/pages/index/index',
      imageUrl: ''
    }
  },

  onShareTimeline: function () {
    return {
      title: '图片工具 - 轻量高效的图片处理小程序',
      query: '',
      imageUrl: ''
    }
  }
})