import "dotenv/config";
import fs from "fs";
import path from "path";
import { slugify } from "../lib/utils";

interface GalleryItem {
  id: number;
  name: string;
  slug: string;
  movie: { id: number; name: string; slug: string } | null;
  characters: { id?: number; name?: string; nameZh?: string; nameEn?: string; slug?: string }[];
  imagesCount: number;
  sampleImages: string[];
}

const rawData: GalleryItem[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "galleries_data.json"), "utf-8")
);

// Character translation dictionary
const CHAR_MAP: { [key: string]: { name: string; title: string; desc: string; movieName: string } } = {
  "my-do-toa": {
    name: "Mỹ Đỗ Toa",
    title: "Tuyệt Sắc Nữ Vương Xà Nhân",
    desc: "Nữ Vương Xà Nhân Tộc với nhan sắc ma mị, khí chất vương giả quyền uy và thân hình bốc lửa tuyệt trần.",
    movieName: "Đấu Phá Thương Khung"
  },
  "van-van": {
    name: "Vân Vận",
    title: "Tông Chủ Hoa Tông Phong Thái Tuyệt Trần",
    desc: "Cựu Tông chủ Vân Lam Tông mang vẻ đẹp thanh tao, quý phái, đôi mắt đượm buồn cùng khí chất tiên tử thoát tục.",
    movieName: "Đấu Phá Thương Khung"
  },
  "tieu-y-tien": {
    name: "Tiểu Y Tiên",
    title: "Tiên Khí Thuần Khiết Đấu Tôn",
    desc: "Nàng y sư sở hữu Ách Nan Độc Thể với dung mạo trong trẻo, mái tóc tím thướt tha cùng thần thái dịu dàng đầy mê hoặc.",
    movieName: "Đấu Phá Thương Khung"
  },
  "nha-phi": {
    name: "Nhã Phi",
    title: "Đệ Nhất Mỹ Nhân Đấu Giá Mễ Đặc Nhĩ",
    desc: "Đại tiểu thư Mễ Đặc Nhĩ gia tộc nổi danh quyến rũ, sắc sảo với đường cong cuốn hút và nụ cười làm say đắm lòng người.",
    movieName: "Đấu Phá Thương Khung"
  },
  "tao-dinh": {
    name: "Tào Dĩnh",
    title: "Yêu Nữ Đan Tháp Tuyệt Sắc",
    desc: "Thiên tài luyện dược sư Đan Tháp mang vẻ đẹp yêu kiều, ma mị, ánh mắt sắc sảo và cá tính kiêu kỳ quyến rũ.",
    movieName: "Đấu Phá Thương Khung"
  },
  "phuong-thanh-nhi": {
    name: "Phượng Thanh Nhi",
    title: "Thiên Kiêu Thiên Yêu Hoàng Tộc",
    desc: "Đại tiểu thư Thiên Yêu Hoàng Tộc với phong thái kiêu hãnh, dung nhan thanh tú diễm lệ cùng huyết mạch thần cầm cao quý.",
    movieName: "Đấu Phá Thương Khung"
  },
  "phuong-hoang": {
    name: "Phượng Hoàng",
    title: "Thần Cầm Tuyệt Sắc Thiên Yêu Hoàng",
    desc: "Mỹ nhân Thiên Yêu Hoàng Tộc mang vẻ đẹp quyền quý, kiêu sa cùng thần thái rực rỡ tựa phượng hoàng tái sinh.",
    movieName: "Đấu Phá Thương Khung"
  },
  "tu-nghien": {
    name: "Tử Nghiên",
    title: "Long Hoàng Thái Hư Cổ Long",
    desc: "Vương nữ Thái Hư Cổ Long Tộc với mái tóc tím đặc trưng, khí chất vương giả tối thượng và nét đẹp vừa đáng yêu vừa kiêu sa.",
    movieName: "Đấu Phá Thương Khung"
  },
  "thanh-tien-tu": {
    name: "Thanh Tiên Tử",
    title: "Tiên Tử Huyền Bí Đấu Khí Đại Lục",
    desc: "Nàng tiên tử thanh thuần mang tà áo xanh ngọc bích thoát tục, khí chất thanh tao nhẹ nhàng tựa gió thoảng mây trôi.",
    movieName: "Đấu Phá Thương Khung"
  },
  "thanh-lan": {
    name: "Thanh Lân",
    title: "Bích Xà Tam Hoa Đồng Dịu Dàng",
    desc: "Cô gái mang đôi mắt Bích Xà Tam Hoa Đồng huyền thoại với nét đẹp dịu dàng, e ấp nhưng ẩn chứa sức mạnh khôn lường.",
    movieName: "Đấu Phá Thương Khung"
  },
  "duong-hoa-nhi": {
    name: "Đường Hỏa Nhi",
    title: "Tiểu Công Chúa Phần Viêm Cốc",
    desc: "Ái nữ Cốc chủ Phần Viêm Cốc với cá tính nhiệt huyết, phong thái kiều diễm rực lửa và dung mạo rạng ngời cuốn hút.",
    movieName: "Đấu Phá Thương Khung"
  },
  "lieu-phi": {
    name: "Liễu Phi",
    title: "Kiều Nữ Già Nam Học Viện",
    desc: "Mỹ nhân Già Nam Học Viện mang nét đẹp kiêu kỳ, tươi trẻ đầy sức sống với thần thái quyến rũ của tuổi thanh xuân.",
    movieName: "Đấu Phá Thương Khung"
  },
  "huyen-y": {
    name: "Huyền Y",
    title: "Trưởng Lão Đan Tháp Thanh Nhã",
    desc: "Cựu hội trưởng Đan Tháp mang nét đẹp thành thục, quý phái, đoan trang cùng khí chất luyện dược đại sư danh chấn.",
    movieName: "Đấu Phá Thương Khung"
  },
  "huan-nhi": {
    name: "Cổ Huân Nhi",
    title: "Thiên Kim Cổ Tộc Kim Đế Phần Thiên",
    desc: "Thần phẩm huyết mạch Cổ Tộc với dung mạo nghiêng nước nghiêng thành, thanh nhã như sen tuyết và khí chất nữ thần bất khả xâm phạm.",
    movieName: "Đấu Phá Thương Khung"
  },
  "tu-hin": {
    name: "Từ Hân",
    title: "Nữ Thần Thôn Phệ Tinh Không",
    desc: "Bạn đời của La Phong mang vẻ đẹp dịu dàng, trong sáng, đoan trang và hết mực thủy chung giữa vũ trụ bao la.",
    movieName: "Thôn Phệ Tinh Không"
  },
  "han-nguyet": {
    name: "Hàn Nguyệt",
    title: "Băng Sơn Mỹ Nhân Già Nam",
    desc: "Hàn Nguyệt học tỷ của Nội Viện Già Nam với vẻ đẹp thanh lãnh như băng tuyết, đôi mắt kiêu sa và phong thái đoan trang.",
    movieName: "Đấu Phá Thương Khung"
  },
};

