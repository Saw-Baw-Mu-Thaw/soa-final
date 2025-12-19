from pydantic import BaseModel
from datetime import datetime

class HomeworkOutput(BaseModel):
    homeworkId: int
    courseId: int
    deadline: datetime
    title: str
    description: str | None
    filetype: str | None
    maxAttempts: int | None

class HomeworkDetailOutput(BaseModel):
    homeworkId: int
    courseId: int
    deadline: datetime
    title: str
    description: str | None
    filetype: str | None
    maxAttempts: int | None
    remainingAttempt: int | None
    submission: dict | None

class SubmissionOutput(BaseModel):
    submissionId: int
    studentId: int
    homeworkId: int
    path: str
    studentName: str
    studentEmail: str
    score: float | None = None
    isReleased: bool | None = None
    attemptNumber: int | None = None