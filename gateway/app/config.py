import os

SECRET_KEY = os.getenv("SECRET_KEY", "MY_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
DATABASE_STRING = os.getenv("DATABASE_STRING", "mysql+pymysql://root:@localhost:3306/lms_db?charset=utf8mb4")

AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8001/")
COURSE_URL = os.getenv("COURSE_URL", "http://localhost:8002/")
MATERIAL_URL = os.getenv("MATERIAL_URL", "http://localhost:8003/")
HOMEWORK_URL = os.getenv("HOMEWORK_URL", "http://localhost:8004/")
NOTI_URL = os.getenv("NOTI_URL", "http://localhost:8005/")