import json
import pandas as pd
from pathlib import Path

data = 

def json_to_excel():
    # 读取JSON文件
    with open('data/categories.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 准备数据列表
    rows = []
    
    # 遍历JSON数据并整理成表格格式
    for group in data:
        group_name = group['groupName']
        for tag in group['tags']:
            rows.append({
                '分组': group_name,
                '标签ID': tag['id'],
                '标签名称': tag['name'],
                'emoji': tag['emoji']
            })
    
    # 创建DataFrame
    df = pd.DataFrame(rows)
    
    # 确保输出目录存在
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # 保存为Excel文件
    excel_path = output_dir / 'categories.xlsx'
    df.to_excel(excel_path, index=False, encoding='utf-8')
    print(f'Excel文件已保存至: {excel_path}')

if __name__ == '__main__':
    json_to_excel() 