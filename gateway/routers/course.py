from fastapi import APIRouter, Depends, Path
from typing import Annotated
import requests
from ..config import COURSE_URL
from ..dependencies import verify_token, is_head, is_student, is_teacher, get_student_id, get_teacher_id, get_head_id
from ..models.InputModels import CreateCourseInput, UpdateCouresInput, EnrollStudentInput
import json

router = APIRouter(prefix='/course', tags=['course'])

@router.get('/student', dependencies=[Depends(is_student)])
async def get_courses_for_student(student_id : Annotated[int , Depends(get_student_id)]):
    url = COURSE_URL + '/course/student/' + str(student_id)
    response = requests.get(url=url)
    return response.json()

@router.get('/students/{course_id}', dependencies=[Depends(verify_token)])
async def get_all_students_in_course(course_id : int):
    url = COURSE_URL + '/course/students/' + str(course_id)
    response = requests.get(url=url)
    return response.json()

@router.get('/teacher', dependencies=[Depends(is_teacher)])
async def get_courses_for_teacher(teacher_id : Annotated[int, Depends(get_teacher_id)]):
    url = COURSE_URL + '/course/teacher/' + str(teacher_id)
    response = requests.get(url=url)
    return response.json()

@router.post('/create', dependencies=[Depends(is_head)])
async def create_course_for_head(input : CreateCourseInput):
    url = COURSE_URL + '/course/create'
    data = {'name' : input.name, 'majorId' : input.majorId, 'teacherId' : input.teacherId}
    response = requests.post(url=url, data=json.dumps(data))
    return response.json()

@router.put('/{course_id}', dependencies=[Depends(is_head)])
async def modify_course_for_head(course_id : int, input : UpdateCouresInput):
    url = COURSE_URL + '/course/' + str(course_id)
    data = {'name' : input.name, 'majorId' : input.majorId, 'teacherId' : input.teacherId}
    response = requests.put(url=url, data=json.dumps(data))
    return response.json()

@router.get('/head', dependencies=[Depends(is_head)])
async def get_courses_for_head(head_id : Annotated[int, Depends(get_head_id)]):
    url = COURSE_URL + '/course/head/' + str(head_id)
    response = requests.get(url=url)
    return response.json()

@router.post('/enroll', dependencies=[Depends(is_head)])
async def enroll_student_for_head(input : EnrollStudentInput):
    url = COURSE_URL + '/enroll'
    data = {'studentId' : input.studentId, 'courseId' : input.courseId}
    response = requests.post(url=url, data=json.dumps(data))
    return response.json()

@router.delete('/enroll/{course_id}/{student_id}', dependencies=[Depends(is_head)])
async def unenroll_student_for_head(course_id : Annotated[int , Path(gt=0)], student_id : Annotated[int, Path(gt=0)]):
    url = COURSE_URL + '/enroll/' + str(course_id) + '/' + str(student_id)
    response = requests.delete(url=url)
    return response.json()

@router.get('/teachers', dependencies=[Depends(is_head)])
async def get_teachers_in_faculty(head_id : Annotated[int, Depends(get_head_id)]):
    url = COURSE_URL + '/course/teachers/' + str(head_id)
    response = requests.get(url=url)
    return response.json()

@router.get('/faculty/students', dependencies=[Depends(is_head)])
async def get_students_in_faculty(head_id : Annotated[int, Depends(get_head_id)]):
    url = COURSE_URL + '/faculty/students/' + str(head_id)
    response = requests.get(url=url)
    return response.json()
