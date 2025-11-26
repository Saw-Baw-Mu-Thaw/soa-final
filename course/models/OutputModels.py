from pydantic import BaseModel

class CourseStudentOutput(BaseModel):
    studentId : int
    name : str
    email : str
    majorId : int
    enrollmentId : int
    courseId : int

class CourseOutput(BaseModel):
    courseId : int
    name : str
    teacherName : str

class CourseHeadOutput(BaseModel):
    courseId : int
    name : str
    teacherName : str
    major : str
    teacherId : int
    majorId : int

class TeacherOutput(BaseModel):
    teacherId : int
    name : str
    email : str
    
class StudentOutput(BaseModel):
    studentId : int
    name : str
    email : str