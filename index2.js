// Cargando el modulo de Express.js
const express = require('express');
// Cargando la librería de express-fileupload
const fileUpload = require('express-fileupload');
const util = require('util');
const fs = require('fs');
const baseUrl = "http://localhost:5001/files/";
// Este variable define el puerto del computador donde la API está disponible
const PORT = 5001;
// Definimos la variable que inicializa la libreria Express.js
const app = express();
// Middleware
app.use(fileUpload({
 createParentPath: true
}));
// 1 - El puerto donde está disponible la API
// 2 - Una función de llamada (callback) cuando la API esta lista
app.listen(PORT, () =>
 console.log(`Corriendo en el servidor, API REST subida de archivos
express-fileupload que se esta ejecutando en: http: //localhost:${PORT}.`)
);

app.post('/upload',  (req, res) => {
    // Validando la no existencia de un archivo vacio
    if (!req.files || Object.keys(req.files).length === 0) {
        res.send({
            status: false,
            message: 'Archivo no subido al servidor',
            error: "400"
        });
        if (req.files.length > 3) {
            return res.status(400).json({ error: 'Se ha alcanzado el límite máximo de archivos permitidos' });
          }

    } else { // Se procede con la subida del archivo al servidor
        let fileRecived = req.files.fileName;
        let extName = fileRecived.name;
        console.log(fileRecived);
        uploadPath = './files/' + extName;
        // Validando que el archivo sea solo una imagen en formato png. ó .jpeg
        if (fileRecived.mimetype === "image/png" || fileRecived.mimetype === "image/jpeg"){
    
        fileRecived.mv(uploadPath, err => {
            if (err) {
            return res.status(500).send({
                message: err
    });
    }
            return res.status(200).send({
                message: 'Archivo Subido al Servidor'
            });
        });
    } else {
            return res.status(400).send({
                message: 'Archivo no válido, solo .png ó .jpeg'
            });
         }
    }
});

app.get('/files', async (req, res) => {
    const directoryPath = "./files/";
    // El método fs.readdir() se utiliza para leer de forma
    // asíncrona el contenido de un directorio determinado. 
    fs.readdir(directoryPath, function(err, files) {
        if (err) {
            res.status(500).send({
            message: "No se puede buscar archivos en el directorio!",
            });
        }
    // Variable que contiene el listado de archivos en el servidor
    let listFiles = [];
    files.forEach((file) => {
        listFiles.push({
            name: file,
            url: baseUrl + file,
        });
    });
        res.status(200).send(listFiles);
    });
});

app.get('/files/:name', async (req, res) => {
    const fileName = req.params.name;
    const directoryPath = "./files/";
    // La función res.download() transfiere el archivo en la ruta 
    // como un "archivo adjunto". Por lo general, los navegadores 
    // le pedirán al usuario que descargue.
    res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
    res.status(500).send({
    message: "No se puede descargar el archivo. " + err,
    });
    }
});
});

app.delete('/files/:name', async (req, res) => {
    const fileName = req.params.name;
    const directoryPath = "./files/";
    let listFiles = [];
    try {
    fs.readdir(directoryPath, function(err, files) {
    if (err) {
    res.status(500).send({
    message: "No se puede buscar archivos en el directorio!",
    });
    }
    // Variable que contiene el listado de archivos en el servidor
    files.forEach((file) => {
    listFiles.push(file);
    });
    // verificamos si el archivo se encuentra en el directorio
    let fileBusqueda = listFiles.find(l => l === fileName);
    if (!fileBusqueda) {
    return res.status(409).json({
    message: 'No se encontró el archivo a eliminar en el servidor'
    });
    } else {
    // fs.unlinkSync elimina un archivo y espera hasta que se termine la 
    // operación para seguir ejecutando el código, también se puede
    // usar fs.unlink() que ejecuta dicha operación de forma asíncrona
    fs.unlinkSync(directoryPath + fileName);
    console.log('Archivo Eliminado');
    res.status(200).send("Archivo Eliminado Satisfactoriamente");
    }
    });
    } catch (err) {
    console.error('ocurrió algo incorrecto al eliminar el archivo',
   err)
    }
})