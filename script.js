const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
const instruction = document.getElementById("instruction");
const container = document.querySelector(".heart-wrapper");

let scratching = false;

function initCanvas() {
    const dpr = window.devicePixelRatio || 2;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);

    ctx.drawImage(heartImg, 0, 0, rect.width, rect.height);

}

const heartImg = new Image();
heartImg.src = "heart.png";

heartImg.onload = () => {
    initCanvas();
};

// Eventy pro myš i dotyk
["mousedown", "touchstart"].forEach(evt =>
    canvas.addEventListener(evt, (e) => {
        scratching = true;
        scratch(e);
    })
);

["mouseup", "touchend"].forEach(evt =>
    canvas.addEventListener(evt, () => scratching = false)
);

["mousemove", "touchmove"].forEach(evt =>
    canvas.addEventListener(evt, scratch)
);

function scratch(e) {
    if (!scratching) return;
    
    // Zamezí scrollování stránky při stírání
    if (e.cancelable) e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    
    // Získání souřadnic (ošetření pro myš i dotyk najednou)
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // VÝPOČET: Odečteme pozici canvasu od pozice prstu
    // Toto by mělo fungovat i s ctx.scale(dpr, dpr)
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    
    // Zkusíme dát gumu o něco větší (50), aby to na mobilu bylo pohodlné
    ctx.arc(x, y, 40, 0, Math.PI * 2); 
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

        // Pokud je setřeno více než 20 % celkové plochy
        if (percentage > 20) {
            revealEverything();
        }
    } catch (e) {
        // Pojistka pro případ chyby v prohlížeči
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 1500);
        }
    }
}

function revealEverything() {
    const mainTitle = document.getElementById("main-title");
    const instruction = document.getElementById("instruction");
    const initials = document.querySelector(".initials");

    // Sjednocení rychlosti a způsobu zmizení (vše trvá 1 sekundu)
    const transitionStyle = "opacity 1s ease";

    canvas.style.transition = transitionStyle;
    canvas.style.opacity = "0";

    if (instruction) {
        instruction.style.transition = transitionStyle;
        instruction.style.opacity = "0";
    }

    if (initials) {
        initials.style.transition = "opacity 1s ease";
        initials.style.opacity = "0";
    }

    if (mainTitle) {
        mainTitle.style.transition = transitionStyle;
        mainTitle.style.opacity = "0";
    }

    // Čekáme přesně 1 sekundu (1000ms), než prvky úplně odstraníme z plochy
    setTimeout(() => {
        canvas.style.display = "none";
        if (instruction) instruction.style.display = "none";
        if (mainTitle) mainTitle.style.display = "none";

        const invite = document.querySelector(".invite");
        if (invite) {
            invite.classList.remove("hidden");
        }

        createConfetti();
    }, 1000);
}

function createConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;

    const colors = ["#D4AF37", "#FFD700", "#C5B358", "#E6BE8A", "#B8860B"];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.top = "-20px";
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + "px";
        confetti.style.height = confetti.style.width;
        confetti.style.position = "absolute";
        confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";

        container.appendChild(confetti);

        confetti.animate([
            { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, 105vh, 0) rotate(720deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 3000,
            easing: "cubic-bezier(.37,0,.63,1)"
        }).onfinish = () => confetti.remove();
    }
}



