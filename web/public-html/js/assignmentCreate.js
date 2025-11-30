const GATEWAY = 'http://localhost:8000'
let currentUser = null
let token = null
let currentRole = null
let courseId = null

async function ready() {
    let assignmentAction = document.getElementById('assignment-action')
    assignmentAction.textContent = 'Loading. Please Wait'

    let spinner = document.getElementById('loadingSpinner')
    spinner.style.display = 'none'

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
            
            startLoading();

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
                    stopLoading("Create Assignment")

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

            stopLoading("Create Assignment")

            let title = document.getElementById('title').value.trim();
            let description = document.getElementById('description').value.trim();
            let deadline = document.getElementById('deadline').value;

            if (title.length == 0) {
                showAlert('Title cannot be empty')
                return;
            }
            if (description.length == 0) {
                showAlert('Description cannot be empty')
                return;
            }
            if (!deadline) {
                showAlert('Deadline must be set')
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

function startLoading() {
    // for loading
    let button = document.getElementsByClassName('submitButton')[0]
    let buttonText = document.getElementById('buttonText')
    let spinner = document.getElementById('loadingSpinner')

    button.disabled = true
    buttonText.hidden = true
    spinner.style.display = 'inline-block'
}

function stopLoading(btnText = "Log In") {
    let button = document.getElementsByClassName('submitButton')[0]
    let buttonText = document.getElementById('buttonText')
    let spinner = document.getElementById('loadingSpinner')

    button.disabled = false
    buttonText.textContent = btnText
    buttonText.hidden = false
    spinner.style.display = 'none'
}