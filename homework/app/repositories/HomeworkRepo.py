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
                   description: str | None, filetype: str | None, maxAttempts: int | None = None):
    session = get_session()
    homework = Homework(
        courseId=courseId,
        deadline=deadline,
        title=title,
        description=description,
        filetype=filetype,
        maxAttempts=maxAttempts
    )
    session.add(homework)
    session.commit()
    session.refresh(homework)
    session.close()
    return homework

def update_homework(homework_id: int, courseId: int | None, deadline: datetime | None,
                   title: str | None, description: str | None, filetype: str | None, maxAttempts: int | None = None):
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
    if maxAttempts is not None:
        homework.maxAttempts = maxAttempts
    
    session.add(homework)
    session.commit()
    session.close()
    return True

def delete_homework(homework_id: int):
    session = get_session()

    # delete all notifications
    session.exec(
        text("DELETE FROM tbl_assignment_notifications WHERE homeworkId = :id").params(id=homework_id)
    )
    
    # delete all submissions
    statement = select(Submission).where(Submission.homeworkId == homework_id)
    results = session.exec(statement)
    submissions = results.all()
    for sub in submissions:
        session.delete(sub)
    session.commit()
    
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

def submit_homework(student_id: int, homework_id: int, file_content: str, filename: str):
    session = get_session()
    
    # Get homework details
    hw_statement = select(Homework).where(Homework.homeworkId == homework_id)
    homework = session.exec(hw_statement).first()
    
    if not homework:
        session.close()
        raise ValueError("Homework not found")
    
    # Count existing submissions
    sub_statement = select(Submission).where(
        Submission.homeworkId == homework_id,
        Submission.studentId == student_id
    )
    existing = session.exec(sub_statement).all()
    submission_count = len(existing)
    
    # Check attempt limit
    if homework.maxAttempts is not None and submission_count >= homework.maxAttempts:
        session.close()
        raise ValueError(f"Maximum submission attempts reached ({homework.maxAttempts} attempts allowed)")
    
    #  Validate deadline
    lateness_info = calculate_lateness(homework)
    
    # Validate file type
    is_valid_type, type_error = validate_file_type(filename, homework.filetype)
    if not is_valid_type:
        session.close()
        raise ValueError(type_error)
    
    # Create submission directory
    dir_path = os.path.join(os.path.dirname(__file__), '..', 'submissions', 
                           f'homework-{homework_id}')
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    
    submission_num = submission_count + 1

    # Get file extension
    file_ext = os.path.splitext(filename)[1]
    
    # Save file
    file_path = os.path.join(dir_path, f'student-{student_id}-v{submission_num}{file_ext}')
    
    # Decode base64 and write as binary
    import base64
    try:
        file_bytes = base64.b64decode(file_content)
        with open(file_path, 'wb') as f:
            f.write(file_bytes)
    except Exception as e:
        session.close()
        raise ValueError(f"Failed to decode file content: {str(e)}")
        
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
    return {
        'submission': submission,
        'lateness': lateness_info
    }


def get_submissions_for_homework(homework_id: int):
    session = get_session()
    
    # Join with Student to get student details
    statement = select(Submission, Student).where(
        Submission.homeworkId == homework_id
    ).where(
        Submission.studentId == Student.studentId
    ).order_by(Submission.studentId, Submission.submissionId)
    results = session.exec(statement)
    submissions_with_students = results.all()
    session.close()
    
    # Track attempt numbers per student
    student_attempt_counts = {}
    
    # Format output
    output = []
    for submission, student in submissions_with_students:
        # Calculate attempt number for this student
        if submission.studentId not in student_attempt_counts:
            student_attempt_counts[submission.studentId] = 0
        student_attempt_counts[submission.studentId] += 1
        
        output.append({
            'submissionId': submission.submissionId,
            'studentId': submission.studentId,
            'homeworkId': submission.homeworkId,
            'path': submission.path,
            'studentName': student.name,
            'studentEmail': student.email,
            'score': submission.score,
            'isReleased': submission.isReleased,
            'attemptNumber': student_attempt_counts[submission.studentId]
        })
    
    return output

