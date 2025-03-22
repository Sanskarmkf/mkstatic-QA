<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.top-nav');

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
    });
});
=======
function toggle() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.top-nav');
  
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
        hamburger.setAttribute('aria-expanded', !expanded);
      });
    }
  
    let currentIndex = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
  
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    const slider = document.querySelector('.slider');
  
    if (nextBtn && prevBtn && slider) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
      });
  
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
      });
  
      function updateSlider() {
        const offset = -currentIndex * 100;
        slider.style.transform = `translateX(${offset}%)`;
      }
    }
  }
  
  // ✅ Call the function when the page loads
  document.addEventListener('DOMContentLoaded', toggle);
  
>>>>>>> 81599296db61ff160274ce058b19d3c16b18d764
