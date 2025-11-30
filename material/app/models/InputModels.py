from pydantic import BaseModel

class MaterialCreateInput(BaseModel):
    courseId : int
    title : str
    json : str

class MaterialUpdateInput(BaseModel):
    title : str | None = None
    json : str
