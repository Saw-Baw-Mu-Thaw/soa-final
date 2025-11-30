from sqlmodel import SQLModel, Field

class Faculty(SQLModel, table=True):
    __tablename__="tbl_faculty"

    facultyId : int = Field(primary_key=True, default=None)
    name : str = Field(default=None)