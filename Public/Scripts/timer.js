(function(){
    if (window.__activityTimerInitialized) return;
    window.__activityTimerInitialized = true;
    function updateTimers(){
        document.querySelectorAll('.timer').forEach(function(el) {
            var created = new Date(el.getAttribute('data-created-at'));
            var diff = Math.floor((Date.now() - created.getTime())/1000);
            var h = Math.floor(diff/3600); diff %= 3600;
            var m = Math.floor(diff/60);
            var s = diff % 60;
            if (h > 48) el.textContent = `${Math.floor(h/24)} days ago`;
            else el.textContent = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        });
    }
    updateTimers();
    setInterval(updateTimers, 1000);
})();