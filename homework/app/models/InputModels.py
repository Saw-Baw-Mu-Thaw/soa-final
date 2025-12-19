from pydantic import BaseModel, Field
from datetime import datetime

class HomeworkCreateInput(BaseModel):
    courseId: int = Field(gt=0)
    deadline: datetime
    title: str = Field(min_length=1)
    description: str | None = None
    filetype: str | None = None
    maxAttempts: int | None = Field(default=None, gt=0, description="Maximum submission attempts allowed. None = unlimited")

class HomeworkUpdateInput(BaseModel):
    courseId: int | None = Field(gt=0, default=None)
    deadline: datetime | None = None
    title: str | None = Field(min_length=1, default=None)
    description: str | None = None
    filetype: str | None = None
    maxAttempts: int | None = Field(default=None, gt=0, description="Maximum submission attempts allowed. None = unlimited")

class GradeSubmissionInput(BaseModel):
    score: float = Field(ge=0, description="Score/grade for the submission (must be >= 0)")
    isReleased: bool = Field(default=False, description="Whether to release the grade to the student immediately")

class SubmissionCreateInput(BaseModel):
    studentId: int = Field(gt=0)
    file: str  
    filename : str = Field(min_length=1)