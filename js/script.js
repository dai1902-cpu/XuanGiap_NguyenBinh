/**
 * Wedding Invitation Website Script
 * Couple: Đào Xuân Giáp & Nguyễn Thị Bình
 * Features: 3D Envelope Opening, 2 Flying Doves, Petal Physics, Countdown, QR Copy, Photo Gallery Lightbox, Audio Player
 */

// ==========================================
// 1. PETALS CANVAS ANIMATION
// ==========================================
const canvas = document.getElementById('petals-canvas');
const ctx = canvas.getContext('2d');

let petals = [];
const TOTAL_PETALS = 30;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Petal {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : -20;
    this.size = 10 + Math.random() * 14;
    this.speedY = 1 + Math.random() * 2;
    this.speedX = -0.6 + Math.random() * 1.2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 1.5;
    this.flip = Math.random();
    this.flipSpeed = 0.015 + Math.random() * 0.02;
    const colors = [
      'rgba(255, 182, 193, 0.65)',
      'rgba(244, 194, 194, 0.70)',
      'rgba(255, 228, 225, 0.75)',
      'rgba(247, 231, 206, 0.65)',
      'rgba(255, 240, 245, 0.80)',
      'rgba(216, 114, 133, 0.50)'
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.01) * 0.7;
    this.rotation += this.rotationSpeed;
    this.flip += this.flipSpeed;

    if (this.y > canvas.height + 20 || this.x < -30 || this.x > canvas.width + 30) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(1, Math.sin(this.flip));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size / 2, this.size / 2, 0, this.size);
    ctx.bezierCurveTo(this.size / 2, this.size / 2, this.size / 2, -this.size / 2, 0, 0);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }
}

for (let i = 0; i < TOTAL_PETALS; i++) {
  petals.push(new Petal());
}

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let petal of petals) {
    petal.update();
    petal.draw();
  }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);


// ==========================================
// 2. ENVELOPE OPENING & 2 FLYING BIRDS SEQUENCE
// ==========================================
const envelopeScreen = document.getElementById('envelope-screen');
const envelopeBox = document.getElementById('envelope-box');
const envelopeTitle = document.getElementById('envelope-title');
const envelopeBadge = document.getElementById('envelope-badge');
const envelopeInviteText = document.getElementById('envelope-invite-text');
const doveLeft = document.getElementById('dove-left');
const doveRight = document.getElementById('dove-right');
const ribbonBanner = document.getElementById('ribbon-banner');
let isEnvelopeOpened = false;

function triggerEnvelopeOpening() {
  if (isEnvelopeOpened) return;
  isEnvelopeOpened = true;

  // 1. Envelope opening animation (reveals the inner card containing couple names, hides background text)
  envelopeBox.classList.add('opening');
  envelopeScreen.classList.add('envelope-opening');

  // 2. Background music start
  startRomanticAudio();

  // 3. Trigger 2 Flying Doves & golden sparkles
  setTimeout(() => {
    doveLeft.classList.add('dove-fly-left');
    doveRight.classList.add('dove-fly-right');
    if (ribbonBanner) ribbonBanner.classList.add('show');
    spawnGoldenSparkles(envelopeBox);
  }, 400);

  // 4. Smoothly fade out the envelope screen into main wedding site
  setTimeout(() => {
    envelopeScreen.classList.add('opened');
    window.dispatchEvent(new Event('scroll'));
  }, 3200);
}

