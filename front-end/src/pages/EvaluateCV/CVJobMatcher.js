import React, { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  X,
  Edit3,
} from "lucide-react";
import CVJobMatcherResult from "./CVJobMatcherResult";
import "./CVJobMatcher.css";
import { updateAccountMoney } from "../../services/account";

const CVJobMatcher = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Result
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [inputMethod, setInputMethod] = useState("paste"); // 'paste' or 'search'
  const [isScanning, setIsScanning] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCostNotice, setShowCostNotice] = useState(true);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [pendingScan, setPendingScan] = useState(false);
  const [deductLoading, setDeductLoading] = useState(false);

  useEffect(() => {
    if (showCostNotice) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [showCostNotice]);

  useEffect(() => {
    if (isCostModalOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isCostModalOpen]);

  const handleDismissCostNotice = () => {
    setShowCostNotice(false);
    document.body.style.overflow = "";
  };

  const handleCancelCostNotice = () => {
    document.body.style.overflow = "";
    setShowCostNotice(false);
    window.history.length > 1
      ? window.history.back()
      : window.location.assign("/");
  };

  const handleCostModalCancel = () => {
    setIsCostModalOpen(false);
    setPendingScan(false);
  };

  const handleCostConfirm = async () => {
    if (!pendingScan) {
      setIsCostModalOpen(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("account"));
    if (!user || !user.account_id) {
      alert("Vui lòng đăng nhập trước khi sử dụng tính năng này.");
      setIsCostModalOpen(false);
      setPendingScan(false);
      return;
    }

    if (deductLoading) return;

    try {
      setDeductLoading(true);
      const result = await updateAccountMoney({
        account_id: user.account_id,
        deductAmount: 1000,
      });

      if (!result?.success) {
        alert(result?.message || "Không thể trừ số dư. Vui lòng thử lại.");
        return;
      }

      const updatedAccount = {
        ...user,
        amount: result.account?.amount ?? (user.amount || 0) - 1000,
      };
      localStorage.setItem("account", JSON.stringify(updatedAccount));

      setIsCostModalOpen(false);
      setPendingScan(false);
      await executeScan();
    } catch (error) {
      console.error("Error deducting balance:", error);
      alert(error.message || "Không thể trừ số dư.");
    } finally {
      setDeductLoading(false);
    }
  };

  // Handle CV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      if (file.size <= 5 * 1024 * 1024) {
        // 5MB limit
        setCvFile(file);
      } else {
        alert("File size must be less than 5MB");
      }
    } else {
      alert("Please upload a valid CV file (.pdf, .doc, .docx)");
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        if (file.size <= 5 * 1024 * 1024) {
          setCvFile(file);
        } else {
          alert("File size must be less than 5MB");
        }
      } else {
        alert("Please upload a valid CV file (.pdf, .doc, .docx)");
      }
    }
  };

  // Remove uploaded CV
  const handleRemoveFile = () => {
    setCvFile(null);
  };

  const executeScan = async () => {
    if (!cvFile || !jobDescription.trim()) {
      alert("Please upload your CV and add a job description");
      return;
    }

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("cv_file", cvFile);
      formData.append("job_description", jobDescription);
      formData.append("job_title", "Job Position");

      const response = await fetch(
        "http://localhost:5000/api/evaluate/cv-jd-match",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setEvaluationData(result);
        setStep(2);
      } else {
        alert(`Error: ${result.error || "Failed to evaluate CV"}`);
      }
    } catch (error) {
      console.error("Error calling API:", error);
      alert(`Failed to connect to the server: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Start scanning process
  const handleStartScanning = () => {
    if (!cvFile || !jobDescription.trim()) {
      alert("Please upload your CV and add a job description");
      return;
    }

    if (isScanning || deductLoading) {
      return;
    }

    setPendingScan(true);
    setIsCostModalOpen(true);
  };

  // Reset and start new scan
  const handleNewScan = () => {
    setStep(1);
    setCvFile(null);
    setJobDescription("");
    setEvaluationData(null);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (step === 2 && evaluationData) {
    return (
      <CVJobMatcherResult
        data={evaluationData}
        onNewScan={handleNewScan}
        cvFileName={cvFile?.name}
        jobTitle={
          evaluationData.job_title ||
          evaluationData.jobInfo?.title ||
          "Kết quả đánh giá AI"
        }
      />
    );
  }

  return (
    <div className="cv-job-matcher">
      {showCostNotice && (
        <div className="cost-warning-backdrop" role="dialog" aria-modal="true">
          <div className="cost-warning-modal">
            <div className="cost-warning-icon">
              <AlertCircle size={32} />
            </div>
            <h3>Trừ phí sử dụng CV Matcher</h3>
            <p>
              Mỗi lượt phân tích CV sẽ trừ <strong>1.000đ</strong> trực tiếp từ
              số dư tài khoản của bạn. Vui lòng xác nhận trước khi tiếp tục sử
              dụng tính năng này.
            </p>
            <div className="cost-warning-actions">
              <button
                type="button"
                className="outline"
                onClick={handleCancelCostNotice}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleDismissCostNotice}
              >
                Tôi đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
      {isCostModalOpen && (
        <div className="cost-warning-backdrop" role="dialog" aria-modal="true">
          <div className="cost-warning-modal">
            <div className="cost-warning-icon">
              <AlertCircle size={32} />
            </div>
            <h3>Xác nhận trừ phí trước khi quét CV</h3>
            <p>
              Mỗi lượt phân tích CV sẽ trừ <strong>1.000đ</strong> trực tiếp từ
              số dư tài khoản của bạn. Vui lòng xác nhận để tiếp tục.
            </p>
            <div className="cost-warning-actions">
              <button
                type="button"
                className="outline"
                onClick={handleCostModalCancel}
                disabled={deductLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleCostConfirm}
                disabled={deductLoading}
              >
                {deductLoading ? "Đang xử lý..." : "Tôi đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="matcher-header">
        <div className="header-content">
          <div className="header-icon">
            <FileText size={32} />
          </div>
          <div className="header-text">
            <h1>Secure Your Interview Chances With a Tailored Resume</h1>
            <p>
              Turn applications into interviews with personalized suggestions,
              ATS scoring and matching cover letters.
            </p>
          </div>
        </div>
      </div>

      <div className="matcher-container">
        <div className="upload-section">
          <div className="section-header">
            <div className="step-number">1</div>
            <h2>
              Upload Your Resume<span className="required">*</span>
            </h2>
          </div>

          {!cvFile ? (
            <div
              className={`upload-area ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className="upload-icon" />
              <h3>Upload File</h3>
              <p className="upload-hint">
                Supported formats: .pdf, .doc, .docx. Max size: 5 MB.
              </p>
              <p className="upload-hint">All languages supported.</p>
              <input
                type="file"
                id="cv-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="cv-upload" className="upload-button">
                <Upload size={20} />
                Choose File
              </label>
            </div>
          ) : (
            <div className="file-uploaded">
              <div className="file-info">
                <div className="file-icon">
                  <FileText size={24} />
                </div>
                <div className="file-details">
                  <h4>{cvFile.name}</h4>
                  <p>{formatFileSize(cvFile.size)}</p>
                </div>
              </div>
              <button className="remove-file" onClick={handleRemoveFile}>
                <X size={20} />
              </button>
            </div>
          )}

          <div className="info-banner">
            <AlertCircle size={20} />
            <span>Supported formats: .pdf, .doc, .docx. Max size: 5 MB.</span>
          </div>
          <div className="info-banner success">
            <CheckCircle size={20} />
            <span>All languages supported.</span>
          </div>
        </div>

        <div className="job-description-section">
          <div className="section-header">
            <div className="step-number">2</div>
            <h2>
              Add a Job Description<span className="required">*</span>
            </h2>
          </div>

          <div className="input-method-tabs">
            <button
              className={`tab ${inputMethod === "paste" ? "active" : ""}`}
              onClick={() => setInputMethod("paste")}
            >
              <Edit3 size={20} />
              Paste Text
            </button>
            <button
              className={`tab ${inputMethod === "search" ? "active" : ""}`}
              onClick={() => setInputMethod("search")}
            >
              <FileText size={20} />
              Search Jobs on Cake
            </button>
          </div>

          {inputMethod === "paste" ? (
            <div className="paste-area">
              <textarea
                placeholder="Mô tả công việc&#10;&#10;Sử dụng Unity để phát triển sản phẩm Mobile Game, phát hành thị trường quốc tế trên nền tảng Google Play, Apple Store&#10;&#10;Kết hợp với các bộ phận như Artist, Product Owner để sản xuất các game mobile chất lượng và hữu ích đến người dùng&#10;&#10;Điều chỉnh Game sao cho phù hợp với thị trường quốc tế...&#10;&#10;Yêu cầu công việc&#10;&#10;• Có ít nhất 3 năm kinh nghiệm phát triển game mobile bằng Unity&#10;• Thành thạo C#, có kinh nghiệm với Unity Engine&#10;• Có kiến thức tốt về lập trình hướng đối tượng và design patterns&#10;• Có khả năng làm việc độc lập và theo nhóm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
              />
            </div>
          ) : (
            <div className="search-area">
              <div className="search-placeholder">
                <FileText size={48} />
                <p>Search for jobs on Cake platform</p>
                <button className="search-button">Browse Jobs</button>
              </div>
            </div>
          )}
        </div>

        <div className="action-section">
          <button
            className={`scan-button ${
              !cvFile || !jobDescription.trim() ? "disabled" : ""
            } ${isScanning || deductLoading ? "scanning" : ""}`}
            onClick={handleStartScanning}
            disabled={
              !cvFile || !jobDescription.trim() || isScanning || deductLoading
            }
          >
            {isScanning || deductLoading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Start Scanning
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVJobMatcher;
