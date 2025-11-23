from pydantic import BaseModel

class CourseStudentOutput(BaseModel):
    studentId : int
    name : str
    email : str
    majorId : int