import pandas as pd
import json

def excel_to_json_array():
    # 读取 Excel 文件
    df = pd.read_excel('prompts.xlsx')
    
    # 假设提示语在第一列，获取该列数据并转换为列表
    prompts = df.iloc[:, 0].tolist()
    
    # 将列表转换为 JSON 字符串
    json_string = json.dumps(prompts, ensure_ascii=False, indent=2)
    
    # 将结果写入文件
    with open('prompts.json', 'w', encoding='utf-8') as f:
        f.write(json_string)

if __name__ == '__main__':
    excel_to_json_array()
