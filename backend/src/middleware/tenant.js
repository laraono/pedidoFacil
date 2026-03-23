module.exports = function verifyTenancy(tabela, paramId) {
  return async (req, res, next) => {
    const establishment = req.usuario.estabelecimento
    const recursoId = req.params[paramId]

    const [rows] = await pool.query(
      `SELECT * FROM ${tabela} WHERE ID_${tabela} = ?`,
      [recursoId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recurso não encontrado.' })
    }

    if (rows[0].ID_Estabelecimento !== establishment) {
      return res.status(403).json({ error: 'Acesso negado.' })
    }

    next()
  }
}