const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
const instruction = document.getElementById("instruction");
const container = document.querySelector(".heart-wrapper");

// Zabr�n�n� necht�n�mu chov�n� v prohl�e�i
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Deklarujeme obr�zek jen JEDNOU
const heartImg = new Image();
heartImg.src = "heart.png";

// 2. Po�k�me na na�ten� obr�zku a pak spust�me v�e ostatn�
heartImg.onload = () => {
    initCanvas();
};

// Pokud by se obr�zek nena�etl (chyba v cest�), spust�me to aspo� se zlatou barvou
heartImg.onerror = () => {
    console.error("Obr�zek heart.png nebyl nalezen!");
    initCanvas();
};

function initCanvas() {
    const dpr = window.devicePixelRatio || 2;
    const w = container.offsetWidth || 300;
    const h = container.offsetHeight || 300;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.scale(dpr, dpr);

    // V�choz� zlat� barva (pokud by obr�zek selhal)
    ctx.fillStyle = "#b8860b";
    ctx.fillRect(0, 0, w, h);

    // Vykreslen� obr�zku srdce p�es barvu
    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        ctx.drawImage(heartImg, 0, 0, w, h);
    }
    document.querySelector('.invite-container').style.opacity = "1";
}

// Ud�losti pro st�r�n�
["mousedown", "touchstart"].forEach(evt =>
    canvas.addEventListener(evt, (e) => {
        scratching = true;
        scratch(e);
    }, { passive: false })
);

["mouseup", "touchend"].forEach(evt =>
    canvas.addEventListener(evt, () => scratching = false)
);

["mousemove", "touchmove"].forEach(evt =>
    canvas.addEventListener(evt, scratch, { passive: false })
);

function scratch(e) {
    if (!scratching) return;

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
}

function checkReveal() {
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let cleared = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) cleared++;
        }

        const percentage = (cleared / (pixels.length / 4)) * 100;

        if (percentage > 60) {
            revealEverything();
        }
    } catch (e) {
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 3000);
        }
    }
}

function revealEverything() {
    createConfetti();

    if (instruction) {
        instruction.style.transition = "opacity 1s ease";
        instruction.style.opacity = "0";
        setTimeout(() => { instruction.style.visibility = "hidden"; }, 1000);
    }

    canvas.style.transition = "opacity 1s ease";
    canvas.style.opacity = "0";

    setTimeout(() => {
        canvas.style.display = "none";

        // POJISTKA PRO TLA��TKO: 
        // Zobraz�me ho a� ve chv�li, kdy srdce zmiz�, aby se nekrylo s canvasem
        const calWrapper = document.getElementById("calendar-wrapper");
        if (calWrapper) {
            calWrapper.classList.add("visible");
            console.log("Tla��tko aktivov�no"); // Tohle uvid� v konzoli prohl�e�e
        }
    }, 1000);
}

function createConfetti() {
    const confContainer = document.getElementById("confetti-container");
    const colors = ["#D4AF37", "#FFD700", "#C5B358", "#E6BE8A", "#B8860B", "#FDFDFD"];
    const shapes = ["circle", "square", "diamond"]; // Definujeme tvary

    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        confetti.style.left = "50vw";
        confetti.style.top = "50vh";

        // N�hodn� v�b�r barvy a tvaru
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        confetti.style.backgroundColor = color;

        // Nastaven� rozm�r�
        const size = Math.random() * 8 + 8 + "px";
        confetti.style.width = size;
        confetti.style.height = size;

        // Logika pro tvary
        if (shape === "circle") {
            confetti.style.borderRadius = "50%";
        } else if (shape === "diamond") {
            confetti.style.transform = "rotate(45deg)";
            // Aby se rotace z transformace netloukla s animac�, 
            // nastav�me ji rad�ji p��mo v kl��ov�ch sn�mc�ch n�e
        }
        // Square (�tvere�ek) nepot�ebuje extra styl, je to default

        confContainer.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 600 + 200;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;

        // N�hodn� rotace pro efekt "m�h�n�" ve vzduchu
        const randomRotation = Math.random() * 1080 - 540;

        confetti.animate([
            {
                transform: `translate(-50%, -50%) scale(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 250}px)) scale(1) rotate(${randomRotation}deg)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 3000 + 5000, // Trv�n� 5-8 sekund
            easing: "cubic-bezier(0.1, 0.5, 0.2, 1)",
            fill: "forwards"
        }).onfinish = () => confetti.remove();
    }
}

function addSparklesToText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    setInterval(() => {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";

        // N�hodn� pozice v r�mci textu
        const rect = element.getBoundingClientRect();
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;

        sparkle.style.left = (rect.left + window.scrollX + x) + "px";
        sparkle.style.top = (rect.top + window.scrollY + y) + "px";

        // N�hodn� animace
        sparkle.style.animation = `sparkleAnim ${Math.random() * 0.5 + 0.5}s linear forwards`;

        document.body.appendChild(sparkle);

        // Odstran�n� jiskry po animaci
        setTimeout(() => sparkle.remove(), 1000);
    }, 150); // Jak rychle se jiskry objevuj� (men�� ��slo = v�c jisk�en�)
}

// Spust�me jisk�en� pro nadpis a instrukce
addSparklesToText("main-title");
addSparklesToText("instruction");
addSparklesToText("wedding-date"); 

/*
function downloadIcs() {
    // Definice ud�losti (bez diakritiky pro maxim�ln� kompatibilitu)
    const title = "Svatba Anicky a Pitra";
    const location = "Zahradni a plesovy dum, Teplice";
    const startDate = "20260606T130000";
    const endDate = "20260606T235900";

    // Sestaven� obsahu ICS souboru
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "DTSTART:" + startDate,
        "DTEND:" + endDate,
        "SUMMARY:" + title,
        "LOCATION:" + location,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    // Vytvo�en� skryt�ho odkazu
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'svatba.ics');

    // Trik pro iPhone: p�id�n� do dokumentu a vynucen� kliknut�
    document.body.appendChild(link);
    link.click();

    // Vy�i�t�n� pam�ti
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 200);
}
*/

function addToGoogleCalendar() {
    const title = encodeURIComponent("Svatba Aničky a Pítra");
    const details = encodeURIComponent("Zveme Vás na naši svatbu v Zahradním a plesovém domě.");
    const location = encodeURIComponent("U Zámku 525, 415 01 Teplice 1");
    const startDate = "20260606T100000";
    const endDate = "20260606T235900";

    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}&sf=true&output=xml`;

    window.open(googleUrl, '_blank');
}