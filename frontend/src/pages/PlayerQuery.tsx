import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  message,
  Empty,
  Space,
  Divider,
  Modal,
  QRCode,
} from "antd";
import {
  SearchOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  QrcodeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { fetchPlayerRank } from "../api/client";
import type { PlayerRecordWithRank } from "../types";
import {
  formatTime,
  formatDifficulty,
  getRankBadgeColor,
  getRankText,
} from "../utils/format";

export default function PlayerQuery() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<PlayerRecordWithRank[]>([]);
  const [searched, setSearched] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data = await fetchPlayerRank(values.phone);
      setRecords(data);
      setSearched(true);
      if (data.length === 0) {
        message.info("未找到该手机号的战绩记录");
      }
    } catch (error) {
      message.error("查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const successCount = records.filter((r) => r.record.escaped).length;
  const bestRank = records.length > 0 ? Math.min(...records.map((r) => r.rank)) : 0;

  const columns: ColumnsType<PlayerRecordWithRank> = [
    {
      title: "主题",
      dataIndex: ["record", "theme", "name"],
      key: "theme",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>
            {record.record.theme?.name}
          </span>
          <Space size={4}>
            <Tag color="blue">{record.record.theme?.type}</Tag>
            <span style={{ color: "#faad14" }}>
              {formatDifficulty(record.record.theme?.difficulty || 0)}
            </span>
          </Space>
        </Space>
      ),
    },
    {
      title: "队伍名称",
      dataIndex: ["record", "team_name"],
      key: "team_name",
      render: (text) => (
        <Space>
          <TeamOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "排名",
      dataIndex: "rank",
      key: "rank",
      width: 120,
      render: (rank: number, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={getRankBadgeColor(rank)} style={{ fontSize: 14 }}>
            {getRankText(rank)}
          </Tag>
          <span style={{ fontSize: 12, color: "#8c8c8c" }}>
            共 {record.total_in_theme} 支队伍
          </span>
        </Space>
      ),
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: "通关时长",
      dataIndex: ["record", "completion_time_seconds"],
      key: "completion_time",
      render: (seconds: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#52c41a" }} />
          <span style={{ fontWeight: 600 }}>{formatTime(seconds)}</span>
        </Space>
      ),
      sorter: (a, b) =>
        a.record.completion_time_seconds - b.record.completion_time_seconds,
    },
    {
      title: "提示次数",
      dataIndex: ["record", "hint_count"],
      key: "hint_count",
      render: (count: number) => (
        <span style={{ color: count === 0 ? "#52c41a" : "#fa8c16" }}>
          {count} 次
        </span>
      ),
    },
    {
      title: "结果",
      dataIndex: ["record", "escaped"],
      key: "escaped",
      render: (escaped: boolean) => (
        <Space>
          {escaped ? (
            <>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <span style={{ color: "#52c41a" }}>成功逃脱</span>
            </>
          ) : (
            <>
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              <span style={{ color: "#ff4d4f" }}>挑战失败</span>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "日期",
      dataIndex: ["record", "record_date"],
      key: "record_date",
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <SearchOutlined style={{ color: "#1890ff", fontSize: 24 }} />
            <span>玩家战绩查询</span>
          </Space>
        }
        extra={
          <Button
            icon={<QrcodeOutlined />}
            onClick={() => setQrModalVisible(true)}
          >
            查看查询二维码
          </Button>
        }
      >
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
          bordered={false}
        >
          <Row align="middle">
            <Col xs={24} md={12}>
              <div style={{ color: "#fff", padding: "24px 0" }}>
                <h2 style={{ color: "#fff", marginBottom: 8 }}>
                  扫码查询你的密室战绩
                </h2>
                <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
                  输入你在门店登记的手机号码，即可查看你的历史战绩和排名
                </p>
                <Form
                  form={form}
                  layout="inline"
                  onFinish={handleSearch}
                  style={{ flexWrap: "wrap" }}
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: "请输入手机号" },
                      {
                        pattern: /^1[3-9]\d{9}$/,
                        message: "请输入有效的手机号码",
                      },
                    ]}
                    style={{ flex: 1, minWidth: 250 }}
                  >
                    <Input
                      placeholder="请输入登记的手机号码"
                      size="large"
                      prefix={<SearchOutlined />}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={loading}
                      style={{
                        borderRadius: 8,
                        background: "#faad14",
                        borderColor: "#faad14",
                      }}
                    >
                      查询战绩
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: "center" }}>
              <TrophyOutlined
                style={{ fontSize: 120, color: "rgba(255,255,255,0.3)" }}
              />
            </Col>
          </Row>
        </Card>

        {searched && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card bordered={false} style={{ background: "#f0f5ff" }}>
                  <Statistic
                    title="总挑战次数"
                    value={records.length}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: "#f6ffed" }}>
                  <Statistic
                    title="成功逃脱"
                    value={successCount}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: "#fff7e6" }}>
                  <Statistic
                    title="最佳排名"
                    value={bestRank > 0 ? `第 ${bestRank} 名` : "-"}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">战绩明细</Divider>

            {records.length > 0 ? (
              <Table
                columns={columns}
                dataSource={records}
                rowKey={(record) => String(record.record.id)}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                }}
                rowClassName={(record) => {
                  if (record.rank === 1) return "rank-gold";
                  if (record.rank === 2) return "rank-silver";
                  if (record.rank === 3) return "rank-bronze";
                  return "";
                }}
              />
            ) : (
              <Empty description="暂无战绩记录" />
            )}
          </>
        )}
      </Card>

      <Modal
        title="玩家查询二维码"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ marginBottom: 16 }}>
            扫码即可进入玩家战绩查询页面
          </p>
          <div style={{ display: "inline-block", padding: 16, background: "#fff", borderRadius: 8 }}>
            <QRCode
              value={`${window.location.origin}/#/player-query`}
              size={200}
              bgColor="#ffffff"
              fgColor="#1890ff"
            />
          </div>
          <p style={{ marginTop: 16, color: "#8c8c8c" }}>
            玩家扫码后输入登记的手机号即可查看战绩
          </p>
        </div>
      </Modal>

      <style>{`
        .rank-gold {
          background: linear-gradient(90deg, #fff7e6 0%, transparent 100%);
        }
        .rank-silver {
          background: linear-gradient(90deg, #f5f5f5 0%, transparent 100%);
        }
        .rank-bronze {
          background: linear-gradient(90deg, #fff2e8 0%, transparent 100%);
        }
        .rank-gold td:first-child {
          border-left: 4px solid #faad14;
        }
        .rank-silver td:first-child {
          border-left: 4px solid #bfbfbf;
        }
        .rank-bronze td:first-child {
          border-left: 4px solid #d48806;
        }
      `}</style>
    </div>
  );
}
