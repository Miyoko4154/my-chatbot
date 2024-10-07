// Importuje 'node-fetch' pro volání API
const fetch = require('node-fetch');

// Definice serverless funkce
exports.handler = async function (event, context) {
  // Načte API klíč z proměnné prostředí
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Pokud API klíč není definován, vrátí chybu
  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API klíč není nastaven." }),
    };
  }

  try {
    // Získá uživatelský vstup ze zprávy (z frontendového formuláře)
    const userMessage = JSON.parse(event.body).message;

    // Volání OpenAI API s uživatelskou zprávou
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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

    // Převede odpověď API na JSON
    const data = await response.json();

    // Vrátí odpověď ve formátu JSON
    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content }),
    };
  } catch (error) {
    // Pokud nastane chyba, vrátí chybovou zprávu
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Interní chyba serveru: " + error.message }),
    };
  }
};
