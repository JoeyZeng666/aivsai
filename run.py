import http.server
import socketserver
import webbrowser
import os
from urllib.parse import urlparse, unquote

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # 对 URL 编码的参数进行解码
        decoded_args = [unquote(str(arg)) for arg in args]
        # 使用解码后的参数进行日志打印
        super().log_message(format, *decoded_args)
        
    def end_headers(self):
        # 添加CORS头，允许所有来源
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server(port=8080):
    # 获取当前目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"当前目录: {current_dir}")
    # 切换到当前目录
    os.chdir(current_dir)
    # 创建服务器
    handler = MyHttpRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            server_url = f"http://localhost:{port}"
            print(f"启动服务器在: {server_url}")
            print("按 Ctrl+C 停止服务器")
            
            # 开始服务
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 98:  # 端口已被占用
            print(f"端口 {port} 已被占用，尝试其他端口...")
        raise e
            
    except KeyboardInterrupt:
        print("\n服务器已停止")
if __name__ == "__main__":
    run_server() 