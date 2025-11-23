from pydantic import BaseModel

class MaterialOutput(BaseModel):
    materialId : int 
    courseId : int
    title : str
    json : str