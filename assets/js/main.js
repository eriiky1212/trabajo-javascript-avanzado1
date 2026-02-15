document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     NOTICIAS (fetch JSON)
     Requiere: #newsStatus, #newsList
  ========================= */
  const newsStatus = document.getElementById("newsStatus");
  const newsList = document.getElementById("newsList");

  if (newsStatus && newsList) {
    const isViews = window.location.pathname.includes("/views/");
    const jsonPath = isViews
      ? "../assets/data/noticias.json"
      : "assets/data/noticias.json";

    newsStatus.textContent = "Cargando noticias…";

    fetch(jsonPath, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${jsonPath}`);
        return res.json();
      })
      .then((items) => {
        if (!Array.isArray(items)) throw new Error("El JSON debe ser un array []");

        newsStatus.textContent = "";
        newsList.innerHTML = items.map((n) => `
          <article class="card">
            <h3>${n.titulo ?? ""}</h3>
            <small class="small">${n.fecha ?? ""}</small>
            <p>${n.texto ?? ""}</p>
          </article>
        `).join("");
      })
      .catch((err) => {
        console.error("NEWS ERROR:", err);
        newsStatus.textContent = "Error cargando noticias";
        newsList.innerHTML = `<p class="small">Ruta usada: <code>${jsonPath}</code></p>`;
      });
  }


  /* =========================
     GALERÍA (Carrusel)
     Requiere: #carouselImg, #carouselCaption, #carouselDots, .btn-prev, .btn-next
  ========================= */
  const img = document.getElementById("carouselImg") || document.getElementById("carouselImage");
  const cap = document.getElementById("carouselCaption");
  const dotsWrap = document.getElementById("carouselDots");
  const btnPrev = document.querySelector(".btn-prev");
  const btnNext = document.querySelector(".btn-next");

  if (img && cap && dotsWrap && btnPrev && btnNext) {
    const slides = [
      { src: "../assets/img/galeria1.jpg", alt: "Imagen 1 de la galería", caption: "Proyecto 1" },
      { src: "../assets/img/galeria2.jpg", alt: "Imagen 2 de la galería", caption: "Proyecto 2" },
      { src: "../assets/img/galeria3.jpg", alt: "Imagen 3 de la galería", caption: "Proyecto 3" },
      { src: "../assets/img/galeria4.jpg", alt: "Imagen 4 de la galería", caption: "Proyecto 4" }
    ];

    let index = 0;

    function renderDots() {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dot" + (i === index ? " active" : "");
        b.setAttribute("aria-label", `Ir a la imagen ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }

    function update() {
      const s = slides[index];
      img.onerror = () => console.error("No se pudo cargar:", s.src);
      img.src = s.src;
      img.alt = s.alt;
      cap.textContent = s.caption;

      dotsWrap.querySelectorAll(".dot").forEach((d, i) => {
        d.classList.toggle("active", i === index);
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    btnNext.addEventListener("click", () => goTo(index + 1));
    btnPrev.addEventListener("click", () => goTo(index - 1));

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    });

    renderDots();
    update();
  }

  /* =========================
     PRESUPUESTO (PDF: validación estricta + total automático)
     Requiere (IDs exactos en presupuesto.html):
     #formPresupuesto, #nombre, #apellidos, #telefono, #email,
     #producto, #plazo, #extraSeo, #extraMantenimiento, #extraDiseno,
     #condiciones,
     #errNombre #errApellidos #errTelefono #errEmail #errProducto #errPlazo #errCondiciones,
     #infoDescuento, #resProducto #resExtras #resDescuento #resTotal, #msgPresupuesto
  ========================= */
  const form = document.getElementById("formPresupuesto");
  if (form) {
    const nombre = document.getElementById("nombre");
    const apellidos = document.getElementById("apellidos");
    const telefono = document.getElementById("telefono");
    const email = document.getElementById("email");

    const producto = document.getElementById("producto");
    const plazo = document.getElementById("plazo");

    const extraSeo = document.getElementById("extraSeo");
    const extraMantenimiento = document.getElementById("extraMantenimiento");
    const extraDiseno = document.getElementById("extraDiseno");

    const condiciones = document.getElementById("condiciones");

    const errNombre = document.getElementById("errNombre");
    const errApellidos = document.getElementById("errApellidos");
    const errTelefono = document.getElementById("errTelefono");
    const errEmail = document.getElementById("errEmail");
    const errProducto = document.getElementById("errProducto");
    const errPlazo = document.getElementById("errPlazo");
    const errCondiciones = document.getElementById("errCondiciones");

    const infoDescuento = document.getElementById("infoDescuento");

    const resProducto = document.getElementById("resProducto");
    const resExtras = document.getElementById("resExtras");
    const resDescuento = document.getElementById("resDescuento");
    const resTotal = document.getElementById("resTotal");

    const msg = document.getElementById("msgPresupuesto");

    const PRICES = {
      "web-corporativa": 500,
      "landing": 350,
      "ecommerce": 900
    };

    const EXTRA_PRICES = {
      seo: 150,
      mantenimiento: 100,
      diseno: 200
    };

    const setErr = (input, errEl, text) => {
      if (errEl) errEl.textContent = text || "";
      if (input) input.setAttribute("aria-invalid", text ? "true" : "false");
    };

    // letras + espacios (incluye acentos/ñ)
    const reLetras = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]+$/;

    function validateContact() {
      let ok = true;

      const n = nombre.value.trim();
      if (!n) { setErr(nombre, errNombre, "Obligatorio."); ok = false; }
      else if (!reLetras.test(n)) { setErr(nombre, errNombre, "Solo letras."); ok = false; }
      else if (n.length > 15) { setErr(nombre, errNombre, "Máx. 15."); ok = false; }
      else setErr(nombre, errNombre, "");

      const a = apellidos.value.trim();
      if (!a) { setErr(apellidos, errApellidos, "Obligatorio."); ok = false; }
      else if (!reLetras.test(a)) { setErr(apellidos, errApellidos, "Solo letras."); ok = false; }
      else if (a.length > 40) { setErr(apellidos, errApellidos, "Máx. 40."); ok = false; }
      else setErr(apellidos, errApellidos, "");

      const t = telefono.value.trim();
      if (!/^\d{9}$/.test(t)) { setErr(telefono, errTelefono, "9 dígitos sin espacios."); ok = false; }
      else setErr(telefono, errTelefono, "");

      const e = email.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
      if (!emailOk) { setErr(email, errEmail, "Email inválido."); ok = false; }
      else setErr(email, errEmail, "");

      return ok;
    }

    function validateBudget() {
      let ok = true;

      if (!producto.value) { setErr(producto, errProducto, "Selecciona un producto."); ok = false; }
      else setErr(producto, errProducto, "");

      const p = Number(plazo.value);
      if (!Number.isFinite(p) || p < 1) { setErr(plazo, errPlazo, "Plazo mínimo 1."); ok = false; }
      else setErr(plazo, errPlazo, "");

      if (!condiciones.checked) { setErr(condiciones, errCondiciones, "Debes aceptar condiciones."); ok = false; }
      else setErr(condiciones, errCondiciones, "");

      return ok;
    }

    // Descuento por plazo:
    // 1–10 días: 0%
    // 11–30 días: 5%
    // > 30 días: 10%
    function getDiscountRate(days) {
      if (days > 30) return 0.10;
      if (days >= 11) return 0.05;
      return 0;
    }

    function calcularTotal() {
      const base = PRICES[producto.value] || 0;

      let extrasTotal = 0;
      const extrasNames = [];

      if (extraSeo?.checked) { extrasTotal += EXTRA_PRICES.seo; extrasNames.push("SEO"); }
      if (extraMantenimiento?.checked) { extrasTotal += EXTRA_PRICES.mantenimiento; extrasNames.push("Mantenimiento"); }
      if (extraDiseno?.checked) { extrasTotal += EXTRA_PRICES.diseno; extrasNames.push("Diseño premium"); }

      const days = Number(plazo.value) || 0;
      const rate = getDiscountRate(days);

      const subtotal = base + extrasTotal;
      const discountAmount = Math.round(subtotal * rate);
      const total = subtotal - discountAmount;

      if (resProducto) {
        resProducto.textContent = producto.value
          ? producto.options[producto.selectedIndex].text
          : "—";
      }
      if (resExtras) resExtras.textContent = extrasNames.length ? extrasNames.join(", ") : "Ninguno";
      if (resDescuento) resDescuento.textContent = rate ? `-${Math.round(rate * 100)}% (${discountAmount}€)` : "—";
      if (resTotal) resTotal.textContent = `${total}€`;

      if (infoDescuento) {
        infoDescuento.textContent = rate
          ? `Descuento aplicado: ${Math.round(rate * 100)}%`
          : "Descuento: —";
      }
    }

    // Recalcular automáticamente (sin botones)
    [producto, extraSeo, extraMantenimiento, extraDiseno].forEach((el) => el?.addEventListener("change", calcularTotal));
    plazo?.addEventListener("input", calcularTotal);

    // Validación al escribir (solo marca lo que toque)
    [nombre, apellidos, telefono, email].forEach((el) => el?.addEventListener("input", validateContact));
    producto?.addEventListener("change", validateBudget);
    plazo?.addEventListener("input", validateBudget);
    condiciones?.addEventListener("change", validateBudget);

   form.addEventListener("submit", (e) => {
  e.preventDefault();

  // limpiar mensaje previo
  if (msg) msg.textContent = "";

  const ok1 = validateContact();
  const ok2 = validateBudget();
  calcularTotal();

  if (!(ok1 && ok2)) {
    if (msg) msg.textContent = "❌ Revisa los campos marcados antes de enviar.";
    return;
  }

  // Mostrar confirmación (NO desaparece)
  if (msg) msg.textContent = "✅ Presupuesto enviado correctamente (envío simulado).";

  // Opcional: mantener el resumen visible 1.5s y luego resetear
  setTimeout(() => {
    form.reset();
    calcularTotal(); // deja resumen coherente tras reset
  }, 1500);
});


    form.addEventListener("reset", () => {
      setTimeout(() => {
        if (msg) msg.textContent = "";
        [nombre, apellidos, telefono, email, producto, plazo, condiciones].forEach((el) => el?.setAttribute("aria-invalid", "false"));
        [errNombre, errApellidos, errTelefono, errEmail, errProducto, errPlazo, errCondiciones].forEach((el) => { if (el) el.textContent = ""; });
        calcularTotal();
      }, 0);
    });

    calcularTotal();
  }

    /* =========================
     CONTACTO (Leaflet + ruta GPS por calles)
     Requiere: #map, #btnRuta, #mapStatus
     Librerías: Leaflet + Leaflet Routing Machine
  ========================= */
  const mapStatus = document.getElementById("mapStatus");
  const mapEl = document.getElementById("map");

  if (mapEl && typeof L !== "undefined") {
    const empresa = { lat: 41.9794, lng: 2.8214 }; // Girona

    const map = L.map("map").setView([empresa.lat, empresa.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([empresa.lat, empresa.lng]).addTo(map)
      .bindPopup("NovaWeb Studio (Empresa)");

    const btnRuta = document.getElementById("btnRuta");

    // Control de ruta (se crea cuando tengamos ubicación)
    let routingControl = null;

    function showRoute(clienteLat, clienteLng) {
      // Necesita Leaflet Routing Machine
      if (!L.Routing) {
        if (mapStatus) mapStatus.textContent = "Falta la librería de rutas (Leaflet Routing Machine).";
        return;
      }

      // Si ya había una ruta, la quitamos
      if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
      }

      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(clienteLat, clienteLng),          // origen: tú
          L.latLng(empresa.lat, empresa.lng)         // destino: empresa
        ],
        // OSRM público (para trabajos va bien)
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1"
        }),
        lineOptions: {
          addWaypoints: false
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        // Oculta el panel de instrucciones si el profe solo pide el trazado:
        // Si quieres instrucciones tipo GPS, ponlo en true.
        show: false
      }).addTo(map);

      if (mapStatus) mapStatus.textContent = "Ruta por calles generada (tipo GPS).";
    }

    if (btnRuta && mapStatus) {
      btnRuta.addEventListener("click", () => {
        mapStatus.textContent = "Calculando ruta… (permitir ubicación)";

        if (!navigator.geolocation) {
          mapStatus.textContent = "Tu navegador no soporta geolocalización.";
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const clienteLat = pos.coords.latitude;
            const clienteLng = pos.coords.longitude;
            showRoute(clienteLat, clienteLng);
          },
          () => {
            mapStatus.textContent = "No se pudo obtener tu ubicación. Permite el acceso a ubicación.";
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
  }

});