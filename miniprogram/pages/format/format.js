const imageUtils = require('../../utils/imageUtils.js')

Page({
  data: {
    originalImage: '',
    processedImage: '',
    selectedFormat: 'jpeg',
    originalFormat: '未知'
  },

  chooseImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          originalImage: tempFilePath,
          processedImage: ''
        })
        this.getImageFormat(tempFilePath)
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
      .catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '转换失败', icon: 'none' })
      })
  },

  saveImage: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.processedImage,
      success: () => wx.showToast({ title: '保存成功', icon: 'success' }),
      fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
    })
  },

  reset: function () {
    this.setData({
      originalImage: '',
      processedImage: '',
      selectedFormat: 'jpeg',
      originalFormat: '未知'
    })
  }
})