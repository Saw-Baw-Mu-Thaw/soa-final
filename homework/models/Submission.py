from typing import Optional
from sqlmodel import SQLModel, Field

class Submission(SQLModel, table=True):
    __tablename__ = 'tbl_submissions'
    
    submissionId: Optional[int] = Field(primary_key=True, default=None)
    studentId: int = Field(foreign_key='tbl_students.studentId')
    homeworkId: int = Field(foreign_key='tbl_homeworks.homeworkId')
    path: str = Field(default=None)