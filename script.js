// 吕祖灵签摇签应用 JavaScript 代码

// DOM 元素
const shakeBtn = document.getElementById('shake-btn');
const interpretBtn = document.getElementById('interpret-btn');
const signResult = document.getElementById('sign-result');
const interpretation = document.getElementById('interpretation');
// 统计相关DOM元素
const totalUses = document.getElementById('totalUses');
const uniqueUsers = document.getElementById('uniqueUsers');

// 统计数据
let stats = {
    totalUses: 0,
    userIds: new Set()
};

// 生成简单的浏览器指纹
function generateBrowserFingerprint() {
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.cookieEnabled
    ].join('|');
    
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

// 用户ID生成与存储
let userId = localStorage.getItem('shakeSignUserId');
if (!userId) {
    // 生成更唯一的用户ID：时间戳 + 浏览器指纹 + 随机数
    const fingerprint = generateBrowserFingerprint();
    userId = 'user_' + Date.now() + '_' + fingerprint + '_' + Math.floor(Math.random() * 1000);
    localStorage.setItem('shakeSignUserId', userId);
}

// 从localStorage加载统计数据
function loadStats() {
    const savedStats = localStorage.getItem('shakeSignStats');
    if (savedStats) {
        try {
            const parsedStats = JSON.parse(savedStats);
            stats.totalUses = parsedStats.totalUses || 0;
            stats.userIds = new Set(parsedStats.userIds || []);
        } catch (error) {
            console.error('加载统计数据失败:', error);
            // 如果加载失败，使用默认值
            stats = {
                totalUses: 0,
                userIds: new Set()
            };
        }
    }
    
    // 添加当前用户ID到集合中
    if (!stats.userIds.has(userId)) {
        stats.userIds.add(userId);
        saveStats();
    }
    
    updateStatsDisplay();
}

// 保存统计数据到localStorage
function saveStats() {
    const statsToSave = {
        totalUses: stats.totalUses,
        userIds: Array.from(stats.userIds)
    };
    localStorage.setItem('shakeSignStats', JSON.stringify(statsToSave));
}

// 更新统计数据显示
function updateStatsDisplay() {
    if (totalUses) {
        totalUses.textContent = stats.totalUses;
    }
    if (uniqueUsers) {
        uniqueUsers.textContent = stats.userIds.size;
    }
}

// 增加使用次数
function incrementUsage() {
    stats.totalUses++;
    saveStats();
    updateStatsDisplay();
}

// 当前摇出的签号
let currentSignNumber = null;
let currentSignData = null;

