const imageUtils = require('../../utils/imageUtils.js')

Page({
  data: {
    originalImage: '',
    processedImage: '',
    watermarkText: '',
    fontSize: 24,
    opacity: 80,
    position: 'center'
  },

  chooseImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          originalImage: res.tempFilePaths[0],
          processedImage: ''
        })
      }
    })
  },

  onWatermarkInput: function (e) {
    this.setData({ watermarkText: e.detail.value })
  },

  onFontSizeChange: function (e) {
    this.setData({ fontSize: e.detail.value })
  },

  onOpacityChange: function (e) {
    this.setData({ opacity: e.detail.value })
  },

  setPosition: function (e) {
    this.setData({ position: e.currentTarget.dataset.pos })
  },

  addWatermark: function () {
    if (!this.data.watermarkText.trim()) {
      wx.showToast({ title: '请输入水印文字', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '添加中...' })
    
    wx.getImageInfo({
      src: this.data.originalImage,
      success: (info) => {
        const ctx = wx.createCanvasContext('watermarkCanvas')
        ctx.drawImage(this.data.originalImage, 0, 0, info.width, info.height)
        
        const posMap = {
          'top-left': { x: info.width * 0.1, y: info.height * 0.1 },
          'top-center': { x: info.width * 0.5, y: info.height * 0.1 },
          'top-right': { x: info.width * 0.9, y: info.height * 0.1 },
          'center': { x: info.width * 0.5, y: info.height * 0.5 },
          'bottom-left': { x: info.width * 0.1, y: info.height * 0.9 },
          'bottom-center': { x: info.width * 0.5, y: info.height * 0.9 },
          'bottom-right': { x: info.width * 0.9, y: info.height * 0.9 }
        }
        
        const pos = posMap[this.data.position]
        ctx.setFillStyle(`rgba(255, 255, 255, ${this.data.opacity / 100})`)
        ctx.setFontSize(this.data.fontSize)
        
        if (this.data.position.includes('center')) {
          ctx.setTextAlign('center')
        } else if (this.data.position.includes('right')) {
          ctx.setTextAlign('right')
        } else {
          ctx.setTextAlign('left')
        }
        
        if (this.data.position.includes('center')) {
          ctx.setTextBaseline('middle')
        } else if (this.data.position.includes('bottom')) {
          ctx.setTextBaseline('bottom')
        } else {
          ctx.setTextBaseline('top')
        }
        
        ctx.fillText(this.data.watermarkText, pos.x, pos.y)
        
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            width: info.width,
            height: info.height,
            destWidth: info.width,
            destHeight: info.height,
            success: (res) => {
              wx.hideLoading()
              this.setData({ processedImage: res.tempFilePath })
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '添加失败', icon: 'none' })
            }
          })
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '获取图片信息失败', icon: 'none' })
      }
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
      watermarkText: '',
      fontSize: 24,
      opacity: 80,
      position: 'center'
    })
  }
})