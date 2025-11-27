// ===========================
// FACULTY (HEAD) VIEWS
// ===========================
async function loadFacultyCourses() {
    const container = document.getElementById('content-area');

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>All Active Courses</h2>
            <div>
                <button class="btn-primary" onclick="loadFacultyPeople()" style="margin-right:10px;">People Management</button>
                <button class="btn-secondary" onclick="createCourse()">+ Add New Course</button>
            </div>
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
                    <button class="btn-primary" style="padding:5px 10px; font-size:0.8rem" onclick="editCourse(${c['courseId']})">Edit</button>
                </td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function loadFacultyPeople() {
    const container = document.getElementById('content-area');
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>People Management</h2>
            <button class="btn-primary" onclick="loadFacultyCourses()">← Back to Courses</button>
        </div>
    `;

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

    container.innerHTML = html;
}
