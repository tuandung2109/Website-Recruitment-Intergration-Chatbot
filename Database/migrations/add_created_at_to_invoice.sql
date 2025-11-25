-- Migration: Thêm cột create_at vào bảng invoice
-- LƯU Ý: Database đã có cột create_at rồi, không cần chạy migration này!
-- File này chỉ để tham khảo

-- Nếu chưa có cột create_at, chạy lệnh này:
-- ALTER TABLE invoice 
-- ADD COLUMN create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Kiểm tra xem cột đã tồn tại chưa:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoice' AND column_name = 'create_at';
