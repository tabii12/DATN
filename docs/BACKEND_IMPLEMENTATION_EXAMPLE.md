# Backend Implementation Template - Comments Feature

Dưới đây là ví dụ code backend (Node.js/Express/MongoDB) để tích hợp chức năng bình luận:

---

## 📦 Models

### Comment Model

```javascript
// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user_name: {
      type: String,
      required: true
    },
    user_email: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      trim: true
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
      trim: true
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for queries
commentSchema.index({ tour_id: 1, status: 1 });
commentSchema.index({ user_id: 1 });
commentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
```

---

## 🔌 API Routes & Controllers

### Comment Routes

```javascript
// routes/comments.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth, adminAuth } = require('../middleware/auth');

// User routes
router.post('/', auth, commentController.createComment);
router.get('/', commentController.getComments);

// Admin routes
router.get('/admin/all', adminAuth, commentController.getAllComments);
router.patch('/admin/:id/approve', adminAuth, commentController.approveComment);
router.patch('/admin/:id/reject', adminAuth, commentController.rejectComment);
router.delete('/admin/:id', adminAuth, commentController.deleteComment);

module.exports = router;
```

### Comment Controller

```javascript
// controllers/commentController.js
const Comment = require('../models/Comment');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

// ✅ Tạo bình luận mới
exports.createComment = async (req, res) => {
  try {
    const { tour_id, rating, title, content } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!tour_id || !rating || !title || !content) {
      return res.status(400).json({ success: false, message: 'Thiếu trường bắt buộc' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1-5' });
    }

    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({ success: false, message: 'Tiêu đề phải từ 5-100 ký tự' });
    }

    if (content.length < 10 || content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Nội dung phải từ 10-1000 ký tự' });
    }

    // Kiểm tra user đã book tour chưa
    const booking = await Booking.findOne({
      user_id: userId,
      tour_id: tour_id,
      payment_status: 'paid'
    });

    if (!booking) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn cần phải đặt tour này trước khi có thể bình luận' 
      });
    }

    // Kiểm tra user chưa bình luận tour này (optional)
    const existingComment = await Comment.findOne({
      user_id: userId,
      tour_id: tour_id
    });

    if (existingComment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã bình luận tour này rồi. Chỉ được 1 bình luận/tour.' 
      });
    }

    // Tạo bình luận
    const comment = new Comment({
      tour_id,
      user_id: userId,
      user_name: req.user.name,
      user_email: req.user.email,
      rating,
      title,
      content,
      status: 'pending' // Chờ admin phê duyệt
    });

    await comment.save();

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Bình luận đã được gửi. Vui lòng chờ admin phê duyệt.'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ✅ Lấy danh sách bình luận (public - chỉ approved)
exports.getComments = async (req, res) => {
  try {
    const { tour_id, status, page = 1, limit = 20 } = req.query;

    if (!tour_id) {
      return res.status(400).json({ success: false, message: 'Thiếu tour_id' });
    }

    const query = {
      tour_id,
      status: status || 'approved' // Default: chỉ hiển thị approved
    };

    const skip = (page - 1) * limit;

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ✅ Admin: Lấy tất cả bình luận
exports.getAllComments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('tour_id', 'name slug')
      .populate('user_id', 'name email');

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ✅ Admin: Phê duyệt bình luận
exports.approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    res.json({
      success: true,
      data: comment,
      message: 'Bình luận đã được phê duyệt'
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ✅ Admin: Từ chối bình luận
exports.rejectComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    res.json({
      success: true,
      data: comment,
      message: 'Bình luận đã bị từ chối'
    });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ✅ Admin: Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    res.json({
      success: true,
      message: 'Bình luận đã bị xóa'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
```

---

## 🔐 Booking Check Route

```javascript
// routes/bookings.js (thêm route mới)
router.get('/user/check', auth, async (req, res) => {
  try {
    const { tour_id } = req.query;
    const userId = req.user._id;

    if (!tour_id) {
      return res.status(400).json({ success: false, message: 'Thiếu tour_id' });
    }

    const booking = await Booking.findOne({
      user_id: userId,
      tour_id: tour_id,
      payment_status: 'paid'
    });

    res.json({
      success: true,
      hasBooked: !!booking,
      bookingId: booking?._id || null
    });
  } catch (error) {
    console.error('Error checking booking:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});
```

---

## 🔗 Server Configuration

```javascript
// app.js hoặc server.js - thêm routes
const commentRoutes = require('./routes/comments');

app.use('/api/comments', commentRoutes);
```

---

## 📊 Database Indexes (Quan trọng)

```javascript
// Chạy một lần sau khi deploy
db.comments.createIndex({ tour_id: 1, status: 1 });
db.comments.createIndex({ user_id: 1 });
db.comments.createIndex({ createdAt: -1 });
db.comments.createIndex({ tour_id: 1 });
```

---

## ✅ Testing với Postman

### 1. Tạo bình luận
```
POST /api/comments
Headers:
  Authorization: Bearer {token_user}
  Content-Type: application/json

Body:
{
  "tour_id": "64abc123...",
  "rating": 5,
  "title": "Tour tuyệt vời",
  "content": "Nội dung bình luận chi tiết ở đây..."
}
```

### 2. Lấy bình luận của tour
```
GET /api/comments?tour_id=64abc123...&page=1&limit=20
```

### 3. Admin: Lấy tất cả (chờ duyệt)
```
GET /api/comments/admin/all?status=pending
Headers:
  Authorization: Bearer {token_admin}
```

### 4. Admin: Phê duyệt
```
PATCH /api/comments/admin/64xyz123.../approve
Headers:
  Authorization: Bearer {token_admin}
```

### 5. Kiểm tra booking
```
GET /api/bookings/user/check?tour_id=64abc123...
Headers:
  Authorization: Bearer {token_user}
```

---

## 🎯 Notes quan trọng

1. **Status default = 'pending'** - Bình luận mới cần admin phê duyệt trước khi hiển thị
2. **1 user = 1 comment/tour** - Để tránh spam (optional, có thể bỏ check này)
3. **Chỉ show approved comments** - User chỉ thấy bình luận đã phê duyệt
4. **Admin xem tất cả** - Admin trang quản lý xem pending, approved, rejected
5. **Timestamps** - Tự động record createdAt, updatedAt
6. **Indexes** - Tạo indexes ngay để query nhanh

---

Tài liệu này được tạo cho dự án DATN - Hệ thống du lịch trực tuyến.
