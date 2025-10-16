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
            last_block = user_messages[-1]
        else:
            # Giữ lại các dòng thuộc chủ đề cuối cùng
            joined_messages = "\n".join(user_messages)

            topic_detection_prompt = f"""
Bạn nhận được các tin nhắn của người dùng theo thứ tự thời gian.
Nếu người dùng đổi chủ đề (ví dụ: nói về việc làm rồi chuyển sang thời tiết),
hãy chỉ giữ lại các tin nhắn thuộc **chủ đề cuối cùng**.

Tin nhắn người dùng:
{joined_messages}

Trả về đúng nội dung (hoặc các dòng) của chủ đề cuối cùng, không giải thích thêm.
""".strip()

            selected_text = self.llm.generate_content([{"role": "user", "content": topic_detection_prompt}])
            if isinstance(selected_text, str):
                if "</think>" in selected_text:
                    selected_text = selected_text.split("</think>")[-1].strip()
                selected_text = selected_text.strip().strip('"')
            last_block = selected_text

        # ✅ Bước 2: chỉ trích lại câu hỏi/yêu cầu cuối cùng, không diễn giải
        summarize_prompt = f"""
Phân tích đoạn hội thoại sau và trích ra **một câu duy nhất**
thể hiện đúng yêu cầu hoặc câu hỏi cuối cùng của người dùng.
Không được diễn giải, không tóm tắt, không thêm chi tiết mới.
ví dụ: 
user: "Tìm thông tin về công ty ABC"
assistant: "Thông tin công ty ABC là..."
user: "Công ty đó đang tuyển về gì?"
kết quả: "Công ty ABC đang tuyển về gì?"
Nội dung:
{last_block}
""".strip()

        summary = self.llm.generate_content([{"role": "user", "content": summarize_prompt}])

        if isinstance(summary, str):
            if "</think>" in summary:
                summary = summary.split("</think>")[-1].strip()
            summary = summary.strip().strip('"')

        return summary
