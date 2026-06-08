const imageUtils = {
  compressImage: function (src, quality) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success: (info) => {
          const ctx = wx.createCanvasContext('imageCanvas')
          ctx.drawImage(src, 0, 0, info.width, info.height)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              quality: quality / 100,
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: reject
            })
          })
        },
        fail: reject
      })
    })
  },

  resizeImage: function (src, width, height) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success: (info) => {
          let targetWidth = parseInt(width) || info.width
          let targetHeight = parseInt(height) || info.height
          
          const ctx = wx.createCanvasContext('imageCanvas')
          ctx.drawImage(src, 0, 0, targetWidth, targetHeight)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              width: targetWidth,
              height: targetHeight,
              destWidth: targetWidth,
              destHeight: targetHeight,
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: reject
            })
          })
        },
        fail: reject
      })
    })
  },

  convertFormat: function (src, format) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success: (info) => {
          const ctx = wx.createCanvasContext('imageCanvas')
          ctx.drawImage(src, 0, 0, info.width, info.height)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              fileType: format,
              quality: 0.9,
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: reject
            })
          })
        },
        fail: reject
      })
    })
  },

  addWatermark: function (src, text, fontSize) {
    return new Promise((resolve, reject) => {
      if (!text || text.trim() === '') {
        resolve(src)
        return
      }
      
      wx.getImageInfo({
        src: src,
        success: (info) => {
          const ctx = wx.createCanvasContext('imageCanvas')
          ctx.drawImage(src, 0, 0, info.width, info.height)
          
          ctx.setFillStyle('rgba(255, 255, 255, 0.8)')
          ctx.setFontSize(fontSize || 24)
          ctx.setTextAlign('center')
          ctx.setTextBaseline('middle')
          
          const x = info.width / 2
          const y = info.height / 2
          ctx.fillText(text, x, y)
          
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              width: info.width,
              height: info.height,
              destWidth: info.width,
              destHeight: info.height,
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: reject
            })
          })
        },
        fail: reject
      })
    })
  }
}

module.exports = imageUtils