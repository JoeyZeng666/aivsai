// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        const categories = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        
        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'nav-item mb-2';
            li.innerHTML = `
                <button class="btn btn-outline-primary w-100" data-category="${category.id}">
                    ${category.name}
                </button>
            `;
            li.addEventListener('click', (e) => {
                // 移除其他按钮的选中状态
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                
                // 设置当前按钮的选中状态
                const button = e.currentTarget.querySelector('.btn');
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
                
                loadCompareItems(category.id);
            });
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