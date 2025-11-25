// --- MOCK DATABASE (Based on your SQL Dump) ---
const DB = {
    courses: [
        { id: 1, name: 'Introduction to Programming (Python)', teacherId: 1, majorId: 1 },
        { id: 2, name: 'Introduction to Machine Learning', teacherId: 2, majorId: 2 },
        { id: 3, name: 'Data Structures and Algorithms', teacherId: 4, majorId: 1 },
        { id: 4, name: 'Web Application Programming', teacherId: 3, majorId: 1 },
        { id: 5, name: 'Sculpture and Form', teacherId: 2, majorId: 2 }
    ],
    teachers: [
        { id: 1, name: 'Dr. Alan Turing', email: 'alan.t@university.edu' },
        { id: 2, name: 'Prof. Georgia OKeeffe', email: 'georgia.o@university.edu' },
        { id: 3, name: 'Ms. Betty Friedan', email: 'betty.f@university.edu' },
        { id: 4, name: 'Dr. Grace Hopper', email: 'grace.h@university.edu' }
    ],
    students: [
        { id: 1, name: 'Saw Baw Mu Thaw', email: 'thawthibaw@gmail.com', enrolled: [1, 3, 4] },
        { id: 2, name: 'Saw Harry', email: 'vestarex20@gmail.com', enrolled: [1, 3, 4] }
    ]
};

// URLS
const GATEWAY = "http://localhost:8000"

// --- GLOBAL STATE ---
let currentUser = null;
let token = null;
let currentRole = null;
let courses = []
let teachers = []

