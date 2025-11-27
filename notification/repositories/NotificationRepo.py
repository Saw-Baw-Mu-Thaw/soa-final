from datetime import datetime
from sqlmodel import Field, SQLModel, Session, create_engine, select
from ..models.Notification import MaterialNotification, HwNotification
from ..config import DATABASE_STRING

engine = create_engine(DATABASE_STRING)
class Homework(SQLModel, table=True):
    __tablename__ = 'tbl_homeworks'
    homeworkId: int = Field(primary_key=True, default=None)
    courseId: int = Field(foreign_key='tbl_courses.courseId')
    deadline: datetime = Field(default=None)
    title: str = Field(default=None)
    description: str = Field(default=None)
    filetype: str = Field(default=None)

class Material(SQLModel, table=True):
    __tablename__ = 'tbl_materials'
    materialId: int = Field(primary_key=True, default=None)
    courseId: int = Field(foreign_key='tbl_courses.courseId')
    path: str = Field(default=None)
    title: str = Field(default=None)
    
def get_session():
    with Session(engine) as session:
        return session

def get_unseen_notifications():
    session = get_session()
    
    # Get unseen material notifications
    mat_statement = select(MaterialNotification).where(MaterialNotification.seen == False)
    mat_results = session.exec(mat_statement)
    material_notifications = mat_results.all()
    
    # Get unseen homework notifications
    hw_statement = select(HwNotification).where(HwNotification.seen == False)
    hw_results = session.exec(hw_statement)
    hw_notifications = hw_results.all()
    
    session.close()
    
    return {
        'material_notifications': material_notifications,
        'homework_notifications': hw_notifications
    }

def create_material_notification(title: str, material_id: int):
    session = get_session()
    
    notification = MaterialNotification(
        title=title,
        materialId=material_id,
        seen=False
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    session.close()
    
    # TODO: Send email notification here
    
    return notification

def create_homework_notification(title: str, homework_id: int):
    session = get_session()
    
    notification = HwNotification(
        title=title,
        homeworkId=homework_id,
        seen=False
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    session.close()
    
    # TODO: Send email notification here
    
    return notification

def mark_material_notifications_seen(notification_ids: list[int]):
    session = get_session()
    
    for nid in notification_ids:
        statement = select(MaterialNotification).where(MaterialNotification.id == nid)
        result = session.exec(statement)
        notification = result.first()
        
        if notification:
            notification.seen = True
            session.add(notification)
    
    session.commit()
    session.close()
    return True

def mark_homework_notifications_seen(notification_ids: list[int]):
    session = get_session()
    
    for nid in notification_ids:
        statement = select(HwNotification).where(HwNotification.id == nid)
        result = session.exec(statement)
        notification = result.first()
        
        if notification:
            notification.seen = True
            session.add(notification)
    
    session.commit()
    session.close()
    return True