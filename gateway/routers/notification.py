from fastapi import APIRouter, Depends
import requests
import json
from ..dependencies import is_teacher_or_student, is_teacher
from ..config import NOTI_URL

router = APIRouter(prefix='/notifications', tags=['notification'])

@router.get('', dependencies=[Depends(is_teacher_or_student)])
async def get_notifications():
    url = NOTI_URL + 'notifications'
    response = requests.get(url=url)
    return response.json()

@router.post('/material', dependencies=[Depends(is_teacher)])
async def create_material_notification(data: dict):
    url = NOTI_URL + 'notifications/material'
    response = requests.post(url=url, data=json.dumps(data),
                            headers={'Content-Type': 'application/json'})
    return response.json()

@router.post('/homework', dependencies=[Depends(is_teacher)])
async def create_homework_notification(data: dict):
    url = NOTI_URL + 'notifications/homework'
    response = requests.post(url=url, data=json.dumps(data),
                            headers={'Content-Type': 'application/json'})
    return response.json()

@router.put('/material', dependencies=[Depends(is_teacher_or_student)])
async def mark_material_seen(data: dict):
    url = NOTI_URL + 'notifications/material'
    response = requests.put(url=url, data=json.dumps(data),
                           headers={'Content-Type': 'application/json'})
    return response.json()

@router.put('/homework', dependencies=[Depends(is_teacher_or_student)])
async def mark_homework_seen(data: dict):
    url = NOTI_URL + 'notifications/homework'
    response = requests.put(url=url, data=json.dumps(data),
                           headers={'Content-Type': 'application/json'})
    return response.json()