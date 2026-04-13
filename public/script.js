let usuarios = [];
    let tarefas = [];
    
    function carregarDados() {
        const usuariosSalvos = localStorage.getItem('saep_usuarios');
        const tarefasSalvas = localStorage.getItem('saep_tarefas');
        
        if (usuariosSalvos) usuarios = JSON.parse(usuariosSalvos);
        if (tarefasSalvas) tarefas = JSON.parse(tarefasSalvas);
    }
    
    function salvarDados() {
        localStorage.setItem('saep_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('saep_tarefas', JSON.stringify(tarefas));
    }
    
    function irPara(pagina) {
        document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativo'));
        document.getElementById(`pagina-${pagina}`).classList.add('ativo');
        
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('ativo'));
        
        const botoes = document.querySelectorAll('nav button');
        for (let btn of botoes) {
            if (btn.getAttribute('onclick') === `irPara('${pagina}')`) {
                btn.classList.add('ativo');
                break;
            }
        }
    
        if (pagina === 'tarefas') renderizarKanban();
    }
    
    function salvarUsuario() {
        const nome = document.getElementById('u-nome').value.trim();
        const email = document.getElementById('u-email').value.trim();
        
        const msgOk = document.getElementById('msg-usuario-ok');
        const msgErro = document.getElementById('msg-usuario-erro');
        
        if (!nome || !email) {
            msgErro.textContent = "Nome e e-mail são obrigatórios!";
            msgErro.style.display = 'block';
            msgOk.style.display = 'none';
            return;
        }
        
        const novoUsuario = {
            id: Date.now(),
            nome: nome,
            email: email
        };
        
        usuarios.push(novoUsuario);
        salvarDados();
        renderizarListaUsuarios();
        
        document.getElementById('u-nome').value = '';
        document.getElementById('u-email').value = '';
        
        msgOk.style.display = 'block';
        msgErro.style.display = 'none';
        
        setTimeout(() => msgOk.style.display = 'none', 3000);
    }
    
    function renderizarListaUsuarios() {
        const tbody = document.getElementById('lista-usuarios');
        tbody.innerHTML = '';
        
        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-excluir" onclick="excluirUsuario(${user.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    function excluirUsuario(id) {
        if (confirm('Excluir este usuário?')) {
            usuarios = usuarios.filter(u => u.id !== id);
            salvarDados();
            renderizarListaUsuarios();
        }
    }
    
    function salvarTarefa() {
        const id = document.getElementById('t-id').value;
        const desc = document.getElementById('t-desc').value.trim();
        const usuarioId = document.getElementById('t-usuario').value;
        const setor = document.getElementById('t-setor').value.trim();
        const prioridade = document.getElementById('t-prioridade').value;
        const status = document.getElementById('t-status').value;
        
        const msgOk = document.getElementById('msg-tarefa-ok');
        const msgErro = document.getElementById('msg-tarefa-erro');
        
        if (!desc || !usuarioId || !prioridade) {
            msgErro.textContent = "Descrição, usuário e prioridade são obrigatórios!";
            msgErro.style.display = 'block';
            msgOk.style.display = 'none';
            return;
        }
        
        if (id) {
            // Edição
            const tarefa = tarefas.find(t => t.id == id);
            if (tarefa) {
                tarefa.desc = desc;
                tarefa.usuarioId = parseInt(usuarioId);
                tarefa.setor = setor;
                tarefa.prioridade = prioridade;
                tarefa.status = status;
            }
        } else {
            // Nova tarefa
            const novaTarefa = {
                id: Date.now(),
                desc: desc,
                usuarioId: parseInt(usuarioId),
                setor: setor,
                prioridade: prioridade,
                status: status
            };
            tarefas.push(novaTarefa);
        }
        
        salvarDados();
        renderizarKanban();
        limparFormTarefa();
        
        msgOk.style.display = 'block';
        msgErro.style.display = 'none';
        
        setTimeout(() => msgOk.style.display = 'none', 2500);
    }
    
    function limparFormTarefa() {
        document.getElementById('t-id').value = '';
        document.getElementById('t-desc').value = '';
        document.getElementById('t-usuario').value = '';
        document.getElementById('t-setor').value = '';
        document.getElementById('t-prioridade').value = '';
        document.getElementById('t-status').value = 'a fazer';
        document.getElementById('titulo-form-tarefa').textContent = 'Cadastro de Tarefa';
    }
    
    function renderizarKanban() {
        const colunas = {
            'a fazer': document.getElementById('cards-afazer'),
            'fazendo': document.getElementById('cards-fazendo'),
            'pronto': document.getElementById('cards-pronto')
        };
        
        // Limpar colunas
        Object.values(colunas).forEach(col => col.innerHTML = '');
        
        const counts = { 'a fazer': 0, 'fazendo': 0, 'pronto': 0 };
        
        tarefas.forEach(tarefa => {
            const usuario = usuarios.find(u => u.id === tarefa.usuarioId);
            const nomeUsuario = usuario ? usuario.nome : 'Usuário não encontrado';
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-desc">${tarefa.desc}</div>
                <div class="card-info"><strong>Responsável:</strong> ${nomeUsuario}</div>
                <div class="card-info"><strong>Setor:</strong> ${tarefa.setor || '-'}</div>
                <span class="prioridade p-${tarefa.prioridade}">${tarefa.prioridade.toUpperCase()}</span>
                
                <div class="card-acoes">
                    <select onchange="mudarStatus(${tarefa.id}, this.value)">
                        <option value="a fazer" ${tarefa.status === 'a fazer' ? 'selected' : ''}>A Fazer</option>
                        <option value="fazendo" ${tarefa.status === 'fazendo' ? 'selected' : ''}>Fazendo</option>
                        <option value="pronto" ${tarefa.status === 'pronto' ? 'selected' : ''}>Pronto</option>
                    </select>
                    <button class="btn btn-editar" onclick="editarTarefa(${tarefa.id})">✏️</button>
                    <button class="btn btn-excluir" onclick="confirmarExclusao(${tarefa.id})">🗑️</button>
                </div>
            `;
            
            colunas[tarefa.status].appendChild(card);
            counts[tarefa.status]++;
        });
        
        document.getElementById('count-afazer').textContent = counts['a fazer'];
        document.getElementById('count-fazendo').textContent = counts['fazendo'];
        document.getElementById('count-pronto').textContent = counts['pronto'];
    }
    
    function mudarStatus(id, novoStatus) {
        const tarefa = tarefas.find(t => t.id === id);
        if (tarefa) {
            tarefa.status = novoStatus;
            salvarDados();
            renderizarKanban();
        }
    }
    
    function editarTarefa(id) {
        const tarefa = tarefas.find(t => t.id === id);
        if (!tarefa) return;
        
        document.getElementById('me-id').value = tarefa.id;
        document.getElementById('me-desc').value = tarefa.desc;
        document.getElementById('me-setor').value = tarefa.setor || '';
        document.getElementById('me-prioridade').value = tarefa.prioridade;
        document.getElementById('me-status').value = tarefa.status;
        
        const select = document.getElementById('me-usuario');
        select.innerHTML = '<option value="">Selecione um usuário...</option>';
        usuarios.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user.id;
            opt.textContent = user.nome;
            if (user.id === tarefa.usuarioId) opt.selected = true;
            select.appendChild(opt);
        });
        
        document.getElementById('modal-editar').classList.add('aberto');
    }
    
    function atualizarTarefa() {
        const id = parseInt(document.getElementById('me-id').value);
        const tarefa = tarefas.find(t => t.id === id);
        
        if (tarefa) {
            tarefa.desc = document.getElementById('me-desc').value.trim();
            tarefa.usuarioId = parseInt(document.getElementById('me-usuario').value);
            tarefa.setor = document.getElementById('me-setor').value.trim();
            tarefa.prioridade = document.getElementById('me-prioridade').value;
            tarefa.status = document.getElementById('me-status').value;
            
            salvarDados();
            fecharModal('modal-editar');
            renderizarKanban();
        }
    }
    
    function confirmarExclusao(id) {
        document.getElementById('id-excluir').value = id;
        document.getElementById('modal-confirmar').classList.add('aberto');
    }
    
    function excluirTarefa() {
        const id = parseInt(document.getElementById('id-excluir').value);
        tarefas = tarefas.filter(t => t.id !== id);
        salvarDados();
        fecharModal('modal-confirmar');
        renderizarKanban();
    }
    
    function fecharModal(modalId) {
        document.getElementById(modalId).classList.remove('aberto');
    }
    
    function preencherSelectUsuarios() {
        const selects = ['t-usuario', 'me-usuario'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione um usuário...</option>';
            usuarios.forEach(user => {
                const opt = document.createElement('option');
                opt.value = user.id;
                opt.textContent = user.nome;
                select.appendChild(opt);
            });
        });
    }
    
    window.onload = function() {
        carregarDados();
        renderizarListaUsuarios();
        preencherSelectUsuarios();
        renderizarKanban();
        
        document.querySelectorAll('.modal-fundo').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('aberto');
                }
            });
        });
    };