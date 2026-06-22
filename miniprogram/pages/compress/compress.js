const imageUtils = require('../../utils/imageUtils.js')

Page({
  data: {
    originalImage: '',
    processedImage: '',
    originalSize: '',
    processedSize: '',
    quality: 70,
    savePercent: 0,
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
          originalSize: '',
          processedSize: '',
          savePercent: 0,
          cloudFileID: ''
        })
        this.getFileSize(res.tempFilePaths[0], 'original')
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '选择图片失败', icon: 'none' })
      }
    })
  },

  getFileSize: function (filePath, type) {
    wx.getFileInfo({
      filePath: filePath,
      success: (res) => {
        const size = (res.size / 1024).toFixed(1)
        this.setData({
          [type + 'Size']: size + ' KB'
        })
        if (type === 'processed') {
          this.calculateSavePercent()
        }
      },
      fail: (err) => {
        console.error('获取文件大小失败:', err)
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
    if (!this.data.originalImage) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '压缩中...' })
    imageUtils.compressImage(this.data.originalImage, this.data.quality)
      .then((result) => {
        wx.hideLoading()
        this.setData({ processedImage: result })
        this.getFileSize(result, 'processed')
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('压缩失败:', err)
        wx.showToast({ title: '压缩失败，请重试', icon: 'none' })
      })
  },

  saveImage: function () {
    if (!this.data.processedImage) {
      wx.showToast({ title: '请先压缩图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.processedImage,
      success: () => {
        wx.hideLoading()
        wx.showToast({ title: '保存成功', icon: 'success' })
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('保存失败:', err)
        wx.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
      }
    })
  },

  saveToCloud: function () {
    if (!this.data.processedImage) {
      wx.showToast({ title: '请先压缩图片', icon: 'none' })
      return
    }

    this.setData({ savingToCloud: true })
    wx.showLoading({ title: '上传云存储...' })

    wx.getFileSystemManager().readFile({
      filePath: this.data.processedImage,
      encoding: 'base64',
      success: (res) => {
        const fileName = `compress/${Date.now()}.jpg`
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'uploadImage',
            data: {
              fileContent: res.data,
              cloudPath: fileName,
              toolType: 'compress',
              originalSize: parseFloat(this.data.originalSize) || 0,
              processedSize: parseFloat(this.data.processedSize) || 0
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
        console.error('读取文件失败:', err)
        wx.showToast({ title: '读取文件失败', icon: 'none' })
      }
    })
  },

  reset: function () {
    this.setData({
      originalImage: '',
      processedImage: '',
      originalSize: '',
      processedSize: '',
      savePercent: 0,
      cloudFileID: ''
    })
  },

  onShareAppMessage: function () {
    return {
      title: '图片工具 - 图片压缩功能',
      path: '/pages/index/index'
    }
  },

  onShareTimeline: function () {
    return {
      title: '图片工具 - 图片压缩功能'
    }
  }
})