const modelSelect = document.getElementById("model-select");
const OPENAI_API_KEY = document.getElementById("api-key");
const form = document.getElementById("ai-form");
const responseBox = document.getElementById("response-box");
const API_URL = "https://api.openai.com/v1/chat/completions";

const toast = (message, color) => {
  return Toastify({
    text: message,
    duration: 3000,
    close: true,
    style: {
      background: color,
    },
  }).showToast();
};

const fetchApi = async () => {
  const key = OPENAI_API_KEY.value.trim();
  const inputUser = form.querySelector("textarea").value.trim();
  const modelSelectValue = modelSelect.value;

  if (!key || key.includes(" ") || key.length < 20) {
    toast("API Key inválida. Verifique e tente novamente.", "#f84c4cff");
    return;
  }
  responseBox.innerHTML = "<span class='loader'></span>";

  try {
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
      toast(data.error.message || "Erro na API", "#f84c4cff");
      responseBox.innerHTML = "Erro ao buscar resposta.";
      return;
    }

    if (data.choices && data.choices.length > 0) {
      responseBox.innerHTML = data.choices[0].message.content.trim();
    } else {
      responseBox.innerHTML = "Nenhuma resposta gerada.";
    }
  } catch (error) {
    toast(error, "#f84c4cff");
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchApi();
});
