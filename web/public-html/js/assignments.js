// ===========================
// ASSIGNMENT/HOMEWORK MANAGEMENT
// ===========================

// Fetch assignments for a specific course
async function loadAssignments(courseId) {
    let assignments = []
    let url = GATEWAY + '/homework?course=' + courseId
    
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json()
            assignments = json
        } else {
            console.log('Could not fetch assignments for course')
        }
    })
    
    return assignments
}

// Create new assignment (for teachers)
function createAssignment(courseId) {
    let url = './assignment/create.html?courseId=' + courseId
    window.location.replace(url)
    return
}

// Edit assignment (for teachers)
function editAssignment(assignmentId, courseId) {
    let url = './assignment/edit.html?assignmentId=' + assignmentId
    url += '&courseId=' + courseId

    window.location.replace(url)
    return
}

// View assignment details (for students and teachers)
function viewAssignment(assignmentId, currentCourseId) {
    let url = './assignment/view.html?assignmentId=' + assignmentId
    if (currentCourseId) {
        url += '&courseId=' + currentCourseId
    }
    window.location.replace(url)
    return
}

// Delete assignment (for teachers)
async function deleteAssignment(assignmentId) {
    if (!confirm('Are you sure you want to delete this assignment?')) {
        return
    }
    
    let url = GATEWAY + '/homework/' + assignmentId
    await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (response.ok) {
            window.location.reload()
            return
        } else {
            alert('Failed to delete assignment')
        }
    })
}

// Submit assignment (for students)
function submitAssignment(assignmentId) {
    let url = './assignment/submit.html?assignmentId=' + assignmentId
    if (currentCourseId) {
        url += '&courseId=' + currentCourseId
    }
    window.location.replace(url)
    return
}

// View submissions (for teachers)
function viewSubmissions(assignmentId, courseId) {
    let url = './assignment/submissions.html?assignmentId=' + assignmentId
    url += '&courseId=' + courseId
    window.location.replace(url)
    return
}
