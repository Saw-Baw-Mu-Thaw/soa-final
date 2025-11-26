// ===========================
// MATERIAL MANAGEMENT
// ===========================

// redirects to material create page
function createMaterial(courseId) {
    let url = './material/create.html?courseId=' + courseId
    window.location.replace(url)
    return
}

function editMaterial(materialId) {
    // use currentCourseId so that the editor page can redirect back to this course
    let url = './material/edit.html?materialId=' + materialId
    if (currentCourseId) {
        url += '&courseId=' + currentCourseId
    }
    window.location.replace(url)
    return;
}

async function deleteMaterial(materialId) {
    let url = GATEWAY + '/materials/' + materialId
    await fetch(url, {
        method : 'DELETE',
        headers : {
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }
    }).then((response) => {
        if(response.ok) {
            window.location.reload()
            return
        }
    })
}

function viewMaterial(materialId) {
    // for students, also include courseId when available so they can return to the same course view
    let url = './material/view.html?materialId=' + materialId
    if (currentCourseId) {
        url += '&courseId=' + currentCourseId
    }
    window.location.replace(url);
    return;
}
