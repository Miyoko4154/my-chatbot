const fetch = require('node-fetch');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("API klíč z prostředí:", OPENAI_API_KEY);

exports.handler = async function (event, context) {
  if (!OPENAI_API_KEY) {
    console.error("API klíč není nastaven. Ukončení funkce.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API klíč není nastaven." }),
    };
  }

  try {
    const userMessage = JSON.parse(event.body).message;
    console.log("Zpráva od uživatele:", userMessage);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-16k',
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 100
      }),
    });

    // Získej odpověď jako text
    const responseText = await response.text();
    console.log("Odpověď jako text:", responseText);

    // Kontrola, zda odpověď není prázdná nebo ve špatném formátu
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
      console.error("Chyba při parsování JSON:", error.message, "Odpověď: ", responseText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Interní chyba serveru: Neplatná odpověď z OpenAI API. Odpověď: " + responseText }),
      };
    }

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
