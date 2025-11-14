import React from "react";

/**
 * ApplicationTimeline Component
 * Hiển thị timeline trạng thái ứng tuyển
 * 
 * @param {string} status - Trạng thái hiện tại: 'pending', 'reviewing', 'interview', 'accept', 'reject'
 * @param {string} submittedAt - Ngày nộp đơn
 * @param {boolean} compact - Chế độ hiển thị gọn (cho table)
 */
const ApplicationTimeline = ({ status, submittedAt, compact = false }) => {
  // Định nghĩa các bước trong quy trình ứng tuyển (3 bước)
  const steps = [
    {
      key: "submitted",
      label: "Đã nộp",
      icon: "📝",
      description: "Hồ sơ đã được gửi thành công",
    },
    {
      key: "processing",
      label: "Đang xử lý",
      icon: "⏳",
      description: "Đơn ứng tuyển đang được xem xét",
    },
    {
      key: "result",
      label: "Kết quả",
      icon: status === "accept" ? "✅" : status === "reject" ? "❌" : "⏳",
      description:
        status === "accept"
          ? "Chúc mừng! Bạn đã được chấp nhận"
          : status === "reject"
          ? "Rất tiếc, bạn chưa phù hợp lần này"
          : "Chờ kết quả cuối cùng",
    },
  ];

  // Xác định bước hiện tại dựa trên status (chỉ 3 status: pending, accept, reject)
  const getCurrentStep = () => {
    const statusMap = {
      pending: 0, // Đã nộp - đang chờ xử lý
      accept: 2, // Đã chấp nhận
      reject: 2, // Đã từ chối
    };
    return statusMap[status] ?? 0;
  };

  const currentStep = getCurrentStep();

  // Chế độ compact cho table
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          const isRejected = status === "reject" && index === 3;

          return (
            <React.Fragment key={step.key}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? isRejected
                      ? "bg-red-500 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                } ${isCurrent ? "ring-2 ring-blue-300 ring-offset-1" : ""}`}
                title={step.label}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-4 transition-all ${
                    index < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Chế độ full (cho modal hoặc detail page)
  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            const isRejected = status === "reject" && index === 3;
            const isPassed = index < currentStep;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Icon circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold transition-all duration-300 ${
                    isActive
                      ? isRejected
                        ? "bg-red-500 text-white shadow-lg shadow-red-200"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-gray-200 text-gray-400"
                  } ${
                    isCurrent
                      ? "ring-4 ring-blue-300 ring-offset-2 scale-110"
                      : ""
                  }`}
                >
                  {isPassed ? "✓" : step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className={`text-lg font-semibold ${
                        isActive
                          ? isRejected
                            ? "text-red-600"
                            : "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full animate-pulse">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      isActive ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </p>
                  {index === 0 && submittedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(submittedAt).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      <div
        className={`mt-6 p-4 rounded-lg border-l-4 ${
          status === "accept"
            ? "bg-green-50 border-green-500"
            : status === "reject"
            ? "bg-red-50 border-red-500"
            : "bg-blue-50 border-blue-500"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            status === "accept"
              ? "text-green-800"
              : status === "reject"
              ? "text-red-800"
              : "text-blue-800"
          }`}
        >
          {status === "accept"
            ? "🎉 Chúc mừng! Hồ sơ của bạn đã được chấp nhận. Hãy chờ email hoặc cuộc gọi từ nhà tuyển dụng."
            : status === "reject"
            ? "😔 Rất tiếc, lần này bạn chưa phù hợp với vị trí này. Đừng nản lòng, hãy tiếp tục ứng tuyển các vị trí khác!"
            : "📝 Hồ sơ của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất."}
        </p>
      </div>
    </div>
  );
};

export default ApplicationTimeline;
