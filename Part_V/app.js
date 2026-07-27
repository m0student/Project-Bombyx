// ============================================================
// Завдання 2 — GitHub-агрегатор
// ============================================================
// API:
//   GET https://api.github.com/users/{username}
//   GET https://api.github.com/users/{username}/repos?per_page=100
//
// Вимоги:
//   1. Валідація username (не порожній, без пробілів).
//   2. Promise.all з двома fetch ОДНОЧАСНО.
//   3. Перевірка response.ok окремо для кожного.
//      404 → "Користувача не існує"
//      403 → "Перевищено rate limit, спробуйте пізніше"
//   4. Render: аватар, name, bio, кількість репо, найпопулярніша мова,
//      топ-3 репо за зірками, сумарні зірки.
//   5. AbortController при повторному кліку (попередній скасовується).
//   6. Loading стан, disabled кнопка.
//   7. console.log часу через performance.now().
//   8. createElement + textContent, без innerHTML для даних.
// ============================================================

const usernameInput = document.getElementById("username");
const loadBtn = document.getElementById("load");
const resultEl = document.getElementById("result");

let currentController = null;

loadBtn.addEventListener("click", async () => {

    const username = usernameInput.value.trim();

    if (!username || username.includes(" ")) {
        resultEl.textContent = `No, this won't work. 
        The name is empty or contains spaces. This is not allowed.`;
        return;
    };

    if (currentController) currentController.abort();
    currentController = new AbortController();
    const { signal } = currentController;

    resultEl.textContent = "Loading...";
    loadBtn.disabled = true;
    const start = performance.now();

    try {
        const [profile, repos] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { signal }),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { signal })
        ]);

        console.log(`Time: ${performance.now() - start} ms`);

        if (!profile.ok || !repos.ok) {

            const status = !profile.ok ?
                profile.status : repos.status;

            if (status === 404) {
                resultEl.textContent = "The user does not exist (404)";
            } else if (status === 403) {
                resultEl.textContent = "Rate limit exceeded, please try again later (403)";
            } else {
                resultEl.textContent = `Error: status ${status}`;
            }

            loadBtn.disabled = false;
            return;
        }

        const profileJson = await profile.json();
        const reposJson = await repos.json();

        renderDashboard(profileJson, reposJson);

        loadBtn.disabled = false;

    } catch (e) {
        if (e.name === "AbortError") return;
        console.log(e);
        loadBtn.disabled = false;
    }
});

function renderDashboard(profile, repos) {

    resultEl.textContent = "";

    let stars = 0;
    const langMap = new Map();

    repos.forEach(el => {
        stars += el.stargazers_count;

        if (el.language) langMap.set(el.language,
            (langMap.get(el.language) || 0) + 1);
    });

    let langChamp = "Unknown", max = 0;
    langMap.forEach((v, k) => {
        if (v > max) {
            max = v;
            langChamp = k;
        }
    });

    const topIII = [...repos].sort((n, w) =>
        w.stargazers_count - n.stargazers_count).slice(0, 3)

    // profile data

    const profileDiv = document.createElement("div");
    profileDiv.className = "profile";

    const face = document.createElement("img");
    face.src = profile.avatar_url;

    const info = document.createElement("div");

    const name = document.createElement("h2");
    name.style.color = "#f0f6fc"
    name.textContent = profile.name || profile.login;
    const bio = document.createElement("p");
    bio.textContent = profile.bio || "No bio available";

    info.append(name, bio);
    profileDiv.append(face, info);

    // statistic

    const statsDiv = document.createElement("div");
    statsDiv.className = "stats";

    const addStat = (label, value) => {

        const div = document.createElement("div");
        div.className = "stat";
        div.insertAdjacentHTML("beforeend",
            `<div class="label">${label}</div>`);

        const divVal = document.createElement("div");
        divVal.className = "value";
        divVal.textContent = value;

        div.append(divVal);
        statsDiv.append(div);
    }

    addStat("Repositories", profile.public_repos);
    addStat("Stars", stars);
    addStat("Main language", langChamp);

    // top III

    const topDiv = document.createElement("div");
    topDiv.className = "top-III";

    const h3 = document.createElement("div");
    h3.style.color = "#f0f6fc";
    h3.style.marginBottom = "16px";
    h3.textContent = "Top 3 repositories: ";
    topDiv.append(h3);

    topIII.forEach(r => {

        const repo = document.createElement("div");
        repo.className = "repo";

        const repoName = document.createElement("div");
        repoName.className = "name";
        repoName.textContent = r.name;

        const repoDescription = document.createElement("div");
        repoDescription.className = "desc";
        repoDescription.textContent = r.description || "No description available";

        const repoStars = document.createElement("div");
        repoStars.className = "stars";
        repoStars.textContent = `${r.stargazers_count}`;

        repo.append(repoName, repoDescription, repoStars);
        topDiv.append(repo);
    });

    resultEl.append(profileDiv, statsDiv, topDiv);
}