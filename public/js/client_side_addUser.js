// validation.js

// Search user form validation
document.addEventListener('DOMContentLoaded',()=>{
    const searchUserForms = document.querySelectorAll('[id^=searchUserForm-]');
searchUserForms.forEach(form =>{
    const searchInput = form.querySelector('[id^=searchInput-]');
    form.addEventListener('submit',function(event){
        event.preventDefault();
        const username=searchInput.value.trim();
        if(!username){
            alert('Username cannot be empty');
            return;
        }
        form.submit();
    });
});



// Send friend request form validation
const sendFriendRequestForms = document.querySelectorAll('[id^=sendFriendRequestForm-]');
sendFriendRequestForms.forEach(form =>{
    const receiverUsernameInput = form.querySelector('[id^=receiverUsername-]');
    form.addEventListener('submit', function(event){
        event.preventDefault();
        const receiverUsername = receiverUsernameInput.value.trim();
        if(!receiverUsername){
            alert('ReceiverUsername cannot be empty');
            return;
        }
        form.submit();
    });
});


const acceptFriendRequestForms = document.querySelectorAll('[id^=acceptFriendRequestForm-]');
acceptFriendRequestForms.forEach(form =>{
    const acceptUsernameInput = form.querySelector('[id^=acceptUsername-]');
    form.addEventListener('submit',function(event){
       event.preventDefault();
       const acceptUsername=acceptUsernameInput.value.trim();
       if(!acceptUsername){
        alert('acceptUserNName cannot be empty');
       }
       form.submit();
    });

});


const rejectFriendRequestForms = document.querySelectorAll('[id^=rejectFriendButton-]');
rejectFriendRequestForms.forEach(button =>{
    button.addEventListener('click', function(event){
        event.preventDefault();
        const form=button.closest('form');
        form.submit();
    });
    

});
});
