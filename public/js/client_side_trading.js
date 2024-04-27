document.addEventListener("DOMContentLoaded", function () {
  var searchUserForm = document.getElementById("search-user-form");
  if (searchUserForm) {
    searchUserForm.addEventListener("submit", function (e) {
      var input = document.getElementById("tradeSearchUser").value.trim();
      let errorMessage = document.getElementById("error-message-trading");

      errorMessage.style.display = "none";

      if (input === "") {
        errorMessage.innerHTML = "Please enter a username";
        errorMessage.style.display = "block";
        e.preventDefault();
      } else if (!isNaN(parseFloat(input)) && isFinite(input)) {
        errorMessage.innerHTML =
          "Username must be valid and cannot be a number";
        errorMessage.style.display = "block";
        e.preventDefault();
      }
    });
  }

  var tradeUserCardsForm = document.getElementById("trade-user-cards-form");
  if (tradeUserCardsForm) {
    tradeUserCardsForm.onsubmit = function (e) {
      const yourCheckboxes = document.querySelectorAll(
        "#trade-user-cards-form input[type='checkbox'][name='yourselectedId[]']:checked"
      );
      const theirCheckboxes = document.querySelectorAll(
        "#trade-user-cards-form input[type='checkbox'][name='theirselectedId[]']:checked"
      );

      if (yourCheckboxes.length === 0 || theirCheckboxes.length === 0) {
        alert("Please select at least one card to trade.");
        e.preventDefault();
      } else if (yourCheckboxes.length !== theirCheckboxes.length) {
        alert("You must trade an equal amount of cards");
        e.preventDefault();
      }
    };
  }

  var executeTradeForm = document.getElementById("execute-trade-form");
  if (executeTradeForm) {
    const acceptTradeButton = document.getElementById("accept-trade");
    const declineTradeButton = document.getElementById("decline-trade");
    const checkboxes = document.querySelectorAll("#trade-in-request");

    function updateButtonsState() {
      const hasChecked = Array.from(checkboxes).some(
        (checkbox) => checkbox.checked
      );
      acceptTradeButton.disabled = !hasChecked;
      declineTradeButton.disabled = !hasChecked;
    }

    updateButtonsState(); // Initial update when the script loads
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateButtonsState);
    });
  }
});
