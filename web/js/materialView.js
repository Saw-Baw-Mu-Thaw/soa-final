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

    // Allow both students and teachers to view materials
    if (!storedRole || !token || (storedRole !== 'student' && storedRole !== 'teacher')) {
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
        // Redirect based on role
        if (currentRole === 'student') {
            window.location.href = '../student.html';
        } else {
            window.location.href = '../teacher.html';
        }
        return;
    }

    await initializeEditor();

    initializeDashboardBtn()
}

function initializeDashboardBtn() {
    let dashboardBtn = document.getElementById('dashboard-link')
    dashboardBtn.addEventListener('click', () => {
        // go back to the appropriate dashboard based on role
        let url = currentRole === 'student' ? '../student.html' : '../teacher.html'
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

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            const json = await response.json()
            
            // Check if json field exists and is valid
            if (json && json['json']) {
                try {
                    data = JSON.parse(json['json'])
                } catch (parseError) {
                    console.error('Error parsing material JSON:', parseError)
                    alert("Could not parse material content")
                    data = { blocks: [] } // Use empty content as fallback
                }
            } else {
                console.error('Invalid response structure:', json)
                alert("Invalid material data structure")
                data = { blocks: [] } // Use empty content as fallback
            }
            
            title = json['title'] || 'Untitled Material'
        } else {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            console.error('Could not fetch material data:', response.status, errorData)
            alert(errorData.detail || "Could not fetch material data")
            data = { blocks: [] } // Use empty content as fallback
        }
    } catch (error) {
        console.error('Network error fetching material:', error)
        alert("Network error: Could not connect to server")
        data = { blocks: [] } // Use empty content as fallback
    }

    // Ensure data is always a valid object for EditorJS
    if (!data || typeof data !== 'object') {
        data = { blocks: [] }
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
        data: data,
        readOnly: true,
        onReady: () => {
            let materialTitle = document.getElementById('material-title')
            materialTitle.textContent = title || 'Material'
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
            console.log('Something went wrong')
        }
    })
}


function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}