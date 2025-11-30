// ===========================
// ASSIGNMENT/HOMEWORK MANAGEMENT
// ===========================

// Fetch assignments for a specific course
async function loadAssignments(courseId) {
    let assignments = []
    let url = GATEWAY + '/homework?course=' + courseId
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        
        if (response.ok) {
            const json = await response.json()
            // Ensure assignments is always an array
            assignments = Array.isArray(json) ? json : []
        } else {
            console.log('Could not fetch assignments for course:', response.status)
            assignments = [] // Ensure it's an array even on error
        }
    } catch (error) {
        console.error('Error fetching assignments:', error)
        assignments = [] // Ensure it's an array on network error
    }
    
    return assignments
}

// Create new assignment (for teachers)
function createAssignment(courseId) {
    let url = './assignment/create.html?courseId=' + courseId
    window.location.replace(url)
    return
}

// Edit assignment (for teachers)
function editAssignment(assignmentId) {
    let url = './assignment/edit.html?assignmentId=' + assignmentId
    if (currentCourseId) {
        url += '&courseId=' + currentCourseId
    }
    window.location.replace(url)
    return
}

// View assignment details (for students and teachers)
function viewAssignment(assignmentId) {
    let url = './assignment/view.html?assignmentId=' + assignmentId
    // Only add courseId if it's valid (not null, undefined, 0, or empty string)
    if (currentCourseId && currentCourseId !== '0' && currentCourseId !== 0) {
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
function viewSubmissions(assignmentId) {
    let url = './assignment/submissions.html?assignmentId=' + assignmentId
    if (currentCourseId) {
        url += '&courseId=' + currentCourseId
    }
    window.location.replace(url)
    return
}
