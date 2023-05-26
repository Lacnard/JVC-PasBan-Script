// ==UserScript==
// @name         JVC PasBan
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Affiche 10 pseudo non ban
// @match          http://*.jeuxvideo.com/forums/42-*
// @match          https://*.jeuxvideo.com/forums/42-*
// @match          http://*.jeuxvideo.com/forums/1-*
// @match          https://*.jeuxvideo.com/forums/1-*
// @match          https://www.jeuxvideo.com/forums/0-51-0-1-0-1-0-blabla-18-25-ans.htm
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function fetchData() {
        let clickCount = localStorage.getItem('clickCount') || 0;
        console.log('Click count loaded: ' + clickCount);

        let nickname = localStorage.getItem('nickname') || '';
        console.log('Nickname loaded: ' + nickname);

        if(nickname) {
            fetch('https://www.jeuxvideo.com/sso/ajax_suggest_pseudo.php?pseudo=' + nickname)
                .then(response => response.text())
                .then(data => {
                    var jsonData = JSON.parse(data);
                    var result = jsonData.alias.map(function (alias) {
                        return alias.pseudo;
                    });
                    document.querySelector(".liste-sujets-nomiss").innerHTML = result.join("<br>");
                });
        }
    }

    document.querySelector(".liste-sujets-nomiss").insertAdjacentHTML('beforebegin', '<h4>Jvc PasBan</h4><input type="text" id="nickname-input" /><button id="submit-button">Submit</button>');

    document.getElementById("submit-button").addEventListener("click", function () {
        var nickname = document.getElementById("nickname-input").value;
        console.log(nickname);
        localStorage.setItem('nickname', nickname);
        console.log('Nickname saved: ' + nickname);

        let clickCount = localStorage.getItem('clickCount') || 0;
        clickCount++;
        localStorage.setItem('clickCount', clickCount);

        if (clickCount % 15 === 0) {
            window.open("https://www.jeuxvideo.com/profil/amaretsoncamion");
        }

        fetchData();
    });

    fetchData();
})();
