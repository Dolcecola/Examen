import { MongoClient, ObjectId } from "mongodb";
import { AutorModel, LibroModel } from "./tps.ts";
import { fromModelToBook } from "./utils.ts";

//const mongo_url = "mongodb+srv://examen:nebrija@cluster0.h7shi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongo_url = Deno.env.get("MONGO_URL");
if(!mongo_url){
    console.error("Url no encontrada");
    Deno.exit(1);
}

const client = new MongoClient(mongo_url);
await client.connect();
console.info("DB connected");

const db = client.db("Examen");
const librosCollection = db.collection<LibroModel>("Libros");
const autoresCollection = db.collection<AutorModel>("Autores");

const handler = async (req: Request): Promise<Response> => {
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    if(method === "GET"){
        if(path === "/libros"){
            const titulo = url.searchParams.get("titulo")
            if(titulo){

                const librosDB = await librosCollection.find({ titulo }).toArray();
                if(!librosDB){
                    return new Response("Error, no se econtraron libros con ese titulo", {status: 404});
                }
                console.log(librosDB);
                const libros = await Promise.all(librosDB.map((l) => fromModelToBook(l, autoresCollection)));
                return new Response(JSON.stringify(libros), {status: 200});
            }

            const librosDB = await librosCollection.find().toArray();
            console.log(librosDB);
            const libros = await Promise.all(librosDB.map((l) => fromModelToBook(l, autoresCollection)));
            return new Response(JSON.stringify(libros), {status: 200});

        } else if(path === "/libro"){
            const id = url.searchParams.get("id")
            if(id){

                const librosDB = await librosCollection.find({ _id: {$in: new ObjectId(id)} }).toArray();
                if(!librosDB){
                    return new Response("Error, no se econtraron libros con ese id", {status: 404});
                }
                console.log(librosDB);
                const libros = await Promise.all(librosDB.map((l) => fromModelToBook(l, autoresCollection)));
                return new Response(JSON.stringify(libros), {status: 200});
            }
        }
    } else if(method === "POST"){
        if(path === "/libro"){
            const body = await req.json();
            //const titulo = body.titulo;
            if(!body.titulo || !body.autores || !body.copias){
                return new Response("Bad request", {status: 400});
            }

            const e = await librosCollection.findOne({titulo: body.titulo});
            if(e){
                return new Response("Libro existente", {status: 400});
            }

            const {insertedId} = await librosCollection.insertOne({
                titulo: body.titulo,
                autores: [body.autores],
                copias: body.copias,
            })

            console.log({
                id: insertedId,
                titulo: body.titulo,
                autores: [],
                copias: body.copias,
            })

            return new Response("Libro creado", {status: 201})
        }
    } else if(method === "PUT"){
        if(path === "/libro"){
            const body = await req.json();

            if(!body.titulo || !body.autores || !body.copias){
                return new Response("Bad request", {status: 400});
            }   

            const {modifiedCount} = await librosCollection.updateOne(
                {_id: new ObjectId(body.id)},
                {$set: {titulo: body.titulo, autores: [body.autores], copias: body.copias}}
            )

            if(modifiedCount === 0){
                return new Response("Ningun libro actualizado", {status: 404});
            }

            return new Response("Libro acutalizado", {status: 200});
        }
    } else if(method === "DELETE"){
        if(path === "/libro"){
            const body = await req.json();
            /*const {deletedOne} = librosCollection.deleteOne(
                {_id: new ObjectId(body.id)}
            )

            if(deletedOne === 0){
                return new Response("Libro no encontrado", {status: 404});
            }

            return new Response("Libro borrado exitosamente", {status: 200});*/
        }
    }

    return new Response("Endpoint not found!", {status: 404});
}

Deno.serve({port: 3000}, handler);