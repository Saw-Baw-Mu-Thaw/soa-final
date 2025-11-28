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

    send_material_notification(
        title=f"New material: {material.title}",
        material_id=material.materialId
    )
    return material

@app.put('/materials/{material_id}')
async def update_material(material_id : int, input : MaterialUpdateInput,send_notification: bool = False):
    result = MaterialRepo.update_material(material_id, input.title, input.json)
    if not result:
        raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail='Material does not exist'
        )
    
    #Only send noti if checkout is checked
    if send_notification:
        material = MaterialRepo.get_specific_material(material_id)
        send_material_notification(
            title=f"Material updated: {material.title}",
            material_id=material.materialId
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

def send_material_notification(title: str, material_id: int):
    """Helper function to send material notification"""
    try:
        url = NOTI_URL + 'notifications/material'
        data = {
            'title': title,
            'materialId': material_id
        }
        requests.post(
            url=url, 
            data=json.dumps(data),
            headers={'Content-Type': 'application/json'},
            timeout=5 
        )
    except Exception as e:
        print(f"Failed to send notification: {e}")