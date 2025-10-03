// 游戏状态对象
let gameState = {
    wood: 0,
    gold: 0,
    chops: 0,
    totalWood: 0,
    totalGold: 0,
    chopEfficiency: 1,
    autoWoodRate: 0,
    hasAutoChopper: false,
    gameTime: 0,
    upgrades: {
        efficiency: 0,
        autoChopper: 0
    },
    // 背包物品
    inventory: {
        wood: 0,
        gold: 0,
        // 其他物品可以在这里添加
    },
    // 任务状态
    quests: {
        1: {
            name: '初次砍伐',
            description: '砍伐树木 5 次',
            current: 0,
            target: 5,
            reward: { wood: 20 },
            completed: false
        },
        2: {
            name: '木材收集者',
            description: '收集 100 木材',
            current: 0,
            target: 100,
            reward: { wood: 50, gold: 10 },
            completed: false
        },
        3: {
            name: '自动化',
            description: '购买自动砍伐机',
            current: 0,
            target: 1,
            reward: { gold: 20 },
            completed: false
        }
    },
    // 成就状态
    achievements: {
        1: {
            name: '树木杀手',
            description: '砍伐 100 次树木',
            target: 100,
            completed: false,
            icon: 'tree'
        },
        2: {
            name: '百万富翁',
            description: '收集 1000 金币',
            target: 1000,
            completed: false,
            icon: 'coins'
        },
        3: {
            name: '收藏家',
            description: '收集 1000 木材',
            target: 1000,
            completed: false,
            icon: 'archive'
        },
        4: {
            name: '自动化大师',
            description: '购买 5 个自动砍伐机',
            target: 5,
            completed: false,
            icon: 'cogs'
        }
    }
};

// DOM 元素引用
const treeElement = document.getElementById('tree');
const woodCountElement = document.getElementById('wood-count');
const goldCountElement = document.getElementById('gold-count');
const chopsCountElement = document.getElementById('chops-count');
const totalWoodElement = document.getElementById('total-wood');
const totalGoldElement = document.getElementById('total-gold');
const gameTimeElement = document.getElementById('game-time');
const chopEfficiencyElement = document.getElementById('chop-efficiency');
const autoRateElement = document.getElementById('auto-rate');
const woodItemElement = document.getElementById('wood-item');
const goldItemElement = document.getElementById('gold-item');

// 游戏初始化
function initGame() {
    // 加载保存的游戏进度
    loadGame();
    
    // 绑定点击事件
    treeElement.addEventListener('click', chopWood);
    
    // 启动自动砍伐计时器
    setInterval(autoChop, 1000);
    
    // 启动游戏时间计时器
    setInterval(updateGameTime, 1000);
    
    // 定期保存游戏进度
    setInterval(saveGame, 15000); // 每15秒保存一次
    
    // 更新游戏显示
    updateGameDisplay();
}

// 砍伐树木函数
function chopWood() {
    // 计算获得的木材数量
    const woodGained = gameState.chopEfficiency;
    
    // 更新游戏状态
    gameState.wood += woodGained;
    gameState.totalWood += woodGained;
    gameState.chops++;
    gameState.inventory.wood = gameState.wood;
    
    // 添加树木摇晃动画
    treeElement.classList.add('animate-shake');
    setTimeout(() => {
        treeElement.classList.remove('animate-shake');
    }, 500);
    
    // 显示木材获得动画
    showFloatText(`+${woodGained}`, 'text-green-600');
    
    // 检查任务进度
    checkQuestProgress();
    
    // 检查成就进度
    checkAchievementProgress();
    
    // 更新游戏显示
    updateGameDisplay();
}

// 自动砍伐函数
function autoChop() {
    if (gameState.hasAutoChopper && gameState.autoWoodRate > 0) {
        gameState.wood += gameState.autoWoodRate;
        gameState.totalWood += gameState.autoWoodRate;
        gameState.inventory.wood = gameState.wood;
        
        // 检查任务和成就
        checkQuestProgress();
        checkAchievementProgress();
        
        // 更新显示
        updateGameDisplay();
    }
}

// 升级砍伐效率
function upgradeEfficiency() {
    const upgradeCost = Math.floor(10 * Math.pow(1.5, gameState.upgrades.efficiency));
    
    if (gameState.wood >= upgradeCost) {
        // 扣除木材
        gameState.wood -= upgradeCost;
        gameState.inventory.wood = gameState.wood;
        
        // 升级效率
        gameState.upgrades.efficiency++;
        gameState.chopEfficiency = Math.floor(gameState.chopEfficiency * 1.5);
        
        // 显示升级成功动画
        showFloatText('升级成功!', 'text-primary', true);
        
        // 更新按钮文本
        updateUpgradeButtons();
        
        // 更新显示
        updateGameDisplay();
    } else {
        // 显示资源不足动画
        showFloatText('木材不足!', 'text-red-500', true);
    }
}

