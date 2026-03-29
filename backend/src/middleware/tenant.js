const { AppDataSource } = require('../database');
const { Comanda, Order } = require('../database');

const entityMap = {
	COMANDA: Comanda,
	PEDIDO: Order,
};

function verifyTenancy(tabela, paramId) {
	return async (req, res, next) => {
		try {
			const establishmentId = req.usuario.estabelecimento;
			const recursoId = req.params[paramId];

			const entity = entityMap[tabela];
			if (!entity) {
				return res.status(400).json({ error: `Tabela desconhecida: ${tabela}` });
			}

			const repo = AppDataSource.getRepository(entity);
			const resource = await repo.findOne({
				where: { id: Number(recursoId) },
				relations: { establishment: true },
			});

			if (!resource) {
				return res.status(404).json({ error: 'Recurso não encontrado.' });
			}

			if (resource.establishment.id !== establishmentId) {
				return res.status(403).json({ error: 'Acesso negado.' });
			}

			next();
		} catch (err) {
			next(err);
		}
	};
}

module.exports = { verifyTenancy };
