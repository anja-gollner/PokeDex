let offset = 0;
let limit = 15;
let allPokemons = [];
let filteredPokemons = [];

async function fetchPokemons(offset, limit) {
    toggleSpinner(true);
        const data = await fetchData(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const pokemonUrls = data.results.map(pokemon => pokemon.url);
        const pokemonData = await Promise.all(pokemonUrls.map(url => fetchData(url)));
        allPokemons.push(...pokemonData);
        filteredPokemons = [...allPokemons];
        renderPokemons(filteredPokemons);

        toggleSpinner(false);
}

function toggleSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

function renderPokemons(pokemons) {
    const container = document.getElementById('pokemonContainer');
    container.innerHTML = '';
    pokemons.forEach((pokemon, index) => {
        container.appendChild(createPokemonCard(pokemon, index));
    });
}

function createPokemonCard(pokemon, index) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card', getTypeClass(pokemon));
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>Typ: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
    card.onclick = () => showPokemonDetails(index, pokemon);
    return card;
}

function getTypeClass(pokemon) {
    return `type-${pokemon.types[0].type.name}`;
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    filteredPokemons = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchInput));
    renderPokemons(filteredPokemons);
}

function showPokemonDetails(index, pokemon) {
    document.getElementById('pokemonDetails').innerHTML = createPokemonDetailsHTML(pokemon);
    document.getElementById('pokemonInfoContainer').innerHTML = createPokemonInfoHTML(pokemon);
    document.getElementById('pokemonModal').style.display = 'flex';

    hideStatsAndInfo();

    currentPokemonIndex = index;
    setCurrentPokemon(pokemon);
}

function hideStatsAndInfo() {
    const statsContainer = document.getElementById('statsChartContainer');
    const infoContainer = document.getElementById('pokemonInfoContainer');
    
    statsContainer.style.display = 'none';
    infoContainer.style.display = 'none';
}

function navigatePokemon(direction) {
    const newIndex = currentPokemonIndex + direction;
    if (newIndex >= 0 && newIndex < allPokemons.length) {
        showPokemonDetails(newIndex, allPokemons[newIndex]);

        hideStatsAndInfo();
    }
}

function createPokemonDetailsHTML(pokemon) {
    return `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Typ: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
}

function createPokemonInfoHTML(pokemon) {
    return `
        <p>Height: ${convertHeightToCm(pokemon.height)} cm</p>
        <p>Weight: ${convertWeightToKg(pokemon.weight)} kg</p>
    `;
}

function toggleInfo() {
    const infoContainer = document.getElementById('pokemonInfoContainer');
    infoContainer.style.display = infoContainer.style.display === 'none' ? 'block' : 'none';
}

function handleModalClick(event) {
    const modal = document.getElementById('pokemonModal');
    
    if (event.target === modal) {
        hidePokemonDetails(); 
    }
}

function hidePokemonDetails() {
    document.getElementById('pokemonModal').style.display = 'none';
}

function loadMorePokemons() {
    offset += limit;
    fetchPokemons(offset, limit);
}

function convertWeightToKg(weight) {
    return weight / 10;
}

function convertHeightToCm(height) {
    return height * 10;
}

function setCurrentPokemon(pokemon) {
    currentPokemon = pokemon;
}

function navigatePokemon(direction) {
    const newIndex = currentPokemonIndex + direction;
    if (newIndex >= 0 && newIndex < allPokemons.length) {
        showPokemonDetails(newIndex, allPokemons[newIndex]);
    }
}

function toggleStatsChart() {
    const container = document.getElementById('statsChartContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    if (container.style.display === 'block') {
        createStatsChart(currentPokemon);
    }
}

function createStatsChart(pokemon) {
    const stats = pokemon.stats.map(stat => stat.base_stat);
    const [hp, attack, defense, specialAttack, specialDefense, speed] = stats;

    const svgContent = generateSVGContent(hp, attack, defense, specialAttack, specialDefense, speed);
    document.getElementById('statsChartContainer').innerHTML = svgContent;
}

function calculateBarWidth(value, maxStat, svgWidth, scaleFactor) {
    return (value / maxStat) * svgWidth * scaleFactor;
}

function createBar(y, width, color, label, value, barHeight) {
    return `
        <rect x="0" y="${y}" width="${width}" height="${barHeight}" fill="${color}"/>
        <text x="${width + 10}" y="${y + barHeight / 2}" fill="white" font-size="12px" dominant-baseline="middle">${label}: ${value}</text>
    `;
}

function generateSVGContent(hp, attack, defense, specialAttack, specialDefense, speed) {
    const stats = [hp, attack, defense, specialAttack, specialDefense, speed];
    const labels = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];
    const colors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 
                    'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 206, 86, 1)'];
    const maxStat = 150, svgWidth = 300, barHeight = 20, scaleFactor = 0.5;

    return `<svg width="${svgWidth}" height="250" xmlns="http://www.w3.org/2000/svg">` + 
        stats.map((stat, i) => {
            const width = (stat / maxStat) * svgWidth * scaleFactor;
            return createBar(10 + i * 30, width, colors[i], labels[i], stat, barHeight);
        }).join('') + '</svg>';
}

fetchPokemons(offset, limit);
