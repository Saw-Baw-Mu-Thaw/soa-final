from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
import requests
from fastapi.security import OAuth2PasswordRequestForm
from ..config import AUTH_URL, COURSE_URL, MATERIAL_URL

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