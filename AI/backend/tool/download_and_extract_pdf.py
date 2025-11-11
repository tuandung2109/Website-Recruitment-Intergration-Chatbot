import os
import tempfile
import requests
from pathlib import Path
import fitz  # PyMuPDF


def download_and_extract_pdf(url: str) -> str:
    """
    Tải file PDF từ URL, đọc nội dung, sau đó xóa file tạm
    
    Args:
        url: URL của file PDF cần tải
        
    Returns:
        str: Nội dung text được trích xuất từ PDF
        
    Raises:
        ValueError: Nếu URL không hợp lệ hoặc không phải file PDF
        requests.exceptions.RequestException: Nếu có lỗi khi tải file
        Exception: Các lỗi khác
    """
    
    # Validate URL
    if not url:
        raise ValueError("URL is empty")
    
    if not url.startswith(('http://', 'https://')):
        raise ValueError("URL must start with http:// or https://")
    
    if not url.lower().endswith('.pdf'):
        raise ValueError("URL must point to a PDF file")
    
    temp_file_path = None
    
    try:
        # Tạo file tạm với suffix .pdf
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file_path = temp_file.name
        temp_file.close()
        
        print(f"📥 Downloading PDF from: {url}")
        
        # Tải file từ URL
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Kiểm tra content type
        content_type = response.headers.get('content-type', '').lower()
        if 'application/pdf' not in content_type and 'application/octet-stream' not in content_type:
            raise ValueError(f"URL does not point to a PDF file. Content-Type: {content_type}")
        
        # Ghi nội dung vào file tạm
        with open(temp_file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"✅ Downloaded to temporary file: {temp_file_path}")
        
        # Đọc nội dung PDF
        print(f"📄 Extracting text from PDF...")
        with fitz.open(temp_file_path) as pdf:
            text = ""
            for page_num, page in enumerate(pdf, 1):
                page_text = page.get_text()
                text += page_text
                print(f"   - Extracted page {page_num}/{len(pdf)}")
            
            if not text.strip():
                raise ValueError("PDF appears to be empty or contains no text")
        
        print(f"✅ Successfully extracted {len(text)} characters")
        return text
        
    except requests.exceptions.Timeout:
        raise Exception(f"Timeout while downloading PDF from {url}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error downloading PDF: {str(e)}")
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")
    finally:
        # Xóa file tạm nếu tồn tại
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                print(f"🗑️  Deleted temporary file: {temp_file_path}")
            except Exception as e:
                print(f"⚠️  Warning: Could not delete temporary file {temp_file_path}: {str(e)}")


def download_pdf_to_file(url: str, output_path: str) -> str:
    """
    Tải file PDF từ URL và lưu vào đường dẫn chỉ định
    
    Args:
        url: URL của file PDF cần tải
        output_path: Đường dẫn nơi lưu file PDF
        
    Returns:
        str: Đường dẫn đến file đã lưu
        
    Raises:
        ValueError: Nếu URL hoặc output_path không hợp lệ
        requests.exceptions.RequestException: Nếu có lỗi khi tải file
    """
    
    # Validate URL
    if not url:
        raise ValueError("URL is empty")
    
    if not url.startswith(('http://', 'https://')):
        raise ValueError("URL must start with http:// or https://")
    
    if not output_path:
        raise ValueError("Output path is empty")
    
    try:
        # Tạo thư mục nếu chưa tồn tại
        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        print(f"📥 Downloading PDF from: {url}")
        
        # Tải file từ URL
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        # Ghi nội dung vào file
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"✅ Downloaded to: {output_path}")
        return output_path
        
    except requests.exceptions.Timeout:
        raise Exception(f"Timeout while downloading PDF from {url}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error downloading PDF: {str(e)}")
    except Exception as e:
        raise Exception(f"Error saving PDF: {str(e)}")
