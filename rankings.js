



window.addEventListener("load", async function () {

const response = await fetch("tickerSymbols.json");
    if (!response.ok) {
        console.log(response.error);
        return;
    }

    // We make dictionary a global.
    window.tickerSymbols = await response.json();

    document.getElementById('all-timeBtn').addEventListener('click', () => {
        console.log(tickerSymbols[2]);
    });
});

// console.log(tickerSymbols);
