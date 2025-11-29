import json
import os
import requests
from .repositories import HomeworkRepo
from .models.OutputModels import HomeworkDetailOutput
from .models.InputModels import HomeworkCreateInput, HomeworkUpdateInput, SubmissionCreateInput 

from fastapi import FastAPI, HTTPException, status


app  = FastAPI(title='Homework Service')

NOTI_URL = os.getenv("NOTI_URL", "http://localhost:8005/")


        
@app.get("/")
async def get_root():
    return 'This is the Homework Service'


@app.get('/homework')
async def get_homeworks_in_courses(course : int):
    homeworks = HomeworkRepo.get_homeworks_in_course(course)
    return homeworks

@app.get('/homework/{homework_id}/{student_id}')
async def get_homework_detail(homework_id : int, student_id : int):
    result = HomeworkRepo.get_homework_detail(homework_id, student_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Homework not found'
        )
    
    homework = result['homework']
    submission_count = result['submission_count']
    latest_submission = result['latest_submission']

    #Attempts Calculation
    remaining_attempt = None
    submission_dict = None

    if latest_submission:
        submission_dict = {
            'submissionId': latest_submission.submissionId,
            'path': latest_submission.path
        }
    return HomeworkDetailOutput(
        homeworkId=homework.homeworkId,
        courseId=homework.courseId,
        deadline=homework.deadline,
        title=homework.title,
        description=homework.description,
        filetype=homework.filetype,
        remainingAttempt=remaining_attempt,
        submission=submission_dict
    )
    
@app.post('/homework')
async def create_homework(input : HomeworkCreateInput):
    homework = HomeworkRepo.create_homework(
        input.courseId,
        input.deadline,
        input.title,
        input.description,
        input.filetype
    )

    try:
            requests.post(
                url=f"{NOTI_URL}notifications/homework",
                json={
                    "title": homework.title,
                    "homeworkId": homework.homeworkId,
                    "courseId": input.courseId  # This triggers emails!
                },
                timeout=10
            )
            print(" Notification sent to service")
    except Exception as e:
            print(f" Notification service failed: {e}")
    return homework

@app.put('/homework/{homework_id}')
async def update_homework(homework_id: int, input: HomeworkUpdateInput, send_notification: bool = False):
    result = HomeworkRepo.update_homework(
        homework_id,
        input.courseId,
        input.deadline,
        input.title,
        input.description,
        input.filetype
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Homework not found'
        )
    
    
    if send_notification:
            detail_result = HomeworkRepo.get_homework_detail(homework_id, 0)
            if detail_result:
                course_id = detail_result['homework'].courseId
                
                requests.post(
                    url=f"{NOTI_URL}notifications/homework",
                    json={
                        "title": "Homework Updated",  
                        "homeworkId": homework_id,
                        "courseId": course_id
                    },
                    timeout=30
                )
    return result


@app.delete('/homework/{homework_id}')
async def delete_homework(homework_id: int):
    result = HomeworkRepo.delete_homework(homework_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Homework not found'
        )
    return result

@app.post('/homework/{homework_id}/submit')
async def submit_homework(homework_id: int, input: SubmissionCreateInput):
    submission = HomeworkRepo.submit_homework(
        input.studentId,
        homework_id,
        input.file
    )
    return submission

@app.get('/submission/{homework_id}')
async def get_submissions(homework_id: int):
    submissions = HomeworkRepo.get_submissions_for_homework(homework_id)
    return submissions