export function detectCharacterAndTheme(g: GalleryItem) {
  const rawText = `${g.name} ${g.characters.map(c => `${c.name} ${c.nameZh} ${c.nameEn}`).join(" ")} ${g.sampleImages.join(" ")}`.toLowerCase();
  
  // 1. Detect Character
  let matchedCharKey = "";
  if (rawText.includes("美杜莎") || rawText.includes("medusa") || rawText.includes("my do toa") || rawText.includes("mỹ đỗ toa") || rawText.includes("mdt")) {
    matchedCharKey = "my-do-toa";
  } else if (rawText.includes("云韵") || rawText.includes("云芝") || rawText.includes("yun yun") || rawText.includes("yunyun") || rawText.includes("van van") || rawText.includes("vân vận")) {
    matchedCharKey = "van-van";
  } else if (rawText.includes("小医仙") || rawText.includes("xiao yixian") || rawText.includes("xiaoyixian") || rawText.includes("tieu y tien") || rawText.includes("tiểu y tiên")) {
    matchedCharKey = "tieu-y-tien";
  } else if (rawText.includes("雅妃") || rawText.includes("雅菲") || rawText.includes("ya fei") || rawText.includes("yafei") || rawText.includes("nha phi") || rawText.includes("nhã phi")) {
    matchedCharKey = "nha-phi";
  } else if (rawText.includes("曹颖") || rawText.includes("cao ying") || rawText.includes("caoying") || rawText.includes("tao dinh") || rawText.includes("tào dĩnh")) {
    matchedCharKey = "tao-dinh";
  } else if (rawText.includes("凤清儿") || rawText.includes("凤青儿") || rawText.includes("feng qing") || rawText.includes("phuong thanh nhi") || rawText.includes("phượng thanh nhi")) {
    matchedCharKey = "phuong-thanh-nhi";
  } else if (rawText.includes("凤凰") || rawText.includes("fenghuang") || rawText.includes("phuong hoang") || rawText.includes("phượng hoàng")) {
    matchedCharKey = "phuong-hoang";
  } else if (rawText.includes("紫妍") || rawText.includes("紫研") || rawText.includes("紫嫣") || rawText.includes("zi yan") || rawText.includes("ziyan") || rawText.includes("tu nghien") || rawText.includes("tử nghiên")) {
    matchedCharKey = "tu-nghien";
  } else if (rawText.includes("青仙子") || rawText.includes("qing xian") || rawText.includes("thanh tien tu") || rawText.includes("thanh tiên tử")) {
    matchedCharKey = "thanh-tien-tu";
  } else if (rawText.includes("青鳞") || rawText.includes("青麟") || rawText.includes("qing lin") || rawText.includes("thanh lan") || rawText.includes("thanh lân")) {
    matchedCharKey = "thanh-lan";
  } else if (rawText.includes("唐火儿") || rawText.includes("tang huo") || rawText.includes("duong hoa nhi") || rawText.includes("đường hỏa nhi")) {
    matchedCharKey = "duong-hoa-nhi";
  } else if (rawText.includes("柳菲") || rawText.includes("liu fei") || rawText.includes("lieu phi") || rawText.includes("liễu phi")) {
    matchedCharKey = "lieu-phi";
  } else if (rawText.includes("玄衣") || rawText.includes("xuan yi") || rawText.includes("xuanyi") || rawText.includes("huyen y") || rawText.includes("huyền y")) {
    matchedCharKey = "huyen-y";
  } else if (rawText.includes("薰儿") || rawText.includes("熏儿") || rawText.includes("xun er") || rawText.includes("huan nhi") || rawText.includes("huân nhi")) {
    matchedCharKey = "huan-nhi";
  } else if (rawText.includes("徐欣") || rawText.includes("xu xin") || rawText.includes("tu hin") || rawText.includes("từ hân")) {
    matchedCharKey = "tu-hin";
  } else if (rawText.includes("韩月") || rawText.includes("han yue") || rawText.includes("han nguyet") || rawText.includes("hàn nguyệt")) {
    matchedCharKey = "han-nguyet";
  }

  // Fallback to first character in DB if matched
  if (!matchedCharKey && g.characters.length > 0) {
    const firstCharSlug = g.characters[0].slug || "";
    if (CHAR_MAP[firstCharSlug]) {
      matchedCharKey = firstCharSlug;
    }
  }

  // 2. Detect Theme/Costume Style
  let themeName = "";
  let themeDesc = "";

  if (rawText.includes("花宗") || rawText.includes("hoa tong")) {
    themeName = "Trang Phục Hoa Tông";
    themeDesc = "trong y phục Hoa Tông thanh khiết, tà áo thướt tha toát lên khí chất tông chủ cao quý";
  } else if (rawText.includes("斗尊") || rawText.includes("dau ton")) {
    themeName = "Đấu Tôn Phong Thái";
    themeDesc = "với phong thái cường giả Đấu Tôn uy áp, ánh mắt sắc sảo và khí chất bá đạo";
  } else if (rawText.includes("旗袍") || rawText.includes("suon xam")) {
    themeName = "Sườn Xám Quý Phái";
    themeDesc = "diện bộ sườn xám cách tân ôm sát đường cong cơ thể, tôn lên nét kiêu sa quý phái";
  } else if (rawText.includes("比基尼") || rawText.includes("泳装") || rawText.includes("bikini")) {
    themeName = "Bikini Bãi Biển Gợi Cảm";
    themeDesc = "khoe trọn đường cong quyến rũ bên bờ biển nhiệt đới ngập nắng và sóng biếc";
  } else if (rawText.includes("喵咪") || rawText.includes("猫咪") || rawText.includes("meo")) {
    themeName = "Cosplay Mèo Nữ Quyến Rũ";
    themeDesc = "trong tạo hình hầu gái mèo nữ tinh nghịch, đáng yêu và đầy mê hoặc";
  } else if (rawText.includes("瑜伽") || rawText.includes("运动") || rawText.includes("yoga")) {
    themeName = "Đồ Tập Năng Động";
    themeDesc = "trong trang phục tập luyện thể thao hiện đại, khỏe khoắn nhưng không kém phần nóng bỏng";
  } else if (rawText.includes("黑丝") || rawText.includes("tat den")) {
    themeName = "Phong Cách Quyến Rũ";
    themeDesc = "với tạo hình hiện đại thời thượng, toát lên sức hút bí ẩn và ma mị";
  } else if (rawText.includes("蕾丝") || rawText.includes("ren")) {
    themeName = "Nội Y Ren Tinh Tế";
    themeDesc = "trong phong cách trang phục ren gợi cảm, tôn vinh trọn vẹn vẻ đẹp hình thể tuyệt mỹ";
  } else if (rawText.includes("龙皇") || rawText.includes("long hoang")) {
    themeName = "Long Hoàng Tối Thượng";
    themeDesc = "khoác lên long bào Tử Kim uy nghi của Long Hoàng tộc, toát lên khí chất đế vương";
  } else if (rawText.includes("4k") || rawText.includes("墨迹") || rawText.includes("重置")) {
    themeName = "Tuyệt Tác 3D Siêu Thực 4K";
    themeDesc = "với độ phân giải 4K siêu sắc nét, ánh sáng chân thực và chi tiết tạo hình hoàn hảo";
  } else {
    themeName = "Nghệ Thuật 3D Đỉnh Cao";
    themeDesc = "được khắc họa tỉ mỉ qua từng góc nhìn 3D sống động và thần thái cuốn hút mê hồn";
  }

  return { matchedCharKey, themeName, themeDesc };
}

