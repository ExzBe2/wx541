const imageUtils = require('../../utils/imageUtils.js')

Page({
  data: {
    originalImage: '',
    processedImage: '',
    originalSize: '',
    processedSize: '',
    quality: 70,
    savePercent: 0
  },

  chooseImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          originalImage: res.tempFilePaths[0],
          processedImage: '',
          originalSize: '',
          processedSize: '',
          savePercent: 0
        })
        this.getFileSize(res.tempFilePaths[0], 'original')
      }
    })
  },

  getFileSize: function (filePath, type) {
    wx.getFileInfo({
      filePath: filePath,
      success: (res) => {
        const size = (res.size / 1024).toFixed(1) + ' KB'
        this.setData({
          [type + 'Size']: size
        })
        if (type === 'processed') {
          this.calculateSavePercent()
        }
      }
    })
  },

  calculateSavePercent: function () {
    const original = parseFloat(this.data.originalSize)
    const processed = parseFloat(this.data.processedSize)
    if (original > 0) {
      const percent = ((original - processed) / original * 100).toFixed(1)
      this.setData({ savePercent: percent })
    }
  },

  onQualityChange: function (e) {
    this.setData({ quality: e.detail.value })
  },

  setQuality: function (e) {
    this.setData({ quality: parseInt(e.currentTarget.dataset.value) })
  },

  compressImage: function () {
    wx.showLoading({ title: '压缩中...' })
    imageUtils.compressImage(this.data.originalImage, this.data.quality)
      .then((result) => {
        wx.hideLoading()
        this.setData({ processedImage: result })
        this.getFileSize(result, 'processed')
      })
      .catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '压缩失败', icon: 'none' })
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
      originalSize: '',
      processedSize: '',
      savePercent: 0
    })
  }
})