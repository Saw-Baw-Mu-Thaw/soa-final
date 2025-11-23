from pydantic import BaseModel, Field

class CourseCreateInput(BaseModel):
    name : str
    majorId : int = Field(gt=0)
    teacherId : int = Field(gt=0)

class CourseUpdateInput(BaseModel):
    name : str | None = None
    majorId : int | None = Field(gt=0, default=None)
    teacherId : int | None = Field(gt=0, default=None)

class EnrollmentCreateInput(BaseModel):
    studentId : int = Field(gt=0)
    courseId : int = Field(gt=0)