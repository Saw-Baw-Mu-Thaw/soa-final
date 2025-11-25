const GATEWAY = "http://localhost:8000"
let currentUser = null
let token = null
let currentRole = null
let teachers = null
let majors = null

async function ready() {
    const storedRole = localStorage.getItem('lms_role');
    token = localStorage.getItem('token');

    let inputForm = document.getElementById('input-form')
    inputForm.style.display = 'none'

    if(!storedRole || !token || storedRole != 'faculty') {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = '../index.html';
        return;
    }

    currentRole = storedRole

    await fetchUser();

    if(currentUser) {
        document.getElementById('user-name').innerText = currentUser['name'];
    }

    await fetchTeachers()

    await fetchMajors()

    
    let loadingText = document.getElementById('loading-text')
    loadingText.style.display = 'none'
    inputForm.style.display = 'flex'
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

async function createCourse() {
    let name = document.getElementById('name').value
    let teacherId = document.getElementById('teacher').value
    let majorId = document.getElementById('major').value

    console.log('name' , name, '\nteacher', teacherId, '\nmajor', majorId)

    if(name.length == 0) {
        alert('Name cannot be empty')
        return
    }

    if(teacherId == null) {
        alert('Teacher is not selected')
        return
    }

    if(majorId == null) {
        alert('Major is not selected')
        return
    }

    let url = GATEWAY + '/course/create'
    let data = {'name' : name, 'majorId' : majorId, 'teacherId' : teacherId}
    await fetch(url, {
        method : 'POST',
        body : JSON.stringify(data),
        headers : {
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }
    }).then((response) => {
        if(response.ok) {
            let url = '../faculty.html'
            window.location.replace(url)
            return;
        }else{
            console.log('Could not create course')
        }
    })
}