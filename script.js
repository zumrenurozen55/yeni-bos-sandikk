let yoff = 0.0;
let darkClouds = [];
let inkSpots = [];
let clearingSpots = [];
let appState = "INTRO";

let bgColor = 240;

let beyazImg;
let beyazVid;
let gerginVid;

let noiseOffX = 0;
let noiseOffY = 1000;

let videoFadeAlpha = 255;
let targetVideoFadeAlpha = 255;

let fogOffset = 0;
let flashAlpha = 0;

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

        let gradient = drawingContext.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.currentSize / 2
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        drawingContext.fillStyle = gradient;
        ellipse(this.x, this.y, this.currentSize, this.currentSize);
    }
}

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

        let gradient = drawingContext.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.currentSize / 2
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        drawingContext.fillStyle = gradient;
        ellipse(this.x, this.y, this.currentSize, this.currentSize);
    }
}

function preload() {
    beyazImg = loadImage('https://zumrenurozen55.github.io/yeni-bos-sandikk/BEYAZ.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (let i = 0; i < 6; i++) {
        darkClouds.push(createNewCloud());
    }

    beyazVid = createVideo(['https://zumrenurozen55.github.io/yeni-bos-sandikk/beyaz2.mahcup.mp4']);
    beyazVid.elt.crossOrigin = "anonymous";
    beyazVid.attribute('playsinline', '');
    beyazVid.attribute('webkit-playsinline', '');
    beyazVid.attribute('muted', '');
    beyazVid.hide();
    beyazVid.volume(0);

    gerginVid = createVideo(['https://zumrenurozen55.github.io/yeni-bos-sandikk/beyaz_animasyon11.mp4']);
    gerginVid.elt.crossOrigin = "anonymous";
    gerginVid.attribute('playsinline', '');
    gerginVid.attribute('webkit-playsinline', '');
    gerginVid.attribute('muted', '');
    gerginVid.hide();
    gerginVid.volume(0);
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
    if (appState === "TO_BLACK") {
        bgColor = lerp(bgColor, 0, 0.02);
    } else if (appState === "TO_WHITE" || appState === "STORY_READY") {
        bgColor = lerp(bgColor, 255, 0.02);
    }

    background(bgColor);

    if (appState === "INTRO" || appState === "TO_BLACK") {
        drawIntroAtmosphere();
    }

    if (appState === "TO_BLACK" || appState === "TO_WHITE") {
        for (let spot of inkSpots) {
            spot.update();
            spot.display();
        }
    }

    if (appState === "TO_WHITE") {
        for (let spot of clearingSpots) {
            spot.update();
            spot.display();
        }
    }

    if (appState === "STORY_READY" || appState === "STORY_MAHCUP" || appState === "STORY_GERGIN") {
        drawStoryAsset();
        drawWhiteUncannyFog();
        drawUncannyFlash();
    }
}

function drawIntroAtmosphere() {
    noStroke();

    for (let c of darkClouds) {
        c.x += c.vx;
        c.y += c.vy;

        if (c.x < 0 || c.x > width) c.vx *= -1;
        if (c.y < 0 || c.y > height) c.vy *= -1;

        c.alpha = lerp(c.alpha, c.targetAlpha, c.lerpSpeed);

        let gradient = drawingContext.createRadialGradient(
            c.x, c.y, 0,
            c.x, c.y, c.size / 2
        );

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

function drawStoryAsset() {
    let driftX = map(noise(noiseOffX), 0, 1, -6, 6);
    let driftY = map(noise(noiseOffY), 0, 1, -4, 4);

    noiseOffX += 0.005;
    noiseOffY += 0.005;

    imageMode(CENTER);

    let currentAsset;

    if (appState === "STORY_READY") {
        currentAsset = beyazImg;
    } else if (appState === "STORY_MAHCUP") {
        currentAsset = beyazVid;
    } else if (appState === "STORY_GERGIN") {
        currentAsset = gerginVid;
    }

    if (currentAsset) {
        let assetWidth = currentAsset.width || beyazImg.width;
        let assetHeight = currentAsset.height || beyazImg.height;

        let scaleFactor = (height * 0.80) / assetHeight;
        let drawW = assetWidth * scaleFactor;
        let drawH = assetHeight * scaleFactor;
        let drawY = height - (drawH / 2);

        let breathe = map(noise(frameCount * 0.008), 0, 1, 0.995, 1.012);

        push();
        translate(width / 2, height / 2);
        scale(breathe);
        translate(-width / 2, -height / 2);

        image(
            currentAsset,
            (width / 2) + driftX,
            drawY + driftY,
            drawW,
            drawH
        );

        pop();

        videoFadeAlpha = lerp(videoFadeAlpha, targetVideoFadeAlpha, 0.045);

        if (videoFadeAlpha > 1) {
            noStroke();
            fill(255, 255, 255, videoFadeAlpha);
            rect(0, 0, width, height);
        }
    }
}

function drawWhiteUncannyFog() {
    push();
    noStroke();
    blendMode(BLEND);

    let generalVisibility = map(noise(frameCount * 0.006), 0, 1, 0, 1);
    generalVisibility = pow(generalVisibility, 1.8);

    for (let i = 0; i < 8; i++) {
        let nX = noise(fogOffset + i * 35);
        let nY = noise(fogOffset + 200 + i * 47);
        let nSize = noise(fogOffset + 500 + i * 61);
        let nAlpha = noise(fogOffset + 900 + i * 29);

        let x = map(nX, 0, 1, -width * 0.2, width * 1.2);
        let y = map(nY, 0, 1, height * 0.02, height * 1.08);

        let size = map(nSize, 0, 1, width * 0.35, width * 0.95);
        size = constrain(size, 260, 820);

        let alpha = map(nAlpha, 0, 1, 5, 28) * generalVisibility;

        let gradient = drawingContext.createRadialGradient(
            x, y, 0,
            x, y, size
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha / 255})`);
        gradient.addColorStop(0.45, `rgba(255, 255, 255, ${(alpha * 0.45) / 255})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        drawingContext.fillStyle = gradient;
        ellipse(x, y, size * 2, size * 2);
    }

    drawAlmostHumanFogShape(generalVisibility);

    fogOffset += 0.0018;
    pop();
}

function drawAlmostHumanFogShape(generalVisibility) {
    let appear = noise(frameCount * 0.004 + 700);

    if (appear > 0.62) {
        let strength = map(appear, 0.62, 1, 0, 1);

        let x = width / 2 + map(noise(frameCount * 0.003 + 50), 0, 1, -90, 90);
        let y = height * 0.62 + map(noise(frameCount * 0.003 + 90), 0, 1, -30, 30);

        let alpha = 22 * strength * generalVisibility;

        let gradient = drawingContext.createRadialGradient(
            x, y, 0,
            x, y, 260
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha / 255})`);
        gradient.addColorStop(0.45, `rgba(255, 255, 255, ${(alpha * 0.4) / 255})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        drawingContext.fillStyle = gradient;

        ellipse(x, y, 140, 360);
        ellipse(x, y - 190, 75, 95);
    }
}

