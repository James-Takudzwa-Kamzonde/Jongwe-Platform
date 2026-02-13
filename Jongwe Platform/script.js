const API = "http://127.0.0.1:8000";



  const targetDate = new Date("Mar 1, 2026 17:00:00").getTime();
  // if event is at 06:00:
  // const targetDate = new Date("Dec 7, 2025 06:00:00").getTime();

  const timer = setInterval(function () {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(timer);
      document.getElementById("days").innerHTML = "00";
      document.getElementById("hours").innerHTML = "00";
      document.getElementById("minutes").innerHTML = "00";
      document.getElementById("seconds").innerHTML = "00";
      document.querySelector(".mt-6")?.insertAdjacentHTML(
        "afterend",
        "<p class='mt-4 text-lg font-bold text-green-600'>🎉 The event has started!</p>"
      );
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = days.toString().padStart(2, "0");
    document.getElementById("hours").innerHTML = hours.toString().padStart(2, "0");
    document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, "0");
  }, 1000);

  $(document).ready(function () {
    $('.customer-logos').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 1500,
      arrows: false,
      dots: false,
      pauseOnHover: false,
      responsive: [
        { breakpoint: 992, settings: { slidesToShow: 4 } },
        { breakpoint: 768, settings: { slidesToShow: 3 } },
        { breakpoint: 576, settings: { slidesToShow: 2 } }
      ]
    });
  });

  document.querySelectorAll(".js-get-tickets").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Bootstrap 5:
      if (window.bootstrap) {
        const modal = new bootstrap.Modal(document.getElementById("myModal"));
        modal.show();
      } else {
        // Bootstrap 3/4 (requires jQuery):
        if (window.jQuery) jQuery("#myModal").modal("show");
      }
    });
  });

    document.getElementById("proceedBtn")?.addEventListener("click", () => {
    const type = document.querySelector('input[name="ticket_type"]:checked')?.value;
    const qty  = document.getElementById("ticketQty")?.value || 1;
    const total = document.getElementById("ticketTotal")?.textContent || "";

    // Example: do something
    console.log({ type, qty, total });

    // Example redirect (replace with your page)
    // window.location.href = `checkout.html?type=${encodeURIComponent(type)}&qty=${qty}`;
  });
  


  (function () {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("mobileMenuClose");
    const backdrop = document.getElementById("backdrop");

    if (!btn || !menu || !closeBtn || !backdrop) return;

    function lockScroll(on) {
      document.documentElement.classList.toggle("overflow-hidden", on);
      document.body.classList.toggle("overflow-hidden", on);
    }

    function openMenu() {
      // make visible
      menu.classList.remove("hidden");
      backdrop.classList.remove("pointer-events-none", "opacity-0");
      backdrop.classList.add("opacity-100");
      menu.classList.remove("translate-x-full");
      menu.classList.add("translate-x-0");

      btn.setAttribute("aria-expanded", "true");
      backdrop.setAttribute("aria-hidden", "false");
      lockScroll(true);
    }

    function closeMenu() {
      // animate out
      menu.classList.add("translate-x-full");
      menu.classList.remove("translate-x-0");

      backdrop.classList.add("pointer-events-none", "opacity-0");
      backdrop.classList.remove("opacity-100");

      btn.setAttribute("aria-expanded", "false");
      backdrop.setAttribute("aria-hidden", "true");
      lockScroll(false);

      // hide after transition
      window.setTimeout(() => {
        if (btn.getAttribute("aria-expanded") === "false") {
          menu.classList.add("hidden");
        }
      }, 300);
    }

    // Toggle
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    // Close actions
    closeBtn.addEventListener("click", closeMenu);
    backdrop.addEventListener("click", closeMenu);

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        closeMenu();
      }
    });

    // Close when clicking a menu link
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) closeMenu();
    });
  })();

  



document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("mobileMenuClose");
  const backdrop = document.getElementById("backdrop");

  if (!btn || !menu || !backdrop) return;

  const open = () => {
    menu.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    btn.setAttribute("aria-expanded", "true");
    backdrop.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    menu.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    btn.setAttribute("aria-expanded", "false");
    backdrop.setAttribute("aria-hidden", "true");
  };

  btn.addEventListener("click", () => {
    menu.classList.contains("is-open") ? close() : open();
  });

  closeBtn && closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });
});

