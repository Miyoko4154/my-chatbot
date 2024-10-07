// Import knihovny pro volání API
const fetch = require('node-fetch');  // Ujisti se, že máš nainstalovanou knihovnu `node-fetch`

// Načtení API klíče z proměnné prostředí v Netlify
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ladicí výpis pro kontrolu načteného klíče
console.log("API klíč z prostředí:", OPENAI_API_KEY);

exports.handler = async function (event, context) {
  // Ověření, zda je API klíč načten správně
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
        'Authorization': `Bearer ${OPENAI_API_KEY}`  // Použití API klíče z proměnné prostředí
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    // Ověření stavu odpovědi před jejím zpracováním
    const responseText = await response.text();  // Získej odpověď jako text
    console.log("Odpověď jako text:", responseText);  // Ladicí výpis odpovědi jako text

    if (!response.ok || !responseText) {
      console.error("Chyba při volání API:", response.status, response.statusText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Chyba při volání OpenAI API: " + response.statusText }),
      };
    }

    // Pokus o parsování JSON odpovědi
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Chyba při parsování JSON:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Neplatná odpověď z OpenAI API: " + error.message }),
      };
    }

    // Vrácení odpovědi ve formátu JSON
    console.log("Zpracovaná odpověď z OpenAI API:", data);
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
