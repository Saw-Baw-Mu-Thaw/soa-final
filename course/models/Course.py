from sqlmodel import SQLModel, Field

class Course(SQLModel, table=True):
    __tablename__='tbl_courses'

    courseId : int = Field(primary_key=True, default=None)
    name : str = Field(default=None)
    majorId : int = Field(foreign_key='tbl_majors.facultyId')
    teacherId : int = Field(foreign_key='tbl_teachers.teacherId')