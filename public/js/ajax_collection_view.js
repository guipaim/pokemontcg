// Function to display collection using AJAX and jQuery
function displayCollection(user) {
    $.ajax({
        url: '/getCardListByUsername',
        method: 'GET',
        data: { user: user },
        success: function(cards) {
            console.log("cards", cards);
            displayImages(cards);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching card list:", error);
        }
    });
}

// Function to display images using AJAX and jQuery
function displayImages(imageUrls) {
    var container = $("#image-container");
    container.empty(); // Clear any existing images
    imageUrls.forEach(function(url) {
        var img = $("<img>").attr("src", url).attr("alt", "Card Image");
        container.append(img);
    });
}