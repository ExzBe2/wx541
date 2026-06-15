const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 获取openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 获取小程序二维码
const getMiniProgramCode = async () => {
  const resp = await cloud.openapi.wxacode.get({
    path: "pages/index/index",
  });
  const { buffer } = resp;
  const upload = await cloud.uploadFile({
    cloudPath: "code.png",
    fileContent: buffer,
  });
  return upload.fileID;
};

// 创建集合
const createCollection = async () => {
  try {
    // 创建records集合用于存储用户记录
    await db.createCollection("records");
    return {
      success: true,
      message: "records集合创建成功",
    };
  } catch (e) {
    // 集合已存在
    return {
      success: true,
      message: "records集合已存在",
    };
  }
};

// 查询数据 - 查询当前用户的记录
const selectRecord = async () => {
  const wxContext = cloud.getWXContext();
  try {
    // 返回当前用户的所有记录
    const result = await db.collection("records")
      .where({
        _openid: wxContext.OPENID
      })
      .orderBy("createTime", "desc")
      .get();
    return {
      success: true,
      data: result.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
      data: [],
    };
  }
};

// 新增数据
const insertRecord = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    const { title, content, category, createTime } = event.data;
    // 插入数据，自动添加openid
    const result = await db.collection("records").add({
      data: {
        title: title,
        content: content,
        category: category || "other",
        createTime: createTime || new Date(),
        _openid: wxContext.OPENID,
      },
    });
    return {
      success: true,
      data: {
        _id: result._id,
        title,
        content,
        category,
      },
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 更新数据
const updateRecord = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    const { _id, title, content, category } = event.data;
    await db.collection("records")
      .where({
        _id: _id,
        _openid: wxContext.OPENID,
      })
      .update({
        data: {
          title: title,
          content: content,
          category: category,
          updateTime: new Date(),
        },
      });
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 删除数据
const deleteRecord = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection("records")
      .where({
        _id: event.data._id,
        _openid: wxContext.OPENID,
      })
      .remove();
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "getOpenId":
      return await getOpenId();
    case "getMiniProgramCode":
      return await getMiniProgramCode();
    case "createCollection":
      return await createCollection();
    case "selectRecord":
      return await selectRecord();
    case "insertRecord":
      return await insertRecord(event);
    case "updateRecord":
      return await updateRecord(event);
    case "deleteRecord":
      return await deleteRecord(event);
    default:
      return {
        success: false,
        errMsg: "未知的操作类型",
      };
  }
};
