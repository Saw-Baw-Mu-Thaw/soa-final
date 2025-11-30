let materialNotifications = null
let homeworkNotifications = null

async function loadNotifications() {
    let token = localStorage.getItem('token')

    let notiModal = document.getElementById('notiModal')
    let span = document.getElementsByClassName('close-btn')[0]
    notiModal.style.display = 'none'

    if (token == null) {
        window.location.replace('./index.html')
    }

    let gateway = 'http://localhost:8000'
    url = gateway + '/notifications'
    await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        let json = await response.json()

        if (response.ok) {
            materialNotifications = json['material_notifications']
            homeworkNotifications = json['homework_notifications']

            let noNotiText = document.getElementById('no-noti-text')
            if (materialNotifications.length != 0 || homeworkNotifications.length != 0) {
                noNotiText.style.display = 'none'
            }

            if(materialNotifications.length == 0 && homeworkNotifications.length == 0) {
                let seenAllBtn = document.getElementById('seenButton')
                seenAllBtn.style.display = 'none'
            }

            let notiList = document.getElementById('noti-list')

            for (let i = 0; i < materialNotifications.length; i++) {
                const noti = materialNotifications[i];
                let newLi = document.createElement('li')
                newLi.textContent = noti['title']
                notiList.appendChild(newLi)
            }

            for (let i = 0; i < homeworkNotifications.length; i++) {
                const noti = homeworkNotifications[i];
                let newLi = document.createElement('li')
                newLi.textContent = noti['title']
                notiList.appendChild(newLi)
            }
        }
    })

    

    let seenAllBtn = document.getElementById('seenButton')
    seenAllBtn.addEventListener('click', async (event) => {
        

        notiModal.style.display = 'none'

        let materialNotiIds = []
        let homeworkNotiIds = []

        for (let i = 0; i < materialNotifications.length; i++) {
            const noti = materialNotifications[i];
            materialNotiIds.push(noti['id'])
        }

        for (let i = 0; i < homeworkNotifications.length; i++) {
            const noti = homeworkNotifications[i];
            homeworkNotiIds.push(noti['id'])
        }

        let gateway = 'http://localhost:8000'
        url = gateway + '/notifications/material'
        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(materialNotiIds),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        url = gateway + '/notifications/homework'
        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(homeworkNotiIds),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        let notiList = document.getElementById('noti-list')
        notiList.innerHTML = ''

        document.getElementById('seenButton').style.display = 'none'
    })

    let notiIcon = document.getElementById('noti-icon')
    notiIcon.addEventListener('click', () => {
        notiModal.style.display = 'flex'
    })

    span.addEventListener('click', () => {
        notiModal.style.display = 'none'
    })

    window.addEventListener('click', (event) => {
        if (event.target == notiModal) {
            notiModal.style.display = 'none'
        }
    })

}