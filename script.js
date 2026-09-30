// CHANGE THESE 4 NUMBERS to your placeholder's values from Canva
const BOX = { x: 80, y: 260, w: 420, h: 420 };

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const zoomInput = document.getElementById("zoom");
const flyer = new Image();
flyer.src = "flyer.png";
let photo = null, zoom = 1, offX = 0, offY = 0;

flyer.onload = draw;

document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    photo = img; zoom = 1; offX = 0; offY = 0;
    zoomInput.value = 1; draw();
  };
  img.src = URL.createObjectURL(file);
});

zoomInput.addEventListener("input", () => {
  zoom = parseFloat(zoomInput.value); draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(flyer, 0, 0, canvas.width, canvas.height);
  if (!photo) return;
  const scale = Math.max(BOX.w / photo.width, BOX.h / photo.height) * zoom;
  const w = photo.width * scale, h = photo.height * scale;
  const maxX = (w - BOX.w) / 2, maxY = (h - BOX.h) / 2;
  offX = Math.max(-maxX, Math.min(maxX, offX));
  offY = Math.max(-maxY, Math.min(maxY, offY));
  ctx.save();
  ctx.beginPath();
  ctx.rect(BOX.x, BOX.y, BOX.w, BOX.h);
  ctx.clip();
  ctx.drawImage(photo, BOX.x + (BOX.w - w) / 2 + offX, BOX.y + (BOX.h - h) / 2 + offY, w, h);
  ctx.restore();
}

let dragging = false, lastX, lastY;
canvas.addEventListener("pointerdown", e => {
  dragging = true; lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", e => {
  if (!dragging || !photo) return;
  const k = canvas.width / canvas.getBoundingClientRect().width;
  offX += (e.clientX - lastX) * k;
  offY += (e.clientY - lastY) * k;
  lastX = e.clientX; lastY = e.clientY;
  draw();
});
canvas.addEventListener("pointerup", () => dragging = false);

document.getElementById("download").addEventListener("click", () => {
  canvas.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-dp.png";
    a.click();
  }, "image/png");
});

document.getElementById("share").addEventListener("click", () => {
  canvas.toBlob(async blob => {
    const file = new File([blob], "my-dp.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: "I will be attending!" });
    } else {
      alert("Sharing isn't supported here. Please use Download.");
    }
  });
});
