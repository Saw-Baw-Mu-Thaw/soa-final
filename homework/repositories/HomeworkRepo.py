from sqlmodel import Session, create_engine, select, col
from ..models.Homework import Homework
from ..models.Submission import Submission
from ..config import DATABASE_STRING
from datetime import datetime
import os
from sqlalchemy import text

engine = create_engine(DATABASE_STRING)

# Import  local models for joining
from sqlmodel import SQLModel, Field

class Student(SQLModel, table=True):
    __tablename__ = 'tbl_students'
    studentId: int = Field(primary_key=True, default=None)
    name: str = Field(default=None)
    email: str = Field(default=None, unique=True)
    password: str = Field(default=None)
    majorId: int = Field(foreign_key='tbl_majors.majorId')

class Course(SQLModel, table=True):
    __tablename__ = 'tbl_courses'
    courseId: int = Field(primary_key=True, default=None)
    name: str = Field(default=None)
    majorId: int = Field(foreign_key='tbl_majors.majorId')
    teacherId: int = Field(foreign_key='tbl_teachers.teacherId')

def get_session():
    with Session(engine) as session:
        return session

def get_homeworks_in_course(course_id: int):
    session = get_session()
    statement = select(Homework).where(Homework.courseId == course_id)
    results = session.exec(statement)
    homeworks = results.all()
    session.close()
    return homeworks

def get_homework_detail(homework_id: int, student_id: int):
    session = get_session()
    
    # Get homework
    hw_statement = select(Homework).where(Homework.homeworkId == homework_id)
    hw_result = session.exec(hw_statement)
    homework = hw_result.first()
    
    if not homework:
        session.close()
        return None
    
    # Get submissions count
    sub_statement = select(Submission).where(
        Submission.homeworkId == homework_id,
        Submission.studentId == student_id
    )
    sub_results = session.exec(sub_statement)
    submissions = sub_results.all()
    
    # Get most recent submission
    latest_submission = None
    if submissions:
        latest_submission = max(submissions, key=lambda x: x.submissionId)
    
    session.close()
    
    return {
        'homework': homework,
        'submission_count': len(submissions),
        'latest_submission': latest_submission
    }

def create_homework(courseId: int, deadline: datetime, title: str, 
                   description: str | None, filetype: str | None):
    session = get_session()
    homework = Homework(
        courseId=courseId,
        deadline=deadline,
        title=title,
        description=description,
        filetype=filetype
    )
    session.add(homework)
    session.commit()
    session.refresh(homework)
    session.close()
    return homework

def update_homework(homework_id: int, courseId: int | None, deadline: datetime | None,
                   title: str | None, description: str | None, filetype: str | None):
    session = get_session()
    statement = select(Homework).where(Homework.homeworkId == homework_id)
    result = session.exec(statement)
    homework = result.first()
    
    if not homework:
        session.close()
        return False
    
    if courseId:
        homework.courseId = courseId
    if deadline:
        homework.deadline = deadline
    if title:
        homework.title = title
    if description is not None:
        homework.description = description
    if filetype is not None:
        homework.filetype = filetype
    
    session.add(homework)
    session.commit()
    session.close()
    return True

def delete_homework(homework_id: int):
    session = get_session()

    session.exec(
        text("DELETE FROM tbl_hw_notifications WHERE homeworkId = :id").params(id=homework_id)
    )
    
    statement = select(Homework).where(Homework.homeworkId == homework_id)
    result = session.exec(statement)
    homework = result.first()
    
    if not homework:
        session.close()
        return False
    
    session.delete(homework)
    session.commit()
    session.close()
    return True

def submit_homework(student_id: int, homework_id: int, file_content: str,filename : str):
    session = get_session()
    
    # Create submission directory
    dir_path = os.path.join(os.path.dirname(__file__), '..', 'submissions', 
                           f'homework-{homework_id}')
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    
    # Count existing submissions
    sub_statement = select(Submission).where(
        Submission.homeworkId == homework_id,
        Submission.studentId == student_id
    )
    existing = session.exec(sub_statement).all()
    submission_num = len(existing) + 1

    #Get file extension
    file_ext = os.path.splitext(filename)[1]
    
    # Save file
    file_path = os.path.join(dir_path, f'student-{student_id}-v{submission_num}{file_ext}')
    with open(file_path, 'w') as f:
        f.write(file_content)
    
    #Decode base64 and write as binary
    import base64
    file_bytes = base64.b64decode(file_content)
    with open(file_path, 'wb') as f:
        f.write(file_bytes)

        
    # Create submission record
    submission = Submission(
        studentId=student_id,
        homeworkId=homework_id,
        path=file_path
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)
    session.close()
    return submission

def get_submissions_for_homework(homework_id: int):
    session = get_session()
    
    # Join with Student to get student details
    statement = select(Submission, Student).where(
        Submission.homeworkId == homework_id
    ).where(
        Submission.studentId == Student.studentId
    )
    results = session.exec(statement)
    submissions_with_students = results.all()
    session.close()
    
    # Format output
    output = []
    for submission, student in submissions_with_students:
        output.append({
            'submissionId': submission.submissionId,
            'studentId': submission.studentId,
            'homeworkId': submission.homeworkId,
            'path': submission.path,
            'studentName': student.name,
            'studentEmail': student.email
        })
    
    return output