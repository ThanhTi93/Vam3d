/**
 * Character AI Translation & SEO Description Generator for Vam3D
 * - Translates Vietnamese character names into English (Pinyin/Western) & Chinese (Hanzi)
 * - Automatically generates SEO-rich, engaging character descriptions linked with movies
 */

import { generateAiSeoDescription } from "./aiDescription";

// ═══════════════════════════════════════════════════════════════════════
// 1. DICTIONARY OF POPULAR DONGHUA, ANIME & GAME 3D CHARACTERS
// ═══════════════════════════════════════════════════════════════════════
export const POPULAR_CHARACTERS_DICT: Record<
  string,
  { nameEn: string; nameZh: string; defaultMovie?: string }
> = {
  // Đấu Phá Thương Khung (Battle Through the Heavens)
  "mỹ đỗ toa": { nameEn: "Medusa / Cai Lin", nameZh: "美杜莎 / 彩鳞", defaultMovie: "Đấu Phá Thương Khung" },
  "my do toa": { nameEn: "Medusa / Cai Lin", nameZh: "美杜莎 / 彩鳞", defaultMovie: "Đấu Phá Thương Khung" },
  "thải lân": { nameEn: "Cai Lin", nameZh: "彩鳞", defaultMovie: "Đấu Phá Thương Khung" },
  "thai lan": { nameEn: "Cai Lin", nameZh: "彩鳞", defaultMovie: "Đấu Phá Thương Khung" },
  "tiêu viêm": { nameEn: "Xiao Yan", nameZh: "萧炎", defaultMovie: "Đấu Phá Thương Khung" },
  "tieu viem": { nameEn: "Xiao Yan", nameZh: "萧炎", defaultMovie: "Đấu Phá Thương Khung" },
  "vân vận": { nameEn: "Yun Yun", nameZh: "云韵", defaultMovie: "Đấu Phá Thương Khung" },
  "van van": { nameEn: "Yun Yun", nameZh: "云韵", defaultMovie: "Đấu Phá Thương Khung" },
  "tiêu huân nhi": { nameEn: "Xiao Xun'er", nameZh: "萧薰儿", defaultMovie: "Đấu Phá Thương Khung" },
  "huân nhi": { nameEn: "Gu Xun'er", nameZh: "薰儿", defaultMovie: "Đấu Phá Thương Khung" },
  "tiểu y tiên": { nameEn: "Xiao Yixian", nameZh: "小医仙", defaultMovie: "Đấu Phá Thương Khung" },
  "tieu y tien": { nameEn: "Xiao Yixian", nameZh: "小医仙", defaultMovie: "Đấu Phá Thương Khung" },
  "nhã phi": { nameEn: "Ya Fei", nameZh: "雅妃", defaultMovie: "Đấu Phá Thương Khung" },
  "nha phi": { nameEn: "Ya Fei", nameZh: "雅妃", defaultMovie: "Đấu Phá Thương Khung" },
  "nạp lan yên nhiên": { nameEn: "Nalan Yanran", nameZh: "纳兰嫣然", defaultMovie: "Đấu Phá Thương Khung" },
  "nap lan yen nhien": { nameEn: "Nalan Yanran", nameZh: "纳兰嫣然", defaultMovie: "Đấu Phá Thương Khung" },
  "thanh lân": { nameEn: "Qing Lin", nameZh: "青鳞", defaultMovie: "Đấu Phá Thương Khung" },
  "tử nghiên": { nameEn: "Zi Yan", nameZh: "紫妍", defaultMovie: "Đấu Phá Thương Khung" },
  "hàn nguyệt": { nameEn: "Han Yue", nameZh: "韩月", defaultMovie: "Đấu Phá Thương Khung" },
  "hải ba đông": { nameEn: "Hai Bodong", nameZh: "海波东", defaultMovie: "Đấu Phá Thương Khung" },
  "dược lão": { nameEn: "Yao Lao", nameZh: "药老", defaultMovie: "Đấu Phá Thương Khung" },
  "dược trần": { nameEn: "Yao Chen", nameZh: "药尘", defaultMovie: "Đấu Phá Thương Khung" },

  // Đấu La Đại Lục (Soul Land)
  "tiểu vũ": { nameEn: "Xiao Wu", nameZh: "小舞", defaultMovie: "Đấu La Đại Lục" },
  "tieu vu": { nameEn: "Xiao Wu", nameZh: "小舞", defaultMovie: "Đấu La Đại Lục" },
  "đường tam": { nameEn: "Tang San", nameZh: "唐三", defaultMovie: "Đấu La Đại Lục" },
  "duong tam": { nameEn: "Tang San", nameZh: "唐三", defaultMovie: "Đấu La Đại Lục" },
  "ninh vinh vinh": { nameEn: "Ning Rongrong", nameZh: "宁荣荣", defaultMovie: "Đấu La Đại Lục" },
  "ninh vinh vinh ": { nameEn: "Ning Rongrong", nameZh: "宁荣荣", defaultMovie: "Đấu La Đại Lục" },
  "chu trúc thanh": { nameEn: "Zhu Zhuqing", nameZh: "朱竹清", defaultMovie: "Đấu La Đại Lục" },
  "chu truc thanh": { nameEn: "Zhu Zhuqing", nameZh: "朱竹清", defaultMovie: "Đấu La Đại Lục" },
  "bỉ bỉ đông": { nameEn: "Bibi Dong", nameZh: "比比东", defaultMovie: "Đấu La Đại Lục" },
  "bi bi dong": { nameEn: "Bibi Dong", nameZh: "比比东", defaultMovie: "Đấu La Đại Lục" },
  "thiên nhận tuyết": { nameEn: "Qian Renxue", nameZh: "千仞雪", defaultMovie: "Đấu La Đại Lục" },
  "thien nhan tuyet": { nameEn: "Qian Renxue", nameZh: "千仞雪", defaultMovie: "Đấu La Đại Lục" },
  "liễu nhị long": { nameEn: "Liu Erlong", nameZh: "柳二龙", defaultMovie: "Đấu La Đại Lục" },
  "lieu nhi long": { nameEn: "Liu Erlong", nameZh: "柳二龙", defaultMovie: "Đấu La Đại Lục" },
  "ba tái tây": { nameEn: "Bo Saixi", nameZh: "波塞西", defaultMovie: "Đấu La Đại Lục" },
  "ba tai tay": { nameEn: "Bo Saixi", nameZh: "波塞西", defaultMovie: "Đấu La Đại Lục" },
  "hồ liệt na": { nameEn: "Hu Liena", nameZh: "胡列娜", defaultMovie: "Đấu La Đại Lục" },
  "ho liet na": { nameEn: "Hu Liena", nameZh: "胡列娜", defaultMovie: "Đấu La Đại Lục" },
  "bạch trầm hương": { nameEn: "Bai Chenxiang", nameZh: "白沉香", defaultMovie: "Đấu La Đại Lục" },
  "đường vũ đồng": { nameEn: "Tang Wutong", nameZh: "唐舞桐", defaultMovie: "Đấu La Đại Lục 2" },
  "hoắc vũ hào": { nameEn: "Huo Yuhao", nameZh: "霍雨浩", defaultMovie: "Đấu La Đại Lục 2" },
  "vương đông nhi": { nameEn: "Wang Dong'er", nameZh: "王冬儿", defaultMovie: "Đấu La Đại Lục 2" },
  "vương thu nhi": { nameEn: "Wang Qiu'er", nameZh: "王秋儿", defaultMovie: "Đấu La Đại Lục 2" },
  "mộng hồng trần": { nameEn: "Meng Hongchen", nameZh: "梦红尘", defaultMovie: "Đấu La Đại Lục 2" },

  // Hoàn Mỹ Thế Giới (Perfect World)
  "thạch hạo": { nameEn: "Shi Hao", nameZh: "石昊", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "thach hao": { nameEn: "Shi Hao", nameZh: "石昊", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "hỏa linh nhi": { nameEn: "Huo Ling'er", nameZh: "火灵儿", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "hoa linh nhi": { nameEn: "Huo Ling'er", nameZh: "火灵儿", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "vân hi": { nameEn: "Yun Xi", nameZh: "云曦", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "van hi": { nameEn: "Yun Xi", nameZh: "云曦", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "thanh y": { nameEn: "Qing Yi", nameZh: "清漪", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "nguyệt thiền": { nameEn: "Yue Chan", nameZh: "月婵", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "nguyet thien": { nameEn: "Yue Chan", nameZh: "月婵", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "ma nữ": { nameEn: "Witch", nameZh: "魔女", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "liễu thần": { nameEn: "Willow Deity / Liu Shen", nameZh: "柳神", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "lieu than": { nameEn: "Liu Shen", nameZh: "柳神", defaultMovie: "Hoàn Mỹ Thế Giới" },
  "nữ chiến thần": { nameEn: "Female War God", nameZh: "女战神", defaultMovie: "Hoàn Mỹ Thế Giới" },

  // Phàm Nhân Tu Tiên (A Will Eternal / Record of a Mortal's Journey to Immortality)
  "hàn lập": { nameEn: "Han Li", nameZh: "韩立", defaultMovie: "Phàm Nhân Tu Tiên" },
  "han lap": { nameEn: "Han Li", nameZh: "韩立", defaultMovie: "Phàm Nhân Tu Tiên" },
  "nam cung uyển": { nameEn: "Nangong Wan", nameZh: "南宫婉", defaultMovie: "Phàm Nhân Tu Tiên" },
  "nam cung uyen": { nameEn: "Nangong Wan", nameZh: "南宫婉", defaultMovie: "Phàm Nhân Tu Tiên" },
  "tử linh": { nameEn: "Zi Ling", nameZh: "紫灵", defaultMovie: "Phàm Nhân Tu Tiên" },
  "tu linh": { nameEn: "Zi Ling", nameZh: "紫灵", defaultMovie: "Phàm Nhân Tu Tiên" },
  "ngân nguyệt": { nameEn: "Yin Yue", nameZh: "银月", defaultMovie: "Phàm Nhân Tu Tiên" },
  "ngan nguyet": { nameEn: "Yin Yue", nameZh: "银月", defaultMovie: "Phàm Nhân Tu Tiên" },
  "nguyên dao": { nameEn: "Yuan Yao", nameZh: "元瑶", defaultMovie: "Phàm Nhân Tu Tiên" },
  "nguyen dao": { nameEn: "Yuan Yao", nameZh: "元瑶", defaultMovie: "Phàm Nhân Tu Tiên" },
  "trần xảo thiến": { nameEn: "Chen Qiaoqian", nameZh: "陈巧倩", defaultMovie: "Phàm Nhân Tu Tiên" },

  // Thôn Phệ Tinh Không (Swallowed Star)
  "la phong": { nameEn: "Luo Feng", nameZh: "罗峰", defaultMovie: "Thôn Phệ Tinh Không" },
  "từ hân": { nameEn: "Xu Xin", nameZh: "徐欣", defaultMovie: "Thôn Phệ Tinh Không" },
  "tu hin": { nameEn: "Xu Xin", nameZh: "徐欣", defaultMovie: "Thôn Phệ Tinh Không" },
  "babata": { nameEn: "Babata", nameZh: "巴巴塔", defaultMovie: "Thôn Phệ Tinh Không" },
  "ba ba tháp": { nameEn: "Babata", nameZh: "巴巴塔", defaultMovie: "Thôn Phệ Tinh Không" },
  "yến ngọc": { nameEn: "Yan Yu", nameZh: "燕玉", defaultMovie: "Thôn Phệ Tinh Không" },
  "trần thiến": { nameEn: "Chen Qian", nameZh: "陈茜", defaultMovie: "Thôn Phệ Tinh Không" },

  // Già Thiên (Shrouding the Heavens)
  "diệp phàm": { nameEn: "Ye Fan", nameZh: "叶凡", defaultMovie: "Già Thiên" },
  "cơ tử nguyệt": { nameEn: "Ji Ziyue", nameZh: "姬紫月", defaultMovie: "Già Thiên" },
  "nhan như ngọc": { nameEn: "Yan Ruyu", nameZh: "颜如玉", defaultMovie: "Già Thiên" },
  "an diệu y": { nameEn: "An Miaoyi", nameZh: "安妙依", defaultMovie: "Già Thiên" },
  "ngoan nhân đại đế": { nameEn: "Ruthless Emperor", nameZh: "狠人大帝", defaultMovie: "Già Thiên" },
  "ngoan nhân": { nameEn: "Ruthless Great Emperor", nameZh: "狠人", defaultMovie: "Già Thiên" },
  "dao trì thánh nữ": { nameEn: "Yaochi Saintess", nameZh: "瑶池圣女", defaultMovie: "Già Thiên" },

  // Tiên Nghịch (Renegade Immortal)
  "vương lâm": { nameEn: "Wang Lin", nameZh: "王林", defaultMovie: "Tiên Nghịch" },
  "lý mộ uyển": { nameEn: "Li Muyuan", nameZh: "李慕婉", defaultMovie: "Tiên Nghịch" },
  "ly mo uyen": { nameEn: "Li Muyuan", nameZh: "李慕婉", defaultMovie: "Tiên Nghịch" },
  "liễu mi": { nameEn: "Liu Mei", nameZh: "柳眉", defaultMovie: "Tiên Nghịch" },
  "mộc băng mi": { nameEn: "Mu Bingmei", nameZh: "木冰眉", defaultMovie: "Tiên Nghịch" },

  // Vũ Động Càn Khôn (Martial Universe)
  "lâm động": { nameEn: "Lin Dong", nameZh: "林动", defaultMovie: "Vũ Động Càn Khôn" },
  "lăng thanh trúc": { nameEn: "Ling Qingzhu", nameZh: "绫清竹", defaultMovie: "Vũ Động Càn Khôn" },
  "lang thanh truc": { nameEn: "Ling Qingzhu", nameZh: "绫清竹", defaultMovie: "Vũ Động Càn Khôn" },
  "ứng hoan hoan": { nameEn: "Ying Huanhuan", nameZh: "应欢欢", defaultMovie: "Vũ Động Càn Khôn" },
  "ung hoan hoan": { nameEn: "Ying Huanhuan", nameZh: "应欢欢", defaultMovie: "Vũ Động Càn Khôn" },
  "thanh đàn": { nameEn: "Qingtan", nameZh: "青檀", defaultMovie: "Vũ Động Càn Khôn" },

  // Đại Chúa Tể (The Great Ruler)
  "mục trần": { nameEn: "Mu Chen", nameZh: "牧尘", defaultMovie: "Đại Chúa Tể" },
  "lạc ly": { nameEn: "Luo Li", nameZh: "洛璃", defaultMovie: "Đại Chúa Tể" },
  "cửu u": { nameEn: "Jiu You", nameZh: "九幽", defaultMovie: "Đại Chúa Tể" },

  // Nhất Niệm Vĩnh Hằng (A Will Eternal)
  "bạch tiểu thuần": { nameEn: "Bai Xiaochun", nameZh: "白小纯", defaultMovie: "Nhất Niệm Vĩnh Hằng" },
  "đỗ lăng phi": { nameEn: "Du Lingfei", nameZh: "杜凌菲", defaultMovie: "Nhất Niệm Vĩnh Hằng" },
  "tống quân uyển": { nameEn: "Song Junwan", nameZh: "宋君婉", defaultMovie: "Nhất Niệm Vĩnh Hằng" },
  "hầu tiểu muội": { nameEn: "Hou Xiaomei", nameZh: "侯小妹", defaultMovie: "Nhất Niệm Vĩnh Hằng" },

  // Thiếu Niên Ca Hành & Thiếu Niên Bạch Mã
  "tiêu sắt": { nameEn: "Xiao Se", nameZh: "萧瑟", defaultMovie: "Thiếu Niên Ca Hành" },
  "tư không thiên lạc": { nameEn: "Sikong Qianluo", nameZh: "司空千落", defaultMovie: "Thiếu Niên Ca Hành" },
  "vô tâm": { nameEn: "Wu Xin", nameZh: "无心", defaultMovie: "Thiếu Niên Ca Hành" },
  "diệp nhược y": { nameEn: "Ye Ruoyi", nameZh: "叶若依", defaultMovie: "Thiếu Niên Ca Hành" },
  "liễu nguyệt": { nameEn: "Liu Yue", nameZh: "柳月", defaultMovie: "Thiếu Niên Bạch Mã Túy Xuân Phong" },

  // Nghịch Thiên Tà Thần (Against the Gods)
  "vân triệt": { nameEn: "Yun Che", nameZh: "云澈", defaultMovie: "Nghịch Thiên Tà Thần" },
  "hạ khuynh nguyệt": { nameEn: "Xia Qingyue", nameZh: "夏倾月", defaultMovie: "Nghịch Thiên Tà Thần" },
  "nhạt vô tâm": { nameEn: "Mo Wuxin", nameZh: "茉莉", defaultMovie: "Nghịch Thiên Tà Thần" },
  "sở nguyệt thiền": { nameEn: "Chu Yuechan", nameZh: "楚月婵", defaultMovie: "Nghịch Thiên Tà Thần" },
  "mộc huyền âm": { nameEn: "Mu Xuanyin", nameZh: "沐玄音", defaultMovie: "Nghịch Thiên Tà Thần" },
  "thủy mị âm": { nameEn: "Shui Meiyin", nameZh: "水媚音", defaultMovie: "Nghịch Thiên Tà Thần" },

  // Final Fantasy & Gaming 3D Waifus
  "tifa": { nameEn: "Tifa Lockhart", nameZh: "蒂法·洛克哈特", defaultMovie: "Final Fantasy VII" },
  "tifa lockhart": { nameEn: "Tifa Lockhart", nameZh: "蒂法·洛克哈特", defaultMovie: "Final Fantasy VII" },
  "aerith": { nameEn: "Aerith Gainsborough", nameZh: "爱丽丝·盖恩斯巴勒", defaultMovie: "Final Fantasy VII" },
  "aerith gainsborough": { nameEn: "Aerith Gainsborough", nameZh: "爱丽丝", defaultMovie: "Final Fantasy VII" },
  "yuffie": { nameEn: "Yuffie Kisaragi", nameZh: "尤菲·如月", defaultMovie: "Final Fantasy VII" },
  "2b": { nameEn: "YoRHa No. 2 Type B (2B)", nameZh: "尤尔哈2号B型 (2B)", defaultMovie: "NieR: Automata" },
  "a2": { nameEn: "YoRHa Type A No. 2 (A2)", nameZh: "尤尔哈A型2号 (A2)", defaultMovie: "NieR: Automata" },
  "raiden shogun": { nameEn: "Raiden Shogun", nameZh: "雷电将军", defaultMovie: "Genshin Impact" },
  "lôi thần": { nameEn: "Raiden Shogun", nameZh: "雷电将军", defaultMovie: "Genshin Impact" },
  "yae miko": { nameEn: "Yae Miko", nameZh: "八重神子", defaultMovie: "Genshin Impact" },
  "ganyu": { nameEn: "Ganyu", nameZh: "甘雨", defaultMovie: "Genshin Impact" },
  "shenhe": { nameEn: "Shenhe", nameZh: "申鹤", defaultMovie: "Genshin Impact" },
  "yelan": { nameEn: "Yelan", nameZh: "夜兰", defaultMovie: "Genshin Impact" },
  "hu tao": { nameEn: "Hu Tao", nameZh: "胡桃", defaultMovie: "Genshin Impact" },
  "kafka": { nameEn: "Kafka", nameZh: "卡芙卡", defaultMovie: "Honkai: Star Rail" },
  "jingliu": { nameEn: "Jingliu", nameZh: "镜流", defaultMovie: "Honkai: Star Rail" },
  "ruan mei": { nameEn: "Ruan Mei", nameZh: "阮·梅", defaultMovie: "Honkai: Star Rail" },
  "acheron": { nameEn: "Acheron", nameZh: "黄泉", defaultMovie: "Honkai: Star Rail" },
  "firefly": { nameEn: "Firefly", nameZh: "流萤", defaultMovie: "Honkai: Star Rail" },
  "black swan": { nameEn: "Black Swan", nameZh: "黑天鹅", defaultMovie: "Honkai: Star Rail" },
  "ada wong": { nameEn: "Ada Wong", nameZh: "艾达·王", defaultMovie: "Resident Evil" },
};

// ═══════════════════════════════════════════════════════════════════════
// 2. SINO-VIETNAMESE (HÁN VIỆT) TO PINYIN & HANZI SYLLABLE TABLE
// ═══════════════════════════════════════════════════════════════════════
const SINO_VIETNAMESE_SYLLABLES: Record<string, { pinyin: string; hanzi: string }> = {
  an: { pinyin: "An", hanzi: "安" },
  anh: { pinyin: "Ying", hanzi: "英" },
  ba: { pinyin: "Ba", hanzi: "巴" },
  bach: { pinyin: "Bai", hanzi: "白" },
  bạch: { pinyin: "Bai", hanzi: "白" },
  bang: { pinyin: "Bing", hanzi: "冰" },
  băng: { pinyin: "Bing", hanzi: "冰" },
  bao: { pinyin: "Bao", hanzi: "宝" },
  bảo: { pinyin: "Bao", hanzi: "宝" },
  bich: { pinyin: "Bi", hanzi: "碧" },
  bích: { pinyin: "Bi", hanzi: "碧" },
  bi: { pinyin: "Bi", hanzi: "比" },
  bỉ: { pinyin: "Bi", hanzi: "比" },
  canh: { pinyin: "Geng", hanzi: "庚" },
  cao: { pinyin: "Gao", hanzi: "高" },
  chau: { pinyin: "Zhou", hanzi: "周" },
  chi: { pinyin: "Zhi", hanzi: "芝" },
  chien: { pinyin: "Zhan", hanzi: "战" },
  chiến: { pinyin: "Zhan", hanzi: "战" },
  chu: { pinyin: "Zhu", hanzi: "朱" },
  co: { pinyin: "Ji", hanzi: "姬" },
  cơ: { pinyin: "Ji", hanzi: "姬" },
  cuc: { pinyin: "Ju", hanzi: "菊" },
  cúc: { pinyin: "Ju", hanzi: "菊" },
  cuu: { pinyin: "Jiu", hanzi: "九" },
  cửu: { pinyin: "Jiu", hanzi: "九" },
  dan: { pinyin: "Dan", hanzi: "丹" },
  dao: { pinyin: "Dao", hanzi: "道" },
  đao: { pinyin: "Dao", hanzi: "刀" },
  diep: { pinyin: "Ye", hanzi: "叶" },
  diệp: { pinyin: "Ye", hanzi: "叶" },
  dieu: { pinyin: "Miao", hanzi: "妙" },
  diệu: { pinyin: "Miao", hanzi: "妙" },
  do: { pinyin: "Du", hanzi: "杜" },
  đo: { pinyin: "Du", hanzi: "杜" },
  đỗ: { pinyin: "Du", hanzi: "杜" },
  dong: { pinyin: "Dong", hanzi: "东" },
  đông: { pinyin: "Dong", hanzi: "东" },
  động: { pinyin: "Dong", hanzi: "动" },
  du: { pinyin: "Yu", hanzi: "余" },
  duong: { pinyin: "Yang", hanzi: "阳" },
  dương: { pinyin: "Yang", hanzi: "阳" },
  đường: { pinyin: "Tang", hanzi: "唐" },
  duoc: { pinyin: "Yao", hanzi: "药" },
  dược: { pinyin: "Yao", hanzi: "药" },
  gia: { pinyin: "Jia", hanzi: "嘉" },
  già: { pinyin: "Zhe", hanzi: "遮" },
  hai: { pinyin: "Hai", hanzi: "海" },
  hải: { pinyin: "Hai", hanzi: "海" },
  han: { pinyin: "Han", hanzi: "韩" },
  hàn: { pinyin: "Han", hanzi: "韩" },
  hao: { pinyin: "Hao", hanzi: "昊" },
  hạo: { pinyin: "Hao", hanzi: "昊" },
  hau: { pinyin: "Hou", hanzi: "侯" },
  hầu: { pinyin: "Hou", hanzi: "侯" },
  hien: { pinyin: "Xian", hanzi: "仙" },
  hiền: { pinyin: "Xian", hanzi: "贤" },
  hi: { pinyin: "Xi", hanzi: "曦" },
  hiep: { pinyin: "Xia", hanzi: "侠" },
  hiệp: { pinyin: "Xia", hanzi: "侠" },
  ho: { pinyin: "Hu", hanzi: "胡" },
  hồ: { pinyin: "Hu", hanzi: "胡" },
  hoa: { pinyin: "Hua", hanzi: "华" },
  hỏa: { pinyin: "Huo", hanzi: "火" },
  hoan: { pinyin: "Huan", hanzi: "欢" },
  hoàn: { pinyin: "Huan", hanzi: "环" },
  hoang: { pinyin: "Huang", hanzi: "皇" },
  hoàng: { pinyin: "Huang", hanzi: "黄" },
  hong: { pinyin: "Hong", hanzi: "红" },
  hồng: { pinyin: "Hong", hanzi: "红" },
  huan: { pinyin: "Xun", hanzi: "薰" },
  huân: { pinyin: "Xun", hanzi: "薰" },
  huong: { pinyin: "Xiang", hanzi: "香" },
  hương: { pinyin: "Xiang", hanzi: "香" },
  huyen: { pinyin: "Xuan", hanzi: "玄" },
  huyền: { pinyin: "Xuan", hanzi: "玄" },
  kha: { pinyin: "Ke", hanzi: "可" },
  khai: { pinyin: "Kai", hanzi: "开" },
  khuynh: { pinyin: "Qing", hanzi: "倾" },
  kiem: { pinyin: "Jian", hanzi: "剑" },
  kiếm: { pinyin: "Jian", hanzi: "剑" },
  kieu: { pinyin: "Qiao", hanzi: "娇" },
  kiều: { pinyin: "Qiao", hanzi: "乔" },
  la: { pinyin: "Luo", hanzi: "罗" },
  lac: { pinyin: "Luo", hanzi: "洛" },
  lạc: { pinyin: "Luo", hanzi: "洛" },
  lam: { pinyin: "Lin", hanzi: "林" },
  lâm: { pinyin: "Lin", hanzi: "林" },
  lan: { pinyin: "Lan", hanzi: "兰" },
  lân: { pinyin: "Lin", hanzi: "鳞" },
  lang: { pinyin: "Ling", hanzi: "绫" },
  lăng: { pinyin: "Ling", hanzi: "绫" },
  lap: { pinyin: "Li", hanzi: "立" },
  lập: { pinyin: "Li", hanzi: "立" },
  lien: { pinyin: "Lian", hanzi: "莲" },
  liên: { pinyin: "Lian", hanzi: "莲" },
  liet: { pinyin: "Lie", hanzi: "烈" },
  liệt: { pinyin: "Lie", hanzi: "烈" },
  lieu: { pinyin: "Liu", hanzi: "柳" },
  liễu: { pinyin: "Liu", hanzi: "柳" },
  linh: { pinyin: "Ling", hanzi: "灵" },
  lo: { pinyin: "Lu", hanzi: "卢" },
  long: { pinyin: "Long", hanzi: "龙" },
  ly: { pinyin: "Li", hanzi: "李" },
  lý: { pinyin: "Li", hanzi: "李" },
  ma: { pinyin: "Mo", hanzi: "魔" },
  mai: { pinyin: "Mei", hanzi: "梅" },
  minh: { pinyin: "Ming", hanzi: "明" },
  mo: { pinyin: "Mo", hanzi: "慕" },
  mộ: { pinyin: "Mu", hanzi: "慕" },
  muc: { pinyin: "Mu", hanzi: "牧" },
  mục: { pinyin: "Mu", hanzi: "牧" },
  my: { pinyin: "Mei", hanzi: "美" },
  mỹ: { pinyin: "Mei", hanzi: "美" },
  nam: { pinyin: "Nan", hanzi: "南" },
  nap: { pinyin: "Na", hanzi: "纳" },
  nạp: { pinyin: "Na", hanzi: "纳" },
  nga: { pinyin: "E", hanzi: "娥" },
  ngan: { pinyin: "Yin", hanzi: "银" },
  ngân: { pinyin: "Yin", hanzi: "银" },
  nghiem: { pinyin: "Yan", hanzi: "严" },
  nghiep: { pinyin: "Ye", hanzi: "业" },
  ngoan: { pinyin: "Hen", hanzi: "狠" },
  ngoc: { pinyin: "Yu", hanzi: "玉" },
  ngọc: { pinyin: "Yu", hanzi: "玉" },
  nguyen: { pinyin: "Yuan", hanzi: "元" },
  nguyên: { pinyin: "Yuan", hanzi: "元" },
  nguyet: { pinyin: "Yue", hanzi: "月" },
  nguyệt: { pinyin: "Yue", hanzi: "月" },
  nhan: { pinyin: "Yan", hanzi: "颜" },
  nhân: { pinyin: "Ren", hanzi: "人" },
  nhật: { pinyin: "Ri", hanzi: "日" },
  nhi: { pinyin: "Er", hanzi: "儿" },
  nhị: { pinyin: "Er", hanzi: "二" },
  ninh: { pinyin: "Ning", hanzi: "宁" },
  nu: { pinyin: "Nu", hanzi: "女" },
  nữ: { pinyin: "Nv", hanzi: "女" },
  oanh: { pinyin: "Ying", hanzi: "莺" },
  pham: { pinyin: "Fan", hanzi: "凡" },
  phàm: { pinyin: "Fan", hanzi: "凡" },
  phi: { pinyin: "Fei", hanzi: "妃" },
  phong: { pinyin: "Feng", hanzi: "风" },
  phuong: { pinyin: "Fang", hanzi: "芳" },
  phương: { pinyin: "Feng", hanzi: "凤" },
  quang: { pinyin: "Guang", hanzi: "光" },
  quan: { pinyin: "Jun", hanzi: "君" },
  quân: { pinyin: "Jun", hanzi: "君" },
  quoc: { pinyin: "Guo", hanzi: "国" },
  quynh: { pinyin: "Qiong", hanzi: "琼" },
  quỳnh: { pinyin: "Qiong", hanzi: "琼" },
  sat: { pinyin: "Se", hanzi: "瑟" },
  sắt: { pinyin: "Se", hanzi: "瑟" },
  so: { pinyin: "Chu", hanzi: "楚" },
  sở: { pinyin: "Chu", hanzi: "楚" },
  son: { pinyin: "Shan", hanzi: "山" },
  tai: { pinyin: "Cai", hanzi: "彩" },
  tái: { pinyin: "Sai", hanzi: "塞" },
  tam: { pinyin: "San", hanzi: "三" },
  tay: { pinyin: "Xi", hanzi: "西" },
  tây: { pinyin: "Xi", hanzi: "西" },
  thach: { pinyin: "Shi", hanzi: "石" },
  thạch: { pinyin: "Shi", hanzi: "石" },
  thai: { pinyin: "Cai", hanzi: "彩" },
  thần: { pinyin: "Shen", hanzi: "神" },
  thanh: { pinyin: "Qing", hanzi: "青" },
  thap: { pinyin: "Ta", hanzi: "塔" },
  tháp: { pinyin: "Ta", hanzi: "塔" },
  the: { pinyin: "Shi", hanzi: "世" },
  thế: { pinyin: "Shi", hanzi: "世" },
  thien: { pinyin: "Qian", hanzi: "千" },
  thiên: { pinyin: "Tian", hanzi: "天" },
  thiện: { pinyin: "Shan", hanzi: "善" },
  thieu: { pinyin: "Shao", hanzi: "少" },
  thiếu: { pinyin: "Shao", hanzi: "少" },
  thon: { pinyin: "Tun", hanzi: "吞" },
  thôn: { pinyin: "Tun", hanzi: "吞" },
  thu: { pinyin: "Qiu", hanzi: "秋" },
  thuần: { pinyin: "Chun", hanzi: "纯" },
  thuy: { pinyin: "Shui", hanzi: "水" },
  thủy: { pinyin: "Shui", hanzi: "水" },
  thuyet: { pinyin: "Xue", hanzi: "雪" },
  tieu: { pinyin: "Xiao", hanzi: "萧" },
  tiêu: { pinyin: "Xiao", hanzi: "萧" },
  tiểu: { pinyin: "Xiao", hanzi: "小" },
  tin: { pinyin: "Xin", hanzi: "信" },
  tinh: { pinyin: "Xing", hanzi: "星" },
  toa: { pinyin: "Sha", hanzi: "莎" },
  tỏa: { pinyin: "Suo", hanzi: "锁" },
  tong: { pinyin: "Song", hanzi: "宋" },
  tống: { pinyin: "Song", hanzi: "宋" },
  tran: { pinyin: "Chen", hanzi: "陈" },
  trần: { pinyin: "Chen", hanzi: "陈" },
  triet: { pinyin: "Che", hanzi: "澈" },
  triệt: { pinyin: "Che", hanzi: "澈" },
  truc: { pinyin: "Zhu", hanzi: "竹" },
  trúc: { pinyin: "Zhu", hanzi: "竹" },
  trung: { pinyin: "Zhong", hanzi: "中" },
  tu: { pinyin: "Zi", hanzi: "紫" },
  tử: { pinyin: "Zi", hanzi: "紫" },
  tuyet: { pinyin: "Xue", hanzi: "雪" },
  tuyết: { pinyin: "Xue", hanzi: "雪" },
  uyen: { pinyin: "Wan", hanzi: "婉" },
  uyển: { pinyin: "Wan", hanzi: "婉" },
  van: { pinyin: "Yun", hanzi: "云" },
  vân: { pinyin: "Yun", hanzi: "云" },
  vận: { pinyin: "Yun", hanzi: "韵" },
  vi: { pinyin: "Wei", hanzi: "微" },
  viem: { pinyin: "Yan", hanzi: "炎" },
  viêm: { pinyin: "Yan", hanzi: "炎" },
  vinh: { pinyin: "Rong", hanzi: "荣" },
  vu: { pinyin: "Wu", hanzi: "舞" },
  vũ: { pinyin: "Wu", hanzi: "武" },
  vuong: { pinyin: "Wang", hanzi: "王" },
  vương: { pinyin: "Wang", hanzi: "王" },
  xuan: { pinyin: "Xuan", hanzi: "萱" },
  xuân: { pinyin: "Chun", hanzi: "春" },
  yen: { pinyin: "Yan", hanzi: "嫣" },
  yên: { pinyin: "Yan", hanzi: "嫣" },
  y: { pinyin: "Yi", hanzi: "依" },
  ỷ: { pinyin: "Yi", hanzi: "绮" },
};

/**
 * Transliterates Vietnamese name syllables into Pinyin and Hanzi using algorithm
 */
function transliterateSinoVietnamese(nameVi: string): { nameEn: string; nameZh: string } {
  const clean = nameVi.trim().replace(/\s+/g, " ");
  const words = clean.split(" ");

  const pinyinParts: string[] = [];
  const hanziParts: string[] = [];

  for (const w of words) {
    const lower = w.toLowerCase();
    const match = SINO_VIETNAMESE_SYLLABLES[lower];
    if (match) {
      pinyinParts.push(match.pinyin);
      hanziParts.push(match.hanzi);
    } else {
      // Capitalize first letter of word
      const cap = w.charAt(0).toUpperCase() + w.slice(1);
      pinyinParts.push(cap);
      hanziParts.push(w);
    }
  }

  const nameEn = pinyinParts.join(" ");
  const nameZh = hanziParts.join("");

  return { nameEn, nameZh };
}

// ═══════════════════════════════════════════════════════════════════════
// 3. TRANSLATION ENGINE (AI + DICT + TRANSLITERATION)
// ═══════════════════════════════════════════════════════════════════════
export async function generateCharacterTranslations(nameVi: string): Promise<{ nameEn: string; nameZh: string }> {
  const cleanName = nameVi.trim();
  if (!cleanName) {
    return { nameEn: "", nameZh: "" };
  }

  const lowerName = cleanName.toLowerCase();

  // 1. Direct dictionary match
  if (POPULAR_CHARACTERS_DICT[lowerName]) {
    const hit = POPULAR_CHARACTERS_DICT[lowerName];
    return { nameEn: hit.nameEn, nameZh: hit.nameZh };
  }

  // 2. Try AI Translation if Gemini or OpenAI key exists
  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (geminiApiKey || openAiApiKey) {
    const prompt = `Bạn là chuyên gia dịch thuật tên nhân vật hoạt hình 3D Donghua, Anime, Game Trung Quốc / Nhật Bản sang tiếng Anh (Pinyin chuẩn hoặc tên phương Tây) và tiếng Trung (chữ Hán giản thể chuẩn).
Tên nhân vật tiếng Việt: "${cleanName}".

Hãy suy đoán chính xác tên gốc của nhân vật trong tác phẩm hoạt hình 3D / Donghua tương ứng.
Trả về DUY NHẤT một chuỗi JSON hợp lệ với định dạng:
{"nameEn": "Tên tiếng Anh hoặc Pinyin", "nameZh": "Tên chữ Hán Trung Quốc"}

Không thêm bất kỳ giải thích, markdown hay text thừa nào khác.`;

    if (geminiApiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 100,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.nameEn && parsed.nameZh) {
              return { nameEn: String(parsed.nameEn).trim(), nameZh: String(parsed.nameZh).trim() };
            }
          }
        }
      } catch (e) {
        console.warn("Gemini translate failed, falling back:", e);
      }
    }

    if (openAiApiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.nameEn && parsed.nameZh) {
              return { nameEn: String(parsed.nameEn).trim(), nameZh: String(parsed.nameZh).trim() };
            }
          }
        }
      } catch (e) {
        console.warn("OpenAI translate failed, falling back:", e);
      }
    }
  }

  // 3. Algorithmic fallback
  return transliterateSinoVietnamese(cleanName);
}

// ═══════════════════════════════════════════════════════════════════════
// 4. CHARACTER LORE & BIOGRAPHY KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════════
export const CHARACTER_LORE_DATABASE: Record<string, string> = {
  // Đấu Phá Thương Khung
  "mỹ đỗ toa": "Mỹ Đỗ Toa (Medusa / 彩鳞) là Nữ Vương tối cao của Xà Nhân Tộc trong tác phẩm Đấu Phá Thương Khung. Nàng sở hữu nhan sắc khuynh thành tuyệt mỹ, khí chất kiêu sa lạnh lùng cùng thực lực Đấu Tông hùng mạnh, sau trở thành thê tử gắn bó trọn đời bên Tiêu Viêm.",
  "thải lân": "Thải Lân (Cai Lin / 彩鳞) hay Nữ Vương Mỹ Đỗ Toa, là thủ lĩnh Xà Nhân Tộc mang vẻ đẹp diễm lệ ma mị và phong thái vương giả trong Đấu Phá Thương Khung. Với thực lực cái thế cùng huyết mạch Thất Thải Thôn Thiên Mãng, nàng là đại mỹ nhân được yêu thích bậc nhất thế giới hoạt hình 3D.",
  "tiêu viêm": "Tiêu Viêm (Xiao Yan / 萧炎) là nhân vật chính của siêu phẩm Đấu Phá Thương Khung. Xuất thân từ Tiêu gia, với ý chí kiên định bất khuất và tài năng luyện dược trác tuyệt, Tiêu Viêm từng bước thu phục các loại Dị Hỏa hùng mạnh, chinh phục Đấu Khí Đại Lục và xưng danh Viêm Đế vô thượng.",
  "vân vận": "Vân Vận (Yun Yun / 云韵) là Tông chủ đời thứ chín của Vân Lam Tông trong Đấu Phá Thương Khung. Mang vẻ đẹp thoát tục thanh nhã, phong thái kiếm tiên xuất chúng cùng trái tim thủy chung, mối lương duyên đầy day dứt giữa nàng và Tiêu Viêm tại Ma Thú Sơn Mạch luôn làm say đắm người xem.",
  "tiêu huân nhi": "Tiêu Huân Nhi (Xiao Xun'er / 萧薰儿) là thiên kim tiểu thư thần bí của Cổ Tộc hùng mạnh trong Đấu Phá Thương Khung. Nàng sở hữu huyết mạch Đấu Đế thần phẩm, dung mạo thanh thuần thoát tục như trích tiên và luôn một lòng hướng về Tiêu Viêm ca ca.",
  "tiểu y tiên": "Tiểu Y Tiên (Xiao Yixian / 小医仙) là hồng nhan tri kỷ của Tiêu Viêm trong Đấu Phá Thương Khung, người mang thể chất Ách Nan Độc Thể hiếm có. Nàng sở hữu dung mạo dịu dàng thánh thiện nhưng ẩn chứa sức mạnh độc thuật hủy diệt, sau trở thành Thiên Độc Nữ danh chấn Trung Châu.",
  "nhã phi": "Nhã Phi (Ya Fei / 雅妃) là đệ nhất mỹ nhân đấu giá của Mễ Đặc Nhĩ gia tộc trong Đấu Phá Thương Khung. Nàng nổi danh với vẻ đẹp gợi cảm, phong thái quyến rũ mê hồn cùng trí tuệ sắc sảo và tài năng giao thương tinh tế bậc nhất Gia Mã Đế Quốc.",
  "nạp lan yên nhiên": "Nạp Lan Yên Nhiên (Nalan Yanran / 纳兰嫣然) là truyền nhân kiêu hãnh của Vân Lam Tông trong Đấu Phá Thương Khung. Với tính cách quật cường, dung mạo thanh tú và tài năng kiếm thuật xuất sắc, nàng là nhân vật then chốt mở ra lời ước hẹn 3 năm chấn động với Tiêu Viêm.",

  // Đấu La Đại Lục
  "tiểu vũ": "Tiểu Vũ (Xiao Wu / 小舞) là nữ nhân vật chính đáng yêu trong Đấu La Đại Lục, mang thân phận Hồn thú Thập Vạn Năm Nhu Cốt Thỏ hóa hình. Nàng sở hữu ngoại hình ngọt ngào, nhu kỹ cận chiến biến ảo và tình yêu sâu sắc, sẵn sàng hiến tế linh hồn vì Đường Tam.",
  "đường tam": "Đường Tam (Tang San / 唐三) là đệ tử Thiên Môn của Đường Môn chuyển sinh trong Đấu La Đại Lục. Sở hữu song sinh Vũ Hồn Lam Ngân Thảo và Hạo Thiên Chùy, chàng cùng Sử Lai Khắc Thất Quái vượt qua muôn vàn gian nan để trở thành Hải Thần và Tu La Thần tối cao.",
  "bỉ bỉ đông": "Bỉ Bỉ Đông (Bibi Dong / 比比东) là Giáo Hoàng tối cao của Vũ Hồn Điện kiêm Đế Hoàng Vũ Hồn Đế Quốc trong Đấu La Đại Lục. Nàng là nữ cường giả đỉnh phong với nhan sắc diễm lệ tuyệt trần, khí chất vương giả uy nghiêm cùng sức mạnh La Sát Thần vô song.",
  "thiên nhận tuyết": "Thiên Nhận Tuyết (Qian Renxue / 千仞雪) là con gái của Giáo Hoàng Bỉ Bỉ Đông, người thừa kế Vũ Hồn Lục Dực Thiên Sứ thần thánh trong Đấu La Đại Lục. Nàng sở hữu dung nhan kiêu sa lộng lẫy, tài trí hơn người và là người đầu tiên kế thừa Thần vị Thiên Sứ Thần.",
  "chu trúc thanh": "Chu Trúc Thanh (Zhu Zhuqing / 朱竹清) là U Minh Linh Miêu của Sử Lai Khắc Thất Quái trong Đấu La Đại Lục. Nổi tiếng với thân hình bốc lửa quyến rũ, tính cách lạnh lùng quả cảm cùng tốc độ mẫn tiệp hàng đầu, nàng là waifu 3D được đông đảo khán giả yêu thích.",
  "ninh vinh vinh": "Ninh Vinh Vinh (Ning Rongrong / 宁荣荣) là tiểu công chúa của Thất Bảo Lưu Ly Tông trong Đấu La Đại Lục. Sở hữu Vũ Hồn hỗ trợ đệ nhất thiên hạ Cửu Bảo Lưu Ly Tháp, nàng mang nét đẹp trong sáng quý phái cùng tính cách hoạt bát, đáng yêu.",
  "liễu nhị long": "Liễu Nhị Long (Liu Erlong / 柳二龙) là Viện trưởng Học viện Lam Bá kiêm thành viên Hoàng Kim Thiết Tam Giác trong Đấu La Đại Lục. Nàng mang Vũ Hồn Hỏa Long cuồng bạo, sở hữu thân hình đẫy đà gợi cảm và tính cách cương liệt, hết lòng bảo bọc học viên.",
  "ba tái tây": "Ba Tái Tây (Bo Saixi / 波塞西) là Đại Tế Ty tối cao của Hải Thần Đảo, một trong Tam Đại Tuyệt Thế Đấu La của Đấu La Đại Lục. Nàng mang khí chất thần thánh cao quý, quyền năng điều khiển đại dương mênh mông cùng nét đẹp vĩnh hằng vượt thời gian.",
  "hồ liệt na": "Hồ Liệt Na (Hu Liena / 胡列娜) là Thánh Nữ của Vũ Hồn Điện, đệ tử chân truyền của Bỉ Bỉ Đông trong Đấu La Đại Lục. Nàng sở hữu Vũ Hồn Yêu Hồ mê hoặc, dung nhan quyến rũ sắc sảo cùng mối tình đơn phương sâu sắc dành cho Đường Tam tại Sát Lục Chi Đô.",

  // Hoàn Mỹ Thế Giới
  "thạch hạo": "Thạch Hạo (Shi Hao / 石昊) là nhân vật chính cái thế trong Hoàn Mỹ Thế Giới, người xưng danh Hoang Thiên Đế độc đoán vạn cổ. Sinh ra mang Chí Tôn Cốt, trải qua ngàn vạn kiếp nạn tôi luyện, chàng một mình chiến đấu bảo vệ Cửu Thiên Thập Địa và trấn áp hắc ám trường tồn.",
  "hỏa linh nhi": "Hỏa Linh Nhi (Huo Ling'er / 火灵儿) là Công chúa Hỏa Quốc trong Hoàn Mỹ Thế Giới, hồng nhan tri kỷ khắc cốt ghi tâm nhất của Thạch Hạo. Nàng sở hữu tính cách nhiệt huyết chân thành cùng dung mạo kiều diễm rực rỡ như đóa lửa hồng nở rộ chốn nhân gian.",
  "vân hi": "Vân Hi (Yun Xi / 云曦) là Thần Nữ của Thiên Nhân Tộc trong Hoàn Mỹ Thế Giới. Mang vẻ đẹp dịu dàng thánh khiết với mái tóc tím quyến rũ cùng phong thái tiên nữ phiêu dật, nàng là người cùng Thạch Hạo trải qua những năm tháng thanh xuân yên bình nơi hạ giới.",
  "nguyệt thiền": "Nguyệt Thiền (Yue Chan / 月婵) là Thánh Nữ của Bổ Thiên Giáo trong Hoàn Mỹ Thế Giới. Nổi tiếng với nhan sắc tựa trích tiên hạ phàm, khí chất thanh lãnh cao quý và trí tuệ thâm sâu, nàng có mối nhân duyên kỳ ngộ sâu đậm cùng Thạch Hạo.",
  "thanh y": "Thanh Y (Qing Yi / 清漪) là thứ thân của Nguyệt Thiền trong Hoàn Mỹ Thế Giới. Với tính cách độc lập, dung mạo thoát tục cùng trái tim chân thành, nàng đã cùng Thạch Hạo kề vai sát cánh qua nhiều sinh tử tại Ba Ngàn Châu.",
  "liễu thần": "Liễu Thần (Willow Deity / Liu Shen - 柳神) là Tế Linh vô thượng của Thạch Thôn thời viễn cổ trong Hoàn Mỹ Thế Giới. Nàng là Đấng Tiên Vương tối cao với pháp lực thông thiên, mang dung mạo tuyệt thế vô song và phong thái uy nghiêm, độ lượng bảo bọc cho Thạch Hạo trưởng thành.",

  // Phàm Nhân Tu Tiên
  "hàn lập": "Hàn Lập (Han Li / 韩立) là nhân vật chính của siêu phẩm Phàm Nhân Tu Tiên. Xuất thân từ phàm nhân bình thường không có bối cảnh, nhờ tâm tính cẩn trọng cơ trí, sự kiên định phi thường cùng sự trợ giúp của Chưởng Thiên Bình, chàng từng bước vượt qua ngàn dặm chông gai để đắc đạo thành Tiên.",
  "nam cung uyển": "Nam Cung Uyển (Nangong Wan / 南宫婉) là nữ tu sĩ xinh đẹp thuộc Yểm Nguyệt Tông và là đạo lữ trọn đời của Hàn Lập trong Phàm Nhân Tu Tiên. Nàng sở hữu dung nhan thanh nhã đoan trang, khí chất ôn nhu cùng tu vi cao thâm, là bến đỗ bình yên nhất trên con đường tu tiên của Hàn Lập.",
  "tử linh": "Tử Linh (Zi Ling / 紫灵) là đệ nhất mỹ nhân Loạn Tinh Hải kiêm Cung chủ Diệu Âm Môn trong Phàm Nhân Tu Tiên. Sở hữu nhan sắc diễm lệ tuyệt đỉnh có thể làm điên đảo chúng sinh cùng trí tuệ nhạy bén, nàng là một trong những hồng nhan có duyên phận sâu sắc nhất với Hàn Lập.",

  // Thôn Phệ Tinh Không
  "la phong": "La Phong (Luo Feng / 罗峰) là Lãnh chúa Ngân Hà vĩ đại trong tác phẩm Thôn Phệ Tinh Không. Từ một thiếu niên nghèo khó tại Địa Cầu thời đại biến dị, La Phong đã nỗ lực không ngừng, thức tỉnh Tinh Thần Niệm Lực và đoạt xá Kim Giác Cự Thú để vươn lên đỉnh cao vũ trụ bao la.",
  "từ hân": "Từ Hân (Xu Xin / 徐欣) là tiểu thư gia tộc Từ thị và là người vợ hiền thục thủy chung của La Phong trong Thôn Phệ Tinh Không. Nàng mang nét đẹp thanh lịch thông minh, luôn là điểm tựa hậu phương vững chắc cho La Phong chinh phục các tầng không gian vũ trụ.",
  "babata": "Babata (Ba Ba Tháp - 巴巴塔) là trí tuệ nhân tạo (AI) cao cấp của Vẫn Mặc Tinh Chủ trong Thôn Phệ Tinh Không. Với tạo hình tiểu ác ma đáng yêu, tính cách tinh nghịch nhưng uyên bác, Babata là người dẫn dắt La Phong bước vào thế giới tu luyện vũ trụ đỉnh cao.",

  // Già Thiên & Tiên Nghịch
  "diệp phàm": "Diệp Phàm (Ye Fan / 叶凡) là Diệp Thiên Đế cái thế trong tác phẩm Già Thiên. Sở hữu Hoang Cổ Thánh Thể nghịch thiên, Diệp Phàm đạp lên chư thiên vạn đạo, quét ngang cấm khu sinh mệnh và dẫn dắt Thiên Đình xưng bá vũ trụ bất hủ.",
  "cơ tử nguyệt": "Cơ Tử Nguyệt (Ji Ziyue / 姬紫月) là minh châu của Hoang Cổ Cơ Gia trong tác phẩm Già Thiên. Nàng sở hữu Nguyên Linh Thể hiếm có, dung nhan linh động xinh đẹp cùng tính cách hoạt bát lém lỉnh, là người đồng hành tri kỷ bên cạnh Diệp Thiên Đế.",
  "vương lâm": "Vương Lâm (Wang Lin / 王林) là nhân vật chính của siêu phẩm Tiên Nghịch. Với tư chất bình thường nhưng ý chí sắt đá và tâm tính nghịch thiên tu đạo, chàng bước đi trên con đường sát phạt quyết đoán để bảo vệ người thương Lý Mộ Uyển.",
  "lý mộ uyển": "Lý Mộ Uyển (Li Muyuan / 李慕婉) là hồng nhan tri kỷ khắc cốt ghi tâm của Vương Lâm trong Tiên Nghịch. Nàng mang vẻ đẹp dịu dàng thuần khiết, tính cách chung thủy son sắt và là động lực lớn nhất để Vương Lâm nghịch chuyển sinh tử luân hồi.",

  // Gaming 3D
  "tifa lockhart": "Tifa Lockhart là nữ chiến binh xinh đẹp của tổ chức Avalanche trong siêu phẩm Final Fantasy VII. Nổi tiếng với thân hình gợi cảm bốc lửa, kỹ năng quyền cước thượng thừa cùng trái tim nhân hậu dịu dàng, Tifa là tượng đài nhan sắc waifu 3D bất hủ của làng game thế giới.",
  "tifa": "Tifa Lockhart là nữ chiến binh xinh đẹp của tổ chức Avalanche trong siêu phẩm Final Fantasy VII. Nổi tiếng với thân hình gợi cảm bốc lửa, kỹ năng quyền cước thượng thừa cùng trái tim nhân hậu dịu dàng, Tifa là tượng đài nhan sắc waifu 3D bất hủ của làng game thế giới.",
  "aerith gainsborough": "Aerith Gainsborough là hậu duệ cuối cùng của tộc Cetra cổ đại trong Final Fantasy VII. Nàng sở hữu nụ cười rạng rỡ, tâm hồn thánh thiện cùng năng lượng kết nối với dòng Lifestream vĩ đại của hành tinh, mang vẻ đẹp thuần khiết lay động lòng người.",
  "2b": "2B (YoRHa No. 2 Type B) là nữ chiến binh android tinh nhuệ thuộc lực lượng YoRHa trong NieR: Automata. Với phong cách chiến đấu mãn nhãn, tạo hình gothic quyến rũ cùng biểu cảm lạnh lùng ẩn chứa nội tâm sâu sắc, 2B là biểu tượng nữ nhân vật 3D nổi tiếng toàn cầu.",
  "raiden shogun": "Raiden Shogun (Lôi Điện Tướng Quân) là vị Lôi Thần tối cao cai quản vùng đất Inazuma trong Genshin Impact. Mang vẻ đẹp uy nghiêm vương giả, thần thái kiêu hãnh cùng kiếm pháp Vô Tưởng Nhất Đao chém đứt không gian, nàng là biểu tượng sức mạnh và quyền uy tối thượng.",
  "yae miko": "Yae Miko là Đại Đền Chủ Đền Narukami kiêm Tổng Biên Tập Nhà Xuất Bản Yae trong Genshin Impact. Nàng là hồ ly ngàn năm quyến rũ, thông tuệ, vừa mang phong thái thần bí lại vừa tinh nghịch, duyên dáng khó cưỡng.",
  "kafka": "Kafka là thành viên cốt cán bí ẩn của tổ chức Thợ Săn Stellaron trong Honkai: Star Rail. Nổi tiếng với phong cách quý phái thanh lịch, nụ cười mê hoặc cùng năng lực Ngôn Linh chi phối tâm trí đối phương, Kafka là waifu được săn đón hàng đầu.",
};

// ═══════════════════════════════════════════════════════════════════════
// 5. CHARACTER PROFILE & SEO DESCRIPTION GENERATOR
// ═══════════════════════════════════════════════════════════════════════
export interface CharacterDescriptionParams {
  name: string;
  movieName?: string;
  nameEn?: string;
  nameZh?: string;
}

/**
 * Algorithmic Character Profile / Introduction generator
 */
function generateAlgorithmicCharacterDescription({
  name,
  movieName,
  nameEn,
  nameZh,
}: CharacterDescriptionParams): string {
  const cleanName = name.trim();
  const lowerName = cleanName.toLowerCase();

  // 1. Direct hit in character lore database
  if (CHARACTER_LORE_DATABASE[lowerName]) {
    return CHARACTER_LORE_DATABASE[lowerName];
  }

  const aliasPart = [nameEn, nameZh].filter(Boolean).join(" - ");
  const aliasDisplay = aliasPart ? ` (${aliasPart})` : "";
  const movieDisplay = movieName ? ` trong tác phẩm hoạt hình 3D "${movieName}"` : " trong thế giới phim hoạt hình 3D";

  const patterns = [
    `${cleanName}${aliasDisplay} là một trong những nhân vật nổi bật và được yêu thích nhất${movieDisplay}. Nhân vật ghi dấu ấn sâu đậm nhờ tạo hình 3D sống động, khí chất cuốn hút cùng tính cách đặc trưng, đóng vai trò quan trọng trong cốt truyện và hành trình của các nhân vật chính.`,
    `Xuất hiện${movieDisplay}, ${cleanName}${aliasDisplay} chinh phục người hâm mộ bởi dung mạo ấn tượng, phong thái cuốn hút cùng tài năng xuất chúng. Nhân vật không chỉ sở hữu nét đẹp đặc sắc mà còn mang câu chuyện lai lịch hấp dẫn cùng nhiều khoảnh khắc đáng nhớ xuyên suốt tác phẩm.`,
    `${cleanName}${aliasDisplay} là gương mặt quen thuộc và đầy sức hút${movieDisplay}. Với thiết kế đồ họa 3D trau chuốt tỉ mỉ, biểu cảm chân thực và thần thái nổi bật, nhân vật luôn nhận được sự quan tâm và mến mộ đặc biệt từ đông đảo cộng đồng người xem.`
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * Generates Character Profile & Lore Description using AI with Algorithmic Fallback
 */
export async function generateCharacterSeoDescription(
  params: CharacterDescriptionParams
): Promise<string> {
  const { name, movieName, nameEn, nameZh } = params;
  if (!name || !name.trim()) {
    throw new Error("Tên nhân vật không được để trống khi tạo mô tả.");
  }

  const cleanName = name.trim();
  const lowerName = cleanName.toLowerCase();

  // If we have an exact rich lore profile in database, return immediately for best quality & speed
  if (CHARACTER_LORE_DATABASE[lowerName]) {
    return CHARACTER_LORE_DATABASE[lowerName];
  }

  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  const prompt = `Bạn là chuyên gia am hiểu sâu sắc về hoạt hình 3D Donghua Trung Quốc, Anime và Game 3D.
Hãy viết một đoạn văn GIỚI THIỆU TIỂU SỬ VÀ ĐẶC ĐIỂM NHÂN VẬT (Character Profile & Lore) chuẩn xác, lôi cuốn cho nhân vật sau:

- Tên nhân vật: ${cleanName}
${nameEn ? `- Tên Tiếng Anh / Pinyin: ${nameEn}` : ""}
${nameZh ? `- Tên Tiếng Trung: ${nameZh}` : ""}
${movieName ? `- Xuất hiện trong phim / tác phẩm: ${movieName}` : ""}

Yêu cầu nội dung:
1. Giới thiệu rõ ràng: Thân phận, lai lịch, địa vị, tính cách đặc trưng hoặc mối quan hệ nổi bật của nhân vật trong cốt truyện của phim/truyện.
2. Nêu bật nét đẹp, thần thái hoặc năng lực/võ công/vai trò ấn tượng của nhân vật.
3. Độ dài: 2 đến 3 câu văn (khoảng 50 - 80 từ), giọng văn trang nhã, cuốn hút, súc tích và chuẩn xác theo nguyên tác.
4. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN VĂN BẢN GIỚI THIỆU NHÂN VẬT (không thêm tiêu đề, không bọc dấu ngoặc kép, không thêm lời dẫn).`;

  if (geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 250,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return text.replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch (e) {
      console.warn("Gemini Character Lore failed, using algorithmic fallback:", e);
    }
  }

  if (openAiApiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là chuyên gia về tiểu sử nhân vật hoạt hình 3D Donghua, Anime và Game. Luôn viết lời giới thiệu nhân vật chuẩn xác, hấp dẫn bằng tiếng Việt.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 250,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return text.replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch (e) {
      console.warn("OpenAI Character Lore failed, using algorithmic fallback:", e);
    }
  }

  return generateAlgorithmicCharacterDescription(params);
}

