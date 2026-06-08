const imageUtils = require('../../utils/imageUtils.js')

Page({
  data: {
    originalImage: '',
    processedImage: '',
    width: 500,
    height: 500,
    selectedRatio: '1:1',
    keepAspect: true,
    originalWidth: 0,
    originalHeight: 0
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
        this.getImageInfo(tempFilePath)
      }
    })
  },

  getImageInfo: function (filePath) {
    wx.getImageInfo({
      filePath: filePath,
      success: (info) => {
        this.setData({
          originalWidth: info.width,
          originalHeight: info.height,
          width: info.width,
          height: info.height
        })
      }
    })
  },

  onWidthInput: function (e) {
    const w = parseInt(e.detail.value) || 0
    this.setData({ width: w })
    if (this.data.keepAspect && this.data.originalWidth > 0) {
      const ratio = this.data.originalHeight / this.data.originalWidth
      this.setData({ height: Math.round(w * ratio) })
    }
  },

  onHeightInput: function (e) {
    const h = parseInt(e.detail.value) || 0
    this.setData({ height: h })
    if (this.data.keepAspect && this.data.originalHeight > 0) {
      const ratio = this.data.originalWidth / this.data.originalHeight
      this.setData({ width: Math.round(h * ratio) })
    }
  },

  setRatio: function (e) {
    const ratio = e.currentTarget.dataset.ratio
    const ratios = {
      '1:1': { w: 500, h: 500 },
      '4:3': { w: 640, h: 480 },
      '16:9': { w: 1280, h: 720 },
      '9:16': { w: 720, h: 1280 }
    }
    const size = ratios[ratio]
    this.setData({
      width: size.w,
      height: size.h,
      selectedRatio: ratio
    })
  },

  onAspectChange: function (e) {
    this.setData({ keepAspect: e.detail.value })
  },

  resizeImage: function () {
    const { width, height } = this.data
    if (!width || !height || width <= 0 || height <= 0) {
      wx.showToast({ title: '请输入有效尺寸', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '调整中...' })
    imageUtils.resizeImage(this.data.originalImage, width, height)
      .then((result) => {
        wx.hideLoading()
        this.setData({ processedImage: result })
      })
      .catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '调整失败', icon: 'none' })
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
      width: 500,
      height: 500,
      selectedRatio: '1:1',
      originalWidth: 0,
      originalHeight: 0
    })
  }
})