from fastapi import APIRouter, Depends, Query, Path
import json
from typing import Annotated
import requests
from ..dependencies import is_student, is_teacher, is_teacher_or_student
from ..config import MATERIAL_URL
from ..models.InputModels import CreateMaterialInput, UpdateMaterialInput


router = APIRouter(prefix='/materials', tags=['material'])

@router.get('/', dependencies=[Depends(is_teacher_or_student)])
async def get_materials_in_a_course(course_id : Annotated[int , Query(gt=0)]):
    url = MATERIAL_URL + '/materials?course_id=' + str(course_id)
    response = requests.get(url=url)
    return response.json()

@router.get('/{material_id}', dependencies=[Depends(is_teacher_or_student)])
async def get_specific_material(material_id : Annotated[int, Path(gt=0)]):
    url = MATERIAL_URL + '/materials/' + str(material_id)
    response = requests.get(url=url)
    return response.json()

@router.post('/', dependencies=[Depends(is_teacher)])
async def create_new_material(input : CreateMaterialInput):
    url = MATERIAL_URL + '/materials'
    data = {'courseId' : input.courseId, 'title' : input.title, 'json' : input.json}
    response = requests.post(url=url, data=json.dumps(data))
    return response.json()

@router.put('/{material_id}', dependencies=[Depends(is_teacher)])
async def update_material(material_id : Annotated[int, Path(gt=0)], input : UpdateMaterialInput):
    url = MATERIAL_URL + '/materials/' + str(material_id)
    data = {'title' : input.title, 'json' : input.json}
    response = requests.put(url=url, data=json.dumps(data))
    return response.json()

@router.delete('/{material_id}', dependencies=[Depends(is_teacher)])
async def delete_material(material_id : Annotated[int, Path(gt=0)]):
    url = MATERIAL_URL + '/materials/' + str(material_id)
    response = requests.delete(url=url)
    return response.json()