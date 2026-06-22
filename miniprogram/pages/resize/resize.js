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
    originalHeight: 0,
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
        this.getImageInfo(tempFilePath)
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '选择图片失败', icon: 'none' })
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
      },
      fail: (err) => {
        console.error('获取图片信息失败:', err)
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
    imageUtils.resizeImage(this, this.data.originalImage, width, height)
      .then((result) => {
        wx.hideLoading()
        this.setData({ processedImage: result })
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('调整失败:', err)
        wx.showToast({ title: '调整失败，请重试', icon: 'none' })
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
      wx.showToast({ title: '请先调整图片', icon: 'none' })
      return
    }

    this.setData({ savingToCloud: true })
    wx.showLoading({ title: '上传云存储...' })

    wx.getFileSystemManager().readFile({
      filePath: this.data.processedImage,
      encoding: 'base64',
      success: (res) => {
        const fileName = `resize/${Date.now()}.jpg`
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'uploadImage',
            data: {
              fileContent: res.data,
              cloudPath: fileName,
              toolType: 'resize'
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
      width: 500,
      height: 500,
      selectedRatio: '1:1',
      originalWidth: 0,
      originalHeight: 0,
      cloudFileID: ''
    })
  },

  onShareAppMessage: function () {
    return {
      title: '图片工具 - 尺寸调整功能',
      path: '/pages/index/index'
    }
  },

  onShareTimeline: function () {
    return {
      title: '图片工具 - 尺寸调整功能'
    }
  }
})