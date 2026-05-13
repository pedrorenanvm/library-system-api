import { ICreateTitle } from "../models/ICreateTitle";  
import { ITitle } from "../models/ITitle";

export interface ITitleRepository {
    findById(id: string): Promise<ITitle | null>;
    findByName(name: string): Promise<ITitle | null>;
    create(data: ICreateTitle): Promise<ITitle>;
    update(title: ITitle): Promise<ITitle>;
    delete(id: string): Promise<void>;
}

