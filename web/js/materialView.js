const GATEWAY = 'http://localhost:8000'
let currentUser = null
let token = null
let currentRole = null
let editor = null
let materialId = null

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
        let url = '../student.html'
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
            console.log('Could not fetch material data')
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