import hashlib

def generate_evaluation_key(cv_text: str) -> str:
    """
    Tạo evaluation_key duy nhất từ nội dung CV, JD, và prompt.
    """
    # 1. Gộp 3 phần lại
    combined_text = cv_text.strip() 

    # 2. Dùng SHA256 để tạo mã băm (hash)
    hash_object = hashlib.sha256(combined_text.encode("utf-8"))

    # 3. Lấy ra chuỗi mã (hexadecimal)
    evaluation_key = hash_object.hexdigest()

    return evaluation_key
