// --- CONFIG & GLOBAL STATE ---
const GATEWAY = "http://localhost:8000"

// Logged in user and auth state
let currentUser = null;
let token = null;
let currentRole = null;

// Cached data for the current dashboard view
let courses = []
let teachers = []

// Currently selected course (used when navigating to material pages and back)
let currentCourseId = null;

// --- INITIALIZATION / AUTH ---
async function initDashboard(expectedRole) {
    // 1. Check Auth
    const storedRole = localStorage.getItem('lms_role');
    const storage_token = localStorage.getItem('token');
    token = storage_token

    if (!storedRole || storedRole !== expectedRole) {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = 'index.html';
        return;
    }

    currentRole = storedRole;

    // setting current user
    url = GATEWAY + '/auth/me'
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

    // 2. Load User Data by role
    if (currentRole === 'student') {
        loadStudentCourses();
    } else if (currentRole === 'teacher') {
        loadTeacherCourses();
    } else {
        loadFacultyCourses();
    }

    // 3. Update Header
    if (currentUser) {
        document.getElementById('user-name').innerText = currentUser['name'];
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// --- HELPER FOR DROPDOWN ---
function toggleMenu(id) {
    // Close all other dropdowns first
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i].id !== `dropdown-${id}`) {
            dropdowns[i].classList.remove('show');
        }
    }
    // Toggle current
    document.getElementById(`dropdown-${id}`).classList.toggle("show");
}
