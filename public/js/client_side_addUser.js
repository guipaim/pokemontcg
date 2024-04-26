// validation.js

// Search user form validation
const searchUserForm = document.getElementById('searchUserForm');
const searchInput = document.getElementById('searchInput');

searchUserForm.addEventListener('submit', function (event) {
    event.preventDefault();

        const username = searchInput.value.trim();
        if (!username) {
            alert('Username cannot be empty');
            return;
        }

        searchUserForm.submit();
    });
// Send friend request form validation
const sendFriendRequestForm = document.getElementById('sendFriendRequestForm');
const receiverUsernameInput = document.getElementById('receiverUsername');

sendFriendRequestForm.addEventListener('submit', function (event) {
    event.preventDefault();

        const receiverUsername = receiverUsernameInput.value.trim();
        if (!receiverUsername) {
            alert('Receiver username cannot be empty');
            return;
        }

    sendFriendRequestForm.submit();
});


//accept friend request form validation
const acceptFriendRequestForm = document.getElementById('acceptFriendRequestForm');
const acceptUsernameInput = document.getElementById('acceptUsername');

acceptFriendRequestForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const acceptUsername = acceptUsernameInput.value.trim();
    if (!acceptUsername) {
        alert('Accept username cannot be empty');
        return;
    }

    acceptFriendRequestForm.submit();

});


const rejectFriendRequestForm = document.getElementById('rejectFriendButton');

rejectFriendRequestForm.addEventListener('submit', function (event) {
    event.preventDefault();

 rejectFriendRequestForm.submit()

});



