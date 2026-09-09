import "dotenv/config";
import { db } from "../lib/db/index";
import { aiGalleries, movies, characters, galleryCharacter } from "../lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { slugify } from "../lib/utils";

const CHAR_MAP: { [key: string]: { name: string; titles: string[]; descs: string[]; movieName: string } } = {
  "my-do-toa": {
    name: "Mỹ Đỗ Toa",
    titles: [
      "Tuyệt Sắc Nữ Vương Xà Nhân",
      "Nữ Vương Ma Mị Quyến Rũ",
      "Phong Thái Vương Giả 4K",
      "Nhan Sắc Diễm Lệ Đỉnh Cao",
      "Nữ Thần Xà Tộc Kiều Diễm",
      "Khí Chất Tối Thượng Quyền Uy",
      "Vẻ Đẹp Ma Quái Vạn Người Mê",
      "Thần Thái Kiêu Hãnh Tuyệt Mỹ"
    ],
    descs: [
      "Nữ Vương Xà Nhân Tộc với nhan sắc ma mị, khí chất vương giả quyền uy và thân hình bốc lửa tuyệt trần.",
      "Tạo hình 3D sống động khắc họa vẻ đẹp kiêu sa, quyến rũ chết người của nữ hoàng sa mạc Mỹ Đỗ Toa.",
      "Vẻ đẹp vương giả đầy mê hoặc của Mỹ Đỗ Toa trong từng khung hình 4K sắc nét và ánh sáng chân thực."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "van-van": {
    name: "Vân Vận",
    titles: [
      "Tông Chủ Hoa Tông Phong Thái Tuyệt Trần",
      "Tiên Tử Vân Lam Tông Thoát Tục",
      "Nhan Sắc Thanh Cao Đượm Buồn",
      "Kiều Diễm Phong Thái Kiếm Tiên",
      "Thần Thái Nữ Thần Thanh Khiết",
      "Nét Đẹp Dịu Dàng Đoan Trang",
      "Vẻ Đẹp Kiêu Sa Tông Chủ",
      "Phong Vận Tuyệt Sắc Tiên Khí"
    ],
    descs: [
      "Cựu Tông chủ Vân Lam Tông mang vẻ đẹp thanh tao, quý phái, đôi mắt đượm buồn cùng khí chất tiên tử thoát tục.",
      "Vẻ đẹp thoát tục, dịu dàng nhưng đầy kiên cường của Vân Vận qua từng đường nét tạo hình 3D đỉnh cao.",
      "Phong thái tông chủ cao quý kết hợp nét u buồn sâu lắng tạo nên sức hút khó cưỡng của nàng tiên tử áo xanh."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "tieu-y-tien": {
    name: "Tiểu Y Tiên",
    titles: [
      "Tiên Khí Thuần Khiết Đấu Tôn",
      "Mái Tóc Tím Ma Mị Dịu Dàng",
      "Ách Nan Độc Nữ Tuyệt Sắc",
      "Nhan Sắc Trong Trẻo Khí Chất Thần Tiên",
      "Nữ Thần Độc Tôn Diễm Lệ",
      "Thần Thái Thoát Tục Mê Đắm",
      "Nét Đẹp Dịu Dàng Trong Trẻo",
      "Tiểu Y Nữ Tinh Khôi 4K"
    ],
    descs: [
      "Nàng y sư sở hữu Ách Nan Độc Thể với dung mạo trong trẻo, mái tóc tím thướt tha cùng thần thái dịu dàng đầy mê hoặc.",
      "Hình ảnh Tiểu Y Tiên trong tạo hình Đấu Tôn uy áp nhưng vẫn giữ trọn nét thuần khiết, trong sáng tựa tiên nữ giáng trần.",
      "Bộ sưu tập 3D 4K tái hiện hoàn hảo nét đẹp ma mị của mái tóc tím bồng bềnh và đôi mắt đượm tình của Tiểu Y Tiên."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "nha-phi": {
    name: "Nhã Phi",
    titles: [
      "Đệ Nhất Mỹ Nhân Đấu Giá Mễ Đặc Nhĩ",
      "Đường Cong Quyến Rũ Mê Hoặc",
      "Nụ Cười Nghiêng Thành Động Lòng Người",
      "Sườn Xám Quý Phái Sang Trọng",
      "Nữ Hoàng Đấu Giá Tuyệt Sắc",
      "Nét Đẹp Thành Thục Đỉnh Cao"
    ],
    descs: [
      "Đại tiểu thư Mễ Đặc Nhĩ gia tộc nổi danh quyến rũ, sắc sảo với đường cong cuốn hút và nụ cười làm say đắm lòng người.",
      "Nhã Phi kiều diễm trong những bộ trang phục tôn dáng, toát lên phong thái thương nhân thông minh và gợi cảm.",
      "Vẻ đẹp mặn mà, sắc sảo của đệ nhất mỹ nhân đấu giá trường được lột tả chân thực qua góc nhìn 3D sắc nét."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "tao-dinh": {
    name: "Tào Dĩnh",
    titles: [
      "Yêu Nữ Đan Tháp Tuyệt Sắc",
      "Ánh Mắt Ma Mị Đầy Khiêu Khích",
      "Kiều Diễm Quyến Rũ Đan Đạo Thiên Tài",
      "Nhan Sắc Yêu Kiều Kiêu Kỳ",
      "Thần Thái Yêu Nữ Vạn Người Say"
    ],
    descs: [
      "Thiên tài luyện dược sư Đan Tháp mang vẻ đẹp yêu kiều, ma mị, ánh mắt sắc sảo và cá tính kiêu kỳ quyến rũ.",
      "Tạo hình 3D ấn tượng của Tào Dĩnh với phong cách thời trang gợi cảm và thần thái tự tin ngút ngàn.",
      "Nét quyến rũ độc nhất vô nhị của yêu nữ Đan Tháp qua từng góc ảnh 4K sắc nét và hiệu ứng ánh sáng tuyệt đẹp."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "phuong-thanh-nhi": {
    name: "Phượng Thanh Nhi",
    titles: [
      "Thiên Kiêu Thiên Yêu Hoàng Tộc",
      "Kiêu Sa Quý Phái Tuyệt Mỹ",
      "Thần Cầm Diễm Lệ Khí Chất Xuất Trần",
      "Công Chúa Thiên Yêu Hoàng",
      "Nhan Sắc Thanh Tú Kiêu Kỳ"
    ],
    descs: [
      "Đại tiểu thư Thiên Yêu Hoàng Tộc với phong thái kiêu hãnh, dung nhan thanh tú diễm lệ cùng huyết mạch thần cầm cao quý.",
      "Phượng Thanh Nhi với khí chất cao ngạo, quý phái của vương tộc viễn cổ trong từng shoot hình 3D ấn tượng.",
      "Vẻ đẹp thanh tân, lộng lẫy của đệ nhất thiên kiêu Thiên Yêu Hoàng Tộc được tái hiện sống động."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "phuong-hoang": {
    name: "Phượng Hoàng",
    titles: [
      "Thần Cầm Tuyệt Sắc Thiên Yêu Hoàng",
      "Vẻ Đẹp Rực Rỡ Phượng Vũ",
      "Kiều Diễm Sang Trọng Đỉnh Cao",
      "Nữ Thần Thần Cầm Kiêu Sa"
    ],
    descs: [
      "Mỹ nhân Thiên Yêu Hoàng Tộc mang vẻ đẹp quyền quý, kiêu sa cùng thần thái rực rỡ tựa phượng hoàng tái sinh.",
      "Tạo hình 3D lộng lẫy với trang phục lông vũ kiêu kỳ và đường nét cơ thể hoàn mỹ chuẩn từng milimet."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "tu-nghien": {
    name: "Tử Nghiên",
    titles: [
      "Long Hoàng Thái Hư Cổ Long",
      "Vương Giả Cổ Long Trưởng Thành Kiều Diễm",
      "Vẻ Đẹp Kiêu Kỳ Mái Tóc Tím 4K",
      "Thần Thái Đế Vương Uy Nghiêm",
      "Nữ Hoàng Long Tộc Tuyệt Mỹ"
    ],
    descs: [
      "Vương nữ Thái Hư Cổ Long Tộc phiên bản trưởng thành với mái tóc tím đặc trưng, khí chất vương giả tối thượng và nét đẹp kiêu sa.",
      "Tử Nghiên trong hình thái Long Hoàng uy nghi, toát lên quyền năng thống trị muôn loài và dung nhan diễm lệ.",
      "Bộ sưu tập 3D sắc nét ghi lại khoảnh khắc lột xác hoàn mỹ của tiểu nha đầu ngày nào thành nữ vương Long Tộc."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "thanh-tien-tu": {
    name: "Thanh Tiên Tử",
    titles: [
      "Tiên Tử Huyền Bí Đấu Khí Đại Lục",
      "Thanh Khiết Dịu Dàng Như Mộng",
      "Nhan Sắc Thoát Tục Tà Áo Xanh",
      "Tiên Phong Đạo Cốt Kiều Diễm"
    ],
    descs: [
      "Nàng tiên tử thanh thuần mang tà áo xanh ngọc bích thoát tục, khí chất thanh tao nhẹ nhàng tựa gió thoảng mây trôi.",
      "Vẻ đẹp mong manh, trong trẻo tựa sương mai của Thanh Tiên Tử trong không gian tiên hiệp huyền ảo."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "thanh-lan": {
    name: "Thanh Lân",
    titles: [
      "Bích Xà Tam Hoa Đồng Dịu Dàng",
      "Nét Đẹp E Ấp Thanh Thuần Đầy Mê Hoặc",
      "Kiều Nữ Bích Xà Trưởng Thành Nóng Bỏng",
      "Thần Nhãn Bích Xà Tuyệt Sắc"
    ],
    descs: [
      "Cô gái mang đôi mắt Bích Xà Tam Hoa Đồng huyền thoại với nét đẹp dịu dàng, e ấp nhưng ẩn chứa sức mạnh khôn lường.",
      "Thanh Lân trong tạo hình thiếu nữ trưởng thành với vóc dáng thon thả, quyến rũ và ánh mắt xanh biếc hút hồn."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "duong-hoa-nhi": {
    name: "Đường Hỏa Nhi",
    titles: [
      "Tiểu Công Chúa Phần Viêm Cốc",
      "Rực Lửa Nhiệt Huyết Quyến Rũ",
      "Kiều Nữ Cửu Long Lôi Cương Hỏa",
      "Nhan Sắc Rạng Ngời Đầy Năng Động"
    ],
    descs: [
      "Ái nữ Cốc chủ Phần Viêm Cốc với cá tính nhiệt huyết, phong thái kiều diễm rực lửa và dung mạo rạng ngời cuốn hút.",
      "Tạo hình 3D rực rỡ với sắc đỏ nồng nàn tôn lên làn da trắng ngần và thần thái phóng khoáng của Đường Hỏa Nhi."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "lieu-phi": {
    name: "Liễu Phi",
    titles: [
      "Kiều Nữ Già Nam Học Viện",
      "Tuổi Thanh Xuân Tươi Trẻ Kiêu Kỳ",
      "Tiểu Thư Liễu Gia Quyến Rũ",
      "Nhan Sắc Ngọt Ngào Tinh Nghịch"
    ],
    descs: [
      "Mỹ nhân Già Nam Học Viện mang nét đẹp kiêu kỳ, tươi trẻ đầy sức sống với thần thái quyến rũ của tuổi thanh xuân.",
      "Nét đẹp ngọt ngào pha chút đanh đá dễ thương của nàng tiểu thư Liễu Phi trong từng khung hình 3D sinh động."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "huyen-y": {
    name: "Huyền Y",
    titles: [
      "Trưởng Lão Đan Tháp Thanh Nhã",
      "Nét Đẹp Thành Thục Quý Phái Đoan Trang",
      "Đan Đạo Tông Sư Diễm Lệ",
      "Phong Thái Nữ Vương Luyện Dược"
    ],
    descs: [
      "Cựu hội trưởng Đan Tháp mang nét đẹp thành thục, quý phái, đoan trang cùng khí chất luyện dược đại sư danh chấn.",
      "Huyền Y toát lên vẻ đẹp chín muồi, đoan trang và khí chất đĩnh đạc của bậc tiền bối giới luyện dược."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "huan-nhi": {
    name: "Cổ Huân Nhi",
    titles: [
      "Thiên Kim Cổ Tộc Kim Đế Phần Thiên",
      "Tuyệt Sắc Nữ Thần Thanh Nhã Tựa Sen Tuyết",
      "Thần Phẩm Huyết Mạch Khí Chất Xuất Trần",
      "Nhan Sắc Nghiêng Nước Nghiêng Thành"
    ],
    descs: [
      "Thần phẩm huyết mạch Cổ Tộc với dung mạo nghiêng nước nghiêng thành, thanh nhã như sen tuyết và khí chất nữ thần bất khả xâm phạm.",
      "Vẻ đẹp thánh khiết, thanh cao cùng tình yêu sâu sắc dành cho Tiêu Viêm được khắc họa hoàn mỹ qua nghệ thuật 3D."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
  "tu-hin": {
    name: "Từ Hân",
    titles: [
      "Nữ Thần Thôn Phệ Tinh Không",
      "Dịu Dàng Trong Sáng Thuần Khiết",
      "Hậu Phương Vững Chắc Của La Phong"
    ],
    descs: [
      "Bạn đời của La Phong mang vẻ đẹp dịu dàng, trong sáng, đoan trang và hết mực thủy chung giữa vũ trụ bao la.",
      "Tạo hình hiện đại thanh lịch tôn vinh nét đẹp chuẩn mực người phụ nữ Á Đông của Từ Hân."
    ],
    movieName: "Thôn Phệ Tinh Không"
  },
  "han-nguyet": {
    name: "Hàn Nguyệt",
    titles: [
      "Băng Sơn Mỹ Nhân Già Nam",
      "Thanh Lãnh Kiêu Sa Tựa Băng Tuyết",
      "Học Tỷ Hàn Nguyệt Tuyệt Sắc"
    ],
    descs: [
      "Hàn Nguyệt học tỷ của Nội Viện Già Nam với vẻ đẹp thanh lãnh như băng tuyết, đôi mắt kiêu sa và phong thái đoan trang.",
      "Khí chất băng thanh ngọc khiết của nàng học tỷ tài năng được khắc họa tinh xảo qua từng đường nét 3D."
    ],
    movieName: "Đấu Phá Thương Khung"
  },
};

function detectInfo(g: any, indexForChar: number) {
  const rawText = `${g.name} ${g.galleryCharacters.map((c: any) => `${c.character?.name} ${c.character?.nameZh} ${c.character?.nameEn}`).join(" ")} ${g.images.map((i: any) => i.imgUrl).join(" ")}`.toLowerCase();

  let charKey = "";
  if (rawText.includes("美杜莎") || rawText.includes("medusa") || rawText.includes("my do toa") || rawText.includes("mỹ đỗ toa") || rawText.includes("mdt")) {
    charKey = "my-do-toa";
  } else if (rawText.includes("云韵") || rawText.includes("云芝") || rawText.includes("yun yun") || rawText.includes("yunyun") || rawText.includes("van van") || rawText.includes("vân vận")) {
    charKey = "van-van";
  } else if (rawText.includes("小医仙") || rawText.includes("xiao yixian") || rawText.includes("xiaoyixian") || rawText.includes("tieu y tien") || rawText.includes("tiểu y tiên")) {
    charKey = "tieu-y-tien";
  } else if (rawText.includes("雅妃") || rawText.includes("雅菲") || rawText.includes("ya fei") || rawText.includes("yafei") || rawText.includes("nha phi") || rawText.includes("nhã phi")) {
    charKey = "nha-phi";
  } else if (rawText.includes("曹颖") || rawText.includes("cao ying") || rawText.includes("caoying") || rawText.includes("tao dinh") || rawText.includes("tào dĩnh")) {
    charKey = "tao-dinh";
  } else if (rawText.includes("凤清儿") || rawText.includes("凤青儿") || rawText.includes("feng qing") || rawText.includes("phuong thanh nhi") || rawText.includes("phượng thanh nhi")) {
    charKey = "phuong-thanh-nhi";
  } else if (rawText.includes("凤凰") || rawText.includes("fenghuang") || rawText.includes("phuong hoang") || rawText.includes("phượng hoàng")) {
    charKey = "phuong-hoang";
  } else if (rawText.includes("紫妍") || rawText.includes("紫研") || rawText.includes("紫嫣") || rawText.includes("zi yan") || rawText.includes("ziyan") || rawText.includes("tu nghien") || rawText.includes("tử nghiên")) {
    charKey = "tu-nghien";
  } else if (rawText.includes("青仙子") || rawText.includes("qing xian") || rawText.includes("thanh tien tu") || rawText.includes("thanh tiên tử")) {
    charKey = "thanh-tien-tu";
  } else if (rawText.includes("青鳞") || rawText.includes("青麟") || rawText.includes("qing lin") || rawText.includes("thanh lan") || rawText.includes("thanh lân")) {
    charKey = "thanh-lan";
  } else if (rawText.includes("唐火儿") || rawText.includes("tang huo") || rawText.includes("duong hoa nhi") || rawText.includes("đường hỏa nhi")) {
    charKey = "duong-hoa-nhi";
  } else if (rawText.includes("柳菲") || rawText.includes("liu fei") || rawText.includes("lieu phi") || rawText.includes("liễu phi")) {
    charKey = "lieu-phi";
  } else if (rawText.includes("玄衣") || rawText.includes("xuan yi") || rawText.includes("xuanyi") || rawText.includes("huyen y") || rawText.includes("huyền y")) {
    charKey = "huyen-y";
  } else if (rawText.includes("薰儿") || rawText.includes("熏儿") || rawText.includes("xun er") || rawText.includes("huan nhi") || rawText.includes("huân nhi")) {
    charKey = "huan-nhi";
  } else if (rawText.includes("徐欣") || rawText.includes("xu xin") || rawText.includes("tu hin") || rawText.includes("từ hân")) {
    charKey = "tu-hin";
  } else if (rawText.includes("韩月") || rawText.includes("han yue") || rawText.includes("han nguyet") || rawText.includes("hàn nguyệt")) {
    charKey = "han-nguyet";
  }

  // Fallback to characters relation if present
  if (!charKey && g.galleryCharacters && g.galleryCharacters.length > 0) {
    const charSlug = g.galleryCharacters[0].character?.slug || "";
    if (CHAR_MAP[charSlug]) {
      charKey = charSlug;
    }
  }

  const charData = CHAR_MAP[charKey] || {
    name: g.galleryCharacters?.[0]?.character?.name || "Tuyệt Sắc Mỹ Nhân",
    titles: ["Nghệ Thuật 3D Tuyệt Sắc", "Phong Thái Kiều Diễm 4K", "Vẻ Đẹp Hoàn Mỹ"],
    descs: ["Bộ sưu tập ảnh AI nhân vật 3D chất lượng cao với từng khung hình sắc nét và sống động."],
    movieName: g.movie?.name || "Hoạt Hình 3D"
  };

  // Detect specific costume / style tags
  let styleTag = "";
  let styleDesc = "";

  if (rawText.includes("花宗") || rawText.includes("hoa tong")) {
    styleTag = "Trang Phục Hoa Tông";
    styleDesc = "trong y phục Hoa Tông thanh nhã, tôn lên khí chất tông chủ cao quý";
  } else if (rawText.includes("斗尊") || rawText.includes("dau ton")) {
    styleTag = "Đấu Tôn Phong Thái";
    styleDesc = "với phong thái cường giả Đấu Tôn uy áp, ánh mắt sắc sảo và khí chất bá đạo";
  } else if (rawText.includes("旗袍") || rawText.includes("suon xam")) {
    styleTag = "Sườn Xám Cách Tân";
    styleDesc = "diện bộ sườn xám cách tân ôm trọn đường cong cơ thể, toát lên nét kiêu sa quý phái";
  } else if (rawText.includes("比基尼") || rawText.includes("泳装") || rawText.includes("bikini")) {
    styleTag = "Bikini Bãi Biển Gợi Cảm";
    styleDesc = "khoe trọn đường cong quyến rũ bên bờ biển nhiệt đới ngập nắng và sóng biếc";
  } else if (rawText.includes("喵咪") || rawText.includes("猫咪") || rawText.includes("meo")) {
    styleTag = "Cosplay Mèo Nữ Quyến Rũ";
    styleDesc = "trong tạo hình hầu gái mèo nữ tinh nghịch, đáng yêu và đầy mê hoặc";
  } else if (rawText.includes("瑜伽") || rawText.includes("运动") || rawText.includes("yoga")) {
    styleTag = "Đồ Tập Năng Động";
    styleDesc = "trong trang phục tập luyện thể thao hiện đại, khỏe khoắn nhưng không kém phần nóng bỏng";
  } else if (rawText.includes("黑丝") || rawText.includes("tat den")) {
    styleTag = "Phong Cách Quyến Rũ";
    styleDesc = "với phong cách quyến rũ bí ẩn, làm nổi bật đôi chân dài miên man";
  } else if (rawText.includes("蕾丝") || rawText.includes("ren")) {
    styleTag = "Nội Y Ren Tinh Tế";
    styleDesc = "trong phong cách trang phục ren gợi cảm, tôn vinh trọn vẹn vẻ đẹp hình thể tuyệt mỹ";
  } else if (rawText.includes("龙皇") || rawText.includes("long hoang")) {
    styleTag = "Long Hoàng Tối Thượng";
    styleDesc = "khoác lên long bào Tử Kim uy nghi của Long Hoàng tộc, toát lên khí chất đế vương";
  } else if (rawText.includes("4k") || rawText.includes("墨迹") || rawText.includes("重置")) {
    styleTag = "Tuyệt Tác 3D 4K";
    styleDesc = "với độ phân giải 4K siêu sắc nét, ánh sáng chân thực và chi tiết tạo hình hoàn hảo";
  }

  const titleOption = charData.titles[indexForChar % charData.titles.length];
  const descOption = charData.descs[indexForChar % charData.descs.length];

  const subTitle = styleTag ? `${titleOption} (${styleTag})` : titleOption;
  const name = `${charData.name} - ${subTitle} (Bộ #${g.id})`;
  const slug = slugify(`${charData.name}-${styleTag || titleOption}-${g.id}`);
  
  const desc = styleDesc 
    ? `Bộ sưu tập ảnh AI ${charData.name} (${charData.movieName}) ${styleDesc}. Hình ảnh chất lượng cao 4K sắc nét từng chi tiết độc quyền tại Vam3D.`
    : `Bộ sưu tập ảnh AI ${charData.name} (${charData.movieName}). ${descOption} Hình ảnh chất lượng cao 4K sắc nét độc quyền tại Vam3D.`;

  return { name, slug, desc };
}

async function main() {
  if (!db) {
    console.error("No DB connection");
    return;
  }

  console.log("=== STARTING AI GALLERIES STANDARDIZATION ===");
  const allGalleries = await db.query.aiGalleries.findMany({
    with: {
      movie: true,
      galleryCharacters: {
        with: {
          character: true,
        },
      },
      images: {
        limit: 3,
      },
    },
    orderBy: (g, { asc }) => [asc(g.id)],
  });

  console.log(`Found ${allGalleries.length} galleries in database.`);

  const charCounter: { [key: string]: number } = {};
  let updatedCount = 0;

  for (const g of allGalleries) {
    const rawText = `${g.name} ${g.galleryCharacters.map((c: any) => c.character?.name).join(" ")}`.toLowerCase();
    const charKey = rawText.includes("美杜莎") ? "my-do-toa" : (g.galleryCharacters?.[0]?.character?.slug || "general");
    charCounter[charKey] = (charCounter[charKey] || 0) + 1;

    const { name, slug, desc } = detectInfo(g, charCounter[charKey]);

    await db
      .update(aiGalleries)
      .set({
        name,
        slug,
        description: desc,
      })
      .where(eq(aiGalleries.id, g.id));

    updatedCount++;
    if (updatedCount % 25 === 0 || updatedCount === allGalleries.length) {
      console.log(`Updated ${updatedCount}/${allGalleries.length} galleries... (Current: "${name}")`);
    }
  }

  console.log(`=== SUCCESSFULLY STANDARDIZED ALL ${updatedCount} AI GALLERIES! ===`);
}

main().catch(console.error);
