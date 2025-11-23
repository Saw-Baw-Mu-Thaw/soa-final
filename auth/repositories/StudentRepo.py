from ..config import DATABASE_STRING
from sqlmodel import Session, create_engine, select
from ..models.Student import Student

engine = create_engine(DATABASE_STRING)

def get_session():
    with Session(engine) as session:
        return session
    
def get_student(email : str):
    session = get_session()

    statement = select(Student).where(Student.email == email)
    results = session.exec(statement)
    student = results.first()

    session.close()

    return student