let yoff = 0.0;
let darkClouds = [];
let inkSpots = [];
let clearingSpots = [];
let appState = "INTRO";

let bgColor = 240;

let beyazImg;
let beyazVid;
let gerginVid;
let hayalKirikligiImg;

let kalabalikVid;
let beyazBeklerVid;

let noiseOffX = 0;
let noiseOffY = 1000;

let videoFadeAlpha = 255;
let targetVideoFadeAlpha = 255;

let fogOffset = 0;
let flashAlpha = 0;

let choiceState = null;
let choiceFinalAlpha = 0;
let choiceTextAlpha = 0;
let choiceTextIndex = 0;
let choiceTexts = [];
let choiceTextTimer = 0;

let blackFaceInk = null;
let blackFaceInkStarted = false;

let screenShakeAmount = 0;
let screenShakeUntil = 0;

let lastFaceX = 0;
let lastFaceY = 0;

let chapterStarted = false;
let chapterVideoTimer = null;
let chapterFadeAlpha = 255;
let chapterFadeTarget = 255;

const GERGIN_QUESTION_TIME = 14000;
const CHAPTER_BG = 182;

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

class FaceInkSpot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.currentSize = 0;
        this.maxSize = max(width, height) * 2.8;
    }

    update() {
        this.currentSize = lerp(this.currentSize, this.maxSize, 0.035);
    }

    display() {
        noStroke();

        let gradient = drawingContext.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.currentSize / 2
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.25, 'rgba(0, 0, 0, 0.98)');
        gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.88)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        drawingContext.fillStyle = gradient;
        ellipse(this.x, this.y, this.currentSize, this.currentSize);
    }
}

function preload() {
    beyazImg = loadImage('https://zumrenurozen55.github.io/yeni-bos-sandikk/BEYAZ.png');
    hayalKirikligiImg = loadImage('https://zumrenurozen55.github.io/yeni-bos-sandikk/beyaz.hayal.kirikligi.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (let i = 0; i < 6; i++) {
        darkClouds.push(createNewCloud());
    }

    beyazVid = createVideo(['https://zumrenurozen55.github.io/yeni-bos-sandikk/beyaz2.mahcup.mp4']);
    prepareVideo(beyazVid);

    gerginVid = createVideo(['https://zumrenurozen55.github.io/yeni-bos-sandikk/beyaz_animasyon11.mp4']);
    prepareVideo(gerginVid);

    kalabalikVid = createVideo(['https://zumrenurozen55.github.io/yeni-bos-sandikk/kalabalik.mp4']);
    prepareVideo(kalabalikVid);

    beyazBeklerVid = createVideo(['https://zumrenurozen55.github.io/yeni-bos-sandikk/beyaz_bekler.mp4']);
    prepareVideo(beyazBeklerVid);
}

function prepareVideo(video) {
    video.elt.crossOrigin = "anonymous";
    video.attribute('playsinline', '');
    video.attribute('webkit-playsinline', '');
    video.attribute('muted', '');
    video.hide();
    video.volume(0);
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
    if (choiceState === null) {
        drawMainScene();
    } else {
        drawMainScene();
        drawChoiceResult();
    }
}

