const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
const instruction = document.getElementById("instruction");

let scratching = false;

// Snížil jsem na 800 pro lepší plynulost na mobilech, 
// ale klidnì nechej 1000, pokud chceš extra ostré srdce.
canvas.width = 800;
canvas.height = 800;

const heartImg = new Image();
heartImg.src = "heart.png";

heartImg.onload = () => {
    ctx.drawImage(heartImg, 0, 0, canvas.width, canvas.height);
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
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();

    // Získání souøadnic kliku/dotyku v oknì
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // --- KLÍÈOVÁ OPRAVA MÌØÍTKA ---
    // Pøepoèítáme pomìr mezi skuteènými pixely canvasu (800) 
    // a tím, jak velký se zobrazuje na displeji (rect.width)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Výsledná pozice x a y vynásobená tímto pomìrem
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    // Velikost gumy (70 je ideální pro rozlišení 800)
    ctx.arc(x, y, 70, 0, Math.PI * 2);
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

        // Pokud je setøeno více než 20 % celkové plochy
        if (percentage > 20) {
            revealEverything();
        }
    } catch (e) {
        // Pojistka pro pøípad chyby v prohlížeèi
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 1500);
        }
    }
}

function revealEverything() {
    const mainTitle = document.getElementById("main-title");
    const instruction = document.getElementById("instruction");
    const initials = document.querySelector(".initials");

    // Sjednocení rychlosti a zpùsobu zmizení (vše trvá 1 sekundu)
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

    // Èekáme pøesnì 1 sekundu (1000ms), než prvky úplnì odstraníme z plochy
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