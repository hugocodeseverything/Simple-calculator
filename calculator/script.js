
let display = document.getElementById('display');
let current = '0';
let evaluated = false;
let history = [];
const maxHistory = 20;
let scientificMode = false;


const constants = {
  "π": Math.PI,
  "e": Math.E
};

function addToHistory(expr, result) {
  if (expr.trim() === "") return;
  history.unshift({ expr, result });
  if (history.length > maxHistory) history.pop();
  renderHistory();
}
function emptyHistory() {
  history = [];
  renderHistory();
}
function renderHistory() {
  let list = document.getElementById('historyList');
  list.innerHTML = "";
  for (let item of history) {
    let li = document.createElement('li');
    li.innerHTML = `<span>${item.expr} = <strong>${item.result}</strong></span>`;
    li.onclick = () => {
      current = item.result.toString();
      updateDisplay();
    };
    list.appendChild(li);
  }
}
function input(val) {
  if (evaluated && "0123456789.(πe".includes(val)) {
    current = '';
    evaluated = false;
  }
  if (current === '0' && val !== '.' && val !== '(' && val !== "π" && val !== "e") current = '';
  if (val === '.' && current.slice(-1) === '.') return;
  if (/[+\-*/%]/.test(val) && /[+\-*/%]$/.test(current)) {
    current = current.slice(0, -1) + val;
  } else {
    current += val;
  }
  updateDisplay();
}

function scientific(func) {
  let lastNum = getLastNumber(current);
  let replacement;
  let n = parseFloat(lastNum || "0");
  switch(func) {
    case "sqrt": replacement = Math.sqrt(n); break;
    case "square": replacement = Math.pow(n, 2); break;
    case "sin": replacement = Math.sin(degToRad(n)); break;
    case "cos": replacement = Math.cos(degToRad(n)); break;
    case "tan": replacement = Math.tan(degToRad(n)); break;
    case "log": replacement = Math.log10(n); break;
    case "ln": replacement = Math.log(n); break;
    default: return;
  }
  if (isNaN(replacement) || !isFinite(replacement)) replacement = "Error";
  current = current.slice(0, current.length - lastNum.length) + replacement;
  updateDisplay();
}
function getLastNumber(str) {
  let m = str.match(/([0-9.]+)$/);
  return m ? m[1] : "";
}
function degToRad(x) {
  return x * Math.PI / 180;
}

function updateDisplay() {
  display.textContent = current.length > 0 ? current : '0';
}
function clearDisplay() {
  current = '0';
  updateDisplay();
}
function backspace() {
  if (evaluated) {
    current = '0';
    evaluated = false;
  } else {
    current = current.slice(0, -1);
    if (current.length === 0) current = '0';
  }
  updateDisplay();
}
function calculate() {
  let expr = current;
  try {
    let parsed = expr.replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/π/g, '(' + constants["π"] + ')')
      .replace(/e/g, '(' + constants["e"] + ')')
      .replace(/%/g, '/100');
    let result = Function('"use strict";return (' + parsed + ')')();
    if (typeof result === "number" && isFinite(result)) {
      current = result.toString();
      addToHistory(expr, result);
    } else {
      current = "Error";
    }
    evaluated = true;
  } catch {
    current = "Error";
    evaluated = true;
  }
  updateDisplay();
}

function toggleMode() {
  scientificMode = !scientificMode;
  document.getElementById('scientificButtons').style.display = scientificMode ? 'grid' : 'none';
  document.getElementById('modeBtn').textContent = scientificMode ? "Standard" : "Scientific";
}

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') input(e.key);
  if (e.key === '.') input('.');
  if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') input(e.key);
  if (e.key === '%') input('%');
  if (e.key === 'Enter' || e.key === '=') calculate();
  if (e.key === 'Backspace') backspace();
  if (e.key.toLowerCase() === 'c') clearDisplay();
  if (e.key === '(' || e.key === ')') input(e.key);
});

// Init
updateDisplay();
renderHistory();
