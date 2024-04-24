// validation.js

// Search user form validation
const searchUserForm = document.getElementById('searchUserForm');
const searchInput = document.getElementById('searchInput');

searchUserForm.addEventListener('submit', function(event) {
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

sendFriendRequestForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const receiverUsername = receiverUsernameInput.value.trim();
    if (!receiverUsername) {
        alert('Receiver username cannot be empty');
        return;
    }

    sendFriendRequestForm.submit();
});
