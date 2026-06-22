"""独立漫画市集备忘录 · Flask API。"""

import re

from flask import Flask, jsonify, request
from flask_cors import CORS

from db import find_booth_by_number, get_connection, init_db, row_to_dict, update_booth_by_number

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


@app.before_request
def ensure_db() -> None:
    """首次请求前确保数据库已初始化。"""
    if not getattr(app, "_db_ready", False):
        init_db()
        app._db_ready = True


@app.get("/api/fairs/cities")
def list_cities():
    """返回所有已存在的城市（去重）。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT DISTINCT city FROM fairs ORDER BY city"
        ).fetchall()
        return jsonify([row[0] for row in rows])
    finally:
        conn.close()


@app.get("/api/fairs")
def list_fairs():
    """返回市集列表，支持按城市筛选。

    查询参数：
        city: 可选，传入时只返回该城市的市集
    """
    city = request.args.get("city", "").strip()
    conn = get_connection()
    try:
        if city:
            rows = conn.execute(
                "SELECT id, name, date, city FROM fairs WHERE city = ? ORDER BY date DESC",
                (city,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, name, date, city FROM fairs ORDER BY date DESC"
            ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@app.post("/api/fairs")
def create_fair():
    """新建市集。

    请求体：
        name: 市集名称（必填）
        date: 举办日期（必填，格式 YYYY-MM-DD）
        city: 举办城市（必填）

    返回：
        201: 创建成功，返回新建的市集记录
        400: 参数校验失败，返回字段级错误详情
    """
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    date = (body.get("date") or "").strip()
    city = (body.get("city") or "").strip()

    errors = {}
    if not name:
        errors["name"] = "市集名称不能为空"
    if not date:
        errors["date"] = "举办日期不能为空"
    elif not DATE_PATTERN.match(date):
        errors["date"] = "举办日期格式需为年年年年-月月-日日"
    if not city:
        errors["city"] = "举办城市不能为空"

    if errors:
        return jsonify({"error": "参数校验失败", "details": errors}), 400

    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO fairs (name, date, city) VALUES (?, ?, ?)",
            (name, date, city),
        )
        conn.commit()
        fair = conn.execute(
            "SELECT id, name, date, city FROM fairs WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return jsonify(row_to_dict(fair)), 201
    finally:
        conn.close()


@app.get("/api/fairs/<int:fair_id>")
def get_fair(fair_id: int):
    """返回单届市集详情及摊位列表。"""
    conn = get_connection()
    try:
        fair = conn.execute(
            "SELECT id, name, date, city FROM fairs WHERE id = ?",
            (fair_id,),
        ).fetchone()
        if fair is None:
            return jsonify({"error": "市集不存在"}), 404

        booths = conn.execute(
            """
            SELECT id, fair_id, booth_number, work_name, sales_notes
            FROM booths
            WHERE fair_id = ?
            ORDER BY booth_number
            """,
            (fair_id,),
        ).fetchall()

        payload = row_to_dict(fair)
        payload["booths"] = [row_to_dict(row) for row in booths]
        return jsonify(payload)
    finally:
        conn.close()


@app.put("/api/fairs/<int:fair_id>/booths/<path:booth_number>")
def update_booth(fair_id: int, booth_number: str):
    """按市集编号和摊位编号更新摊位信息。

    请求体：
        booth_number: 新摊位号（必填）
        work_name: 作品名（必填）
        sales_notes: 销量备注（可选）

    返回：
        200: 更新成功，返回更新后的摊位记录
        400: 参数校验失败，返回字段级错误详情
        404: 市集或摊位不存在
    """
    body = request.get_json(silent=True) or {}
    new_booth_number = (body.get("booth_number") or "").strip()
    work_name = (body.get("work_name") or "").strip()
    sales_notes = body.get("sales_notes") or ""

    errors = {}
    if not new_booth_number:
        errors["booth_number"] = "摊位号不能为空"
    if not work_name:
        errors["work_name"] = "作品名不能为空"

    if errors:
        return jsonify({"error": "参数校验失败", "details": errors}), 400

    conn = get_connection()
    try:
        fair = conn.execute(
            "SELECT id FROM fairs WHERE id = ?",
            (fair_id,),
        ).fetchone()
        if fair is None:
            return jsonify({"error": "市集不存在"}), 404

        existing = find_booth_by_number(conn, fair_id, booth_number)
        if existing is None:
            return jsonify({"error": "摊位不存在"}), 404

        updated = update_booth_by_number(
            conn,
            fair_id,
            booth_number,
            new_booth_number,
            work_name,
            sales_notes,
        )
        if not updated:
            return jsonify({"error": "摊位不存在"}), 404
        conn.commit()

        booth = find_booth_by_number(conn, fair_id, new_booth_number)
        if booth is None:
            booth = conn.execute(
                """
                SELECT id, fair_id, booth_number, work_name, sales_notes
                FROM booths
                WHERE id = ?
                """,
                (existing["id"],),
            ).fetchone()
        return jsonify(row_to_dict(booth))
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=4000, debug=True)
