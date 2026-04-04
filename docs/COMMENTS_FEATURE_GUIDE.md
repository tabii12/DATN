# 📝 Hướng dẫn Tích hợp Chức năng Bình luận Tour

## 📋 Tổng quan

Chức năng bình luận cho phép khách hàng đặt tour chia sẻ đánh giá về trải nghiệm. Chỉ những khách hàng đã **hoàn thành booking** mới có thể bình luận.

---

## 🏗️ Cấu trúc Frontend đã tạo

### 1. **CommentForm Component** - Form bình luận
📂 `app/(user)/components/CommentForm.tsx`
- Cho phép khách hàng nhập đánh giá (1-5 sao)
- Tiêu đề bình luận (5-100 ký tự)
- Nội dung bình luận (10-1000 ký tự)
- Kiểm tra booking của user trước khi cho phép bình luận
- Gửi dữ liệu bình luận tới backend

### 2. **CommentsDisplay Component** - Hiển thị bình luận
📂 `app/(user)/components/CommentsDisplay.tsx`
- Hiển thị danh sách bình luận đã được phê duyệt
- Tính toán đánh giá trung bình
- Lọc theo số sao
- Sắp xếp: mới nhất, cũ nhất, đánh giá cao, đánh giá thấp
- Hiển thị từng bình luận với người dùng, ngày, nội dung

### 3. **Admin Comments Management Page**
📂 `app/admin/comments/page.tsx`
- Xem tất cả bình luận (chờ duyệt, đã duyệt, từ chối)
- Thống kê: tổng số, chờ duyệt, đã duyệt, từ chối, đánh giá trung bình
- Chức năng: phê duyệt, từ chối, xóa bình luận
- Tìm kiếm theo tên, tiêu đề, nội dung
- Lọc theo trạng thái và số sao
- Modal xem chi tiết bình luận

---

## 🔧 Backend API cần thiết

### 1. **POST /api/comments** - Tạo bình luận mới
```
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json

Body:
{
  "tour_id": "64abc...",              // ID tour
  "user_id": "64def...",              // ID user (từ localStorage)
  "user_name": "Nguyễn Văn A",        // Tên người dùng
  "user_email": "user@email.com",     // Email người dùng
  "rating": 5,                        // 1-5
  "title": "Tour tuyệt vời",          // Tiêu đề
  "content": "Nội dung bình luận..."   // Nội dung
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "pending",              // Bình luận chờ duyệt
    ...
  }
}
```

---

### 2. **GET /api/comments** - Lấy danh sách bình luận
```
Query Parameters:
  - tour_id: string                   // ID tour (bắt buộc)
  - status: "approved|pending|rejected" // Lọc theo trạng thái
  - limit: number                     // Số lượng (mặc định: 20)
  - page: number                      // Trang (mặc định: 1)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "tour_id": "...",
      "user_id": "...",
      "user_name": "...",
      "user_email": "...",
      "rating": 5,
      "title": "...",
      "content": "...",
      "likes": 0,
      "status": "approved",
      "createdAt": "2026-04-04T...",
      "updatedAt": "2026-04-04T..."
    }
  ]
}
```

---

### 3. **GET /api/comments/admin/all** - Admin lấy tất cả bình luận
```
Headers:
  - Authorization: Bearer {token}     // Token admin

Query Parameters:
  - status: string                    // "pending", "approved", "rejected" hoặc trống (tất cả)
  - limit: number                     // Mặc định: 50
  - page: number                      // Mặc định: 1

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "tour_id": "...",
      "user_id": "...",
      "user_name": "...",
      "user_email": "...",
      "rating": 5,
      "title": "...",
      "content": "...",
      "likes": 0,
      "status": "pending",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 150,
  "page": 1
}
```

---

### 4. **PATCH /api/comments/admin/{id}/approve** - Phê duyệt bình luận
```
Headers:
  - Authorization: Bearer {token}     // Token admin
  - Content-Type: application/json

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "approved"
  }
}
```

---

### 5. **PATCH /api/comments/admin/{id}/reject** - Từ chối bình luận
```
Headers:
  - Authorization: Bearer {token}     // Token admin
  - Content-Type: application/json

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "rejected"
  }
}
```

---

### 6. **DELETE /api/comments/admin/{id}** - Xóa bình luận
```
Headers:
  - Authorization: Bearer {token}     // Token admin

Response:
{
  "success": true,
  "message": "Bình luận đã bị xóa"
}
```

---

### 7. **GET /api/bookings/user/check** - Kiểm tra user đã book tour
```
Query Parameters:
  - tour_id: string                   // ID tour

Headers:
  - Authorization: Bearer {token}

Response:
{
  "hasBooked": true,                  // true nếu user đã book tour này
  "bookingId": "64xyz..."
}
```

---

### 8. **GET /api/tours/{id}** - Lấy thông tin tour
```
Headers:
  - Authorization: Bearer {token}     // Optional

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Du lịch Nha Trang 3 ngày 2 đêm",
    ...
  }
}
```

---

## 📊 MongoDB Schema - Comments Collection

```javascript
{
  _id: ObjectId,
  tour_id: ObjectId,                // Reference to tours
  user_id: ObjectId,                // Reference to users
  user_name: String,                // Tên người dùng (copy để tiện)
  user_email: String,               // Email người dùng (copy để tiện)
  rating: Number,                   // 1-5 sao
  title: String,                    // Tiêu đề bình luận
  content: String,                  // Nội dung bình luận
  likes: Number,                    // Số lượt like (mặc định: 0)
  status: String,                   // "pending", "approved", "rejected"
  createdAt: Date,                  // Ngày tạo
  updatedAt: Date,                  // Ngày cập nhật
  
  // Optional fields
  images: [String],                 // URLs hình ảnh (nếu support việc upload ảnh)
  replies: [                         // Replies từ admin/moderator (future feature)
    {
      _id: ObjectId,
      admin_id: ObjectId,
      admin_name: String,
      content: String,
      createdAt: Date
    }
  ]
}
```

