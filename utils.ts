import { Collection } from "mongodb";
import { AutorModel, Libro, LibroModel } from "./tps.ts"

export const fromModelToBook = async (
    model: LibroModel,
    authorCollection: Collection<AutorModel>
): Promise<Libro> => {
    const libros = await authorCollection.find({
        _id: {$in: model.autores}
    }).toArray();

    return{
        id: model._id!.toString(),
        titulo: model.titulo,
        copias: model.copias,
        autores: libros.map(fromModelToAuthor)
    }
}

export const fromModelToAuthor = ((model: AutorModel) => ({
    id: model._id!.toString(),
    nombre: model.nombre,
    biografia: model.biografia
}))