// --- INITIALIZATION ---
async function initDashboard(expectedRole) {
    // 1. Check Auth
    const storedRole = localStorage.getItem('lms_role');
    const storage_token = localStorage.getItem('token');
    token = storage_token

    if (!storedRole || storedRole !== expectedRole) {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = 'index.html';
        return;
    }

    currentRole = storedRole;

    // setting current user
    url = GATEWAY + '/auth/me'
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json()
            console.log('Current User Info\n' + json)
            currentUser = json
        } else {
            console.log('Something went wrong')
        }
    })

    // 2. Load User Data
    if (currentRole === 'student') {
        loadStudentCourses();
    } else if (currentRole === 'teacher') {
        loadTeacherCourses();
    } else {
        loadFacultyCourses();
    }

    // 3. Update Header
    if (currentUser) {
        document.getElementById('user-name').innerText = currentUser['name'];
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// --- STUDENT VIEWS ---
async function loadStudentCourses() {
    const container = document.getElementById('content-area');
    let myCourses = []
    let url = GATEWAY + "/course/student"
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json()
            console.log('Courses')
            myCourses = json
            courses = myCourses
        } else {
            console.log('Could not fetch courses')
        }
    })

    let html = `<h2>My Enrolled Courses</h2><div class="course-grid">`;

    myCourses.forEach(c => {
        html += `
            <div class="card" onclick="viewCourseDetail(${c['courseId']})">
                <h3>${c['name']}</h3>
                <p><strong>Instructor:</strong> ${c['teacherName'] ? c['teacherName'] : 'TBD'}</p>
                <button class="btn-primary" style="margin-top:10px">Enter Class</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// --- TEACHER VIEWS ---
async function loadTeacherCourses() {
    const container = document.getElementById('content-area');
    // const myTeaching = DB.courses.filter(c => c.teacherId === currentUser.id);
    let myTeaching = []

    let url = GATEWAY + '/course/teacher'
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            console.log("Teacher's courses\n" + json)
            myTeaching = json
            courses = myTeaching
        } else {
            console.log("Could not fetch teacher's courses")
        }
    })

    let html = `<h2>Courses You Are Teaching</h2><div class="course-grid">`;

    myTeaching.forEach(c => {
        html += `
            <div class="card" onclick="viewCourseDetail(${c['courseId']})">
                <h3>${c['name']}</h3>
                <p style="color:var(--secondary)">Pending: 2 Assignments to grade</p>
                <button class="btn-primary" style="margin-top:10px">Manage Course</button>
            </div>
        `;
    });

    if (myTeaching.length === 0) html += `<p>No courses assigned.</p>`;
    html += `</div>`;
    container.innerHTML = html;
}

// --- FACULTY VIEWS ---
async function loadFacultyCourses() {
    const container = document.getElementById('content-area');

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>All Active Courses</h2>
            <button class="btn-secondary" onclick="alert('Create Modal')">+ Add New Course</button>
        </div>
        <table>
            <thead><tr><th>ID</th><th>Course Name</th><th>Instructor</th><th>Major</th><th>Actions</th></tr></thead>
            <tbody>
    `;

    let courses = []
    let url = GATEWAY + '/course/head'

    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            courses = json
        } else {
            console.log('Could not fetch faculty\'s courses')
        }
    })

    courses.forEach(c => {
        html += `
            <tr>
                <td>${c['courseId']}</td>
                <td><strong>${c['name']}</strong></td>
                <td>${c['teacherName'] ? c['teacherName'] : '<span style="color:red">Unassigned</span>'}</td>
                <td>${c['major']}</td>
                <td>
                    <button class="btn-primary" style="padding:5px 10px; font-size:0.8rem">Edit</button>
                    <button class="btn-secondary" style="padding:5px 10px; font-size:0.8rem">Delete</button>
                </td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function loadFacultyPeople() {
    const container = document.getElementById('content-area');
    let html = `<h2>People Management</h2>`;

    let teachers = []

    let url = GATEWAY + '/course/teachers'
    await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            teachers = json
        } else {
            console.log('Could not fetch teachers in faculty')
        }
    })

    html += `<h3>Teachers</h3>
            <table>
            <tr><th>ID</th><th>Name></th><th>Email</th><th>Action</th></tr>`

    teachers.forEach(t => {
        html += `<tr><td>${t['teacherId']}</td><td>${t['name']}</td><td>${t['email']}</td><td><button class="btn-secondary" style="padding:5px">Remove</button></td></tr>`
    })

    html += '</table>'

    // // Teachers Table
    // html += `<h3>Teachers</h3>
    // <table>
    //     <tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr>
    //     ${DB.teachers.map(t => `<tr><td>${t.id}</td><td>${t.name}</td><td>${t.email}</td><td><button class="btn-secondary" style="padding:5px">Remove</button></td></tr>`).join('')}
    // </table>`;

    html += '<h3 style="margin-top:30px">Students</h3><table>'

    let students = []

    url = GATEWAY + '/course/faculty/students'
    await fetch(url, {
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if(response.ok) {
            students = json
        }else{
            console.log('Could not fetch students in faculty')
        }
    })

    students.forEach(s => {
        html += `<tr><th>${s['studentId']}</th><th>${s['name']}</th><th>${s['email']}</th>`
    })
    html += '</table>'

    // // Students Table
    // html += `<h3 style="margin-top:30px">Students</h3>
    // <table>
    //     <tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr>
    //     ${DB.students.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.email}</td><td><button class="btn-secondary" style="padding:5px">Expel</button></td></tr>`).join('')}
    // </table>`;

    container.innerHTML = html;
}

// ... [Previous DB and Init code remains the same] ...

// --- SHARED DETAIL VIEW (Updated) ---
async function viewCourseDetail(courseId) {
    // const course = DB.courses.find(c => c.id === courseId);
    // const teacher = DB.teachers.find(t => t.id === course.teacherId);

    let course = null
    courses.forEach(c => {
        if(c['courseId'] == courseId) {
            course = c
        }
    })
    const container = document.getElementById('content-area');

    // Header Controls
    let topControls = '';

    // Lecture Section Header Controls
    let lectureControls = '';

    if (currentRole === 'teacher') {
        // Teacher sees "Add" button in lecture section
        lectureControls = `
            <button class="btn-add" onclick="createMaterial(${course['courseId']})" title="Add Lecture">
                <i class="fas fa-plus"></i>
            </button>`;

        // Teacher specific top controls
        topControls = `<button class="btn-primary" onclick="alert('View Submissions')">Check Submissions</button>`;
    } else {
        // Student status
        topControls = `<span style="color:green; font-weight:bold"><i class="fas fa-check-circle"></i> Enrolled</span>`;
    }

    // Generate Lecture List HTML
    // We mock a list of lectures here. In real app, filter DB.lectures by courseId
    // const lectures = [
    //     { id: 101, title: 'Week 1: Course Introduction' },
    //     { id: 102, title: 'Week 2: Core Concepts' }
    // ];

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

        lectureListHTML += `
            <div class="lecture-item">
                <div>
                    <h4 style="margin:0;">${lec['title']}</h4>
                </div>
                ${menuHTML}
            </div>
        `;
    });

    // container.innerHTML = `
    //     <div class="course-header-banner">
    //         <div>
    //             <button onclick="${currentRole === 'student' ? 'loadStudentCourses()' : 'loadTeacherCourses()'}" 
    //                 style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:1rem; padding:0;">
    //                 &larr; Back to Dashboard
    //             </button>
    //             <h1 style="margin:10px 0;">${course['name']}</h1>
    //             <p>Instructor: ${teacher ? teacher.name : 'TBD'}</p>
    //         </div>
    //         <div>${topControls}</div>
    //     </div>

    //     <div class="course-content">
    //         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
    //             <h3>Lectures</h3>
    //             ${lectureControls}
    //         </div>
            
    //         ${lectureListHTML}

    //         <h3 style="margin-top:30px">Assignments</h3>
    //         <div class="module">
    //             <h4>Homework 1: Setup Environment</h4>
    //             <p>Deadline: Nov 30, 2025</p>
    //             ${currentRole === 'student' ? '<button class="btn-primary">Submit Work</button>' : '<span>0 Submissions</span>'}
    //         </div>
    //     </div>
    // `;

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
                ${lectureControls}
            </div>
            
            ${lectureListHTML}

            <h3 style="margin-top:30px">Assignments</h3>
            <div class="module">
                <h4>Homework 1: Setup Environment</h4>
                <p>Deadline: Nov 30, 2025</p>
                ${currentRole === 'student' ? '<button class="btn-primary">Submit Work</button>' : '<span>0 Submissions</span>'}
            </div>
        </div>
    `;

    container.innerHTML = innerHTML;
}

// --- HELPER FOR DROPDOWN ---
function toggleMenu(id) {
    // Close all other dropdowns first
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i].id !== `dropdown-${id}`) {
            dropdowns[i].classList.remove('show');
        }
    }
    // Toggle current
    document.getElementById(`dropdown-${id}`).classList.toggle("show");
}

// redirects to material create page
function createMaterial(courseId) {
    let url = './material/create.html?courseId=' + courseId
    window.location.replace(url)
    return
}

function editMaterial(materialId) {
    let url = './material/edit.html?materialId=' + materialId
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
    let url = './material/view.html?materialId=' + materialId
    window.location.replace(url);
    return;
}