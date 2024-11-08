import { ObjectId, type OptionalId } from "mongodb";

export type LibroModel = OptionalId<{
    titulo: string,
    autores: ObjectId[],
    copias: number
}>

export type AutorModel = OptionalId<{
    nombre: string,
    biografia: string
}>

export type Libro = {
    id: string
    titulo: string,
    autores: Autor[],
    copias: number
}

export type Autor = {
    id: string,
    nombre: string,
    biografia: string
}