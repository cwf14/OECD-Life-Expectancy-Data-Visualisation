
document.addEventListener("DOMContentLoaded", function() {
    const scrollDashboard = document.querySelector('.scroll-dashboard');
    let isScrollingDown = false;

    // Show dashboard when mouse is near the top of the screen
    document.addEventListener("mousemove", function(e) {
        if (isScrollingDown && e.clientY < 50) { // near the top
            scrollDashboard.classList.add('show');
        } else {
            scrollDashboard.classList.remove('show');
        }
    });

    // Track scroll position
    window.addEventListener("scroll", function() {
        if (window.scrollY > 300) { // Adjust 300px as needed
            isScrollingDown = true;
        } else {
            isScrollingDown = false;
            scrollDashboard.classList.remove('show');
        }
    });
});

// Function to scroll to the top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll
    });
}

// Show or hide the button based on scroll position
window.onscroll = function() {
    const button = document.getElementById('backToTop');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        button.style.display = "block"; // Show button
    } else {
        button.style.display = "none"; // Hide button
    }
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

