// public/javascript/flash.js
// Auto-dismiss flash messages after 4 seconds
setTimeout(() => {
document.querySelectorAll('.error, .success').forEach(el => {
    el.style.transition = 'opacity 0.5s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
});
}, 4000);