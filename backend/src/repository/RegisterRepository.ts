import { DataSource, Repository } from "typeorm";
import { Establishment, Register } from "../database";
import { CreateRegisterParamsMP } from "../dto";

export class RegisterRepository extends Repository<Register>{

    constructor(private dataSource: DataSource) {
        super(Register, dataSource.createEntityManager());
    }

    async createRegister(register: CreateRegisterParamsMP) {
        return await this.save(register)
    }

    async getRegister(registerId: number) {
        return await this.findOne({
            where: {
                id: registerId
            }
        })
    }

    async listRegisters() {
        return await this.find()
    }

    async listRegistersByEstablishment(establishment: Establishment) {
        return await this.find({
            where: {
                establishment
            }
        })
    }

    async deleteRegister(registerId: number) {
        await this.softDelete(registerId)
    }

    async associateToTerminal(registerId: number, terminalId: string) {
        await this.update(registerId, {terminalId})
    }

}