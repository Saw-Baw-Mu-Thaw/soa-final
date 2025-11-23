from sqlmodel import SQLModel, Field

class Head(SQLModel, table=True):
    __tablename__ = 'tbl_faculty_head'
    id : int = Field(default=None, primary_key=True)
    facultyId : int = Field(foreign_key='tbl_faculty.facultyId')
    name : str = Field(default=None)
    email : str = Field(default=None, unique=True)
    password : str = Field(default=None)
