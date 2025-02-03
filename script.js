let cylinderWidth = 212;
let cylinderHeight = 100;
let scale = 4;
let rotation = 135;
let rotation2 = 0;
let animationStep = 0;
let isAnimating = false;

const animationSequence = [
    { width: 212, width2: 100, rotation: 135, rotation2: 135, duplicateOffset: -125, bottomDuplicateOffset: 0, blur: 10, radius: 45, opacity2: 0, duration: 800, autoNext: false }, // Resilience
    { width: 100, width2: 100, rotation: 135, rotation2: 135, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 49, opacity2: 0, duration: 600, autoNext: true }, 
    { width: 100, width2: 100, rotation: 135, rotation2: 135, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 56, opacity2: 1, duration: 200, autoNext: false }, // Expertise
    { width: 212, width2: 212, rotation: 135, rotation2: 135, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 49, opacity2: 1, duration: 800, autoNext: false }, // Collaboration
    { width: 212, width2: 212, rotation: 180, rotation2: 0, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 49, opacity2: 1, duration: 800, autoNext: false }, // Trust
    { width: 212, width2: 212, rotation: 135, rotation2: 45, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 49, opacity2: 1, duration: 400, autoNext: true },
    { width: 212, width2: 212, rotation: 135, rotation2: 45, duplicateOffset: -125, bottomDuplicateOffset: 125, blur: 10, radius: 45, opacity2: 1, duration: 600, autoNext: false }, // Ambition
    { width: 212, width2: 100, rotation: 135, rotation2: 45, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 49, opacity2: 1, duration: 600, autoNext: true }, 
    { width: 212, width2: 100, rotation: 135, rotation2: 45, duplicateOffset: 0, bottomDuplicateOffset: 0, blur: 20, radius: 49, opacity2: 0, duration: 200, autoNext: false } // Excellence
];

function applyAnimation() {
    if (isAnimating || animationStep >= animationSequence.length) return;
    isAnimating = true;

    let step = animationSequence[animationStep];

    Promise.all([
        animateProperty("cylinder", "width", step.width, step.duration),
        animateProperty("cylinder2", "width", step.width2, step.duration),
        animateProperty("cylinderSVG", "rotation", step.rotation, step.duration, "transform"),
        animateProperty("cylinder2", "rotation2", step.rotation2, step.duration, "transform2"),
        animateProperty("topCircle", "duplicateOffset", step.duplicateOffset, step.duration, "position"),
        animateProperty("bottomCircle", "duplicateOffset", step.bottomDuplicateOffset, step.duration, "position"),
        animateProperty("liquidEffect feGaussianBlur", "stdDeviation", step.blur, step.duration, "blur"),
        animateProperty("centerCircle", "r", step.radius, step.duration, "radius"),
        animateProperty("bottomCircle", "r", step.radius, step.duration, "radius"),
        animateProperty("topCircle", "r", step.radius, step.duration, "radius"),
        animateProperty("cylinder2", "opacity", step.opacity2, step.duration, "opacity") // New Opacity Animation
    ]).then(() => {
        isAnimating = false;
        animationStep = (animationStep + 1) % animationSequence.length;

        if (step.autoNext) {
            applyAnimation();
        }
    });
}

function animateProperty(elementId, property, targetValue, duration, type = "attribute") {
    return new Promise((resolve) => {
        let element;
        if (type === "blur") {
            element = document.querySelector(`#liquidEffect feGaussianBlur`);
        } else {
            element = document.getElementById(elementId) || document.querySelector(elementId);
        }
        if (!element) {
            console.warn(`Element not found for ${elementId}`);
            return resolve();
        }

        let startValue;

        if (type === "attribute") {
            startValue = parseFloat(element.getAttribute(property)) || 0;
        } else if (type === "transform") {
            startValue = rotation;
        } else if (type === "transform2") {
            startValue = rotation2;
        } else if (type === "blur") {
            startValue = parseFloat(element.getAttribute("stdDeviation")) || 0;
        } else if (type === "position") {
            let centerX = 204;
            let currentX = parseFloat(element.getAttribute("cx")) || centerX;
            startValue = (currentX - centerX) / Math.sin(Math.PI / 2);
        } else if (type === "radius") {
            startValue = parseFloat(element.getAttribute("r")) || 50;
        } else if (type === "opacity") {
            startValue = parseFloat(window.getComputedStyle(element).opacity) || 0;
        } else {
            startValue = 0;
        }

        let startTime = performance.now();

        function step(currentTime) {
            let elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / duration, 1);
            let easedProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            let newValue = startValue + (targetValue - startValue) * easedProgress;

            if (type === "attribute") {
                element.setAttribute(property, newValue);
            } else if (type === "transform") {
                rotation = newValue;
                element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            } else if (type === "transform2") {
                rotation2 = newValue;
                element.style.transform = `rotate(${rotation + newValue}deg)`;
                element.style.transformOrigin = "center";
            } else if (type === "position") {
                let offsetX = Math.sin(Math.PI / 2) * newValue;
                let offsetY = Math.cos(Math.PI / 2) * newValue;
                element.setAttribute("cx", 204 + offsetX);
                element.setAttribute("cy", 200 - offsetY);
            } else if (type === "blur") {
                let blurElement = document.querySelector("#liquidEffect feGaussianBlur");
                if (!blurElement) {
                    console.error("Blur element NOT found in step!");
                    return resolve();
                }
                blurElement.setAttribute("stdDeviation", newValue);
            } else if (type === "radius") {
                element.setAttribute("r", newValue);
            } else if (type === "opacity") {
                element.style.opacity = newValue;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(step);
    });
}

document.addEventListener("click", applyAnimation);

window.onload = function () {
    let defaultRotation = 135;
    let defaultRotation2 = 0;
    let defaultWidth = 212;
    let defaultWidth2 = 100;
    let defaultDuplicateOffset = 0;
    let defaultBottomDuplicateOffset = 0;
    let defaultBlur = 20;
    let defaultRadius = 49;
    let defaultOpacity2 = 0;

    animateProperty("cylinder", "width", defaultWidth, 0);
    animateProperty("cylinder2", "width", defaultWidth2, 0);
    animateProperty("cylinderSVG", "rotation", defaultRotation, 0, "transform");
    animateProperty("cylinder2", "rotation2", defaultRotation2, 0, "transform2");
    animateProperty("topCircle", "duplicateOffset", defaultDuplicateOffset, 0, "position");
    animateProperty("bottomCircle", "duplicateOffset", defaultBottomDuplicateOffset, 0, "position");
    animateProperty("liquidEffect feGaussianBlur", "stdDeviation", defaultBlur, 0, "blur");
    animateProperty("topCircle", "r", defaultRadius, 0, "radius");
    animateProperty("cylinder2", "opacity", defaultOpacity2, 0, "opacity");
};