(function () {
  // ✅ Put your ticket prices here
  const prices = {
    "Early Bird": 5,
    "VIP": 10,
    "VVIP": 20
  };

  const modalEl = document.getElementById("myModal");
  const qtyEl = document.getElementById("ticketQty");
  const totalEl = document.getElementById("ticketTotal");

  function getSelectedType(){
    return document.querySelector('input[name="ticket_type"]:checked')?.value || "Early Bird";
  }

  function highlightSelected(){
    const selected = getSelectedType();

    document.querySelectorAll(".ticket-card").forEach(card => {
      const radio = card.querySelector('input[name="ticket_type"]');
      if (!radio) return;

      const isSelected = radio.value === selected;
      card.classList.toggle("is-selected", isSelected);

      // Optional: switch button look/text if you have .ticket-btn
      const btn = card.querySelector(".ticket-btn");
      if (btn){
        btn.classList.toggle("primary", isSelected);
        btn.classList.toggle("ghost", !isSelected);
        btn.textContent = isSelected ? "SELECTED" : "SELECT";
      }
    });
  }

  function updateTotal(){
    const type = getSelectedType();
    const qty = Math.max(1, parseInt(qtyEl?.value || "1", 10));
    if (qtyEl) qtyEl.value = qty;

    const total = (prices[type] || 0) * qty;
    if (totalEl) totalEl.textContent = "$" + total;

    highlightSelected();
  }

  // ✅ Click card -> select its radio -> update
  document.querySelectorAll(".ticket-card").forEach(card => {
    card.addEventListener("click", () => {
      const radio = card.querySelector('input[name="ticket_type"]');
      if (radio){
        radio.checked = true;
        updateTotal();
      }
    });
  });

  // ✅ Quantity changes -> update
  if (qtyEl){
    qtyEl.addEventListener("input", updateTotal);
    qtyEl.addEventListener("change", updateTotal);
  }

  // ✅ When modal opens: force Early Bird selected + total $5 + highlight
  if (modalEl){
    modalEl.addEventListener("shown.bs.modal", () => {
      const early = document.querySelector('input[name="ticket_type"][value="Early Bird"]');
      if (early) early.checked = true;
      if (qtyEl) qtyEl.value = 1;
      updateTotal();
    });
  }

  // Run once on load (safe)
  updateTotal();
})();


const modalEl = document.getElementById("myModal");
if (modalEl) {
  modalEl.addEventListener("hidden.bs.modal", () => {
    // remove bootstrap backdrop if stuck
    document.querySelectorAll(".modal-backdrop").forEach(b => b.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    // remove YOUR custom backdrop if it exists
    const backdrop = document.getElementById("backdrop");
    if (backdrop) {
      backdrop.classList.add("pointer-events-none", "opacity-0");
      backdrop.classList.remove("opacity-100", "is-open");
    }
  });
}


    // BASE HELPERS



function saveUser(user) {
  localStorage.setItem("jc_user", JSON.stringify(user));
}
function getUser() {
  return JSON.parse(localStorage.getItem("jc_user") || "null");
}
function logoutUser() {
  localStorage.removeItem("jc_user");
}



document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  if (!email || !password) return alert("Enter email + password");

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.detail || "Login failed");

    // ✅ STORE EVERYTHING RETURNED
    localStorage.setItem("jc_user", JSON.stringify(data));

    // ✅ STORE TOKEN IF PRESENT
    if (data.access_token) localStorage.setItem("token", data.access_token);

    alert("Login successful!");
    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert("Server error. Is FastAPI running?");
  }
});


(function () {
  const loggedOutLink = document.getElementById("authLinkLoggedOut");
  const wrap = document.getElementById("userMenuWrap");
  const btn = document.getElementById("userMenuBtn");
  const dropdown = document.getElementById("userDropdown");
  const avatar = document.getElementById("userAvatar");
  const signOutBtn = document.getElementById("signOutBtn");

  // ✅ THESE ARE THE TEXTS YOU HARDCODED BEFORE
  const nameText = document.getElementById("userNameText");
  const emailText = document.getElementById("userEmailText");

  if (!loggedOutLink || !wrap || !btn || !dropdown || !avatar || !signOutBtn) return;

  const storedUser = JSON.parse(localStorage.getItem("jc_user") || "null");

  // ✅ YOUR BACKEND MIGHT RETURN:
  // data.email OR data.user.email
  // data.name/full_name OR data.user.name/full_name
  const userEmail =
    (storedUser?.email ||
      storedUser?.user?.email ||
      localStorage.getItem("user_email") ||
      "").trim();

  const userName =
    (storedUser?.full_name ||
      storedUser?.name ||
      storedUser?.user?.full_name ||
      storedUser?.user?.name ||
      "").trim();

  // ✅ toggle UI based on login state
  if (!userEmail) {
    loggedOutLink.classList.remove("hidden");
    wrap.classList.add("hidden");
    return;
  }

  loggedOutLink.classList.add("hidden");
  wrap.classList.remove("hidden");

  // ✅ SET DROPDOWN NAME + EMAIL
  const displayName = userName || userEmail.split("@")[0]; // fallback
  if (nameText) nameText.textContent = displayName;
  if (emailText) emailText.textContent = userEmail;

  // ✅ SET AVATAR LETTER
  const letter = (displayName.trim()[0] || "U").toUpperCase();
  avatar.textContent = letter;

  function closeMenu() {
    dropdown.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    dropdown.classList.toggle("hidden");
    btn.setAttribute(
      "aria-expanded",
      dropdown.classList.contains("hidden") ? "false" : "true"
    );
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("token");
    localStorage.removeItem("jc_user");
    closeMenu();
    location.reload();
  });
})();
