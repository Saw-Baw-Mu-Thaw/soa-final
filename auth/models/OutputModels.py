from pydantic import BaseModel

class StudentOutput(BaseModel):
    studentId : int
    name : str
    email : str
    majorName : str

class TeacherOutput(BaseModel):
    teacherId : int
    name : str
    email : str
    facultyName : str

class HeadOutput(BaseModel):
    id : int
    facultyName  : str
    name : str
    email : str