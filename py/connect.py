import pandas as pd
import os
from difflib import SequenceMatcher
import json

ziduan = '可灵'
folder_path = 'images/keling'
target_excel = 'py/prompts.xlsx'

def calculate_similarity(a, b):
    """计算两个字符串的相似度"""
    return SequenceMatcher(None, a, b).ratio()

def get_file_name_without_extension(file_name):
    """获取文件名（不含扩展名）"""
    return os.path.splitext(file_name)[0]

def main():
    # 1. 读取 Excel 文件中的「提示语」列
    df = pd.read_excel(target_excel)
    prompts = df['提示语'].tolist()

    # 2. 读取 keling 文件夹下的所有文件名
    image_files = [f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.png', '.jpeg'))]
    
    # 3. 建立提示语和文件名的关联
    matches = []
    used_files = set()
    
    for prompt in prompts:
        best_match = None
        best_similarity = -1
        
        for image_file in image_files:
            if image_file in used_files:
                continue
                
            # 比较提示语和文件名（不含扩展名）的相似度
            file_name = get_file_name_without_extension(image_file)
            similarity = calculate_similarity(prompt, file_name)
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = image_file
        
        if best_match and best_similarity > 0.5:
            matches.append({
                'prompt': prompt,
                'file': best_match,
                'similarity': best_similarity
            })
            used_files.add(best_match)
    
    # 4. 生成图片访问路径并更新 Excel
    # 先将所有行的字段置空
    df[ziduan] = ''
    
    # 如果有匹配结果,再更新对应行
    for match in matches:
        image_path = f"{folder_path}/{match['file']}"
        # 找到对应的提示语所在行
        mask = df['提示语'] == match['prompt']
        df.loc[mask, ziduan] = image_path
    
    # 直接更新原文件，而不是创建新文件
    df.to_excel(target_excel, index=False)
    
    # 打印匹配结果
    print("匹配结果：")
    for match in matches:
        print(f"提示语: {match['prompt']}")
        print(f"匹配文件: {match['file']}")
        print(f"相似度: {match['similarity']:.2f}")
        print("-" * 50)

    # 打印更新统计
    print(f"\n总共更新了 {len(matches)} 条记录")

if __name__ == "__main__":
    main()
