from sqlalchemy import text
from sqlmodel import Session, create_engine, select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from ..models.Material import Material
from ..models.Course import Course
from ..models.Teacher import Teacher
from ..models.Major import Major
from ..models.OutputModels import AllMaterialOutput
from ..config import DATABASE_STRING
import os

engine = create_engine(DATABASE_STRING)

def get_session():
    with Session(engine) as session:
        return session

def get_materials_in_course(course_id):
    session = get_session()

    statement = select(Material).where(Material.courseId == course_id)
    results = session.exec(statement)
    materials = results.all()

    session.close()

    mylist = []
    for mat in materials:
        mylist.append(AllMaterialOutput(courseId=mat.courseId, materialId=mat.materialId, title=mat.title))

    return mylist

def get_specific_material(material_id : int):
    session = get_session()

    statement = select(Material).where(Material.materialId == material_id)
    result = session.exec(statement)
    material = result.first()

    session.close()

    return material

def create_new_material(courseId : int, title : str, json : str):
    session = get_session()

    material = Material(courseId=courseId, title=title)
    try:
        session.add(material)
        session.commit()
        session.refresh(material)
    except SQLAlchemyError:
        session.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please check your input'
        )

    dir = os.path.dirname(__file__)
    path = os.path.join(dir, '..', 'courses', 'course-' + str(courseId), 'material-' + str(material.materialId) + '.json')
    dirpath = os.path.join(dir, '..', 'courses', 'course-' + str(courseId))

    if(not os.path.exists(dirpath)):
        os.makedirs(dirpath)
    
    file = open(path, 'w')
    file.write(json)
    file.close()

    material.path = path
    session.add(material)
    session.commit()
    session.refresh(material)
    session.close()

    return material

def update_material(material_id : int , title : str | None, json : str):
    session = get_session()

    statement = select(Material).where(Material.materialId == material_id)
    result = session.exec(statement)
    material = result.first()

    if not material:
        return False
    
    if title:
        material.title = title
        session.add(material)
        session.commit()
        
    file = open(material.path, 'w')
    file.write(json)
    file.close()

    session.close()

    return True

def delete_material(material_id : int):
    session = get_session()
    session.exec(
        text("DELETE FROM tbl_material_notifications WHERE materialID = :id").params(id=material_id)
    )
    statement = select(Material).where(Material.materialId == material_id)
    result = session.exec(statement)
    material = result.first()

    if not material:
        return False

    session.delete(material)
    session.commit()
    session.close()

    return True