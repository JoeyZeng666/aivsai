// 存储所有数据
let allCompareItems = [];
let selectedTags = new Set();
let tagNameMap = {}; // 新增：存储标签id到name的映射

// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        const categoryGroups = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        
        // 新增：构建标签映射
        categoryGroups.forEach(group => {
            group.tags.forEach(tag => {
                tagNameMap[tag.id] = {
                    name: tag.name,
                    emoji: tag.emoji
                };
            });
        });
        
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
                tagElement.href = '#';
                tagElement.dataset.tag = tag.id;
                tagElement.textContent = tag.emoji+tag.name;
                
                tagElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    tagElement.classList.toggle('active');
                    if (selectedTags.has(tag.id)) {
                        selectedTags.delete(tag.id);
                    } else {
                        selectedTags.add(tag.id);
                    }
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
                            ${item.tags.map(tagId => {
                                const tagInfo = tagNameMap[tagId];
                                return tagInfo ? `
                                    <span class="badge text-secondary bg-light border me-1 mb-1" style="font-size: 0.75rem; font-weight: normal;">
                                        ${tagInfo.emoji} ${tagInfo.name}
                                    </span>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                    <div class="row g-2">
                        ${item.aiResults.map(result => `
                            <div class="col-12">
                                <figure class="figure mb-2">
                                    <img src="${result.imageUrl}" alt="${result.aiTool} 生成的图片" 
                                         class="figure-img img-fluid rounded shadow-none w-100">
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
                            ${item.tags.map(tagId => {
                                const tagInfo = tagNameMap[tagId];
                                return tagInfo ? `
                                    <span class="badge text-secondary bg-light border me-1" style="font-size: 0.75rem; font-weight: normal;">
                                        ${tagInfo.emoji} ${tagInfo.name}
                                    </span>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                    <div class="row g-4">
                        ${item.aiResults.map(result => `
                            <div class="col-sm-4">
                                <figure class="figure mb-2">
                                    <img src="${result.imageUrl}" alt="${result.aiTool} 生成的图片" 
                                         class="figure-img img-fluid rounded shadow-none">
                                    <figcaption class="figure-caption text-center mt-2">${result.aiTool}</figcaption>
                                </figure>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// 添加窗口大小变化的监听器
window.addEventListener('resize', filterCompareItems);

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadCategories); 