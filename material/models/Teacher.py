from sqlmodel import SQLModel, Field

class Teacher(SQLModel, table=True):
    __tablename__ = 'tbl_teachers'
    teacherId : int = Field(primary_key=True, default=None)
    name : str = Field(default=None)
    email : str = Field(default=None)
    password : str = Field(default=None)
    facultyId : str = Field(foreign_key='tbl_faculty.facultyId')