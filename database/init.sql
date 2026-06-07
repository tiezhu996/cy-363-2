CREATE TABLE IF NOT EXISTS operation_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_name VARCHAR(120) NOT NULL,
  owner_name VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  metric VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO operation_records (module_name, owner_name, status, metric)
VALUES ('主题房间与难度分级', '运营组', 'ready', '100%');

CREATE TABLE IF NOT EXISTS themes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  difficulty TINYINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  suggested_players INT NOT NULL,
  duration_minutes INT NOT NULL,
  description TEXT,
  poster_url VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_theme_type (type),
  INDEX idx_theme_active (is_active)
);

CREATE TABLE IF NOT EXISTS game_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  theme_id INT NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  player_count INT NOT NULL,
  completion_time_seconds INT NOT NULL,
  hint_count INT DEFAULT 0,
  escaped TINYINT(1) NOT NULL DEFAULT 1,
  record_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE,
  INDEX idx_record_theme (theme_id),
  INDEX idx_record_date (record_date),
  INDEX idx_record_escaped (escaped),
  INDEX idx_record_time (completion_time_seconds)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_id INT NOT NULL,
  player_name VARCHAR(50) NOT NULL,
  player_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES game_records(id) ON DELETE CASCADE,
  INDEX idx_member_record (record_id),
  INDEX idx_member_phone (player_phone)
);

INSERT INTO themes (name, type, difficulty, suggested_players, duration_minutes, description) VALUES
('幽灵古堡', '恐怖', 5, 6, 90, '探索一座被诅咒的中世纪古堡，解开古堡主人的死亡之谜，在亡灵苏醒前逃出生天。'),
('时光回廊', '科幻', 4, 5, 120, '穿越时空裂缝，在多个平行世界中寻找回家的路，每个决定都将影响最终结局。'),
('秘境探宝', '悬疑', 3, 4, 60, '根据古老地图寻找失落的宝藏，破解层层机关，揭开盗墓者留下的谜题。'),
('星际迷途', '科幻', 4, 6, 90, '飞船意外坠毁于未知星球，修复通讯系统发出求救信号，在氧气耗尽前逃离。'),
('血色婚礼', '恐怖', 5, 8, 120, '一场精心策划的复仇婚礼，找出隐藏在宾客中的凶手，否则将成为下一个祭品。');

INSERT INTO game_records (theme_id, team_name, player_count, completion_time_seconds, hint_count, escaped, record_date) VALUES
(1, '探险小分队', 4, 3240, 3, 1, '2026-06-01'),
(1, '勇者无敌', 6, 2880, 5, 1, '2026-06-02'),
(1, '密室达人', 5, 2700, 2, 1, '2026-06-03'),
(1, '萌新入坑', 4, 5400, 12, 0, '2026-06-04'),
(1, '速度与激情', 5, 2400, 1, 1, '2026-06-05'),
(2, '时空猎人', 5, 4800, 6, 1, '2026-06-01'),
(2, '穿越者联盟', 4, 4200, 4, 1, '2026-06-03'),
(2, '量子纠缠', 6, 5100, 8, 1, '2026-06-04'),
(3, '考古学家', 4, 2400, 2, 1, '2026-06-02'),
(3, '摸金校尉', 5, 2100, 1, 1, '2026-06-05'),
(3, '寻宝猎人', 3, 3000, 5, 1, '2026-06-06'),
(4, '银河护卫队', 6, 3600, 3, 1, '2026-06-01'),
(4, '星际旅行家', 5, 3240, 4, 1, '2026-06-03'),
(5, '侦探社', 7, 5400, 7, 1, '2026-06-02'),
(5, '真相只有一个', 8, 4800, 5, 1, '2026-06-05');

INSERT INTO team_members (record_id, player_name, player_phone) VALUES
(1, '张三', '13800138001'),
(1, '李四', '13800138002'),
(1, '王五', '13800138003'),
(1, '赵六', '13800138004'),
(2, '小明', '13900139001'),
(2, '小红', '13900139002'),
(5, '闪电侠', '13700137001'),
(5, '快银', '13700137002'),
(9, '老九', '13600136001'),
(10, '胡八一', '13500135001');
