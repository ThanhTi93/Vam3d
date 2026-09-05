export interface Episode {
  name: string;
  url: string;
  bunnyVideoId?: string;
  bunnyStatus?: string;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  thumbnail: string;
  banner: string;
  category: "phim-le" | "phim-bo" | "chieu-rap" | "hoat-hinh" | string;
  genres: string[];
  rating: number;
  votes: number;
  year: number;
  duration: string;
  quality: string;
  sub: string;
  director: string;
  cast: string[];
  description: string;
  videoUrl: string;
  views: number;
  isHot: boolean;
  episodes?: Episode[];
}

export const movies: Movie[] = [
  {
    id: "dune-part-two",
    title: "Dune: Hành Tinh Cát - Phần 2",
    originalTitle: "Dune: Part Two",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80",
    category: "chieu-rap",
    genres: ["Hành Động", "Khoa Học Viễn Tưởng", "Phiêu Lưu"],
    rating: 9.3,
    votes: 2840,
    year: 2024,
    duration: "166 phút",
    quality: "UltraHD 4K",
    sub: "Vietsub",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler"],
    description: "Dune: Part Two sẽ khám phá hành trình tiếp theo của Paul Atreides khi anh hợp nhất với Chani và người Fremen để trả thù những kẻ âm mưu hủy diệt gia đình mình. Đối mặt với sự lựa chọn giữa tình yêu của đời mình và số phận của vũ trụ được biết đến, Paul nỗ lực ngăn chặn một tương lai khủng khiếp mà chỉ anh mới có thể thấy trước.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    views: 458920,
    isHot: true
  },
  {
    id: "lat-mat-7",
    title: "Lật Mặt 7: Một Điều Ước",
    originalTitle: "Face Off 7: One Wish",
    thumbnail: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
    category: "chieu-rap",
    genres: ["Tình Cảm", "Gia Đình", "Kịch Tính"],
    rating: 9.1,
    votes: 1980,
    year: 2024,
    duration: "112 phút",
    quality: "FullHD 1080p",
    sub: "Thuyết Minh",
    director: "Lý Hải",
    cast: ["Thanh Hiền", "Trương Minh Cường", "Đinh Y Nhung", "Quách Ngọc Tuyên"],
    description: "Bộ phim xoay quanh câu chuyện gia đình cảm động của bà Hai và 5 người con đã khôn lớn. Khi bà Hai gặp tai nạn chấn thương chân, các con ai cũng bận rộn với cuộc sống và công việc riêng ở những vùng đất khác nhau. Liệu ai trong số họ sẽ về chăm sóc người mẹ già?",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    views: 389200,
    isHot: true
  },
  {
    id: "stranger-things-s4",
    title: "Cậu Bé Mất Tích (Mùa 4)",
    originalTitle: "Stranger Things (Season 4)",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=1600&auto=format&fit=crop&q=80",
    category: "phim-bo",
    genres: ["Kinh Dị", "Khoa Học Viễn Tưởng", "Bí Ẩn"],
    rating: 9.4,
    votes: 3410,
    year: 2022,
    duration: "9 tập",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "The Duffer Brothers",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
    description: "Đã sáu tháng kể từ Trận chiến Starcourt, nơi mang lại nỗi khiếp sợ và sự tàn phá cho Hawkins. Vật lộn với hậu quả, nhóm bạn của chúng ta lần đầu tiên bị chia tách - và việc điều hướng sự phức tạp của trường trung học không làm mọi việc dễ dàng hơn. Trong thời điểm dễ bị tổn thương nhất này, một mối đe dọa siêu nhiên mới và đáng sợ xuất hiện, bày ra một bí ẩn khủng khiếp mà nếu được giải quyết, cuối cùng có thể chấm dứt nỗi kinh hoàng của Thế giới Ngược.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    views: 520440,
    isHot: true,
    episodes: [
      {
        name: "Tập 1: Câu lạc bộ Hellfire",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      {
        name: "Tập 2: Lời nguyền của Vecna",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      {
        name: "Tập 3: Quái vật và Siêu anh hùng",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      },
      {
        name: "Tập 4: Dear Billy",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      },
      {
        name: "Tập 5: Dự án Nina",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
      },
      {
        name: "Tập 6: Chiều sâu",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
      },
      {
        name: "Tập 7: Vụ thảm sát tại phòng thí nghiệm Hawkins",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        name: "Tập 8: Bố",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
      },
      {
        name: "Tập 9: Gánh vác",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      }
    ]
  },
  {
    id: "demon-slayer-hashira-training",
    title: "Thanh Gươm Diệt Quỷ: Đại Trụ Đặc Huấn",
    originalTitle: "Demon Slayer: Hashira Training Arc",
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
    category: "hoat-hinh",
    genres: ["Hành Động", "Anime", "Kỳ Ảo"],
    rating: 9.2,
    votes: 1540,
    year: 2024,
    duration: "8 tập",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "Haruo Sotozaki",
    cast: ["Natsuki Hanae", "Akari Kito", "Yoshitsugu Matsuoka", "Hiro Shimono"],
    description: "Sát Quỷ Nhân bước vào khóa đặc huấn cực kỳ nghiêm khắc dưới sự chỉ dẫn trực tiếp của các Trụ Cột (Hashira) nhằm chuẩn bị cho trận chiến sinh tử sắp tới chống lại bạo chúa quỷ Kibutsuji Muzan. Mối liên kết giữa các chiến binh ngày càng khăng khít hơn bao giờ hết.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    views: 310250,
    isHot: true,
    episodes: [
      {
        name: "Tập 1: Để đánh bại Kibutsuji Muzan",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      },
      {
        name: "Tập 2: Nỗi đau của Thủy Trụ Tomioka Giyu",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        name: "Tập 3: Tanjiro hồi phục hoàn toàn!! Tham gia đặc huấn",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      },
      {
        name: "Tập 4: Nụ cười của Hà Trụ Tokito Muichiro",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      },
      {
        name: "Tập 5: Quỷ ăn thịt người - Đặc huấn của Luyến Trụ Kanroji",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      },
      {
        name: "Tập 6: Mạng nhất hàng ngũ Sát Quỷ Đoàn - Nham Trụ Himejima",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      {
        name: "Tập 7: Khúc nhạc đêm tĩnh lặng của Gió và Rắn",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      {
        name: "Tập 8: Trụ Cột tập hợp!! Kết cấu của Vô Hạn Thành",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      }
    ]
  },
  {
    id: "oppenheimer",
    title: "Kẻ Hủy Diệt Thế Giới: Oppenheimer",
    originalTitle: "Oppenheimer",
    thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    category: "phim-le",
    genres: ["Chính Kịch", "Lịch Sử", "Tiểu Sử"],
    rating: 9.5,
    votes: 3950,
    year: 2023,
    duration: "180 phút",
    quality: "UltraHD 4K",
    sub: "Vietsub",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    description: "Bộ phim kể về cuộc đời của nhà vật lý lý thuyết J. Robert Oppenheimer, người lãnh đạo Dự án Manhattan chế tạo ra quả bom nguyên tử đầu tiên trong Thế chiến thứ hai, từ đó làm thay đổi mãi mãi lịch sử nhân loại.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    views: 610050,
    isHot: true
  },
  {
    id: "the-creator",
    title: "Kẻ Kiến Tạo",
    originalTitle: "The Creator",
    thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    category: "phim-le",
    genres: ["Hành Động", "Khoa Học Viễn Tưởng", "Giật Gân"],
    rating: 8.5,
    votes: 1120,
    year: 2023,
    duration: "133 phút",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "Gareth Edwards",
    cast: ["John David Washington", "Gemma Chan", "Ken Watanabe", "Madeleine Yuna Voyles"],
    description: "Giữa một cuộc chiến tranh trong tương lai giữa loài người và các lực lượng trí tuệ nhân tạo, Joshua, một cựu đặc vụ lực lượng đặc biệt đang tiếc thương cho sự mất tích của vợ mình, được tuyển dụng để săn lùng và tiêu diệt Kẻ Kiến Tạo - kiến trúc sư khó nắm bắt của AI tiên tiến, người đã phát triển một vũ khí bí ẩn có khả năng kết thúc chiến tranh và chính loài người.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    views: 295100,
    isHot: false
  },
  {
    id: "breaking-bad",
    title: "Tập Làm Người Xấu (Mùa 5)",
    originalTitle: "Breaking Bad (Season 5)",
    thumbnail: "https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&auto=format&fit=crop&q=80",
    category: "phim-bo",
    genres: ["Chính Kịch", "Hình Sự", "Giật Gân"],
    rating: 9.7,
    votes: 4560,
    year: 2013,
    duration: "16 tập",
    quality: "FullHD 1080p",
    sub: "Thuyết Minh",
    director: "Vince Gilligan",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Bob Odenkirk"],
    description: "Mùa cuối cùng khép lại cuộc hành trình đầy tội lỗi của Walter White - từ một giáo viên hóa học đầy tội lỗi trở thành Heisenberg tàn nhẫn.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    views: 489310,
    isHot: false,
    episodes: [
      {
        name: "Tập 1: Sống tự do hay chết",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
      },
      {
        name: "Tập 2: Madrigal",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      },
      {
        name: "Tập 3: Tiền hoa hồng",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      },
      {
        name: "Tập 4: Năm mươi mốt",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      },
      {
        name: "Tập 5: Tàu chở hàng",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      },
      {
        name: "Tập 6: Mua lại",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        name: "Tập 7: Nói tên tôi ra",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      {
        name: "Tập 8: Gliding Over All",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      }
    ]
  },
  {
    id: "game-of-thrones-s8",
    title: "Trò Chơi Vương Quyền (Mùa 8)",
    originalTitle: "Game of Thrones (Season 8)",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    category: "phim-bo",
    genres: ["Kỳ Ảo", "Hành Động", "Chính Kịch"],
    rating: 8.7,
    votes: 3890,
    year: 2019,
    duration: "6 tập",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "David Benioff",
    cast: ["Emilia Clarke", "Kit Harington", "Lena Headey", "Peter Dinklage"],
    description: "Đỉnh điểm của cuộc chiến vương quyền khốc liệt tại đại lục Westeros. Các đại gia tộc phải đặt mâu thuẫn sang một bên để cùng liên minh chống lại đội quân bóng ma của Dạ Vương (Night King), đồng thời tranh giành Ngai Sắt tối cao.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    views: 590820,
    isHot: false,
    episodes: [
      {
        name: "Tập 1: Winterfell",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      },
      {
        name: "Tập 2: Hiệp sĩ của Bảy Vương Quốc",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      },
      {
        name: "Tập 3: Đêm Trường",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      {
        name: "Tập 4: Cuối cùng của gia tộc Stark",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      },
      {
        name: "Tập 5: Chuông kêu",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        name: "Tập 6: Ngai Sắt",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
      }
    ]
  },
  {
    id: "your-name",
    title: "Your Name: Tên Cậu Là Gì?",
    originalTitle: "Kimi no Na wa.",
    thumbnail: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    category: "hoat-hinh",
    genres: ["Anime", "Tình Cảm", "Kỳ Ảo"],
    rating: 9.4,
    votes: 2150,
    year: 2016,
    duration: "106 phút",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "Makoto Shinkai",
    cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi", "Ryo Narita"],
    description: "Mitsuha là một nữ sinh trung học sống ở một vùng nông thôn hẻo lánh sâu trong núi. Taki là một nam sinh trung học sống ở trung tâm Tokyo. Một ngày nọ, họ phát hiện mình bị hoán đổi thân xác một cách kỳ diệu khi đang ngủ. Hai cuộc đời xa lạ dần xích lại gần nhau thông vụ hoán đổi thân xác.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    views: 405100,
    isHot: true
  },
  {
    id: "spirited-away",
    title: "Vùng Đất Linh Hồn",
    originalTitle: "Sen to Chihiro no Kamikakushi",
    thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&auto=format&fit=crop&q=80",
    category: "hoat-hinh",
    genres: ["Anime", "Kỳ Ảo", "Phiêu Lưu"],
    rating: 9.5,
    votes: 3100,
    year: 2001,
    duration: "125 phút",
    quality: "FullHD 1080p",
    sub: "Thuyết Minh",
    director: "Hayao Miyazaki",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    description: "Câu chuyện về cô bé Chihiro bị lạc vào thế giới linh hồn và phải làm việc cho mụ phù thủy Yubaba để cứu cha mẹ.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    views: 420800,
    isHot: false
  },
  {
    id: "godzilla-x-kong",
    title: "Godzilla x Kong: Đế Chế Mới",
    originalTitle: "Godzilla x Kong: The New Empire",
    thumbnail: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=1600&auto=format&fit=crop&q=80",
    category: "chieu-rap",
    genres: ["Hành Động", "Phiêu Lưu", "Kỳ Ảo"],
    rating: 8.6,
    votes: 1670,
    year: 2024,
    duration: "115 phút",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "Adam Wingard",
    cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens", "Kaylee Hottle"],
    description: "Godzilla và Kong đồng hành chống lại mối đe dọa mới từ Trái Đất Rỗng.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    views: 356400,
    isHot: false
  },
  {
    id: "mai-movie",
    title: "Mai",
    originalTitle: "Mai",
    thumbnail: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
    category: "chieu-rap",
    genres: ["Tình Cảm", "Chính Kịch", "Tâm Lý"],
    rating: 8.8,
    votes: 2100,
    year: 2024,
    duration: "131 phút",
    quality: "FullHD 1080p",
    sub: "Vietsub",
    director: "Trấn Thành",
    cast: ["Phương Anh Đào", "Tuấn Trần", "Hồng Đào", "Uyển Ân"],
    description: "Phim về cuộc đời của Mai, người phụ nữ massage chịu nhiều tổn thương và tình yêu vượt qua định kiến với Dương.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    views: 498300,
    isHot: true
  }
];

export const genres = [
  "Tất cả",
  "Hành Động",
  "Khoa Học Viễn Tưởng",
  "Phiêu Lưu",
  "Chính Kịch",
  "Lịch Sử",
  "Tiểu Sử",
  "Gia Đình",
  "Kinh Dị",
  "Bí Ẩn",
  "Hình Sự",
  "Giật Gân",
  "Kỳ Ảo",
  "Tình Cảm",
  "Anime"
];
