let currentTab = 'student';
const GATEWAY = "http://localhost:8000"

function fn() {
    // executed when page finishes loading
    console.log('hiding error text')
    let errorText = document.getElementById('errorText')
    errorText.style.display = 'none';

    let spinner = document.getElementById('loadingSpinner')
    spinner.style.display = 'none'
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

    // show loading
    startLoading()

    fetch(url, {
        method: 'POST',
        body: formData
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            localStorage.setItem('lms_role', currentTab)
            localStorage.setItem('token', json['access_token'])

            stopLoading("Log In")

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
            stopLoading('Log In');
        }

    }).catch(() => {
        if(!checkInternetConnection()){
            showAlert('Server Error', 'Couldn\'t connect to server')
        }        
        stopLoading("Log In")
    })

}

function showError() {
    let errorText = document.getElementById('errorText')
    errorText.style.display = '';
    setTimeout(() => {
        errorText.style.display = 'none';
    }, 3000);
}

function showAlert(title, description = "Dialog will close in 3 seconds") {
    let modal = document.getElementById('alertModal')
    let span = document.getElementsByClassName('close-btn')[0]
    let footerBtn = document.getElementById('closeModalFooterBtn')

    let titleElem = document.getElementById('modalTitle')
    let descriptionElem = document.getElementById('modalSubdescription')

    titleElem.textContent = title
    if(description.length != 0) {
        descriptionElem.textContent = description
    }

    span.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    footerBtn.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    window.addEventListener('click', (event) => {
        if(event.target == modal) {
            modal.style.display = 'none'
        }
    })

    modal.style.display = 'block';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000)
}

function checkInternetConnection() {
    if(!navigator.onLine) {
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

fn();