// 模拟签文数据
const signData = {
    1: {
        title: "古人王母祝寿",
        signText: "蓬莱东阁玉桃香，顺水行舟仙赐方；\n宜男正好图全计，不必他方卜地长。",
        explanation: "王母娘娘大寿，各仙家前往致贺，场面极爲浩大。王母对贺客皆赐以仙桃仙丹等长生不老的美食。衆仙大会，乐韵钧天，属吉庆徵兆。",
        details: "谋望：不要急于成事，须待时机。\n钱财：委託异性去处理，收穫较易较佳。\n婚姻：虽吉，但仍要守候。\n自身：修善即可平安。\n家宅：家宅平安，逐渐昌盛。\n开业：与朋友合资易有所成。\n迁居：选吉方即可。\n出行：往远方，有意外之喜。\n疾病：一切小病痛都能痊愈。\n六甲：顺产，生男孩。\n行人：音信将至。\n诉讼：双方可得和解。",
        anotherText: "占得鳌头百事成，逢迎到处不须疑；\n从兹修省能方便，福禄绵绵自可期。",
        interpretation: "在运势尚未通达的时候，当然是有志难伸，一旦鳌头独佔。跟红顶白、锦上添花的人会接踵而来，如果一下子利欲薰心，很容易把大好前程新自断送。这段时候最 好是自我签讨，保持稳健踏实的态度，才能够使到福禄绵绵不绝。"
    },
    2: {
        title: "古人潜龙变化",
        signText: "潜藏自有光明日，守耐无如待丙丁；\n龙虎相翻生定数，春风一转渐飞腾。",
        explanation: "古人以龙喻示人的际遇，潜龙即隐藏中的龙，为什麽要隐藏，因为时运不际，未得其位，所以潜藏以待，一旦风云际会，即可飞龙在天，利见大人了。",
        details: "谋望：暂仍未至时机，等待亦可。\n钱财：委托他人协助，财可有成。\n婚姻：双方仍在考虑中，再等待一段时日更好。\n自身：谨慎守己，可以无碍。\n家宅：安份守已则家宅平安。\n开业：初段宜守，应有小利。\n迁居：选吉方则可。\n出行：不宜远行，可在近処走动。\n疾病：病因未明，千万小心，慢慢调养，会痊愈。\n六甲：宜先调身，饮食品亦要注意。\n行人：现在未动，要问甚麽时候来，就要看丙丁日。\n诉讼：一时难以解决，需要等待。",
        anotherText: "贵人相逢更可期，庭前枯木凤来仪；\n好将短事从长事，休听旁人说是非。",
        interpretation: "换了一个新环境，一切都感到很陌生，周围的人也不认识，所以暂时应该低凋，少说多做，先静观其变，再决定行动。"
    },
    3: {
        title: "古人唐明王游月殿",
        signText: "明月当三五，天地自无私；\n一阳来已复，得意在秋时。",
        explanation: "此签有『无私奉献』之意。提醒当事人，不要计较一己之得失。",
        details: "谋望：不必强求，随遇而安。\n钱财：财如流水，不必执着。\n婚姻：有缘千里来相会，无缘对面不相逢。\n自身：修心养性，自然平安。\n家宅：家和万事兴。\n开业：时机未到，不宜急进。\n迁居：顺其自然。\n出行：平安顺利。\n疾病：自然痊愈。\n六甲：顺产。\n行人：平安归来。\n诉讼：和解为上。",
        anotherText: "月到天心人有望，牛郎巧合属天成；\n不须辗转求良偶，天喜从人命自荣。",
        interpretation: "当面临抉择的时候，应该考虑到整体的利益，不要只看到眼前的好处。有时候，牺牲小我，完成大我，反而能够得到更大的回报。"
    },
    4: {
        title: "古人唐三藏取经",
        signText: "正大有鬼神之助，吉祥成忠厚之报；\n不怕邪魔小崇，只看秋收冬藏。",
        explanation: "此签以唐三藏取经为典故，象征历尽艰辛后终得圆满。签文提示，只要秉持忠厚之心，自有鬼神相助，不怕邪魔干扰，最终会有好的结果。",
        details: "谋望：历尽艰辛后终能成功。\n钱财：忠厚之人必有好报。\n婚姻：历经考验的婚姻更稳固。\n自身：忠厚为本，自有天佑。\n家宅：平安吉祥，逐渐昌盛。\n开业：虽然初期困难，但最终会成功。\n迁居：选择合适的时机，一切顺利。\n出行：虽有波折，但能平安归来。\n疾病：耐心治疗，最终会康复。\n六甲：顺产，母子平安。\n行人：路途遥远，但能平安到达。\n诉讼：正义终将获胜。",
        anotherText: "历尽艰辛志更坚，忠诚正直感神仙；\n邪魔辟易成功日，福寿康宁乐无边。",
        interpretation: "此签告诉我们，只要我们有坚定的信念和忠厚的品德，即使遇到困难和挑战，最终也会获得成功和幸福。"
    },
    5: {
        title: "古人亢龙得水",
        signText: "柔顺而静，坤之六爻皆吉；\n阴盛于阳，不怕亢龙之悔；\n若此消息，只待羊兔相宜。\n秋禾春麦应时收，勤种勤耕乃有期。",
        explanation: "此签以亢龙得水为典故，强调柔顺守静、勤勉谨慎的重要性。签文提示，在阴盛阳衰的情况下，只要保持柔顺和勤勉，就不会有亢龙之悔，最终会有好的结果。",
        details: "谋望：宜柔顺守静，不宜急躁。\n钱财：勤奋努力，自然有收获。\n婚姻：和睦相处，幸福美满。\n自身：柔顺守静，平安吉祥。\n家宅：安宁和谐，逐渐昌盛。\n开业：稳扎稳打，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜短途旅行。\n疾病：耐心调养，自然康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：和解为上，避免冲突。",
        anotherText: "柔顺守静是真道，勤勉谨慎得福报；\n羊兔之时运来临，荣华富贵自然到。",
        interpretation: "此签告诉我们，在面对困难和挑战时，应该保持柔顺和勤勉，不要过于急躁和冲动，这样才能获得好的结果。"
    },
    6: {
        title: "古人刘备取西川",
        signText: "如争如战，长子克家，从吉而贞。\n当知天从人愿，不必二二三三。",
        explanation: "此签以刘备取西川为典故，象征从困境中崛起，最终获得成功。签文提示，只要坚持正道，上天会顺从人的意愿，不必过于担心和犹豫。",
        details: "谋望：只要坚持正道，最终会成功。\n钱财：有贵人相助，财运亨通。\n婚姻：美满幸福，百年好合。\n自身：坚持正道，平安吉祥。\n家宅：和睦相处，逐渐昌盛。\n开业：有贵人相助，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜长途旅行。\n疾病：及时治疗，很快康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：正义终将获胜。",
        anotherText: "如争如战终获胜，长子克家得康宁；\n天从人愿成功日，荣华富贵自然生。",
        interpretation: "此签告诉我们，只要我们坚持正道，努力奋斗，最终会获得成功和幸福。"
    },
    7: {
        title: "古人吕洞宾炼丹",
        signText: "临物易与，天地人合；\n一到春风，百祥骈集。",
        explanation: "此签以吕洞宾炼丹为典故，象征天地人合，万事顺利。签文提示，只要时机成熟，就会有百祥骈集，一切顺利。",
        details: "谋望：时机成熟，自然成功。\n钱财：财运亨通，财源广进。\n婚姻：美满幸福，百年好合。\n自身：身体健康，平安吉祥。\n家宅：和睦相处，逐渐昌盛。\n开业：时机成熟，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜任何旅行。\n疾病：自然康复，不必担心。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：和解为上，避免冲突。",
        anotherText: "天地人合万事兴，春风得意百祥生；\n时机成熟成功日，荣华富贵自然临。",
        interpretation: "此签告诉我们，只要我们能够与天地人和谐相处，时机成熟时就会获得成功和幸福。"
    },
    8: {
        title: "古人平贵别窑",
        signText: "一锄掘地要求泉，努力求之得最先；\n无意俄然遇知己，相逢携手上青天。",
        explanation: "此签以平贵别窑为典故，象征先苦后甜，最终获得成功。签文提示，只要努力追求，就会得到最先的收获，而且会在无意中遇到知己，一起携手走向成功。",
        details: "谋望：努力追求，最终成功。\n钱财：努力工作，自然有收获。\n婚姻：先苦后甜，幸福美满。\n自身：努力奋斗，平安吉祥。\n家宅：先苦后甜，逐渐昌盛。\n开业：努力经营，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜长途旅行。\n疾病：耐心治疗，最终康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：正义终将获胜。",
        anotherText: "一锄掘地得甘泉，努力求之在最先；\n无意之中遇知己，携手同上九重天。",
        interpretation: "此签告诉我们，只要我们努力追求自己的目标，就会得到好的结果，而且会在无意中遇到贵人，一起走向成功。"
    },
    9: {
        title: "古人岳飞出世",
        signText: "远涉波涛一叶舟，如今始得过滩头。\n年来心事才成就，屈指从前多可忧。",
        explanation: "此签以岳飞出世为典故，象征先凶后吉，贵人相助。签文提示，虽然过去经历了许多困难和忧虑，但现在终于渡过了难关，多年的心愿终于实现了。",
        details: "谋望：先凶后吉，最终成功。\n钱财：历经困难，最终富裕。\n婚姻：先苦后甜，幸福美满。\n自身：历经磨难，终得平安。\n家宅：先苦后甜，逐渐昌盛。\n开业：初期困难，最终成功。\n迁居：选择合适的时机，一切顺利。\n出行：虽有波折，最终平安。\n疾病：耐心治疗，最终康复。\n六甲：顺产，母子平安。\n行人：路途遥远，最终到达。\n诉讼：正义终将获胜。",
        anotherText: "远涉波涛渡险滩，如今方得过难关；\n多年心愿终成就，屈指从前尽欢颜。",
        interpretation: "此签告诉我们，虽然我们过去经历了许多困难和忧虑，但只要我们坚持下去，最终会渡过难关，实现自己的心愿。"
    },
    10: {
        title: "古人古城相会",
        signText: "问仙须要酬天地，百事如心定有利；\n果能春秋两处好，龙虎呈祥，风云际会。\n云散月当头，牛前马后逢。\n张弓方抵御，一箭定全功。",
        explanation: "此签以古城相会为典故，象征通过诚心、勤俭和坚持突破困境，最终迎来成功。签文提示，只要我们诚心诚意，百事如意，春秋两季都会有好的结果，龙虎呈祥，风云际会。",
        details: "谋望：诚心诚意，百事如意。\n钱财：勤俭持家，自然富裕。\n婚姻：诚心相待，幸福美满。\n自身：诚心修善，平安吉祥。\n家宅：诚心相待，和睦相处。\n开业：诚心经营，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜任何旅行。\n疾病：诚心祈祷，最终康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：和解为上，避免冲突。",
        anotherText: "诚心诚意酬天地，百事如意定有利；\n春秋两季呈祥瑞，龙虎风云会一时。",
        interpretation: "此签告诉我们，只要我们有诚心、勤俭和坚持，就能够突破困境，最终迎来成功和幸福。"
    },
    11: {
        title: "古人赤壁之战",
        signText: "一个兔儿一个鸡，等全无不合人思；\n有朝遇着东风力，且看天公造化机。",
        explanation: "此签以赤壁之战为典故，强调合作与时机的重要性。签文提示，兔和鸡本来是不合的，但只要遇到东风力，就会看到天公的造化机，也就是合作与时机的重要性。",
        details: "谋望：合作与时机并重。\n钱财：合作经营，财运亨通。\n婚姻：互补的婚姻更和谐。\n自身：合作精神，平安吉祥。\n家宅：和睦相处，逐渐昌盛。\n开业：合作经营，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜春季旅行。\n疾病：及时治疗，最终康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：和解为上，避免冲突。",
        anotherText: "兔鸡本来不合群，遇着东风便同心；\n天公造化有玄机，合作时机值万金。",
        interpretation: "此签告诉我们，合作与时机是成功的关键，只要我们能够抓住时机，与他人合作，就能够获得成功和幸福。"
    },
    12: {
        title: "古人刘阮遇仙",
        signText: "十日坐，一日行；\n矶头有水，不碍利前程。\n问到如何境，刘阮天台不误人。",
        explanation: "此签以刘阮遇仙为典故，强调远行、合作与坚持的重要性。签文提示，我们需要有足够的耐心（十日坐），然后行动（一日行），虽然路途中有困难（矶头有水），但不碍前程，最终会像刘阮在天台遇到神仙一样，得到好的结果。",
        details: "谋望：耐心等待，时机成熟再行动。\n钱财：长途旅行，可能有收获。\n婚姻：有缘千里来相会。\n自身：耐心修行，自有天佑。\n家宅：平安吉祥，逐渐昌盛。\n开业：长途贸易，可能成功。\n迁居：适合搬迁到远方。\n出行：平安顺利，宜长途旅行。\n疾病：耐心治疗，最终康复。\n六甲：顺产，母子平安。\n行人：路途遥远，最终到达。\n诉讼：耐心等待，最终获胜。",
        anotherText: "十日静坐一日行，矶头有水不碍程；\n刘阮天台遇仙境，耐心坚持得福荫。",
        interpretation: "此签告诉我们，只要我们有足够的耐心，坚持自己的信念，最终会得到好的结果。"
    },
    13: {
        title: "古人宝剑出匣",
        signText: "有剑开神路，何妖敢犯神；\n君子道长，小人道消。\n月明终有望，河上任逍遥。",
        explanation: "此签以宝剑出匣为典故，强调展现才能、把握时机的必要性。签文提示，宝剑出鞘，能够开辟神路，任何妖魔鬼怪都不敢侵犯，君子道长，小人道消，最终会看到明月，在河上逍遥自在。",
        details: "谋望：展现才能，把握时机。\n钱财：正财偏财，都有收获。\n婚姻：美满幸福，百年好合。\n自身：展现才能，平安吉祥。\n家宅：平安吉祥，逐渐昌盛。\n开业：展现才能，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜任何旅行。\n疾病：及时治疗，最终康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：正义终将获胜。",
        anotherText: "宝剑出匣开神路，妖魔鬼怪皆让路；\n君子道长小人消，明月河中任逍遥。",
        interpretation: "此签告诉我们，只要我们能够展现自己的才能，把握时机，就能够获得成功和幸福。"
    },
    14: {
        title: "古人牛皋战兀术",
        signText: "一虎出山，一龙飞天。\n天缘人缘，上国收贤。\n生育之美，造化两全。\n鹏鄂当秋势转雄，乘风分翼到蟾宫。",
        explanation: "此签以牛皋战兀术为典故，象征机遇与挑战并存。签文提示，一虎出山，一龙飞天，天缘人缘，上国收贤，生育之美，造化两全，秋天的时候，鹏鄂的势力会转雄，乘风分翼到蟾宫。",
        details: "谋望：机遇与挑战并存。\n钱财：有贵人相助，财运亨通。\n婚姻：美满幸福，百年好合。\n自身：勇敢面对，平安吉祥。\n家宅：平安吉祥，逐渐昌盛。\n开业：有贵人相助，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜秋季旅行。\n疾病：及时治疗，最终康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：勇敢面对，最终获胜。",
        anotherText: "一虎出山一龙飞，天缘人缘喜相催；\n上国收贤传美名，生育造化两全辉。",
        interpretation: "此签告诉我们，机遇与挑战并存，只要我们勇敢面对，就能够获得成功和幸福。"
    },
    15: {
        title: "古人仙姬相会",
        signText: "月到天心人有望，牛郎巧合属天成；\n不须辗转求良偶，天喜从人命自荣。",
        explanation: "此签以仙姬相会为典故，象征缘分天成，时机成熟。签文提示，月到天心，人有望，牛郎巧合属天成，不须辗转求良偶，天喜从人命自荣。",
        details: "谋望：时机成熟，自然成功。\n钱财：时机成熟，自然富裕。\n婚姻：缘分天成，幸福美满。\n自身：修善积德，平安吉祥。\n家宅：平安吉祥，逐渐昌盛。\n开业：时机成熟，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜秋季旅行。\n疾病：自然康复，不必担心。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：和解为上，避免冲突。",
        anotherText: "月到天心人有望，牛郎织女喜相会；\n天作之合不须求，幸福美满自荣贵。",
        interpretation: "此签告诉我们，缘分是天定的，只要时机成熟，就会自然到来，我们不必过分追求，幸福和荣耀会自然降临。"
    },
    16: {
        title: "古人王勃中状元",
        signText: "时来风送滕王阁，运至何忧跨仙鹤。\n甲乙两运天云梯，也知桂香味早卓。\n事遂勿忧煎，春风喜自然。\n更垂三尺钓，得意获鳞鲜。",
        explanation: "此签以王勃中状元为典故，象征时来运转，春风得意。签文提示，时来风送滕王阁，运至何忧跨仙鹤，甲乙两运天云梯，也知桂香味早卓，事情顺利，不必忧虑，春风得意，自然会有好的结果，就像垂钓一样，会得意地获得鲜美的鱼。",
        details: "谋望：时来运转，自然成功。\n钱财：财运亨通，财源广进。\n婚姻：美满幸福，百年好合。\n自身：时来运转，平安吉祥。\n家宅：平安吉祥，逐渐昌盛。\n开业：时机成熟，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜春季旅行。\n疾病：自然康复，不必担心。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：正义终将获胜。",
        anotherText: "时来风送滕王阁，运至仙鹤自然来；\n甲乙两运登云梯，桂香早卓显奇才。",
        interpretation: "此签告诉我们，时机来了，自然会有好的结果，我们不必过分忧虑，只要我们有才能，就会像王勃一样，获得成功和荣耀。"
    },
    17: {
        title: "古人张飞喝断长板桥",
        signText: "一旦雷声震，四方皆有庆；\n转吉又增祥，壬癸子午定。\n开创匪难，守成维艰，若不善守，必覆以亡。",
        explanation: "此签以张飞喝断长板桥为典故，强调开创易、守成难的道理。签文提示，一旦雷声震，四方皆有庆，转吉又增祥，壬癸子午定，开创事业并不困难，但守成却很艰难，如果不善于守成，必然会失败。",
        details: "谋望：开创容易，守成困难。\n钱财：创业容易，守财困难。\n婚姻：结婚容易，维持困难。\n自身：开创事业，谨慎守成。\n家宅：创业容易，守家困难。\n开业：开创容易，守业困难。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜任何旅行。\n疾病：及时治疗，最终康复。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：正义终将获胜。",
        anotherText: "一声雷震惊四方，转吉增祥喜洋洋；\n开创容易守成难，善守才能久安康。",
        interpretation: "此签告诉我们，开创事业并不困难，但守成却很艰难，我们需要谨慎守成，才能长久地保持成功和幸福。"
    },
    18: {
        title: "古人曹国舅为仙",
        signText: "金乌西坠兔东升，日夜循环古至今；\n僧道得之无不利，工商农士各开心。\n西方佛国在眼前，世人念佛要心坚；\n一朝功到西天去，极乐世界乐无边。",
        explanation: "此签以曹国舅为仙为典故，强调顺应自然，心坚志定的重要性。签文提示，金乌西坠兔东升，日夜循环古至今，僧道得之无不利，工商农士各开心，西方佛国在眼前，世人念佛要心坚，一朝功到西天去，极乐世界乐无边。",
        details: "谋望：顺应自然，自然成功。\n钱财：各行各业，都有收获。\n婚姻：顺应自然，幸福美满。\n自身：心坚志定，平安吉祥。\n家宅：平安吉祥，逐渐昌盛。\n开业：顺应自然，必有成功。\n迁居：选择合适的时机，一切顺利。\n出行：平安顺利，宜任何旅行。\n疾病：自然康复，不必担心。\n六甲：顺产，母子平安。\n行人：按时归来，平安无事。\n诉讼：和解为上，避免冲突。",
        anotherText: "金乌西坠兔东升，自然循环古至今；\n心坚志定功到日，极乐世界任君行。",
        interpretation: "此签告诉我们，顺应自然，心坚志定是成功的关键，只要我们能够做到这一点，就能够获得成功和幸福。"
    },
    19: {
        title: "古人崔梦熊得第",
        signText: "欲求胜事可非常，争奈亲姻日暂忙；\n到头必竟成鹿箭，贵人指引贵人乡。",
        explanation: "此签以崔梦熊得第为典故，象征先难后易，贵人相助。签文提示，我们想要追求非常的胜事，无奈亲戚朋友暂时很忙，帮不上忙，但最终会像鹿箭一样，得到贵人的指引，到达贵人乡。",
        details: "谋望：先难后易，贵人相助。\n钱财：先苦后甜，自然富裕。\n婚姻：先有阻碍，后有贵人相助。\n自身：先有困难，后得平安。\n家宅：先有困难，后得昌盛。\n开业：先有困难，后得成功。\n迁居：先有困难，后得顺利。\n出行：先有波折，后得平安。\n疾病：先有痛苦，后得康复。\n六甲：先有担忧，后得平安。\n行人：先有延迟，后得到达。\n诉讼：先有困难，后得胜诉。",
        anotherText: "欲求胜事非寻常，亲戚朋友暂相忘；\n鹿箭之期终有日，贵人指引到他乡。",
        interpretation: "此签告诉我们，虽然我们在追求成功的道路上会遇到困难和阻碍，但最终会得到贵人的帮助，获得成功。"
    },
    20: {
        title: "古人王道人炼丹",
        signText: "当春久雨喜开晴，玉兔金乌渐渐明；\n旧事消散新事遂，看看一跳过龙门。",
        explanation: "此签以王道人炼丹为典故，象征雨过天晴，旧事消散，新事顺遂。签文提示，春天久雨之后喜开晴，玉兔金乌渐渐明，旧事消散新事遂，看看一跳过龙门。",
        details: "谋望：雨过天晴，自然成功。\n钱财：旧事消散，财运亨通。\n婚姻：旧事消散，幸福美满。\n自身：雨过天晴，平安吉祥。\n家宅：旧事消散，逐渐昌盛。\n开业：雨过天晴，必有成功。\n迁居：雨过天晴，一切顺利。\n出行：雨过天晴，宜任何旅行。\n疾病：雨过天晴，最终康复。\n六甲：雨过天晴，母子平安。\n行人：雨过天晴，按时归来。\n诉讼：雨过天晴，最终胜诉。",
        anotherText: "久雨初晴喜洋洋，玉兔金乌放光芒；\n旧事消散新事遂，一跃龙门入朝堂。",
        interpretation: "此签告诉我们，困难和阻碍就像久雨一样，最终会过去，晴天会到来，我们的旧烦恼会消散，新的事情会顺遂，我们会像鲤鱼跳龙门一样，获得成功和荣耀。"
    }
};

