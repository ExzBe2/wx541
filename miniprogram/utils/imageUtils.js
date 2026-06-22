const imageUtils = {
  compressImage: function (page, src, quality) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success: (info) => {
          const selectorQuery = page ? page.createSelectorQuery() : wx.createSelectorQuery()
          selectorQuery
            .select('#imageCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
              if (!res[0] || !res[0].node) {
                reject(new Error('canvas 元素不存在'))
                return
              }
              
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              
              canvas.width = info.width
              canvas.height = info.height
              
              const img = canvas.createImage()
              img.onload = () => {
                ctx.drawImage(img, 0, 0, info.width, info.height)
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  quality: quality / 100,
                  success: (tempRes) => {
                    resolve(tempRes.tempFilePath)
                  },
                  fail: reject
                })
              }
              img.onerror = reject
              img.src = src
            })
        },
        fail: reject
      })
    })
  },

  resizeImage: function (page, src, width, height) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success: (info) => {
          let targetWidth = parseInt(width) || info.width
          let targetHeight = parseInt(height) || info.height
          
          const selectorQuery = page ? page.createSelectorQuery() : wx.createSelectorQuery()
          selectorQuery
            .select('#imageCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
              if (!res[0] || !res[0].node) {
                reject(new Error('canvas 元素不存在'))
                return
              }
              
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              
              canvas.width = targetWidth
              canvas.height = targetHeight
              
              const img = canvas.createImage()
              img.onload = () => {
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  width: targetWidth,
                  height: targetHeight,
                  destWidth: targetWidth,
                  destHeight: targetHeight,
                  success: (tempRes) => {
                    resolve(tempRes.tempFilePath)
                  },
                  fail: reject
                })
              }
              img.onerror = reject
              img.src = src
            })
        },
        fail: reject
      })
    })
  },

  convertFormat: function (page, src, format) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success: (info) => {
          const selectorQuery = page ? page.createSelectorQuery() : wx.createSelectorQuery()
          selectorQuery
            .select('#imageCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
              if (!res[0] || !res[0].node) {
                reject(new Error('canvas 元素不存在'))
                return
              }
              
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              
              canvas.width = info.width
              canvas.height = info.height
              
              const img = canvas.createImage()
              img.onload = () => {
                ctx.drawImage(img, 0, 0, info.width, info.height)
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  fileType: format,
                  quality: 0.9,
                  success: (tempRes) => {
                    resolve(tempRes.tempFilePath)
                  },
                  fail: reject
                })
              }
              img.onerror = reject
              img.src = src
            })
        },
        fail: reject
      })
    })
  },

  addWatermark: function (page, src, text, fontSize, opacity, position) {
    return new Promise((resolve, reject) => {
      if (!text || text.trim() === '') {
        resolve(src)
        return
      }
      
      wx.getImageInfo({
        src: src,
        success: (info) => {
          const selectorQuery = page ? page.createSelectorQuery() : wx.createSelectorQuery()
          selectorQuery
            .select('#imageCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
              if (!res[0] || !res[0].node) {
                reject(new Error('canvas 元素不存在'))
                return
              }
              
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              
              canvas.width = info.width
              canvas.height = info.height
              
              const img = canvas.createImage()
              img.onload = () => {
                ctx.drawImage(img, 0, 0, info.width, info.height)
                
                ctx.setFillStyle(`rgba(255, 255, 255, ${opacity / 100})`)
                ctx.setFontSize(fontSize || 24)
                
                const posMap = {
                  'top-left': { x: info.width * 0.1, y: info.height * 0.1 },
                  'top-center': { x: info.width * 0.5, y: info.height * 0.1 },
                  'top-right': { x: info.width * 0.9, y: info.height * 0.1 },
                  'center': { x: info.width * 0.5, y: info.height * 0.5 },
                  'bottom-left': { x: info.width * 0.1, y: info.height * 0.9 },
                  'bottom-center': { x: info.width * 0.5, y: info.height * 0.9 },
                  'bottom-right': { x: info.width * 0.9, y: info.height * 0.9 }
                }
                
                const pos = posMap[position] || { x: info.width / 2, y: info.height / 2 }
                
                if (position.includes('center')) {
                  ctx.setTextAlign('center')
                } else if (position.includes('right')) {
                  ctx.setTextAlign('right')
                } else {
                  ctx.setTextAlign('left')
                }
                
                if (position.includes('center')) {
                  ctx.setTextBaseline('middle')
                } else if (position.includes('bottom')) {
                  ctx.setTextBaseline('bottom')
                } else {
                  ctx.setTextBaseline('top')
                }
                
                ctx.fillText(text, pos.x, pos.y)
                
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  width: info.width,
                  height: info.height,
                  destWidth: info.width,
                  destHeight: info.height,
                  success: (tempRes) => {
                    resolve(tempRes.tempFilePath)
                  },
                  fail: reject
                })
              }
              img.onerror = reject
              img.src = src
            })
        },
        fail: reject
      })
    })
  }
}

module.exports = imageUtils