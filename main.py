from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
import uuid

from database import get_db

app = FastAPI()

# ✅ CORS (Dev mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Password hashing
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


@app.get("/ping")
def ping():
    return {"ok": True, "file": __file__}


# ---------- Models ----------
class SignupIn(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class CreateOrderIn(BaseModel):
    user_id: int
    event_id: int
    ticket_type: str
    qty: int


class PaymentInitIn(BaseModel):
    order_id: int
    provider: str


# ---------- Helpers ----------
def norm_email(e: str) -> str:
    return (e or "").strip().lower()


# ---------- Auth ----------
@app.post("/signup")
def signup(data: SignupIn, db: Session = Depends(get_db)):
    email = norm_email(str(data.email))

    # check existing
    exists = db.execute(
        text("SELECT id FROM users WHERE email=:e"),
        {"e": email},
    ).fetchone()

    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")

    # hash password
    phash = pwd.hash(data.password)

    db.execute(
        text("""
            INSERT INTO users (full_name, email, password_hash)
            VALUES (:n, :e, :p)
        """),
        {"n": data.full_name.strip(), "e": email, "p": phash},
    )
    db.commit()

    return {"ok": True, "message": "Account created", "email": email}


@app.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    email = norm_email(str(data.email))

    row = db.execute(
        text("""
            SELECT id, full_name, password_hash
            FROM users
            WHERE email=:e
            LIMIT 1
        """),
        {"e": email},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # ✅ Handle bad/old hashes safely
    try:
        ok = pwd.verify(data.password, row.password_hash)
    except Exception:
        ok = False

    if not ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "ok": True,
        "user_id": row.id,
        "full_name": row.full_name,
        "email": email,  # ✅ for avatar
    }


# ---------- Orders ----------
@app.post("/create-order")
def create_order(data: CreateOrderIn, db: Session = Depends(get_db)):
    tt = db.execute(
        text("""
            SELECT id, price_usd
            FROM ticket_types
            WHERE event_id=:eid AND name=:name AND is_active=1
            LIMIT 1
        """),
        {"eid": data.event_id, "name": data.ticket_type},
    ).fetchone()

    if not tt:
        raise HTTPException(status_code=404, detail="Ticket type not found")

    qty = max(1, int(data.qty))
    unit = float(tt.price_usd)
    total = unit * qty

    order_no = "JC-" + uuid.uuid4().hex[:10].upper()

    db.execute(
        text("""
            INSERT INTO orders (user_id, event_id, order_no, subtotal, total, status)
            VALUES (:uid, :eid, :ono, :sub, :tot, 'pending')
        """),
        {"uid": data.user_id, "eid": data.event_id, "ono": order_no, "sub": total, "tot": total},
    )

    # MySQL specific
    order_id = db.execute(text("SELECT LAST_INSERT_ID() AS id")).fetchone().id

    db.execute(
        text("""
            INSERT INTO order_items (order_id, ticket_type_id, unit_price, qty, line_total)
            VALUES (:oid, :ttid, :up, :q, :lt)
        """),
        {"oid": order_id, "ttid": tt.id, "up": unit, "q": qty, "lt": total},
    )

    db.commit()
    return {"ok": True, "order_id": order_id, "order_no": order_no, "total": total}


# ---------- Payments ----------
@app.post("/payments")
def payments_init(data: PaymentInitIn, db: Session = Depends(get_db)):
    order = db.execute(
        text("SELECT id, total, currency, status FROM orders WHERE id=:id LIMIT 1"),
        {"id": data.order_id},
    ).fetchone()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.execute(
        text("""
            INSERT INTO payments (order_id, provider, amount, currency, status)
            VALUES (:oid, :prov, :amt, :cur, 'initiated')
        """),
        {"oid": order.id, "prov": data.provider, "amt": float(order.total), "cur": order.currency},
    )

    db.commit()
    return {"ok": True, "message": "Payment record created", "order_id": order.id}


# ---------- Debug (DEV ONLY) ----------
@app.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, full_name, email FROM users ORDER BY id DESC LIMIT 10")
    ).fetchall()
    return [{"id": r.id, "full_name": r.full_name, "email": r.email} for r in rows]


@app.get("/debug/reset-users")
def debug_reset_users(db: Session = Depends(get_db)):
    # ⚠️ DEV ONLY: clears users so you can re-signup cleanly
    db.execute(text("DELETE FROM users"))
    db.commit()
    return {"ok": True, "message": "All users deleted (dev reset)"}


@app.get("/debug/user-hash")
def debug_user_hash(email: str, db: Session = Depends(get_db)):
    e = norm_email(email)
    row = db.execute(
        text("SELECT email, password_hash FROM users WHERE email=:e LIMIT 1"),
        {"e": e},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    # helps you see if hash looks like bcrypt ($2b$...)
    return {"email": row.email, "password_hash": row.password_hash}

    from sqlalchemy import text
from database import engine

@app.get("/db-test")
def db_test():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        return {"db": "connected", "result": list(result)}

@app.get("/")
def home():
    return {"status": "Jongwe Platform API Running"}