// 升级自动砍伐机
function upgradeAutoChop() {
    let upgradeCost = 50;
    if (gameState.hasAutoChopper) {
        upgradeCost = Math.floor(50 * Math.pow(1.8, gameState.upgrades.autoChopper));
    }
    
    if (gameState.wood >= upgradeCost) {
        // 扣除木材
        gameState.wood -= upgradeCost;
        gameState.inventory.wood = gameState.wood;
        
        // 升级自动砍伐机
        gameState.upgrades.autoChopper++;
        gameState.autoWoodRate++;
        gameState.hasAutoChopper = true;
        
        // 显示升级成功动画
        showFloatText('自动砍伐机已升级!', 'text-primary', true);
        
        // 检查任务
        if (gameState.quests[3].current < gameState.quests[3].target) {
            gameState.quests[3].current++;
            checkQuestCompletion(3);
        }
        
        // 更新按钮文本
        updateUpgradeButtons();
        
        // 更新显示
        updateGameDisplay();
    } else {
        // 显示资源不足动画
        showFloatText('木材不足!', 'text-red-500', true);
    }
}

// 更新游戏时间
function updateGameTime() {
    gameState.gameTime++;
    const minutes = Math.floor(gameState.gameTime / 60).toString().padStart(2, '0');
    const seconds = (gameState.gameTime % 60).toString().padStart(2, '0');
    gameTimeElement.textContent = `${minutes}:${seconds}`;
}

// 检查任务进度
function checkQuestProgress() {
    // 任务1: 砍伐次数
    if (!gameState.quests[1].completed) {
        gameState.quests[1].current = gameState.chops;
        checkQuestCompletion(1);
    }
    
    // 任务2: 木材收集
    if (!gameState.quests[2].completed) {
        gameState.quests[2].current = gameState.totalWood;
        checkQuestCompletion(2);
    }
}

// 检查任务完成
function checkQuestCompletion(questId) {
    const quest = gameState.quests[questId];
    
    if (quest.current >= quest.target && !quest.completed) {
        quest.completed = true;
        
        // 发放奖励
        if (quest.reward.wood) {
            gameState.wood += quest.reward.wood;
            gameState.totalWood += quest.reward.wood;
            gameState.inventory.wood = gameState.wood;
        }
        if (quest.reward.gold) {
            gameState.gold += quest.reward.gold;
            gameState.totalGold += quest.reward.gold;
            gameState.inventory.gold = gameState.gold;
        }
        
        // 显示任务完成提示
        showFloatText(`任务完成: ${quest.name}!`, 'text-secondary', true);
    }
    
    // 更新任务显示
    updateQuestDisplay(questId);
}

// 检查成就进度
function checkAchievementProgress() {
    // 成就1: 砍伐次数
    if (!gameState.achievements[1].completed && gameState.chops >= gameState.achievements[1].target) {
        completeAchievement(1);
    }
    
    // 成就2: 金币收集
    if (!gameState.achievements[2].completed && gameState.totalGold >= gameState.achievements[2].target) {
        completeAchievement(2);
    }
    
    // 成就3: 木材收集
    if (!gameState.achievements[3].completed && gameState.totalWood >= gameState.achievements[3].target) {
        completeAchievement(3);
    }
    
    // 成就4: 自动砍伐机数量
    if (!gameState.achievements[4].completed && gameState.upgrades.autoChopper >= gameState.achievements[4].target) {
        completeAchievement(4);
    }
}

// 完成成就
function completeAchievement(achievementId) {
    gameState.achievements[achievementId].completed = true;
    
    // 显示成就完成提示
    showFloatText(`成就解锁: ${gameState.achievements[achievementId].name}!`, 'text-yellow-500', true);
    
    // 更新成就显示
    updateAchievementDisplay(achievementId);
}

// 显示浮动文本动画
function showFloatText(text, colorClass, isCentered = false) {
    const textElement = document.createElement('div');
    textElement.textContent = text;
    textElement.className = `absolute text-xl font-bold animate-floatUp pointer-events-none ${colorClass} z-20`;
    
    if (isCentered) {
        textElement.style.left = '50%';
        textElement.style.top = '20%';
        textElement.style.transform = 'translateX(-50%)';
    } else {
        // 随机位置
        const x = Math.random() * 100 - 50;
        const y = Math.random() * 50 - 25;
        textElement.style.left = `${x}px`;
        textElement.style.top = `${y}px`;
    }
    
    treeElement.parentElement.appendChild(textElement);
    
    // 动画结束后移除元素
    setTimeout(() => {
        treeElement.parentElement.removeChild(textElement);
    }, 1000);
}

