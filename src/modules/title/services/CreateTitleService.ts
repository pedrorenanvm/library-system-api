import { inject, injectable } from "tsyringe";
import { TitleType } from "../infra/typeorm/entities/Title";
import { ITitleRepository } from "../domain/repositories/ITitleRepository";
import { REPOSITORY_KEYS } from "@shared/container/keys";
import { ITitle } from "../domain/models/ITitle";
import AppError from "@shared/errors/AppError";

interface IRequest {
    name: string;
    description?: string | null;
    type: TitleType;
    maxLoanDays: number;
    totalCopies: number;
}

@injectable()
class CreateTitleService {

    constructor(
        @inject(REPOSITORY_KEYS.TitleRepository)
        private titleRepository: ITitleRepository
    ) {}

    public async execute({
        name,
        description,
        type,
        maxLoanDays,
        totalCopies,
    }: IRequest): Promise<ITitle> {
      const titleAlreadyExists = await this.titleRepository.findByName(name);
      if(titleAlreadyExists) {
        throw new AppError('Já existe um título cadastrado com este nome', 409);
      }

      if(maxLoanDays <= 0) {
        throw new AppError('O número máximo de dias para empréstimo deve ser maior que zero',
             422
        );
      }

      if( totalCopies < 0) {
        throw new AppError('O número de exemplares não pode ser negativo.', 422);
      }

      const title = await this.titleRepository.create({
        name,
        description: description ?? null,
        type,
        maxLoanDays,
        totalCopies,
      });

      return title;
    }
}

export default CreateTitleService;