document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const DEFAULT_ROLES = {
    pet_owner: {
      key: "pet_owner",
      title: "Pet Owner / Parent",
      icon: "fa-paw",
      color: "#ffd100",
      defaultName: "Alex Miller",
      defaultEmail: "alex.miller@example.com",
      welcomeTitle: "Welcome Back, <span>Alex</span>!",
      welcomeDesc:
        "Manage clinical appointments, monitor vaccination dates, track nutrition orders, and log daily care for your beloved pets.",
      defaultView: "owner-overview",
    },
    veterinarian: {
      key: "veterinarian",
      title: "Certified Veterinarian",
      icon: "fa-user-doctor",
      color: "#38bdf8",
      defaultName: "Dr. Clara Watson",
      defaultEmail: "dr.clara.watson@petcareservices.com",
      welcomeTitle: "Welcome, <span>Dr. Watson</span> (DVM, MRCVS)",
      welcomeDesc:
        "Manage outpatient triage, scheduled surgeries, digital diagnostic radiology, and prescription dispensing for today's clinical queue.",
      defaultView: "vet-overview",
    },
    pet_groomer: {
      key: "pet_groomer",
      title: "Professional Pet Groomer",
      icon: "fa-scissors",
      color: "#f472b6",
      defaultName: "Oliver Scott",
      defaultEmail: "oliver.groomer@petcareservices.com",
      welcomeTitle: "Welcome to Stylist Studio, <span>Oliver</span>!",
      welcomeDesc:
        "Track salon station bookings, breed coat grooming preferences, spa product supplies, and before & after styling transformations.",
      defaultView: "groomer-overview",
    },
    shelter_breeder: {
      key: "shelter_breeder",
      title: "Shelter & Foster Hub",
      icon: "fa-house-chimney-medical",
      color: "#fb923c",
      defaultName: "Kensington Rescue Sanctuary",
      defaultEmail: "adoptions@stjudepetshelter.org",
      welcomeTitle: "Welcome, <span>Shelter Coordinator</span>!",
      welcomeDesc:
        "Oversee rescue intake registrations, adoption screening approvals, volunteer foster placements, and emergency pet quarantine logs.",
      defaultView: "shelter-overview",
    },
    staff_volunteer: {
      key: "staff_volunteer",
      title: "Pet Care Staff & Volunteer",
      icon: "fa-handshake-angle",
      color: "#818cf8",
      defaultName: "Emma Davis",
      defaultEmail: "emma.staff@petcareservices.com",
      welcomeTitle: "Welcome on Shift, <span>Emma</span>!",
      welcomeDesc:
        "Execute facility feeding schedules, kennel sanitation logs, daycare playgroup attendance, and animal temperament observations.",
      defaultView: "staff-overview",
    },
  };

  // Determine current role from URL param or Storage
  const urlParams = new URLSearchParams(window.location.search);
  let requestedRole = urlParams.get("role");

  let storedUser = null;
  try {
    const raw =
      sessionStorage.getItem("petcare_current_user") ||
      localStorage.getItem("petcare_current_user");
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {
    console.warn("Session read error:", e);
  }

  let activeRoleKey = "pet_owner";
  if (requestedRole && DEFAULT_ROLES[requestedRole]) {
    activeRoleKey = requestedRole;
  } else if (storedUser && storedUser.role && DEFAULT_ROLES[storedUser.role]) {
    activeRoleKey = storedUser.role;
  }

  // Active user details
  const activeRoleData = DEFAULT_ROLES[activeRoleKey];
  const userDisplayName =
    storedUser && storedUser.name
      ? storedUser.name
      : activeRoleData.defaultName;
  const userDisplayEmail =
    storedUser && storedUser.email
      ? storedUser.email
      : activeRoleData.defaultEmail;

  // --------------------------------------------------------------------------
  // DOM Elements
  // --------------------------------------------------------------------------
  const sidebar = document.getElementById("dashboardSidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const sidebarToggleBtn = document.getElementById("mobileSidebarToggle");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const logoutBtn = document.getElementById("dashboard_logout_btn");
  const topbarRoleLabel = document.getElementById("topbarRoleLabel");
  const userHeaderName = document.getElementById("userHeaderName");
  const userHeaderEmail = document.getElementById("userHeaderEmail");
  const userAvatarChar = document.getElementById("userAvatarChar");
  const sidebarRoleIcon = document.getElementById("sidebarRoleIcon");
  const sidebarRoleName = document.getElementById("sidebarRoleName");
  const sidebarRolePill = document.getElementById("sidebarRolePill");
  const topbarTitle = document.getElementById("topbarPageTitle");
  const topbarSubtitle = document.getElementById("topbarPageSubtitle");

  // --------------------------------------------------------------------------
  // Update Header & Profile UI
  // --------------------------------------------------------------------------
  function updateProfileUI() {
    if (userHeaderName) userHeaderName.textContent = userDisplayName;
    if (userHeaderEmail) userHeaderEmail.textContent = userDisplayEmail;
    if (userAvatarChar) {
      userAvatarChar.textContent = userDisplayName.charAt(0).toUpperCase();
    }
    if (topbarRoleLabel) {
      topbarRoleLabel.textContent = activeRoleData.title;
    }
    if (sidebarRoleName) {
      sidebarRoleName.textContent = activeRoleData.title;
    }
    if (sidebarRoleIcon) {
      sidebarRoleIcon.innerHTML = `<i class="fa-solid ${activeRoleData.icon}"></i>`;
      sidebarRoleIcon.style.backgroundColor = activeRoleData.color;
      if (
        activeRoleKey === "pet_owner" ||
        activeRoleKey === "shelter_breeder"
      ) {
        sidebarRoleIcon.style.color = "#002842";
      } else {
        sidebarRoleIcon.style.color = "#002842";
      }
    }
    if (sidebarRolePill) {
      sidebarRolePill.textContent = "Active Role";
    }
  }

  updateProfileUI();

  // --------------------------------------------------------------------------
  // Render Dynamic Sidebar Menu for Active Role
  // --------------------------------------------------------------------------
  function activateRole(roleKey) {
    activeRoleKey = roleKey;
    const roleConfig = DEFAULT_ROLES[roleKey];

    // Hide all role-specific sidebar menus and show active role menu
    document.querySelectorAll(".role-sidebar-nav").forEach((nav) => {
      nav.classList.add("d-none");
    });
    const activeNav = document.getElementById(`nav-role-${roleKey}`);
    if (activeNav) {
      activeNav.classList.remove("d-none");
    }

    // Hide all role dashboard content sections
    document
      .querySelectorAll(".role-dashboard-container")
      .forEach((container) => {
        container.classList.add("d-none");
      });
    const activeContainer = document.getElementById(
      `dashboard-container-${roleKey}`,
    );
    if (activeContainer) {
      activeContainer.classList.remove("d-none");
    }

    // Switch to role default view
    switchView(roleConfig.defaultView);
    updateProfileUI();

    // Store updated role
    try {
      const current = {
        role: roleKey,
        name: userDisplayName,
        email: userDisplayEmail,
        loginTime: new Date().toISOString(),
      };
      sessionStorage.setItem("petcare_current_user", JSON.stringify(current));
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // Tab / View Switching System
  // --------------------------------------------------------------------------
  function switchView(viewId) {
    if (!viewId) return;

    // Remove active class from all sidebar buttons
    document.querySelectorAll(".sidebar-menu-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-view") === viewId) {
        btn.classList.add("active");
      }
    });

    // Hide all views and display target view
    document.querySelectorAll(".dashboard-view-section").forEach((sec) => {
      sec.classList.remove("active");
    });

    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
      targetSection.classList.add("active");

      // Update topbar titles
      const viewTitle = targetSection.getAttribute("data-title") || "Dashboard";
      const viewSubtitle =
        targetSection.getAttribute("data-subtitle") ||
        "Manage your pet care records";
      if (topbarTitle) topbarTitle.textContent = viewTitle;
      if (topbarSubtitle) topbarSubtitle.textContent = viewSubtitle;
    }

    // Close mobile sidebar if open
    closeMobileSidebar();
  }

  // Bind all sidebar menu buttons
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".sidebar-menu-btn");
    if (!btn) return;
    const viewId = btn.getAttribute("data-view");
    if (viewId) {
      e.preventDefault();
      switchView(viewId);
    }
  });

  // Bind Role Switcher Items in Topbar
  document.querySelectorAll(".role-switch-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const targetRole = this.getAttribute("data-role");
      if (targetRole && DEFAULT_ROLES[targetRole]) {
        // Update URL param without full reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set("role", targetRole);
        window.history.pushState({}, "", newUrl);

        activateRole(targetRole);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Mobile Offcanvas Sidebar Drawer Controls
  // --------------------------------------------------------------------------
  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (sidebarToggleBtn)
    sidebarToggleBtn.addEventListener("click", openMobileSidebar);
  if (sidebarCloseBtn)
    sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  if (sidebarBackdrop)
    sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // --------------------------------------------------------------------------
  // Logout Action
  // --------------------------------------------------------------------------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      try {
        sessionStorage.removeItem("petcare_current_user");
        localStorage.removeItem("petcare_current_user");
      } catch (err) {}
      window.location.href = "login.html";
    });
  }

  // --------------------------------------------------------------------------
  // Requirement 7: Dashboard Empty Links, # and Dummy Action Buttons -> 404
  // --------------------------------------------------------------------------
  document.addEventListener("click", function (e) {
    // 1. Check if user clicked a link
    const link = e.target.closest("a");
    if (link) {
      // Exclude sidebar menu buttons if they are <a> tags
      if (
        link.classList.contains("sidebar-menu-btn") ||
        link.classList.contains("role-switch-item") ||
        link.id === "dashboard_logout_btn"
      ) {
        return;
      }

      const href = link.getAttribute("href");
      const isEmptyOrHash =
        href === null ||
        href === "" ||
        href === "#" ||
        href === "#!" ||
        href === "javascript:void(0)" ||
        href === "javascript:void(0);" ||
        href === "javascript:;";

      if (isEmptyOrHash) {
        e.preventDefault();
        window.location.href = "../404.html";
        return;
      }
    }

    // 2. Check if user clicked an unhandled placeholder button
    const btn = e.target.closest("button");
    if (btn) {
      // Allowed functional buttons:
      if (
        btn.classList.contains("sidebar-menu-btn") ||
        btn.classList.contains("mobile-sidebar-toggle") ||
        btn.classList.contains("sidebar-close-btn") ||
        btn.classList.contains("sidebar-logout-btn") ||
        btn.classList.contains("dropdown-toggle") ||
        btn.hasAttribute("data-bs-toggle") ||
        btn.id === "mobileSidebarToggle" ||
        btn.id === "sidebarCloseBtn" ||
        btn.id === "dashboard_logout_btn" ||
        btn.id === "roleSwitcherBtn" ||
        btn.id === "userProfileDropdown"
      ) {
        return; // Handle normally
      }

      // Check for custom functional buttons (e.g., interactive checkboxes or accordions)
      if (
        btn.classList.contains("btn-close") ||
        btn.closest(".dropdown-menu")
      ) {
        return;
      }

      // If it's a dummy action button (e.g., "Add Pet", "Export CSV", "Download Report", "Filter", "More Actions")
      if (
        btn.classList.contains("dash-btn-action") ||
        btn.getAttribute("data-action") === "404" ||
        btn.type === "button"
      ) {
        e.preventDefault();
        window.location.href = "../404.html";
      }
    }
  });

  // Initialize the chosen role
  activateRole(activeRoleKey);
});
