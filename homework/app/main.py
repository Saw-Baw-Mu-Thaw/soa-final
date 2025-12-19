import json
import os
from fastapi.responses import FileResponse
import requests
from .repositories import HomeworkRepo
from .config import NOTI_URL
from .models.OutputModels import HomeworkDetailOutput
from .models.InputModels import HomeworkCreateInput, HomeworkUpdateInput, SubmissionCreateInput, GradeSubmissionInput 
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, status


app  = FastAPI(title='Homework Service')
        
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

    # Attempts Calculation
    remaining_attempt = None
    if homework.maxAttempts is not None:
        remaining_attempt = max(0, homework.maxAttempts - submission_count)
    
    submission_dict = None
    if latest_submission:
        submission_dict = {
            'submissionId': latest_submission.submissionId,
            'path': latest_submission.path,
            'score': latest_submission.score if latest_submission.isReleased else None,
            'isReleased': latest_submission.isReleased
        }
    return HomeworkDetailOutput(
        homeworkId=homework.homeworkId,
        courseId=homework.courseId,
        deadline=homework.deadline,
        title=homework.title,
        description=homework.description,
        filetype=homework.filetype,
        maxAttempts=homework.maxAttempts,
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
        input.filetype,
        input.maxAttempts
    )

    try:
            requests.post(
                url=f"{NOTI_URL}notifications/homework",
                json={
                    "title": homework.title,
                    "homeworkId": homework.homeworkId,
                    "courseId": input.courseId  # This triggers emails!
                },
                timeout=60
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
        input.filetype,
        input.maxAttempts
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
                    timeout=60
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
    try:
        print(f"[DEBUG] Submission request - homework_id: {homework_id}, studentId: {input.studentId}, filename: {input.filename}, file_length: {len(input.file) if input.file else 0}")
        result = HomeworkRepo.submit_homework(
            input.studentId,
            homework_id,
            input.file,
            input.filename 
        )
        
        submission = result['submission']
        lateness = result['lateness']
        
        return {
            "success": True,
            "message": "Submission successful" if not lateness['is_late'] else "Submission accepted (late)",
            "submission": {
                "submissionId": submission.submissionId,
                "studentId": submission.studentId,
                "homeworkId": submission.homeworkId,
                "path": submission.path
            },
            "lateness": {
                "is_late": lateness['is_late'],
                "seconds_late": lateness['seconds_late'],
                "time_difference": lateness['time_difference']
            }
        }
    except ValueError as e:
        print(f"[DEBUG] ValueError in submission: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"[DEBUG] Exception in submission: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Submission failed: {str(e)}"
        )

@app.get('/submission/{homework_id}')
async def get_submissions(homework_id: int):
    submissions = HomeworkRepo.get_submissions_for_homework(homework_id)
    return submissions

@app.get('/submission/{submission_id}/download')
async def download_submission(submission_id: int):
    """Download a submission file by submission ID"""
    submission = HomeworkRepo.get_submission_by_id(submission_id)

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Submission not found'
        )

    file_path = submission.path

    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='File not found on server'
        )
    
    # Get filename from path
    filename = os.path.basename(file_path)

    # Return file as download
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

@app.put('/submission/{submission_id}/grade')
async def grade_submission(submission_id: int, input: GradeSubmissionInput):
    """Grade a submission with a score and optionally release it"""
    result = HomeworkRepo.grade_submission(
        submission_id,
        input.score,
        input.isReleased
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Submission not found'
        )
    
    # Return updated submission
    submission = HomeworkRepo.get_submission_by_id(submission_id)
    return {
        "success": True,
        "message": "Submission graded successfully",
        "submission": {
            "submissionId": submission.submissionId,
            "studentId": submission.studentId,
            "homeworkId": submission.homeworkId,
            "score": submission.score,
            "isReleased": submission.isReleased
        }
    }

@app.put('/submission/{submission_id}/release')
async def release_submission_grade(submission_id: int):
    """Release a grade to make it visible to the student"""
    result = HomeworkRepo.release_submission_grade(submission_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Submission not found or not yet graded'
        )
    
    # Return updated submission
    submission = HomeworkRepo.get_submission_by_id(submission_id)
    return {
        "success": True,
        "message": "Grade released to student",
        "submission": {
            "submissionId": submission.submissionId,
            "studentId": submission.studentId,
            "homeworkId": submission.homeworkId,
            "score": submission.score,
            "isReleased": submission.isReleased
        }
    }

@app.get('/submission/{homework_id}/{student_id}')
async def get_student_submissions(homework_id: int, student_id: int):
    """Get all submissions for a specific student for a homework"""
    submissions = HomeworkRepo.get_student_submissions(homework_id, student_id)
    return submissions