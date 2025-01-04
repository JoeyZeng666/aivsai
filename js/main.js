// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        const categories = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        
        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a class="nav-link" href="#" data-category="${category.id}">
                    ${category.name}
                </a>
            `;
            li.addEventListener('click', () => loadCompareItems(category.id));
            categoriesList.appendChild(li);
        });

        // 默认加载第一个分类
        if (categories.length > 0) {
            loadCompareItems(categories[0].id);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

// 加载对比内容
async function loadCompareItems(categoryId) {
    try {
        const response = await fetch('data/compare_items.json');
        const items = await response.json();
        const compareItems = document.getElementById('compareItems');
        
        // 过滤当前分类的内容
        const filteredItems = items.filter(item => item.categoryId === categoryId);
        
        compareItems.innerHTML = filteredItems.map(item => `
            <div class="compare-item">
                <div class="prompt-text">${item.prompt}</div>
                <div class="image-grid">
                    ${item.aiResults.map(result => `
                        <div class="ai-result">
                            <img src="${result.imageUrl}" alt="${result.aiTool} 生成的图片" class="ai-image">
                            <div class="ai-tool-name">${result.aiTool}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载对比内容失败:', error);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadCategories); 