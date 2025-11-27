// ===========================
// STUDENT VIEWS
// ===========================
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
