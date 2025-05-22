import { restoreSession } from '../helpers/helper.js'

describe('Testes com sessão existente', () => {
    before(async () => {
        await restoreSession()
    })

    it('Deve verificar se usuário continua logado', async () => {
        await expect($('.btnMenuCabecalho')).toBeExisting()
    })
})
