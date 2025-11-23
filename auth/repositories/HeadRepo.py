from ..config import DATABASE_STRING
from ..models.Head import Head
from sqlmodel import create_engine, Session, select

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