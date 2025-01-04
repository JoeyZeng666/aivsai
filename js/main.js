// 存储所有数据
let allCompareItems = [];
let selectedTags = new Set();

// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        const categoryGroups = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        
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

// 根据选中的标签筛选内容
function filterCompareItems() {
    const compareItems = document.getElementById('compareItems');
    let filteredItems;
    
    if (selectedTags.size === 0) {
        // 如果没有选中任何标签,显示所有内容
        filteredItems = allCompareItems;
    } else {
        // 筛选同时包含所有选中标签的内容
        filteredItems = allCompareItems.filter(item => 
            Array.from(selectedTags).every(tag => item.tags.includes(tag))
        );
    }
    
    // 渲染筛选后的内容
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
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadCategories); 