const modelSelect = document.getElementById("model-select");
const OPENAI_API_KEY = document.getElementById("api-key");
const form = document.getElementById("ai-form");
const API_URL = "https://api.openai.com/v1/chat/completions";


const fetchApi = async () => {
  const key = OPENAI_API_KEY.value.trim();
  const inputUser = form.querySelector("textarea").value.trim();
  const modelSelectValue = modelSelect.value;

  if (!key || !inputUser) {
    alert("API key e mensagem são obrigatórios.");
    return;
  }
  if (!key || key.includes(" ") || key.length < 20) {
    alert("API Key inválida. Verifique e tente novamente.");
    return;
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: modelSelectValue,
      messages: [
        {
          role: "user",
          content: inputUser,
        },
      ],
      max_tokens: 100,
    }),
  });
  const data = await response.json();
  if (data.error) {
    alert(data.error.message);
  }
  console.log(data.choices[0].message.content.trim());
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchApi();
});
