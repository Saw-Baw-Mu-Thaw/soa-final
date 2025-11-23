from pydantic import BaseModel, Field

class CreateCourseInput(BaseModel):
    name : str = Field(min_length=1)
    majorId : int = Field(gt=0)
    teacherId : int = Field(gt=0)

class UpdateCouresInput(BaseModel):
    name : str | None = Field(min_length=1, default=None)
    majorId : int | None = Field(gt=0, default=None)
    teacherId : int | None = Field(gt=0, default=None)

class EnrollStudentInput(BaseModel):
    studentId : int = Field(gt=0)
    courseId : int = Field(gt=0)

class CreateMaterialInput(BaseModel):
    courseId : int = Field(gt=0)
    title : str = Field(min_length=1)
    json : str = Field(min_length=1)

class UpdateMaterialInput(BaseModel):
    title : str | None = Field(default=None, min_length=1)
    json : str = Field(min_length=1)