Page({
  data: {
    title: '',
    content: '',
    category: 'work',
    categories: [
      { value: 'work', name: '工作' },
      { value: 'life', name: '生活' },
      { value: 'study', name: '学习' },
      { value: 'other', name: '其他' }
    ],
    submitting: false
  },

  onTitleInput: function(e) {
    this.setData({ title: e.detail.value })
  },

  onContentInput: function(e) {
    this.setData({ content: e.detail.value })
  },

  onCategoryChange: function(e) {
    this.setData({ category: e.detail.value })
  },

  onSubmit: function() {
    const { title, content, category, submitting } = this.data

    if (submitting) return

    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }

    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    var app = getApp()
    app.onCloudReady(function() {
      this.doSubmit(title, content, category)
    }.bind(this))
  },

  doSubmit: function(title, content, category) {
    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    const db = wx.cloud.database()

    db.collection('records').add({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category,
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: '添加成功', icon: 'success' })
      this.setData({ title: '', content: '', category: 'work' })
    }).catch(err => {
      wx.hideLoading()
      this.setData({ submitting: false })
      console.error('添加记录失败:', err)
      wx.showToast({ title: '添加失败', icon: 'none' })
    })
  },

  onReset: function() {
    this.setData({ title: '', content: '', category: 'work' })
  }
})