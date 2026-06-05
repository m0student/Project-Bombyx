// ============================================================
// Завдання 4 — Валідатор паролів
// ============================================================
const WEAK_PASSWORDS = ["password", "12345678", "qwerty", "admin"];

const re = /^(?=.{8,})(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^\d]*\d)(?=[^!@#$%^&*]*[!@#$%^&*])[^\s]+$/;

/**
 * Перевіряє пароль за 7 правилами:
 *
 * 1. Довжина >= 8 символів
 * 2. Хоча б одна велика літера (A-Z)
 * 3. Хоча б одна мала літера (a-z)
 * 4. Хоча б одна цифра (0-9)
 * 5. Хоча б один спецсимвол !@#$%^&*
 * 6. Без пробілів
 * 7. Не зі списку WEAK_PASSWORDS (case-insensitive)
 *
 * Повертає об'єкт:
 *   { valid: boolean, errors: string[] }
 *
 * Якщо порушено кілька правил — у errors мають бути ВСІ повідомлення.
 */
function validatePassword(password) {

    const errors = [];
    const stringPass = password ? String(password) : "";
    const lowerPass = stringPass.toLowerCase();
    const isValid = re.test(stringPass);

    if (!isValid) {
        if (stringPass.length < 8) errors.push("Довжина < 8 символів");
        if (!/[A-Z]/.test(stringPass)) errors.push("Немає великих літер");
        if (!/[a-z]/.test(stringPass)) errors.push("Немає малих літер");
        if (!/[0-9]/.test(stringPass)) errors.push("Немає цифр");
        if (!/[!@#$%^&*]/.test(stringPass)) errors.push("Немає спецсимволів");
        if (/\s/.test(stringPass)) errors.push("He повинен містити пробіли");
    }
    if (WEAK_PASSWORDS.includes(lowerPass)) {
        errors.push("Classic Weak Password")
    };

    const forbiddenPattern = /p.*a.*s.*s.*w.*o.*r.*d/;

    if (forbiddenPattern.test(lowerPass)) {
        errors.push("Too weak to exist because of password pattern");
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// ============================================================
// Тестові кейси
// ============================================================
console.log(validatePassword("Abc1!def"));
// // { valid: true, errors: [] }
//
console.log(validatePassword("abc"));
// // { valid: false, errors: ["Довжина < 8", "Немає великих літер", "Немає цифр", "Немає спецсимволів"] }
//
console.log(validatePassword("PASSWORD123!"));
// // { valid: false, errors: ["Немає малих літер", "Це слабкий пароль"] }
//
console.log(validatePassword("MyPass 1!"));
// // { valid: false, errors: ["Не повинен містити пробіли"] }
//
console.log(validatePassword(""));
// // { valid: false, errors: ["Довжина < 8", "Немає великих літер", ...] }
//
console.log(validatePassword("12345678"));
// // { valid: false, errors: [..., "Classic Weak Password"] }
//
console.log(validatePassword("p1a2s3s4w5o6r7d8"));
// // { valid: false, errors: ["Too weak to exist because of password pattern", ...] }
//