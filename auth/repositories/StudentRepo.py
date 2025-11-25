from ..config import DATABASE_STRING
from sqlmodel import Session, create_engine, select
from ..models.Student import Student
from ..models.Major import Major
from ..models.OutputModels import StudentOutput
from fastapi import HTTPException, status

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

def get_student_info(id : int):
    session = get_session()

    statement = select(Student, Major).where(Student.studentId == id).where(Student.majorId == Major.majorId)
    result = session.exec(statement)
    joined_obj = result.first()

    session.close()

    if joined_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student doesn't exist")
    student, major = joined_obj

    return StudentOutput(studentId=student.studentId, name=student.name, email=student.email, majorName=major.name)