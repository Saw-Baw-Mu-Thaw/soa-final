from sqlmodel import SQLModel, Field

class MaterialNotification(SQLModel, table=True):
    __tablename__ = 'tbl_material_notifications'
    
    id: int = Field(primary_key=True, default=None)
    materialId: int = Field(foreign_key='tbl_materials.materialId')
    title: str = Field(default=None)
    seen: bool = Field(default=False)