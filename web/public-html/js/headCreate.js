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
            showAlert('Could not fetch teachers')
        }
    }).catch(() => {
        if (!checkInternetConnection()) {
            showAlert('Something went wrong')
            return;
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
            // console.log("Could not fetch majors in faculty")
            showAlert("Could not fetch majors in faculty")
        }
    }).catch(() => {
        if (!checkInternetConnection()) {
            showAlert('Something went wrong')
            return;
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
            showAlert('Couldn\'t fetch user')
            return;
        }
    }).catch(() => {
        if (!checkInternetConnection()) {
            showAlert('Something went wrong')
            return;
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
        showAlert("Name cannot be empty")
        return
    }

    if(teacherId == null) {
        showAlert("Teacher is not selected")
        return
    }

    if(majorId == null) {
        showAlert('Major is not selected')
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
            showAlert("Could not create course")
        }
    }).catch(() => {
        if (!checkInternetConnection()) {
            showAlert('Something went wrong')
            return;
        }
    })
}

function showAlert(title, description = "Dialog will close in 3 seconds") {
    let modal = document.getElementById('alertModal')
    let span = document.getElementsByClassName('close-btn')[0]
    let footerBtn = document.getElementById('closeModalFooterBtn')

    let titleElem = document.getElementById('modalTitle')
    let descriptionElem = document.getElementById('modalSubdescription')

    titleElem.textContent = title
    if (description.length != 0) {
        descriptionElem.textContent = description
    }

    span.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    footerBtn.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none'
        }
    })

    modal.style.display = 'block';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000)
}

function checkInternetConnection() {
    if (!navigator.onLine) {
        showAlert('Not Connected', 'Please check your connection')
        return true;
    }
    return false;
}