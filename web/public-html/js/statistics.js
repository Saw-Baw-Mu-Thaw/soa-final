let GATEWAY = 'http://localhost:8000'
let token = null
let courseId = null
let storedRole = null
let currentUser = null

async function ready() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    courseId = params.get('courseId');

    storedRole = localStorage.getItem('lms_role');
    token = localStorage.getItem('token');

    if(courseId == null || token == null || (storedRole != 'teacher' && storedRole != 'faculty')) {
        alert('Not Authorized. Redirecting to login')
        if(courseId == null) {
            console.log('course id is null')
        }else if(token == null) {
            console.log('token is null')
        }else if(storedRole != 'teacher') {
            console.log('Not teacher')
        }else if(storedRole != 'faculty') {
            console.log('Not faculty')
        }
        // window.location.replace('./index.html')
    }

    await fetchUserInfo()

    if(currentUser) {
        document.getElementById('user-name').innerText = currentUser['name'];
    }

    await fetchStatistics(courseId)

}

async function fetchStatistics(course_id) {

    url = GATEWAY + '/course/statistics/' + course_id
    let statistics = null
    

    await fetch(url, {
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${token}`,
            'ContentType' : 'application/json'
        }
    }).then(async (response) => {
        statistics = await response.json()
        
        
        console.log('Statistics received')
        console.log(statistics)

        showStatistics(statistics)
    }).catch(() => {
        let contentDiv = document.getElementById('content-area')
        contentDiv.innerHTML = "<h2>Could not fetch statistics</h2>"
    })
}

function showStatistics(statistics) {
    const contentDiv = document.getElementById('content-area')
    if(statistics.length == 0) {
        contentDiv.innerHTML = "<h2>No Enrolled Students</h2>"
        return;
    }else {
        contentDiv.innerHTML = ''

        let title = document.createElement('h2')
        title.textContent = 'Statistics'
        contentDiv.appendChild(title)

        for (let i = 0; i < statistics.length; i++) {
            const element = statistics[i];

            let listItem = document.createElement('div')

            let studentNameSpan = document.createElement('span')
            studentNameSpan.textContent = element.student_name

            let homeworkSpan = document.createElement('span')
            homeworkSpan.textContent = 'Homeworks'
            let materialSpan = document.createElement('span')
            materialSpan.textContent = 'Materials'

            let materialCompletionSpan = document.createElement('span')
            materialCompletionSpan.textContent = element.material_completed + '/' + element.total_materials
            if(element.material_completed == element.total_materials) {
                materialCompletionSpan.classList.add('complete')
            } else {
                materialCompletionSpan.classList.add('incomplete')
            }
            
            let homeworkCompletionSpan = document.createElement('span')
            homeworkCompletionSpan.textContent = element.homework_completed + '/' + element.total_homeworks
            if(element.homework_completed == element.total_homeworks) {
                homeworkCompletionSpan.classList.add('complete')
            }else {
                homeworkCompletionSpan.classList.add('incomplete')
            }

            listItem.appendChild(studentNameSpan)
            listItem.appendChild(materialSpan)
            listItem.appendChild(materialCompletionSpan)
            listItem.appendChild(homeworkSpan)
            listItem.appendChild(homeworkCompletionSpan)

            listItem.setAttribute('data-id', element.student_id)
            listItem.addEventListener('click', showDetail)

            let listDiv = document.createElement('div')
            listDiv.id = 'detail-' + element.student_id

            let materialList = document.createElement('ul')
            for (let j = 0; j < element.materials.length; j++) {
                const m = element.materials[j];
                let listItem = document.createElement('li')
                let span = document.createElement('span')
                let materialName = document.createElement('h3')
                materialName.textContent = m.material_name
                materialName.style.display = 'inline'
                let icon = document.createElement('i')

                if (m.completed == true) {
                    icon.classList.add('fa-solid', 'fa-check')
                    icon.style.color = '#00ff00'
                } else {
                    icon.classList.add('fa-solid', 'fa-xmark')
                    icon.style.color = '#ff0000'
                }

                span.appendChild(icon)
                span.appendChild(materialName)
                listItem.appendChild(span)
                materialList.appendChild(listItem)
            }

            let homeworkList = document.createElement('ul')
            for(let k = 0; k < element.homeworks.length; k++) {
                const h = element.homeworks[k];
                let listItem = document.createElement('li')
                let span = document.createElement('span')
                let homeworkName = document.createElement('h3')
                homeworkName.textContent = h.homework_title
                homeworkName.style.display = 'inline'
                let icon = document.createElement('i')

                if(h.submitted == true) {
                   icon.classList.add('fa-solid', 'fa-check')
                    icon.style.color = '#00ff00'
                } else {
                    icon.classList.add('fa-solid', 'fa-xmark')
                    icon.style.color = '#ff0000'
                }

                span.appendChild(icon)
                span.appendChild(homeworkName)
                listItem.appendChild(span)
                homeworkList.appendChild(listItem)
            }

            let materialHeading = document.createElement('h2')
            materialHeading.textContent = 'Materials'
            listDiv.appendChild(materialHeading)
            listDiv.appendChild(materialList)

            let homeworkHeading = document.createElement('h2')
            homeworkHeading.textContent = 'Homeworks'
            listDiv.appendChild(homeworkHeading)
            listDiv.append(homeworkList)

            listDiv.style.display = 'none'

            contentDiv.appendChild(listItem)
            contentDiv.appendChild(listDiv)
        }
    }
}

function showDetail(e) {

    let elem = e.currentTarget
    console.log(elem)
    let studentId = elem.getAttribute('data-id')
    console.log('studentId = ', studentId)
    console.log('show detail clicked')
    const listDiv = document.getElementById('detail-' + studentId)
    console.log(listDiv)
    listDiv.classList.toggle('is-active')

    if(listDiv.style.display == 'block') {
        listDiv.style.display = 'none'
    } else {
        listDiv.style.display = 'block'
    }
}

async function fetchUserInfo() {
    const url = GATEWAY + '/auth/me';
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.ok) {
            let json = await response.json();
            currentUser = json;
        } else {
            console.log('Could not fetch user info');
        }
    });
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function backToCourse() {
    window.location.href = 'course.html?courseId=' + courseId
}

function backToEdit() {
    window.location.href = './head/edit.html?courseId=' + courseId
}