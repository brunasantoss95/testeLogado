import { restoreSession } from '../helpers/helper.js'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'


describe('Compra de passagem de ônibus', () => {
    before(async () => {
        await restoreSession()
    })

    it('Deve realizar uma compra completa', async () => {
        // -- 1. Acessar página de busca
        await browser.url('https://ecommerce-hml-viop.passagensweb.com.br/Principal')
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
        const destino = await $('#txtDestino')
        await destino.waitForDisplayed({timeout: 5000 })
        await browser.execute(() => console.log('Campo de destino está visível'))
        await destino.click()
        await destino.setValue('Santo Ângelo')

        // Pausa curta para aguardar sugestões
        await browser.pause(1000)
        await browser.execute(() => console.log('Aguardando sugestões de autocomplete'))

        // Simula navegação no autocomplete via teclado
        await browser.keys(['ArrowDown', 'Enter'])
        await browser.execute(() => console.log('Cidade destino "Santa Rosa selecionada"'))

        // Espera carregamento sumir (se houver)
        await $('.loadingPersonalizado').waitForDisplayed({ reverse: true, timeout: 5000 })
        await browser.execute(() => console.log('Carregamento finalizado após seleção de destino'))

        // Aguarda carregamento desaparecer (se houver)
        await $('.loadingPersonalizado').waitForDisplayed({ reverse: true, timeout: 5000 })

        // -- 3. Selecionar data 
        const hojeMais5 = new Date()
        hojeMais5.setDate(hojeMais5.getDate() + 5)

        // Formatação da data no padrão brasileiro (DD/MM/YYYY)
        const dataFormatada = format(hojeMais5, 'dd/MM/yyyy')
        await browser.execute(data => console.log(`Data de ida calculada: ${data}`), dataFormatada)

        // Define a data via JS
        await browser.execute((seletorCampo, valor) => {
            console.log(`Definindo data ${valor} no campo ${seletorCampo}`);
            const campo = document.querySelector(seletorCampo);
            campo.value = valor;
            // Dispara um evento input para notificar a mudança
            const evento = new Event('input', { bubbles: true });
            campo.dispatchEvent(evento);
            // Também dispara um evento change
            const eventoChange = new Event('change', { bubbles: true });
            campo.dispatchEvent(eventoChange);
        }, '#txtDataIda', dataFormatada);

        // Aguarda um momento para garantir que a mudança foi processada
        await browser.pause(1000);

        // Verifica se o valor foi definido corretamente
        const valorDefinido = await $('#txtDataIda').getValue();
        await browser.execute((esperado, obtido) => {
            if (esperado === obtido) {
                console.log(`Data definida corretamente: ${obtido}`);
            } else {
                console.error(`Data não corresponde ao esperado. Esperado: ${esperado}, Obtido: ${obtido}`);
            }
        }, dataFormatada, valorDefinido);
        // Se precisar, clique fora do campo para garantir que o calendário feche
        await $('body').click();
        await browser.execute(() => console.log('Clicado fora para fechar o calendário'));

        // -- 4. Clicar em buscar
        const btnPesquisa = await $('#btnPesquisa')
        await btnPesquisa.waitForClickable()
        await btnPesquisa.click()
        await browser.execute(() => console.log('Botão "Buscar" clicado — buscando horários disponíveis'))

        // -- 5. Aguardar e selecionar o primeiro horário
        await browser.waitUntil(async () => {
            return await $$('#divHorarios .horarioPartida').length > 0
        }, {
            timeout: 5000,
            timeoutMsg: 'Nenhum horário encontrado'
        })

        await $$('#divHorarios .horarioPartida')[0].click() // seleciona o primeiro horário

        // -- 6. Botão selecionar horario
        await $('#btnCarregaMapa-1').click()

        // -- 7. Selecionar poltrona
        await $('.livre').click()

        // -- 8. Continuar reserva
        await $('.botaoContinuarMapaPoltrona').click()

        //  -- 9. Preencher dados do passageiro
        // Nome Passageiro
        const passageiro = await $('.nomeDoUsuario')
        await passageiro.waitForDisplayed()
        await passageiro.click()
        await passageiro.setValue('Bruna Teste')

        // Selecionar tipo de documento: "RG"
        const tipoDocumento = await $('#tipoDoc-Passageiro-1')
        await tipoDocumento.waitForDisplayed()
        await tipoDocumento.selectByVisibleText('RG')

        // Preencher o número de documento
        const numeroDocumento = await $('#doc-Passageiro-1')
        await numeroDocumento.waitForDisplayed()
        await numeroDocumento.setValue('7116595121')

        // Preencher cpf obrigatório
        const cpfObrigatorio = await $('#cpf-Passageiro-1')
        await cpfObrigatorio.waitForDisplayed()
        await cpfObrigatorio.setValue('02838254057')

        // -- 10. Seleciona a forma de pagamento
        await $('#span_Crédito').click()

        // -- 11. Preenche dados cartão
        await $('#cartaoNumeroviacaoouroeprata').setValue('4444333322221111')
        await $('#ValidadeCartao_Credito').setValue('05/2030')
        await $('#cartaoCodigoSeguranca').setValue('123')
        await $('#cartaoNomeImpresso').setValue('Bruna Santos')
        await $('#CpfTitularCartao').setValue('02838254057')

        // -- 12. Botão pagar
        await $('.botaoComprarCreditoVeppo').click()

        // -- 13. Aguardar mensagem de sucesso
        const mensagem = await $('.conteinerMsg').getText()

        expect(mensagem).toContain(
            'Nós já disponibilizamos sua(s) passagem(s). Verifique seu e-mail'
        )

    })
})
