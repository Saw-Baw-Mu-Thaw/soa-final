const GATEWAY = 'http://localhost:8000'
let saved = true
let currentUser = null
let token = null
let currentRole = null
let editor = null
let materialId = null

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

    await initializeEditor(materialAction);

    initializeDashboardBtn()

    initializeSaveBtn()

    initializeSaveAndLeaveBtn()

    initializeSaveWithoutLeavingBtn()
}

function initializeSaveWithoutLeavingBtn() {
    let saveWithoutLeavingBtn = document.getElementById('saveWithoutLeavingBtn')

    saveWithoutLeavingBtn.addEventListener('click', () => {
        window.location.replace('../teacher.html')
        return
    })
}

function initializeSaveAndLeaveBtn() {
    let saveAndLeaveBtn = document.getElementById('saveAndLeaveBtn')
    saveAndLeaveBtn.addEventListener('click', async () => {
        let title = document.getElementById('title').value.trim()
        let json = ""

        await editor.save().then((outputData) => {
            json = JSON.stringify(outputData)
        })

        if (title.length == 0) {
            alert('Title cannot be empty')
            return
        }
        if (json.length == 0) {
            alert('Content cannot be empty')
            return
        }

        let url = GATEWAY + '/materials/' + materialId
        let body = { 'title': title, 'json': json }

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (response.ok) {
                saved = true
                let saveStatusText = document.getElementById('saveStatusText')
                saveStatusText.textContent = 'Saved'
                saveStatusText.style.color = '#00ff00'

                window.location.reload('../teacher.html')
                return
            }
        })
    })
}

function initializeSaveBtn() {
    let saveBtn = document.getElementById('saveBtn')

    saveBtn.addEventListener('click', async () => {
        let title = document.getElementById('title').value.trim()
        let json = ""

        await editor.save().then((outputData) => {
            json = JSON.stringify(outputData)
        })

        if (title.length == 0) {
            alert('Title cannot be empty')
            return
        }
        if (json.length == 0) {
            alert('Content cannot be empty')
            return
        }

        let url = GATEWAY + '/materials/' + materialId
        let body = { 'title': title, 'json': json }

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (response.ok) {
                saved = true
                let saveStatusText = document.getElementById('saveStatusText')
                saveStatusText.textContent = 'Saved'
                saveStatusText.style.color = '#00ff00'
            }
        })
    })
}

function initializeDashboardBtn() {
    let dashboardBtn = document.getElementById('dashboard-link')

    dashboardBtn.addEventListener('click', () => {
        if (saved) {
            window.location.replace('../teacher.html')
            return
        } else {
            var modal = document.getElementById('myModal')
            var span = document.getElementsByClassName('close')[0]

            modal.style.display = 'block'

            span.addEventListener('click', () => {
                modal.style.display = 'none'
            })
        }
    })
}

async function initializeEditor(materialAction) {
    let data = null
    let title = null

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
            data = json['json']
            title = json['title']
        } else {
            console.log('Could not fetch material')
        }
    })

    let titleElem = document.getElementById('title')
    titleElem.value = title

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
            materialAction.textContent = "Edit Material"
        },
        data: JSON.parse(data),
        onChange: () => {
            saved = false
            let saveStatusText = document.getElementById('saveStatusText')
            saveStatusText.textContent = 'Not Saved'
            saveStatusText.style.color = '#ff0000'
        }
    })
}

function getQueryParam() {
    // get the material id from query string
    let url = new URL(window.location.href)
    let queryParam = new URLSearchParams(url.search)

    materialId = queryParam.get('materialId')
    console.log('Material ID is ', materialId)
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