function replayEnvelope() {
  envelopeScreen.classList.remove('opened');
  envelopeScreen.classList.remove('envelope-opening');
  envelopeBox.classList.remove('opening');
  doveLeft.classList.remove('dove-fly-left');
  doveRight.classList.remove('dove-fly-right');
  if (ribbonBanner) ribbonBanner.classList.remove('show');
  isEnvelopeOpened = false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function spawnGoldenSparkles(originEl) {
  const rect = originEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 25; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-burst';
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    sparkle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      border-radius: 50%;
      background: radial-gradient(circle, #fff, #ffd700);
      box-shadow: 0 0 10px #ffd700;
      z-index: 10003;
      pointer-events: none;
      transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.2s;
    `;
    document.body.appendChild(sparkle);

    requestAnimationFrame(() => {
      sparkle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
      sparkle.style.opacity = '0';
    });

    setTimeout(() => sparkle.remove(), 1300);
  }
}


// ==========================================
// 3. WEDDING AUDIO TRACK (NGÀY ĐẦU TIÊN.MP3)
// ==========================================
let isMusicPlaying = false;
const bgAudio = document.getElementById('wedding-audio-track');

function startRomanticAudio() {
  if (!bgAudio) return;
  bgAudio.play().then(() => {
    isMusicPlaying = true;
  }).catch((err) => {
    console.log('Autoplay waiting for user interaction:', err);
  });
}

function toggleMusic() {
  if (!bgAudio) return;
  if (isMusicPlaying) {
    bgAudio.pause();
    isMusicPlaying = false;
  } else {
    bgAudio.play().then(() => {
      isMusicPlaying = true;
    }).catch(console.error);
  }
}



// ==========================================
// 4. WEDDING COUNTDOWN TIMER (26/09/2026 - 09:00 AM)
// ==========================================
const weddingTargetDate = new Date('2026-09-26T09:00:00+07:00').getTime();

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCountdown() {
  const now = new Date().getTime();
  const diff = weddingTargetDate - now;

  if (diff <= 0) {
    if (daysEl) daysEl.textContent = '00';
    if (hoursEl) hoursEl.textContent = '00';
    if (minutesEl) minutesEl.textContent = '00';
    if (secondsEl) secondsEl.textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ==========================================
// 5. CLIPBOARD COPY WITH TOAST NOTIFICATION
// ==========================================
const toast = document.getElementById('toast-notification');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  if (toastTimer) clearTimeout(toastTimer);
  toast.innerHTML = `✅ <span>${message}</span>`;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function copyToClipboard(text, description) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Đã sao chép số tài khoản: ${text} (${description})`);
    }).catch(() => fallbackCopy(text, description));
  } else {
    fallbackCopy(text, description);
  }
}

function fallbackCopy(text, description) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`Đã sao chép: ${text} (${description})`);
  } catch (err) {
    showToast(`Số tài khoản: ${text}`);
  }
  document.body.removeChild(textArea);
}


// ==========================================
// 6. QR CODE ZOOM MODAL
// ==========================================
const qrModal = document.getElementById('qr-modal');
const modalQrImage = document.getElementById('modal-qr-img');
const modalQrTitle = document.getElementById('modal-qr-title');
const modalQrAccount = document.getElementById('modal-qr-account');

function openQrModal(type) {
  if (type === 'groom') {
    modalQrImage.src = 'assets/qr_groom.png';
    modalQrTitle.textContent = 'Mừng Cưới Chú Rể: ĐÀO XUÂN GIÁP';
    modalQrAccount.innerHTML = 'MB Bank: <strong>5555527062004</strong><br>Chủ TK: DAO XUAN GIAP';
  } else {
    modalQrImage.src = 'assets/qr_bride.png';
    modalQrTitle.textContent = 'Mừng Cưới Cô Dâu: NGUYỄN THỊ BÌNH';
    modalQrAccount.innerHTML = 'MB Bank: <strong>55555555150504</strong><br>Chủ TK: NGUYEN THI BINH';
  }
  qrModal.classList.add('show');
}

function closeQrModal() {
  qrModal.classList.remove('show');
}

if (qrModal) {
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
  });
}


// ==========================================
// 7. PHOTO GALLERY & LIGHTBOX MODAL
// ==========================================
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCounter = document.getElementById('lightbox-counter');

let galleryItems = [];
let currentLightboxIndex = 0;

