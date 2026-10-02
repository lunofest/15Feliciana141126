const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];


const COLORES_ICONOS = {
  'cuenta-regresiva': '#aaff03',
  'fecha': '#ff9000',
  'ubicaciones': '#ab00fe',
  'dress-code': '#00aaff',
  'regalos': '#ff9000',
  'canciones': '#ff00ff',
  'confirmacion': '#1eff00',
  'itinerario': '#ff00ff'
};

// Iconos SIN sombra (si quieres que uno no brille, escribe su nombre aquí)
const ICONOS_SIN_SOMBRA = ['confirmacion'];

// De aquí para abajo no toques nada
function pintarIcono(icono, color, conSombra) {
  icono.setAttribute('colors', `primary:${color},secondary:${color}`);
  if (conSombra) {
    icono.style.filter = `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})`;
  } else {
    icono.style.filter = 'none';
  }
}

const sectionIcons = { canciones: 'musica', regalos: 'regalos' };
Object.entries(sectionIcons).forEach(([sectionId, iconName]) => {
  const title = document.querySelector(`#${sectionId} .section__title`);
  if (!title) return;
  const color = COLORES_ICONOS[sectionId] || '#ff00ff';
  const icon = document.createElement('lord-icon');
  icon.className = 'section__icon';
  icon.src = `./assets/icons/${iconName}.json`;
  icon.dataset.src = icon.src;
  icon.setAttribute('trigger', 'loop');
  pintarIcono(icon, color, !ICONOS_SIN_SOMBRA.includes(sectionId));
  icon.setAttribute('aria-label', iconName);
  title.prepend(icon);
});

// Pinta los iconos que ya están en el HTML según su sección.
// Se recrea el icono para que nazca con el color nuevo (así lo toma seguro).
document.querySelectorAll('section[id] lord-icon').forEach((viejo) => {
  const seccion = viejo.closest('section').id;
  if (!COLORES_ICONOS[seccion]) return;
  const color = COLORES_ICONOS[seccion];
  const conSombra = !ICONOS_SIN_SOMBRA.includes(seccion);

  const nuevo = document.createElement('lord-icon');
  // copia todos los atributos originales menos 'colors'
  [...viejo.attributes].forEach((attr) => {
    if (attr.name !== 'colors') nuevo.setAttribute(attr.name, attr.value);
  });
  nuevo.className = viejo.className;
  pintarIcono(nuevo, color, conSombra);
  viejo.parentNode.replaceChild(nuevo, viejo);
});

// Pinta el reloj dibujado del itinerario
const reloj = document.querySelector('#itinerario .section__icon--reloj');
if (reloj && COLORES_ICONOS['itinerario']) {
  reloj.setAttribute('stroke', COLORES_ICONOS['itinerario']);
  const punto = reloj.querySelector('circle[fill]');
  if (punto) punto.setAttribute('fill', COLORES_ICONOS['itinerario']);
}

const intro = $('#intro');
$$('[data-open-invitation]').forEach((button) => button.addEventListener('click', () => {
  document.body.classList.remove('page--locked');
  intro.classList.add('is-hidden');
  const musicToggle = $('[data-music-toggle]');
  if (button.dataset.music === 'true') musicToggle.hidden = false;
}));

const countdown = $('[data-countdown]');
const updateCountdown = () => {
  const distance = new Date(countdown.dataset.date).getTime() - Date.now();
  const values = distance > 0 ? {
    days: Math.floor(distance / 86400000), hours: Math.floor(distance / 3600000) % 24,
    minutes: Math.floor(distance / 60000) % 60, seconds: Math.floor(distance / 1000) % 60,
  } : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  Object.entries(values).forEach(([unit, value]) => { $(`[data-unit="${unit}"]`).textContent = String(value).padStart(2, '0'); });
};
updateCountdown(); setInterval(updateCountdown, 1000);

const calendarGrid = $('[data-calendar-grid]');
const firstDay = new Date(2026, 10, 1).getDay();
const offset = firstDay === 0 ? 6 : firstDay - 1;
for (let i = 0; i < offset; i += 1) calendarGrid.insertAdjacentHTML('beforeend', '<span class="calendar__day calendar__day--empty"></span>');
for (let day = 1; day <= 30; day += 1) calendarGrid.insertAdjacentHTML('beforeend', `<span class="calendar__day${day === 14 ? ' calendar__day--selected' : ''}">${day}</span>`);

