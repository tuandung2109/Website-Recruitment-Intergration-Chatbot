class Reflection():
    def __init__(self, llm, max_items=100):
        """
        llm: đối tượng có method generate_content(list_of_messages) -> str
        max_items: số lượng message cuối cùng được xem xét
        """
        self.llm = llm
        self.max_items = max_items

    def _collect_user_messages(self, chat_history):
        """
        Lấy và ghép nội dung chỉ từ các message có role == 'user',
        giữ thứ tự ban đầu (cũ -> mới).
        """
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

        return user_texts  # trả về dạng list thay vì string

    def __call__(self, chatHistory, lastItemsConsidereds=None):
        if lastItemsConsidereds is None:
            lastItemsConsidereds = self.max_items

        user_messages = self._collect_user_messages(chatHistory)
        if not user_messages:
            return "Không có tin nhắn của người dùng để tóm tắt."

        # Nếu chỉ có 1 tin nhắn => tóm tắt thẳng
        if len(user_messages) == 1:
            last_block = user_messages[-1]
        else:
            # Gộp logic: phát hiện "chuyển chủ đề"
            # Ta cho LLM tự phát hiện, chọn giữ lại các câu cùng chủ đề với tin cuối
            joined_messages = "\n".join(user_messages)

            topic_detection_prompt = f"""
Bạn nhận được các tin nhắn của người dùng theo thứ tự thời gian.  
Hãy xác định xem các tin nhắn có cùng một chủ đề hay không.  
Nếu người dùng đổi chủ đề (ví dụ: đang nói về việc làm rồi chuyển sang nói về thời tiết),
chỉ GIỮ LẠI những tin nhắn thuộc CHỦ ĐỀ CUỐI CÙNG (tức là những tin nhắn mới nhất có cùng chủ đề).  

Tin nhắn người dùng:
{joined_messages}

Trả về đúng nội dung (hoặc các dòng) của chủ đề cuối cùng, không cần giải thích thêm.
""".strip()

            selected_text = self.llm.generate_content([{"role": "user", "content": topic_detection_prompt}])
            if isinstance(selected_text, str):
                if "</think>" in selected_text:
                    selected_text = selected_text.split("</think>")[-1].strip()
                selected_text = selected_text.strip().strip('"')
            last_block = selected_text

        # Bước 2: tóm tắt lại CHỈ trong 1 câu
        summarize_prompt = f"""
Tóm tắt nội dung sau đây thành đúng **1 câu duy nhất**,
chỉ giữ ý chính thể hiện mục đích hoặc yêu cầu của người dùng.

Nội dung:
{last_block}
""".strip()

        summary = self.llm.generate_content([{"role": "user", "content": summarize_prompt}])

        if isinstance(summary, str):
            if "</think>" in summary:
                summary = summary.split("</think>")[-1].strip()
            summary = summary.strip().strip('"')

        return summary
