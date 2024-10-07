// Import knihovny pro volání API
const fetch = require('node-fetch');

// Načtení API klíče z proměnné prostředí
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ladicí výpis pro kontrolu načteného klíče
console.log("OPENAI_API_KEY je nastaven na:", OPENAI_API_KEY);

exports.handler = async function (event, context) {
  if (!OPENAI_API_KEY) {
    console.error("API klíč není nastaven. Ukončení funkce.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API klíč není nastaven." }),
    };
  }

  try {
    // Načtení zprávy od uživatele z těla požadavku
    const userMessage = JSON.parse(event.body).message;
    console.log("Zpráva od uživatele:", userMessage);

    // Odeslání požadavku do OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    // Ověření stavu odpovědi
    if (!response.ok) {
      console.error("Chyba při volání API:", response.status, response.statusText);
      const errorMessage = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    // Zpracování odpovědi z OpenAI API
    const data = await response.json();
    console.log("Odpověď z OpenAI API:", data);

    // Vrácení odpovědi ve formátu JSON
    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Chyba při zpracování požadavku:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Interní chyba serveru: " + error.message }),
    };
  }
};
