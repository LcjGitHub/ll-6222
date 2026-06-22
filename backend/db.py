"""SQLite 数据库初始化与 seed 数据。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "comic_fair.db"

SEED_FAIRS = [
    ("上海独立漫画市集 · 春季场", "2025-04-12", "上海"),
    ("北京 indie 漫画节", "2025-09-20", "北京"),
]

SEED_BOOTHS = [
    [
        ("A-01", "《夜行记》", "首日售出 12 本"),
        ("A-02", "《城市边缘》", "试读册发完，补货中"),
        ("B-03", "《小行星漂流》", "周边贴纸较受欢迎"),
    ],
    [
        ("C-01", "《胡同回声》", "签售排队约 20 分钟"),
        ("C-02", "《纸飞机档案》", "套装销量高于单本"),
        ("D-05", "《未命名草稿》", "仅展示，暂无现货"),
    ],
]


def get_connection() -> sqlite3.Connection:
    """获取 SQLite 连接，并启用 Row 工厂。"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """创建表结构并在空库时写入 seed 数据。"""
    conn = get_connection()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS fairs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                city TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS booths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fair_id INTEGER NOT NULL,
                booth_number TEXT NOT NULL,
                work_name TEXT NOT NULL,
                sales_notes TEXT NOT NULL DEFAULT '',
                FOREIGN KEY (fair_id) REFERENCES fairs(id) ON DELETE CASCADE
            );
            """
        )

        count = conn.execute("SELECT COUNT(*) FROM fairs").fetchone()[0]
        if count == 0:
            for fair, booths in zip(SEED_FAIRS, SEED_BOOTHS):
                cursor = conn.execute(
                    "INSERT INTO fairs (name, date, city) VALUES (?, ?, ?)",
                    fair,
                )
                fair_id = cursor.lastrowid
                conn.executemany(
                    """
                    INSERT INTO booths (fair_id, booth_number, work_name, sales_notes)
                    VALUES (?, ?, ?, ?)
                    """,
                    [(fair_id, *booth) for booth in booths],
                )

        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    """将 sqlite3.Row 转为普通 dict。"""
    return dict(row)
