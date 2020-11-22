window.addEventListener("load", async function () {
    const response = await fetch('/stockInfo', {
        method: 'GET',
        body: JSON.stringify({
            symbol: 'TSLA',
        })
    });
    const jsonResponse = await response.json();
    let price = jsonResponse.json().price;
    let percentchange = jsonResponse.percentchange;
});