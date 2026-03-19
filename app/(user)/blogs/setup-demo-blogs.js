
const API_BASE = 'https://db-datn-six.vercel.app/api/blogs';

const demoBlogs = [
  {
    title: "10 Điểm Du Lịch Phải Đến Ở Hà Nội",
    slug: "10-diem-du-lich-ha-noi",
    excerpt: "Khám phá 10 địa điểm du lịch nổi tiếng nhất ở Hà Nội mà bộ backpacker không nên bỏ lỡ.",
    content: `<h2>1. Hồ Hoàn Kiếm</h2>
<p>Hồ Hoàn Kiếm là một trong những địa điểm nổi tiếng nhất của Hà Nội. Nằm giữa lòng thành phố, hồ được bao quanh bởi những con phố cổ đầy quyến rũ. Bạn có thể đi bộ xung quanh hồ vào sáng sớm để tận hưởng không khí tươi mới và nhìn thấy nhiều người dân địa phương tập thể dục.</p>

<h2>2. Phố Cổ Hà Nội</h2>
<p>Phố cổ Hà Nội là một khu vực lịch sử với các con phố hẹp và những ngôi nhà cũ kỹ. Đây là nơi tập trung của các gian hàng thủ công mỹ nghệ, cửa hàng suvenir truyền thống, và những quán ăn đặc sản.</p>

<h2>3. Chùa Một Cột</h2>
<p>Chùa Một Cột là một biểu tượng kiến trúc độc đáo của Hà Nội. Ngôi chùa được xây dựng trên một cột đá nhô ra từ một hồ nước nhỏ, tạo nên một bức tranh lãng mạn và tâm linh.</p>

<h2>4. Bảo Tàng Dân Tộc Học</h2>
<p>Bảo tàng Dân Tộc Học là nơi lưu giữ những hiện vật về các dân tộc thiểu số ở Việt Nam. Đây là một điểm đến lý tưởng để hiểu hơn về đa dạng văn hóa của đất nước.</p>

<h2>5. Văn Miếu - Quốc Tử Giám</h2>
<p>Văn Miếu là khu tế lễ thờ cúng Khổng Tử. Đây là một trong những danh lam thắng cảnh lâu đời nhất của Hà Nội với kiến trúc truyền thống và cảnh quan tỉnh mịch.</p>`,
    images: [
      { image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
      { image_url: "https://images.unsplash.com/photo-1515226311763-ef58db3994fb?w=800&q=80" },
      { image_url: "https://images.unsplash.com/photo-1522156573150-ddbb3b2eaf18?w=800&q=80" }
    ]
  },
  {
    title: "Phố Ẩm Thực: Những Quán Ăn Phải Thử Ở Sài Gòn",
    slug: "pho-am-thuc-sai-gon",
    excerpt: "Tìm hiểu về các quán ăn nổi tiếng nhất ở Sài Gòn với những món ăn độc đáo và hấp dẫn.",
    content: `<h2>Bánh Mì Ký Túc</h2>
<p>Bánh mì Ký Túc là một trong những tiệm bánh mì nổi tiếng nhất ở Sài Gòn. Với những ổ bánh mì giòn rụm bên ngoài, mềm bên trong, kết hợp với những loại pâté và chả bò chuẩn vị, bánh mì ở đây chắc chắn sẽ là một trong những trải nghiệm ẩm thực không nên bỏ lỡ.</p>

<h2>Phở Bò Tây Hồ</h2>
<p>Phở bò Tây Hồ có hơn 40 năm kinh doanh. Nước dùng được nấu suốt đêm với những xương bò và gia vị riêng, tạo nên một hương vị độc đáo. Thịt bò tươi sống được cắt dưới dạng lát mỏng, khi rót nước dùng nóng vào sẽ nấu chín từ từ, giữ được độ mềm và ngọt ngon.</p>

<h2>Gỏi Cuốn Chị Hồng</h2>
<p>Gỏi cuốn Chị Hồng là một quán gỏi cuốn nổi tiếng với các cuốn tươi mát, làm từ các nguyên liệu tốt nhất. Nước chấm đậu phộng có vị chuẩn, không quá mặn hay ngọt.</p>

<h2>Cơm Tấm Thanh</h2>
<p>Cơm Tấm Thanh là một trong những quán cơm tấm ăn sáng nổi tiếng nhất ở Sài Gòn. Với cơm tấm, thịt nướng, chả cốm, ngàn lẻ một, mỗi suất cơm đều được chế biến tươi mới và hấp dẫn.</p>`,
    images: [
      { image_url: "https://images.unsplash.com/photo-1555521760-cb7bbe61dc14?w=800&q=80" },
      { image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
      { image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80" }
    ]
  },
  {
    title: "Hà Giang - Vẻ Đẹp Hoang Sơ Của Mảnh Đất Đá",
    slug: "ha-giang-ve-dep-hoang-so",
    excerpt: "Khám phá vẻ đẹp hoang sơ của Hà Giang - một trong những điểm đến tuyệt vời cho những người yêu thích phượt.",
    content: `<h2>Mọi Lúc Đến Hà Giang Cũng Tuyệt Vời</h2>
<p>Hà Giang là một tỉnh vùng sơn cước nằm ở phía bắc của Việt Nam. Với những đỏ đất đặc trưng, những dãy núi hiểm trở, và những thung lũng sâu kỳ vĩ, Hà Giang chắc chắn sẽ mang đến cho bạn những trải nghiệm không quên.</p>

<h2>Đèo Khau Phạ</h2>
<p>Đèo Khau Phạ là một trong những đèo núi nguy hiểm nhất ở Việt Nam. Từ đỉnh đèo, bạn có thể nhìn thấy cảnh tượng hùng vĩ của làng Mèo Vạc. Dường như toàn bộ thế giới nằm dưới chân bạn, tạo nên cảm giác đầy mạnh mẽ.</p>

<h2>Làng Mèo Vạc</h2>
<p>Làng Mèo Vạc nằm trên một cao nguyên cao. Những ngôi nhà gỗ của người Mèo tán tỏa xung quanh, tạo nên một cảnh sắc tuyệt đẹp. Bạn có thể tương tác với cộng đồng địa phương, tìm hiểu về văn hóa và cuộc sống của họ.</p>

<h2>Thung Lũng Tình Yêu</h2>
<p>Thung lũng Tình Yêu với những tảng đá khổng lồ hình thành tự nhiên, tạo nên một cảnh tượng lãng mạn. Đây là hình nền tuyệt vời cho những bức ảnh du lịch của bạn.</p>`,
    images: [
      { image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80" },
      { image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
      { image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80" }
    ]
  },
  {
    title: "Khám Phá Vịnh Hạ Long",
    slug: "kham-pha-vinh-ha-long",
    excerpt: "Một trong những kỳ quan thiên nhiên của Việt Nam – Vịnh Hạ Long đẹp mê hồn.",
    content: "<p>Vịnh Hạ Long nổi tiếng với hàng nghìn đảo đá vôi lớn nhỏ, nước biển xanh biếc...</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" }]
  },
  {
    title: "Lễ Hội Đèn Lồng Hội An",
    slug: "le-hoi-den-long-hoi-an",
    excerpt: "Một đêm rực rỡ ánh sáng đèn lồng trên phố cổ Hội An.",
    content: "<p>Vào mỗi đêm rằm, Hội An khoác lên mình chiếc áo lộng lẫy của hàng nghìn chiếc đèn...</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1573720783628-7d3f0b2b64a8?w=800&q=80" }]
  },
  {
    title: "Điểm Đến Mới: Đà Lạt Hoa",
    slug: "diem-den-da-lat-hoa",
    excerpt: "Đà Lạt vẫn là thành phố mộng mơ với khí hậu trong lành và sắc hoa bốn mùa.",
    content: "<p>Đà Lạt là điểm tới yêu thích của nhiều cặp đôi …</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1563257766-512619ca4558?w=800&q=80" }]
  },
  {
    title: "Tour Cần Thơ – Miệt Vườn Cửu Long",
    slug: "tour-can-tho-miet-vuon",
    excerpt: "Thăm miệt vườn sông nước, thử trái cây tươi ngọt ngào ở Cần Thơ.",
    content: "<p>Cần Thơ nổi tiếng với những vườn trái cây sai trĩu, kênh rạch chằng chịt …</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" }]
  },
  {
    title: "Ẩm Thực Nha Trang – Biển và Hải Sản",
    slug: "am-thuc-nha-trang-hai-san",
    excerpt: "Hải sản tươi rói, bún chả cá và bún sứa – đặc sản không thể bỏ lỡ ở Nha Trang.",
    content: "<p>Nha Trang là thiên đường ẩm thực hải sản với hàng trăm nhà hàng ven biển …</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1555992336-c0a0a3e7a827?w=800&q=80" }]
  },
  {
    title: "Du Lịch Miền Tây: Đồng Tháp Mười",
    slug: "du-lich-mien-tay-dong-thap-muoi",
    excerpt: "Khám phá vùng đất Đồng Tháp Mười với những cánh đồng lúa xanh mướt và kênh rạch chằng chịt.",
    content: "<p>Đồng Tháp Mười là một trong những vùng đất nổi tiếng của miền Tây sông nước. Với những cánh đồng lúa bát ngát, kênh rạch uốn lượn, và những vườn cây ăn trái sai cành, nơi đây mang đến cho du khách những trải nghiệm tuyệt vời về thiên nhiên và văn hóa địa phương.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" }]
  },
  {
    title: "Phú Quốc: Đảo Ngọc Của Việt Nam",
    slug: "phu-quoc-dao-ngoc-viet-nam",
    excerpt: "Phú Quốc với những bãi biển tuyệt đẹp, hải sản tươi ngon và những khu nghỉ dưỡng sang trọng.",
    content: "<p>Phú Quốc là hòn đảo lớn nhất Việt Nam, nổi tiếng với những bãi biển cát trắng mịn, nước biển xanh ngắt. Ngoài ra, Phú Quốc còn có những khu nghỉ dưỡng cao cấp, những vườn tiêu xanh mát và hải sản tươi ngon.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" }]
  },
  {
    title: "Lễ Hội Cốm Vòng Hội An",
    slug: "le-hoi-com-vong-hoi-an",
    excerpt: "Trải nghiệm lễ hội cốm vòng truyền thống tại phố cổ Hội An.",
    content: "<p>Lễ hội Cốm Vòng là một trong những lễ hội truyền thống đặc sắc của Hội An. Du khách có thể tham gia vào các hoạt động như múa lân, đốt pháo hoa và thưởng thức những món ăn đặc trưng của địa phương.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1573720783628-7d3f0b2b64a8?w=800&q=80" }]
  },
  {
    title: "Khám Phá Sapa: Thị Trấn Trong Sương",
    slug: "kham-pha-sapa-thi-tran-suong",
    excerpt: "Sapa với những ruộng bậc thang tuyệt đẹp và văn hóa dân tộc thiểu số phong phú.",
    content: "<p>Sapa nằm ở vùng núi Tây Bắc Việt Nam, nổi tiếng với những ruộng bậc thang xanh mướt, những bản làng của người dân tộc thiểu số và khí hậu mát mẻ quanh năm. Đây là điểm đến lý tưởng cho những ai yêu thích trekking và khám phá văn hóa.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80" }]
  },
  {
    title: "Ẩm Thực Huế: Hoàng Cung Của Ẩm Thực Việt",
    slug: "am-thuc-hue-hoang-cung-am-thuc",
    excerpt: "Khám phá những món ăn cung đình đặc trưng của cố đô Huế.",
    content: "<p>Huế là nơi lưu giữ những món ăn cung đình tinh tế và phong phú. Từ bánh bèo, bánh nậm đến những món thịt gà nấu lá chanh, tất cả đều mang đậm hương vị truyền thống của vùng đất cố đô.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1555521760-cb7bbe61dc14?w=800&q=80" }]
  },
  {
    title: "Du Lịch Ninh Bình: Tràng An Kỳ Quan",
    slug: "du-lich-ninh-binh-trang-an",
    excerpt: "Khám phá quần thể danh thắng Tràng An với những hang động và sông nước huyền bí.",
    content: "<p>Tràng An Ninh Bình là một trong những kỳ quan thiên nhiên của Việt Nam, với những hang động đá vôi, sông nước uốn lượn và những cánh đồng lúa xanh mướt. Du khách có thể đi thuyền kayak để khám phá vẻ đẹp này.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" }]
  },
  {
    title: "Festival Hoa Đà Lạt",
    slug: "festival-hoa-da-lat",
    excerpt: "Tham gia lễ hội hoa hàng năm tại thành phố ngàn hoa Đà Lạt.",
    content: "<p>Mỗi năm, Đà Lạt tổ chức lễ hội hoa với hàng nghìn loài hoa khoe sắc. Đây là dịp để du khách chiêm ngưỡng vẻ đẹp của những vườn hoa, tham gia các hoạt động văn hóa và thưởng thức đặc sản địa phương.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1563257766-512619ca4558?w=800&q=80" }]
  },
  {
    title: "Du Lịch Côn Đảo: Địa Ngục Trên Trời",
    slug: "du-lich-con-dao-dia-nguc-tren-troi",
    excerpt: "Khám phá quần đảo Côn Đảo với lịch sử hào hùng và thiên nhiên hoang sơ.",
    content: "<p>Côn Đảo là nơi lưu giữ những dấu tích lịch sử của nhà tù Côn Đảo. Bên cạnh đó, quần đảo này còn có những bãi biển đẹp, rừng nguyên sinh và hệ sinh thái biển phong phú.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" }]
  },
  {
    title: "Ẩm Thực Phan Thiết: Cá và Ốc",
    slug: "am-thuc-phan-thiet-ca-oc",
    excerpt: "Thưởng thức hải sản tươi ngon tại Phan Thiết, đặc biệt là cá và ốc.",
    content: "<p>Phan Thiết nổi tiếng với những món hải sản tươi ngon, đặc biệt là cá và ốc. Du khách có thể thưởng thức những món ăn này tại các nhà hàng ven biển hoặc tự tay chế biến tại chỗ.</p>",
    images: [{ image_url: "https://images.unsplash.com/photo-1555992336-c0a0a3e7a827?w=800&q=80" }]
  }
];

async function createDemoBlogs() {
  console.log('🚀 Bắt đầu tạo các blog demo...\n');

  for (const blog of demoBlogs) {
    try {
      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blog),
      });

      if (response.ok) {
        console.log(`✅ Tạo blog thành công: "${blog.title}"`);
      } else {
        const error = await response.json();
        console.log(`⚠️ Lỗi tạo blog: "${blog.title}" - ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n✨ Hoàn thành!');
}

createDemoBlogs();
