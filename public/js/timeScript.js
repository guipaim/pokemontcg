function updateTime() {
  const currentTimeSpan = document.getElementById("currentTime");
  if (!currentTimeSpan) {
    console.error("The currentTime element was not found.");
    return;
  }
  const now = new Date();
  const timeString = now.toLocaleTimeString(); // Formats the time based on the user's locale
  currentTimeSpan.textContent = timeString;
}

setInterval(updateTime, 1000); // Update the time every second
document.addEventListener("DOMContentLoaded", updateTime);
