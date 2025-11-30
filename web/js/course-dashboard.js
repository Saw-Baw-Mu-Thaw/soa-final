// ===========================
// COURSE DASHBOARD FUNCTIONALITY
// ===========================

let currentCourse = null;
let courseId = null;

async function initCourseDashboard() {
    // Get course ID from URL parameters
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    courseId = params.get('courseId');
    
    // Set global currentCourseId so assignment/material functions can use it
    currentCourseId = courseId;

    if (!courseId) {
        alert('No course specified. Redirecting to dashboard.');
        window.location.href = 'teacher.html';
        return;
    }

    // Check authentication
    const storedRole = localStorage.getItem('lms_role');
    token = localStorage.getItem('token');

    if (!storedRole || !token) {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = 'index.html';
        return;
    }

    currentRole = storedRole;

    // Fetch user info
    await fetchUserInfo();

    if (currentUser) {
        document.getElementById('user-name').innerText = currentUser['name'];
    }

    // Fetch course info
    await fetchCourseInfo();

    // Initialize back button
    initializeBackButton();

    // Show the course detail view (like the original)
    showCourseDetail();
}

async function fetchUserInfo() {
    const url = GATEWAY + '/auth/me';
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json();
            currentUser = json;
        } else {
            console.log('Could not fetch user info');
        }
    });
}

async function fetchCourseInfo() {
    // Fetch courses to find the current one - use correct endpoint based on role
    let url;
    if (currentRole === 'student') {
        url = GATEWAY + '/course/student';
    } else if (currentRole === 'teacher') {
        url = GATEWAY + '/course/teacher';
    } else {
        // For head/faculty, try teacher endpoint as fallback
        url = GATEWAY + '/course/teacher';
    }
    
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json();
            courses = json;
            // Find the current course
            currentCourse = courses.find(c => c['courseId'] == courseId);
        } else {
            console.log('Could not fetch courses');
        }
    });
}

function initializeBackButton() {
    const backBtn = document.getElementById('back-to-dashboard');
    backBtn.addEventListener('click', () => {
        // Determine which dashboard to go back to based on role
        if (currentRole === 'student') {
            window.location.href = 'student.html';
        } else if (currentRole === 'teacher') {
            window.location.href = 'teacher.html';
        } else {
            window.location.href = 'faculty.html';
        }
    });
}

// ===========================
// COURSE DASHBOARD VIEWS
// ===========================

async function showCourseDetail() {
    const container = document.getElementById('content-area');
    
    if (!currentCourse) {
        container.innerHTML = '<h2>Course not found</h2>';
        return;
    }

    // Header Controls
    let topControls = '';

    // Material Section Header Controls
    let materialControls = '';
    
    // Assignment Section Header Controls
    let assignmentControls = '';

    if (currentRole === 'teacher') {
        // Teacher sees "Add" buttons in both sections
        materialControls = `
            <button class="btn-add" onclick="createMaterial(${courseId})" title="Add Material">
                <i class="fas fa-plus"></i>
            </button>`;
            
        assignmentControls = `
            <button class="btn-add" onclick="createAssignment(${courseId})" title="Add Assignment">
                <i class="fas fa-plus"></i>
            </button>`;

        // Teacher specific top controls - removed "Check All Submissions" button
        topControls = '';
    } else {
        // Student status
        topControls = `<span style="color:green; font-weight:bold"><i class="fas fa-check-circle"></i> Enrolled</span>`;
    }

    // Fetch materials for this course
    let materials = [];
    let url = GATEWAY + '/materials?course_id=' + courseId;
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json();
            materials = json;
        } else {
            console.log('Could not fetch materials in course');
        }
    });

    let materialListHTML = '';
    materials.forEach(material => {
        let menuHTML = '';

        // ONLY Teachers get the 3-dots menu
        if (currentRole === 'teacher') {
            menuHTML = `
                <div class="menu-container">
                    <button class="three-dots-btn" onclick="toggleMenu(${material['materialId']})">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div id="dropdown-${material['materialId']}" class="dropdown-content">
                        <a href="#" onclick="editMaterial(${material['materialId']})">Edit</a>
                        <a href="#" class="delete-action" onclick="deleteMaterial(${material['materialId']})">Delete</a>
                    </div>
                </div>
            `;
        } else {
            // Students just get a view button
            menuHTML = `<button class="btn-primary" style="padding:5px 10px; font-size:0.8rem" onclick="viewMaterial(${material['materialId']})">View</button>`;
        }

        materialListHTML += `
            <div class="lecture-item">
                <div>
                    <h4 style="margin:0;">${material['title']}</h4>
                </div>
                ${menuHTML}
            </div>
        `;
    });

    // Fetch assignments for this course
    let assignments = await loadAssignments(courseId);
    
    let assignmentListHTML = '';
    assignments.forEach(assignment => {
        let assignmentMenuHTML = '';

        if (currentRole === 'teacher') {
            assignmentMenuHTML = `
                <div class="menu-container">
                    <button class="three-dots-btn" onclick="toggleMenu('assignment-${assignment['homeworkId']}')" >
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div id="dropdown-assignment-${assignment['homeworkId']}" class="dropdown-content">
                        <a href="#" onclick="editAssignment(${assignment['homeworkId']})">Edit</a>
                        <a href="#" onclick="viewSubmissions(${assignment['homeworkId']})">View Submissions</a>
                        <a href="#" class="delete-action" onclick="deleteAssignment(${assignment['homeworkId']})">Delete</a>
                    </div>
                </div>
            `;
        } else {
            // Students get submit/view button
            assignmentMenuHTML = `<button class="btn-primary" style="padding:5px 10px; font-size:0.8rem" onclick="viewAssignment(${assignment['homeworkId']})">View Details</button>`;
        }

        // Format deadline
        let deadline = new Date(assignment['deadline']).toLocaleDateString();
        
        assignmentListHTML += `
            <div class="lecture-item">
                <div>
                    <h4 style="margin:0;">${assignment['title']}</h4>
                    <p style="margin:5px 0; color:var(--secondary)">Due: ${deadline}</p>
                </div>
                ${assignmentMenuHTML}
            </div>
        `;
    });

    let innerHTML = `
        <div class="course-header-banner">
            <div>
                <button onclick="goBackToDashboard()" 
                    style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:1rem; padding:0; font-weight:500;">
                    &larr; Back to Dashboard
                </button>
                <h1 style="margin:10px 0;">${currentCourse['name']}</h1>`;

    if(currentRole == 'student') {
        innerHTML += `<p>Instructor: ${currentCourse['teacherName'] ? currentCourse['teacherName'] : 'TBD'}</p>`;
    }

    innerHTML += `</div>
            <div>${topControls}</div>
        </div>

        <div class="course-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3>Materials</h3>
                ${materialControls}
            </div>
            
            ${materialListHTML}

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; margin-top:30px;">
                <h3>Assignments</h3>
                ${assignmentControls}
            </div>
            
            ${assignmentListHTML}
        </div>
    `;

    container.innerHTML = innerHTML;
}

function goBackToDashboard() {
    // Determine which dashboard to go back to based on role
    if (currentRole === 'student') {
        window.location.href = 'student.html';
    } else if (currentRole === 'teacher') {
        window.location.href = 'teacher.html';
    } else {
        window.location.href = 'faculty.html';
    }
}


