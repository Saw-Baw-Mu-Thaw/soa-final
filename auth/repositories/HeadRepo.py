from ..config import DATABASE_STRING
from ..models.Head import Head
from sqlmodel import create_engine, Session, select
from ..models.Faculty import Faculty
from ..models.OutputModels import HeadOutput
from fastapi import HTTPException, status

engine = create_engine(DATABASE_STRING)

def get_session():
    with Session(engine) as session:
        return session
    
def get_head(email : str):
    session = get_session()

    statement = select(Head).where(Head.email == email)
    results = session.exec(statement)
    head = results.first()

    return head

def get_head_info(id : int):
    session = get_session()

    statement = select(Head, Faculty).where(Head.id == id).where(Head.facultyId == Faculty.facultyId)
    result = session.exec(statement)
    joined_obj = result.first()

    if joined_obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Faculty Head doesn\'t exist')
    head, faculty = joined_obj
    return HeadOutput(id=head.id, name=head.name, email=head.email, facultyName=faculty.name)