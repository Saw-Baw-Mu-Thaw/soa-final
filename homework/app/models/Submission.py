from typing import Optional
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Boolean

class Submission(SQLModel, table=True):
    __tablename__ = 'tbl_submissions'
    
    submissionId: Optional[int] = Field(primary_key=True, default=None)
    studentId: int = Field(foreign_key='tbl_students.studentId')
    homeworkId: int = Field(foreign_key='tbl_assignments.homeworkId')
    path: str = Field(default=None)
    score: Optional[float] = Field(default=None)
    isReleased: Optional[bool] = Field(default=False, sa_column=Column('released', Boolean, default=False))