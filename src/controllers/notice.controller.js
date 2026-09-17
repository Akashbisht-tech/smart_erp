const Notice = require("../models/notices.model");



const createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      targetRole,
      departmentId,
      attachment,
      expiresAt,
    } = req.body;

    // console.log(req.user.id);
    const notice = await Notice.create({
      title,
      content,
      createdBy: req.user.id,
      targetRole,
      departmentId,
      attachment,
      expiresAt,
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email role")
      .populate("departmentId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const publishNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    if (notice.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Notice is already published",
      });
    }

    notice.isPublished = true;
    notice.publishedAt = new Date();

    await notice.save();

    res.status(200).json({
      success: true,
      message: "Notice published successfully",
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createNotice,
  getNotices,
  publishNotice,
};