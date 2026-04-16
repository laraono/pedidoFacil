import { Category, Establishment } from "../database";
import { CreateCategory, EditCategory } from "../dto";
import { CategoryStatus, ProductStatus } from "../enum";
import { AppError } from "../middleware";
import { CategoryRepository, EstablishmentRepository, ProductRepository } from "../repository";
import { uploadToS3, generateUniqueImageKey, getImageContentType, ensureBucketExists, getFromS3, checkFileExists } from "./S3Service";

export class CategoryService {

    private categoryRepository: CategoryRepository
    private establishmentRepository: EstablishmentRepository
    private productRepository: ProductRepository

    constructor(
        categoryRepository: CategoryRepository, 
        establishmentRepository: EstablishmentRepository,
        productRepository: ProductRepository
    ) {
        this.categoryRepository = categoryRepository
        this.establishmentRepository = establishmentRepository
        this.productRepository = productRepository
    }

    async createCategory(category: CreateCategory) {

        const establishment = await this.establishmentRepository.getEstablishment(category.establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        const imageUrl = await this.saveImage(category, establishment.name)

        const categoryParams = { 
            establishment,
            name: category.name,
            image: imageUrl
        }

        const {id} = await this.categoryRepository.createCategory(categoryParams) 

        return id
    }

    async listCategories({establishmentId}:{establishmentId: number}) {
        const categories =  await this.categoryRepository.listCategories(establishmentId)

        const establishment = await this.establishmentRepository.getEstablishment(establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        categories.map( (category) => {
            if(category.image) {
                
                const imageURL = this.getImage(establishment, category)

                category.image = imageURL
            }
        })

        return categories
    }

    async listActiveCategories({establishmentId}:{establishmentId: number}) {
        const categories = await this.categoryRepository.listActiveCategories(establishmentId)

        const establishment = await this.establishmentRepository.getEstablishment(establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        categories.map( (category) => {
            if(category.image) {
                
                const imageURL = this.getImage(establishment, category)

                category.image = imageURL
            }
        })

        return categories
    }

    async getCategory(categoryId: number) {
        return await this.categoryRepository.getCategory(categoryId)
    }

    getImage(establishment: Establishment, category: Category) {
        const bucketName = establishment.name.toLocaleLowerCase()

        const endpoint = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
        return `${endpoint}/${bucketName}/${category.image}`
    }

    async updateCategory(categoryId: number, params: EditCategory) {

        const establishment = await this.establishmentRepository.getEstablishment(params.establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        const imageUrl = await this.saveImage(params, establishment.name)

        const categoryParams = { 
            ...params,
            image: imageUrl
        }
        await this.categoryRepository.updateCategory(categoryId, categoryParams)

        const category = await this.categoryRepository.getCategory(categoryId)

        if(!category) {
            throw new AppError('Categoria não existe', 400)
        }

        category.products.forEach(async(product) => {
            const productStatus = params.status === CategoryStatus.ATIVA 
            ? ProductStatus.ATIVO 
            : ProductStatus.ARQUIVADO

            await this.productRepository.updateProductStatus(product.id, productStatus)
        })
    }

    async deleteCategory(categoryId: number) {
        const category = await this.categoryRepository.getCategory(categoryId)

        if(!category) {
            throw new AppError('Categoria não existe', 400)
        }

        if(category.products) {
            throw new AppError('Categoria possui produtos ligados a ela e não pode ser deletada', 409)
        }

        await this.categoryRepository.deleteCategory(categoryId)
    }

    async saveImage(category: CreateCategory, name: string) {
        const bucketName = name.toLocaleLowerCase()

        await ensureBucketExists(bucketName)

        if(!category.image) return ''

        try {
            const imageKey = generateUniqueImageKey(category.image);

            const doesImageExist = await checkFileExists(bucketName, imageKey)
            
            if(!doesImageExist) return imageKey

            const result = await uploadToS3({
                bucket: bucketName, 
                key: imageKey, 
                body: category.image,
                contentType: getImageContentType(category.image)
            })

            if (!result.Location) 
                throw new AppError("Falha ao obter URL da imagem", 500);

            return imageKey

        } catch(error) {
            throw new AppError(`Erro ao salvar imagem: ${error}`, 500)
        }
    }  
}