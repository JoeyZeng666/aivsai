import pandas as pd
import re

def parse_text_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 用于存储结果的列表
    prompts = []
    tags = []
    
    # 当前处理的类别
    current_category = ""
    
    # 按行分割内容
    lines = content.split('\n')
    
    for line in lines:
        # 跳过空行
        if not line.strip():
            continue
            
        # 检查是否是类别标题
        if line.startswith('**'):
            current_category = line.strip('* ')
            continue
            
        # 如果是数字开头的行，说明是提示语
        if re.match(r'^\d+\.', line.strip()):
            # 去除行号和首尾空格
            prompt = re.sub(r'^\d+\.\s*', '', line.strip())
            if prompt:
                prompts.append(prompt)
                tags.append(current_category)
    
    # 创建DataFrame
    df = pd.DataFrame({
        '提示语': prompts,
        '标签': [','.join(tag.split('-')).strip() for tag in tags]
    })
    
    return df

def main():
    # 解析文件
    df = parse_text_file('data.txt')
    
    # 保存为Excel文件
    df.to_excel('prompts.xlsx', index=False)
    print(f"已成功转换文件，共处理 {len(df)} 条记录")
    print("输出文件：prompts.xlsx")

if __name__ == '__main__':
    main()
