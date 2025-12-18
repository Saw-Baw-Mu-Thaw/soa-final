// ===========================
// SHARED COURSE DETAIL VIEW
// ===========================
async function viewCourseDetail(courseId) {
    // remember which course is currently opened so material pages can link back here
    currentCourseId = courseId

    let course = null
    courses.forEach(c => {
        if(c['courseId'] == courseId) {
            course = c
        }
    })
    const container = document.getElementById('content-area');

    // Header Controls
    let topControls = '';

    // Material Section Header Controls
    let materialControls = '';
    
    // Assignment Section Header Controls
    let assignmentControls = '';

    if (currentRole === 'teacher') {
        // Teacher sees "Add" buttons in both sections
        materialControls = `
            <button class="btn-add" onclick="createMaterial(${course['courseId']})" title="Add Material">
                <i class="fas fa-plus"></i>
            </button>`;
            
        assignmentControls = `
            <button class="btn-add" onclick="createAssignment(${course['courseId']})" title="Add Assignment">
                <i class="fas fa-plus"></i>
            </button>`;

        // Teacher specific top controls
        topControls = `<button class="btn-primary" onclick="alert('View All Submissions')">Check All Submissions</button>`;
    } else {
        // Student status
        topControls = `<span style="color:green; font-weight:bold"><i class="fas fa-check-circle"></i> Enrolled</span>`;
    }

    // Fetch materials for this course
    let lectures = []
   
    let url = GATEWAY + '/materials?course_id=' + courseId
    await fetch(url, {
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if(response.ok) {
            lectures = json
        }else {
            console.log('Could not fetch lectures in course')
        }
    })

    let lectureListHTML = '';
    lectures.forEach(lec => {
        let menuHTML = '';

        // ONLY Teachers get the 3-dots menu
        if (currentRole === 'teacher') {
            menuHTML = `
                <div class="menu-container">
                    <button class="three-dots-btn" onclick="toggleMenu(${lec['materialId']})">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div id="dropdown-${lec['materialId']}" class="dropdown-content">
                        <a href="#" onclick="editMaterial(${lec['materialId']})">Edit</a>
                        <a href="#" class="delete-action" onclick="deleteMaterial(${lec['materialId']})">Delete</a>
                    </div>
                </div>
            `;
        } else {
            // Students just get a view button
            menuHTML = `<button class="btn-primary" style="padding:5px 10px; font-size:0.8rem" onclick="viewMaterial(${lec['materialId']})">View</button>`;
        }
        checkboxHtml = ''

        if(currentRole == 'student') {
            checkboxHtml += "<input type='checkbox' onchange='seenMaterial(event, " + lec['materialId'] + ")' style='margin:5px;' "
            if (lec['completed'] == true){
                checkboxHtml += " disabled checked/>"
            }else {
                checkboxHtml += "/>"
            }
        }

        lectureListHTML += `
            <div class="lecture-item">
                <div style='display:inline-block;'>
                    ${checkboxHtml}
                    <h4 style="margin:5px; display:inline">${lec['title']}</h4>
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
                <button onclick="${currentRole === 'student' ? 'loadStudentCourses()' : 'loadTeacherCourses()'}" 
                    style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:1rem; padding:0;">
                    &larr; Back to Dashboard
                </button>
                <h1 style="margin:10px 0;">${course['name']}</h1>`

    if(currentRole == 'student') {
        innerHTML += `<p>Instructor: ${course['teacherName'] ? course['teacherName'] : 'TBD'}</p>`
    }

    innerHTML += `</div>
            <div>${topControls}</div>
        </div>

        <div class="course-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3>Materials</h3>
                ${materialControls}
            </div>
            
            ${lectureListHTML}

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; margin-top:30px;">
                <h3>Assignments</h3>
                ${assignmentControls}
            </div>
            
            ${assignmentListHTML}
        </div>
    `;

    container.innerHTML = innerHTML;
}
