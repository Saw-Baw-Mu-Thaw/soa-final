from fastapi import Depends, HTTPException, status
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .config import ALGORITHM, SECRET_KEY
import json

student_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login/student', scheme_name='student_scheme')
teacher_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login/teacher', scheme_name='teacher_scheme')
head_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login/head', scheme_name='head_scheme')
    
async def is_student(token : Annotated[str, Depends(student_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate' : 'Bearer'}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username : str = payload.get("sub")
        role : str = payload.get("role")
        if username is None:
            raise credentials_exception
        if role != "student":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Not a student',
                headers={'WWW-Authenticate' : 'Bearer'}
            )
    except JWTError:
        raise credentials_exception
    
async def is_teacher(token : Annotated[str, Depends(teacher_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate' : 'Bearer'}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username : str = payload.get("sub")
        role : str = payload.get("role")
        if username is None:
            raise credentials_exception
        if role != "teacher":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Not a teacher',
                headers={'WWW-Authenticate' : 'Bearer'}
            )
    except JWTError:
        raise credentials_exception
    
async def verify_token(student_token : Annotated[str, Depends(student_scheme)],
                                 teacher_token : Annotated[str, Depends(teacher_scheme)],
                                 head_token : Annotated[str, Depends(head_scheme)]):
    if not student_token or not teacher_token or not head_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Could not validate credentials',
                headers={'WWW-Authenticate' : 'Bearer'}
                )
    
async def is_teacher_or_student(student_token : Annotated[str, Depends(student_scheme)],
                                teacher_token : Annotated[str, Depends(teacher_scheme)]):
    if not student_scheme or not teacher_scheme:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Not a student or teacher')  
    
async def is_head(token : Annotated[str, Depends(head_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate' : 'Bearer'}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username : str = payload.get("sub")
        role : str = payload.get("role")
        if username is None:
            raise credentials_exception
        if role != "head":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Not a Faculty Head',
                headers={'WWW-Authenticate' : 'Bearer'}
            )
    except JWTError:
        raise credentials_exception
    
async def get_student_id(token : Annotated[str, Depends(student_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id : int = payload.get("id")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Could not decode jwt'
        )
    return id

async def get_teacher_id(token : Annotated[str, Depends(teacher_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id : int = payload.get("id")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Could not decode jwt'
        )
    return id

async def get_head_id(token : Annotated[str, Depends(head_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id : int = payload.get("id")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Could not decode jwt'
        )
    return id