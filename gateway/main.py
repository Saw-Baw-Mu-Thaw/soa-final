from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, course, material,homework,notification

app = FastAPI(title='API Gateway')

origins = ['http://localhost','https://localhost']

app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials=True,
                   allow_methods=['*'],
                   allow_headers=['*'])

app.include_router(auth.router)
app.include_router(course.router)
app.include_router(material.router)
app.include_router(homework.router)
app.include_router(notification.router)

@app.get('/')
async def get_root():
    return 'This is the api gateway'

