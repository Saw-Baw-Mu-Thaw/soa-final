from sqlmodel import create_engine, select, Session
from ..config import DATABASE_STRING
from ..models.Course import Course
from ..models.Student import Student
from ..models.Enrollment import Enrollment
from ..models.Head import Head
from ..models.Faculty import Faculty
from ..models.Major import Major
from ..models.OutputModels import CourseStudentOutput
from ..models.Teacher import Teacher

engine = create_engine(DATABASE_STRING)

def get_session():
    with Session(engine) as session:
        return session
    
def get_courses_for_student(student_id : int):
    session = get_session()

    statement = select(Course).where(Enrollment.studentId == student_id).where(Enrollment.courseId == Course.courseId)
    results = session.exec(statement)
    courses = results.all()

    session.close()

    return courses

def get_students_in_course(course_id : int):
    session = get_session()

    statement = select(Student).where(Enrollment.courseId == course_id).where(Enrollment.studentId == Student.studentId)
    results = session.exec(statement)
    students = results.all()

    session.close()

    mylist = []
    for std in students:
        mylist.append(CourseStudentOutput(studentId=std.studentId,
                                          email=std.email,
                                           majorId=std.majorId,
                                            name=std.name ))

    return mylist

def get_courses_for_teacher(teacher_id : int):
    session = get_session()

    statement = select(Course).where(Course.teacherId == teacher_id)
    results = session.exec(statement)
    courses = results.all()

    session.close()

    return courses

def create_course(name : str, majorId : int, teacherId : int):
    session = get_session()

    course = Course(name = name, majorId=majorId, teacherId=teacherId)
    session.add(course)
    session.commit()
    session.refresh(course)
    session.close()

    return course

def modify_course(courseId : int, name : str | None, majorId : int | None, teacherId : int | None):
    session = get_session()

    statement = select(Course).where(Course.courseId == courseId)
    results = session.exec(statement)
    course = results.first()

    if not course:
        return False

    if name:
        course.name = name
    if majorId:
        course.majorId = majorId
    if teacherId:
        course.teacherId = teacherId

    session.add(course)
    session.commit()
    session.close()

    return True

def get_courses_for_head(head_id):
    session = get_session()

    # statement = select(Course).join(Head).join(Faculty).join(Major).join(Course).where(Head.id == head_id)
    statement = select(Course).where(Head.id == head_id).where(Head.facultyId == Faculty.facultyId).where(Major.facultyId == Faculty.facultyId).where(Major.majorId == Course.majorId)
    results = session.exec(statement)
    courses = results.all()

    session.close()

    return courses

def enroll_student(studentId : int, courseId : int):
    session = get_session()

    enrollment = Enrollment(studentId=studentId, courseId=courseId)
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    session.commit()
    session.close()

    return enrollment

def unenroll_student(studentId : int, courseId : int):
    session = get_session()

    statement = select(Enrollment).where(Enrollment.studentId == studentId).where(Enrollment.courseId == courseId)
    results = session.exec(statement)
    enrollment = results.first()

    if not enrollment:
        return False
    
    session.delete(enrollment)
    session.commit()
    session.close()

    return True