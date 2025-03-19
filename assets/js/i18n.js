// 国际化资源文件
const i18n = {
    'zh-CN': {
        // 页面标题和描述
        title: '屏幕常亮控制',
        description: '保持您的设备屏幕常亮，防止自动锁屏',
        keywords: '屏幕常亮,防止锁屏,保持屏幕亮起,NoSleep,Wake Lock',
        
        // 头部区域
        header: {
            title: '屏幕常亮控制',
            subtitle: '保持您的设备屏幕常亮'
        },
        
        // 控制区域
        control: {
            statusOff: '点击按钮开启屏幕常亮',
            statusOn: '屏幕常亮已开启',
            currentTime: '当前时间: '
        },
        
        // 定时区域
        timer: {
            title: '设置常亮时长',
            min5: '5分钟',
            min15: '15分钟',
            min30: '30分钟',
            hour1: '1小时',
            forever: '一直常亮',
            custom: '自定义分钟',
            setButton: '设置',
            noTimer: '未设置定时',
            stayOn: '屏幕将保持常亮状态',
            turnOffIn: '屏幕常亮将在 {time} 后自动关闭',
            hour: '小时',
            minute: '分钟',
            hourMinute: '{hours} 小时 {minutes} 分钟'
        },
        
        // 信息区域
        info: {
            aboutTitle: '关于此工具',
            aboutContent: '此工具使用NoSleep.js库来防止您的设备屏幕自动关闭。适用于阅读、观看视频或需要屏幕持续显示的场景。',
            noticeTitle: '注意事项',
            noticeContent: '使用屏幕常亮功能会增加电池消耗。在移动设备上，建议在连接电源时使用此功能。'
        },
        
        // 底部区域
        footer: {
            copyright: ' © 2025 屏幕常亮控制 | 基于 ',
            basedOn: 'NoSleep.js'
        },
        
        // 提示消息
        toast: {
            enableFirst: '请先开启屏幕常亮功能，再设置常亮时长',
            invalidTime: '请输入1-1440之间的有效分钟数',
            setForever: '已设置为持续常亮模式',
            setMinutes: '已设置{minutes}分钟常亮时间',
            enableFailed: '启用屏幕常亮失败，请确保您的浏览器支持此功能，并允许相关权限。'
        },
        
        // 语言切换
        language: {
            switchTo: 'Switch to English'
        }
    },
    'en-US': {
        // Page title and description
        title: 'Screen Wake Lock Control',
        description: 'Keep your device screen on, prevent auto-locking',
        keywords: 'screen wake lock,prevent screen lock,keep screen on,NoSleep,Wake Lock',
        
        // Header area
        header: {
            title: 'Screen Wake Lock Control',
            subtitle: 'Keep your device screen on'
        },
        
        // Control area
        control: {
            statusOff: 'Click button to enable wake lock',
            statusOn: 'Wake lock enabled',
            currentTime: 'Current time: '
        },
        
        // Timer area
        timer: {
            title: 'Set Duration',
            min5: '5 minutes',
            min15: '15 minutes',
            min30: '30 minutes',
            hour1: '1 hour',
            forever: 'Always on',
            custom: 'Custom minutes',
            setButton: 'Set',
            noTimer: 'No timer set',
            stayOn: 'Screen will stay on',
            turnOffIn: 'Screen will turn off in {time}',
            hour: 'hour',
            minute: 'minutes',
            hourMinute: '{hours} hours {minutes} minutes'
        },
        
        // Info area
        info: {
            aboutTitle: 'About This Tool',
            aboutContent: 'This tool uses the NoSleep.js library to prevent your device screen from turning off automatically. Ideal for reading, watching videos, or when you need the screen to stay on.',
            noticeTitle: 'Important Notice',
            noticeContent: 'Using the wake lock feature increases battery consumption. On mobile devices, it is recommended to use this feature when connected to power.'
        },
        
        // Footer area
        footer: {
            copyright: ' © 2025 Screen Wake Lock Control | Based on ',
            basedOn: 'NoSleep.js'
        },
        
        // Toast messages
        toast: {
            enableFirst: 'Please enable wake lock first, then set the duration',
            invalidTime: 'Please enter a valid number between 1-1440 minutes',
            setForever: 'Set to always-on mode',
            setMinutes: 'Set to stay on for {minutes} minutes',
            enableFailed: 'Failed to enable wake lock. Please ensure your browser supports this feature and allows the required permissions.'
        },
        
        // Language switch
        language: {
            switchTo: '切换到中文'
        }
    }
};

// 获取当前语言
function getCurrentLanguage() {
    // 从localStorage中获取用户设置的语言，如果没有则使用浏览器语言
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) {
        return savedLang;
    }
    
    // 获取浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    
    // 简化为我们支持的语言
    if (browserLang.startsWith('zh')) {
        return 'zh-CN';
    } else {
        return 'en-US'; // 默认英文
    }
}

// 设置语言
function setLanguage(lang) {
    localStorage.setItem('preferred-language', lang);
    return lang;
}

// 获取翻译文本
function getText(key, params = {}) {
    const lang = getCurrentLanguage();
    const keys = key.split('.');
    
    // 递归获取嵌套对象的值
    let value = i18n[lang];
    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            console.warn(`Translation key not found: ${key}`);
            return key; // 返回键名作为后备
        }
    }
    
    // 如果是字符串且包含参数占位符，则替换参数
    if (typeof value === 'string') {
        return value.replace(/{([^}]+)}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }
    
    return value;
}

// 切换语言
function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLanguage(newLang);
    location.reload(); // 重新加载页面应用新语言
}

// 导出国际化函数
window.i18n = {
    getText,
    getCurrentLanguage,
    setLanguage,
    toggleLanguage
};