function refreshGalleryItems() {
  galleryItems = [];
  document.querySelectorAll('.gallery-item').forEach((item) => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');
    if (img) {
      galleryItems.push({
        src: img.getAttribute('src'),
        caption: caption ? caption.textContent.replace('🔍 ', '') : ''
      });
    }
  });
}

function initGalleryFilter() {
  refreshGalleryItems();
  const tabs = document.querySelectorAll('.gallery-tab-btn');
  const items = document.querySelectorAll('.gallery-item');
  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
      refreshGalleryItems();
    });
  });
}

function openLightbox(src, caption) {
  if (!lightboxModal) return;
  if (!galleryItems.length) refreshGalleryItems();
  const cleanSrc = src.replace(/^assets\//, '');
  currentLightboxIndex = galleryItems.findIndex(item => item.src.includes(cleanSrc));
  if (currentLightboxIndex === -1) {
    currentLightboxIndex = 0;
  }
  showLightboxItem(currentLightboxIndex);
  lightboxModal.classList.add('show');
}

function showLightboxItem(index) {
  if (!galleryItems[index]) return;
  lightboxImg.src = galleryItems[index].src;
  if (lightboxCaption) {
    lightboxCaption.textContent = '';
    lightboxCaption.style.display = 'none';
  }
  if (lightboxCounter) {
    lightboxCounter.textContent = (index + 1) + ' / ' + galleryItems.length;
  }
}

function lightboxPrev() {
  if (!galleryItems.length) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
  showLightboxItem(currentLightboxIndex);
}

function lightboxNext() {
  if (!galleryItems.length) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
  showLightboxItem(currentLightboxIndex);
}

function closeLightbox() {
  if (lightboxModal) lightboxModal.classList.remove('show');
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightboxModal || !lightboxModal.classList.contains('show')) return;
  if (e.key === 'ArrowLeft') lightboxPrev();
  else if (e.key === 'ArrowRight') lightboxNext();
  else if (e.key === 'Escape') closeLightbox();
});




// ==========================================
// 8. HERO BACKGROUND ANIMATED SLIDESHOW
// ==========================================
let currentSlide = 0;
let slideInterval = null;

function initHeroSlider() {
  const slides = document.querySelectorAll('#hero-slider .hero-slide');
  if (!slides || slides.length === 0) return;

  const dotsContainer = document.getElementById('hero-slider-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `hero-dot ${idx === 0 ? 'active' : ''}`;
      dot.title = `Ảnh ${idx + 1}`;
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  startSlideInterval();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('#hero-slider .hero-slide');
  const dots = document.querySelectorAll('#hero-slider-dots .hero-dot');
  if (!slides.length) return;

  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === currentSlide) {
      slide.classList.add('previous');
      setTimeout(() => slide.classList.remove('previous'), 2200);
    }
  });

  if (dots && dots.length) {
    dots.forEach(dot => dot.classList.remove('active'));
  }

  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  if (dots && dots[currentSlide]) dots[currentSlide].classList.add('active');

  resetSlideInterval();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function startSlideInterval() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 4800);
}

function resetSlideInterval() {
  startSlideInterval();
}


// ==========================================
// 9. NAVIGATION OVERLAY MENU (HAMBURGER)
// ==========================================
function toggleNavMenu() {
  const overlay = document.getElementById('nav-overlay');
  if (!overlay) return;
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('nav-overlay');
    if (overlay && overlay.classList.contains('open')) {
      toggleNavMenu();
    }
    if (typeof closeQrModal === 'function') closeQrModal();
    if (typeof closeLightbox === 'function') closeLightbox();
  }
});


// ==========================================
// 10. GOOGLE CALENDAR ADD EVENT
// ==========================================
function addToGoogleCalendar(title, startDate, endDate, location, details) {
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  window.open(url, '_blank');
}


// ==========================================
// 11. HERO TOP BAR FIXED SCROLL
// ==========================================
const heroTopBar = document.getElementById('hero-top-bar');

