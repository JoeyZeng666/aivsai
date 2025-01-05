import pandas as pd
import json

def generate_compare_items():
    # 读取Excel文件
    df = pd.read_excel('prompts.xlsx')
    
    # 初始化结果列表
    compare_items = []
    
    # 遍历每一行数据
    for index, row in df.iterrows():
        # 创建每个项目的字典
        item = {
            "id": str(index + 1),
            "tags": [tag.strip() for tag in row['标签'].split(',')] if isinstance(row['标签'], str) else [],
            "prompt": row['提示语'],
            "aiResults": [
                {
                    "aiTool": "可灵",
                    "imageUrl": row['可灵'] if pd.notna(row['可灵']) else ""
                },
                {
                    "aiTool": "即梦", 
                    "imageUrl": row['即梦'] if pd.notna(row['即梦']) else ""
                }
            ]
        }
        compare_items.append(item)
    
    # 将结果写入JSON文件
    with open('data/compare_items.json', 'w', encoding='utf-8') as f:
        json.dump(compare_items, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    generate_compare_items()
