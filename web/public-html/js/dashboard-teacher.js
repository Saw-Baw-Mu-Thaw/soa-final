// ===========================
// TEACHER VIEWS
// ===========================
async function loadTeacherCourses() {
    const container = document.getElementById('content-area');
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
            <div class="card" onclick="goToCourseDashboard(${c['courseId']})">
                <h3>${c['name']}</h3>
                <button class="btn-primary" style="margin-top:10px">Manage Course</button>
            </div>
        `;
    });

    if (myTeaching.length === 0) html += `<p>No courses assigned.</p>`;
    html += `</div>`;
    container.innerHTML = html;
}

// Navigate to dedicated course dashboard
function goToCourseDashboard(courseId) {
    window.location.href = `course.html?courseId=${courseId}`;
}
