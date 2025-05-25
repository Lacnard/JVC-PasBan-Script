// ==UserScript==
// @name         JVC PasBan V1.2
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Affiche les pseudos valides associés à un alias JVC + historique interactif sans scroll parasite
// @match        http://*.jeuxvideo.com/forums/42-*
// @match        https://*.jeuxvideo.com/forums/42-*
// @match        http://*.jeuxvideo.com/forums/1-*
// @match        https://*.jeuxvideo.com/forums/1-*
// @match        https://www.jeuxvideo.com/forums/0-51-0-1-0-1-0-blabla-18-25-ans.htm
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'jvc_pasban_history';

    // Style global
    const style = document.createElement("style");
    style.innerHTML = `
        .bloc-info-forum,
        .bloc-info-forum.has-scrollbar {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
        }
        #pasban-output ul {
            max-height: 300px;
            overflow-y: auto;
            padding-right: 5px;
        }
        .pasban-history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 8px;
            cursor: pointer;
        }
        .pasban-history-item:hover {
            background: #3a3a3a;
        }
        .pasban-delete {
            background: none;
            border: none;
            color: #f66;
            font-weight: bold;
            cursor: pointer;
            padding-left: 10px;
        }
        .pasban-clear {
            text-align: center;
            color: #888;
            font-size: 12px;
            padding: 4px;
            cursor: pointer;
        }
        .pasban-clear:hover {
            color: #f66;
        }
    `;
    document.head.appendChild(style);

    function waitForElement(selector, callback) {
        const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                callback(el);
            }
        }, 100);
    }

    async function isPseudoValid(pseudo) {
        try {
            const res = await fetch("https://www.jeuxvideo.com/profil/" + encodeURIComponent(pseudo));
            const html = await res.text();
            return !html.includes("Ce pseudo n'existe pas") && !html.includes("a été suspendu");
        } catch {
            return false;
        }
    }

    async function fetchData(nickname) {
        const output = document.getElementById("pasban-output");
        output.innerHTML = `<span style="color:gray;">🔄 Vérification...</span>`;
        try {
            const res = await fetch('https://www.jeuxvideo.com/sso/ajax_suggest_pseudo.php?pseudo=' + encodeURIComponent(nickname));
            const data = await res.text();
            const json = JSON.parse(data);
            const aliasList = json.alias.map(a => a.pseudo);

            const valid = [];
            for (const alias of aliasList) {
                const ok = await isPseudoValid(alias);
                if (ok) valid.push(alias);
            }

            if (valid.length === 0) {
                output.innerHTML = `❌ Aucun pseudo valide trouvé.`;
            } else {
                output.innerHTML = `
                    <div style="margin-top:8px;">
                        ✅ <strong>${valid.length}</strong> pseudo(s) valide(s) :
                        <ul style="margin:5px 0 0 15px;">
                            ${valid.map(p => `<li>${p}</li>`).join("")}
                        </ul>
                    </div>`;
                window._jvc_valid_pseudos = valid;
            }
        } catch (e) {
            output.innerHTML = "❌ Erreur lors de la récupération.";
        }
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    function updateHistory(pseudo) {
        let history = getHistory();
        if (!history.includes(pseudo)) {
            history.unshift(pseudo);
            if (history.length > 20) history.pop();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        }
    }

    function deleteFromHistory(pseudo) {
        const history = getHistory().filter(p => p !== pseudo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    function clearHistory() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }

    function refreshHistoryMenu(menu, input) {
        const history = getHistory();
        menu.innerHTML = '';

        history.forEach(p => {
            const item = document.createElement("div");
            item.className = "pasban-history-item";
            item.innerHTML = `
                <span style="color:#ccc;flex:1;">${p}</span>
                <button class="pasban-delete">✖</button>
            `;
            item.addEventListener("click", () => {
                input.value = p;
                menu.style.display = "none";
            });
            item.querySelector("button").addEventListener("click", (e) => {
                e.stopPropagation();
                deleteFromHistory(p);
                refreshHistoryMenu(menu, input);
            });
            menu.appendChild(item);
        });

        if (history.length > 0) {
            const clear = document.createElement("div");
            clear.className = "pasban-clear";
            clear.textContent = "🧹 Vider l'historique";
            clear.addEventListener("click", () => {
                clearHistory();
                refreshHistoryMenu(menu, input);
            });
            menu.appendChild(clear);
        }

        if (history.length === 0) {
            const empty = document.createElement("div");
            empty.innerText = "Aucun historique";
            empty.style = "color:#888;padding:6px;";
            menu.appendChild(empty);
        }
    }

    waitForElement(".liste-sujets-nomiss", (target) => {
        const savedNickname = localStorage.getItem("nickname") || '';

        const container = document.createElement("div");
        container.style = "margin:10px 0;padding:12px;border:1px solid #333;background:#1e1e1e;border-radius:6px;";
        container.innerHTML = `<h4 style="margin:0 0 10px;color:#6ec1ff;">🔍 JVC PasBan</h4>`;

        const formRow = document.createElement("div");
        formRow.style = "position:relative;display:flex;gap:6px;align-items:center;";

        const input = document.createElement("input");
        input.id = "nickname-input";
        input.placeholder = "Entrez un pseudo";
        input.value = savedNickname;
        input.style = "flex:1;padding:6px;background:#2e2e2e;border:1px solid #444;color:#fff;border-radius:4px;";

        const submitBtn = document.createElement("button");
        submitBtn.id = "submit-button";
        submitBtn.innerText = "GO";
        submitBtn.style = "padding:6px 10px;background:#444;color:#fff;border:none;border-radius:4px;";

        // Menu historique
        const historyMenu = document.createElement("div");
        historyMenu.style = `
            position:absolute;
            top:100%;
            left:0;
            right:0;
            background:#2a2a2a;
            border:1px solid #444;
            border-top:none;
            z-index:9999;
            display:none;
            max-height:180px;
            overflow:auto;
        `;

        input.addEventListener("focus", () => {
            refreshHistoryMenu(historyMenu, input);
            historyMenu.style.display = "block";
        });

        input.addEventListener("blur", () => {
            setTimeout(() => historyMenu.style.display = "none", 200);
        });

        formRow.appendChild(input);
        formRow.appendChild(submitBtn);
        formRow.appendChild(historyMenu);
        container.appendChild(formRow);

        const buttonRow = document.createElement("div");
        buttonRow.style = "margin-top:8px;display:flex;gap:10px;";

        const randBtn = document.createElement("button");
        randBtn.innerText = "🎲 Copier un aléatoire";
        randBtn.style = "flex:1;padding:6px;background:#3a3a3a;color:#fff;border:none;border-radius:4px;";
        randBtn.addEventListener("click", () => {
            const list = window._jvc_valid_pseudos || [];
            if (list.length === 0) return alert("Aucun pseudo disponible.");
            const rand = list[Math.floor(Math.random() * list.length)];
            navigator.clipboard.writeText(rand);
            alert("✅ Pseudo copié : " + rand);
        });

        const exportBtn = document.createElement("button");
        exportBtn.innerText = "💾 Exporter";
        exportBtn.style = "flex:1;padding:6px;background:#3a3a3a;color:#fff;border:none;border-radius:4px;";
        exportBtn.addEventListener("click", () => {
            const list = window._jvc_valid_pseudos || [];
            if (list.length === 0) return alert("Aucun pseudo à exporter.");
            const blob = new Blob([list.join("\n")], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "pseudos-valides.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        buttonRow.appendChild(randBtn);
        buttonRow.appendChild(exportBtn);
        container.appendChild(buttonRow);

        const outputDiv = document.createElement("div");
        outputDiv.id = "pasban-output";
        outputDiv.style = "margin-top:10px;color:#ccc;font-size:14px;";
        container.appendChild(outputDiv);

        target.insertAdjacentElement("beforebegin", container);

        if (savedNickname) fetchData(savedNickname);

        submitBtn.addEventListener("click", () => {
            const nickname = input.value.trim();
            if (!nickname) return;
            localStorage.setItem("nickname", nickname);
            updateHistory(nickname);
            fetchData(nickname);
        });

        // PATCH overflow parent
        const blocForum = document.querySelector('.bloc-info-forum');
        if (blocForum) {
            blocForum.style.maxHeight = 'none';
            blocForum.style.height = 'auto';
            blocForum.style.overflow = 'visible';
        }
    });
})();
