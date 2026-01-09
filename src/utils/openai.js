export const sendMessageToOpenAI = async (messages, settings) => {
  const { apiKey, model, temperature, maxTokens } = settings

  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: apiMessages,
      temperature: temperature,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to get response from OpenAI')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

