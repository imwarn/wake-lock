document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const powerButton = document.getElementById('powerButton');
    const statusText = document.getElementById('statusText');
    const timerOptions = document.querySelectorAll('.timer-option:not(.custom)');
    const customTimeInput = document.getElementById('customTime');
    const setCustomTimeButton = document.getElementById('setCustomTime');
    const timerStatus = document.getElementById('timerStatus');
    const progressFill = document.querySelector('.progress-fill');
    const currentTimeElement = document.getElementById('currentTime');
    const languageText = document.getElementById('languageText');
    
    // 初始化国际化
    initializeI18n();
    
    // 添加favicon元素到head中
    const favicon = document.querySelector("link[rel='icon']") || document.createElement('link');
    if (!document.querySelector("link[rel='icon']")) {
        favicon.rel = 'icon';
        favicon.href = './favicon2.ico'; // 默认使用favicon2.ico（屏幕常亮关闭状态）
        document.head.appendChild(favicon);
    }
    
    // 语言切换按钮点击事件
    document.getElementById('languageToggle').addEventListener('click', function() {
        window.i18n.toggleLanguage();
    });
    // 初始化NoSleep实例
    const noSleep = new NoSleep();
    
    // 从localStorage读取保存的设置
    const savedWakeLockState = localStorage.getItem('wakeLockEnabled');
    const savedTimerMinutes = localStorage.getItem('wakeLockTimerMinutes');
    
    // 创建Toast提示元素
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // 显示Toast提示的函数
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = document.createElement('i');
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
        } else if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = 'fas fa-info-circle';
        }
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(messageSpan);
        toastContainer.appendChild(toast);
        
        // 添加显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 3秒后自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            
            // 动画结束后移除元素
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // 状态变量
    let isActive = false;
    let timerInterval = null;
    let timerEndTime = null;
    let selectedMinutes = savedTimerMinutes ? parseInt(savedTimerMinutes) : 0;
    
    // 更新当前时间显示
    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeElement.textContent = `${window.i18n.getText('control.currentTime')}${hours}:${minutes}:${seconds}`;
    }
    
    // 初始化时更新一次时间
    updateCurrentTime();
    
    // 设置定时器每秒更新时间
    setInterval(updateCurrentTime, 1000);
    
    // 如果之前有保存的状态，自动恢复
    if (savedWakeLockState === 'true') {
        // 延迟一点执行，确保页面已完全加载
        setTimeout(() => {
            toggleWakeLock();
            
            // 如果有保存的定时设置，也恢复它
            if (savedTimerMinutes && parseInt(savedTimerMinutes) !== -1) {
                // 找到对应的预设选项并激活
                const minutes = parseInt(savedTimerMinutes);
                let found = false;
                
                timerOptions.forEach(option => {
                    const optionMinutes = parseInt(option.getAttribute('data-minutes'));
                    if (optionMinutes === minutes) {
                        option.classList.add('active');
                        found = true;
                    }
                });
                
                // 如果没有找到匹配的预设选项，可能是自定义时间
                if (!found && minutes > 0) {
                    customTimeInput.value = minutes;
                }
            }
        }, 500);
    }
    
    // 电源按钮点击事件
    powerButton.addEventListener('click', function() {
        toggleWakeLock();
    });
    
    // 预设时间选项点击事件
    timerOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (!isActive) {
                // 添加未开启屏幕常亮时的提示
                showToast(window.i18n.getText('toast.enableFirst'), 'error');
                return;
            }
            
            // 移除其他选项的active类
            timerOptions.forEach(opt => opt.classList.remove('active'));
            
            // 添加当前选项的active类
            this.classList.add('active');
            
            // 获取分钟数
            selectedMinutes = parseInt(this.getAttribute('data-minutes'));
            
            // 设置定时器
            setTimer(selectedMinutes);
        });
    });
    
    // 自定义时间设置按钮点击事件
    setCustomTimeButton.addEventListener('click', function() {
        if (!isActive) {
            // 添加未开启屏幕常亮时的提示
            showToast(window.i18n.getText('toast.enableFirst'), 'error');
            return;
        }
        
        const customMinutes = parseInt(customTimeInput.value);
        
        if (isNaN(customMinutes) || customMinutes < 1 || customMinutes > 1440) {
            showToast(window.i18n.getText('toast.invalidTime'), 'error');
            return;
        }
        
        // 移除其他选项的active类
        timerOptions.forEach(opt => opt.classList.remove('active'));
        
        // 设置定时器
        selectedMinutes = customMinutes;
        setTimer(selectedMinutes);
    });
    
    // 切换favicon图标
    function toggleFavicon(isWakeLockActive) {
        const favicon = document.querySelector("link[rel='icon']");
        if (favicon) {
            // 根据屏幕常亮状态切换图标
            favicon.href = isWakeLockActive ? './favicon.ico' : './favicon2.ico';
        }
    }
    
    // 切换屏幕常亮状态
    function toggleWakeLock() {
        if (!isActive) {
            // 启用屏幕常亮
            noSleep.enable().then(() => {
                isActive = true;
                powerButton.classList.add('active');
                statusText.textContent = window.i18n.getText('control.statusOn');
                statusText.style.color = '#00f2fe';
                setTimer(selectedMinutes || -1);
                
                // 切换favicon为常亮状态图标
                toggleFavicon(true);
                
                // 保存状态到localStorage
                localStorage.setItem('wakeLockEnabled', 'true');
            }).catch(err => {
                console.error('启用屏幕常亮失败:', err);
                showToast(window.i18n.getText('toast.enableFailed'), 'error');
            });
        } else {
            // 禁用屏幕常亮
            noSleep.disable();
            isActive = false;
            powerButton.classList.remove('active');
            statusText.textContent = window.i18n.getText('control.statusOff');
            statusText.style.color = '';
            
            // 切换favicon为非常亮状态图标
            toggleFavicon(false);
            
            // 清除定时器
            clearTimer();
            
            // 移除所有选项的active类
            timerOptions.forEach(opt => opt.classList.remove('active'));
            
            // 清除localStorage中保存的状态
            localStorage.removeItem('wakeLockEnabled');
            localStorage.removeItem('wakeLockTimerMinutes');
        }
    }
    
    // 设置定时器
    function setTimer(minutes) {
        // 清除之前的定时器
        clearTimer();
        
        // 保存定时设置到localStorage
        localStorage.setItem('wakeLockTimerMinutes', minutes.toString());
        
        // 处理一直常亮选项
        if (minutes === -1) {
            timerStatus.textContent = window.i18n.getText('timer.stayOn');
            progressFill.style.width = '100%';
            showToast(window.i18n.getText('toast.setForever'), 'success');
            return;
        }
        
        // 显示成功设置的提示
        showToast(window.i18n.getText('toast.setMinutes', {minutes: minutes}), 'success');
        
        // 计算结束时间
        const duration = minutes * 60 * 1000; // 转换为毫秒
        timerEndTime = Date.now() + duration;
        
        // 更新定时状态文本
        updateTimerStatus(minutes);
        
        // 设置进度条初始状态
        progressFill.style.width = '100%';
        
        // 创建新的定时器
        timerInterval = setInterval(function() {
            // 计算剩余时间
            const now = Date.now();
            const timeLeft = timerEndTime - now;
            
            if (timeLeft <= 0) {
                // 定时结束，关闭屏幕常亮
                // 清除localStorage中保存的状态
                localStorage.removeItem('wakeLockEnabled');
                localStorage.removeItem('wakeLockTimerMinutes');
                toggleWakeLock();
                return;
            }
            
            // 更新进度条
            const progressPercentage = (timeLeft / duration) * 100;
            progressFill.style.width = progressPercentage + '%';
            
            // 更新状态文本
            const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
            updateTimerStatus(minutesLeft);
        }, 1000);
    }
    
    // 清除定时器
    function clearTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        timerEndTime = null;
        timerStatus.textContent = window.i18n.getText('timer.noTimer');
        progressFill.style.width = '0';
    }
    
    // 更新定时状态文本
    function updateTimerStatus(minutes) {
        if (minutes === -1) {
            timerStatus.textContent = window.i18n.getText('timer.stayOn');
            return;
        }

        // 更新剩余时长到localStorage
        localStorage.setItem('wakeLockTimerMinutes', minutes.toString());
        
        let timeText;
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins > 0) {
                timeText = window.i18n.getText('timer.hourMinute', {hours: hours, minutes: mins});
            } else {
                timeText = `${hours} ${window.i18n.getText('timer.hour')}`;
            }
        } else {
            timeText = `${minutes} ${window.i18n.getText('timer.minute')}`;
        }
        
        timerStatus.textContent = window.i18n.getText('timer.turnOffIn', {time: timeText});
    }
    
    // 初始化国际化
    function initializeI18n() {
        // 设置页面标题和元数据
        document.title = window.i18n.getText('title');
        document.querySelector('meta[name="description"]').setAttribute('content', window.i18n.getText('description'));
        document.querySelector('meta[name="keywords"]').setAttribute('content', window.i18n.getText('keywords'));
        document.getElementById('htmlRoot').setAttribute('lang', window.i18n.getCurrentLanguage());
        
        // 设置语言切换按钮文本
        languageText.textContent = window.i18n.getText('language.switchTo');
        
        // 设置页面头部
        document.getElementById('pageTitle').textContent = window.i18n.getText('header.title');
        document.getElementById('pageSubtitle').textContent = window.i18n.getText('header.subtitle');
        
        // 设置控制区域
        statusText.textContent = window.i18n.getText('control.statusOff');
        
        // 设置定时区域
        document.getElementById('timerTitle').textContent = window.i18n.getText('timer.title');
        document.getElementById('min5').textContent = window.i18n.getText('timer.min5');
        document.getElementById('min15').textContent = window.i18n.getText('timer.min15');
        document.getElementById('min30').textContent = window.i18n.getText('timer.min30');
        document.getElementById('hour1').textContent = window.i18n.getText('timer.hour1');
        document.getElementById('forever').textContent = window.i18n.getText('timer.forever');
        customTimeInput.placeholder = window.i18n.getText('timer.custom');
        setCustomTimeButton.textContent = window.i18n.getText('timer.setButton');
        timerStatus.textContent = window.i18n.getText('timer.noTimer');
        
        // 设置信息区域
        document.getElementById('aboutTitle').textContent = window.i18n.getText('info.aboutTitle');
        document.getElementById('aboutContent').textContent = window.i18n.getText('info.aboutContent');
        document.getElementById('noticeTitle').textContent = window.i18n.getText('info.noticeTitle');
        document.getElementById('noticeContent').textContent = window.i18n.getText('info.noticeContent');
        
        // 设置底部区域
        document.getElementById('copyright').textContent = window.i18n.getText('footer.copyright');
    }
});