console.log("Analyzing sample galleries...");
const sampleList = rawData.slice(0, 15);
for (const g of sampleList) {
  const { matchedCharKey, themeName, themeDesc } = detectCharacterAndTheme(g);
  const charInfo = CHAR_MAP[matchedCharKey] || {
    name: g.characters[0]?.name || "Tuyệt Sắc Mỹ Nhân",
    title: "Tiên Khí Tuyệt Sắc",
    desc: "Bộ sưu tập ảnh AI chất lượng cao với phong cách tạo hình 3D ấn tượng.",
    movieName: g.movie?.name || "Hoạt Hình 3D"
  };

  const finalTitle = `${charInfo.name} - ${themeName} (#${g.id})`;
  const finalSlug = slugify(`${charInfo.name}-${themeName}-${g.id}`);
  const finalDesc = `Bộ sưu tập ảnh AI ${charInfo.name} (${charInfo.movieName}) ${themeDesc}. Hình ảnh chất lượng cao 4K sắc nét từng chi tiết độc quyền tại Vam3D.`;

  console.log(`\nID: ${g.id} | Raw: "${g.name}"`);
  console.log(`-> New Title: ${finalTitle}`);
  console.log(`-> Slug: ${finalSlug}`);
  console.log(`-> Desc: ${finalDesc}`);
}
