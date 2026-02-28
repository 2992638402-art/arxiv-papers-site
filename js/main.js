// Main JavaScript for arXiv Papers Site

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active nav link highlighting
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath.split('/').pop() ||
            (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Search functionality (can be enhanced later)
function searchPapers(query) {
    // Placeholder for future search implementation
    console.log('Searching for:', query);
}

// Copy code block functionality
document.querySelectorAll('pre code').forEach(block => {
    const button = document.createElement('button');
    button.innerText = '📋 复制';
    button.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 0.85rem;
    `;

    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(button);

    button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(block.textContent);
        button.innerText = '✅ 已复制';
        setTimeout(() => {
            button.innerText = '📋 复制';
        }, 2000);
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();

    // Add fade-in animation to paper cards
    const cards = document.querySelectorAll('.paper-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Export functions for potential use in other scripts
window.arxivSite = {
    searchPapers,
    updateActiveNavLink
};
