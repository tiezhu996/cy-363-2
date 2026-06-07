import { useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Table,
  Tag,
  Modal,
  message,
  Space,
  Divider,
  List,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import {
  fetchThemes,
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../api/client";
import type { Theme, GameRecord, TeamMember } from "../types";
import { formatTime, formatDifficulty } from "../utils/format";

const { Option } = Select;
const { TextArea } = Input;

interface TeamMemberInput {
  player_name: string;
  player_phone?: string;
}

interface RecordFormData {
  theme_id: number;
  team_name: string;
  player_count: number;
  completion_hours: number;
  completion_minutes: number;
  completion_seconds: number;
  hint_count: number;
  escaped: boolean;
  record_date: Dayjs;
  notes?: string;
  team_members: TeamMemberInput[];
}

export default function RecordEntry() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GameRecord | null>(null);
  const [form] = Form.useForm<RecordFormData>();
  const [memberForm] = Form.useForm();
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<TeamMemberInput[]>([]);

  useEffect(() => {
    loadThemes();
    loadRecords();
  }, [page, pageSize]);

  const loadThemes = async () => {
    try {
      const data = await fetchThemes({ is_active: true });
      setThemes(data);
    } catch (error) {
      message.error("加载主题列表失败");
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchRecords({ page, page_size: pageSize });
      setRecords(data.records);
      setTotal(data.total);
    } catch (error) {
      message.error("加载战绩列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setCurrentMembers([]);
    form.resetFields();
    form.setFieldsValue({
      escaped: true,
      hint_count: 0,
      player_count: 4,
      completion_hours: 0,
      completion_minutes: 45,
      completion_seconds: 0,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: GameRecord) => {
    setEditingRecord(record);
    const hours = Math.floor(record.completion_time_seconds / 3600);
    const minutes = Math.floor((record.completion_time_seconds % 3600) / 60);
    const seconds = record.completion_time_seconds % 60;

    form.setFieldsValue({
      theme_id: record.theme_id,
      team_name: record.team_name,
      player_count: record.player_count,
      completion_hours: hours,
      completion_minutes: minutes,
      completion_seconds: seconds,
      hint_count: record.hint_count,
      escaped: record.escaped,
      record_date: record.record_date as any,
      notes: record.notes,
    });
    setCurrentMembers(
      record.teamMembers?.map((m) => ({
        player_name: m.player_name,
        player_phone: m.player_phone,
      })) || []
    );
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后将无法恢复，确定要删除这条战绩记录吗？",
      onOk: async () => {
        try {
          await deleteRecord(id);
          message.success("删除成功");
          loadRecords();
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const totalSeconds =
        (values.completion_hours || 0) * 3600 +
        (values.completion_minutes || 0) * 60 +
        (values.completion_seconds || 0);

      const data = {
        theme_id: values.theme_id,
        team_name: values.team_name,
        player_count: values.player_count,
        completion_time_seconds: totalSeconds,
        hint_count: values.hint_count,
        escaped: values.escaped,
        record_date: values.record_date.format("YYYY-MM-DD"),
        notes: values.notes,
        team_members: currentMembers,
      };

      if (editingRecord) {
        await updateRecord(editingRecord.id, data);
        message.success("更新成功");
      } else {
        await createRecord(data as any);
        message.success("录入成功");
      }

      setModalVisible(false);
      loadRecords();
    } catch (error) {
      message.error(editingRecord ? "更新失败" : "录入失败");
    }
  };

  const handleAddMember = () => {
    memberForm.validateFields().then((values) => {
      setCurrentMembers([...currentMembers, values]);
      memberForm.resetFields();
      setMemberModalVisible(false);
    });
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = [...currentMembers];
    newMembers.splice(index, 1);
    setCurrentMembers(newMembers);
  };

  const columns: ColumnsType<GameRecord> = [
    {
      title: "主题",
      dataIndex: ["theme", "name"],
      key: "theme",
      render: (_, record) => record.theme?.name || "-",
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
      dataIndex: "completion_time_seconds",
      key: "completion_time",
      render: (seconds: number) => formatTime(seconds),
    },
    {
      title: "提示次数",
      dataIndex: "hint_count",
      key: "hint_count",
      width: 100,
    },
    {
      title: "结果",
      dataIndex: "escaped",
      key: "escaped",
      width: 100,
      render: (escaped: boolean) => (
        <Tag color={escaped ? "success" : "error"}>
          {escaped ? "成功逃脱" : "挑战失败"}
        </Tag>
      ),
    },
    {
      title: "日期",
      dataIndex: "record_date",
      key: "record_date",
      width: 120,
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="战绩录入"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增战绩
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div>
                <p>
                  <strong>备注：</strong>
                  {record.notes || "无"}
                </p>
                {record.teamMembers && record.teamMembers.length > 0 && (
                  <div>
                    <strong>队员名单：</strong>
                    <List
                      size="small"
                      dataSource={record.teamMembers}
                      renderItem={(item) => (
                        <List.Item>
                          <UserOutlined /> {item.player_name}
                          {item.player_phone && ` (${item.player_phone})`}
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑战绩" : "新增战绩"}
        open={modalVisible}
        width={700}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingRecord ? "更新" : "录入"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="theme_id"
            label="选择主题"
            rules={[{ required: true, message: "请选择主题" }]}
          >
            <Select placeholder="请选择密室主题">
              {themes.map((theme) => (
                <Option key={theme.id} value={theme.id}>
                  {theme.name} ({theme.type} {formatDifficulty(theme.difficulty)})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="team_name"
            label="队伍名称"
            rules={[{ required: true, message: "请输入队伍名称" }]}
          >
            <Input placeholder="请输入队伍名称" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="player_count"
            label="玩家人数"
            rules={[{ required: true, message: "请输入玩家人数" }]}
          >
            <InputNumber min={1} max={20} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="通关时长" required>
            <Space>
              <Form.Item
                name="completion_hours"
                noStyle
                rules={[{ required: true, message: "请输入小时" }]}
              >
                <InputNumber min={0} max={24} addonAfter="时" />
              </Form.Item>
              <Form.Item
                name="completion_minutes"
                noStyle
                rules={[{ required: true, message: "请输入分钟" }]}
              >
                <InputNumber min={0} max={59} addonAfter="分" />
              </Form.Item>
              <Form.Item
                name="completion_seconds"
                noStyle
                rules={[{ required: true, message: "请输入秒数" }]}
              >
                <InputNumber min={0} max={59} addonAfter="秒" />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            name="hint_count"
            label="使用提示次数"
            rules={[{ required: true, message: "请输入提示次数" }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="escaped"
            label="是否成功逃脱"
            valuePropName="checked"
            rules={[{ required: true }]}
          >
            <Switch checkedChildren="成功" unCheckedChildren="失败" />
          </Form.Item>

          <Form.Item
            name="record_date"
            label="游戏日期"
            rules={[{ required: true, message: "请选择日期" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="可选：记录其他信息" />
          </Form.Item>

          <Divider />

          <Form.Item label="队员信息（可选，用于玩家扫码查询）">
            <div>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setMemberModalVisible(true)}
                style={{ width: "100%", marginBottom: 16 }}
              >
                添加队员
              </Button>
              {currentMembers.length > 0 && (
                <List
                  size="small"
                  bordered
                  dataSource={currentMembers}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleRemoveMember(index)}
                        >
                          删除
                        </Button>,
                      ]}
                    >
                      <UserOutlined /> {item.player_name}
                      {item.player_phone && ` (${item.player_phone})`}
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加队员"
        open={memberModalVisible}
        onOk={handleAddMember}
        onCancel={() => setMemberModalVisible(false)}
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item
            name="player_name"
            label="玩家姓名"
            rules={[{ required: true, message: "请输入玩家姓名" }]}
          >
            <Input placeholder="请输入玩家姓名" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="player_phone"
            label="手机号码（用于扫码查询战绩）"
            rules={[
              {
                pattern: /^1[3-9]\d{9}$/,
                message: "请输入有效的手机号码",
              },
            ]}
          >
            <Input placeholder="请输入手机号码，用于玩家查询战绩" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
