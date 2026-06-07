import { useEffect, useState } from "react";
import {
  Button,
  ConfigProvider,
  Layout,
  Typography,
  theme,
  Menu,
  Breadcrumb,
} from "antd";
import {
  ApiOutlined,
  DashboardOutlined,
  EditOutlined,
  TrophyOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse } from "./types";
import { FeatureStrip } from "./components/FeatureStrip";
import { MetricGrid } from "./components/MetricGrid";
import { OperationsTable } from "./components/OperationsTable";
import RecordEntry from "./pages/RecordEntry";
import Leaderboard from "./pages/Leaderboard";
import PlayerQuery from "./pages/PlayerQuery";
import { routes } from "./routes";

const { Header, Content, Sider } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: <Link to="/">运营总览</Link>,
  },
  {
    key: "/records",
    icon: <EditOutlined />,
    label: <Link to="/records">战绩录入</Link>,
  },
  {
    key: "/leaderboard",
    icon: <TrophyOutlined />,
    label: <Link to="/leaderboard">排行榜</Link>,
  },
  {
    key: "/player-query",
    icon: <SearchOutlined />,
    label: <Link to="/player-query">玩家查询</Link>,
  },
  {
    key: "/resources",
    icon: <AppstoreOutlined />,
    label: <Link to="/resources">资源管理</Link>,
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: <Link to="/analytics">数据分析</Link>,
  },
];

function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse>(createFallbackOverview());
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);

  useEffect(() => {
    fetchOverview()
      .then((payload) => {
        setOverview(payload);
        setNotice("后端服务已联通，当前展示实时接口数据。");
      })
      .catch(() => setNotice(REQUEST_MESSAGES.overviewFallback));
  }, []);

  return (
    <div>
      <section className="lead-grid">
        <article className="hero-panel">
          <span className="pill">{notice}</span>
          <Typography.Title level={2}>{overview.appName}</Typography.Title>
          <p>{overview.description}</p>
        </article>
        <MetricGrid items={overview.kpis} />
      </section>
      <FeatureStrip items={overview.features} />
      <section className="work-panel">
        <Typography.Title level={3}>运营任务流</Typography.Title>
        <OperationsTable records={overview.records} />
      </section>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">
        该功能正在开发中...
      </Typography.Paragraph>
    </div>
  );
}

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentRoute = routes.find((r) => r.path === location.pathname);

  return (
    <Layout className="app-shell" style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={220}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.1)",
            margin: 16,
            borderRadius: 8,
          }}
        >
          {!collapsed && (
            <>
              <span
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 18,
                  marginRight: 8,
                }}
              >
                {APP_CODE}
              </span>
              <span style={{ color: "#fff", fontSize: 14 }}>{APP_NAME}</span>
            </>
          )}
          {collapsed && <span style={{ color: "#fff", fontSize: 20 }}>密</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          className="topbar"
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px", width: 64, height: 64 }}
            />
            <Breadcrumb style={{ margin: "0 16px" }}>
              <Breadcrumb.Item>首页</Breadcrumb.Item>
              {currentRoute && (
                <Breadcrumb.Item>{currentRoute.label}</Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>
          <Button
            type="primary"
            icon={<ApiOutlined />}
            href={REQUEST_MESSAGES.healthPath}
          >
            API Health
          </Button>
        </Header>
        <Content
          className="workspace"
          style={{
            margin: "24px",
            padding: 0,
            background: "transparent",
          }}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/records" element={<RecordEntry />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/player-query" element={<PlayerQuery />} />
            <Route
              path="/resources"
              element={<PlaceholderPage title="资源管理" />}
            />
            <Route
              path="/analytics"
              element={<PlaceholderPage title="数据分析" />}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: APP_THEME.accent,
          colorText: APP_THEME.ink,
          colorBgBase: APP_THEME.paper,
          borderRadius: 8,
        },
      }}
    >
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ConfigProvider>
  );
}
