function createCourse() {
    let url = './head/create.html'
    window.location.replace(url)
    return;
}

function editCourse(courseId) {
    let url = "./head/edit.html?courseId=" + courseId
    window.location.replace(url)
    return;
}