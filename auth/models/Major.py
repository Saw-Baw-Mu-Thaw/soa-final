from sqlmodel import SQLModel, Field

class Major(SQLModel, table=True):
    __tablename__="tbl_majors"

    majorId : int = Field(primary_key=True, default=None)
    name : str = Field()
    facultyId : str = Field(foreign_key='tbl_faculty.facultyId')