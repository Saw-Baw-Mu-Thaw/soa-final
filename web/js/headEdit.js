const GATEWAY = "http://localhost:8000"
let currentUser = null
let token = null
let currentRole = null
let courseId = null
let teachers = null
let majors = null
let students = null
let enrollments = null
let course = null

async function ready() {
    const storedRole = localStorage.getItem('lms_role');
    token = localStorage.getItem('token');

    let inputForm = document.getElementById('input-form')
    inputForm.style.display = 'none'
    let enrollmentTable = document.getElementById('enrollment-table')
    enrollmentTable.style.display = 'none'
    let tableLoading = document.getElementById('table-loading')
    tableLoading.style.display = 'none'

    if (!storedRole || !token || storedRole != 'faculty') {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = '../index.html';
        return;
    }

    currentRole = storedRole

    await fetchUser();

    if (currentUser) {
        document.getElementById('user-name').innerText = currentUser['name'];
    }

    getQueryParam();

    await fetchTeachers()

    await fetchMajors()

    await fetchEnrollments()

    await fetchAllStudentsInFaculty()

    initializeStudentSearch()

    await fetchCourse()

    let loadingText = document.getElementById('loading-text')
    loadingText.style.display = 'none'
    inputForm.style.display = 'flex'
    enrollmentTable.style.display = ''
}

async function fetchCourse() {

    // fetches the course and sets it
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
            for (let i = 0; i < json.length; i++) {
                const elem = json[i];

                if (elem['courseId'] == courseId) {
                    course = elem

                    let courseName = document.getElementById('name')
                    courseName.value = course['name']

                    teachers.forEach((t, idx) => {
                        if (t['teacherId'] === course['teacherId']) {
                            let teacherSelect = document.getElementById('teacher')
                            teacherSelect.selectedIndex = idx
                        }
                    });

                    majors.forEach((m, idx) => {
                        if (m['majorId'] === course['majorId']) {
                            let majorSelect = document.getElementById('major')
                            majorSelect.selectedIndex = idx
                        }
                    })
                }

            }
        }
    })
}

function initializeStudentSearch() {
    let nameSearch = document.getElementById('studentName')
    nameSearch.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            let name = nameSearch.value.trim()

            for (let i = 0; i < students.length; i++) {
                const s = students[i]

                if (s['name'].toLowerCase().includes(name.toLowerCase())) {
                    let studentSelect = document.getElementById('student')

                    studentSelect.selectedIndex = i
                    return;
                }

            }

            nameSearch.value = ''
            nameSearch.placeholder = 'Student with name not found'
        }
    })
}

function getQueryParam() {
    let url = new URL(window.location.href);
    let queryParam = new URLSearchParams(url.search)

    courseId = queryParam.get('courseId')

    if (!courseId) {
        alert('Couse ID was not given. Redirecting...')
        window.location.replace('../faculty.html')
        return;
    }
}

async function fetchAllStudentsInFaculty() {
    let url = GATEWAY + '/course/faculty/students'
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json();

        if (response.ok) {
            students = json
            let studentSelect = document.getElementById('student');

            for (let i = 0; i < students.length; i++) {
                const s = students[i];
                let option = new Option(s['name'], s['studentId'])
                studentSelect[i] = option
            }
        } else {
            console.log('Could not fetch students in faculty')
        }
    })
}

async function fetchTeachers() {
    let url = GATEWAY + '/course/teachers'
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            teachers = json

            let teacherSelect = document.getElementById('teacher')

            for (let i = 0; i < teachers.length; i++) {
                const teacher = teachers[i]
                let option = new Option(teacher['name'], teacher['teacherId'])
                teacherSelect[i] = option
            }
        }
        else {
            console.log('Could not fetch teachers')
        }
    })
}

async function fetchMajors() {
    let url = GATEWAY + '/course/faculty/majors'
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            majors = json

            let majorSelect = document.getElementById('major')
            for (let i = 0; i < majors.length; i++) {
                const m = majors[i]
                let option = new Option(m['name'], m['majorId'])
                majorSelect[i] = option
            }
        } else {
            console.log("Could not fetch majors in faculty")
        }
    })
    return url
}

async function fetchEnrollments() {
    let url = GATEWAY + '/course/students/' + courseId

    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'ContentType': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            enrollments = json

            let table = document.querySelector('table')

            let tableBody = document.getElementById('table-body')
            tableBody.innerHTML = ""

            for (let i = 0; i < enrollments.length; i++) {
                const e = enrollments[i];
                let newRow = table.insertRow(-1);
                let enrollIdCell = newRow.insertCell(0);
                enrollIdCell.innerHTML = e['enrollmentId'];
                let stdNameCell = newRow.insertCell(1);
                stdNameCell.innerHTML = e['name'];
                let stdIdCell = newRow.insertCell(2);
                stdIdCell.innerHTML = e['studentId'];
                let unenrollCell = newRow.insertCell(3);
                unenrollCell.innerHTML = `<button class='btn-secondary' onclick="unenrollStudent(${e['courseId']}, ${e['studentId']})">Unenroll</button>`;
            }
        } else {
            console.log('Could not fetch enrolled students')
        }
    })
}

async function fetchUser() {
    let url = GATEWAY + '/auth/me'
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
}

function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}

async function saveCourseEdit() {
    let url = GATEWAY + '/course/' + courseId
    let name = document.getElementById('name').value.trim()
    let teacherId = document.getElementById('teacher').value
    let majorId = document.getElementById('major').value

    if (name.length == 0) {
        alert('Course Name Cannot Be Empty')
        return;
    }

    let data = { 'name': name, 'teacherId': teacherId, 'majorId': majorId }

    await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (response.ok) {
            alert('Couse information has been updated') // replace with success popup
        } else {
            console.log('Could not update course information')
        }
    })
}

async function unenrollStudent(courseId, studentId) {
    let url = GATEWAY + '/course/enroll/' + courseId + '/' + studentId

    await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {

            let tableLoading = document.getElementById('table-loading')
            let tableEnrollment = document.getElementById('enrollment-table')
            tableLoading.style.display = 'block'
            tableEnrollment.style.display = 'none'

            deleteRows()
            await fetchEnrollments()

            tableLoading.style.display = 'none'
            tableEnrollment.style.display = ''

        } else {
            console.log("Could not unenroll student")
        }
    })
}

async function enrollStudent() {
    let url = GATEWAY + '/course/enroll'

    let studentId = document.getElementById('student').value

    let data = { 'studentId': studentId, 'courseId': courseId }

    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {

            let tableLoading = document.getElementById('table-loading')
            let tableEnrollment = document.getElementById('enrollment-table')
            tableLoading.style.display = 'block'
            tableEnrollment.style.display = 'none'

            deleteRows()
            await fetchEnrollments()

            tableLoading.style.display = 'none'
            tableEnrollment.style.display = ''

        } else {
            console.log('Could not enroll student')
        }
    })
}

function deleteRows() {
    let table = document.querySelector('table')

    for (let i = 0; i < enrollments.length; i++) {
        table.deleteRow(-1)
    }
    
}