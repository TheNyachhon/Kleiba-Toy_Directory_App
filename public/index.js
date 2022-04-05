// Editing fields
const edit = document.querySelector('.fa-pen-to-square')
const form = document.querySelector('#edit-form')
const editBG = document.querySelector('#coverup')
edit.addEventListener('click',()=>{
    toggleEditForm()
})  

// Close button
const close = document.querySelector('.fa-xmark')
close.addEventListener('click',()=>{
    toggleEditForm()
})

const toggleEditForm = ()=>{
    form.classList.toggle('hidden')
    editBG.classList.toggle('hidden')
}