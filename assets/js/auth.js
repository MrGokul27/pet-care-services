document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // --------------------------------------------------------------------------
  // Password Visibility Toggle (Show / Hide)
  // --------------------------------------------------------------------------
  const toggleButtons = document.querySelectorAll(".auth-password-toggle");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const isPassword = targetInput.getAttribute("type") === "password";
      targetInput.setAttribute("type", isPassword ? "text" : "password");

      const icon = this.querySelector("i");
      if (icon) {
        if (isPassword) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
          this.setAttribute("aria-label", "Hide password");
        } else {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
          this.setAttribute("aria-label", "Show password");
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Register Page: Restrict Username to Alphabets and Spaces Only
  // --------------------------------------------------------------------------
  const usernameInput = document.getElementById("reg_username");
  const usernameHint = document.getElementById("username_hint");

  if (usernameInput) {
    let hintTimeout;
    const showUsernameHint = (msg) => {
      if (usernameHint) {
        if (msg)
          usernameHint.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
        usernameHint.style.display = "flex";
        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
          usernameHint.style.display = "none";
        }, 2500);
      }
    };

    // Block non-alpha keystrokes (allows navigation, backspace, tab, etc.)
    usernameInput.addEventListener("keydown", function (e) {
      // Allow functional keys (Backspace, Tab, Enter, Escape, Arrow keys, Delete)
      if (
        e.key === "Backspace" ||
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Delete" ||
        e.key === "Home" ||
        e.key === "End" ||
        // Allow shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, Meta+...)
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }

      // Only allow letters
      if (!/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        showUsernameHint(
          "Only letters are allowed. No spaces, numbers or special characters.",
        );
      }
    });

    // Sanitize input (handles drag-and-drop, paste, IME, autofill)
    usernameInput.addEventListener("input", function () {
      const originalVal = this.value;
      const sanitizedVal = originalVal.replace(/[^a-zA-Z]/g, "");

      if (originalVal !== sanitizedVal) {
        this.value = sanitizedVal;
        showUsernameHint(
          "Special characters & numbers were automatically removed.",
        );
      }

      const msgEl = document.getElementById("username_msg");
      if (sanitizedVal.trim().length >= 2) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
        if (msgEl) {
          msgEl.className = "auth-feedback-msg success";
          msgEl.innerHTML =
            '<i class="fa-solid fa-check"></i> Valid name format';
        }
      } else if (sanitizedVal.length > 0) {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
        if (msgEl) {
          msgEl.className = "auth-feedback-msg error";
          msgEl.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Username must be at least 2 letters';
        }
      } else {
        this.classList.remove("is-valid", "is-invalid");
        if (msgEl) msgEl.innerHTML = "";
      }
    });
  }

  // --------------------------------------------------------------------------
  // Password Strength Evaluation Engine (Used for both Login and Register)
  // --------------------------------------------------------------------------
  function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lower && checks.upper) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    // Calculate level
    let level = "weak";
    if (password.length === 0) {
      level = "empty";
    } else if (score <= 1 || password.length < 6) {
      level = "weak";
    } else if (score === 2) {
      level = "fair";
    } else if (score === 3) {
      level = "good";
    } else if (score >= 4) {
      level = "strong";
    }

    return { score, level, checks };
  }

  // Update Strength UI meter
  function updateStrengthMeter(
    passwordInputId,
    meterContainerId,
    feedbackMsgId,
  ) {
    const pwdInput = document.getElementById(passwordInputId);
    const meterContainer = document.getElementById(meterContainerId);
    const feedbackMsg = document.getElementById(feedbackMsgId);
    if (!pwdInput) return;

    pwdInput.addEventListener("input", function () {
      const pwd = this.value;
      const { score, level, checks } = calculatePasswordStrength(pwd);

      if (meterContainer) {
        const statusText = meterContainer.querySelector(
          ".strength-status-text",
        );
        const segments = meterContainer.querySelectorAll(".strength-segment");

        // Clear segment classes
        segments.forEach((seg) => {
          seg.className = "strength-segment";
        });

        if (statusText) {
          if (pwd.length === 0) {
            statusText.textContent = "Empty";
            statusText.className = "strength-status-text";
          } else {
            statusText.textContent =
              level.charAt(0).toUpperCase() + level.slice(1);
            statusText.className = `strength-status-text ${level}`;
          }
        }

        // Color progress segments
        if (pwd.length > 0) {
          const count =
            level === "weak"
              ? 1
              : level === "fair"
                ? 2
                : level === "good"
                  ? 3
                  : 4;
          for (let i = 0; i < count; i++) {
            if (segments[i]) {
              segments[i].classList.add(`active-${level}`);
            }
          }
        }

        // Update Checklist Rules if present
        const ruleLength = meterContainer.querySelector('[data-rule="length"]');
        const ruleLetters = meterContainer.querySelector(
          '[data-rule="letters"]',
        );
        const ruleNumber = meterContainer.querySelector('[data-rule="number"]');
        const ruleSpecial = meterContainer.querySelector(
          '[data-rule="special"]',
        );

        const updateRuleItem = (el, isValid) => {
          if (!el) return;
          if (isValid) {
            el.className = "strength-rule-item rule-valid";
            el.querySelector("i").className = "fa-solid fa-check";
          } else {
            el.className = "strength-rule-item rule-invalid";
            el.querySelector("i").className = "fa-regular fa-circle";
          }
        };

        updateRuleItem(ruleLength, checks.length);
        updateRuleItem(ruleLetters, checks.lower && checks.upper);
        updateRuleItem(ruleNumber, checks.number);
        updateRuleItem(ruleSpecial, checks.special);
      }

      // Inline feedback & input borders
      if (pwd.length === 0) {
        pwdInput.classList.remove("is-valid", "is-invalid");
        if (feedbackMsg) feedbackMsg.innerHTML = "";
      } else if (level === "weak") {
        pwdInput.classList.add("is-invalid");
        pwdInput.classList.remove("is-valid");
        if (feedbackMsg) {
          feedbackMsg.className = "auth-feedback-msg error";
          feedbackMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Weak password. Add min 8 chars, uppercase, digits & symbols.';
        }
      } else {
        pwdInput.classList.remove("is-invalid");
        pwdInput.classList.add("is-valid");
        if (feedbackMsg) {
          feedbackMsg.className = "auth-feedback-msg success";
          feedbackMsg.innerHTML =
            '<i class="fa-solid fa-check"></i> Great password strength!';
        }
      }

      // Trigger confirm password check if on register page
      const confirmInput = document.getElementById("reg_confirm_password");
      if (confirmInput && confirmInput.value.length > 0) {
        checkPasswordMatch();
      }
    });
  }

  // Bind strength meters
  updateStrengthMeter("reg_password", "reg_strength_meter", "reg_password_msg");
  updateStrengthMeter(
    "login_password",
    "login_strength_meter",
    "login_password_msg",
  );

  // --------------------------------------------------------------------------
  // Register: Confirm Password Match Checker
  // --------------------------------------------------------------------------
  const regPassword = document.getElementById("reg_password");
  const regConfirmPassword = document.getElementById("reg_confirm_password");
  const confirmMsg = document.getElementById("confirm_password_msg");

  function checkPasswordMatch() {
    if (!regPassword || !regConfirmPassword) return true;

    const pwd = regPassword.value;
    const confirmPwd = regConfirmPassword.value;

    if (confirmPwd.length === 0) {
      regConfirmPassword.classList.remove("is-valid", "is-invalid");
      if (confirmMsg) confirmMsg.innerHTML = "";
      return false;
    }

    if (pwd === confirmPwd) {
      regConfirmPassword.classList.add("is-valid");
      regConfirmPassword.classList.remove("is-invalid");
      if (confirmMsg) {
        confirmMsg.className = "auth-feedback-msg success";
        confirmMsg.innerHTML =
          '<i class="fa-solid fa-circle-check"></i> Passwords match perfectly!';
      }
      return true;
    } else {
      regConfirmPassword.classList.add("is-invalid");
      regConfirmPassword.classList.remove("is-valid");
      if (confirmMsg) {
        confirmMsg.className = "auth-feedback-msg error";
        confirmMsg.innerHTML =
          '<i class="fa-solid fa-circle-xmark"></i> Passwords do not match';
      }
      return false;
    }
  }

  if (regConfirmPassword) {
    regConfirmPassword.addEventListener("input", checkPasswordMatch);
  }

  // --------------------------------------------------------------------------
  // Email Validation Helper
  // --------------------------------------------------------------------------
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  const emailInputs = document.querySelectorAll('input[type="email"]');
  emailInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const val = this.value.trim();
      const parentGroup = this.closest(".auth-input-group");
      const msgEl = parentGroup
        ? parentGroup.querySelector(".auth-feedback-msg")
        : null;

      if (val.length === 0) {
        this.classList.remove("is-valid", "is-invalid");
        if (msgEl) msgEl.innerHTML = "";
      } else if (validateEmail(val)) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
        if (msgEl) {
          msgEl.className = "auth-feedback-msg success";
          msgEl.innerHTML =
            '<i class="fa-solid fa-check"></i> Valid email address';
        }
      } else {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
        if (msgEl) {
          msgEl.className = "auth-feedback-msg error";
          msgEl.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Please enter a valid email format';
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Role Select Field Live Validation
  // --------------------------------------------------------------------------
  const roleSelects = document.querySelectorAll(".auth-select");
  roleSelects.forEach((select) => {
    select.addEventListener("change", function () {
      const parentGroup = this.closest(".auth-input-group");
      const msgEl = parentGroup
        ? parentGroup.querySelector(".auth-feedback-msg")
        : null;

      if (this.value !== "") {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
        if (msgEl) {
          msgEl.className = "auth-feedback-msg success";
          msgEl.innerHTML = '<i class="fa-solid fa-check"></i> Role selected';
        }
      } else {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
        if (msgEl) {
          msgEl.className = "auth-feedback-msg error";
          msgEl.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Please select a role';
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Toast Notification Helper
  // --------------------------------------------------------------------------
  function showAuthToast(title, message, isError = false) {
    let toast = document.getElementById("auth_toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "auth_toast";
      toast.className = "auth-toast-notification";
      document.body.appendChild(toast);
    }

    toast.className = isError
      ? "auth-toast-notification toast-error show"
      : "auth-toast-notification show";

    toast.innerHTML = `
      <div class="auth-toast-icon">
        <i class="fa-solid ${isError ? "fa-circle-exclamation" : "fa-paw"}"></i>
      </div>
      <div class="auth-toast-content">
        <h6>${title}</h6>
        <p>${message}</p>
      </div>
    `;

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  }

  // --------------------------------------------------------------------------
  // Register Form Submit Handler
  // --------------------------------------------------------------------------
  const registerForm = document.getElementById("register_form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let hasError = false;

      // 1. Validate Username (Letters only & Required)
      const username = usernameInput ? usernameInput.value.trim() : "";
      const usernameMsg = document.getElementById("username_msg");
      if (!username || username.length < 2) {
        hasError = true;
        usernameInput.classList.add("is-invalid");
        if (usernameMsg) {
          usernameMsg.className = "auth-feedback-msg error";
          usernameMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Full name is required (minimum 2 letters).';
        }
      }

      // 2. Validate Role
      const roleSelect = document.getElementById("reg_role");
      const roleMsg = document.getElementById("reg_role_msg");
      if (roleSelect && (!roleSelect.value || roleSelect.value === "")) {
        hasError = true;
        roleSelect.classList.add("is-invalid");
        if (roleMsg) {
          roleMsg.className = "auth-feedback-msg error";
          roleMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Please select your pet care role.';
        }
      }

      // 3. Validate Email
      const emailInput = document.getElementById("reg_email");
      const emailMsg = document.getElementById("reg_email_msg");
      if (!emailInput || !validateEmail(emailInput.value.trim())) {
        hasError = true;
        if (emailInput) emailInput.classList.add("is-invalid");
        if (emailMsg) {
          emailMsg.className = "auth-feedback-msg error";
          emailMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> A valid email address is required.';
        }
      }

      // 4. Validate Password & Weakness check
      const pwd = regPassword ? regPassword.value : "";
      const pwdMsg = document.getElementById("reg_password_msg");
      const pwdStrength = calculatePasswordStrength(pwd);

      if (!pwd || pwd.length < 8 || pwdStrength.level === "weak") {
        hasError = true;
        if (regPassword) regPassword.classList.add("is-invalid");
        if (pwdMsg) {
          pwdMsg.className = "auth-feedback-msg error";
          pwdMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Password is too weak. Meet all strength criteria above.';
        }
      }

      // 5. Validate Password Match
      const matches = checkPasswordMatch();
      if (!matches) {
        hasError = true;
        if (regConfirmPassword) regConfirmPassword.classList.add("is-invalid");
      }

      // 6. Validate Terms & Conditions Checkbox
      const termsCheck = document.getElementById("reg_terms");
      const termsMsg = document.getElementById("reg_terms_msg");
      if (termsCheck && !termsCheck.checked) {
        hasError = true;
        if (termsMsg) {
          termsMsg.className = "auth-feedback-msg error";
          termsMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> You must agree to the Terms & Privacy Policy.';
        }
      } else if (termsMsg) {
        termsMsg.innerHTML = "";
      }

      if (hasError) {
        showAuthToast(
          "Incomplete Registration",
          "Please correct the highlighted fields before submitting.",
          true,
        );
        return;
      }

      // Form is fully valid -> Show Loading & Redirect to login page
      const submitBtn = document.getElementById("reg_submit_btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating Account...';
      }

      showAuthToast(
        "Registration Successful! 🎉",
        "Welcome to Pet Care Services. Redirecting you to login...",
      );

      // Redirect to login.html
      setTimeout(function () {
        window.location.href = "login.html?registered=true";
      }, 1500);
    });
  }

  // --------------------------------------------------------------------------
  // Login Form Submit Handler
  // --------------------------------------------------------------------------
  const loginForm = document.getElementById("login_form");
  if (loginForm) {
    // Check if user was just redirected from register
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("registered") === "true") {
      showAuthToast(
        "Account Ready! 🐾",
        "Your account was created successfully. Please log in with your credentials.",
      );
    }

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let hasError = false;

      // 1. Role
      const roleSelect = document.getElementById("login_role");
      const roleMsg = document.getElementById("login_role_msg");
      if (roleSelect && (!roleSelect.value || roleSelect.value === "")) {
        hasError = true;
        roleSelect.classList.add("is-invalid");
        if (roleMsg) {
          roleMsg.className = "auth-feedback-msg error";
          roleMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Please select your account role.';
        }
      }

      // 2. Email
      const emailInput = document.getElementById("login_email");
      const emailMsg = document.getElementById("login_email_msg");
      if (!emailInput || !validateEmail(emailInput.value.trim())) {
        hasError = true;
        if (emailInput) emailInput.classList.add("is-invalid");
        if (emailMsg) {
          emailMsg.className = "auth-feedback-msg error";
          emailMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Please enter your registered email.';
        }
      }

      // 3. Password
      const pwdInput = document.getElementById("login_password");
      const pwdMsg = document.getElementById("login_password_msg");
      const pwdVal = pwdInput ? pwdInput.value : "";
      const pwdStrength = calculatePasswordStrength(pwdVal);

      if (!pwdVal || pwdVal.length < 8 || pwdStrength.level === "weak") {
        hasError = true;
        if (pwdInput) pwdInput.classList.add("is-invalid");
        if (pwdMsg) {
          pwdMsg.className = "auth-feedback-msg error";
          pwdMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Password must meet minimum security requirements (8+ chars).';
        }
      }

      // 4. Remember Me
      const rememberCheck = document.getElementById("login_remember");
      const rememberMsg = document.getElementById("login_remember_msg");
      if (rememberCheck && !rememberCheck.checked) {
        hasError = true;
        if (rememberMsg) {
          rememberMsg.className = "auth-feedback-msg error";
          rememberMsg.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Please check Remember Me to proceed.';
        }
      } else if (rememberMsg) {
        rememberMsg.innerHTML = "";
      }

      if (hasError) {
        showAuthToast(
          "Login Check Failed",
          "Please fill all required fields properly.",
          true,
        );
        return;
      }

      const submitBtn = document.getElementById("login_submit_btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Authenticating...';
      }

      showAuthToast(
        "Welcome Back! 🐾",
        "Login successful. Redirecting to home dashboard...",
      );

      setTimeout(function () {
        window.location.href = "../index.html";
      }, 1300);
    });
  }
});
