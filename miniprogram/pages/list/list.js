Page({
  data: {
    records: [],
    loading: true,
    isEmpty: false,
    categories: {
      'work': '工作',
      'life': '生活',
      'study': '学习',
      'other': '其他'
    }
  },

  onLoad: function() {
    var app = getApp()
    app.onCloudReady(function() {
      this.loadRecords()
    }.bind(this))
  },

  onShow: function() {
    var app = getApp()
    app.onCloudReady(function() {
      this.loadRecords()
    }.bind(this))
  },

  onPullDownRefresh: function() {
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadRecords: function() {
    this.setData({ loading: true, isEmpty: false })

    const db = wx.cloud.database()

    return db.collection('records')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        const records = res.data || []
        this.setData({
          records: records,
          loading: false,
          isEmpty: records.length === 0
        })
      })
      .catch(err => {
        console.error('获取记录失败:', err)
        this.setData({
          loading: false,
          isEmpty: true
        })
        wx.showToast({
          title: '加载失败: ' + (err.errMsg || '未知错误'),
          icon: 'none'
        })
      })
  },

  onDelete: function(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          const db = wx.cloud.database()
          db.collection('records').doc(id).remove()
            .then(() => {
              wx.hideLoading()
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadRecords()
            })
            .catch(err => {
              wx.hideLoading()
              console.error('删除记录失败:', err)
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
        }
      }
    })
  },

  formatDate: function(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  goToEdit: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/add/add?id=${id}`
    })
  },

  goToAdd: function() {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  }
})