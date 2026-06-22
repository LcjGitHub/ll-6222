"""独立漫画市集备忘录 · Flask API。"""

from flask import Flask, jsonify
from flask_cors import CORS

from db import get_connection, init_db, row_to_dict

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.before_request
def ensure_db() -> None:
    """首次请求前确保数据库已初始化。"""
    if not getattr(app, "_db_ready", False):
        init_db()
        app._db_ready = True


@app.get("/api/fairs")
def list_fairs():
    """返回全部市集列表。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, name, date, city FROM fairs ORDER BY date DESC"
        ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
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


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=4000, debug=True)
