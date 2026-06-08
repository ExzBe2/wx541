Page({
  data: {
    version: '1.0.0'
  },

  onLoad: function () {
    const app = getApp()
    this.setData({
      version: app.globalData.version
    })
  }
})