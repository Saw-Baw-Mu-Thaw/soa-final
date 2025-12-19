from sqlmodel import SQLModel, Field

class Material(SQLModel, table=True):
    __tablename__="tbl_materials"

    materialId : int = Field(primary_key=True, default=None)
    courseId : int = Field(foreign_key='tbl_courses.courseId')
    path : str = Field(default=None)
    title : str = Field(default=None)