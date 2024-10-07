// Import knihovny 'node-fetch' pro volání API
const fetch = require('node-fetch');

// Načtení API klíče z proměnné prostředí
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Exportování funkce handleru, kterou volá Netlify
exports.handler = async function (event, context) {
  // Kontrola, zda je API klíč správně načten
  console.log("Načtený API klíč z proměnné prostředí:", OPENAI_API_KEY);

  // Pokud není klíč nastaven, vrátí chybu
  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API klíč není nastaven." }),
    };
  }

  try {
    // Načtení zprávy od uživatele z těla požadavku
    const userMessage = JSON.parse(event.body).message;

    // Odeslání požadavku na OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`  // Použití API klíče z proměnné prostředí
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',  // Použití modelu GPT-3.5
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    // Pokud odpověď není úspěšná, vrátí chybu
    if (!response.ok) {
      const errorMessage = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    // Načtení odpovědi z API do JSON formátu
    const data = await response.json();

    // Vrátí odpověď ve formátu JSON
    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content }),
    };
  } catch (error) {
    // Chyba při volání API
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Interní chyba serveru: " + error.message }),
    };
  }
};
