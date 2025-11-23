from sqlmodel import SQLModel, Field

class Enrollment(SQLModel, table=True):
    __tablename__="tbl_enrollments"

    enrollmentId : int = Field(primary_key=True, default=None)
    studentId : int = Field(foreign_key='tbl_students.studentId')
    courseId : int = Field(foreign_key='tbl_courses.courseId')