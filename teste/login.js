import { loginAndSaveSession } from '../helpers/helper.js'

describe('Login e salvar sessão', () => {
    it('Deve realizar login e salvar cookies', async () => {
        await loginAndSaveSession()
    })
})
