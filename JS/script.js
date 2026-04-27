const form = document.getElementById('form');
const lista = document.getElementById('lista');

let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

function render() {
  lista.innerHTML = '';
  agendamentos.forEach((a, index) => {
    const li = document.createElement('li');
    li.className = "border p-2 mb-2 flex justify-between";
    li.innerHTML = `
      <div>
        <strong>${a.cliente}</strong> - ${a.servico}<br>
        ${a.data} às ${a.hora}
      </div>
      <button onclick="remover(${index})" class="text-red-500">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const novo = {
    cliente: document.getElementById('cliente').value,
    servico: document.getElementById('servico').value,
    data: document.getElementById('data').value,
    hora: document.getElementById('hora').value
  };

  agendamentos.push(novo);
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
  form.reset();
  render();
});

function remover(index) {
  agendamentos.splice(index, 1);
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
  render();
}

render();