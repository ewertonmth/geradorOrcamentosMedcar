 const form = document.getElementById('form-itens');

    // Funções 
    function atualizarTotalGeral(){
    let total = 0;
    const linhas = document.querySelectorAll('#corpo-tabela tr');

    linhas.forEach(function(linha){
        const valorTexto = linha.children[3].textContent; // Ex: "R$ 120.00"
        const numero = parseFloat(valorTexto.replace('R$ ', '').replace(',', '.'));
        total += numero;
    });

    document.getElementById('total-geral').textContent = `Total Geral: R$ ${total.toFixed(2)}`;
    }

    function gerarIDOrcamento(){
        const agora = new Date();

        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        const hora = String(agora.getHours()).padStart(2, "0");
        const minuto = String(agora.getMinutes()).padStart(2, "0");
        const segundo = String(agora.getSeconds()).padStart(2, "0");

        return `${ano}${mes}${hora}${minuto}${segundo}`;
    }

    const idOrcamento = gerarIDOrcamento();
    document.getElementById('orcamento-id').textContent = `ID do Orçamento: ${idOrcamento}`;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Captura dos valores
        const nome = document.getElementById('nome_item').value;
        const quantidade = document.getElementById('quantidade_item').value;
        const valor = document.getElementById('valor_item').value;
        // Cálculo do total
        const total =  parseInt(quantidade) * parseFloat(valor);

        // Criação da linha
        const novaLinha = `
        <tr>
            <td>${nome}</td>
            <td>${quantidade}</td>
            <td>R$ ${parseFloat(valor).toFixed(2)}</td>
            <td>R$ ${total.toFixed(2)}</td>
            <td><button class="remover">Excluir</button></td>
            </tr>
        `;
            
        // Inserção do botão excluir na tabela
        document.getElementById('corpo-tabela').innerHTML += novaLinha;

        // Seleciona todos os botões de excluir
        const botoesRemover = document.querySelectorAll('.remover');

        botoesRemover.forEach(function(botao) {
            botao.addEventListener('click', function(){
                this.parentElement.parentElement.remove();
                atualizarTotalGeral(); // atualiza o total geral ao remover
            });
        });

        atualizarTotalGeral();

        // Limpar os campos
        document.getElementById('nome_item').value = "";
        document.getElementById('quantidade_item').value = "";
        document.getElementById('valor_item').value = "";
    });


    // Gerar PDF
    document.getElementById('btn-pdf').addEventListener('click', async function () {
        const {jsPDF} = window.jspdf;
        const doc = new jsPDF();

        // Dados do orçamento
        const id = document.getElementById('orcamento-id').textContent;
        const nome = document.getElementById('nome_cliente').value;
        const cnpj = document.getElementById('cnpj_cliente').value;
        const telefone = document.getElementById('telefone_cliente').value;
        const totalGeral = document.getElementById('total-geral').textContent;

        // Cabeçalho
        doc.setFontSize(16);
        doc.text("Orçamento de Serviços", 20, 20);
        doc.setFontSize(12);
        doc.text(id, 20, 30);
        doc.text(`Nome: ${nome}`, 20, 40);
        doc.text(`CNPJ: ${cnpj}`, 20, 50);
        doc.text(`Telefone: ${telefone}`, 20, 60);

        // Tabela de itens
        let y = 75;
        doc.text("Itens:", 20, y);
        
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Item", 20, y);
        doc.text("Qtd", 80, y);
        doc.text("V. Unitário", 110, y);
        doc.text("Total", 160, y);
        doc.setFont("helvetica", "normal");

        const linhas = document.querySelectorAll('#corpo-tabela tr');
        linhas.forEach(function (linha) {
            const colunas = linha.querySelectorAll('td');
            const item = colunas[0].textContent;
            const qtd = colunas[1].textContent;
            const valorUnit = colunas[2].textContent;
            const total = colunas[3].textContent;

            y += 10;
            doc.text(item, 20, y);
            doc.text(qtd, 80, y);
            doc.text(valorUnit, 110, y);
            doc.text(total, 160, y);
        });

        y += 15;
        doc.setFont("helvetica", "bold");
        doc.text(totalGeral, 20, y);

        // Salvar PDF
        doc.save(`orcamento_${id.replace(/\D/g, "")}.pdf`);
    })