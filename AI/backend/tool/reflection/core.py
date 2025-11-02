class Reflection:
    def __init__(self, llm, max_items=100):
        """
        llm: đối tượng có method generate_content(list_of_messages) -> str
        max_items: số lượng message cuối cùng được xem xét
        """
        self.llm = llm
        self.max_items = max_items

    def _collect_conversation(self, chat_history):
        """Lấy toàn bộ hội thoại (cả user và bot) để có đầy đủ ngữ cảnh."""
        if len(chat_history) > self.max_items:
            chat_history = chat_history[-self.max_items:]

        conversation_text = []
        for entry in chat_history:
            role = entry.get("role", "")
            text = ""
            
            # Lấy nội dung từ các format khác nhau
            if entry.get("parts"):
                text = " ".join(part.get("text", "") for part in entry["parts"])
            elif entry.get("content"):
                text = entry.get("content", "")
            
            if text.strip():
                # Thêm prefix để phân biệt vai trò
                if role == "user":
                    conversation_text.append(f"👤 Người dùng: {text.strip()}")
                elif role in ["assistant", "model", "bot"]:
                    conversation_text.append(f"🤖 Bot: {text.strip()}")
                else:
                    conversation_text.append(f"{role}: {text.strip()}")
        
        return conversation_text

    def __call__(self, chatHistory, lastItemsConsidereds=None):
        if lastItemsConsidereds is None:
            lastItemsConsidereds = self.max_items

        conversation = self._collect_conversation(chatHistory)
        if not conversation:
            return "Không có hội thoại để phân tích."

        # Nếu chỉ có 1 tin nhắn => lấy luôn (bỏ prefix)
        if len(conversation) == 1:
            msg = conversation[-1]
            # Bỏ prefix "👤 Người dùng: " hoặc "🤖 Bot: "
            if ":" in msg:
                return msg.split(":", 1)[1].strip()
            return msg
        
        # Nếu có nhiều tin nhắn, ghép toàn bộ hội thoại
        joined_conversation = "\n".join(conversation)

        print("Full conversation for reflection:")
        print(joined_conversation)

        # Prompt mới: Phân tích toàn bộ hội thoại để hiểu ngữ cảnh
        summarize_prompt = f"""
Bạn là trợ lý phân tích hội thoại. Dưới đây là toàn bộ cuộc hội thoại:

{joined_conversation}

🎯 NHIỆM VỤ:

1. **ĐỌC TOÀN BỘ HỘI THOẠI** để hiểu ngữ cảnh đầy đủ

2. **PHÂN TÍCH** câu hỏi cuối cùng của người dùng:

   **NẾU câu cuối LIÊN QUAN đến hội thoại trước** (cùng chủ đề, hỏi thêm chi tiết, bổ sung):
   → Tạo một câu hỏi ĐẦY ĐỦ kết hợp TẤT CẢ thông tin từ hội thoại
   → Bao gồm: tất cả tên công ty, yêu cầu, chi tiết đã được nhắc đến
   
   **NẾU câu cuối KHÔNG LIÊN QUAN** (chủ đề hoàn toàn mới):
   → CHỈ trả về câu hỏi cuối cùng

📝 VÍ DỤ:

**Ví dụ 1 - LIÊN QUAN** (lấy tất cả):
```
👤 Người dùng: tìm thông tin công ty TechCorp
🤖 Bot: Đây là thông tin về TechCorp...
👤 Người dùng: tìm thông tin công ty Novasoft
🤖 Bot: Đây là thông tin về Novasoft...
👤 Người dùng: tìm thông tin công ty MediCare
```
→ Output: "Tìm thông tin chi tiết về các công ty: TechCorp, Novasoft và MediCare"

**Ví dụ 2 - KHÔNG LIÊN QUAN**:
```
👤 Người dùng: tìm thông tin công ty TechCorp
🤖 Bot: Đây là thông tin...
👤 Người dùng: thời tiết hôm nay thế nào?
```
→ Output: "Thời tiết hôm nay thế nào?"

✅ QUY TẮC:
- GIỮ NGUYÊN tất cả tên riêng, từ khóa quan trọng
- Nếu liên quan: Kết hợp TẤT CẢ thông tin đã hỏi
- Nếu không liên quan: Chỉ câu cuối
- Trả về MỘT câu duy nhất, rõ ràng, đầy đủ
- KHÔNG giải thích, KHÔNG thêm text phụ

Câu hỏi tổng hợp:""".strip()

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
