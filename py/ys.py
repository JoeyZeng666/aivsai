from PIL import Image
import os
from pathlib import Path
from PIL.PngImagePlugin import PngImageFile
import piexif
import io

def strip_exif(img):
    """
    移除图片的EXIF信息
    """
    data = list(img.getdata())
    image_without_exif = Image.new(img.mode, img.size)
    image_without_exif.putdata(data)
    return image_without_exif

def lossless_compress_image(input_path, output_path, max_size_kb=300):
    """
    无损压缩图片
    """
    try:
        with Image.open(input_path) as img:
            # 获取原始文件大小
            original_size = os.path.getsize(input_path)
            
            # 1. 首先尝试移除EXIF数据
            if "exif" in img.info:
                img = strip_exif(img)
            
            # 2. 对PNG使用最优化压缩
            if isinstance(img, PngImageFile) or input_path.lower().endswith('.png'):
                img.save(output_path, format='PNG', optimize=True)
            
            # 3. 对JPEG尝试无损优化
            elif input_path.lower().endswith(('.jpg', '.jpeg')):
                img.save(output_path, format='JPEG', quality=100, optimize=True)
            
            # 4. 其他格式直接保存
            else:
                img.save(output_path, optimize=True)
            
            # 检查压缩后的大小
            compressed_size = os.path.getsize(output_path)
            return compressed_size <= max_size_kb * 1024

    except Exception as e:
        print(f"无损压缩时出错 {input_path}: {str(e)}")
        return False

def compress_image(input_path, output_path, max_size_kb=300):
    """
    压缩单个图片文件，优先使用无损压缩
    """
    try:
        # 首先尝试无损压缩
        if lossless_compress_image(input_path, output_path, max_size_kb):
            final_size = os.path.getsize(output_path) / 1024
            print(f"已完成无损压缩: {os.path.basename(input_path)} - 最终大小: {final_size:.1f}KB")
            return

        # 如果无损压缩后仍然超过大小限制，进行有损压缩
        with Image.open(input_path) as img:
            # 保存原始尺寸
            original_size = img.size
            
            # 尝试不同的压缩策略
            for quality in [95, 85, 75, 65, 50, 40]:
                # 重置图片尺寸到原始大小
                resized_img = img.resize(original_size, Image.Resampling.LANCZOS)
                resized_img.save(output_path, quality=quality, optimize=True)
                
                if os.path.getsize(output_path) <= max_size_kb * 1024:
                    break
            
            # 如果调整质量还是不够，开始缩小尺寸
            if os.path.getsize(output_path) > max_size_kb * 1024:
                scale = 0.9
                while os.path.getsize(output_path) > max_size_kb * 1024:
                    new_width = int(original_size[0] * scale)
                    new_height = int(original_size[1] * scale)
                    
                    if new_width < 100 or new_height < 100:
                        break
                        
                    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    resized_img.save(output_path, quality=quality, optimize=True)
                    scale *= 0.9

            final_size = os.path.getsize(output_path) / 1024
            print(f"已压缩: {os.path.basename(input_path)} - 最终大小: {final_size:.1f}KB")
            
    except Exception as e:
        print(f"处理图片 {input_path} 时出错: {str(e)}")

def batch_compress_images(input_folder, output_folder, max_size_kb=300):
    """
    批量压缩文件夹中的图片
    """
    # 创建输出文件夹
    Path(output_folder).mkdir(parents=True, exist_ok=True)
    
    # 支持的图片格式
    image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')
    
    # 遍历输入文件夹中的所有文件
    for root, dirs, files in os.walk(input_folder):
        for filename in files:
            if filename.lower().endswith(image_extensions):
                input_path = os.path.join(root, filename)
                rel_path = os.path.relpath(root, input_folder)
                output_path = os.path.join(output_folder, rel_path, filename)
                
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                compress_image(input_path, output_path, max_size_kb)

if __name__ == "__main__":
    input_folder = "images_hd/jimeng"
    output_folder = "images/jimeng"
    batch_compress_images(input_folder, output_folder, max_size_kb=600)
    print("所有图片压缩完成！")
