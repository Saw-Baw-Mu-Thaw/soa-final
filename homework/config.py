import os

DATABASE_STRING = os.getenv("DATABASE_STRING", "mysql+pymysql://root:@localhost:3306/lms_db?charset=utf8mb4")

NOTI_URL = os.getenv("NOTI_URL", "http://localhost:8005/")