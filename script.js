let offset = 0;
let limit = 15;
let currentPokemonIndex = null;
let allPokemons = [];
let currentPokemon = null;

async function fetchPokemons(offset, limit) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'flex'; 

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        allPokemons.push(...data.results);
        displayPokemons(data.results);
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon:", error);
    } finally {
        loadingSpinner.style.display = 'none'; 
    }
}

function getTypeClass(pokemon) {
    const type = pokemon.types[0].type.name; 
    return `type-${type}`;
}

function displayPokemons(pokemons) {
    const pokemonContainer = document.getElementById('pokemonContainer');
    pokemons.forEach((pokemon, index) => {
        fetch(pokemon.url)
            .then(response => response.json())
            .then(data => {
                const pokemonCard = document.createElement('div');
                pokemonCard.classList.add('pokemon-card');
                
                const typeClass = getTypeClass(data);
                pokemonCard.classList.add(typeClass);

                pokemonCard.innerHTML = `
                    <img src="${data.sprites.front_default}" alt="${data.name}">
                    <h3>${data.name}</h3>
                    <p>Typ: ${data.types.map(type => type.type.name).join(', ')}</p>
                `;
                pokemonCard.setAttribute('onclick', `showPokemonDetails(${index + offset}, ${JSON.stringify(data)})`);
                pokemonContainer.appendChild(pokemonCard);
            });
    });
}

function convertWeightToKg(weight) {
    return weight / 10; 
}

function convertHeightToCm(height) {
    return height * 10; 
}

function createPokemonDetailsHTML(pokemon) {
    return `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Typ: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
}

function createPokemonInfoHTML(pokemon) {
    const weightInKg = convertWeightToKg(pokemon.weight);
    const heightInCm = convertHeightToCm(pokemon.height);
    return `
        <p>Height: ${heightInCm} cm</p>
        <p>Weight: ${weightInKg} kg</p>
    `;
}

function showPokemonDetails(index, pokemon) {
    currentPokemonIndex = index;
    document.getElementById('pokemonDetails').innerHTML = createPokemonDetailsHTML(pokemon);
    document.getElementById('pokemonInfoContainer').innerHTML = createPokemonInfoHTML(pokemon);
    document.getElementById('statsChartContainer').style.display = "none";
    document.getElementById('pokemonInfoContainer').style.display = "none";
    setCurrentPokemon(pokemon);
    document.getElementById('pokemonModal').style.display = 'flex';
}



function toggleInfo() {
    const pokemonInfoContainer = document.getElementById('pokemonInfoContainer');
    if (pokemonInfoContainer.style.display === "none") {
        pokemonInfoContainer.style.display = "block";
    } else {
        pokemonInfoContainer.style.display = "none";
    }
}


function hidePokemonDetails() {
    document.getElementById('pokemonModal').style.display = 'none';
    currentPokemonIndex = null;
}

function loadMorePokemons() {
    offset += limit;
    fetchPokemons(offset, limit);
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const pokemonContainer = document.getElementById('pokemonContainer');
    const filteredPokemons = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchInput));
    pokemonContainer.innerHTML = '';
    displayPokemons(filteredPokemons);
}

function navigatePokemon(direction) {
    if (currentPokemonIndex !== null) {
        const newIndex = currentPokemonIndex + direction;
        if (newIndex >= 0 && newIndex < allPokemons.length) {
            fetch(allPokemons[newIndex].url)
                .then(response => response.json())
                .then(data => {
                    showPokemonDetails(newIndex, data);
                });
        }
    }
}

function handleModalClick(event) {
    if (event.target === document.getElementById('pokemonModal')) {
        hidePokemonDetails();
    }
}

function setCurrentPokemon(pokemon) {
    currentPokemon = pokemon;
}

function getCurrentPokemon() {
    return currentPokemon;
}

function createStatsChart() {
    const pokemon = getCurrentPokemon(); 
    if (!pokemon || !pokemon.stats || pokemon.stats.length < 3) {
        console.error("Pokemon data missing or incomplete");
        return;
    }
    
    const hp = pokemon.stats[0].base_stat;
    const attack = pokemon.stats[1].base_stat;
    const defense = pokemon.stats[2].base_stat;

    const statsChartContainer = document.getElementById('statsChartContainer');
    if (!statsChartContainer) {
        console.error("Statscontainer not found");
        return;
    }

    const svgContent = generateSVGContent(hp, attack, defense);
    statsChartContainer.innerHTML = svgContent;
}

function generateSVGContent(hp, attack, defense) {
    const maxStat = 150;  
    const svgWidth = 300;
    const svgHeight = 200;
    const barHeight = 30; 
    const barSpacing = 20;  

    const hpWidth = (hp / maxStat) * svgWidth;
    const attackWidth = (attack / maxStat) * svgWidth;
    const defenseWidth = (defense / maxStat) * svgWidth;

    const hpY = 20;
    const attackY = hpY + barHeight + barSpacing;
    const defenseY = attackY + barHeight + barSpacing;

    return `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <!-- HP Balken -->
            <rect x="0" y="${hpY}" width="${hpWidth}" height="${barHeight}" fill="rgba(255, 99, 132, 1)"/>
            <text x="${hpWidth + 10}" y="${hpY + barHeight / 2}" text-anchor="start" fill="white" font-size="14px" dominant-baseline="middle">HP: ${hp}</text>
            
            <!-- Attack Balken -->
            <rect x="0" y="${attackY}" width="${attackWidth}" height="${barHeight}" fill="rgba(54, 162, 235, 1)"/>
            <text x="${attackWidth + 10}" y="${attackY + barHeight / 2}" text-anchor="start" fill="white" font-size="14px" dominant-baseline="middle">Attack: ${attack}</text>
            
            <!-- Defense Balken -->
            <rect x="0" y="${defenseY}" width="${defenseWidth}" height="${barHeight}" fill="rgba(75, 192, 192, 1)"/>
            <text x="${defenseWidth + 10}" y="${defenseY + barHeight / 2}" text-anchor="start" fill="white" font-size="14px" dominant-baseline="middle">Defense: ${defense}</text>
        </svg>
    `;
}

function toggleStatsChart() {
    const statsChartContainer = document.getElementById('statsChartContainer');
    if (!statsChartContainer) {
        return;
    }

    if (statsChartContainer.style.display === "none") {
        statsChartContainer.style.display = "block";
        createStatsChart();
    } else {
        statsChartContainer.style.display = "none";
    }
}

fetchPokemons(offset, limit);