Page({
  data: {
    version: '1.0.0',
    theme: 'light',
    cacheSize: '0 KB'
  },

  onLoad: function () {
    const app = getApp()
    this.setData({
      version: app.globalData.version
    })
    this.getStorageInfo()
  },

  getStorageInfo: function () {
    try {
      const info = wx.getStorageInfoSync()
      const size = (info.currentSize / 1024).toFixed(2) + ' KB'
      this.setData({ cacheSize: size })
    } catch (e) {
      console.error('获取存储信息失败:', e)
    }
  },

  onThemeChange: function (e) {
    const theme = e.detail.value
    this.setData({ theme: theme })
    
    if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    }
    
    wx.showToast({
      title: theme === 'dark' ? '已切换深色模式' : '已切换浅色模式',
      icon: 'none'
    })
  },

  clearCache: function () {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '清除中...' })
          try {
            wx.clearStorageSync()
            wx.hideLoading()
            this.setData({ cacheSize: '0 KB' })
            wx.showToast({ title: '清除成功', icon: 'success' })
          } catch (e) {
            wx.hideLoading()
            console.error('清除缓存失败:', e)
            wx.showToast({ title: '清除失败', icon: 'none' })
          }
        }
      }
    })
  },

  goToAbout: function () {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  onShareAppMessage: function () {
    return {
      title: '图片工具 - 轻量高效的图片处理小程序',
      path: '/pages/index/index'
    }
  },

  onShareTimeline: function () {
    return {
      title: '图片工具 - 轻量高效的图片处理小程序'
    }
  }
})