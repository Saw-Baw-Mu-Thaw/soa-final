from ..config import DATABASE_STRING
from ..models.Teacher import Teacher
from sqlmodel import Session, create_engine, select

engine = create_engine(DATABASE_STRING)

def get_session():
    with Session(engine) as session:
        return session
    
def get_teacher(email):
    session = get_session()

    statement = select(Teacher).where(Teacher.email == email)
    results = session.exec(statement)
    teacher = results.first()

    session.close()

    return teacher