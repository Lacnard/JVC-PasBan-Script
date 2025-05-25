# 🔍 JVC PasBan – Script Tampermonkey

**JVC PasBan** est un userscript Tampermonkey destiné au forum [jeuxvideo.com](https://www.jeuxvideo.com), qui permet d’afficher automatiquement jusqu’à 10 de vos pseudos **non bannis** (alias suggérés par l’API officielle) afin de faciliter la publication de messages sans passer par des vérifications manuelles.

---

## ✅ Fonctionnalités principales

- 🔎 Affiche automatiquement les pseudos non bannis associés à un alias.
- 🧠 Système d’historique interactif (affichage, clic rapide, suppression).
- 🧹 Bouton pour vider l’historique.
- 🎲 Copier un pseudo valide au hasard.
- 💾 Exporter la liste des pseudos valides en fichier `.txt`.
- 🧼 Plus de scroll-bar verticale parasite.
- 📱 Compatible mobile Android via **Kiwi Browser**.

---

## 📷 Aperçu

![Exemple 1 – ](https://image.noelshack.com/fichiers/2025/21/7/1748188317-image.png)

![Exemple 2 – ](https://image.noelshack.com/fichiers/2025/21/7/1748188170-image.png)
---

## 📦 Installation

1. Installe [Tampermonkey](https://www.tampermonkey.net/) dans ton navigateur (Chrome, Firefox, Edge…) et active le mode developpeur.
2. Clique sur **"Nouveau script"**.
3. Colle le contenu du fichier `jvc-pasban.user.js` 
4. Enregistre, recharge une page du forum JVC → le script est actif !

✅ Compatible aussi sur **Kiwi Browser (Android)** avec Tampermonkey mobile.

---

## 🛠️ Paramètres techniques

- Stockage local (`localStorage`) pour garder ton historique de pseudos.
- Ne transmet **aucune donnée personnelle** – tout est stocké localement.

---

## 🔐 Vie privée

- Le script ne lit pas tes cookies, ne s’identifie pas, et ne stocke rien en ligne.
- Tes pseudos testés sont **enregistrés uniquement dans ton navigateur**, jamais partagés ni visibles dans le script.

---

## 🤝 Contribuer

Pull requests, idées et suggestions bienvenues !  
Tu peux aussi forker ce dépôt et l’adapter à ton propre usage.

---

## 📜 Licence

MIT – Libre d’usage et de modification.
