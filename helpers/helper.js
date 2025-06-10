import fs from 'fs'

export async function loginAndSaveSession() {
    await browser.url('https://url-de-teste/Login')

    await $("[name='LoginUsuario']").setValue('teste@email.com.br')
    await $("[name='LoginSenha']").setValue('xxxxxxxx')
    await $("[id='btnLogar']").click()

    await browser.waitUntil(async () => {
        return await browser.getUrl() !== 'https://url-de-teste/Login'
    }, {
        timeout: 5000,
        timeoutMsg: 'Login não redirecionou para a página principal'
    })

    const cookies = await browser.getCookies()
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2))
}

export async function restoreSession() {
    await browser.url('https://url-de-teste/Login')

    const rawCookies = fs.readFileSync('./cookies.json')
    const cookies = JSON.parse(rawCookies)

    const sanitizedCookies = cookies.map((cookie) => {
        const { name, value, domain, path, expiry, secure, httpOnly, sameSite } = cookie

        const cleanedCookie = {
            name,
            value,
            domain,
            path,
            secure: !!secure,
            httpOnly: !!httpOnly,
            sameSite: sameSite || 'Lax'
        }

        // Força expiry como inteiro (se existir)
        if (expiry) {
            cleanedCookie.expiry = Math.floor(expiry)
        }

        return cleanedCookie
    })

    for (const cookie of sanitizedCookies) {
        await browser.setCookies(cookie)
    }

    await browser.refresh()
}