---

## ✅ Danh sách kiểm tra - Backend Implementation

- [ ] Tạo Collection Comments trong MongoDB
- [ ] Tạo Model Comment schema
- [ ] Tạo endpoint POST /api/comments (tạo bình luận)
  - [ ] Kiểm tra user đã đăng nhập
  - [ ] Kiểm tra user đã book tour này
  - [ ] Validate dữ liệu đầu vào
  - [ ] Lưu vào database với status = "pending"
- [ ] Tạo endpoint GET /api/comments (lấy danh sách)
  - [ ] Chỉ trả về bình luận đã phê duyệt (status: "approved")
  - [ ] Support phân trang
  - [ ] Support lọc theo tour_id
- [ ] Tạo endpoint GET /api/comments/admin/all (quan trị)
  - [ ] Kiểm tra quyền admin
  - [ ] Trả về tất cả bình luận theo trạng thái
- [ ] Tạo endpoint PATCH /api/comments/admin/{id}/approve
  - [ ] Kiểm tra quyền admin
  - [ ] Cập nhật status = "approved"
- [ ] Tạo endpoint PATCH /api/comments/admin/{id}/reject
  - [ ] Kiểm tra quyền admin
  - [ ] Cập nhật status = "rejected"
- [ ] Tạo endpoint DELETE /api/comments/admin/{id}
  - [ ] Kiểm tra quyền admin
  - [ ] Xóa bình luận khỏi database
- [ ] Tạo/Kiểm tra endpoint GET /api/bookings/user/check
  - [ ] Kiểm tra user đã book tour
  - [ ] Trả về boolean hasBooked

---

## 🔐 Logic kiểm tra booking

Khi user submit bình luận:

1. **Frontend** gọi GET /api/bookings/user/check?tour_id={tourId}
2. **Backend** kiểm tra:
   - User đã book tour này chưa?
   - Chuyến tour đã kết thúc (end_date) chưa? (Optional - để khuyến khích feedback sau chuyến đi)

```javascript
// Pseudocode
const hasBooking = await Booking.findOne({
  user_id: userId,
  tour_id: tourId,
  payment_status: "paid"
});

// Optional: Kiểm tra chuyến tour đã kết thúc
const bookingTrip = await Trip.findById(booking.trip_id);
const tripEnded = new Date(bookingTrip.end_date) < new Date();

return {
  hasBooked: !!hasBooking,
  canComment: !!hasBooking && tripEnded // Adjust logic as needed
};
```

---

## 🎨 Frontend Integration Points

### CommentForm Component
- Tự động kiểm tra booking khi mount
- Disable form nếu user chưa book
- Gửi POST /api/comments với token
- Call `onCommentAdded` callback khi thành công

### CommentsDisplay Component
- Gọi GET /api/comments?tour_id={tourId}&status=approved
- Re-fetch khi `refreshTrigger` prop thay đổi
- Hiển thị loading, error, empty states

### Admin Page
- Fetch GET /api/comments/admin/all khi mount
- Gọi PATCH endpoints để phê duyệt/từ chối
- Gọi DELETE endpoint để xóa
- Tự động load thông tin tour bằng GET /api/tours/{tourId}

---

## 📝 Testing Checklist

### User Flow
- [ ] User chưa đăng nhập → Hiển thị "Cần đăng nhập"
- [ ] User đăng nhập nhưng chưa book tour → Hiển thị "Cần phải đặt tour trước"
- [ ] User đã book tour → Hiển thị form bình luận
- [ ] Submit rỗng → Validate error
- [ ] Submit hợp lệ → Success message, form reset
- [ ] Bình luận trong status pending → Không hiển thị ở user

### Admin Flow
- [ ] Admin xem tất cả bình luận (pending, approved, rejected)
- [ ] Chi tiết bình luận trong modal
- [ ] Phê duyệt → Status changed to approved
- [ ] Từ chối → Status changed to rejected
- [ ] Xóa → Bình luận bị xóa khỏi database
- [ ] Tìm kiếm & lọc hoạt động đúng

---

## 🚀 Triển khai từng bước

1. **Tạo MongoDB schema & API endpoints** (Backend)
2. **Test API endpoints** bằng Postman/Insomnia
3. **Quan trọng**: Endpoint GET /api/bookings/user/check phải hoạt động trước
4. **Deploy backend** lên production
5. **Frontend** đã sẵn sàng - chỉ cần backend API hoạt động
6. **Test toàn bộ flow** trên staging
7. **Deploy to production**

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| "Bạn cần đăng nhập để bình luận" | Token không có trong localStorage | Kiểm tra user login |
| "Bạn cần phải đặt tour này trước" | API check booking trả về false | Verify booking data trong DB |
| Bình luận submit thành công nhưng không hiển thị | Status = pending, admin chưa phê duyệt | Check admin panel, phê duyệt bình luận |
| Admin không thấy bình luận | Permission/token issue | Verify admin middleware trên backend |
| CORS error | API response không có headers | Add CORS headers trên backend |

---

## 📞 Hỗ trợ

Nếu có câu hỏi, vui lòng liên hệ:
- Email: dev@example.com
- Slack: #tourism-app-dev

---

**Tạo lúc**: 2026-04-04
**Cập nhật lần cuối**: 2026-04-04
