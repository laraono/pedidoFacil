const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

    const salt = await bcrypt.genSalt(10);
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
      { expiresIn: '24h' }
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

    const token = jwt.sign(
      { id: usuario.ID_Usuario, estabelecimento: usuario.ID_Estabelecimento, cargo: usuario.ID_Cargo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, usuario: { id: usuario.ID_Usuario, nome: usuario.Nome, email: usuario.Email } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};