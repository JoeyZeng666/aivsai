// 存储所有数据
let allCompareItems = [];
let selectedTags = new Set();
let tagNameMap = {}; // 新增：存储标签id到name的映射
let imageCache = new Map(); // 新增：用于缓存已加载的图片

// 新增：从 URL 读取标签
function getTagsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const tags = urlParams.get('tags');
    return tags ? new Set(tags.split(',')) : new Set();
}

// 新增：更新 URL 中的标签
function updateUrlTags(tags) {
    const url = new URL(window.location);
    if (tags.size > 0) {
        url.searchParams.set('tags', Array.from(tags).join(','));
    } else {
        url.searchParams.delete('tags');
    }
    // 更新 URL 但不刷新页面
    window.history.pushState({}, '', url);
}

// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        const categoryGroups = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        
        // 构建标签映射
        categoryGroups.forEach(group => {
            group.tags.forEach(tag => {
                tagNameMap[tag.id] = {
                    name: tag.name,
                    emoji: tag.emoji,
                    group: group.groupName // 记录标签所属分组
                };
            });
        });

        // 从 URL 读取已选标签
        selectedTags = getTagsFromUrl();
        
        categoryGroups.forEach(group => {
            // 创建分组容器
            const groupContainer = document.createElement('li');
            groupContainer.className = 'nav-group-container';
            
            // 创建分组标题
            const groupTitle = document.createElement('span');
            groupTitle.className = 'nav-group-title';
            groupTitle.textContent = '#'+group.groupName;
            groupContainer.appendChild(groupTitle);
            
            // 创建标签容器
            const tagContainer = document.createElement('div');
            tagContainer.className = 'tag-container';
            
            // 添加该分组的所有标签
            group.tags.forEach(tag => {
                const tagElement = document.createElement('a');
                tagElement.className = 'tag-link text-decoration-none';
                // 如果标签在 URL 中，添加 active 类
                if (selectedTags.has(tag.id)) {
                    tagElement.classList.add('active');
                }
                tagElement.href = '#';
                tagElement.dataset.tag = tag.id;
                tagElement.dataset.group = group.groupName;
                tagElement.textContent = tag.emoji+tag.name;
                
                tagElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // 移除同组其他标签的active状态
                    document.querySelectorAll(`.tag-link[data-group="${group.groupName}"]`).forEach(el => {
                        if(el !== tagElement) {
                            el.classList.remove('active');
                            selectedTags.delete(el.dataset.tag);
                        }
                    });
                    
                    // 切换当前标签状态
                    tagElement.classList.toggle('active');
                    if (selectedTags.has(tag.id)) {
                        selectedTags.delete(tag.id);
                    } else {
                        selectedTags.add(tag.id);
                    }
                    
                    // 更新 URL
                    updateUrlTags(selectedTags);
                    filterCompareItems();
                });
                
                tagContainer.appendChild(tagElement);
            });
            
            groupContainer.appendChild(tagContainer);
            categoriesList.appendChild(groupContainer);
        });

        // 加载所有对比内容
        loadAllCompareItems();
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

// 加载所有对比内容
async function loadAllCompareItems() {
    try {
        const response = await fetch('data/compare_items.json');
        allCompareItems = await response.json();
        filterCompareItems();
    } catch (error) {
        console.error('加载对比内容失败:', error);
    }
}

// 修改判断是否为移动端的函数
function isMobile() {
    return window.innerWidth < 576; // 使用 Bootstrap 的 sm 断点
}

// 新增：图片加载函数
function loadImage(url) {
    return new Promise((resolve, reject) => {
        // 检查缓存
        if (imageCache.has(url)) {
            resolve(imageCache.get(url));
            return;
        }

        const img = new Image();
        img.onload = () => {
            imageCache.set(url, url); // 缓存图片URL
            resolve(url);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

// 修改 filterCompareItems 函数
function filterCompareItems() {
    const compareItems = document.getElementById('compareItems');
    let filteredItems;
    
    if (selectedTags.size === 0) {
        filteredItems = allCompareItems;
    } else {
        filteredItems = allCompareItems.filter(item => 
            Array.from(selectedTags).every(tag => item.tags.includes(tag))
        );
    }
    
    // 根据屏幕宽度选择不同的渲染模板
    if (isMobile()) {
        // 移动端模板（仅在小于576px时使用）
        compareItems.innerHTML = filteredItems.map(item => `
            <div class="col-12">
                <div class="compare-item">
                    <div class="d-flex flex-column align-items-start mb-2">
                        <p class="prompt-text text-muted mb-2">${item.prompt}</p>
                        <div class="tags-display">
                            ${renderTags(item.tags)}
                        </div>
                    </div>
                    <div class="row g-2">
                        ${item.aiResults.map(result => `
                            <div class="col-12">
                                <figure class="figure mb-2">
                                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E"
                                         data-src="${result.imageUrl}"
                                         alt="${result.aiTool} 生成的图片" 
                                         class="figure-img img-fluid rounded shadow-none w-100 lazy">
                                    <figcaption class="figure-caption text-center mt-1 small">${result.aiTool}</figcaption>
                                </figure>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        // PC和平板模板（大于等于576px时使用）
        compareItems.innerHTML = filteredItems.map(item => `
            <div class="col-sm-12 col-lg-6 mb-4">
                <div class="compare-item h-100">
                    <div class="d-flex align-items-start justify-content-between mb-3">
                        <p class="prompt-text text-muted mb-0">${item.prompt}</p>
                        <div class="tags-display ms-3">
                            ${renderTags(item.tags)}
                        </div>
                    </div>
                    <div class="row g-4">
                        ${item.aiResults.map(result => `
                            <div class="col-sm-4">
                                <figure class="figure mb-2">
                                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E"
                                         data-src="${result.imageUrl}"
                                         alt="${result.aiTool} 生成的图片" 
                                         class="figure-img img-fluid rounded shadow-none lazy">
                                    <figcaption class="figure-caption text-center mt-2">${result.aiTool}</figcaption>
                                </figure>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 初始化懒加载
    initLazyLoading();
}

// 新增：初始化懒加载
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img.dataset.src)
                    .then(url => {
                        img.src = url;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    })
                    .catch(error => {
                        img.src = 'images/logo.png'; // 添加一个加载失败的占位图
                    });
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// 新增：渲染标签的辅助函数
function renderTags(tags) {
    return tags.map(tagId => {
        const tagInfo = tagNameMap[tagId];
        return tagInfo ? `
            <span class="badge text-secondary bg-light border me-1" style="font-size: 0.75rem; font-weight: normal;">
                ${tagInfo.emoji} ${tagInfo.name}
            </span>
        ` : '';
    }).join('');
}

// 添加窗口大小变化的监听器
window.addEventListener('resize', filterCompareItems);

// 新增：处理浏览器前进/后退事件
window.addEventListener('popstate', () => {
    selectedTags = getTagsFromUrl();
    // 更新标签的激活状态
    document.querySelectorAll('.tag-link').forEach(tagElement => {
        const tagId = tagElement.dataset.tag;
        if (selectedTags.has(tagId)) {
            tagElement.classList.add('active');
        } else {
            tagElement.classList.remove('active');
        }
    });
    filterCompareItems();
});

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadCategories); 