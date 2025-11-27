from pydantic import BaseModel, Field

class MaterialNotificationInput(BaseModel):
    title: str = Field(min_length=1)
    materialId: int = Field(gt=0)

class HwNotificationInput(BaseModel):
    title: str = Field(min_length=1)
    homeworkId: int = Field(gt=0)

class NotificationSeenInput(BaseModel):
    notificationIds: list[int]