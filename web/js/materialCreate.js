const GATEWAY = 'http://localhost:8000'
let currentUser = null
let token = null
let currentRole = null
let editor = null
let courseId = null

async function ready() {

    let materialAction = document.getElementById('material-action')
    materialAction.textContent = 'Loading. Please Wait'

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
        onReady: () => {
            materialAction.textContent = "Create New Material"
        }
    })

    // handles dashboard button
    initializeDashboardBtn()

    let saveBtn = document.getElementById('saveBtn')

    saveBtn.addEventListener('click', async () => {

        if (await inputValid()) {
            let title = document.getElementById('title').value.trim();
            let json = ""

            await editor.save().then((outputData) => {
                json = JSON.stringify(outputData)
            })

            url = GATEWAY + '/materials'
            body = { 'courseId': courseId, 'title': title, 'json' : json}
            await fetch(url, {
                method: 'POST',
                body : JSON.stringify(body),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(async (response) => {
                if(response.ok) {
                    // after creating material, go back to the course dashboard
                    let redirectUrl = '../course.html'
                    if (courseId) {
                        redirectUrl += '?courseId=' + courseId
                    }
                    window.location.replace(redirectUrl);
                    return;
                }
            })
        } else {
            let title = document.getElementById('title').value.trim();
            let json = ""

            if(title.length == 0) {
                alert('Title cannot be empty')
                return;
            }

            await editor.save().then((outputData) => [
                json = JSON.stringify(outputData)
            ])

            if(json.length == 0) {
                alert('Content cannot be empty')
            }
        }


    })

}

async function inputValid() {
    let title = document.getElementById('title').value.trim();
    let json = ""
    await editor.save().then((outputData) => {
        json = JSON.stringify(outputData)
    })

    if(title.length == 0) {
        return false
    } else if(json.length == 0) {
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
        }
    );
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