class Reflection:
    def __init__(self, llm, max_items=100):
        """
        llm: đối tượng có method generate_content(list_of_messages) -> str
        max_items: số lượng message cuối cùng được xem xét
        """
        self.llm = llm
        self.max_items = max_items

    def _collect_user_messages(self, chat_history):
        """Lấy và ghép nội dung chỉ từ message của người dùng."""
        if len(chat_history) > self.max_items:
            chat_history = chat_history[-self.max_items:]

        user_texts = []
        for entry in chat_history:
            if entry.get("role") == "user":
                text = ""
                if entry.get("parts"):
                    text = " ".join(part.get("text", "") for part in entry["parts"])
                elif entry.get("content"):
                    text = entry.get("content", "")
                if text.strip():
                    user_texts.append(text.strip())
        return user_texts

    def __call__(self, chatHistory, lastItemsConsidereds=None):
        if lastItemsConsidereds is None:
            lastItemsConsidereds = self.max_items

        user_messages = self._collect_user_messages(chatHistory)
        if not user_messages:
            return "Không có tin nhắn của người dùng để tóm tắt."

        # Nếu chỉ có 1 tin nhắn => lấy luôn
        if len(user_messages) == 1:
            return user_messages[-1]
        
        # Nếu có nhiều tin nhắn, ghép và tóm tắt thông minh
        joined_messages = "\n---\n".join(user_messages)

        # Prompt cải tiến để tạo summary thông minh hơn
        summarize_prompt = f"""
Bạn là trợ lý phân tích ý định người dùng. Dưới đây là các tin nhắn của người dùng:

{joined_messages}

Hãy phân tích và xác định **MỤC ĐÍCH CHÍNH** của người dùng:

🎯 NGUYÊN TẮC PHÂN TÍCH:
1. Nếu có nhiều câu hỏi liên quan → Tìm câu hỏi CỐT LÕI nhất
2. Nếu câu hỏi đầu là ĐIỀU KIỆN để hỏi câu sau → Chỉ lấy câu SAU
3. Nếu hỏi về thông tin rồi hỏi chi tiết → Ưu tiên CHI TIẾT cụ thể
4. Tập trung vào HÀNH ĐỘNG hoặc THÔNG TIN người dùng thực sự cần

📝 VÍ DỤ:
- "Tìm công ty X, công ty đó tuyển gì?" → "Công ty X đang tuyển dụng vị trí gì?"
- "Có việc làm nào phù hợp không?" → "Tìm việc làm phù hợp"
- "Cho tôi biết về công ty A, lương bao nhiêu?" → "Mức lương tại công ty A"

✅ YÊU CẦU OUTPUT:
- Một câu ngắn gọn, đi thẳng vào ý chính
- Giữ nguyên tên riêng, từ khóa quan trọng
- Loại bỏ thông tin phụ, chỉ giữ mục đích chính
- Trả về trực tiếp, không giải thích

Tóm tắt thông minh:""".strip()

        summary = self.llm.generate_content([{"role": "user", "content": summarize_prompt}])

        if isinstance(summary, str):
            # Xử lý các tag thinking nếu có
            if "</think>" in summary:
                summary = summary.split("</think>")[-1].strip()
            
            # Loại bỏ markdown và quotes thừa
            summary = summary.strip()
            if summary.startswith('"') and summary.endswith('"'):
                summary = summary[1:-1]
            if summary.startswith("'") and summary.endswith("'"):
                summary = summary[1:-1]
            
            # Loại bỏ các prefix không cần thiết
            prefixes_to_remove = [
                "Câu tóm tắt:",
                "Tóm tắt:",
                "Summary:",
                "Người dùng muốn:",
                "Yêu cầu:",
            ]
            for prefix in prefixes_to_remove:
                if summary.startswith(prefix):
                    summary = summary[len(prefix):].strip()
            
            summary = summary.strip()

        return summary
