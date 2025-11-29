import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import UseTitle from "../../../hooks/useTitle";

import { listAccount } from "../../../services/account";
import { listCompanyAdmin } from "../../../services/company";
import { listJobPostingAdmin } from "../../../services/jobPosting";
import { listJobApplication } from "../../../services/jobApplication";

function AdminHome() {
  UseTitle("JobVip - Admin Home");

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    accounts: 0,
    companies: 0,
    jobPosting: 0,
    applications: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [acc, com, job, app] = await Promise.all([
          listAccount(),
          listCompanyAdmin(),
          listJobPostingAdmin(),
          listJobApplication(),
        ]);

        setOverview({
          accounts: acc?.accounts?.length || 0, // ✔ đúng
          companies: com?.companys?.length || 0, // ✔ SỬA: companys
          jobPosting: job?.jobs?.length || 0, // ✔ SỬA: jobs
          applications: app?.jobApplications?.length || 0, // ✔ SỬA: jobApplications
        });
      } catch (err) {
        console.log("Lỗi load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Typography.Title level={2} style={{ marginBottom: 20 }}>
        🔥 Bảng điều khiển Admin
      </Typography.Title>

      <Row gutter={[20, 20]}>
        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng tài khoản"
              value={overview.accounts}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng công ty"
              value={overview.companies}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng bài đăng"
              value={overview.jobPosting}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Tổng ứng tuyển"
              value={overview.applications}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default AdminHome;
