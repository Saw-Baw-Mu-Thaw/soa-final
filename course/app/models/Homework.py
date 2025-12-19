from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Homework(SQLModel, table=True):
    __tablename__ = 'tbl_assignments'
    
    homeworkId: Optional[int] = Field(primary_key=True, default=None)
    courseId: int = Field(foreign_key='tbl_courses.courseId')
    deadline: datetime = Field(default=None)
    title: str = Field(default=None)
    description: str = Field(default=None)
    filetype: str = Field(default=None)