// script.js

// Variables de sonido
const spinSound = new Audio('https://cdnjs.cloudflare.com/ajax/libs/blockly/1.0.0/media/disconnect.mp3');
const winSound = new Audio('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3');
spinSound.loop = true;

// Referencias a los elementos del DOM
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin');
const resultP = document.getElementById('result');
const namesTextarea = document.getElementById('names');

// Arreglo para almacenar los nombres
let names = [];

// Contador de giros para saber cuántos ya se han hecho
let spinCount = 0;

// Paleta de colores pastel para los sectores
const pastelColors = ['#FFF2CC', '#E2F0D9', '#D9E1F2', '#FCE4D6', '#F4CCCC', '#D9D2E9', '#CCE5FF'];

// Función para dibujar la ruleta en el canvas
function drawWheel(rotation = 0) {
  const numSegments = names.length;
  if (numSegments === 0) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  const anglePerSegment = (2 * Math.PI) / numSegments;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.translate(-centerX, -centerY);

  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;

    ctx.fillStyle = pastelColors[i % pastelColors.length];

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(centerX, centerY);
    const textAngle = startAngle + anglePerSegment / 2;
    ctx.rotate(textAngle);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(names[i], radius - 10, 5);
    ctx.restore();
  }

  ctx.restore();
}

// Función para obtener un índice ganador según el giro
function getWinningIndex() {
  // Primer giro: preferencia por la posición 5 (índice 4)
  if (spinCount === 0 && names.length >= 5) {
    return 4;
  }
  // Segundo giro: preferencia por la posición 3 (índice 2)
  if (spinCount === 1 && names.length >= 3) {
    return 2;
  }
  // A partir del tercer giro, selección aleatoria
  return Math.floor(Math.random() * names.length);
}

// Función principal que maneja el giro de la ruleta
function spinWheel() {
  // Actualizar la lista de nombres desde el textarea
  names = namesTextarea.value
    .split('\n')
    .map(name => name.trim())
    .filter(name => name !== '');

  if (names.length === 0) {
    alert('Por favor, ingresa al menos un nombre.');
    return;
  }

  // Dibujar la ruleta inicial
  drawWheel();
  spinSound.play();

  const winningIndex = getWinningIndex();

  const numSegments = names.length;
  const anglePerSegment = (2 * Math.PI) / numSegments;
  const winningSectorAngle = winningIndex * anglePerSegment + anglePerSegment / 2;

  // Se calculan 3 vueltas completas + el ángulo extra para que el sector ganador quede a la derecha
  const totalRotation = (2 * Math.PI * 3) + (2 * Math.PI - winningSectorAngle);
  const duration = 3000; // Duración de la animación en milisegundos
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
    const currentRotation = totalRotation * easeOutProgress;

    drawWheel(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinSound.pause();
      winSound.play();
      resultP.textContent = `Ganador: ${names[winningIndex]}`;
      // Incrementar contador de giros para las próximas ejecuciones
      spinCount++;
    }
  }

  requestAnimationFrame(animate);
}

// Asociar el botón al evento de giro
spinBtn.addEventListener('click', spinWheel);
