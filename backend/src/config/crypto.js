const crypto = require('crypto')

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

async function gerarTokens(usuario, pool) {
    const accessToken = jwt.sign(
        { id: usuario.ID_Usuario, estabelecimento: usuario.ID_Estabelecimento, cargo: usuario.ID_Cargo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const refreshToken = crypto.randomBytes(64).toString('hex')
    const hash = hashToken(refreshToken)

    let refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN));
    await pool.query(
        'INSERT INTO REFRESH_TOKEN (Token_Hash, ID_Usuario, Expires_At) VALUES (?, ?, ?)',
        [hash, usuario.ID_Usuario, refreshExpiresAt]
    )

    return { accessToken, refreshToken }
}

module.exports = { hashToken, gerarTokens }

