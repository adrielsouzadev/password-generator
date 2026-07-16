const generateBtn = document.getElementById("generateBtn");
const passwordInput = document.getElementById("password");
const copyBtn = document.getElementById("copyBtn");
const toggleVisibility = document.getElementById("toggleVisibility");
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const errorMsg = document.getElementById("errorMsg");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

const checkboxes = {
    uppercase: document.getElementById("uppercase"),
    lowercase: document.getElementById("lowercase"),
    numbers: document.getElementById("numbers"),
    symbols: document.getElementById("symbols"),
};

const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%&*",
};

// Gera um índice aleatório seguro dentro de [0, max)
function secureRandomIndex(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

function generatePassword(length, activeSets) {
    // Junta todos os conjuntos selecionados
    const allChars = activeSets.map((key) => CHAR_SETS[key]).join("");

    let passwordChars = [];

    // Garante pelo menos 1 caractere de cada tipo selecionado
    activeSets.forEach((key) => {
        const set = CHAR_SETS[key];
        passwordChars.push(set[secureRandomIndex(set.length)]);
    });

    // Preenche o restante aleatoriamente
    for (let i = passwordChars.length; i < length; i++) {
        passwordChars.push(allChars[secureRandomIndex(allChars.length)]);
    }

    // Embaralha para não deixar os primeiros caracteres previsíveis
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = secureRandomIndex(i + 1);
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join("");
}

function getActiveSets() {
    return Object.keys(checkboxes).filter((key) => checkboxes[key].checked);
}

function updateStrength(password, activeSets) {
    const length = password.length;
    const varietyScore = activeSets.length; // 1 a 4

    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    score += varietyScore;

    let percent, label, color;

    if (score <= 2) {
        percent = 25; label = "Fraca"; color = "#dc2626";
    } else if (score <= 4) {
        percent = 50; label = "Razoável"; color = "#f59e0b";
    } else if (score <= 6) {
        percent = 75; label = "Boa"; color = "#3b82f6";
    } else {
        percent = 100; label = "Forte"; color = "#22c55e";
    }

    strengthFill.style.width = percent + "%";
    strengthFill.style.background = color;
    strengthLabel.textContent = label;
}

lengthInput.addEventListener("input", () => {
    lengthValue.textContent = lengthInput.value;
});

generateBtn.addEventListener("click", () => {
    const length = parseInt(lengthInput.value, 10);
    const activeSets = getActiveSets();

    if (activeSets.length === 0) {
        errorMsg.textContent = "Selecione ao menos um tipo de caractere.";
        passwordInput.value = "";
        strengthFill.style.width = "0%";
        strengthLabel.textContent = "—";
        return;
    }

    errorMsg.textContent = "";
    const password = generatePassword(length, activeSets);
    passwordInput.value = password;
    updateStrength(password, activeSets);
});

toggleVisibility.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

copyBtn.addEventListener("click", async () => {
    if (!passwordInput.value) return;

    try {
        await navigator.clipboard.writeText(passwordInput.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copiado!";
        copyBtn.classList.add("copied");

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove("copied");
        }, 1500);
    } catch (err) {
        errorMsg.textContent = "Não foi possível copiar a senha.";
    }
});

// Gera uma senha inicial ao carregar a página
generateBtn.click();