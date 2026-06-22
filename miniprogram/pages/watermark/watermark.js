Page({
  data: {
    originalImage: '',
    processedImage: '',
    watermarkText: '',
    fontSize: 24,
    opacity: 80,
    position: 'center',
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
        this.setData({
          originalImage: res.tempFilePaths[0],
          processedImage: '',
          cloudFileID: ''
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '选择图片失败', icon: 'none' })
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

    if (!this.data.originalImage) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '添加中...' })

    wx.getImageInfo({
      src: this.data.originalImage,
      success: (info) => {
        const offscreenCanvas = wx.createOffscreenCanvas({
          type: '2d',
          width: info.width,
          height: info.height
        })
        const ctx = offscreenCanvas.getContext('2d')

        const img = offscreenCanvas.createImage()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, info.width, info.height)

          ctx.setFillStyle(`rgba(255, 255, 255, ${this.data.opacity / 100})`)
          ctx.setFontSize(this.data.fontSize || 24)

          const posMap = {
            'top-left': { x: info.width * 0.1, y: info.height * 0.1 },
            'top-center': { x: info.width * 0.5, y: info.height * 0.1 },
            'top-right': { x: info.width * 0.9, y: info.height * 0.1 },
            'center': { x: info.width * 0.5, y: info.height * 0.5 },
            'bottom-left': { x: info.width * 0.1, y: info.height * 0.9 },
            'bottom-center': { x: info.width * 0.5, y: info.height * 0.9 },
            'bottom-right': { x: info.width * 0.9, y: info.height * 0.9 }
          }

          const pos = posMap[this.data.position] || { x: info.width / 2, y: info.height / 2 }

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

          try {
            const tempFilePath = offscreenCanvas.toTempFilePathSync({
              width: info.width,
              height: info.height,
              destWidth: info.width,
              destHeight: info.height,
              fileType: 'jpg',
              quality: 0.9
            })
            wx.hideLoading()
            this.setData({ processedImage: tempFilePath })
          } catch (err) {
            wx.hideLoading()
            console.error('生成图片失败:', err)
            wx.showToast({ title: '生成图片失败', icon: 'none' })
          }
        }
        img.onerror = (err) => {
          wx.hideLoading()
          console.error('图片加载失败:', err)
          wx.showToast({ title: '图片加载失败', icon: 'none' })
        }
        img.src = this.data.originalImage
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('获取图片信息失败:', err)
        wx.showToast({ title: '获取图片信息失败', icon: 'none' })
      }
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
      wx.showToast({ title: '请先添加水印', icon: 'none' })
      return
    }

    this.setData({ savingToCloud: true })
    wx.showLoading({ title: '上传云存储...' })

    wx.getFileSystemManager().readFile({
      filePath: this.data.processedImage,
      encoding: 'base64',
      success: (res) => {
        const fileName = `watermark/${Date.now()}.jpg`
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'uploadImage',
            data: {
              fileContent: res.data,
              cloudPath: fileName,
              toolType: 'watermark'
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
      watermarkText: '',
      fontSize: 24,
      opacity: 80,
      position: 'center',
      cloudFileID: ''
    })
  },

  onShareAppMessage: function () {
    return {
      title: '图片工具 - 水印添加功能',
      path: '/pages/index/index'
    }
  },

  onShareTimeline: function () {
    return {
      title: '图片工具 - 水印添加功能'
    }
  }
})