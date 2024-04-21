document.getElementById("trade-user-cards-form").onsubmit = function (e) {
  const yourCheckboxes = document.querySelectorAll("#trade-yours-card:checked");
  const theirCheckboxes = document.querySelectorAll(
    "#trade-theirs-card:checked"
  );
  if (yourCheckboxes.length === 0 || theirCheckboxes === 0) {
    alert("Please select at least one card to trade.");
    e.preventDefault(); // Prevent form from submitting
  }

  if (
    (yourCheckboxes.length > 0 || theirCheckboxes > 0) &&
    yourCheckboxes.length !== theirCheckboxes.length
  ) {
    alert("You must trade an equal amount of cards");
    e.preventDefault(); // Prevent form from submitting
  }
};
