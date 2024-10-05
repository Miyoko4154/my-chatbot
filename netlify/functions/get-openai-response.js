const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const userMessage = JSON.parse(event.body).message;

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

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: data.choices[0].message.content }),
  };
};
