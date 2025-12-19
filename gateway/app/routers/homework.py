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
    try:
        response = requests.get(url=url, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            from fastapi import HTTPException, status
            try:
                error_data = response.json()
            except:
                error_data = {"detail": f"Homework service returned status {response.status_code}"}
            raise HTTPException(status_code=response.status_code, detail=error_data.get('detail', 'Unknown error'))
    except requests.exceptions.RequestException as e:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to homework service: {str(e)}")

@router.post('', dependencies=[Depends(is_teacher)])
async def create_homework(data: dict):
    url = HOMEWORK_URL + 'homework'
    response = requests.post(url=url, data=json.dumps(data),
                            headers={'Content-Type': 'application/json'})
    return response.json()

@router.put('/{homework_id}', dependencies=[Depends(is_teacher)])
async def update_homework(homework_id: int, data: dict, send_notification: bool = Query(False, description="Send notification to students")):
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

@router.get('/submission/{submission_id}/download', dependencies=[Depends(is_teacher)])
async def download_submission(submission_id: int):
    """Download a submission file - forwards to homework service"""
    from fastapi import HTTPException, status
    from fastapi.responses import StreamingResponse
    import io
    
    url = HOMEWORK_URL + f'submission/{submission_id}/download'
    response = requests.get(url=url, stream=True)
    
    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Submission or file not found'
        )
    
    # Get filename from Content-Disposition header or use default
    content_disposition = response.headers.get('Content-Disposition', '')
    filename = f'submission_{submission_id}'
    if 'filename=' in content_disposition:
        filename = content_disposition.split('filename=')[-1].strip('"')
    
    return StreamingResponse(
        io.BytesIO(response.content),
        media_type=response.headers.get('Content-Type', 'application/octet-stream'),
        headers={'Content-Disposition': f'attachment; filename="{filename}"'}
    )

@router.get('/submission/{course_id}/{homework_id}', dependencies=[Depends(is_teacher)])
async def get_submissions(course_id: int, homework_id: int):
    url = HOMEWORK_URL + 'submission/' + str(homework_id)
    response = requests.get(url=url)
    return response.json()

@router.put('/submission/{submission_id}/grade', dependencies=[Depends(is_teacher)])
async def grade_submission(submission_id: int, data: dict):
    """Grade a submission with a score and optionally release it"""
    url = HOMEWORK_URL + f'submission/{submission_id}/grade'
    response = requests.put(url=url, data=json.dumps(data),
                           headers={'Content-Type': 'application/json'})
    return response.json()

@router.put('/submission/{submission_id}/release', dependencies=[Depends(is_teacher)])
async def release_submission_grade(submission_id: int):
    """Release a grade to make it visible to the student"""
    url = HOMEWORK_URL + f'submission/{submission_id}/release'
    response = requests.put(url=url, headers={'Content-Type': 'application/json'})
    return response.json()

@router.get('/submission/{homework_id}/{student_id}', dependencies=[Depends(is_teacher_or_student)])
async def get_student_submissions(homework_id: int, student_id: int):
    """Get all submissions for a specific student for a homework"""
    url = HOMEWORK_URL + f'submission/{homework_id}/{student_id}'
    response = requests.get(url=url)
    return response.json()

