import { Title } from "@modules/title/infra/typeorm/entities/Title";
import { ITitleRepository } from "../../../domain/repositories/ITitleRepository";
import { Repository } from "typeorm";
import { AppDataSource } from "@shared/infra/typeorm/dataSource";
import { ITitle } from "@modules/title/domain/models/ITitle";
import { ICreateTitle } from "@modules/title/domain/models/ICreateTitle";

export class TitleRepository implements ITitleRepository {

    private ormRepository: Repository<Title>;


    constructor() {
        this.ormRepository = AppDataSource.getRepository(Title);

    }

    async findById(id: string): Promise<ITitle | null> {

        return await this.ormRepository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<ITitle | null> {

        return await this.ormRepository.findOne({ where: { name } });
    }

    async create(data: ICreateTitle): Promise<ITitle> {

        const title = this.ormRepository.create(data);
        await this.ormRepository.save(title);
        return title;
        
    }

    async update(title: ITitle): Promise<ITitle> {
        await this.ormRepository.save(title);
        return title;
    }
    
    async delete(id: string): Promise<void> {
        await this.ormRepository.delete(id);
    }

}