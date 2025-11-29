import os
from typing import Optional

DATABASE_STRING = os.getenv("DATABASE_STRING", "mysql+pymysql://root:@localhost:3306/lms_db?charset=utf8mb4")

DATABASE_STRING = os.getenv("DATABASE_STRING", "mysql+pymysql://root:@localhost:3306/lms_db?charset=utf8mb4")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "webfinal2005@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "quxcufvyaskpreah")