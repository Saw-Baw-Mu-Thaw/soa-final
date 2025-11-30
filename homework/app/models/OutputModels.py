from pydantic import BaseModel
from datetime import datetime

class HomeworkOutput(BaseModel):
    homeworkId: int
    courseId: int
    deadline: datetime
    title: str
    description: str | None
    filetype: str | None

class HomeworkDetailOutput(BaseModel):
    homeworkId: int
    courseId: int
    deadline: datetime
    title: str
    description: str | None
    filetype: str | None
    remainingAttempt: int | None
    submission: dict | None

class SubmissionOutput(BaseModel):
    submissionId: int
    studentId: int
    homeworkId: int
    path: str
    studentName: str
    studentEmail: str