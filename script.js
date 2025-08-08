const modelSelect = document.getElementById("model-select");
const OPENAI_API_KEY = document.getElementById("api-key");
const form = document.getElementById("ai-form");
const responseBox = document.getElementById("response-box");
const copyBtn = document.getElementById("copy-btn");
const copyContainer = document.getElementById("copy-container");
const historyList = document.getElementById("history-list");
const API_URL = "https://api.openai.com/v1/chat/completions";

const toast = (message, color) => {
  return Toastify({
    text: message,
    duration: 3000,
    close: true,
    style: { background: color },
  }).showToast();
};

// ***Carregar API Key, modelo e histórico
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("apiKey"))
    OPENAI_API_KEY.value = localStorage.getItem("apiKey");
  if (localStorage.getItem("model"))
    modelSelect.value = localStorage.getItem("model");
  carregarHistorico();
});

// ***Salvar histórico no localStorage
const salvarHistorico = (pergunta, resposta) => {
  let historico = JSON.parse(localStorage.getItem("historico")) || [];
  historico.unshift({ pergunta, resposta });
  localStorage.setItem("historico", JSON.stringify(historico.slice(0, 10)));
  carregarHistorico();
};

//***/ Carregar histórico da memória
const carregarHistorico = () => {
  historyList.innerHTML = "";
  let historico = JSON.parse(localStorage.getItem("historico")) || [];
  historico.forEach((item) => {
    let li = document.createElement("li");
    li.textContent = `P: ${item.pergunta} | R: ${item.resposta}`;
    historyList.appendChild(li);
  });
};

//***/ Chamada à API
const fetchApi = async () => {
  const key = OPENAI_API_KEY.value.trim();
  const inputUser = form.querySelector("textarea").value.trim();
  const modelSelectValue = modelSelect.value;

  if (!key || key.includes(" ") || key.length < 20) {
    toast("API Key inválida. Verifique e tente novamente.", "#f84c4cff");
    return;
  }

  // ***Salvar chave e modelo
  localStorage.setItem("apiKey", key);
  localStorage.setItem("model", modelSelectValue);

  // **
  responseBox.innerHTML = "<span class='loader'></span>";
  responseBox.style.display = "flex";
  responseBox.style.alignItems = "center";
  responseBox.style.justifyContent = "center";
  copyContainer.style.display = "none";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: modelSelectValue,
        messages: [{ role: "user", content: inputUser }],
      }),
    });
    const data = await response.json();

    if (data.error) {
      toast(data.error.message || "Erro na API", "#f84c4cff");
      responseBox.innerHTML = "Erro ao buscar resposta.";
      return;
    }

    if (data.choices && data.choices.length > 0) {
      const resposta = data.choices[0].message.content.trim();
      responseBox.innerHTML = `<div>${resposta}</div>`;
      salvarHistorico(inputUser, resposta);
      copyContainer.style.display = "block";
    } else {
      responseBox.innerHTML = "Nenhuma resposta gerada.";
    }
  } catch (error) {
    toast(error.message, "#f84c4cff");
  }
};

// ***Envio do formulário
form.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchApi();
});

// ***Copiar resposta para clipboard
copyBtn.addEventListener("click", async () => {
  try {
    const textToCopy = responseBox.innerText;
    await navigator.clipboard.writeText(textToCopy);
    toast("Resposta copiada para a área de transferência!", "#4caf50");
  } catch (err) {
    toast("Erro ao copiar resposta.", "#f84c4cff");
  }
});
