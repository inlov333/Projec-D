// โหลดข้อมูล JSON และสร้างตารางผู้เล่น
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        let players = data.players;

        // อัปเดตข้อมูลของผู้เล่น (update worth และ change)
        players = updatePlayerWorth(players);

        // จัดเรียงลำดับตาม worth
        players = sortPlayersByWorth(players);

        // เก็บข้อมูลผู้เล่นในตัวแปร global
        window.playersData = players;

        // แสดงตาราง
        renderTable(players);
    });



// ฟังก์ชันสร้างตาราง
function renderTable(players) {
    const tableBody = document.querySelector('#player-table tbody');
    tableBody.innerHTML = ''; // เคลียร์ข้อมูลเก่าก่อน

    if (players.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No players found</td>
            </tr>
        `;
        return;
    }

    players.forEach(player => {
        const row = document.createElement('tr');

        // แสดงธงประเทศหลายธง
        const flags = player.country_flags
            .map(flagUrl => `<img src="${flagUrl}" alt="${player.country}" class="flag-img">`)
            .join(' ');

        row.innerHTML = `
            <td>${player.rank}</td>
            <td>
                <div class="player-info" onclick="showPopup('${player.name}')">
                    <img src="${player.avatar}" alt="${player.name}" class="player-img">
                    ${player.name}
                </div>
            </td>
            <td>${flags}</td>
            <td>${player.worth}</td>
            <td>
                <span class="${player.change.startsWith('+') ? 'change-positive' : 'change-negative'}">
                    ${player.change.startsWith('+') ? '▲' : '▼'} ${player.change}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ฟังก์ชันกรองข้อมูลผู้เล่น
function filterTable() {
    const searchValue = document.getElementById('search-bar').value.toLowerCase();
    const filteredPlayers = window.playersData.filter(player =>
        player.name.toLowerCase().includes(searchValue)
    );

    renderTable(filteredPlayers);
}

// ฟังก์ชันรีเซ็ตตาราง
function resetTable() {
    document.getElementById('search-bar').value = '';
    renderTable(window.playersData);
}

// ฟังก์ชันแสดง Popup พร้อมกราฟ
function showPopup(playerName) {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const playerNameEl = document.getElementById('player-name');
    const playerAvatarEl = document.getElementById('player-avatar');
    const playerWinsEl = document.getElementById('player-wins');
    const playerLossesEl = document.getElementById('player-losses');
    const playerWinRateEl = document.getElementById('player-winrate');
    const ctx = document.getElementById('player-chart').getContext('2d');

    const player = window.playersData.find(p => p.name === playerName);

    playerNameEl.textContent = player.name;
    playerAvatarEl.src = player.avatar;
    playerWinsEl.textContent = player.win;
    playerLossesEl.textContent = player.lose;
    playerWinRateEl.textContent = ((player.win / (player.win + player.lose)) * 100).toFixed(2);

    overlay.classList.add('active');
    popup.classList.add('active');

    if (window.playerChart) {
        window.playerChart.destroy();
    }

    window.playerChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['TOUGE', 'STREET', 'RALLY', 'CIRCUIT', 'PRIVATE'],
            datasets: [{
                label: playerName,
                data: player.stats,
                backgroundColor: 'rgba(41, 128, 185, 0.3)',
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(41, 128, 185, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(41, 128, 185, 1)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: { color: '#ccc' },
                    grid: { color: '#ddd' },
                    ticks: {
                        stepSize: 20,
                        backdropColor: 'transparent',
                        color: '#333',
                        font: { size: 12 },
                    },
                    pointLabels: {
                        font: { size: 14, weight: 'bold' },
                        color: '#444',
                    },
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#444',
                        font: { size: 14 },
                    }
                }
            }
        }
    });
}


// ฟังก์ชันปิด Popup
function closePopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    overlay.classList.remove('active');
    popup.classList.remove('active');
}

// ฟังก์ชันแปลงข้อความเป็นตัวเลข (เช่น "¥ 100,000" => 100000)
function parseWorth(worthString) {
    return parseInt(worthString.replace(/[^\d-]/g, ''), 10);
}

// ฟังก์ชันเพิ่ม/อัปเดตค่าของ change และ worth
function updatePlayerWorth(players) {
    players.forEach(player => {
        // ตัวอย่าง: เพิ่มค่าการเปลี่ยนแปลง (สมมติ)
        const currentWorth = parseWorth(player.worth);
        const changeValue = parseWorth(player.change);

        // คำนวณ worth ใหม่
        const newWorth = currentWorth + changeValue;

        // อัปเดตข้อมูลใน player
        player.worth = `¥ ${newWorth.toLocaleString()}`; // แปลงกลับเป็นข้อความ
        player.change = `${changeValue > 0 ? '+' : ''}¥ ${changeValue.toLocaleString()}`; // อัปเดต change
    });

    return players;
}

// ฟังก์ชันจัดเรียงผู้เล่นตาม worth
function sortPlayersByWorth(players) {
    // จัดเรียงตาม worth (แปลงตัวเลขจากข้อความ)
    players.sort((a, b) => parseWorth(b.worth) - parseWorth(a.worth));

    // อัปเดต rank ตามลำดับที่จัดเรียงใหม่
    players.forEach((player, index) => {
        player.rank = index + 1;
    });

    return players;
}

function refreshData() {
    // อัปเดตข้อมูล
    window.playersData = updatePlayerWorth(window.playersData);

    // จัดเรียงตาม worth
    window.playersData = sortPlayersByWorth(window.playersData);

    // แสดงตารางใหม่
    renderTable(window.playersData);
}

// ปุ่ม Refresh
document.getElementById('refresh-button').addEventListener('click', refreshData);
function updateChart(player) {
    const ctx = document.getElementById('player-chart').getContext('2d');

    // ลบกราฟเดิมถ้ามี
    if (window.myChart) {
        window.myChart.destroy();
    }

    // สร้างกราฟใหม่
    window.myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                data: [player.wins, player.losses],
                backgroundColor: ['#4caf50', '#f44336'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });
}
