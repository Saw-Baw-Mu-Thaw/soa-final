import json
import os
from fastapi import FastAPI, Depends, HTTPException, status
import requests
from .repositories import MaterialRepo
from .models.OutputModels import MaterialOutput
from .models.InputModels import MaterialCreateInput, MaterialUpdateInput

app = FastAPI(title='Material Service')

NOTI_URL = os.getenv("NOTI_URL", "http://localhost:8005/")

@app.get('/')
async def get_root():
    return 'This is the Material Service'

@app.get('/materials')
async def get_materials_in_course(course_id : int):
    materials = MaterialRepo.get_materials_in_course(course_id)
    return materials

@app.get('/materials/{material_id}')
async def get_material(material_id : int):
    material = MaterialRepo.get_specific_material(material_id)
    file = open(material.path, 'r')
    json = file.read()
    file.close()
    return MaterialOutput(courseId=material.courseId, 
                          materialId=material.materialId, 
                          json=json, title=material.title)

@app.post('/materials')
async def create_new_material(input : MaterialCreateInput):
    material = MaterialRepo.create_new_material(courseId=input.courseId, title=input.title, json=input.json)

    try:
        requests.post(
            url = f"{NOTI_URL}notifications/material",
            json={
                "title":material.title,
                "materialId" : material.materialId,
                "courseId": input.courseId
            },
            timeout = 60
        )
        print(" Notification sent to service")
    except Exception as e:
         print(f" Notification service failed: {e}")
    return material

@app.put('/materials/{material_id}')
async def update_material(material_id : int, input : MaterialUpdateInput,send_notification: bool = False):
    result = MaterialRepo.update_material(material_id, input.title, input.json)
    if not result:
        raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail='Material does not exist'
        )
    
    if send_notification:
        detail_result = MaterialRepo.get_specific_material(material_id)
        if detail_result:
            course_id = detail_result.courseId

            requests.post(
                url =f"{NOTI_URL}notifications/material",
                json = {
                    "title" : "Material Updated",
                    "materialId" : material_id,
                    "courseId" : course_id
                },
                timeout= 60

            )
    return result

@app.delete('/materials/{material_id}')
async def delete_material(material_id : int):
    result = MaterialRepo.delete_material(material_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Material does not exist'
        )
    return
