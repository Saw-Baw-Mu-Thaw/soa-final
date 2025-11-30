from sqlmodel import SQLModel, Field

class Student(SQLModel, table=True):
    __tablename__ = 'tbl_students'
    studentId : int = Field(primary_key=True, default=None)
    name : str = Field(default=None)
    email : str = Field(default=None, unique=True)
    password : str = Field(default=None)
    majorId : int = Field(foreign_key='tbl_majors.majorId')

