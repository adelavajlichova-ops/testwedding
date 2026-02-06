const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
const instruction = document.getElementById("instruction");
const container = document.querySelector(".heart-wrapper");

// Zabránìní nechtìnému chování v prohlížeèi
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Deklarujeme obrázek jen JEDNOU
const heartImg = new Image();
heartImg.src = "heart.png";

// 2. Poèkáme na naètení obrázku a pak spustíme vše ostatní
heartImg.onload = () => {
    initCanvas();
};

// Pokud by se obrázek nenaèetl (chyba v cestì), spustíme to aspoò se zlatou barvou
heartImg.onerror = () => {
    console.error("Obrázek heart.png nebyl nalezen!");
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

    // Výchozí zlatá barva (pokud by obrázek selhal)
    ctx.fillStyle = "#b8860b";
    ctx.fillRect(0, 0, w, h);

    // Vykreslení obrázku srdce pøes barvu
    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        ctx.drawImage(heartImg, 0, 0, w, h);
    }
}

// Události pro stírání
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

        if (percentage > 20) {
            revealEverything();
        }
    } catch (e) {
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 1500);
        }
    }
}

function revealEverything() {
    createConfetti();

    if (instruction) {
        instruction.style.transition = "opacity 1s ease";
        instruction.style.opacity = "0";

        // TADY JE TA ZMÌNA:
        // Místo smazání (display: none) jen prvek zneviditelníme (visibility: hidden)
        // Takže tam zùstane prázdné místo a srdíèko neskoèí dolù.
        setTimeout(() => {
            instruction.style.visibility = "hidden";
        }, 1000);
    }

    canvas.style.transition = "opacity 1s ease";
    canvas.style.opacity = "0";

    setTimeout(() => {
        canvas.style.display = "none";
        // Tady jsme u instruction smazali ten øádek s display: none
    }, 1000);
}

function createConfetti() {
    const confContainer = document.getElementById("confetti-container");
    if (!confContainer) return;

    const colors = ["#D4AF37", "#FFD700", "#C5B358", "#E6BE8A", "#B8860B"];

    for (let i = 0; i < 350; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        // ROZPTYL PO CELÉ ŠÍØCE: od -5% do 105% šíøky, aby byly i u krajù
        confetti.style.left = (Math.random() * 110 - 5) + "vw";
        confetti.style.top = "-20px";
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const size = Math.random() * 4 + 3 + "px";
        confetti.style.width = size;
        confetti.style.height = size;
        confetti.style.position = "absolute";
        confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "1px";

        confContainer.appendChild(confetti);

        const duration = 8000 + Math.random() * 3000;
        // POSTUPNÝ NÁSTUP: každá konfeta zaène padat s jiným zpoždìním (0 až 3 sekundy)
        const delay = Math.random() * 3000;

        confetti.animate([
            { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
            // VÌTŠÍ ROZPTYL PØI PÁDU: konfety budou "plout" i 100px doleva nebo doprava
            { transform: `translate3d(${Math.random() * 200 - 100}px, 105vh, 0) rotate(1440deg)`, opacity: 0 }
        ], {
            duration: duration,
            delay: delay, // Tady je to kouzlo postupného padání
            easing: "linear" // Pro pøirozený pád je lineární pohyb nìkdy lepší
        }).onfinish = () => confetti.remove();
    }
}