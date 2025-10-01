class Reflection():
    def __init__(self, llm):
        self.llm = llm
    
    def _concat_and_format_texts(self, data):
        concatenatedTexts = []
        for entry in data:
            role = entry.get('role', '')
            if entry.get('parts'):
                all_texts = ' '.join(part['text'] for part in entry['parts'] )
            elif entry.get('content'):
                all_texts = entry['content'] 
            concatenatedTexts.append(f"{role}: {all_texts} \n")
        return ''.join(concatenatedTexts)
    
    
    def __call__(self, chatHistory, lastItemsConsidereds=100):
        
        if len(chatHistory) >= lastItemsConsidereds:
            chatHistory = chatHistory[len(chatHistory) - lastItemsConsidereds:]

        historyString = self._concat_and_format_texts(chatHistory)

        # Lấy câu hỏi cuối cùng của user
        last_user_msg = ""
        for msg in reversed(chatHistory):
            if msg.get("role") == "user":
                last_user_msg = msg.get("content") or ""
                break

        prompt_template = """
Bạn nhận được toàn bộ lịch sử hội thoại giữa người dùng (user) và trợ lý (assistant).  

🎯 Nhiệm vụ:
- Viết lại YÊU CẦU hoặc CÂU HỎI cuối cùng của NGƯỜI DÙNG thành MỘT CÂU HOÀN CHỈNH và ĐỘC LẬP bằng tiếng Việt.  
- Phải KẾT HỢP các thông tin từ lịch sử để câu hỏi/đề nghị có thể hiểu được mà KHÔNG cần xem lại lịch sử.  
- Câu viết phải NGẮN GỌN, TỰ NHIÊN và GIỮ NGUYÊN Ý ĐỊNH của người dùng.

💡 Ví dụ:
Lịch sử hội thoại:
- User: "Tìm việc ở đây"
- Assistant: "Bạn muốn tìm việc gì?"
- User: "Hà Nội"

➡️ Kết quả mong đợi: "Tôi muốn tìm công việc ở Hà Nội"
*** Lưu ý: Ví dụ chỉ mang tính minh họa
{historyString}
""".strip()


        filled_prompt = prompt_template.format(historyString=historyString, last_user_msg=last_user_msg)

        higherLevelSummariesPrompt = {
            "role": "user",
            "content": filled_prompt
        }

        print({"reflection_prompt": filled_prompt})

        completion = self.llm.generate_content([higherLevelSummariesPrompt])

        # Clean possible thinking tags or quotes
        if "</think>" in completion:
            completion = completion.split("</think>")[-1].strip()
        completion = completion.strip().strip('"')
        return completion