// 计算实际可用的签文数量
const availableSignCount = Object.keys(signData).length;
// 生成可用签号的数组
const availableSignNumbers = Object.keys(signData).map(Number).sort((a, b) => a - b);

// 摇签按钮点击事件
shakeBtn.addEventListener('click', async () => {
    // 禁用摇签按钮，显示加载状态
    shakeBtn.disabled = true;
    shakeBtn.textContent = '摇签中...';
    signResult.textContent = '正在摇签...';
    
    // 隐藏解释
    interpretation.style.display = 'none';
    interpretation.innerHTML = '';
    interpretBtn.disabled = true;
    
    // 模拟摇签过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 生成随机签号（从1-100中随机选择，确保每个签号有平等的出现概率）
    let randomSignNumber;
    do {
        randomSignNumber = Math.floor(Math.random() * 100) + 1;
    } while (!signData[randomSignNumber]);
    currentSignNumber = randomSignNumber;
    
    try {
        // 获取签文数据
        currentSignData = signData[currentSignNumber];
        
        // 显示签文
        signResult.innerHTML = `第${currentSignNumber}签：${currentSignData.title}\n\n${currentSignData.signText}`;
        
        // 启用解签按钮
        interpretBtn.disabled = false;
        
        // 增加使用次数
        incrementUsage();
        
    } catch (error) {
        console.error('摇签失败：', error);
        signResult.textContent = '摇签失败，请重试';
    } finally {
        // 恢复摇签按钮
        shakeBtn.disabled = false;
        shakeBtn.textContent = '摇签';
    }
});

