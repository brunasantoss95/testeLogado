import { restoreSession } from '../helpers/helper.js'

describe('Acesso a Página Principal', () => {
    before(async () => {
        await restoreSession()
    })

    it('Deve exibir o botão do menu após login', async () => {
        await expect($('.btnMenuCabecalho')).toBeExisting()
    })

    it('Deve conter a URL /Principal', async () => {
        const url = await browser.getUrl()
        expect(url).toMatch(/Principal/i)
    })
})
