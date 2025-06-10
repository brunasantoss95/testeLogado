import { restoreSession } from '../helpers/helper.js'
import { format } from 'date-fns'

describe('Compra de passagem de ônibus', () => {
    before(async () => {
        await restoreSession()
    })

    it('Deve realizar uma compra completa', async () => {
        // -- 1. Acessar página de busca
        await browser.url('https://url-de-teste/Login')
        await browser.execute(() => console.log('== Iniciando teste de compra de passagem =='))

        // -- 2. Origem e destino
        await browser.execute(() => console.log('Iniciando preenchimento de origem e destino'))

        // Campo origem
        await browser.execute(() => console.log('Campo de origem está visível'))
        const origem = await $('#txtOrigem')
        await origem.waitForDisplayed()
        await origem.click()
        await origem.setValue('Porto Alegre')
        await browser.keys('Enter')
        await browser.execute(() => console.log('Cidade origem "Porto Alegre" selecionada'))

        // Campo destino
        const destinos = ['Santa Rosa', 'Santo Ângelo', 'Soledade', 'Santana do Livramento'];
        const destinoAleatorio = destinos[Math.floor(Math.random() * destinos.length)];

        await browser.execute(() => console.log('Campo de destino está visível'))
        const campoDestino = await $('#txtDestino');
        await campoDestino.waitForDisplayed({ timeout: 5000 });
        await campoDestino.click();
        await campoDestino.setValue(destinoAleatorio);

        await browser.pause(1000); // Aguarda sugestões de autocomplete
        await browser.keys(['ArrowDown', 'Enter']);
        await browser.execute((dest) => console.log(`Cidade destino "${dest}" selecionada`), destinoAleatorio)

        await $('.loadingPersonalizado').waitForDisplayed({ reverse: true, timeout: 5000 });

        // -- 3. Selecionar data 
        const hojeMais5 = new Date()
        hojeMais5.setDate(hojeMais5.getDate() + 5)
        const dataFormatada = format(hojeMais5, 'dd/MM/yyyy')
        await browser.execute(data => console.log(`Data de ida calculada: ${data}`), dataFormatada)

        await browser.execute((seletorCampo, valor) => {
            console.log(`Definindo data ${valor} no campo ${seletorCampo}`);
            const campo = document.querySelector(seletorCampo);
            campo.value = valor;
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            campo.dispatchEvent(new Event('change', { bubbles: true }));
        }, '#txtDataIda', dataFormatada);

        await browser.pause(1000);

        const valorDefinido = await $('#txtDataIda').getValue(); // Verifica se o valor foi definido corretamente
        await browser.execute((esperado, obtido) => {
            if (esperado === obtido) {
                console.log(`Data definida corretamente: ${obtido}`);
            } else {
                console.error(`Data incorreta! Esperado: ${esperado}, Obtido: ${obtido}`);
            }
        }, dataFormatada, valorDefinido); // Se precisar,clique fora do campo para garantir que o calendário feche

        await $('body').click();
        await browser.execute(() => console.log('Clicado fora para fechar o calendário'))

        // -- 4. Clicar em buscar
        const btnPesquisa = await $('#btnPesquisa')
        await btnPesquisa.waitForClickable()
        await btnPesquisa.click()
        await browser.execute(() => console.log('Botão "Buscar" clicado — buscando horários disponíveis'))

        // -- 5. Selecionar um horário aleatório
        await browser.waitUntil(async () => {
            const visiveis = await $$('tr.cardHorario.row:not([style*="display: none"])');
            return visiveis.length > 0;
        }, {
            timeout: 10000,
            timeoutMsg: 'Nenhum horário disponível encontrado após 10 segundos'
        });

        const horariosDisponiveis = await $$('tr.cardHorario.row:not([style*="display: none"])');

        const indiceAleatorio = Math.floor(Math.random() * horariosDisponiveis.length);
        const horarioSelecionado = horariosDisponiveis[indiceAleatorio];

        await horarioSelecionado.scrollIntoView({ block: 'center' });
        await horarioSelecionado.waitForDisplayed({ timeout: 5000 });

        const horarioId = await horarioSelecionado.getAttribute('id');

        const numeroIda = horarioId.replace(/\D/g, '');

        // -- 6. Botão selecionar horário
        const seletorBotao = `#btnCarregaMapa-${numeroIda}`; //Monta dinamicamente o botão correto (ex:#btnCarregaMapa-3)
        const botaoSelecionarHorario = await $(seletorBotao);

        await botaoSelecionarHorario.waitForClickable({ timeout: 5000 });
        await botaoSelecionarHorario.click();

        await browser.execute((indice, seletor) => {
            console.log(`Horário aleatório selecionado. Índice: ${indice}, Botão: ${seletor}`);
        }, indiceAleatorio, seletorBotao);

        // -- 7. Selecionar poltrona aleatória com até 5 tentativas
        await browser.execute(() => console.log('Iniciando busca por poltrona livre...'));

        let poltronasLivres = [];
        let tentativas = 0;
        const maxTentativas = 5;

        while (poltronasLivres.length === 0 && tentativas < maxTentativas) {
            await browser.pause(1000); // espera 1 segundo entre tentativas
            poltronasLivres = await $$('.livre');
            tentativas++;

            await browser.execute((tentativa, total) => {
                console.log(`Tentativa ${tentativa}/${total}: procurando poltrona livre...`);
            }, tentativas, maxTentativas);
        }

        if (poltronasLivres.length > 0) {
            const indicePoltrona = Math.floor(Math.random() * poltronasLivres.length);
            await poltronasLivres[indicePoltrona].scrollIntoView();
            await browser.execute((indice) => {
                console.log(`Poltrona livre encontrada! Selecionando poltrona de índice ${indice}`);
            }, indicePoltrona);
            await poltronasLivres[indicePoltrona].click();
        } else {
            await browser.execute(() => console.error('Nenhuma poltrona livre encontrada após 5 tentativas'));
            throw new Error('Falha: nenhuma poltrona livre encontrada após 5 tentativas.');
        }

        // -- 8. Continuar reserva
        await browser.execute(() => console.log('Clicando em "Continuar reserva"'));
        await $('.botaoContinuarMapaPoltrona').click();

        // -- 9. Preencher dados do passageiro
        await browser.execute(() => console.log('Preenchendo dados do passageiro'));
        const passageiro = await $('.nomeDoUsuario');
        await passageiro.waitForDisplayed();
        await passageiro.click();
        await passageiro.setValue('Usuário Teste');

        const tipoDocumento = await $('#tipoDoc-Passageiro-1');
        await tipoDocumento.waitForDisplayed();
        await tipoDocumento.selectByVisibleText('RG');

        const numeroDocumento = await $('#doc-Passageiro-1');
        await numeroDocumento.waitForDisplayed();
        await numeroDocumento.setValue('xxxxxxxx');

        const cpfObrigatorio = await $('#cpf-Passageiro-1');
        await cpfObrigatorio.waitForDisplayed();
        await cpfObrigatorio.setValue('xxxxxxxx'); // mude para o seu CPF

        // -- 10. Selecionar forma de pagamento
        await browser.execute(() => console.log('Selecionando forma de pagamento: Crédito'));
        await $('#span_Crédito').click();

        // -- 11. Preencher dados do cartão
        await browser.execute(() => console.log('Preenchendo dados do cartão'));
        await $('#cartaoNumeroviacaoouroeprata').setValue('xxxxxxxx');
        await $('#ValidadeCartao_Credito').setValue('05/2030');
        await $('#cartaoCodigoSeguranca').setValue('123');
        await $('#cartaoNomeImpresso').setValue('Usuário Teste');
        await $('#CpfTitularCartao').setValue('xxxxxxxx'); // mude para o seu CPF

        // -- 12. Botão pagar
        await browser.execute(() => console.log('Clicando no botão "Pagar"'));
        await $('.botaoComprarCreditoVeppo').click();

        // -- 13. Aguardar mensagem de sucesso
        await browser.waitUntil(async () => {
            const msgs = await $$('.conteinerMsg');
            for (const el of msgs) {
                const visible = await el.isDisplayed();
                const texto = await el.getText();
                if (visible && texto.trim().length > 0) {
                    return true;
                }
            }
            return false;
        }, {
            timeout: 15000,
            timeoutMsg: 'A mensagem de sucesso não apareceu após a finalização da compra'
        });

        const mensagens = await $$('.conteinerMsg');
        let mensagemTexto = '';

        for (const el of mensagens) {
            const visible = await el.isDisplayed();
            const texto = await el.getText();
            if (visible && texto.trim().length > 0) {
                mensagemTexto = texto;
                break;
            }
        }

        await browser.execute((msg) => {
            console.log(`Mensagem final recebida: ${msg}`);
        }, mensagemTexto);

        expect(mensagemTexto).toContain('Nós já disponibilizamos sua(s) passagem(s). Verifique seu e-mail');


        // Pausa para analisar os logs no navegador. Se precisar, descomente a linha abaixo.
        // await browser.pause(30000); // 30 segundos para análise no DevTools
    })
})
