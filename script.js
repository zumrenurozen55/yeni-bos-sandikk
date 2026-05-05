let yoff = 0.0;
let darkClouds = []; 
let inkSpots = [];       
let clearingSpots = [];  
let appState = "INTRO";  

let bgColor = 240; // Arka planın başlangıç rengi

// Karanlığı getiren SAF SİYAH mürekkep damlaları
class InkSpot {
    constructor(x, y) { 
        this.x = x; 
        this.y = y; 
        this.currentSize = 0; 
        this.growth = 0; 
    }
    update() { 
        this.growth = lerp(this.growth, 18, 0.02); 
        this.currentSize += this.growth; 
    }
    display() { 
        noStroke(); 
        let gradient = drawingContext.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentSize / 2); 
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');       // SAF SİYAH MERKEZ
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.9)'); 
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
        drawingContext.fillStyle = gradient; 
        ellipse(this.x, this.y, this.currentSize, this.currentSize); 
    }
}

// Aydınlığı getiren SAF BEYAZ lekeler (fade in)
class ClearingSpot {
    constructor(x, y) { 
        this.x = x; 
        this.y = y; 
        this.currentSize = 0; 
        this.growth = 0; 
    }
    update() { 
        this.growth = lerp(this.growth, 15, 0.015); 
        this.currentSize += this.growth; 
    }
    display() { 
        noStroke(); 
        let gradient = drawingContext.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentSize / 2); 
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // SAF BEYAZ
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)'); 
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); 
        drawingContext.fillStyle = gradient; 
        ellipse(this.x, this.y, this.currentSize, this.currentSize); 
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    for (let i = 0; i < 6; i++) {
        darkClouds.push(createNewCloud());
    }
}

function createNewCloud() {
    return {
        x: random(width),
        y: random(height),
        vx: random(-0.2, 0.2), 
        vy: random(-0.2, 0.2),
        size: random(150, 400),
        alpha: 0,
        targetAlpha: random(20, 50), 
        lerpSpeed: random(0.005, 0.01) 
    };
}

function draw() {
    // Duruma göre arka plan rengini (bgColor) yavaşça siyağa veya beyaza çekiyoruz
    if (appState === "TO_BLACK") {
        bgColor = lerp(bgColor, 0, 0.02); // 0 = Saf Siyah
    } else if (appState === "TO_WHITE") {
        bgColor = lerp(bgColor, 255, 0.02); // 255 = Saf Beyaz
    }
    
    background(bgColor); 

    // INTRO veya Siyaha geçiş aşamasındayken bulutları ve dalgaları çiz
    if (appState === "INTRO" || appState === "TO_BLACK") {
        noStroke();
        for (let c of darkClouds) {
            c.x += c.vx; 
            c.y += c.vy;
            if (c.x < 0 || c.x > width) c.vx *= -1; 
            if (c.y < 0 || c.y > height) c.vy *= -1;

            c.alpha = lerp(c.alpha, c.targetAlpha, c.lerpSpeed);
            let gradient = drawingContext.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size / 2); 
            gradient.addColorStop(0, `rgba(30, 30, 35, ${c.alpha / 255})`); 
            gradient.addColorStop(1, `rgba(30, 30, 35, 0)`); 
            drawingContext.fillStyle = gradient; 
            ellipse(c.x, c.y, c.size, c.size);
        }

        let globalAlpha = map(noise(frameCount * 0.002), 0, 1, 100, 180); 
        let lineWeight = map(noise(frameCount * 0.005), 0, 1, 0.5, 1.5); 
        strokeWeight(lineWeight);

        drawWave(height * 0.1, height * 0.4, yoff, globalAlpha); 
        drawWave(height * 0.6, height * 0.95, yoff + 100, globalAlpha);
        
        yoff += 0.001; 
    }

    // Siyaha geçiş mürekkepleri
    if (appState === "TO_BLACK" || appState === "TO_WHITE") {
        for (let spot of inkSpots) { 
            spot.update(); 
            spot.display(); 
        }
    }

    // Beyaza geçiş aydınlığı
    if (appState === "TO_WHITE") {
        for (let spot of clearingSpots) { 
            spot.update(); 
            spot.display(); 
        }
    }
}

function drawWave(minH, maxH, offset, gAlpha) {
    let xoff = 0;
    for (let x = 0; x <= width; x += 5) {
        let y1 = map(noise(xoff, offset), 0, 1, minH, maxH);
        let y2 = map(noise(xoff + 0.02, offset), 0, 1, minH, maxH);
        
        let gapNoise = noise(xoff * 1.5, offset, frameCount * 0.001); 
        let localAlpha = map(gapNoise, 0.2, 0.7, 0, 255); 
        localAlpha = constrain(localAlpha, 0, 255);

        let finalAlpha = min(gAlpha, localAlpha); 

        if (finalAlpha > 10) { 
            stroke(30, 30, 35, finalAlpha); 
            line(x, y1, x + 5, y2); 
        }
        xoff += 0.02;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("btn-start");
    const uiLayer = document.getElementById("ui-layer");
    
    startBtn.addEventListener("click", () => {
        // 1. Menüyü yok et
        uiLayer.classList.add("fade-out");
        
        // 2. Yarım saniye sonra SİYAHA GEÇİŞİ başlat
        setTimeout(() => { 
            appState = "TO_BLACK"; 
            inkSpots.push(new InkSpot(width / 2, height / 2)); 
            inkSpots.push(new InkSpot(width * 0.2, height * 0.8)); 
            inkSpots.push(new InkSpot(width * 0.8, height * 0.2)); 
        }, 500);

        // 3. Karanlık tamamen çöktükten sonra (4.5 sn sonra) BEYAZA GEÇİŞİ başlat
        setTimeout(() => { 
            appState = "TO_WHITE"; 
            clearingSpots.push(new ClearingSpot(width * 0.3, height * 0.3)); 
            clearingSpots.push(new ClearingSpot(width * 0.7, height * 0.7)); 
            clearingSpots.push(new ClearingSpot(width / 2, height * 0.9)); 
        }, 4500); 
    });
});