const channelID = "2797593"; // Your ThingSpeak Channel ID
const readAPIKey = "XATE2MSVT2QHSPQ6"; // Replace with your Read API Key
const apiURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=10`;

async function fetchData() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const feeds = data.feeds;

        if (feeds.length > 0) {
            const latest = feeds[feeds.length - 1];

            document.getElementById("temperature").textContent = `${latest.field1} °C`;
            document.getElementById("humidity").textContent = `${latest.field2} %`;
            document.getElementById("co").textContent = `${latest.field3} PPM`;
            document.getElementById("aqi").textContent = `${latest.field4} AQI`;
            document.getElementById("nox").textContent = `${latest.field5} PPM`;

            updateChart(feeds);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

const ctx = document.getElementById("data-chart").getContext("2d");
const dataChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            { label: "Temperature (°C)", borderColor: "red", data: [] },
            { label: "Humidity (%)", borderColor: "blue", data: [] },
            { label: "CO (PPM)", borderColor: "green", data: [] },
            { label: "AQI", borderColor: "purple", data: [] },
            { label: "NOx (PPM)", borderColor: "orange", data: [] }
        ]
    },
    options: { responsive: true }
});

function updateChart(feeds) {
    const labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
    dataChart.data.labels = labels;
    dataChart.data.datasets[0].data = feeds.map(feed => parseFloat(feed.field1));
    dataChart.data.datasets[1].data = feeds.map(feed => parseFloat(feed.field2));
    dataChart.data.datasets[2].data = feeds.map(feed => parseFloat(feed.field3));
    dataChart.data.datasets[3].data = feeds.map(feed => parseFloat(feed.field4));
    dataChart.data.datasets[4].data = feeds.map(feed => parseFloat(feed.field5));
    dataChart.update();
}

document.getElementById("download-btn").addEventListener("click", () => {
    let csvContent = "Time,Temperature (°C),Humidity (%),CO (PPM),AQI,NOx (PPM)\n";
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            data.feeds.forEach(feed => {
                csvContent += `${feed.created_at},${feed.field1},${feed.field2},${feed.field3},${feed.field4},${feed.field5}\n`;
            });
            const blob = new Blob([csvContent], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "air_quality_data.csv";
            link.click();
        });
});

setInterval(fetchData, 15000);
fetchData();
