import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Tabs,
  Spin,
  message,
  Empty,
  Space,
} from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { fetchAllLeaderboards, fetchThemes } from "../api/client";
import type { ThemeLeaderboard, LeaderboardEntry, Theme } from "../types";
import {
  formatTime,
  formatDifficulty,
  getRankBadgeColor,
  getRankText,
} from "../utils/format";

const { Option } = Select;
const { TabPane } = Tabs;

export default function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState<ThemeLeaderboard[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaderboardData, themeData] = await Promise.all([
        fetchAllLeaderboards(10),
        fetchThemes({ is_active: true }),
      ]);
      setLeaderboards(leaderboardData);
      setThemes(themeData);
      if (themeData.length > 0) {
        setSelectedTheme(themeData[0].id);
      }
    } catch (error) {
      message.error("加载排行榜失败");
    } finally {
      setLoading(false);
    }
  };

  const currentLeaderboard = selectedTheme
    ? leaderboards.find((lb) => lb.theme.id === selectedTheme)
    : null;

  const columns: ColumnsType<LeaderboardEntry> = [
    {
      title: "排名",
      dataIndex: "rank",
      key: "rank",
      width: 100,
      render: (rank: number) => (
        <Tag color={getRankBadgeColor(rank)} style={{ fontSize: 14 }}>
          {getRankText(rank)}
        </Tag>
      ),
    },
    {
      title: "队伍名称",
      dataIndex: "team_name",
      key: "team_name",
    },
    {
      title: "人数",
      dataIndex: "player_count",
      key: "player_count",
      width: 80,
    },
    {
      title: "通关时长",
      dataIndex: "completion_time_display",
      key: "completion_time",
      render: (text: string, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#52c41a" }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      ),
      sorter: (a, b) => a.completion_time_seconds - b.completion_time_seconds,
    },
    {
      title: "提示次数",
      dataIndex: "hint_count",
      key: "hint_count",
      width: 100,
      render: (count: number) => (
        <span style={{ color: count === 0 ? "#52c41a" : "#fa8c16" }}>
          {count} 次
        </span>
      ),
    },
    {
      title: "游戏日期",
      dataIndex: "record_date",
      key: "record_date",
      width: 120,
    },
  ];

  const getThemeTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      恐怖: "#ff4d4f",
      悬疑: "#722ed1",
      科幻: "#1890ff",
      解谜: "#52c41a",
      情感: "#eb2f96",
    };
    return colors[type] || "#8c8c8c";
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#faad14", fontSize: 24 }} />
            <span>通关排行榜</span>
          </Space>
        }
        extra={
          <Select
            style={{ width: 250 }}
            placeholder="选择主题查看排行榜"
            value={selectedTheme}
            onChange={setSelectedTheme}
          >
            {themes.map((theme) => (
              <Option key={theme.id} value={theme.id}>
                {theme.name}
              </Option>
            ))}
          </Select>
        }
      >
        <Spin spinning={loading}>
          {currentLeaderboard ? (
            <div>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card bordered={false} style={{ background: "#f0f5ff" }}>
                    <Statistic
                      title="主题类型"
                      value={currentLeaderboard.theme.type}
                      prefix={<Tag color={getThemeTypeColor(currentLeaderboard.theme.type)} />}
                      valueStyle={{ color: getThemeTypeColor(currentLeaderboard.theme.type) }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card bordered={false} style={{ background: "#f6ffed" }}>
                    <Statistic
                      title="难度等级"
                      value={formatDifficulty(currentLeaderboard.theme.difficulty)}
                      valueStyle={{ color: "#faad14", fontSize: 18 }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card bordered={false} style={{ background: "#fff7e6" }}>
                    <Statistic
                      title="挑战总场次"
                      value={currentLeaderboard.total_records}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card bordered={false} style={{ background: "#f9f0ff" }}>
                    <Statistic
                      title="逃脱成功率"
                      value={currentLeaderboard.escape_rate}
                      suffix="%"
                      prefix={<RiseOutlined />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Card
                    bordered
                    title={
                      <Space>
                        <ClockCircleOutlined />
                        平均通关时长
                      </Space>
                    }
                  >
                    <Statistic
                      value={formatTime(currentLeaderboard.average_time)}
                      valueStyle={{ fontSize: 28, color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    bordered
                    title={
                      <Space>
                        <TrophyOutlined />
                        最快通关记录
                      </Space>
                    }
                  >
                    {currentLeaderboard.leaderboard.length > 0 ? (
                      <Statistic
                        value={
                          currentLeaderboard.leaderboard[0]
                            .completion_time_display
                        }
                        valueStyle={{ fontSize: 28, color: "#faad14" }}
                        suffix={
                          <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                            by {currentLeaderboard.leaderboard[0].team_name}
                          </span>
                        }
                      />
                    ) : (
                      <Empty description="暂无记录" />
                    )}
                  </Card>
                </Col>
              </Row>

              <Card title="历史最快通关 Top 10" bordered>
                {currentLeaderboard.leaderboard.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={currentLeaderboard.leaderboard}
                    rowKey="rank"
                    pagination={false}
                    rowClassName={(record) => {
                      if (record.rank === 1) return "rank-gold";
                      if (record.rank === 2) return "rank-silver";
                      if (record.rank === 3) return "rank-bronze";
                      return "";
                    }}
                  />
                ) : (
                  <Empty description="暂无通关记录" />
                )}
              </Card>

              <Tabs defaultActiveKey="all" style={{ marginTop: 24 }}>
                <TabPane tab="全部主题排行榜" key="all">
                  <Row gutter={[16, 16]}>
                    {leaderboards.map((lb) => (
                      <Col xs={24} sm={12} lg={8} key={lb.theme.id}>
                        <Card
                          size="small"
                          title={
                            <Space>
                              <TrophyOutlined style={{ color: "#faad14" }} />
                              {lb.theme.name}
                            </Space>
                          }
                          extra={
                            <Tag color={getThemeTypeColor(lb.theme.type)}>
                              {lb.theme.type}
                            </Tag>
                          }
                        >
                          {lb.leaderboard.length > 0 ? (
                            <div>
                              <div style={{ marginBottom: 12 }}>
                                <span style={{ color: "#8c8c8c" }}>
                                  最快记录：
                                </span>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: "#52c41a",
                                  }}
                                >
                                  {lb.leaderboard[0].completion_time_display}
                                </span>
                              </div>
                              {lb.leaderboard.slice(0, 3).map((entry) => (
                                <div
                                  key={entry.rank}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "4px 0",
                                    borderBottom: "1px dashed #f0f0f0",
                                  }}
                                >
                                  <span>
                                    <Tag color={getRankBadgeColor(entry.rank)}>
                                      #{entry.rank}
                                    </Tag>
                                    {entry.team_name}
                                  </span>
                                  <span style={{ color: "#52c41a" }}>
                                    {entry.completion_time_display}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </TabPane>
              </Tabs>
            </div>
          ) : (
            <Empty description="请先添加主题和战绩记录" />
          )}
        </Spin>
      </Card>

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
