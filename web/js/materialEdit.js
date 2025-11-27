const GATEWAY = 'http://localhost:8000'
let saved = true
let currentUser = null
let token = null
let currentRole = null
let editor = null
let materialId = null
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

    await initializeEditor(materialAction);

    initializeDashboardBtn()

    initializeSaveBtn()

    initializeSaveAndLeaveBtn()

    initializeSaveWithoutLeavingBtn()
}

function initializeSaveWithoutLeavingBtn() {
    let saveWithoutLeavingBtn = document.getElementById('saveWithoutLeavingBtn')

    saveWithoutLeavingBtn.addEventListener('click', () => {
        // leave editor without saving and go back to the course dashboard
        let url = '../course.html'
        if (courseId) {
            url += '?courseId=' + courseId
        }
        window.location.replace(url)
        return
    })
}

function initializeSaveAndLeaveBtn() {
    let saveAndLeaveBtn = document.getElementById('saveAndLeaveBtn')
    saveAndLeaveBtn.addEventListener('click', async () => {
        let title = document.getElementById('title').value.trim()
        let json = ""
        let editorData = null

        try {
            editorData = await editor.save()
            json = JSON.stringify(editorData)
        } catch (error) {
            console.error('Error saving editor data:', error)
            alert('Error saving editor content. Please try again.')
            return
        }

        if (title.length == 0) {
            alert('Title cannot be empty')
            return
        }
        
        // Better validation for EditorJS content
        if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
            alert('Content cannot be empty')
            return
        }

        let url = GATEWAY + '/materials/' + materialId
        let body = { 'title': title, 'json': json }

        console.log('Saving material (Save and Leave):', { materialId, title, jsonLength: json.length })

        try {
            const response = await fetch(url, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                saved = true
                let saveStatusText = document.getElementById('saveStatusText')
                saveStatusText.textContent = 'Saved'
                saveStatusText.style.color = '#00ff00'

                console.log('Material saved successfully, redirecting...')
                // after save-and-leave, go back to the course dashboard
                let redirectUrl = '../course.html'
                if (courseId) {
                    redirectUrl += '?courseId=' + courseId
                }
                window.location.replace(redirectUrl)
                return
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('Save failed:', response.status, errorData)
                alert(`Failed to save material: ${errorData.detail || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Network error:', error)
            alert('Network error. Please check your connection and try again.')
        }
    })
}

function initializeSaveBtn() {
    let saveBtn = document.getElementById('saveBtn')

    saveBtn.addEventListener('click', async () => {
        let title = document.getElementById('title').value.trim()
        let json = ""
        let editorData = null

        try {
            editorData = await editor.save()
            json = JSON.stringify(editorData)
        } catch (error) {
            console.error('Error saving editor data:', error)
            alert('Error saving editor content. Please try again.')
            return
        }

        if (title.length == 0) {
            alert('Title cannot be empty')
            return
        }
        
        // Better validation for EditorJS content
        if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
            alert('Content cannot be empty')
            return
        }

        let url = GATEWAY + '/materials/' + materialId
        let body = { 'title': title, 'json': json }

        console.log('Saving material (Save button):', { materialId, title, jsonLength: json.length })

        try {
            const response = await fetch(url, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                saved = true
                let saveStatusText = document.getElementById('saveStatusText')
                saveStatusText.textContent = 'Saved'
                saveStatusText.style.color = '#00ff00'
                console.log('Material saved successfully')
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('Save failed:', response.status, errorData)
                alert(`Failed to save material: ${errorData.detail || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Network error:', error)
            alert('Network error. Please check your connection and try again.')
        }
    })
}

function initializeDashboardBtn() {
    let dashboardBtn = document.getElementById('dashboard-link')

    dashboardBtn.addEventListener('click', () => {
        if (saved) {
            let url = '../course.html'
            if (courseId) {
                url += '?courseId=' + courseId
            }
            window.location.replace(url)
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

    try {
        let url = GATEWAY + '/materials/' + materialId
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            let json = await response.json()
            data = json['json']
            title = json['title']
        } else {
            console.error('Could not fetch material:', response.status)
            alert('Failed to load material. Please refresh the page.')
            return
        }
    } catch (error) {
        console.error('Network error fetching material:', error)
        alert('Network error loading material. Please check your connection.')
        return
    }

    let titleElem = document.getElementById('title')
    titleElem.value = title || ''

    let parsedData = null
    try {
        parsedData = data ? JSON.parse(data) : { blocks: [] }
    } catch (error) {
        console.error('Error parsing material JSON:', error)
        parsedData = { blocks: [] }
        alert('Warning: Material content could not be loaded properly. Starting with empty content.')
    }

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
        data: parsedData,
        onChange: () => {
            saved = false
            let saveStatusText = document.getElementById('saveStatusText')
            saveStatusText.textContent = 'Not Saved'
            saveStatusText.style.color = '#ff0000'
        }
    })
}

function getQueryParam() {
    // get the material id (and optional course id) from query string
    let url = new URL(window.location.href)
    let queryParam = new URLSearchParams(url.search)

    materialId = queryParam.get('materialId')
    courseId = queryParam.get('courseId')
    console.log('Material ID is ', materialId, 'Course ID is', courseId)
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