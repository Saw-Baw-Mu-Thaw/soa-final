from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
import requests
from fastapi.security import OAuth2PasswordRequestForm
from ..config import AUTH_URL, COURSE_URL, MATERIAL_URL
from ..dependencies import verify_token, get_student_id, get_teacher_id, get_head_id, is_teacher, is_head, is_student, get_role

router = APIRouter(tags=['auth'], prefix='/auth')

UNAUTHORIZED_EXCEPTION = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate' : 'Bearer'}
        )

@router.post('/login/student')
async def login_for_student(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    url = AUTH_URL + 'login/student'
    data = {'username' : form_data.username, 'password' : form_data.password}
    response = requests.post(url=url, data=data)

    if response.status_code == 401:
        raise UNAUTHORIZED_EXCEPTION
    return response.json()

@router.post("/login/teacher")
async def login_for_teacher(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    url = AUTH_URL + 'login/teacher'
    data = {'username' : form_data.username, 'password' : form_data.password}
    response = requests.post(url=url, data=data)

    if response.status_code == 401:
        raise UNAUTHORIZED_EXCEPTION
    return response.json()

@router.post("/login/head")
async def login_for_head(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    url = AUTH_URL + 'login/head'
    data = {'username' : form_data.username, 'password' : form_data.password}
    response = requests.post(url=url, data=data)

    if response.status_code == 401:
        raise UNAUTHORIZED_EXCEPTION
    return response.json()

@router.get('/me', dependencies=[Depends(verify_token)])
async def get_user_info(student_id : Annotated[int, Depends(get_student_id)],
                         teacher_id : Annotated[int, Depends(get_teacher_id)],
                         head_id : Annotated[int, Depends(get_head_id)],
                         role : Annotated[str, Depends(get_role)]):
    if not student_id or not teacher_id or not head_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate credentials',
            headers={'WWW-Authenticate' : 'Bearer'}
        )
    
    if role == 'student':
        url = AUTH_URL + '/student/' + str(student_id)
        response = requests.get(url=url)
        return response.json()
    elif role == 'teacher':
        url = AUTH_URL + '/teacher/' + str(teacher_id)
        response = requests.get(url=url)
        return response.json()
    elif role == 'head':
        url = AUTH_URL + '/head/' + str(head_id)
        response = requests.get(url=url)
        return response.json()