from fastapi import FastAPI, Depends, HTTPException, status, Path
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from pydantic import BaseModel
from .config import SECRET_KEY, ALGORITHM
from .repositories import StudentRepo, TeacherRepo, HeadRepo
from datetime import timedelta, datetime, timezone

TOKEN_EXPIRES_MINUTES = 30

pwd_context = PasswordHash.recommended()

student_scheme = OAuth2PasswordBearer(tokenUrl="login/student")
teacher_scheme = OAuth2PasswordBearer(tokenUrl="login/teacher")
head_scheme = OAuth2PasswordBearer(tokenUrl='login/head')

class Token(BaseModel):
    access_token : str
    token_type : str
    role : str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data : dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({'exp' : expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
    

app = FastAPI(title='Authentication Service')

@app.get('/')
async def get_root():
    return "This is the Authentication Service"

@app.post('/login/student')
async def login_student(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    student = StudentRepo.get_student(form_data.username)

    if not student or  not verify_password(form_data.password, student.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate' : 'Bearer'}
        )
    
    access_token_expire = timedelta(minutes=TOKEN_EXPIRES_MINUTES)
    access_token = create_access_token(data={"sub" : student.email, "role" : "student", "id" : student.studentId}
                                       , expires_delta=access_token_expire)
    
    return {'access_token' : access_token, "token_type" : 'bearer'}

@app.post('/login/teacher')
async def login_teacher(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    teacher = TeacherRepo.get_teacher(form_data.username)

    if not teacher or not verify_password(form_data.password, teacher.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate' : 'Bearer'}
        )
    
    access_token_expire = timedelta(minutes=TOKEN_EXPIRES_MINUTES)
    access_token = create_access_token(data={"sub" : teacher.email, "role" : "teacher", "id" : teacher.teacherId}
                                       , expires_delta=access_token_expire)
    
    return {'access_token' : access_token, "token_type" : 'bearer'}


@app.post('/login/head')
async def login_head(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    head = HeadRepo.get_head(form_data.username)

    if not head or not verify_password(form_data.password, head.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate' : 'Bearer'}
        )
    
    access_token_expire = timedelta(minutes=TOKEN_EXPIRES_MINUTES)
    access_token = create_access_token(data={"sub" : head.email, "role" : "head", "id" : head.id}
                                       , expires_delta=access_token_expire)
    
    return {'access_token' : access_token, "token_type" : 'bearer'}

@app.get('/student/{id}')
async def get_student(id : int):
    result = StudentRepo.get_student_info(id)
    return result

@app.get('/teacher/{id}')
async def get_teacher(id : int):
    result = TeacherRepo.get_teacher_info(id)
    return result

@app.get('/head/{id}')
async def get_head(id : int):
    result = HeadRepo.get_head_info(id)
    return result