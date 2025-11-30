from fastapi import FastAPI, HTTPException, status
from .repositories import NotificationRepo
from .models.InputModels import MaterialNotificationInput, HwNotificationInput, NotificationSeenInput
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app : FastAPI):
    NotificationRepo.start_scheduler()
    yield


app = FastAPI(title='Notification Service',lifespan=lifespan)
    
@app.get('/')
async def get_root():
    return 'This is the Notification Service'

@app.get('/notifications')
async def get_all_unseen_notifications():
    notifications = NotificationRepo.get_unseen_notifications()
    return notifications

@app.post('/notifications/material')
async def create_material_notification(input: MaterialNotificationInput):
    notification = NotificationRepo.create_material_notification(
        input.title,
        input.materialId,
        course_id=input.courseId if hasattr(input, 'courseId') else None,
    )
    return notification

@app.post('/notifications/homework')
async def create_homework_notification(input: HwNotificationInput):
    notification = NotificationRepo.create_homework_notification(
        input.title,
        input.homeworkId,
        course_id=input.courseId if hasattr(input, 'courseId') else None,  
        action="created"
    )
    return notification

@app.put('/notifications/material')
async def mark_material_notifications_as_seen(input: NotificationSeenInput):
    result = NotificationRepo.mark_material_notifications_seen(input.notificationIds)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Notifications not found'
        )
    return result

@app.put('/notifications/homework')
async def mark_homework_notifications_as_seen(input: NotificationSeenInput):
    result = NotificationRepo.mark_homework_notifications_seen(input.notificationIds)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Notifications not found'
        )
    return result