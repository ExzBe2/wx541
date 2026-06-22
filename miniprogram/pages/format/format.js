const imageUtils = require('../../utils/imageUtils.js')

Page({
  data: {
    originalImage: '',
    processedImage: '',
    selectedFormat: 'jpeg',
    originalFormat: '未知',
    savingToCloud: false,
    cloudFileID: ''
  },

  chooseImage: function () {
    wx.showLoading({ title: '选择图片...' })
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.hideLoading()
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          originalImage: tempFilePath,
          processedImage: '',
          cloudFileID: ''
        })
        this.getImageFormat(tempFilePath)
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '选择图片失败', icon: 'none' })
      }
    })
  },

  getImageFormat: function (filePath) {
    const ext = filePath.split('.').pop().toLowerCase()
    this.setData({ originalFormat: ext.toUpperCase() })
  },

  selectFormat: function (e) {
    this.setData({ selectedFormat: e.currentTarget.dataset.format })
  },

  convertFormat: function () {
    wx.showLoading({ title: '转换中...' })
    imageUtils.convertFormat(this.data.originalImage, this.data.selectedFormat)
      .then((result) => {
        wx.hideLoading()
        this.setData({ processedImage: result })
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('转换失败:', err)
        wx.showToast({ title: '转换失败，请重试', icon: 'none' })
      })
  },

  saveImage: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.processedImage,
      success: () => wx.showToast({ title: '保存成功', icon: 'success' }),
      fail: () => wx.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
    })
  },

  saveToCloud: function () {
    if (!this.data.processedImage) {
      wx.showToast({ title: '请先转换图片', icon: 'none' })
      return
    }

    this.setData({ savingToCloud: true })
    wx.showLoading({ title: '上传云存储...' })

    wx.getFileSystemManager().readFile({
      filePath: this.data.processedImage,
      encoding: 'base64',
      success: (res) => {
        const fileName = `format/${Date.now()}.${this.data.selectedFormat}`
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'uploadImage',
            data: {
              fileContent: res.data,
              cloudPath: fileName,
              toolType: 'format'
            }
          },
          success: (result) => {
            wx.hideLoading()
            this.setData({ savingToCloud: false })
            if (result.result && result.result.success) {
              this.setData({ cloudFileID: result.result.fileID })
              wx.showToast({ title: '上传成功', icon: 'success' })
            } else {
              wx.showToast({ title: '上传失败', icon: 'none' })
            }
          },
          fail: (err) => {
            wx.hideLoading()
            this.setData({ savingToCloud: false })
            console.error('上传云存储失败:', err)
            wx.showToast({ title: '上传失败，请重试', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        wx.hideLoading()
        this.setData({ savingToCloud: false })
        wx.showToast({ title: '读取文件失败', icon: 'none' })
      }
    })
  },

  reset: function () {
    this.setData({
      originalImage: '',
      processedImage: '',
      selectedFormat: 'jpeg',
      originalFormat: '未知',
      cloudFileID: ''
    })
  },

  onShareAppMessage: function () {
    return {
      title: '图片工具 - 格式转换功能',
      path: '/pages/index/index'
    }
  },

  onShareTimeline: function () {
    return {
      title: '图片工具 - 格式转换功能'
    }
  }
})