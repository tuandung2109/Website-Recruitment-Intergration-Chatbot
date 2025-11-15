import React, { useState, useEffect } from "react";
import { Card, Input, Select, Button, Slider, Tabs, message } from "antd";
import {
  DollarOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "./SalaryCalculator.css";

const { Option } = Select;
const { TabPane } = Tabs;

const SalaryCalculator = () => {
  // State cho Net/Gross Calculator
  const [grossSalary, setGrossSalary] = useState(20000000);
  const [netSalary, setNetSalary] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [insuranceRegion, setInsuranceRegion] = useState("region1");

  // State cho Salary Comparison
  const [selectedIndustry, setSelectedIndustry] = useState("it");
  const [selectedLevel, setSelectedLevel] = useState("junior");
  const [experience, setExperience] = useState(2);

  // Dữ liệu mức lương trung bình theo ngành và cấp bậc (VNĐ)
  const salaryData = {
    it: {
      junior: { min: 8000000, avg: 15000000, max: 25000000 },
      middle: { min: 15000000, avg: 25000000, max: 40000000 },
      senior: { min: 30000000, avg: 45000000, max: 70000000 },
      lead: { min: 50000000, avg: 70000000, max: 100000000 },
    },
    marketing: {
      junior: { min: 7000000, avg: 12000000, max: 18000000 },
      middle: { min: 12000000, avg: 20000000, max: 30000000 },
      senior: { min: 20000000, avg: 35000000, max: 50000000 },
      lead: { min: 35000000, avg: 50000000, max: 80000000 },
    },
    design: {
      junior: { min: 7000000, avg: 13000000, max: 20000000 },
      middle: { min: 13000000, avg: 22000000, max: 35000000 },
      senior: { min: 25000000, avg: 40000000, max: 60000000 },
      lead: { min: 40000000, avg: 60000000, max: 90000000 },
    },
    finance: {
      junior: { min: 8000000, avg: 14000000, max: 22000000 },
      middle: { min: 15000000, avg: 25000000, max: 38000000 },
      senior: { min: 28000000, avg: 42000000, max: 65000000 },
      lead: { min: 45000000, avg: 65000000, max: 95000000 },
    },
    sales: {
      junior: { min: 6000000, avg: 10000000, max: 15000000 },
      middle: { min: 10000000, avg: 18000000, max: 28000000 },
      senior: { min: 18000000, avg: 30000000, max: 50000000 },
      lead: { min: 30000000, avg: 50000000, max: 85000000 },
    },
  };

  // Tính lương NET từ GROSS
  const calculateNetSalary = () => {
    const gross = parseFloat(grossSalary) || 0;

    // Bảo hiểm (10.5% BHXH + 1.5% BHYT + 1% BHTN = 13%)
    const insurance = gross * 0.105;

    // Giảm trừ gia cảnh
    const personalDeduction = 11000000; // 11 triệu/tháng
    const dependentDeduction = dependents * 4400000; // 4.4 triệu/người

    // Thu nhập tính thuế
    const taxableIncome = Math.max(
      0,
      gross - insurance - personalDeduction - dependentDeduction
    );

    // Tính thuế TNCN theo bậc thang lũy tiến
    let tax = 0;
    if (taxableIncome <= 5000000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      tax = 5000000 * 0.05 + (taxableIncome - 5000000) * 0.1;
    } else if (taxableIncome <= 18000000) {
      tax = 5000000 * 0.05 + 5000000 * 0.1 + (taxableIncome - 10000000) * 0.15;
    } else if (taxableIncome <= 32000000) {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        (taxableIncome - 18000000) * 0.2;
    } else if (taxableIncome <= 52000000) {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        (taxableIncome - 32000000) * 0.25;
    } else if (taxableIncome <= 80000000) {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        20000000 * 0.25 +
        (taxableIncome - 52000000) * 0.3;
    } else {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        20000000 * 0.25 +
        28000000 * 0.3 +
        (taxableIncome - 80000000) * 0.35;
    }

    const net = gross - insurance - tax;
    setNetSalary(Math.round(net));
  };

  useEffect(() => {
    calculateNetSalary();
  }, [grossSalary, dependents, insuranceRegion]);

  // Format tiền VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy dữ liệu lương theo ngành và cấp bậc
  const getCurrentSalaryRange = () => {
    return salaryData[selectedIndustry]?.[selectedLevel] || {
      min: 0,
      avg: 0,
      max: 0,
    };
  };

  const salaryRange = getCurrentSalaryRange();

  // Tính vị trí của lương hiện tại trên thanh slider
  const getSalaryPosition = () => {
    const { min, max } = salaryRange;
    if (grossSalary < min) return 0;
    if (grossSalary > max) return 100;
    return ((grossSalary - min) / (max - min)) * 100;
  };

  return (
    <div className="salary-calculator-container">
      <div className="salary-calculator-header">
        <h1>
          <CalculatorOutlined /> Công Cụ Tính Lương & So Sánh
        </h1>
        <p>
          Tính toán lương NET chính xác và so sánh mức lương của bạn với thị
          trường
        </p>
      </div>

      <Tabs defaultActiveKey="1" size="large" className="salary-tabs">
        {/* Tab 1: Tính lương NET */}
        <TabPane
          tab={
            <span>
              <DollarOutlined /> Tính Lương NET
            </span>
          }
          key="1"
        >
          <div className="calculator-section">
            <Card className="calculator-card">
              <h2>Thông Tin Lương</h2>

              <div className="input-group">
                <label>Lương GROSS (trước thuế)</label>
                <Input
                  size="large"
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                  placeholder="Nhập lương GROSS"
                />
                <Slider
                  min={5000000}
                  max={100000000}
                  step={1000000}
                  value={grossSalary}
                  onChange={setGrossSalary}
                  tooltip={{ formatter: (val) => formatCurrency(val) }}
                />
              </div>

              <div className="input-group">
                <label>Số người phụ thuộc</label>
                <Select
                  size="large"
                  value={dependents}
                  onChange={setDependents}
                  style={{ width: "100%" }}
                >
                  <Option value={0}>0 người</Option>
                  <Option value={1}>1 người</Option>
                  <Option value={2}>2 người</Option>
                  <Option value={3}>3 người</Option>
                  <Option value={4}>4 người</Option>
                  <Option value={5}>5 người</Option>
                </Select>
              </div>

              <div className="input-group">
                <label>Vùng đóng bảo hiểm</label>
                <Select
                  size="large"
                  value={insuranceRegion}
                  onChange={setInsuranceRegion}
                  style={{ width: "100%" }}
                >
                  <Option value="region1">Vùng 1 (Hà Nội, HCM)</Option>
                  <Option value="region2">Vùng 2 (Thành phố lớn)</Option>
                  <Option value="region3">Vùng 3 (Tỉnh thành khác)</Option>
                </Select>
              </div>
            </Card>

            <Card className="result-card">
              <h2>Kết Quả Tính Toán</h2>

              <div className="result-item highlight">
                <span className="result-label">Lương NET (thực nhận)</span>
                <span className="result-value net-salary">
                  {formatCurrency(netSalary)}
                </span>
              </div>

              <div className="breakdown">
                <h3>Chi Tiết Khấu Trừ</h3>
                <div className="result-item">
                  <span className="result-label">Lương GROSS</span>
                  <span className="result-value">
                    {formatCurrency(grossSalary)}
                  </span>
                </div>
                <div className="result-item deduction">
                  <span className="result-label">- Bảo hiểm (10.5%)</span>
                  <span className="result-value">
                    -{formatCurrency(grossSalary * 0.105)}
                  </span>
                </div>
                <div className="result-item deduction">
                  <span className="result-label">- Thuế TNCN</span>
                  <span className="result-value">
                    -{formatCurrency(grossSalary - netSalary - grossSalary * 0.105)}
                  </span>
                </div>
                <div className="result-item info">
                  <InfoCircleOutlined /> Giảm trừ gia cảnh: 11 triệu + {dependents} người phụ thuộc (
                  {formatCurrency(dependents * 4400000)})
                </div>
              </div>
            </Card>
          </div>
        </TabPane>

        {/* Tab 2: So sánh lương */}
        <TabPane
          tab={
            <span>
              <BarChartOutlined /> So Sánh Lương
            </span>
          }
          key="2"
        >
          <div className="comparison-section">
            <Card className="comparison-card">
              <h2>Thông Tin Của Bạn</h2>

              <div className="input-group">
                <label>Ngành nghề</label>
                <Select
                  size="large"
                  value={selectedIndustry}
                  onChange={setSelectedIndustry}
                  style={{ width: "100%" }}
                >
                  <Option value="it">💻 Công nghệ thông tin</Option>
                  <Option value="marketing">📢 Marketing</Option>
                  <Option value="design">🎨 Thiết kế</Option>
                  <Option value="finance">💰 Tài chính</Option>
                  <Option value="sales">🤝 Kinh doanh</Option>
                </Select>
              </div>

              <div className="input-group">
                <label>Cấp bậc</label>
                <Select
                  size="large"
                  value={selectedLevel}
                  onChange={setSelectedLevel}
                  style={{ width: "100%" }}
                >
                  <Option value="junior">Junior (0-2 năm)</Option>
                  <Option value="middle">Middle (2-5 năm)</Option>
                  <Option value="senior">Senior (5-10 năm)</Option>
                  <Option value="lead">Lead/Manager (10+ năm)</Option>
                </Select>
              </div>

              <div className="input-group">
                <label>Số năm kinh nghiệm: {experience} năm</label>
                <Slider
                  min={0}
                  max={15}
                  value={experience}
                  onChange={setExperience}
                  marks={{
                    0: "0",
                    2: "2",
                    5: "5",
                    10: "10",
                    15: "15+",
                  }}
                />
              </div>

              <div className="input-group">
                <label>Lương hiện tại của bạn</label>
                <Input
                  size="large"
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                />
              </div>
            </Card>

            <Card className="comparison-result-card">
              <h2>So Sánh Với Thị Trường</h2>

              <div className="salary-range-visual">
                <div className="range-labels">
                  <span className="range-label">Thấp nhất</span>
                  <span className="range-label">Trung bình</span>
                  <span className="range-label">Cao nhất</span>
                </div>

                <div className="range-bar">
                  <div className="range-segment low"></div>
                  <div className="range-segment mid"></div>
                  <div className="range-segment high"></div>
                  <div
                    className="your-position"
                    style={{ left: `${getSalaryPosition()}%` }}
                  >
                    <div className="position-marker">📍</div>
                    <div className="position-label">Bạn</div>
                  </div>
                </div>

                <div className="range-values">
                  <span>{formatCurrency(salaryRange.min)}</span>
                  <span>{formatCurrency(salaryRange.avg)}</span>
                  <span>{formatCurrency(salaryRange.max)}</span>
                </div>
              </div>

              <div className="comparison-stats">
                <div className="stat-item">
                  <div className="stat-label">Lương của bạn</div>
                  <div className="stat-value your-salary">
                    {formatCurrency(grossSalary)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Lương trung bình thị trường</div>
                  <div className="stat-value market-salary">
                    {formatCurrency(salaryRange.avg)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Chênh lệch</div>
                  <div
                    className={`stat-value difference ${
                      grossSalary >= salaryRange.avg ? "positive" : "negative"
                    }`}
                  >
                    {grossSalary >= salaryRange.avg ? "+" : ""}
                    {formatCurrency(grossSalary - salaryRange.avg)}
                  </div>
                </div>
              </div>

              <div className="recommendation">
                {grossSalary < salaryRange.min && (
                  <div className="alert alert-warning">
                    ⚠️ Lương của bạn thấp hơn mức thị trường. Hãy cân nhắc đàm
                    phán tăng lương hoặc tìm cơ hội mới!
                  </div>
                )}
                {grossSalary >= salaryRange.min &&
                  grossSalary < salaryRange.avg && (
                    <div className="alert alert-info">
                      💡 Lương của bạn ở mức trung bình thấp. Còn nhiều cơ hội
                      để phát triển thu nhập!
                    </div>
                  )}
                {grossSalary >= salaryRange.avg &&
                  grossSalary <= salaryRange.max && (
                    <div className="alert alert-success">
                      ✅ Tuyệt vời! Lương của bạn ngang hoặc cao hơn mức trung
                      bình thị trường.
                    </div>
                  )}
                {grossSalary > salaryRange.max && (
                  <div className="alert alert-excellent">
                    🌟 Xuất sắc! Bạn đang ở top đầu về thu nhập trong ngành!
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabPane>
      </Tabs>

      {/* Tips Section */}
      <Card className="tips-card">
        <h2>💡 Mẹo Đàm Phán Lương</h2>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-icon">🔍</span>
            <h3>Nghiên cứu thị trường</h3>
            <p>Tìm hiểu mức lương trung bình cho vị trí tương tự</p>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📊</span>
            <h3>Chứng minh giá trị</h3>
            <p>Chuẩn bị danh sách thành tích và đóng góp của bạn</p>
          </div>
          <div className="tip-item">
            <span className="tip-icon">💬</span>
            <h3>Đàm phán tự tin</h3>
            <p>Đưa ra mức lương mong muốn dựa trên dữ liệu thực tế</p>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <h3>Linh hoạt</h3>
            <p>Cân nhắc các phúc lợi khác ngoài lương cơ bản</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalaryCalculator;