function handleNavScroll() {
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  // Turn hero-top-bar into frosted glass when user scrolls down past 80px
  if (heroTopBar) {
    if (scrollY > 80) {
      heroTopBar.classList.add('scrolled');
    } else {
      heroTopBar.classList.remove('scrolled');
    }
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });


// ==========================================
// 12. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
// Preserving original layout bounds and frame designs
// ==========================================
function initScrollAnimations() {
  // 1. Configure Section Headers
  document.querySelectorAll('.section-header, .countdown-badge-calligraphy, .countdown-title, .section-tag-gold, .countdown-date-badge, .countdown-note, .gift-intro, .wedding-footer .container').forEach(el => {
    el.classList.add('reveal-on-scroll');
  });

  // 2. Configure Countdown Items with Stagger
  document.querySelectorAll('.countdown-item').forEach((item, idx) => {
    item.classList.add('reveal-on-scroll', 'reveal-scale-in');
    item.style.setProperty('--reveal-delay', `${idx * 0.1}s`);
  });

  // 3. Configure Couple Cards (Groom slides left, Bride slides right)
  const coupleCards = document.querySelectorAll('.couple-card');
  if (coupleCards.length >= 2) {
    coupleCards[0].classList.add('reveal-on-scroll', 'reveal-slide-left');
    coupleCards[1].classList.add('reveal-on-scroll', 'reveal-slide-right');
    coupleCards[0].style.setProperty('--reveal-delay', '0.05s');
    coupleCards[1].style.setProperty('--reveal-delay', '0.2s');
  } else {
    coupleCards.forEach(card => card.classList.add('reveal-on-scroll', 'reveal-fade-up'));
  }

  const centerHeart = document.querySelector('.couple-center-heart');
  if (centerHeart) {
    centerHeart.classList.add('reveal-on-scroll');
    centerHeart.style.setProperty('--reveal-delay', '0.15s');
  }

  const coupleFooter = document.querySelector('.couple-footer-invitation');
  if (coupleFooter) {
    coupleFooter.classList.add('reveal-on-scroll', 'reveal-fade-up');
    coupleFooter.style.setProperty('--reveal-delay', '0.2s');
  }

  // 4. Configure Photo Album / Gallery Items with Staggered Delays
  const galleryItemsList = document.querySelectorAll('.gallery-item');
  const cols = window.innerWidth >= 1200 ? 4 : (window.innerWidth >= 768 ? 3 : 2);
  galleryItemsList.forEach((item, idx) => {
    // Keep original frame intact, only apply reveal delay
    const colIndex = idx % cols;
    const delay = (colIndex * 0.08) + 0.04;
    item.style.setProperty('--reveal-delay', `${delay.toFixed(2)}s`);
  });

  // 5. Configure Timeline Event Cards with Cascade
  document.querySelectorAll('.timeline-card').forEach((card, idx) => {
    card.classList.add('reveal-on-scroll', 'reveal-fade-up');
    card.style.setProperty('--reveal-delay', `${(idx * 0.15 + 0.05).toFixed(2)}s`);
  });

  // 6. Configure Gift / Bank QR Cards with Stagger
  document.querySelectorAll('.qr-card').forEach((card, idx) => {
    card.classList.add('reveal-on-scroll', 'reveal-fade-up');
    card.style.setProperty('--reveal-delay', `${(idx * 0.18 + 0.05).toFixed(2)}s`);
  });

  // 7. Setup IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    document.querySelectorAll('.reveal-on-scroll, .gallery-item').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all candidate elements
  document.querySelectorAll('.reveal-on-scroll, .gallery-item').forEach(el => {
    revealObserver.observe(el);
  });
}


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initGalleryFilter();
  if (envelopeBox) {
    envelopeBox.addEventListener('click', triggerEnvelopeOpening);
  }
  handleNavScroll();
  initScrollAnimations();
});




