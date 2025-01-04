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
                    <span class="category-emoji">${category.emoji}</span>
                    ${category.name}
                </a>
            `;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                // 移除其他按钮的选中状态
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // 设置当前按钮的选中状态
                const link = e.currentTarget.querySelector('.nav-link');
                link.classList.add('active');
                
                loadCompareItems(category.id);
            });
            categoriesList.appendChild(li);
        });

        // 默认选中第一个分类
        if (categories.length > 0) {
            const firstLink = document.querySelector('.nav-link');
            firstLink.classList.add('active');
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
            <div class="compare-item mb-3">
                <p class="prompt-text text-muted mb-2 fs-6">${item.prompt}</p>
                <div class="row g-2">
                    ${item.aiResults.map(result => `
                        <div class="col-md-4">
                            <figure class="figure mb-2">
                                <img src="${result.imageUrl}" alt="${result.aiTool} 生成的图片" class="figure-img img-fluid rounded shadow-none">
                                <figcaption class="figure-caption text-center mt-1 small">${result.aiTool}</figcaption>
                            </figure>
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