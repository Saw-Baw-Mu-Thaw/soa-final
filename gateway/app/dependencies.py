from fastapi import Depends, HTTPException, status, Request
from typing import Annotated, Optional
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .config import ALGORITHM, SECRET_KEY
import json
import time

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
    return True
    
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
    return True
    
async def verify_token(student_token : Annotated[str, Depends(student_scheme)],
                                 teacher_token : Annotated[str, Depends(teacher_scheme)],
                                 head_token : Annotated[str, Depends(head_scheme)]):
    if not student_token or not teacher_token or not head_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Could not validate credentials',
                headers={'WWW-Authenticate' : 'Bearer'}
                )
    
async def get_optional_token(request: Request) -> Optional[str]:
    """Extract token from Authorization header if present"""
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None

async def is_teacher_or_student(request: Request):
    """Allow either student or teacher token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'}
    )
    
    authorization = request.headers.get("Authorization", "")
    if not authorization or not authorization.startswith("Bearer "):
        raise credentials_exception
    
    token = authorization.split(" ")[1] if len(authorization.split(" ")) > 1 else None
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role in ["student", "teacher"]:
            return True
        else:
            raise credentials_exception
    except JWTError:
        raise credentials_exception  
    
async def is_teacher_or_head(teacher_token : Annotated[str, Depends(teacher_scheme)],
                             head_token : Annotated[str, Depends(head_scheme)]):
    if not head_token or not teacher_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Not a teacher or faculty head")
        
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
    return True
    
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

async def get_role(token : Annotated[str, Depends(student_scheme)]):
    
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            role : int = payload.get("role")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Could not decode jwt'
            )
        return role