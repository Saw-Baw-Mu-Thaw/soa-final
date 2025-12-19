from sqlmodel import SQLModel, Field

class MaterialCompletion(SQLModel, table=True):
    __tablename__="tbl_material_completions"
    
    studentId : int = Field(primary_key=True, foreign_key='tbl_students.studentId', default=None)
    materialId : int = Field(primary_key=True, foreign_key='tbl_materials.materialId', default=None)
    completed : bool = Field(default=False)