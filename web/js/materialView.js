const GATEWAY = 'http://localhost:8000'
let currentUser = null
let token = null
let currentRole = null
let editor = null
let materialId = null
let courseId = null

async function ready() {
    let materialTitle = document.getElementById('material-title')
    materialTitle.textContent = 'Loading. Please Wait'

    const storedRole = localStorage.getItem('lms_role');
    token = localStorage.getItem('token');

    if (!storedRole || !token || storedRole !== 'student') {
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

    if (!materialId) {
        alert("No material id specified. Redirecting...");
        window.location.href = '../student.html';
        return;
    }

    await initializeEditor();

    initializeDashboardBtn()
}

function initializeDashboardBtn() {
    let dashboardBtn = document.getElementById('dashboard-link')
    dashboardBtn.addEventListener('click', () => {
        // go back to the student dashboard, ideally to the same course view
        let url = '../student.html'
        if (courseId) {
            url += '?courseId=' + courseId
        }
        window.location.replace(url)
        return
    })
}

async function initializeEditor() {
    let data = null
    let title = ""

    let url = GATEWAY + '/materials/' + materialId

    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            data = JSON.parse(json['json'])
            title = json['title']
        } else {
            // console.log('Could not fetch material data')
            showAlert("Server Error", "Could not fetch data")
        }
    }).catch(() => {
        if(!checkInternetConnection()) {
            showAlert("Something went wrong")
        }
    })

    editor = new EditorJS({
        holder: 'editorjs',
        tools: {
            header: {
                class: Header,
                config: {
                    levels: [2, 3, 4]
                }
            },
            list: EditorjsList,
            image: SimpleImage,
            embed: {
                class: Embed,
                inlineToolbar: true
            }
        },
        data: data,
        readOnly: true,
        onReady: () => {
            let materialTitle = document.getElementById('material-title')
            materialTitle.textContent = title
        }
    })


}

function getQueryParam() {
    let url = new URL(window.location.href)
    let queryParams = new URLSearchParams(url.search)

    materialId = queryParams.get('materialId')
    courseId = queryParams.get('courseId')
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
            showAlert("Couldn't fetch user")
            return;
        }
    }).catch(() => {
        if(!checkInternetConnection()) {
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