const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

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

const createCollection = async () => {
  try {
    await db.createCollection("records");
    await db.createCollection("users");
    await db.createCollection("images");
    return {
      success: true,
      message: "集合创建成功",
    };
  } catch (e) {
    return {
      success: true,
      message: "集合已存在",
    };
  }
};

const login = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const result = await db.collection("users").where({
      _openid: openid,
    }).get();

    if (result.data && result.data.length > 0) {
      await db.collection("users").doc(result.data[0]._id).update({
        data: {
          lastLoginTime: new Date(),
        },
      });
      return {
        success: true,
        user: result.data[0],
      };
    } else {
      const { nickName, avatarUrl } = event.data || {};
      const addResult = await db.collection("users").add({
        data: {
          nickName: nickName || "用户",
          avatarUrl: avatarUrl || "",
          createTime: new Date(),
          lastLoginTime: new Date(),
        },
      });
      return {
        success: true,
        user: {
          _id: addResult._id,
          _openid: openid,
          nickName: nickName || "用户",
          avatarUrl: avatarUrl || "",
          createTime: new Date(),
          lastLoginTime: new Date(),
        },
      };
    }
  } catch (e) {
    if (e.message && e.message.includes("duplicate key")) {
      try {
        const retryResult = await db.collection("users").where({
          _openid: openid,
        }).get();
        if (retryResult.data && retryResult.data.length > 0) {
          return {
            success: true,
            user: retryResult.data[0],
          };
        }
      } catch (retryErr) {
        console.error('Retry login failed:', retryErr);
      }
    }
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const updateUserInfo = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { nickName, avatarUrl } = event.data;
    console.log('updateUserInfo params:', { nickName, avatarUrl, openid });
    
    const result = await db.collection("users").where({
      _openid: openid,
    }).get();

    if (result.data && result.data.length > 0) {
      const user = result.data[0];
      await db.collection("users").doc(user._id).update({
        data: {
          nickName: nickName,
          avatarUrl: avatarUrl,
          lastLoginTime: new Date(),
        },
      });
      return {
        success: true,
        message: "用户信息更新成功",
        user: { ...user, nickName, avatarUrl, lastLoginTime: new Date() },
      };
    } else {
      const addResult = await db.collection("users").add({
        data: {
          nickName: nickName || "用户",
          avatarUrl: avatarUrl || "",
          createTime: new Date(),
          lastLoginTime: new Date(),
        },
      });
      return {
        success: true,
        message: "用户创建成功",
        user: {
          _id: addResult._id,
          _openid: openid,
          nickName: nickName || "用户",
          avatarUrl: avatarUrl || "",
          createTime: new Date(),
          lastLoginTime: new Date(),
        },
      };
    }
  } catch (e) {
    console.error('updateUserInfo error:', e);
    if (e.message && e.message.includes("duplicate key")) {
      try {
        const retryResult = await db.collection("users").where({
          _openid: openid,
        }).get();
        if (retryResult.data && retryResult.data.length > 0) {
          const user = retryResult.data[0];
          await db.collection("users").doc(user._id).update({
            data: {
              nickName: nickName,
              avatarUrl: avatarUrl,
              lastLoginTime: new Date(),
            },
          });
          return {
            success: true,
            message: "用户信息更新成功",
            user: { ...user, nickName, avatarUrl, lastLoginTime: new Date() },
          };
        }
      } catch (retryErr) {
        console.error('Retry updateUserInfo failed:', retryErr);
      }
    }
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const selectRecord = async () => {
  const wxContext = cloud.getWXContext();
  try {
    const result = await db.collection("records")
      .where({
        _openid: wxContext.OPENID,
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
      errMsg: e.message,
      data: [],
    };
  }
};

const insertRecord = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    const { title, content, category, createTime } = event.data;
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
      errMsg: e.message,
    };
  }
};

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
      errMsg: e.message,
    };
  }
};

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
      errMsg: e.message,
    };
  }
};

const uploadImage = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { fileContent, cloudPath, toolType, originalSize, processedSize } = event.data;
    
    const uploadResult = await cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: Buffer.from(fileContent, "base64"),
    });

    const addResult = await db.collection("images").add({
      data: {
        cloudFileID: uploadResult.fileID,
        imageUrl: uploadResult.fileID,
        toolType: toolType,
        originalSize: originalSize || 0,
        processedSize: processedSize || 0,
        createTime: new Date(),
      },
    });

    return {
      success: true,
      fileID: uploadResult.fileID,
      imageId: addResult._id,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const getImageList = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { toolType, page = 0, size = 20 } = event.data || {};
    let query = db.collection("images").where({
      _openid: openid,
    });

    if (toolType) {
      query = query.where({ toolType: toolType });
    }

    const result = await query
      .orderBy("createTime", "desc")
      .skip(page * size)
      .limit(size)
      .get();

    return {
      success: true,
      data: result.data,
      total: result.data.length,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
      data: [],
    };
  }
};

const getImageCount = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const result = await db.collection("images").where({
      _openid: openid,
    }).count();

    const typeResult = await db.collection("images").where({
      _openid: openid,
    }).get();

    const typeCount = {};
    typeResult.data.forEach(item => {
      typeCount[item.toolType] = (typeCount[item.toolType] || 0) + 1;
    });

    return {
      success: true,
      total: result.total,
      typeCount: typeCount,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
      total: 0,
      typeCount: {},
    };
  }
};

const deleteImage = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { _id } = event.data;

    const imageResult = await db.collection("images").where({
      _id: _id,
      _openid: openid,
    }).get();

    if (imageResult.data && imageResult.data.length > 0) {
      const fileID = imageResult.data[0].cloudFileID;
      
      await cloud.deleteFile({
        fileList: [fileID],
      });

      await db.collection("images").doc(_id).remove();

      return {
        success: true,
        message: "删除成功",
      };
    } else {
      return {
        success: false,
        errMsg: "图片不存在或无权限",
      };
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

exports.main = async (event, context) => {
  switch (event.type) {
    case "getOpenId":
      return await getOpenId();
    case "getMiniProgramCode":
      return await getMiniProgramCode();
    case "createCollection":
      return await createCollection();
    case "login":
      return await login(event);
    case "updateUserInfo":
      return await updateUserInfo(event);
    case "selectRecord":
      return await selectRecord();
    case "insertRecord":
      return await insertRecord(event);
    case "updateRecord":
      return await updateRecord(event);
    case "deleteRecord":
      return await deleteRecord(event);
    case "uploadImage":
      return await uploadImage(event);
    case "getImageList":
      return await getImageList(event);
    case "getImageCount":
      return await getImageCount();
    case "deleteImage":
      return await deleteImage(event);
    default:
      return {
        success: false,
        errMsg: "未知的操作类型",
      };
  }
};