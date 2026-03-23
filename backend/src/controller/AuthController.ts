const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { hashToken, gerarTokens } = require('../src/config/crypto');
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas. Tente novamente mais tarde.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    })
  }
})

exports.register = async (req, res) => {
  const { nome_estabelecimento, cnpj, nome_usuario, email, senha } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [estabResult] = await connection.query(
      'INSERT INTO ESTABELECIMENTO (Nome, CNPJ) VALUES (?, ?)',
      [nome_estabelecimento, cnpj]
    );
    const idEstabelecimento = estabResult.insertId;

    const [cargoResult] = await connection.query(
      'INSERT INTO CARGO (ID_Estabelecimento, Nome, Permissoes_JSON) VALUES (?, ?, ?)',
      [idEstabelecimento, 'Gerente', JSON.stringify(["ALL"])]
    );
    const idCargo = cargoResult.insertId;

    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    const [userResult] = await connection.query(
      'INSERT INTO USUARIO (ID_Estabelecimento, ID_Cargo, Nome, Email, Senha, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [idEstabelecimento, idCargo, nome_usuario, email, senhaHash, 'Ativo']
    );
    const idUsuario = userResult.insertId;

    await connection.query(
      'UPDATE ESTABELECIMENTO SET ID_Gerente_Responsavel = ? WHERE ID_Estabelecimento = ?',
      [idUsuario, idEstabelecimento]
    );

    await connection.commit();

    const token = jwt.sign(
      { id: idUsuario, estabelecimento: idEstabelecimento, cargo: idCargo },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({ token, usuario: { id: idUsuario, nome: nome_usuario, email } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao registrar usuário e estabelecimento.' });
  } finally {
    connection.release();
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM USUARIO WHERE Email = ? AND Status = "Ativo"', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
    }

    const usuario = users[0];
    const senhaValida = await bcrypt.compare(senha, usuario.Senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const { accessToken, refreshToken } = (await gerarTokens(usuario, pool));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken, usuario: { id: usuario.ID_Usuario, nome: usuario.Nome, email: usuario.Email } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Token não fornecido.' })
  }

  const hash = hashToken(refreshToken)
  const [tokens] = await pool.query(
    'SELECT * FROM REFRESH_TOKEN WHERE Token_Hash = ? AND Revogado = ?',
    [hash, false]
  )

  if (tokens.length === 0) {
    return res.status(403).json({ error: 'Refresh token inválido.' })
  }

  await pool.query(
    'UPDATE REFRESH_TOKEN SET Revogado = ? WHERE Token_Hash = ?',
    [true, hash]
  )

  const [usuario] = await pool.query(
    'SELECT * FROM USUARIO WHERE ID_Usuario = ?',
    [tokens[0].ID_Usuario]
  )

  if (users.length === 0) {
    return res.status(403).json({ error: 'Usuário inválido.' })
  }

  const { accessToken, refreshToken: newRefreshToken } = await gerarTokens(usuario[0], pool)

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 24 * 60 * 60 * 1000
  })

  res.json({ accessToken, usuario: { id: usuario[0].ID_Usuario, nome: usuario.Nome, email: usuario.Email } });
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Token não fornecido.' })
  }
  const hash = hashToken(refreshToken)
  const [tokens] = await pool.query(
    'SELECT * FROM REFRESH_TOKEN WHERE Token_Hash = ? AND Revogado = ?',
    [hash, false]
  )

  if (tokens.length === 0) {
    return res.status(403).json({ error: 'Refresh token inválido.' })
  }
  await pool.query(
    'UPDATE REFRESH_TOKEN SET Revogado = ? WHERE Token_Hash = ?',
    [true, hash]
  )
  res.clearCookie('refreshToken')
  res.status(204).send()
};

exports.perfil = async (req, res) => {
  const usuario = req.usuario;
  const cargo = req.usuario.cargo;
  const [users] = await pool.query('SELECT * FROM USUARIO WHERE ID_Usuario = ? AND Status = "Ativo"', usuario);

  if (users.length === 0) {
    return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
  }
  const [roles] = await pool.query('SELECT * FROM CARGO WHERE ID_Cargo = ?', [cargo]);

  res.json({usuario: {id: users[0].id, nome: users[0].Nome, email: users[0].Email}, cargo: {
    id: roles[0].ID_Cargo,
    nome: roles[0].Nome,
    permissoes: roles[0].Permissoes_JSON
  }});
}