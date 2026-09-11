document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // Determine if the current page is inside the 'pages/' directory
  const currentPath = window.location.pathname.replace(/\\/g, "/");
  const isInPagesDir = currentPath.includes("/pages/");

  const headerPath = isInPagesDir
    ? "components/header.html"
    : "pages/components/header.html";
  const footerPath = isInPagesDir
    ? "components/footer.html"
    : "pages/components/footer.html";

  // Helper to adjust relative paths based on current page location
  function adjustPaths(htmlContent, inPages) {
    if (!htmlContent) return "";
    let adjusted = htmlContent;

    if (inPages) {
      // Inside pages/ directory:
      // Point assets to ../assets/
      adjusted = adjusted.replace(/(src|href)=["']assets\//g, '$1="../assets/');
      // Point home links to ../index.html
      adjusted = adjusted.replace(
        /href=["']index\.html["']/g,
        'href="../index.html"',
      );
      // Subpage links remain sibling references (e.g., about.html, shop.html)
      adjusted = adjusted.replace(/href=["']pages\/([^"']+)["']/g, 'href="$1"');
      adjusted = adjusted.replace(
        /action=["']pages\/([^"']+)["']/g,
        'action="$1"',
      );
    } else {
      // In root directory:
      // Ensure subpage links point to pages/
      const subpages = [
        "about.html",
        "shop.html",
        "collections.html",
        "blog.html",
        "contact.html",
        "login.html",
        "register.html",
      ];
      subpages.forEach((page) => {
        const hrefRegex = new RegExp(
          `href=["'](?!(?:pages\\/|#|http|tel:|mailto:))` +
            page.replace(".", "\\.") +
            `["']`,
          "g",
        );
        adjusted = adjusted.replace(hrefRegex, `href="pages/${page}"`);

        const actionRegex = new RegExp(
          `action=["'](?!(?:pages\\/|#|http))` +
            page.replace(".", "\\.") +
            `["']`,
          "g",
        );
        adjusted = adjusted.replace(actionRegex, `action="pages/${page}"`);
      });
    }

    return adjusted;
  }

  // Highlight the active page in navigation menu
  function highlightActiveNav() {
    const rawPath = window.location.pathname.replace(/\\/g, "/");
    let pageName =
      rawPath.substring(rawPath.lastIndexOf("/") + 1).toLowerCase() ||
      "index.html";
    if (!pageName || pageName === "/" || pageName === "index.htm") {
      pageName = "index.html";
    }

    const allNavLinks = document.querySelectorAll(
      ".desktop-nav-menu a, .mobile-nav-links a",
    );

    allNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const linkPage = href.substring(href.lastIndexOf("/") + 1).toLowerCase();

      if (
        linkPage === pageName ||
        (pageName === "index.html" &&
          (linkPage === "index.html" || linkPage === ""))
      ) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  // 1. Load Header Component
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    fetch(headerPath)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load header component");
        return res.text();
      })
      .then((html) => {
        headerPlaceholder.innerHTML = adjustPaths(html, isInPagesDir);
        initHeaderFeatures();
      })
      .catch((err) => {
        console.warn("Header fetch failed (using embedded fallback):", err);
        headerPlaceholder.innerHTML = adjustPaths(
          getFallbackHeaderHTML(),
          isInPagesDir,
        );
        initHeaderFeatures();
      });
  } else {
    // If header is already embedded in page HTML
    initHeaderFeatures();
  }

  // 2. Load Footer Component
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch(footerPath)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load footer component");
        return res.text();
      })
      .then((html) => {
        footerPlaceholder.innerHTML = adjustPaths(html, isInPagesDir);
        initFooterFeatures();
      })
      .catch((err) => {
        console.warn("Footer fetch failed (using embedded fallback):", err);
        footerPlaceholder.innerHTML = adjustPaths(
          getFallbackFooterHTML(),
          isInPagesDir,
        );
        initFooterFeatures();
      });
  } else {
    // If footer is already embedded in page HTML
    initFooterFeatures();
  }

  // Initialize Header Interactions
  function initHeaderFeatures() {
    highlightActiveNav();

    const siteHeader = document.querySelector(".site-header");
    if (document.querySelector(".page-banner-section") || isInPagesDir) {
      siteHeader?.classList.add("header-on-banner");
      document.body.classList.add("has-page-banner");
    }

    // Sticky Header
    window.addEventListener("scroll", function () {
      if (window.scrollY > 80) {
        siteHeader?.classList.add("sticky");
      } else {
        siteHeader?.classList.remove("sticky");
      }
    });

    // Mobile Navigation Overlay
    const mobileToggleBtn = document.querySelector(".mobile-menu-toggle-btn");
    const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
    const mobileNavClose = document.querySelector(".mobile-nav-close");
    const mobileLinks = document.querySelectorAll(".mobile-nav-links a");

    function openMobileNav() {
      mobileNavOverlay?.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeMobileNav() {
      mobileNavOverlay?.classList.remove("active");
      document.body.style.overflow = "";
    }

    mobileToggleBtn?.addEventListener("click", openMobileNav);
    mobileNavClose?.addEventListener("click", closeMobileNav);
    mobileLinks.forEach((link) =>
      link.addEventListener("click", closeMobileNav),
    );

    // Search Modal
    const searchOpenBtns = document.querySelectorAll(
      ".search-open-btn, .header-search-btn",
    );
    const searchModalBackdrop = document.querySelector(
      ".search-modal-backdrop",
    );
    const searchModalClose = document.querySelector(".search-modal-close");

    searchOpenBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        searchModalBackdrop?.classList.add("active");
        document.body.style.overflow = "hidden";
        setTimeout(() => {
          searchModalBackdrop?.querySelector("input")?.focus();
        }, 200);
      });
    });

    searchModalClose?.addEventListener("click", function () {
      searchModalBackdrop?.classList.remove("active");
      document.body.style.overflow = "";
    });

    searchModalBackdrop?.addEventListener("click", function (e) {
      if (e.target === searchModalBackdrop) {
        searchModalBackdrop.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        searchModalBackdrop?.classList.contains("active")
      ) {
        searchModalBackdrop.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Initialize Footer Interactions
  function initFooterFeatures() {
    // Scroll to Top Button
    const scrollToTopBtn = document.querySelector(".scroll-to-top-btn");
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        scrollToTopBtn?.classList.add("visible");
      } else {
        scrollToTopBtn?.classList.remove("visible");
      }
    });

    scrollToTopBtn?.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    initNewsletterForms();
  }

  // 3. Counter Animation on Scroll
  const counters = document.querySelectorAll(".counter-number");
  let animated = false;

  function countUp() {
    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      const suffix = counter.getAttribute("data-suffix") || "";
      let count = 0;
      const speed = target / 50;

      const updateCount = () => {
        count += speed;
        if (count < target) {
          counter.innerText = Math.ceil(count).toLocaleString() + suffix;
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target.toLocaleString() + suffix;
        }
      };
      updateCount();
    });
  }

  function handleCounterIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        countUp();
      }
    });
  }

  const counterSection = document.querySelector(".counters-section");
  if (counterSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(handleCounterIntersection, {
      threshold: 0.3,
    });
    observer.observe(counterSection);
  } else if (counters.length > 0) {
    countUp();
  }

  // 4. Interactive Testimonial Carousel Controls
  const testimonialPrev = document.querySelector(".testimonial1-prev");
  const testimonialNext = document.querySelector(".testimonial1-next");
  const testimonialSlides = document.querySelectorAll(
    ".testimonial-slide-item",
  );
  let currentSlide = 0;

  function showSlide(index) {
    if (!testimonialSlides.length) return;
    if (index >= testimonialSlides.length) currentSlide = 0;
    else if (index < 0) currentSlide = testimonialSlides.length - 1;
    else currentSlide = index;

    testimonialSlides.forEach((slide, idx) => {
      slide.style.display = idx === currentSlide ? "block" : "none";
      if (idx === currentSlide) {
        slide.classList.add("fade-in");
      }
    });
  }

  if (testimonialSlides.length > 0) {
    showSlide(0);
    testimonialPrev?.addEventListener("click", () =>
      showSlide(currentSlide - 1),
    );
    testimonialNext?.addEventListener("click", () =>
      showSlide(currentSlide + 1),
    );
  }

  // 5. Interactive Filter Tabs for Products
  const filterBtns = document.querySelectorAll(".product-filter-btn");
  const productItems = document.querySelectorAll(".product-item-wrap");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      productItems.forEach((item) => {
        if (filter === "all" || item.classList.contains(filter)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // 6. Add to Cart & Wishlist Interactive Notifications
  let cartCount = 3;
  let wishlistCount = 2;

  document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      cartCount++;
      const cartBadges = document.querySelectorAll(".cart-badge");
      cartBadges.forEach((b) => (b.textContent = cartCount));
      showToast("Item added to your cart! 🛒");
    });
  });

  document.querySelectorAll(".btn-add-to-wishlist").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      wishlistCount++;
      const wishlistBadges = document.querySelectorAll(".wishlist-badge");
      wishlistBadges.forEach((b) => (b.textContent = wishlistCount));
      this.classList.toggle("text-danger");
      showToast("Saved to your wishlist! ❤️");
    });
  });

  // Quick Toast Notification
  function showToast(message) {
    let toast = document.querySelector(".theme-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "theme-toast";
      document.body.appendChild(toast);

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        left: "30px",
        backgroundColor: "#002842",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "50px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        zIndex: "9999",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.3s ease",
        transform: "translateY(100px)",
        opacity: "0",
      });
    }

    toast.textContent = message;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";

    setTimeout(() => {
      toast.style.transform = "translateY(100px)";
      toast.style.opacity = "0";
    }, 2800);
  }

  // 7. Interactive Booking / Contact Form Handlers
  const bookingForms = document.querySelectorAll(".pet-care-form");
  bookingForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : "Submit";
      if (submitBtn) {
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        showToast(
          "Thank you! Your request has been received. Our team will contact you shortly.",
        );
        form.reset();
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }, 1200);
    });
  });

  // 8. Newsletter Form
  function initNewsletterForms() {
    const newsletterForms = document.querySelectorAll(
      ".newsletter-form, .subscribe__form, .promo-newsletter-form",
    );
    newsletterForms.forEach((form) => {
      if (form.dataset.initialized) return;
      form.dataset.initialized = "true";

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const input = this.querySelector('input[type="email"]');
        if (input && input.value) {
          showToast(
            "🎉 Thank you for subscribing to Pet Care Services VIP Club!",
          );
          input.value = "";
        }
      });
    });
  }

  // Fallback Header Template for offline/strict local file protocol
  function getFallbackHeaderHTML() {
    return `
<header class="site-header">
  <div class="header-top-bar d-none d-md-block">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center">
        <div class="header-top-info">
          <a href="tel:+919876543210"><i class="fa-solid fa-phone"></i> +91 9876543210</a>
          <a href="mailto:support@petcareservices.com"><i class="fa-solid fa-envelope"></i> support@petcareservices.com</a>
          <span><i class="fa-solid fa-location-dot"></i> 124 Kensington High Street, London W8 7RG, UK</span>
        </div>
        <div class="header-top-socials">
          <a href="https://twitter.com" target="_blank" aria-label="Twitter X"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="https://facebook.com" target="_blank" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="https://instagram.com" target="_blank" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="https://youtube.com" target="_blank" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
        </div>
      </div>
    </div>
  </div>
  <div class="header-main-nav">
    <div class="container">
      <div class="d-flex align-items-center justify-content-between">
        <a class="site-logo" href="index.html">
          <img src="assets/images/logoStackly.webp" alt="Pet Care Services Logo" />
        </a>
        <nav class="d-none d-lg-block">
          <ul class="desktop-nav-menu">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="shop.html">Shop</a></li>
            <li><a href="collections.html">Collections</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </nav>
        <div class="header-actions">
          <button class="header-action-btn search-open-btn" aria-label="Search" title="Search">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
          <a href="contact.html" class="header-action-btn d-none d-sm-inline-flex" aria-label="User Account" title="My Account">
            <i class="fa-regular fa-user"></i>
          </a>
          <a href="shop.html" class="header-action-btn d-none d-sm-inline-flex" aria-label="Wishlist" title="Wishlist">
            <i class="fa-regular fa-heart"></i>
            <span class="badge-count wishlist-badge">2</span>
          </a>
          <a href="shop.html" class="header-action-btn" aria-label="Shopping Cart" title="Cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="badge-count cart-badge">3</span>
          </a>
          <button class="mobile-menu-toggle-btn d-lg-none" aria-label="Toggle Mobile Menu">
            <i class="fa-solid fa-bars-staggered"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</header>
<div class="mobile-nav-overlay" id="mobileNavOverlay">
  <div class="mobile-nav-header">
    <a class="site-logo" href="index.html">
      <img src="assets/images/logoStackly.webp" alt="Pet Care Services Logo" />
    </a>
    <button class="mobile-nav-close" aria-label="Close Menu">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
  <ul class="mobile-nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About Us</a></li>
    <li><a href="shop.html">Shop</a></li>
    <li><a href="collections.html">Collections</a></li>
    <li><a href="blog.html">Blog</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
  <div class="mobile-nav-contact">
    <p><i class="fa-solid fa-phone"></i> +91 9876543210</p>
    <p><i class="fa-solid fa-envelope"></i> support@petcareservices.com</p>
    <p><i class="fa-solid fa-location-dot"></i> 124 Kensington High St, London, UK</p>
    <div class="mobile-nav-socials">
      <a href="https://twitter.com" target="_blank" aria-label="Twitter X"><i class="fa-brands fa-x-twitter"></i></a>
      <a href="https://facebook.com" target="_blank" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
      <a href="https://instagram.com" target="_blank" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
      <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
      <a href="https://youtube.com" target="_blank" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
    </div>
  </div>
</div>
<div class="search-modal-backdrop" id="searchModal">
  <div class="search-modal-content">
    <button class="search-modal-close" aria-label="Close Search"><i class="fa-solid fa-xmark"></i></button>
    <h4 class="mb-2">Search Pet Care Services</h4>
    <p class="text-secondary small mb-3">Find premium pet foods, grooming spa services, certified vet appointments, and accessories.</p>
    <form action="shop.html" method="get">
      <div class="search-modal-input-group">
        <input type="text" name="q" placeholder="Type what your pet needs..." required />
        <button type="submit" aria-label="Submit search"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
    </form>
  </div>
</div>`;
  }

  // Fallback Footer Template for offline/strict local file protocol
  function getFallbackFooterHTML() {
    return `
<footer class="site-footer">
  <div class="container">
    <div class="row g-4 justify-content-between">
      <div class="col-lg-4 col-md-6">
        <a href="index.html" class="d-inline-block mb-3">
          <img src="assets/images/logoStackly.webp" alt="Pet Care Services Logo" style="height: 52px; filter: brightness(0) invert(1)" />
        </a>
        <p class="pe-lg-4" style="color: rgba(255, 255, 255, 0.75); font-size: 15px">
          Dedicated to providing top-tier veterinary attention, luxury grooming, natural nutrition, and loving daycare for dogs, cats, birds, and small animals across the UK.
        </p>
        <div class="footer-social-icons">
          <a href="https://twitter.com" target="_blank" class="footer-social-btn" aria-label="Twitter X"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="https://facebook.com" target="_blank" class="footer-social-btn" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="https://instagram.com" target="_blank" class="footer-social-btn" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://linkedin.com" target="_blank" class="footer-social-btn" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="https://youtube.com" target="_blank" class="footer-social-btn" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
        </div>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5 class="footer-widget-title">Quick Links</h5>
        <ul class="footer-links-list">
          <li><a href="index.html"><i class="fa-solid fa-angle-right"></i> Home</a></li>
          <li><a href="about.html"><i class="fa-solid fa-angle-right"></i> About Us</a></li>
          <li><a href="shop.html"><i class="fa-solid fa-angle-right"></i> Pet Shop</a></li>
          <li><a href="collections.html"><i class="fa-solid fa-angle-right"></i> Services</a></li>
          <li><a href="blog.html"><i class="fa-solid fa-angle-right"></i> Pet Health Blog</a></li>
          <li><a href="contact.html"><i class="fa-solid fa-angle-right"></i> Contact Us</a></li>
        </ul>
      </div>
      <div class="col-lg-3 col-md-6">
        <h5 class="footer-widget-title">Our Services</h5>
        <ul class="footer-links-list">
          <li><a href="collections.html"><i class="fa-solid fa-paw"></i> Luxury Pet Spa & Grooming</a></li>
          <li><a href="collections.html"><i class="fa-solid fa-paw"></i> Certified Veterinary Clinic</a></li>
          <li><a href="collections.html"><i class="fa-solid fa-paw"></i> Cage-Free Dog Daycare</a></li>
          <li><a href="collections.html"><i class="fa-solid fa-paw"></i> Puppy Training Academy</a></li>
          <li><a href="collections.html"><i class="fa-solid fa-paw"></i> Pet Diet & Nutrition Plans</a></li>
          <li><a href="collections.html"><i class="fa-solid fa-paw"></i> 24/7 Urgent Medical Care</a></li>
        </ul>
      </div>
      <div class="col-lg-3 col-md-6">
        <h5 class="footer-widget-title">Get In Touch</h5>
        <ul class="footer-contact-info">
          <li><i class="fa-solid fa-location-dot"></i> <span>124 Kensington High Street, London W8 7RG, United Kingdom</span></li>
          <li><i class="fa-solid fa-phone"></i> <a href="tel:+919876543210" style="color: inherit">+91 9876543210</a></li>
          <li><i class="fa-solid fa-envelope"></i> <a href="mailto:support@petcareservices.com" style="color: inherit">support@petcareservices.com</a></li>
          <li><i class="fa-solid fa-clock"></i> <span>Mon - Sat: 8:00 AM - 8:00 PM<br />Sunday: Emergency Only</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom-bar">
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0" style="color: rgba(255, 255, 255, 0.7)">
            &copy; 2026 <strong>Pet Care Services</strong>. All Rights Reserved. Designed with care for pets.
          </p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <div class="footer-bottom-links">
            <a href="contact.html" style="color: rgba(255, 255, 255, 0.7)">Terms of Service</a>
            <a href="contact.html" style="color: rgba(255, 255, 255, 0.7)">Privacy Policy</a>
            <a href="contact.html" style="color: rgba(255, 255, 255, 0.7)">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>
<button class="scroll-to-top-btn" aria-label="Scroll to Top" title="Scroll to Top">
  <i class="fa-solid fa-arrow-up"></i>
</button>`;
  }
});
