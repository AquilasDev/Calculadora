var state = {
  current:    '0',
  previous:   null,
  operator:   null,
  waiting:    false,
  history:    '',
  isRad:      false,
  isInverse:  false,
  paren:      0,
  powerMode:  false,
};

var resultEl  = document.getElementById('result');
var historyEl = document.getElementById('history');
var wrapper   = document.getElementById('calc-wrapper');
var modeBtn   = document.getElementById('mode-toggle');
var modeLabel = document.getElementById('mode-label');
var themeBtn  = document.getElementById('theme-btn');
var zeroBtn   = document.getElementById('zero-btn');
var degRadBtn = document.getElementById('deg-rad-btn');

function updateDisplay() {
  var txt = state.current;

  if (!txt.includes('.') && !txt.includes('e') && !isNaN(parseFloat(txt))) {
    var n = parseFloat(txt);
    if (Math.abs(n) >= 1e15) {
      txt = n.toExponential(6);
    }
  }

  resultEl.textContent = txt;
  historyEl.textContent = state.history;
  resultEl.classList.toggle('small', txt.length > 10);
}

function toRad(n) {
  return state.isRad ? n : n * (Math.PI / 180);
}

function factorial(n) {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  var result = 1;
  for (var i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function inputNumber(val) {
  if (state.waiting) {
    state.current = val;
    state.waiting = false;
  } else {
    if (state.current.replace('-', '').length >= 14) return;
    state.current = state.current === '0' ? val : state.current + val;
  }
  updateDisplay();
}

function inputDot() {
  if (state.waiting) {
    state.current = '0.';
    state.waiting = false;
  } else if (!state.current.includes('.')) {
    state.current += '.';
  }
  updateDisplay();
}

function inputOperator(op) {
  var curr = parseFloat(state.current);
  if (state.operator && !state.waiting) {
    curr = calculate(parseFloat(state.previous), curr, state.operator);
    state.current = formatResult(curr);
  }

  state.previous = state.current;
  state.operator = op;
  state.waiting  = true;
  state.history  = state.previous + ' ' + op;
  updateDisplay();
}

function equals() {
  if (!state.operator || state.waiting) return;

  var a = parseFloat(state.previous);
  var b = parseFloat(state.current);
  var res = calculate(a, b, state.operator);

  state.history  = state.previous + ' ' + state.operator + ' ' + state.current + ' =';
  state.current  = formatResult(res);
  state.previous = null;
  state.operator = null;
  state.waiting  = true;
  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case '+':  return a + b;
    case '−':  return a - b;
    case '×':  return a * b;
    case '÷':  return b === 0 ? 'Erro' : a / b;
    case '^':  return Math.pow(a, b);
    default:   return b;
  }
}

function formatResult(val) {
  if (val === 'Erro' || isNaN(val)) return 'Erro';
  if (!isFinite(val)) return val > 0 ? 'Infinito' : '-Infinito';

  var fixed = parseFloat(val.toPrecision(12));
  var str   = String(fixed);

  if (Math.abs(fixed) >= 1e15 || (Math.abs(fixed) < 1e-10 && fixed !== 0)) {
    str = fixed.toExponential(6);
  }

  return str;
}

function scientificAction(action) {
  var n   = parseFloat(state.current);
  var res;

  switch (action) {
    case 'sin':  res = state.isInverse ? Math.asin(n) * (state.isRad ? 1 : 180/Math.PI) : Math.sin(toRad(n)); break;
    case 'cos':  res = state.isInverse ? Math.acos(n) * (state.isRad ? 1 : 180/Math.PI) : Math.cos(toRad(n)); break;
    case 'tan':  res = state.isInverse ? Math.atan(n) * (state.isRad ? 1 : 180/Math.PI) : Math.tan(toRad(n)); break;
    case 'log':  res = state.isInverse ? Math.pow(10, n) : Math.log10(n); break;
    case 'ln':   res = state.isInverse ? Math.exp(n) : Math.log(n); break;
    case 'sqrt': res = state.isInverse ? n * n : Math.sqrt(n); break;
    case 'cbrt': res = state.isInverse ? Math.pow(n, 3) : Math.cbrt(n); break;
    case 'pow2': res = Math.pow(n, 2); break;
    case 'pow3': res = Math.pow(n, 3); break;
    case 'inv-x': res = n !== 0 ? 1 / n : 'Erro'; break;
    case 'pi':
      state.current = String(Math.PI);
      state.history = 'π';
      state.waiting = true;
      updateDisplay();
      return;
    case 'e':
      state.current = String(Math.E);
      state.history = 'e';
      state.waiting = true;
      updateDisplay();
      return;
    case 'abs':  res = Math.abs(n); break;
    case 'fact': res = factorial(n); break;
    case 'exp':
      state.current  = state.current + 'e';
      state.history  = state.current;
      updateDisplay();
      return;
    case 'powy':
      state.previous = state.current;
      state.operator = '^';
      state.waiting  = true;
      state.history  = state.current + ' ^';
      updateDisplay();
      return;
    case 'inv':
      state.isInverse = !state.isInverse;
      document.querySelectorAll('[data-action="sin"]')[0].textContent = state.isInverse ? 'asin' : 'sin';
      document.querySelectorAll('[data-action="cos"]')[0].textContent = state.isInverse ? 'acos' : 'cos';
      document.querySelectorAll('[data-action="tan"]')[0].textContent = state.isInverse ? 'atan' : 'tan';
      document.querySelectorAll('[data-action="log"]')[0].textContent = state.isInverse ? '10ˣ'  : 'log';
      document.querySelectorAll('[data-action="ln"]')[0].textContent  = state.isInverse ? 'eˣ'   : 'ln';
      document.querySelectorAll('[data-action="sqrt"]')[0].textContent = state.isInverse ? 'x²'  : '√';
      return;
    case 'deg-rad':
      state.isRad = !state.isRad;
      degRadBtn.textContent = state.isRad ? 'RAD' : 'DEG';
      return;
    case 'open-par':
      state.history += '(';
      state.paren++;
      updateDisplay();
      return;
    case 'close-par':
      if (state.paren > 0) {
        state.history += ')';
        state.paren--;
      }
      updateDisplay();
      return;
    default:
      return;
  }

  var label = action === 'abs' ? '|' + n + '|' : action + '(' + n + ')';
  state.history  = label + ' =';
  state.current  = formatResult(res);
  state.waiting  = true;
  updateDisplay();
}

function clearAll() {
  state.current   = '0';
  state.previous  = null;
  state.operator  = null;
  state.waiting   = false;
  state.history   = '';
  state.isInverse = false;
  state.paren     = 0;
  updateDisplay();
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Erro') return;
  state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
  updateDisplay();
}

function percent() {
  var n = parseFloat(state.current);
  if (isNaN(n)) return;

  if (state.previous !== null) {
    state.current = formatResult(parseFloat(state.previous) * n / 100);
  } else {
    state.current = formatResult(n / 100);
  }
  updateDisplay();
}

document.getElementById('buttons').addEventListener('click', function (e) {
  var btn = e.target.closest('.btn');
  if (!btn) return;

  var action = btn.dataset.action;

  switch (action) {
    case 'num':     inputNumber(btn.dataset.val); break;
    case 'dot':     inputDot();                    break;
    case 'op':      inputOperator(btn.dataset.op); break;
    case 'equals':  equals();                      break;
    case 'clear':   clearAll();                    break;
    case 'sign':    toggleSign();                  break;
    case 'percent': percent();                     break;
    default:        scientificAction(action);       break;
  }
});

document.addEventListener('keydown', function (e) {
  if (e.target.tagName === 'INPUT') return;

  var key = e.key;

  if (key >= '0' && key <= '9') { inputNumber(key); }
  else if (key === '.')  { inputDot(); }
  else if (key === '+')  { inputOperator('+'); }
  else if (key === '-')  { inputOperator('−'); }
  else if (key === '*')  { inputOperator('×'); }
  else if (key === '/')  { e.preventDefault(); inputOperator('÷'); }
  else if (key === 'Enter' || key === '=') { equals(); }
  else if (key === 'Escape' || key === 'c' || key === 'C') { clearAll(); }
  else if (key === 'Backspace') {
    if (state.current.length > 1 && !state.waiting) {
      state.current = state.current.slice(0, -1) || '0';
      updateDisplay();
    } else {
      clearAll();
    }
  }
});

var isScientific = false;

modeBtn.addEventListener('click', function () {
  isScientific = !isScientific;
  wrapper.classList.toggle('scientific', isScientific);
  zeroBtn.classList.toggle('span2', !isScientific);
  modeLabel.textContent = isScientific ? 'Normal' : 'Científica';
  modeBtn.classList.toggle('active', isScientific);
});

var savedTheme  = localStorage.getItem('calc-tema');
var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.body.classList.add('dark');
  themeBtn.textContent = '☀️';
}

themeBtn.addEventListener('click', function () {
  var isDark = document.body.classList.toggle('dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('calc-tema', isDark ? 'dark' : 'light');
});

updateDisplay();
