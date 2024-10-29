// 加载动画控制
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.querySelector('.loading-screen');
        this.loadingBar = document.querySelector('.loading-bar');
        this.loadingPercentage = document.querySelector('.loading-percentage');
        this.progress = 0;
        this.loadingTime = Math.random() * 2000 + 4000; // 4-6秒随机
        this.startTime = null;
    }

    start() {
        // 确保初始状态
        document.getElementById('fullpage').style.opacity = '0';
        this.loadingScreen.style.display = 'flex';
        this.loadingScreen.style.opacity = '1';
        this.startTime = Date.now();
        this.update();
    }

    update() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min((elapsed / this.loadingTime) * 100, 100);

        // 更新加载条和百分比
        this.loadingBar.style.width = `${progress}%`;
        this.loadingPercentage.textContent = `${Math.round(progress)}%`;

        if (progress < 100) {
            requestAnimationFrame(() => this.update());
        } else {
            this.complete();
        }
    }

    complete() {
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            document.getElementById('fullpage').style.opacity = '1';
            
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                // 初始化其他内容
                initializeFullPage();
                new ParticleSystem();
                
                // 显示全屏提示
                createFullscreenPrompt();
            }, 1000);
        }, 500);
    }
}

// 粒子系统
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.lines = [];
        this.container = document.getElementById('particles-bg');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
    }

    init() {
        // 创建粒子
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }

        // 监听鼠标移动
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // 开始动画
        this.animate();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 3 + 1;
        
        const data = {
            element: particle,
            size: size,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            speedX: (Math.random() - 0.5) * 1,
            speedY: (Math.random() - 0.5) * 1
        };

        particle.style.width = particle.style.height = `${size}px`;
        this.container.appendChild(particle);
        this.particles.push(data);
    }

    drawLines() {
        // 清除旧的线
        this.lines.forEach(line => line.remove());
        this.lines = [];

        // 创建新的线
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const line = document.createElement('div');
                    line.className = 'line';
                    const angle = Math.atan2(dy, dx);
                    
                    line.style.width = `${distance}px`;
                    line.style.height = '1px';
                    line.style.left = `${p2.x}px`;
                    line.style.top = `${p2.y}px`;
                    line.style.transform = `rotate(${angle}rad)`;
                    line.style.opacity = (1 - distance / 150) * 0.5;
                    
                    this.container.appendChild(line);
                    this.lines.push(line);
                }
            }
        }
    }

    animate = () => {
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // 边界检查
            if (p.x < 0 || p.x > this.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.height) p.speedY *= -1;

            // 鼠标交互
            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                p.x -= dx * 0.02;
                p.y -= dy * 0.02;
            }

            p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
        });

        this.drawLines();
        requestAnimationFrame(this.animate);
    }
}

// 全屏功能
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    }
}

// 创建全屏提示
function createFullscreenPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'fullscreen-prompt';
    prompt.innerHTML = `
        <div class="prompt-content">
            <h2>是否进入全屏体验？全屏体验效果更佳！</h2>
            <div class="prompt-buttons">
                <button class="enter-button">进入全屏</button>
                <button class="cancel-button">不用了，谢谢</button>
            </div>
        </div>
    `;
    document.body.appendChild(prompt);

    // 点击进入全屏按钮
    prompt.querySelector('.enter-button').addEventListener('click', () => {
        toggleFullScreen();
        fadeOutPrompt(prompt);
    });

    // 点击取消按钮
    prompt.querySelector('.cancel-button').addEventListener('click', () => {
        fadeOutPrompt(prompt);
    });
}

// 淡出提示框
function fadeOutPrompt(prompt) {
    prompt.style.opacity = '0';
    setTimeout(() => {
        prompt.remove();
    }, 500);
}

// 优化页面切换动画
function initializeFullPage() {
    new fullpage('#fullpage', {
        autoScrolling: true,
        scrollHorizontally: true,
        navigation: true,
        navigationPosition: 'right',
        showActiveTooltip: true,
        scrollingSpeed: 1000,
        easingcss3: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        
        onLeave: function(origin, destination, direction) {
            // 页面切换动画
            const content = destination.item.querySelector('.content');
            content.style.animation = 'fadeInUp 1s forwards';
            
            // 添加粒子爆炸效果
            createParticleExplosion(content);
        }
    });
}

// 添加粒子爆炸效果
function createParticleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const particles = 20;
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (i / particles) * Math.PI * 2;
        const velocity = 2;
        const size = Math.random() * 4 + 2;
        
        particle.style.cssText = `
            position: absolute;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: ${size}px;
            height: ${size}px;
            background: rgba(100, 255, 218, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { 
                transform: `translate(${Math.cos(angle) * 100 * velocity}px, 
                           ${Math.sin(angle) * 100 * velocity}px)`,
                opacity: 0 
            }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    const loadingScreen = new LoadingScreen();
    loadingScreen.start();
});

// 监听键盘事件，按 ESC 退出全屏
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
    }
});