function drawMainScene() {
    if (
        appState === "CHAPTER1_KALABALIK" ||
        appState === "CHAPTER1_BEYAZ_BEKLER" ||
        appState === "CHAPTER1_READY"
    ) {
        bgColor = CHAPTER_BG;
    } else if (appState === "TO_BLACK") {
        bgColor = lerp(bgColor, 0, 0.02);
    } else if (appState === "TO_WHITE" || appState === "STORY_READY") {
        bgColor = lerp(bgColor, 255, 0.02);
    }

    background(bgColor);

    let shakeX = 0;
    let shakeY = 0;

    if (millis() < screenShakeUntil) {
        shakeX = random(-screenShakeAmount, screenShakeAmount);
        shakeY = random(-screenShakeAmount, screenShakeAmount);
        screenShakeAmount = lerp(screenShakeAmount, 0, 0.04);
    }

    push();
    translate(shakeX, shakeY);

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

    if (
        appState === "STORY_READY" ||
        appState === "STORY_MAHCUP" ||
        appState === "STORY_GERGIN" ||
        appState === "CHOICE_READY" ||
        appState === "NO_REACTION" ||
        appState === "CHAPTER1_KALABALIK" ||
        appState === "CHAPTER1_BEYAZ_BEKLER"
    ) {
        drawStoryAsset();

        if (
            appState !== "CHOICE_READY" &&
            appState !== "CHAPTER1_KALABALIK" &&
            appState !== "CHAPTER1_BEYAZ_BEKLER"
        ) {
            drawWhiteUncannyFog();
            drawUncannyFlash();
        }
    }

    pop();

    drawChapterVideoFade();
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
    let fullScreenVideo = false;

    if (appState === "STORY_READY") {
        currentAsset = beyazImg;
    } else if (appState === "STORY_MAHCUP") {
        currentAsset = beyazVid;
    } else if (appState === "STORY_GERGIN" || appState === "CHOICE_READY") {
        currentAsset = gerginVid;
    } else if (appState === "NO_REACTION") {
        currentAsset = hayalKirikligiImg;
    } else if (appState === "CHAPTER1_KALABALIK") {
        currentAsset = kalabalikVid;
        fullScreenVideo = true;
    } else if (appState === "CHAPTER1_BEYAZ_BEKLER") {
        currentAsset = beyazBeklerVid;
        fullScreenVideo = true;
    }

    if (currentAsset) {
        let assetWidth = currentAsset.width || 1080;
        let assetHeight = currentAsset.height || 1920;

        let scaleFactor = fullScreenVideo ? height / assetHeight : (height * 0.80) / assetHeight;

        let drawW = assetWidth * scaleFactor;
        let drawH = assetHeight * scaleFactor;

        let drawX = width / 2;
        let drawY = fullScreenVideo ? height / 2 : height - (drawH / 2);

        let breathe = map(noise(frameCount * 0.008), 0, 1, 0.995, 1.012);

        let finalDrawX = fullScreenVideo ? drawX : drawX + driftX;
        let finalDrawY = fullScreenVideo ? drawY : drawY + driftY;

        lastFaceX = finalDrawX;
        lastFaceY = finalDrawY - drawH * 0.36;

        push();

        if (!fullScreenVideo) {
            translate(width / 2, height / 2);
            scale(breathe);
            translate(-width / 2, -height / 2);
        }

        image(currentAsset, finalDrawX, finalDrawY, drawW, drawH);

        pop();

        videoFadeAlpha = lerp(videoFadeAlpha, targetVideoFadeAlpha, 0.045);

        if (videoFadeAlpha > 1 && !fullScreenVideo) {
            noStroke();
            fill(255, 255, 255, videoFadeAlpha);
            rect(0, 0, width, height);
        }
    }
}

