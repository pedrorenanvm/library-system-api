import CreateTitleService from '@modules/title/services/CreateTitleService';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';


export default class TitleController { 
    async create(req: Request, res: Response): Promise<Response> {
        const {name, description, type, maxLoanDays, totalCopies } = req.body;

        const createTitle = container.resolve(CreateTitleService);

        const title = await createTitle.execute({
            name, 
            description,
            type,
            maxLoanDays,
            totalCopies,
        });
        
        return res.status(201).json(instanceToPlain(title));
    }
}