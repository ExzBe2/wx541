App({
  cloudReady: false,
  cloudReadyCallbacks: [],

  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'cloud1-d1gbl1b1e84373304',
      traceUser: true,
    })
    this.cloudReady = true
    this.cloudReadyCallbacks.forEach(function(cb) { cb() })
    this.cloudReadyCallbacks = []
  },

  onCloudReady: function(cb) {
    if (this.cloudReady) {
      cb()
    } else {
      this.cloudReadyCallbacks.push(cb)
    }
  },

  globalData: {
    version: '1.0.0'
  }
})