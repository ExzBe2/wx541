Page({
  data: {
    userInfo: null,
    imageCount: 0,
    typeCount: {},
    loading: true,
    images: [],
    isImagesEmpty: false,
    loginLoading: true
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    const app = getApp()
    this.setData({ loginLoading: true })

    if (app.getUserInfo()) {
      this.setData({ 
        userInfo: app.getUserInfo(),
        loginLoading: false
      })
      this.loadImageStats()
      this.loadImages()
    } else {
      app.login((err, userInfo) => {
        if (!err && userInfo) {
          this.setData({ 
            userInfo: userInfo,
            loginLoading: false
          })
        } else {
          this.setData({ loginLoading: false })
        }
        this.loadImageStats()
        this.loadImages()
      })
    }
  },

  loadImageStats: function () {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getImageCount'
      },
      success: (res) => {
        if (res.result && res.result.success) {
          this.setData({
            imageCount: res.result.total,
            typeCount: res.result.typeCount || {}
          })
        }
      },
      fail: (err) => {
        console.error('获取图片统计失败:', err)
      }
    })
  },

  loadImages: function () {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getImageList',
        data: {
          page: 0,
          size: 10
        }
      },
      success: (res) => {
        this.setData({
          loading: false,
          images: res.result && res.result.success ? res.result.data : [],
          isImagesEmpty: (!res.result || !res.result.success || res.result.data.length === 0)
        })
      },
      fail: (err) => {
        console.error('获取图片列表失败:', err)
        this.setData({
          loading: false,
          isImagesEmpty: true
        })
      }
    })
  },

  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  goToAbout: function () {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  goToAddRecord: function () {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  },

  onChooseAvatar: function (e) {
    const { avatarUrl } = e.detail
    wx.showLoading({ title: '上传中...' })
    
    wx.cloud.uploadFile({
      cloudPath: `avatars/${Date.now()}.jpg`,
      filePath: avatarUrl,
      success: (uploadRes) => {
        wx.hideLoading()
        const cloudAvatarUrl = uploadRes.fileID
        
        this.updateUserInfo({
          avatarUrl: cloudAvatarUrl,
          nickName: this.data.userInfo && this.data.userInfo.nickName ? this.data.userInfo.nickName : '用户'
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    })
  },

  onGetUserInfo: function (e) {
    const { userInfo } = e.detail
    if (userInfo && userInfo.nickName) {
      wx.showLoading({ title: '保存中...' })
      
      let avatarUrl = this.data.userInfo && this.data.userInfo.avatarUrl ? this.data.userInfo.avatarUrl : ''
      
      if (userInfo.avatarUrl && !this.data.userInfo.avatarUrl) {
        wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}.jpg`,
          filePath: userInfo.avatarUrl,
          success: (uploadRes) => {
            avatarUrl = uploadRes.fileID
            this.updateUserInfo({
              nickName: userInfo.nickName,
              avatarUrl: avatarUrl
            })
          },
          fail: () => {
            this.updateUserInfo({
              nickName: userInfo.nickName,
              avatarUrl: avatarUrl
            })
          }
        })
      } else {
        this.updateUserInfo({
          nickName: userInfo.nickName,
          avatarUrl: avatarUrl
        })
      }
    }
  },

  showNameSheet: function () {
    wx.showActionSheet({
      itemList: ['使用微信昵称', '自定义昵称'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.getWxNickname()
        } else if (res.tapIndex === 1) {
          this.setCustomName()
        }
      }
    })
  },

  getWxNickname: function () {
    wx.showLoading({ title: '获取中...' })
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        wx.hideLoading()
        const { nickName, avatarUrl } = res.userInfo
        
        if (!nickName) {
          wx.showToast({ title: '获取昵称失败', icon: 'none' })
          return
        }
        
        let finalAvatarUrl = this.data.userInfo && this.data.userInfo.avatarUrl ? this.data.userInfo.avatarUrl : ''
        
        if (avatarUrl && !finalAvatarUrl) {
          wx.showLoading({ title: '上传头像中...' })
          wx.cloud.uploadFile({
            cloudPath: `avatars/${Date.now()}.jpg`,
            filePath: avatarUrl,
            success: (uploadRes) => {
              wx.hideLoading()
              this.updateUserInfo({
                nickName: nickName,
                avatarUrl: uploadRes.fileID
              })
            },
            fail: () => {
              wx.hideLoading()
              this.updateUserInfo({
                nickName: nickName,
                avatarUrl: finalAvatarUrl
              })
            }
          })
        } else {
          this.updateUserInfo({
            nickName: nickName,
            avatarUrl: finalAvatarUrl
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('获取微信信息失败:', err)
        wx.showToast({ title: '用户取消授权', icon: 'none' })
      }
    })
  },

  setCustomName: function () {
    wx.showModal({
      title: '自定义昵称',
      editable: true,
      placeholderText: '请输入您的昵称',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const nickName = res.content.trim()
          
          this.updateUserInfo({
            nickName: nickName,
            avatarUrl: this.data.userInfo && this.data.userInfo.avatarUrl ? this.data.userInfo.avatarUrl : ''
          })
        }
      }
    })
  },

  updateUserInfo: function (data) {
    wx.showLoading({ title: '保存中...' })
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'updateUserInfo',
        data: data
      },
      success: (result) => {
        wx.hideLoading()
        console.log('updateUserInfo result:', result)
        if (result.result && result.result.success) {
          const app = getApp()
          let userInfo = result.result.user || app.getUserInfo() || {}
          userInfo.nickName = data.nickName
          if (data.avatarUrl) {
            userInfo.avatarUrl = data.avatarUrl
          }
          app.setUserInfo(userInfo)
          this.setData({ userInfo: userInfo })
          wx.showToast({ title: '保存成功', icon: 'success' })
        } else {
          const errMsg = result.result && result.result.errMsg ? result.result.errMsg : '保存失败'
          console.error('保存失败:', errMsg)
          wx.showToast({ title: errMsg, icon: 'none' })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('更新用户信息失败:', err)
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      }
    })
  },

  onDeleteImage: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'deleteImage',
              data: { _id: id }
            },
            success: (res) => {
              wx.hideLoading()
              if (res.result && res.result.success) {
                wx.showToast({ title: '删除成功', icon: 'success' })
                this.loadData()
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' })
              }
            },
            fail: (err) => {
              wx.hideLoading()
              console.error('删除图片失败:', err)
              wx.showToast({ title: '删除失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  saveImage: function (e) {
    const fileID = e.currentTarget.dataset.fileid
    wx.showLoading({ title: '保存中...' })
    wx.cloud.downloadFile({
      fileID: fileID,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading()
            wx.showToast({ title: '保存成功', icon: 'success' })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  },

  formatDate: function (dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getToolName: function (toolType) {
    const names = {
      'compress': '图片压缩',
      'resize': '尺寸调整',
      'format': '格式转换',
      'watermark': '水印添加'
    }
    return names[toolType] || '图片处理'
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