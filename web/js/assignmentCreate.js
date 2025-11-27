const GATEWAY = 'http://localhost:8000'
let currentUser = null
let token = null
let currentRole = null
let courseId = null

async function ready() {
    let assignmentAction = document.getElementById('assignment-action')
    assignmentAction.textContent = 'Loading. Please Wait'

    const storedRole = localStorage.getItem('lms_role');
    token = localStorage.getItem('token');

    if (!storedRole || !token || storedRole !== 'teacher') {
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

    assignmentAction.textContent = "Create New Assignment"

    // handles dashboard button
    initializeDashboardBtn()

    let saveBtn = document.getElementById('saveBtn')

    saveBtn.addEventListener('click', async () => {
        if (await inputValid()) {
            let title = document.getElementById('title').value.trim();
            let description = document.getElementById('description').value.trim();
            let deadline = document.getElementById('deadline').value;
            let filetype = document.getElementById('filetype').value;

            url = GATEWAY + '/homework'
            body = { 
                'courseId': courseId, 
                'title': title, 
                'description': description,
                'deadline': deadline,
                'filetype': filetype
            }
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(async (response) => {
                if (response.ok) {
                    // after creating assignment, go back to the course dashboard
                    let redirectUrl = '../course.html'
                    if (courseId) {
                        redirectUrl += '?courseId=' + courseId
                    }
                    window.location.replace(redirectUrl);
                    return;
                } else {
                    alert('Failed to create assignment')
                }
            })
        } else {
            let title = document.getElementById('title').value.trim();
            let description = document.getElementById('description').value.trim();
            let deadline = document.getElementById('deadline').value;

            if (title.length == 0) {
                alert('Title cannot be empty')
                return;
            }
            if (description.length == 0) {
                alert('Description cannot be empty')
                return;
            }
            if (!deadline) {
                alert('Deadline must be set')
                return;
            }
        }
    })
}

async function inputValid() {
    let title = document.getElementById('title').value.trim();
    let description = document.getElementById('description').value.trim();
    let deadline = document.getElementById('deadline').value;

    if (title.length == 0) {
        return false
    } else if (description.length == 0) {
        return false
    } else if (!deadline) {
        return false
    }

    return true
}

function initializeDashboardBtn() {
    let dashboardBtn = document.getElementById('dashboard-link')

    dashboardBtn.addEventListener('click', () => {
        let url = '../course.html'
        if (courseId) {
            url += '?courseId=' + courseId
        }
        window.location.replace(url)
        return
    });
}

function getQueryParam() {
    const url = new URL(window.location.href)
    let queryParams = new URLSearchParams(url.search)
    courseId = parseInt(queryParams.get('courseId'))
    console.log('CourseID is ', courseId)
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