// 更新游戏显示
function updateGameDisplay() {
    // 更新资源显示
    woodCountElement.textContent = `木材: ${gameState.wood}`;
    goldCountElement.textContent = `金币: ${gameState.gold}`;
    chopsCountElement.textContent = gameState.chops;
    totalWoodElement.textContent = gameState.totalWood;
    totalGoldElement.textContent = gameState.totalGold;
    
    // 更新效率显示
    chopEfficiencyElement.textContent = `当前: ${gameState.chopEfficiency} 木材/次`;
    autoRateElement.textContent = `当前: ${gameState.autoWoodRate} 木材/秒`;
    
    // 更新背包显示
    woodItemElement.textContent = gameState.inventory.wood;
    goldItemElement.textContent = gameState.inventory.gold;
    
    // 更新升级按钮
    updateUpgradeButtons();
    
    // 更新任务显示
    for (let i = 1; i <= Object.keys(gameState.quests).length; i++) {
        updateQuestDisplay(i);
    }
    
    // 更新成就显示
    for (let i = 1; i <= Object.keys(gameState.achievements).length; i++) {
        updateAchievementDisplay(i);
    }
}

// 更新升级按钮文本
function updateUpgradeButtons() {
    // 效率升级按钮
    const efficiencyButton = document.querySelector('button[onclick="upgradeEfficiency()"]');
    const efficiencyCost = Math.floor(10 * Math.pow(1.5, gameState.upgrades.efficiency));
    efficiencyButton.textContent = `升级 (${efficiencyCost} 木材)`;
    
    // 自动砍伐机升级按钮
    const autoButton = document.querySelector('button[onclick="upgradeAutoChop()"]');
    let autoCost = 50;
    if (gameState.hasAutoChopper) {
        autoCost = Math.floor(50 * Math.pow(1.8, gameState.upgrades.autoChopper));
        autoButton.textContent = `升级 (${autoCost} 木材)`;
    } else {
        autoButton.textContent = `购买 (${autoCost} 木材)`;
    }
}

// 更新任务显示
function updateQuestDisplay(questId) {
    const quest = gameState.quests[questId];
    const progressBar = document.getElementById(`quest-${questId}-progress`);
    const progressText = progressBar.nextElementSibling;
    
    if (progressBar && progressText) {
        // 计算进度百分比
        const progressPercent = Math.min(100, (quest.current / quest.target) * 100);
        
        // 更新进度条
        progressBar.style.width = `${progressPercent}%`;
        
        // 更新进度文本
        progressText.textContent = `${Math.min(quest.current, quest.target)}/${quest.target}`;
        
        // 如果任务已完成，添加完成样式
        const questElement = progressBar.closest('.bg-gray-50');
        if (quest.completed && questElement) {
            questElement.classList.add('border-green-500', 'bg-green-50');
            progressBar.classList.remove('bg-secondary');
            progressBar.classList.add('bg-green-500');
        }
    }
}

// 更新成就显示
function updateAchievementDisplay(achievementId) {
    const achievement = gameState.achievements[achievementId];
    const achievementElements = document.querySelectorAll('#achievements > div');
    
    if (achievementElements[achievementId - 1]) {
        const achievementElement = achievementElements[achievementId - 1];
        const lockIcon = achievementElement.querySelector('i');
        const iconContainer = lockIcon.parentElement;
        
        if (achievement.completed) {
            // 更新为解锁样式
            achievementElement.classList.add('border-yellow-500', 'bg-yellow-50');
            iconContainer.classList.remove('bg-gray-200');
            iconContainer.classList.add('bg-yellow-200');
            lockIcon.classList.remove('fa-lock', 'text-gray-400');
            lockIcon.classList.add('fa-trophy', 'text-yellow-500');
        }
    }
}

// 保存游戏进度
function saveGame() {
    localStorage.setItem('idleGameSave', JSON.stringify(gameState));
}

// 加载游戏进度
function loadGame() {
    const savedData = localStorage.getItem('idleGameSave');
    if (savedData) {
        try {
            gameState = JSON.parse(savedData);
            return true;
        } catch (e) {
            console.error('加载游戏进度失败:', e);
            return false;
        }
    }
    return false;
}

// 重置游戏进度
function resetGame() {
    if (confirm('确定要重置游戏进度吗？这将无法恢复！')) {
        localStorage.removeItem('idleGameSave');
        location.reload();
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', initGame);

// 添加控制台命令用于调试
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;