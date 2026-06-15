# 实用工具小程序

这是一个基于微信云开发的小程序项目，提供图片处理工具和记录管理功能。

## 项目功能

### 图片工具
- 图片压缩
- 尺寸调整
- 格式转换
- 水印添加

### 记录管理（方向二：实用工具）
- **添加记录**：支持标题、内容、分类（工作/生活/学习/其他）
- **列表展示**：从云数据库读取并展示所有记录
- **删除记录**：支持删除已添加的记录
- **数据上云**：所有数据存储在云数据库，换设备登录数据仍在

## 技术架构

### 前端
- 微信小程序原生框架
- WXML + WXSS + JavaScript

### 后端
- 微信云开发
- 云数据库（records集合）
- 云函数（quickstartFunctions）

## 页面结构

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/index/index | 工具入口 |
| 记录列表 | pages/list/list | 展示所有记录 |
| 添加记录 | pages/add/add | 表单添加记录 |
| 图片压缩 | pages/compress/compress | 图片压缩功能 |
| 尺寸调整 | pages/resize/resize | 调整图片尺寸 |
| 格式转换 | pages/format/format | 图片格式转换 |
| 水印添加 | pages/watermark/watermark | 添加水印 |
| 关于 | pages/about/about | 关于页面 |

## 云函数说明

### quickstartFunctions
支持以下操作：
- `createCollection` - 创建records集合
- `selectRecord` - 查询当前用户的所有记录
- `insertRecord` - 添加新记录
- `updateRecord` - 更新记录
- `deleteRecord` - 删除记录

## 部署说明

1. 在微信开发者工具中打开项目
2. 开通云开发环境
3. 右键 `cloudfunctions/quickstartFunctions` 文件夹，选择「上传并部署：云端安装依赖」
4. 在云开发控制台创建 `records` 集合（或通过调用 createCollection 云函数自动创建）
5. 点击「上传」发布体验版

## 开发进度

### 第二次课（方向二：实用工具）
- [x] 添加功能：表单页面，用户能输入内容并提交
- [x] 列表展示：列表页面，能从云数据库读取并展示所有记录
- [x] 数据上云：所有数据写入云数据库
- [x] 至少2个页面：添加页 + 列表页
- [x] 删除已有记录（加分项）
- [x] 云数据库已启用：records集合
- [x] 云函数已部署：quickstartFunctions
- [x] 页面数量 ≥ 2：通过底部tab正常跳转

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

