from sqlmodel import create_engine, select, Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from ..config import DATABASE_STRING
from ..models.Course import Course
from ..models.Student import Student
from ..models.Enrollment import Enrollment
from ..models.Head import Head
from ..models.Faculty import Faculty
from ..models.Major import Major
from ..models.MaterialCompletion import MaterialCompletion
from ..models.OutputModels import CourseStudentOutput, CourseOutput, CourseHeadOutput, TeacherOutput, StudentOutput
from ..models.Teacher import Teacher
from ..models.Material import Material
from ..models.Homework import Homework
from ..models.Submission import Submission

engine = create_engine(DATABASE_STRING)

def get_session():
    with Session(engine) as session:
        return session
    
def get_courses_for_student(student_id : int):
    session = get_session()

    try:
        statement = select(Course, Teacher).where(Enrollment.studentId == student_id).where(Enrollment.courseId == Course.courseId).where(Course.teacherId == Teacher.teacherId)
        results = session.exec(statement)
        courses = results.all()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'Please check your input'}
        )

    session.close()

    mylist = []
    for course, teacher in courses:
        mylist.append(CourseOutput(courseId=course.courseId, name=course.name, teacherName=teacher.name))

    return mylist

def get_students_in_course(course_id : int):
    session = get_session()

    try:
        statement = select(Student, Enrollment).where(Enrollment.courseId == course_id).where(Enrollment.studentId == Student.studentId)
        results = session.exec(statement)
        students = results.all()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'Please check your input'}
        )

    session.close()

    mylist = []
    for std, enroll in students:
        mylist.append(CourseStudentOutput(studentId=std.studentId,
                                          email=std.email,
                                           majorId=std.majorId,
                                            name=std.name,
                                             courseId=enroll.courseId,
                                              enrollmentId=enroll.enrollmentId ))

    return mylist

def get_courses_for_teacher(teacher_id : int):
    session = get_session()

    try:
        statement = select(Course).where(Course.teacherId == teacher_id)
        results = session.exec(statement)
        courses = results.all()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'Please check your input'}
        )

    session.close()

    return courses

def create_course(name : str, majorId : int, teacherId : int):
    session = get_session()

    course = Course(name = name, majorId=majorId, teacherId=teacherId)
    try:
        session.add(course)
        session.commit()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'Please check your input'}
        )
    
    session.refresh(course)
    session.close()

    return course

def modify_course(courseId : int, name : str | None, majorId : int | None, teacherId : int | None):
    session = get_session()

    try:
        statement = select(Course).where(Course.courseId == courseId)
        results = session.exec(statement)
        course = results.first()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'Please check your input'}
        )

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

    try:
        statement = select(Course, Teacher, Major).where(Head.id == head_id).where(Head.facultyId == Faculty.facultyId).where(Major.facultyId == Faculty.facultyId).where(Major.majorId == Course.majorId).where(Teacher.teacherId == Course.teacherId)
        results = session.exec(statement)
        courses = results.all()
    except:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please check your input'
        )

    mylist = []
    for course, teacher, major in courses:
        mylist.append(CourseHeadOutput(courseId=course.courseId,
                                        name=course.name, teacherName=teacher.name,
                                          major=major.name, teacherId=teacher.teacherId,
                                          majorId=major.majorId))

    session.close()

    return mylist

def enroll_student(studentId : int, courseId : int):
    session = get_session()

    enrollment = Enrollment(studentId=studentId, courseId=courseId)
    try:
        session.add(enrollment)
        session.commit()
        session.refresh(enrollment)
    except:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please check your input'
        )
    session.commit()
    session.close()

    return enrollment

def unenroll_student(studentId : int, courseId : int):
    session = get_session()

    try:
        statement = select(Enrollment).where(Enrollment.studentId == studentId).where(Enrollment.courseId == courseId)
        results = session.exec(statement)
        enrollment = results.first()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please check your input'
        )

    if not enrollment:
        return False
    
    session.delete(enrollment)
    session.commit()
    session.close()

    return True

def get_teachers_in_faculty(head_id : int):
    session = get_session()

    try:
        statement = select(Teacher).where(Head.id == head_id).where(Head.facultyId == Teacher.facultyId)
        results = session.exec(statement)
        teachers = results.all()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please check your input'
        )

    session.close()

    mylist = []
    for t in teachers:
        mylist.append(TeacherOutput(teacherId=t.teacherId, name=t.name, email=t.email))
    
    return mylist

def get_students_in_faculty(head_id : int):
    session = get_session()
    
    try:
        statement = select(Student).where(Head.id == head_id).where(Head.facultyId == Major.facultyId).where(Student.majorId == Major.majorId)
        results = session.exec(statement)
        students = results.all()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please check your input'
        )

    session.close()

    mylist = []
    for s in students:
        mylist.append(StudentOutput(studentId=s.studentId, name=s.name, email=s.email))

    return mylist

def get_majors_in_faculty(head_id : int):
    session = get_session()

    try:
        statement = select(Head).where(Head.id == head_id)
        result = session.exec(statement)
        head = result.first()
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Please check your input"
        )

    if not head:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty head doesn't exist"
        )
    
    statement = select(Major).where(Major.facultyId == head.facultyId)
    results = session.exec(statement)
    majors = results.all()

    session.close()

    return majors

def get_course_statistics(course_id : int):
    session = get_session()
    
    statement = select(Enrollment).where(Enrollment.courseId == course_id)
    enrollments = session.exec(statement).all()
    
    statement = select(Material).where(Material.courseId == course_id)
    materials = session.exec(statement).all()
    
    statement = select(Homework).where(Homework.courseId == course_id)
    homeworks = session.exec(statement).all()
    
    all_statistics = []
    
    for e in enrollments:
        statement = select(Student).where(Student.studentId == e.studentId)
        student = session.exec(statement).first()
        mydict = dict()
        
        mydict['student_id'] = student.studentId
        mydict['student_name'] = student.name
        
        mydict['total_materials'] = len(materials)
        mydict['total_homeworks'] = len(homeworks)
        
        completed_materials = 0
        submitted_homeworks = 0
        material_list = []
        homework_list = []
        
        for m in materials:
            statement = select(MaterialCompletion).where(MaterialCompletion.studentId == student.studentId).where(MaterialCompletion.materialId == m.materialId)
            comp = session.exec(statement).first()
            
            if comp.completed == True:
                completed_materials += 1
            
            temp = {'material_name' : m.title, 'completed' : comp.completed}
            material_list.append(temp)
            
        for h in homeworks:
            statement = select(Submission).where(Submission.studentId == student.studentId).where(Submission.homeworkId == h.homeworkId)
            sub = session.exec(statement).first()
            
            temp = {'homework_title' : h.title}
            
            if sub is not None:
                submitted_homeworks += 1
                temp['submitted'] = True
            else:
                temp['submitted'] = False
                
            homework_list.append(temp)
        
        mydict['material_completed'] = completed_materials
        mydict['homework_completed'] = submitted_homeworks
        
        mydict['materials'] = material_list
        mydict['homeworks'] = homework_list
        
        all_statistics.append(mydict)
                
    return all_statistics    
            
        
        
        
        