$$('[data-scroll-to]').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.scrollTo)?.scrollIntoView()));
$$('[data-map]').forEach((button) => button.addEventListener('click', () => window.open(button.dataset.map, '_blank', 'noopener')));
$$('[data-calendar]').forEach((button) => button.addEventListener('click', () => {
  const fiesta = button.dataset.calendar === 'fiesta';
  const start = fiesta ? '20261114T213000' : '20261114T203000';
  const end = fiesta ? '20261115T060000' : '20261114T213000';
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${fiesta ? 'Fiesta — Feliciana' : 'Misa — Feliciana'}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); link.download = 'invitacion-feliciana.ics'; link.click(); URL.revokeObjectURL(link.href);
}));

$('[data-song-form]').addEventListener('submit', (event) => { event.preventDefault(); $('[data-song-message]').textContent = '¡Gracias por la sugerencia!'; event.currentTarget.reset(); });
$$('[data-copy]').forEach((button) => button.addEventListener('click', async (event) => {
  const btn = event.currentTarget;
  await navigator.clipboard?.writeText(btn.dataset.copy);
  const small = btn.querySelector('small');
  const originalSmall = small?.textContent;
  if (small) small.textContent = '¡Copiado!';
  setTimeout(() => { if (small) small.textContent = originalSmall; }, 1500);
}));



// --------------------------MUSICA----------------------------------

const audio = document.querySelector('.musica audio');
const playPauseButton = document.querySelector('.musica__button');

playPauseButton.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseButton.classList.add('musica__button--playing');
    playPauseButton.classList.remove('musica__button--paused');
  } else {
    audio.pause();
    playPauseButton.classList.remove('musica__button--playing');
    playPauseButton.classList.add('musica__button--paused');
  }
});




// ------------------- fotos ----------------------

var swiper = new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 0,
    stretch: 4,
    depth: 3,
    modifier: 50,
    slideShadows: true,
  },
  pagination: {
    el: ".swiper-pagination",
  },
  autoplay: {
    delay: 2000, // Time between slides in milliseconds (e.g., 3 seconds)
    disableOnInteraction: false, // Set to true to stop autoplay on user interaction (e.g., dragging)
  },
  loop: true, // Enable infinite loop
});

// --------------- confirmacion --------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  // Números de la invitación actual
  const recipientNumber1 = '543858504621'; // Confirmar a Feliciana
  const recipientNumber2 = '543854018905'; // Confirmar a Claudia

  // Función para enviar mensaje por WhatsApp
  function sendMessage(phoneNumber) {
    const userName = document.getElementById('userFullName').value.trim();
    const userMessage = document.getElementById('customMessage').value.trim();
    const attendanceStatus = document.querySelector('input[name="attendanceOption"]:checked');

    if (!attendanceStatus) {
      alert('Por favor, selecciona si asistirás o no.');
      return;
    }

    if (userName === '') {
      alert('Por favor, completa tu nombre y apellido antes de enviar.');
      return;
    }

    let finalMessage = `*Presencia:* ${attendanceStatus.value}\n*Nombre y Apellido:* ${userName}`;
    if (userMessage !== '') {
      finalMessage += `\n*Mensaje:* ${userMessage}`;
    }
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;

    // Abre la URL de WhatsApp en una nueva pestaña
    window.open(whatsappLink, '_blank');

    // Mostrar mensaje de confirmación
    alert('Mensaje enviado');

    // Limpiar los campos de entrada
    document.getElementById('userFullName').value = '';
    document.getElementById('customMessage').value = '';
    document.querySelectorAll('input[name="attendanceOption"]').forEach(radio => radio.checked = false);

    // Volver al bloque de formulario
    document.getElementById('confirmacion').scrollIntoView({ behavior: 'smooth' });
  }

  // Asignar eventos a los botones
  document.getElementById('botoncito1').addEventListener('click', function () {
    sendMessage(recipientNumber1);
  });

  document.getElementById('botoncito2').addEventListener('click', function () {
    sendMessage(recipientNumber2);
  });
});