function drawChapterVideoFade() {
    if (
        appState === "CHAPTER1_KALABALIK" ||
        appState === "CHAPTER1_BEYAZ_BEKLER"
    ) {
        chapterFadeAlpha = lerp(chapterFadeAlpha, chapterFadeTarget, 0.045);

        if (chapterFadeAlpha > 1) {
            noStroke();
            fill(CHAPTER_BG, CHAPTER_BG, CHAPTER_BG, chapterFadeAlpha);
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

    for (let i = 0; i < 9; i++) {
        let nX = noise(fogOffset + i * 35);
        let nY = noise(fogOffset + 200 + i * 47);
        let nSize = noise(fogOffset + 500 + i * 61);
        let nAlpha = noise(fogOffset + 900 + i * 29);

        let x = map(nX, 0, 1, -width * 0.2, width * 1.2);
        let y = map(nY, 0, 1, height * 0.02, height * 1.08);

        let size = map(nSize, 0, 1, width * 0.35, width * 1.05);
        size = constrain(size, 260, 880);

        let alpha = map(nAlpha, 0, 1, 6, 34) * generalVisibility;

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

    if (appear > 0.58) {
        let strength = map(appear, 0.58, 1, 0, 1);

        let x = width / 2 + map(noise(frameCount * 0.003 + 50), 0, 1, -90, 90);
        let y = height * 0.62 + map(noise(frameCount * 0.003 + 90), 0, 1, -30, 30);

        let alpha = 28 * strength * generalVisibility;

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

function showChoiceOverlay() {
    appState = "CHOICE_READY";

    if (gerginVid) {
        gerginVid.pause();
    }

    const line6 = document.getElementById("line-6");
    const choiceOverlay = document.getElementById("choice-overlay");

    if (line6) {
        line6.style.opacity = "1";
    }

    setTimeout(() => {
        if (choiceOverlay) {
            choiceOverlay.classList.add("active");
        }
    }, 1000);
}

function setupChoiceButtons() {
    const yesBtn = document.getElementById("btn-yes");
    const noBtn = document.getElementById("btn-no");

    if (yesBtn) {
        yesBtn.addEventListener("click", () => {
            startChoiceResult("YES");
        });
    }

    if (noBtn) {
        noBtn.addEventListener("click", () => {
            startChoiceResult("NO");
        });
    }
}

function startChoiceResult(type) {
    if (choiceState !== null) return;

    choiceState = type;
    choiceFinalAlpha = 0;
    choiceTextAlpha = 0;
    choiceTextIndex = 0;
    choiceTextTimer = 0;
    blackFaceInk = null;
    blackFaceInkStarted = false;

    const choiceOverlay = document.getElementById("choice-overlay");
    const choiceBox = document.getElementById("choice-box");
    const line6 = document.getElementById("line-6");

    if (choiceBox) {
        choiceBox.style.opacity = "0";
        choiceBox.style.transform = "scale(0.92)";
    }

    if (line6) {
        line6.style.opacity = "0";
    }

    setTimeout(() => {
        if (choiceOverlay) {
            choiceOverlay.classList.add("hide");
        }
    }, 300);

    if (type === "YES") {
        choiceTexts = [
            "Teşekkürler.",
            "Beyazlık her şeyi örttü."
        ];
    }

    if (type === "NO") {
        appState = "NO_REACTION";

        if (gerginVid) {
            gerginVid.pause();
        }

        screenShakeAmount = 5;
        screenShakeUntil = millis() + 1500;

        choiceTexts = [
            "Uzakta kaldın.",
            "Yine de bir şey yerinden oynadı."
        ];

        setTimeout(() => {
            blackFaceInk = new FaceInkSpot(lastFaceX, lastFaceY);
            blackFaceInkStarted = true;
        }, 1500);
    }
}

function drawChoiceResult() {
    if (choiceState === "YES") {
        choiceFinalAlpha = lerp(choiceFinalAlpha, 255, 0.025);

        noStroke();
        fill(255, 255, 255, choiceFinalAlpha);
        rect(0, 0, width, height);

        drawChoiceText();
    }

    if (choiceState === "NO") {
        drawNoUncannyLayer();

        if (blackFaceInkStarted && blackFaceInk) {
            blackFaceInk.update();
            blackFaceInk.display();

            if (blackFaceInk.currentSize > max(width, height) * 2.1) {
                choiceFinalAlpha = lerp(choiceFinalAlpha, 255, 0.035);
            }
        }

        noStroke();
        fill(0, 0, 0, choiceFinalAlpha);
        rect(0, 0, width, height);

        if (choiceFinalAlpha > 170) {
            drawChoiceText();
        }
    }
}

function drawNoUncannyLayer() {
    push();
    noStroke();

    let pulse = map(noise(frameCount * 0.035), 0, 1, 0.25, 1);

    fill(255, 255, 255, 18 * pulse);
    ellipse(width / 2, height * 0.58, 130, 360);
    ellipse(width / 2, height * 0.31, 70, 90);

    if (random() < 0.018) {
        fill(255, 255, 255, random(10, 26));
        rect(0, 0, width, height);
    }

    pop();
}

function drawChoiceText() {
    if (!choiceTexts.length) return;

    choiceTextTimer++;

    if (choiceTextTimer < 80) {
        choiceTextAlpha = lerp(choiceTextAlpha, 230, 0.035);
    } else if (choiceTextTimer < 180) {
        choiceTextAlpha = lerp(choiceTextAlpha, 230, 0.02);
    } else {
        choiceTextAlpha = lerp(choiceTextAlpha, 0, 0.04);
    }

    if (choiceTextTimer > 240) {
        choiceTextTimer = 0;
        choiceTextIndex++;

        if (choiceTextIndex >= choiceTexts.length) {
            choiceTexts = [];
            showChapterScreen();
            return;
        }
    }

    push();
    textAlign(CENTER, CENTER);
    textFont("Courier New");
    textSize(16);
    textLeading(28);

    if (choiceState === "YES") {
        fill(20, 20, 20, choiceTextAlpha);
    } else {
        fill(235, 235, 235, choiceTextAlpha);
    }

    text(choiceTexts[choiceTextIndex], width / 2, height * 0.48);
    pop();
}

function showChapterScreen() {
    if (chapterStarted) return;

    chapterStarted = true;

    setTimeout(() => {
        bgColor = CHAPTER_BG;

        const chapterScreen = document.getElementById("chapter-screen");

        if (chapterScreen) {
            chapterScreen.classList.remove("hide");
            chapterScreen.classList.add("active");
        }

        setTimeout(() => {
            if (chapterScreen) {
                chapterScreen.classList.add("hide");
            }

            setTimeout(() => {
                if (chapterScreen) {
                    chapterScreen.classList.remove("active");
                }

                startChapterOne();
            }, 2000);
        }, 2000);
    }, 1000);
}

function startChapterOne() {
    choiceState = null;
    appState = "CHAPTER1_KALABALIK";
    bgColor = CHAPTER_BG;
    targetVideoFadeAlpha = 0;
    videoFadeAlpha = 0;

    chapterFadeAlpha = 255;
    chapterFadeTarget = 0;

    playVideoUntilLastSecond(
        kalabalikVid,
        "Herkes bir yere yetişiyor.\nKimse durup birbirine bakmıyor.",
        () => {
            hideChapterText();

            setTimeout(() => {
                appState = "CHAPTER1_BEYAZ_BEKLER";

                chapterFadeAlpha = 255;
                chapterFadeTarget = 0;

                playVideoUntilLastSecond(
                    beyazBeklerVid,
                    "Beyaz da onların arasında.",
                    () => {
                        hideChapterText();

                        setTimeout(() => {
                            appState = "CHAPTER1_READY";
                            bgColor = CHAPTER_BG;
                        }, 1200);
                    }
                );
            }, 800);
        }
    );
}

function playVideoUntilLastSecond(video, textToShow, onAlmostEnd) {
    if (!video) return;

    clearChapterVideoTimer();
    hideChapterText();

    video.stop();
    video.time(0);
    video.play();

    let textShown = false;
    let textHidden = false;

    chapterVideoTimer = setInterval(() => {
        const duration = video.elt.duration;
        const currentTime = video.elt.currentTime;

        if (!duration || !isFinite(duration)) return;

        if (!textShown && currentTime >= 1.3) {
            showChapterText(textToShow);
            textShown = true;
        }

        if (!textHidden && currentTime >= duration - 2.2) {
            hideChapterText();
            textHidden = true;
        }

        if (currentTime >= duration - 1) {
            clearChapterVideoTimer();
            video.pause();
            onAlmostEnd();
        }
    }, 100);
}

function showChapterText(text) {
    const chapterLine = document.getElementById("chapter-line");

    if (!chapterLine) return;

    chapterLine.textContent = text;

    requestAnimationFrame(() => {
        chapterLine.classList.add("visible");
    });
}

function hideChapterText() {
    const chapterLine = document.getElementById("chapter-line");

    if (!chapterLine) return;

    chapterLine.classList.remove("visible");
}

function clearChapterVideoTimer() {
    if (chapterVideoTimer) {
        clearInterval(chapterVideoTimer);
        chapterVideoTimer = null;
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

    setupChoiceButtons();

    startBtn.addEventListener("click", () => {
        uiLayer.classList.add("fade-out");

        beyazVid.play();
        beyazVid.pause();

        gerginVid.play();
        gerginVid.pause();

        kalabalikVid.play();
        kalabalikVid.pause();

        beyazBeklerVid.play();
        beyazBeklerVid.pause();

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
                                            gerginVid.time(0);
                                            gerginVid.play();

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
                                                        }, 3500);
                                                    }, 1500);
                                                }, 3500);
                                            }, 1000);

                                            setTimeout(() => {
                                                showChoiceOverlay();
                                            }, GERGIN_QUESTION_TIME);
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