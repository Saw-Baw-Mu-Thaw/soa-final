from fastapi import FastAPI, Depends, HTTPException, status
from .repositories import CourseRepo
from .models.InputModels import CourseCreateInput, CourseUpdateInput, EnrollmentCreateInput

app = FastAPI(title='Course Service')

@app.get('/')
async def get_root():
    return 'This is the course service'

@app.get('/course/student/{student_id}')
async def get_courses_for_student(student_id : int):
    courses = CourseRepo.get_courses_for_student(student_id)
    return courses

@app.get('/course/students/{course_id}')
async def get_all_students_enrolled_in_course(course_id : int):
    students = CourseRepo.get_students_in_course(course_id)
    return students

@app.get('/course/teacher/{teacher_id}')
async def get_courses_for_teacher(teacher_id : int):
    courses =  CourseRepo.get_courses_for_teacher(teacher_id)
    return courses

@app.post('/course/create')
async def create_course_for_head(input : CourseCreateInput):
    course = CourseRepo.create_course(input.name, input.majorId, input.teacherId)
    return
        
@app.put('/course/{course_id}')
async def modify_course_for_head(course_id : int, input : CourseUpdateInput):
    result = CourseRepo.modify_course(course_id, input.name, input.majorId, input.teacherId)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Course does not exist')
    return

@app.get('/course/head/{head_id}')
async def get_courses_for_head(head_id : int):
    courses = CourseRepo.get_courses_for_head(head_id)
    return courses

@app.post('/enroll')
async def enroll_student(input : EnrollmentCreateInput):
    enrollment = CourseRepo.enroll_student(input.studentId, input.courseId)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Invalid input'
        )
    return

@app.delete('/enroll/{course_id}/{student_id}')
async def delete_enrollment(course_id : int, student_id : int):
    result = CourseRepo.unenroll_student(student_id, course_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invalid input'
        )
    return

@app.get('/course/teachers/{head_id}')
async def get_teachers_in_faculty(head_id : int):
    results = CourseRepo.get_teachers_in_faculty(head_id)
    return results

@app.get('/faculty/students/{head_id}')
async def get_students_in_faculty(head_id : int):
    results = CourseRepo.get_students_in_faculty(head_id)
    return results

@app.get('/faculty/majors/{head_id}')
async def get_majors_in_faculty(head_id : int):
    results = CourseRepo.get_majors_in_faculty(head_id)
    return results