function drawUncannyFlash() {
    if (random() < 0.001) {
        flashAlpha = random(18, 42);
    }

    flashAlpha = lerp(flashAlpha, 0, 0.08);

    if (flashAlpha > 1) {
        noStroke();
        fill(255, 255, 255, flashAlpha);
        rect(0, 0, width, height);
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
        uiLayer.classList.add("fade-out");

        beyazVid.play();
        beyazVid.pause();

        gerginVid.play();
        gerginVid.pause();

        setTimeout(() => {
            appState = "TO_BLACK";

            inkSpots.push(new InkSpot(width / 2, height / 2));
            inkSpots.push(new InkSpot(width * 0.2, height * 0.8));
            inkSpots.push(new InkSpot(width * 0.8, height * 0.2));
        }, 500);

        setTimeout(() => {
            appState = "TO_WHITE";

            clearingSpots.push(new ClearingSpot(width * 0.3, height * 0.3));
            clearingSpots.push(new ClearingSpot(width * 0.7, height * 0.7));
            clearingSpots.push(new ClearingSpot(width / 2, height * 0.9));
        }, 4500);

        setTimeout(() => {
            appState = "STORY_READY";

            setTimeout(() => {
                const line1 = document.getElementById("line-1");

                videoFadeAlpha = 255;
                targetVideoFadeAlpha = 255;

                setTimeout(() => {
                    if (line1) line1.style.opacity = "1";
                    targetVideoFadeAlpha = 0;
                }, 100);

                setTimeout(() => {
                    if (line1) line1.style.opacity = "0";
                    targetVideoFadeAlpha = 255;
                }, 4100);

                setTimeout(() => {
                    appState = "STORY_MAHCUP";

                    beyazVid.loop();
                    targetVideoFadeAlpha = 0;

                    setTimeout(() => {
                        const line2 = document.getElementById("line-2");

                        if (line2) line2.style.opacity = "1";

                        setTimeout(() => {
                            if (line2) line2.style.opacity = "0";

                            setTimeout(() => {
                                const line3 = document.getElementById("line-3");

                                if (line3) line3.style.opacity = "1";

                                setTimeout(() => {
                                    if (line3) line3.style.opacity = "0";

                                    setTimeout(() => {
                                        targetVideoFadeAlpha = 255;

                                        setTimeout(() => {
                                            appState = "STORY_GERGIN";

                                            beyazVid.stop();
                                            gerginVid.loop();
                                            targetVideoFadeAlpha = 0;

                                            setTimeout(() => {
                                                const line4 = document.getElementById("line-4");

                                                if (line4) line4.style.opacity = "1";

                                                setTimeout(() => {
                                                    if (line4) line4.style.opacity = "0";

                                                    setTimeout(() => {
                                                        const line5 = document.getElementById("line-5");

                                                        if (line5) line5.style.opacity = "1";

                                                        setTimeout(() => {
                                                            if (line5) line5.style.opacity = "0";

                                                            setTimeout(() => {
                                                                const line6 = document.getElementById("line-6");

                                                                if (line6) line6.style.opacity = "1";
                                                            }, 1500);
                                                        }, 3500);
                                                    }, 1500);
                                                }, 3500);
                                            }, 1000);
                                        }, 1500);
                                    }, 1500);
                                }, 3500);
                            }, 2500);
                        }, 3000);
                    }, 500);
                }, 7100);
            }, 1500);
        }, 9000);
    });
});