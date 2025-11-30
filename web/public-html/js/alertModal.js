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

export {showAlert, checkInternetConnection}