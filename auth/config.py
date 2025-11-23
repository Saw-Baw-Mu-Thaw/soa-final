import os

SECRET_KEY = os.getenv("SECRET_KEY", "MY_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
DATABASE_STRING = os.getenv("DATABASE_STRING", "mysql+pymysql://root:@localhost:3306/lms_db?charset=utf8mb4")