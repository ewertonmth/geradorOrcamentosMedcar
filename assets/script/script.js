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

        // Verifica se o CNPJ tem exatamente 14 números
        const cnpjRaw = document.getElementById('cnpj_cliente').value;
        const cnpj = cnpjRaw.replace(/\D/g, '');

        if (cnpj.length !== 14) {
            alert("O CNPJ deve conter exatamente 14 dígitos numéricos.");
        return;}
        // (continua normalmente se estiver válido...)

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
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Logotipo no topo
        doc.addImage(logoBase64, 'PNG', 160, 10, 30, 30);

        // Cabeçalho do orçamento
        doc.setFontSize(16);
        doc.text("Orçamento de Serviços", 20, 20);

        doc.setFontSize(12);

        const id = document.getElementById('orcamento-id').textContent;
        const nome = document.getElementById('nome_cliente').value;
        const cnpjRaw = document.getElementById('cnpj_cliente').value;
        const telefone = document.getElementById('telefone_cliente').value;
        const totalGeral = document.getElementById('total-geral').textContent;

        // Formatar CNPJ
        const cnpjNumeros = cnpjRaw.replace(/\D/g, '');
        let cnpj = cnpjNumeros;
        if (cnpj.length === 14) {
            cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }

        // Escrevendo os dados com alinhamento e estilo
        doc.setFont("helvetica", "bold");
        doc.text("ID do Orçamento:", 20, 30);
        doc.setFont("helvetica", "normal");
        doc.text(id, 70, 30);

        doc.setFont("helvetica", "bold");
        doc.text("Nome:", 20, 40);
        doc.setFont("helvetica", "normal");
        doc.text(nome || "-", 70, 40);

        doc.setFont("helvetica", "bold");
        doc.text("CNPJ:", 20, 50);
        doc.setFont("helvetica", "normal");
        doc.text(cnpj || "-", 70, 50);

        doc.setFont("helvetica", "bold");
        doc.text("Telefone:", 20, 60);
        doc.setFont("helvetica", "normal");
        doc.text(telefone || "-", 70, 60);

        // Linha horizontal divisória
        doc.line(20, 70, 190, 70);


        // Construir dados da tabela
        const colunas = ["Item", "Qtd", "V. Unitário", "Total"];
        const linhasTabela = [];

        const linhas = document.querySelectorAll('#corpo-tabela tr');
        linhas.forEach(function (linha) {
            const colunasLinha = linha.querySelectorAll('td');
            const item = colunasLinha[0].textContent;
            const qtd = colunasLinha[1].textContent;
            const valorUnit = colunasLinha[2].textContent;
            const total = colunasLinha[3].textContent;

            linhasTabela.push([item, qtd, valorUnit, total]);
        });

        // Gerar tabela com AutoTable
        doc.autoTable({
            head: [colunas],
            body: linhasTabela,
            startY: 75,
            theme: 'grid',
            styles: {
            fontSize: 10,
            cellPadding: 3,
            },
            headStyles: {
            fillColor: [0, 123, 255], // azul
            textColor: 255,
            halign: 'center',
            },
            bodyStyles: {
            halign: 'center',
            }
        });

        // Total geral destacado após a tabela
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setDrawColor(0);
        doc.setFillColor(240, 240, 240);
        doc.rect(20, finalY - 6, 80, 8, 'F'); // retângulo de fundo
        doc.setFont("helvetica", "bold");
        doc.text(totalGeral, 22, finalY);

        // Salvar PDF
        doc.save(`orcamento_${id.replace(/\D/g, "")}.pdf`);
        });
