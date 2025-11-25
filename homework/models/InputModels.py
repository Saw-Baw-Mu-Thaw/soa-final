from pydantic import BaseModel, Field
from datetime import datetime

class HomeworkCreateInput(BaseModel):
    courseId: int = Field(gt=0)
    deadline: datetime
    title: str = Field(min_length=1)
    description: str | None = None
    filetype: str | None = None

class HomeworkUpdateInput(BaseModel):
    courseId: int | None = Field(gt=0, default=None)
    deadline: datetime | None = None
    title: str | None = Field(min_length=1, default=None)
    description: str | None = None
    filetype: str | None = None

class SubmissionCreateInput(BaseModel):
    studentId: int = Field(gt=0)
    homeworkId: int = Field(gt=0)
    file: str  # This will be base64 or path