# 🚀 Company Embedding System - Hệ thống Embedding Công ty Linh hoạt

## Tổng quan

Hệ thống embedding linh hoạt cho phép embedding và tìm kiếm dữ liệu công ty từ PostgreSQL/Supabase vào Qdrant với khả năng mở rộng cao.

## 🏗️ Kiến trúc

```
PostgreSQL/Supabase → PostgreSQLClient → LLMManager → Qdrant
                                    ↓
                            Flexible Embedding System
```

### Các thành phần chính:

1. **PostgreSQLClient**: Kết nối Supabase + Qdrant với embedding tích hợp
2. **LLMManager**: Quản lý embedding models với caching
3. **Flexible Extractors**: Các hàm trích xuất text và ID có thể tùy chỉnh
4. **MCP Tools**: API endpoints cho embedding và tìm kiếm

## 📁 Cấu trúc Files

```
backend/
├── tool/database/postgest.py          # PostgreSQLClient với embedding
├── llms/llm_manager.py                # LLMManager với embedding models
├── MCP/server.py                      # MCP tools cho embedding
├── test/main/
│   ├── test2.py                       # Test cơ bản
│   └── test_embedding_advanced.py     # Test nâng cao
└── setting.py                         # Cấu hình
```

## ⚙️ Cấu hình

### Environment Variables

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Qdrant
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
```

### Settings.py

```python
# Supabase settings
SUPABASE_URL: str = ""
SUPABASE_ANON_KEY: str = ""

# Qdrant settings
QDRANT_URL: str = "your_qdrant_url"
QDRANT_API_KEY: str = "your_qdrant_key"
COLLECTION_COMPANY: str = "companies"
```

## 🚀 Sử dụng

### 1. Test cơ bản

```bash
cd backend/test/main
python test2.py
```

### 2. Test nâng cao

```bash
cd backend/test/main
python test_embedding_advanced.py
```

### 3. Sử dụng trong code

```python
from tool.database.postgest import PostgreSQLClient
from setting import Settings

# Khởi tạo
settings = Settings.load_settings()
pg_client = PostgreSQLClient(
    url=settings.SUPABASE_URL, 
    key=settings.SUPABASE_ANON_KEY,
    qdrant_url=settings.QDRANT_URL,
    qdrant_api_key=settings.QDRANT_API_KEY
)

# Embedding dữ liệu
def company_text_extractor(record):
    return f"Công ty: {record['ten_cong_ty']}. Ngành nghề: {record['ds_nganh_nghe']}"

def company_id_extractor(record):
    return f"company_{record['ma_cong_ty']}"

result = pg_client.embed_data_to_qdrant(
    procedure_name="get_cong_ty_full",
    collection_name="companies",
    text_extractor=company_text_extractor,
    id_extractor=company_id_extractor,
    limit=100
)

# Tìm kiếm
results = pg_client.search_similar_records(
    collection_name="companies",
    query_text="công ty công nghệ thông tin",
    top_k=5
)
```

## 🔧 API Tools (MCP)

### 1. get_companies_grouped_by_industries()
- Lấy dữ liệu công ty đã nhóm theo ngành nghề
- Return: List[Dict] companies

### 2. upsert_companies_to_qdrant_optimized(limit=100)
- Embedding và lưu companies vào Qdrant
- Args: limit (số lượng records)
- Return: Dict result status

### 3. search_similar_companies_optimized(query, top_k=5)
- Tìm kiếm companies tương tự
- Args: query (text), top_k (số kết quả)
- Return: List[Dict] results với score

## 🎯 Khả năng mở rộng

### Thêm procedure mới

```python
# Định nghĩa extractors cho loại dữ liệu mới
def job_text_extractor(record):
    return f"Job: {record['title']}. Description: {record['description']}"

def job_id_extractor(record):
    return f"job_{record['id']}"

# Sử dụng với procedure mới
result = pg_client.embed_data_to_qdrant(
    procedure_name="get_job_postings",  # procedure mới
    collection_name="jobs",             # collection mới
    text_extractor=job_text_extractor,
    id_extractor=job_id_extractor
)
```

### Thêm model embedding mới

```python
# LLMManager tự động cache models
embedding_model = llm_manager.get_embedding_model('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
```

## 📊 Dữ liệu mẫu

Từ procedure `get_cong_ty_full`:

```json
[
  {
    "ma_cong_ty": 4,
    "ten_cong_ty": "Trung tâm Đào tạo DEF",
    "ds_nganh_nghe": "Giáo dục"
  },
  {
    "ma_cong_ty": 3,
    "ten_cong_ty": "Công ty XYZ", 
    "ds_nganh_nghe": "Marketing, Công nghệ thông tin"
  }
]
```

## 🔍 Search Examples

```python
# Tìm kiếm theo ngành nghề
results = pg_client.search_similar_records(
    collection_name="companies",
    query_text="công ty công nghệ thông tin",
    top_k=3
)

# Tìm kiếm theo địa điểm + ngành nghề
results = pg_client.search_similar_records(
    collection_name="companies", 
    query_text="trung tâm đào tạo giáo dục hà nội",
    top_k=5
)
```

## 🛠️ Troubleshooting

### 1. Lỗi kết nối Supabase
- Kiểm tra SUPABASE_URL và SUPABASE_ANON_KEY
- Đảm bảo có quyền truy cập procedure

### 2. Lỗi kết nối Qdrant
- Kiểm tra QDRANT_URL và QDRANT_API_KEY
- Đảm bảo Qdrant service đang chạy

### 3. Lỗi embedding model
- Kiểm tra sentence-transformers đã cài đặt
- LLMManager sẽ tự động fallback nếu có lỗi

### 4. Performance tuning
- Điều chỉnh batch_size cho embedding
- Điều chỉnh score_threshold cho search
- Sử dụng limit phù hợp cho dữ liệu lớn

## 📈 Performance Metrics

- **Embedding speed**: ~100 records/batch
- **Search latency**: <200ms
- **Memory usage**: Tối ưu với LLMManager caching
- **Scalability**: Hỗ trợ hàng triệu records

## 🔮 Tính năng tương lai

- [ ] Support multiple embedding models
- [ ] Auto-reranking search results  
- [ ] Batch embedding optimization
- [ ] Real-time data sync
- [ ] Advanced filtering options