// 解签按钮点击事件
interpretBtn.addEventListener('click', () => {
    if (currentSignData) {
        // 显示解释
        interpretation.style.display = 'block';
        interpretation.innerHTML = `
            <h3>解签</h3>
            <p><strong>签文：</strong>${currentSignData.signText.replace(/\n/g, '<br>')}</p>
            <p><strong>解曰：</strong>${currentSignData.explanation.replace(/\n/g, '<br>')}</p>
            <p><strong>详解：</strong>${currentSignData.details.replace(/\n/g, '<br>')}</p>
            ${currentSignData.anotherText ? `<p><strong>又曰：</strong>${currentSignData.anotherText.replace(/\n/g, '<br>')}</p>` : ''}
            ${currentSignData.interpretation ? `<p><strong>释义：</strong>${currentSignData.interpretation.replace(/\n/g, '<br>')}</p>` : ''}
        `;
    }
});



// 初始化页面
function init() {
    signResult.textContent = "诚心默念所问之事";
    signResult.style.color = "#8b4513";
    signResult.style.fontSize = "1.1rem";
    signResult.style.fontStyle = "italic";
    signResult.style.textShadow = "1px 1px 1px rgba(0, 0, 0, 0.1)";
    
    // 加载统计数据
    loadStats();
}
init();