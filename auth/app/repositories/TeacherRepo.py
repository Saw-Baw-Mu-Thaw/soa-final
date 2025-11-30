from ..config import DATABASE_STRING
from ..models.Teacher import Teacher
from sqlmodel import Session, create_engine, select
from ..models.Faculty import Faculty
from ..models.OutputModels import TeacherOutput
from fastapi import HTTPException, status

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

def get_teacher_info(id):
    session = get_session()

    statement = select(Teacher, Faculty).where(Teacher.teacherId == id).where(Teacher.facultyId == Faculty.facultyId)
    result = session.exec(statement)
    joined_object = result.first()

    session.close()

    if joined_object is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher doesn't exist")    
    teacher = joined_object[0]
    faculty = joined_object[1]

    teacherOutput = TeacherOutput(teacherId=teacher.teacherId, name=teacher.name, email=teacher.email, facultyName=faculty.name)
    return teacherOutput