def validate_file_type(filename: str, allowed_types: str) -> tuple[bool, str]:
    if not allowed_types:
        return True, ""
    
    # Check if "any" is specified (case-insensitive)
    allowed_lower = allowed_types.lower().strip()
    if allowed_lower == "any":
        return True, ""
    
    # Get file extension
    file_ext = os.path.splitext(filename)[1].lower()
    
    if not file_ext:
        return False, "File must have an extension"
    
    allowed_list = [ext.strip().lower() for ext in allowed_types.split(',')]
    
    # Normalize extensions 
    normalized_allowed = []
    for ext in allowed_list:
        if ext == "any":
            return True, ""  # Allow any file type
        if ext.startswith('.'):
            normalized_allowed.append(ext)
        else:
            normalized_allowed.append(f'.{ext}')
    
    if file_ext not in normalized_allowed:
        return False, f"Invalid file type '{file_ext}'. Allowed types: {', '.join(normalized_allowed)}"
    
    return True, ""

def calculate_lateness(homework: Homework) -> dict:

    now = datetime.now()
    
    if now <= homework.deadline:
        return {
            'is_late': False,
            'seconds_late': 0,
            'time_difference': 'On time'
        }
    
    # Calculate how late
    time_diff = now - homework.deadline
    seconds_late = int(time_diff.total_seconds())
    
    # Create human-readable format
    days = time_diff.days
    hours = time_diff.seconds // 3600
    minutes = (time_diff.seconds % 3600) // 60
    seconds = time_diff.seconds % 60
    
    parts = []
    if days > 0:
        parts.append(f"{days} day{'s' if days != 1 else ''}")
    if hours > 0:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes > 0:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
    if seconds > 0 and days == 0: 
        parts.append(f"{seconds} second{'s' if seconds != 1 else ''}")
    
    time_difference = ", ".join(parts) if parts else "0 seconds"
    
    return {
        'is_late': True,
        'seconds_late': seconds_late,
        'time_difference': time_difference
    }

def get_submission_by_id(submission_id: int):
    """Get submission by ID and return the file path"""
    session = get_session()
    
    statement = select(Submission).where(Submission.submissionId == submission_id)
    submission = session.exec(statement).first()
    session.close()
    
    return submission

def grade_submission(submission_id: int, score: float, is_released: bool) -> bool:
    """Grade a submission with a score and optionally release it"""
    session = get_session()
    
    statement = select(Submission).where(Submission.submissionId == submission_id)
    submission = session.exec(statement).first()
    
    if not submission:
        session.close()
        return False
    
    submission.score = score
    submission.isReleased = is_released
    
    session.add(submission)
    session.commit()
    session.close()
    return True

def release_submission_grade(submission_id: int) -> bool:
    """Release a grade to make it visible to the student"""
    session = get_session()
    
    statement = select(Submission).where(Submission.submissionId == submission_id)
    submission = session.exec(statement).first()
    
    if not submission:
        session.close()
        return False
    
    if submission.score is None:
        session.close()
        return False  # Cannot release ungraded submission
    
    submission.isReleased = True
    
    session.add(submission)
    session.commit()
    session.close()
    return True

def get_student_submissions(homework_id: int, student_id: int):
    """Get all submissions for a specific student for a homework"""
    session = get_session()
    
    statement = select(Submission).where(
        Submission.homeworkId == homework_id,
        Submission.studentId == student_id
    ).order_by(Submission.submissionId)
    
    results = session.exec(statement)
    submissions = results.all()
    session.close()
    
    # Format output with attempt numbers
    output = []
    for idx, submission in enumerate(submissions, 1):
        output.append({
            'submissionId': submission.submissionId,
            'studentId': submission.studentId,
            'homeworkId': submission.homeworkId,
            'path': submission.path,
            'score': submission.score,
            'isReleased': submission.isReleased,
            'attemptNumber': idx
        })
    
    return output