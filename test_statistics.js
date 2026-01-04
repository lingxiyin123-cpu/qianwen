// 测试脚本：验证统计功能是否正常工作

// 模拟浏览器环境
const mockWindow = {
    localStorage: {
        data: {},
        getItem(key) {
            return this.data[key] || null;
        },
        setItem(key, value) {
            this.data[key] = value;
        }
    },
    navigator: {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        language: "zh-CN",
        platform: "Win32",
        cookieEnabled: true
    },
    screen: {
        width: 1920,
        height: 1080
    }
};

// 复制script.js中的统计相关函数
function generateBrowserFingerprint(window) {
    const fingerprint = [
        window.navigator.userAgent,
        window.navigator.language,
        window.navigator.platform,
        window.screen.width + 'x' + window.screen.height,
        new Date().getTimezoneOffset(),
        window.navigator.cookieEnabled
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

function createStats(window) {
    // 统计数据
    let stats = {
        totalUses: 0,
        userIds: new Set()
    };
    
    // 加载统计数据
    function loadStats() {
        const savedStats = window.localStorage.getItem('shakeSignStats');
        if (savedStats) {
            try {
                const parsedStats = JSON.parse(savedStats);
                stats.totalUses = parsedStats.totalUses || 0;
                stats.userIds = new Set(parsedStats.userIds || []);
            } catch (error) {
                console.error('加载统计数据失败:', error);
                stats = {
                    totalUses: 0,
                    userIds: new Set()
                };
            }
        }
    }
    
    // 保存统计数据
    function saveStats() {
        const statsToSave = {
            totalUses: stats.totalUses,
            userIds: Array.from(stats.userIds)
        };
        window.localStorage.setItem('shakeSignStats', JSON.stringify(statsToSave));
    }
    
    // 获取或生成用户ID
    function getOrCreateUserId() {
        let userId = window.localStorage.getItem('shakeSignUserId');
        if (!userId) {
            const fingerprint = generateBrowserFingerprint(window);
            userId = 'user_' + Date.now() + '_' + fingerprint + '_' + Math.floor(Math.random() * 1000);
            window.localStorage.setItem('shakeSignUserId', userId);
        }
        return userId;
    }
    
    // 增加使用次数
    function incrementUsage() {
        stats.totalUses++;
        const userId = getOrCreateUserId();
        if (!stats.userIds.has(userId)) {
            stats.userIds.add(userId);
        }
        saveStats();
    }
    
    // 获取统计数据
    function getStats() {
        return {
            totalUses: stats.totalUses,
            uniqueUsers: stats.userIds.size
        };
    }
    
    // 初始化
    loadStats();
    
    return {
        incrementUsage,
        getStats,
        reset: () => {
            window.localStorage.data = {};
            stats = { totalUses: 0, userIds: new Set() };
        }
    };
}

// 测试用例
function runTests() {
    console.log("=== 开始测试统计功能 ===");
    
    // 测试1：初始状态
    console.log("\n测试1：初始状态");
    // 创建新的window对象，确保localStorage方法正确
    const window1 = { ...mockWindow, localStorage: { data: {}, getItem: mockWindow.localStorage.getItem, setItem: mockWindow.localStorage.setItem } };
    const statsManager1 = createStats(window1);
    let stats = statsManager1.getStats();
    console.log(`初始使用次数: ${stats.totalUses} (预期: 0)`);
    console.log(`初始唯一用户: ${stats.uniqueUsers} (预期: 0)`);
    
    // 测试2：同一用户多次使用
    console.log("\n测试2：同一用户多次使用");
    statsManager1.incrementUsage();
    statsManager1.incrementUsage();
    statsManager1.incrementUsage();
    stats = statsManager1.getStats();
    console.log(`使用次数: ${stats.totalUses} (预期: 3)`);
    console.log(`唯一用户: ${stats.uniqueUsers} (预期: 1)`);
    
    // 测试3：不同用户使用
    console.log("\n测试3：不同用户使用");
    // 创建新的window对象并修改userAgent，使用全新的localStorage
    const window2 = { 
        ...mockWindow, 
        localStorage: { data: {}, getItem: mockWindow.localStorage.getItem, setItem: mockWindow.localStorage.setItem },
        navigator: { ...mockWindow.navigator, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15" }
    };
    // 复制统计数据但不复制用户ID
    window2.localStorage.data.shakeSignStats = window1.localStorage.data.shakeSignStats;
    const statsManager2 = createStats(window2);
    statsManager2.incrementUsage();
    stats = statsManager2.getStats();
    console.log(`使用次数: ${stats.totalUses} (预期: 4)`);
    console.log(`唯一用户: ${stats.uniqueUsers} (预期: 2)`);
    
    // 测试4：数据持久化
    console.log("\n测试4：数据持久化");
    const window3 = { 
        ...mockWindow, 
        localStorage: { data: JSON.parse(JSON.stringify(window2.localStorage.data)), getItem: mockWindow.localStorage.getItem, setItem: mockWindow.localStorage.setItem }
    };
    const statsManager3 = createStats(window3);
    stats = statsManager3.getStats();
    console.log(`持久化后使用次数: ${stats.totalUses} (预期: 4)`);
    console.log(`持久化后唯一用户: ${stats.uniqueUsers} (预期: 2)`);
    
    console.log("\n=== 测试完成 ===");
}

// 运行测试
runTests();
