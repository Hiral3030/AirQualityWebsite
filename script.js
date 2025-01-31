const channelID = "2797593";
const readAPIKey = "XATE2MSVT2QHSPQ6"; // Replace with your Read API Key
const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=10`;

async function fetchData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const feeds = data.feeds;

        if (feeds.length === 0) {
            console.log("No data found.");
            return;
        }

        const latest = feeds[feeds.length - 1];
        
        document.getElementById("temperature").textContent = `${latest.field1} °C`;
        document.getElementById("humidity").textContent = `${latest.field2} %`;
        document.getElementById("co").textContent = `${latest.field3} PPM`;
        document.getElementById("aqi").textContent = `${latest.field4}`;
        document.getElementById("nox").textContent = `${latest.field5} PPM`;

        updateChart(feeds);
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
            { label: "CO PPM", borderColor: "gray", data: [] },
            { label: "AQI", borderColor: "purple", data: [] },
            { label: "NOx PPM", borderColor: "orange", data: [] }
        ]
    },
    options: { responsive: true }
});

function updateChart(feeds) {
    const labels = feeds.map(feed => feed.created_at);
    const tempData = feeds.map(feed => parseFloat(feed.field1));
    const humidityData = feeds.map(feed => parseFloat(feed.field2));
    const coData = feeds.map(feed => parseFloat(feed.field3));
    const aqiData = feeds.map(feed => parseFloat(feed.field4));
    const noxData = feeds.map(feed => parseFloat(feed.field5));

    dataChart.data.labels = labels;
    dataChart.data.datasets[0].data = tempData;
    dataChart.data.datasets[1].data = humidityData;
    dataChart.data.datasets[2].data = coData;
    dataChart.data.datasets[3].data = aqiData;
    dataChart.data.datasets[4].data = noxData;
    dataChart.update();
}

document.getElementById("download-btn").addEventListener("click", () => {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let csvContent = "Date,Temperature,Humidity,CO PPM,AQI,NOx PPM\n";
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
