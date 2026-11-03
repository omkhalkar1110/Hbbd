let isBlownOut = false;
let isCut = false;
let surpriseOpened = false;

let dodgeCount = 0;
const maxDodges = 10;
let messageIndex = 0;
const alertMessages = [
    "Wait, did you make a wish?",
    "Are you sure you want to cut this masterpiece?",
    "Ugh, fine. Go ahead. 🍰💖"
];

// Elements
const nameDisplay = document.getElementById('name-display');
const flame = document.getElementById('flame');
const smokeContainer = document.getElementById('smoke-container');
const tooltip = document.getElementById('tooltip');
const leftHalf = document.getElementById('left-half');
const rightHalf = document.getElementById('right-half');
const cutBtn = document.getElementById('cut-btn');
const customModal = document.getElementById('custom-modal');
const modalContent = document.getElementById('modal-content');
const modalText = document.getElementById('modal-text');

// Surprise Elements
const surpriseSection = document.getElementById('surprise-section');
const boxClosed = document.getElementById('box-closed');
const boxOpened = document.getElementById('box-opened');

// URL initialization for the static display (if shared with custom name)
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam) {
        const decodedName = decodeURIComponent(nameParam);
        nameDisplay.textContent = decodedName;
    }
});

function blowOutCandle() {
    if (isBlownOut) return;
    flame.style.opacity = '0';
    setTimeout(() => { flame.style.display = 'none'; }, 300);
    if (tooltip) tooltip.style.opacity = '0';
    
    const smoke = document.createElement('div');
    smoke.className = 'smoke';
    smokeContainer.appendChild(smoke);
    
    isBlownOut = true;
}

function dodgeButton(e) {
    if (isCut || dodgeCount >= maxDodges) return;
    if (e.type === 'touchstart') e.preventDefault(); 

    // Confine bounds dynamically based on viewport to prevent flying off small mobile screens
    const maxX = Math.min(120, window.innerWidth * 0.25);
    const maxY = Math.min(80, window.innerHeight * 0.15);

    const moveX = (Math.random() - 0.5) * maxX * 2; 
    const moveY = (Math.random() - 0.5) * maxY * 2 - 20; 

    cutBtn.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.9)`;
    cutBtn.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
    
    dodgeCount++;

    if (dodgeCount >= maxDodges) {
        setTimeout(() => {
            cutBtn.style.transform = 'translate(0px, 0px) scale(1)';
        }, 300);
    }
}

function startCutSequence(e) {
    if (isCut) return;
    if (dodgeCount < maxDodges) {
        dodgeButton(e); 
        return;
    }
    messageIndex = 0;
    showModal();
}

function showModal() {
    modalText.textContent = alertMessages[messageIndex];
    customModal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
}

function hideModal() {
    customModal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
}

function nextMessage() {
    messageIndex++;
    if (messageIndex < alertMessages.length) {
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modalText.textContent = alertMessages[messageIndex];
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 150);
    } else {
        hideModal();
        setTimeout(() => actualCutCake(), 300); 
    }
}

function actualCutCake() {
    if (isCut) return;
    if (!isBlownOut) blowOutCandle();

    leftHalf.classList.add('cut-left');
    rightHalf.classList.add('cut-right');

    fireConfetti();
    isCut = true;
    cutBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // Trigger Surprise Section 3 seconds after cutting
    setTimeout(() => {
        showSurprise();
    }, 3000);
}

function fireConfetti() {
    const duration = 8000; 
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 100 };
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        
        const particleCount = 100 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
            colors: ['#ff69b4', '#ffffff', '#db7093', '#ffb6c1']
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
            colors: ['#ff69b4', '#ffffff', '#db7093', '#ffb6c1']
        }));
    }, 200); 
}

function showSurprise() {
    surpriseSection.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
}

function openGift() {
    if (surpriseOpened) return;
    surpriseOpened = true;
    
    boxClosed.classList.add('scale-0', 'opacity-0');
    setTimeout(() => {
        boxClosed.classList.add('hidden');
        boxOpened.classList.remove('hidden');
        // Small delay to allow display block to apply before animating scale
        setTimeout(() => {
            boxOpened.classList.remove('scale-0');
            boxOpened.classList.add('scale-100');
            
            // Tiny burst of confetti from the box
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#ff9aa2', '#ffffff', '#ffb3c6']
            });
        }, 50);
    }, 500);
}

async function shareLink() {
    const currentName = nameDisplay.textContent.trim();
    const url = new URL(window.location.href);
    url.searchParams.set('name', encodeURIComponent(currentName));
    const finalUrl = url.toString();

    try {
        await navigator.clipboard.writeText(finalUrl);
        showToast('Shareable link copied to clipboard!');
    } catch (err) {
        const tempInput = document.createElement('input');
        tempInput.value = finalUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('Shareable link copied to clipboard!');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    setTimeout(() => toast.classList.add('opacity-0'), 3000);
      }
