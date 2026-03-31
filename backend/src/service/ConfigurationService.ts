import { AppDataSource } from '../database/data-source'
import { Configuration } from '../database/entity/Configuration'
import { AppError } from '../middleware/error/AppError'

export class ConfigurationService {
    private configRepository = AppDataSource.getRepository(Configuration)

    async getOrCreateConfiguration(establishmentId: number) {
        let config = await this.configRepository.findOne({
            where: { id: establishmentId } // Busca usando a PrimaryColumn direta
        })

        // Se o restaurante não tem config, cria a padrão
        if (!config) {
            config = this.configRepository.create({
                id: establishmentId, 
                establishment: { id: establishmentId },
                backgroundColor: '#F4F4F9',
                cardsColor: '#FFFFFF',
                textsColor: '#333333',
                buttonsColor: '#E85D5D',
                buttonsTextColor: '#FFFFFF',
                activeCateogryColor: '#4CAF50',
                allowObservations: true
            })
            await this.configRepository.save(config)
        }

        return config
    }

    async updateConfiguration(establishmentId: number, data: Partial<Configuration>) {
        const config = await this.getOrCreateConfiguration(establishmentId)
        
        this.configRepository.merge(config, data)
        return await this.configRepository.save(config)
    }
}