/**
 * 导航栏交互功能
 */
function setupNavbar() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const navbar = document.querySelector('.navbar');

    // 移动菜单切换
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        // 链接动画
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // 汉堡菜单动画
        burger.classList.toggle('toggle');
    });

    // 滚动时导航栏样式变化
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            navbar.style.padding = '15px 0';
        }
    });
}

/**
 * 平滑滚动功能
 */
function setupSmoothScroll() {
    // 使用事件委托处理导航链接点击
    document.querySelector('.nav-links').addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();

            const targetId = e.target.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // 考虑导航栏高度
                    behavior: 'smooth'
                });

                // 如果是移动设备，点击导航链接后关闭菜单
                const nav = document.querySelector('.nav-links');
                const burger = document.querySelector('.burger');
                const navLinks = document.querySelectorAll('.nav-links li');

                if (nav.classList.contains('nav-active')) {
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');

                    navLinks.forEach(link => {
                        link.style.animation = '';
                    });
                }
            }
        }
    });
}

/**
 * 视频背景优化
 */
function optimizeVideoBackground() {
    const video = document.querySelector('.hero-video');
    if (video) {
        // 监听视频加载完成事件
        video.addEventListener('loadedmetadata', () => {
            // 视频已加载，可以进行一些操作
            console.log('视频已加载，时长:', video.duration, '秒');
        });

        // 视频播放失败处理
        video.addEventListener('error', (e) => {
            console.error('视频播放错误:', e);
            // 可以在这里添加备用方案
        });
    }
}

/**
 * 文本轮播功能
 */
function setupTextCarousel() {
    const carousel = document.querySelector('.text-carousel');
    const items = carousel.querySelectorAll('.carousel-item');
    let currentIndex = 0;

    // 显示当前项
    function showItem(index) {
        // 移除所有项的类
        items.forEach(item => {
            item.classList.remove('active', 'prev');
        });

        // 添加当前项的类
        items[index].classList.add('active');

        // 添加前一个项的类
        const prevIndex = (index - 1 + items.length) % items.length;
        items[prevIndex].classList.add('prev');
    }

    // 自动切换
    setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        showItem(currentIndex);
    }, 3000);

    // 初始显示第一个项
    showItem(currentIndex);
}

/**
 * 初始化所有功能
 */
function init() {
    setupNavbar();
    setupSmoothScroll();
    optimizeVideoBackground();
    setupTextCarousel(); // 添加文本轮播初始化
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);