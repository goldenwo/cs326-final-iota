window.addEventListener("load", async function () {
    const response = await fetch('/stockInfo', {
        method: 'GET',
        body: JSON.stringify({
            symbol: 'TSLA',
        })
    });
});