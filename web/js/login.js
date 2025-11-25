let currentTab = 'student';
const GATEWAY = "http://localhost:8000"

function fn() {
    // executed when page finishes loading
    console.log('hiding error text')
    let errorText = document.getElementById('errorText')
    errorText.style.display = 'none';
}

function switchLoginTab(role) {
    currentTab = role;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const titles = {
        'student': 'Student Login',
        'teacher': 'Teacher Login',
        'faculty': 'Faculty Head Login'
    };
    document.getElementById('login-role-title').innerText = titles[role];
}

function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    url = GATEWAY + '/auth/login/'

    if (currentTab === 'student') {
        url += 'student'
    } else if (currentTab === 'teacher') {
        url += 'teacher'
    } else {
        url += 'head'
    }

    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    let token = ""

    fetch(url, {
        method: 'POST',
        body: formData
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            localStorage.setItem('lms_role', currentTab)
            localStorage.setItem('token', json['access_token'])

            if (currentTab === 'student') {
                window.location.href = 'student.html';
            } else if (currentTab === 'teacher') {
                window.location.href = 'teacher.html';
            } else if (currentTab === 'faculty') {
                window.location.href = 'faculty.html';
            }
        }
        else {
            // show error
            showError();
        }

    })

}

function showError() {
    let errorText = document.getElementById('errorText')
    errorText.style.display = '';
    setTimeout(() => {
        errorText.style.display = 'none';
    }, 3000);
}

fn();