from fastapi import APIRouter, Depends, Query, Path
from typing import Annotated
import requests
import json
from ..dependencies import is_student, is_teacher, is_teacher_or_student
from ..config import HOMEWORK_URL

router = APIRouter(prefix='/homework', tags=['homework'])

@router.get('', dependencies=[Depends(is_teacher_or_student)])
async def get_homeworks_in_course(course: Annotated[int, Query(gt=0)]):
    url = HOMEWORK_URL + f'homework?course={course}'
    response = requests.get(url=url)
    return response.json()

@router.get('/{homework_id}/{student_id}', dependencies=[Depends(is_teacher_or_student)])
async def get_homework_detail(homework_id: int, student_id: int):
    url = HOMEWORK_URL + f'homework/{homework_id}/{student_id}'
    response = requests.get(url=url)
    return response.json()

@router.post('', dependencies=[Depends(is_teacher)])
async def create_homework(data: dict):
    url = HOMEWORK_URL + 'homework'
    response = requests.post(url=url, data=json.dumps(data),
                            headers={'Content-Type': 'application/json'})
    return response.json()

@router.put('/{homework_id}', dependencies=[Depends(is_teacher)])
async def update_homework(homework_id: int, data: dict,send_notification : bool = Query(False, description="Send notification to students")):
    url = HOMEWORK_URL + f'homework/{homework_id}?send_notification={send_notification}'
    response = requests.put(url=url, data=json.dumps(data),
                           headers={'Content-Type': 'application/json'})
    return response.json()

@router.delete('/{homework_id}', dependencies=[Depends(is_teacher)])
async def delete_homework(homework_id: int):
    url = HOMEWORK_URL + f'homework/{homework_id}'
    response = requests.delete(url=url)
    return response.json()

@router.post('/{homework_id}/submit', dependencies=[Depends(is_student)])
async def submit_homework(homework_id: int, data: dict):
    url = HOMEWORK_URL + f'homework/{homework_id}/submit'
    response = requests.post(url=url, data=json.dumps(data),
                            headers={'Content-Type': 'application/json'})
    return response.json()


@router.get('/submission/{course_id}/{homework_id}', dependencies=[Depends(is_teacher)])
async def get_submissions(course_id : int, homework_id: int):
    url = HOMEWORK_URL + 'submission/' + str(homework_id)
    response = requests.get(url=url)
    return response.json()