/**
 * Custom scripts for news toggle and publication filtering
 */

// News Toggle Function
function toggleNews() {
  const content = document.getElementById('newsContent');
  const btn = document.getElementById('newsToggleBtn');
  
  if (content && btn) {
    const btnText = btn.querySelector('span');
    
    content.classList.toggle('expanded');
    btn.classList.toggle('expanded');
    
    if (btnText) {
      if (content.classList.contains('expanded')) {
        btnText.textContent = 'Show Less';
      } else {
        btnText.textContent = 'Show More';
      }
    }
  }
}

// Publication Filter
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.pub-filter .filter-btn');
  const boxes = document.querySelectorAll('.paper-box');
  
  if (buttons.length > 0) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        buttons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        boxes.forEach(box => {
          const isCore = box.dataset.core === 'true';
          if (filter === 'all' || (filter === 'core' && isCore)) {
            box.style.display = '';
          } else {
            box.style.display = 'none';
          }
        });
      });
    });
  }
});
