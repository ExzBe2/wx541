App({
  cloudReady: false,
  cloudReadyCallbacks: [],
  userInfo: null,
  imageCount: 0,
  loginCallback: null,

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
    this.login()
  },

  onCloudReady: function(cb) {
    if (this.cloudReady) {
      cb()
    } else {
      this.cloudReadyCallbacks.push(cb)
    }
  },

  login: function(callback) {
    this.loginCallback = callback
    
    wx.showLoading({ title: '登录中...' })
    
    wx.login({
      success: (loginRes) => {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'login',
            data: {}
          },
          success: (result) => {
            wx.hideLoading()
            if (result.result && result.result.success) {
              this.userInfo = result.result.user
              console.log('登录成功:', this.userInfo)
              
              if (this.loginCallback) {
                this.loginCallback(null, this.userInfo)
                this.loginCallback = null
              }
            }
          },
          fail: (err) => {
            wx.hideLoading()
            console.error('登录失败:', err)
            wx.showToast({ title: '登录失败', icon: 'none' })
            
            if (this.loginCallback) {
              this.loginCallback(err)
              this.loginCallback = null
            }
          }
        })
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('wx.login 失败:', err)
        wx.showToast({ title: '登录失败', icon: 'none' })
        
        if (this.loginCallback) {
          this.loginCallback(err)
          this.loginCallback = null
        }
      }
    })
  },

  getUserInfo: function() {
    return this.userInfo
  },

  setUserInfo: function(info) {
    this.userInfo = info
  },

  updateImageCount: function(count) {
    this.imageCount = count
  },

  getImageCount: function() {
    return this.imageCount
  },

  globalData: {
    version: '1.0.0'
  }
})