import { Injectable } from '@angular/core';
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { FaceClient } from "@azure/cognitiveservices-face";

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private APIKEY = 'eastus';
  private ENDPOINT = 'https://camapp.cognitiveservices.azure.com/';

  constructor() { }

  async descreverImagem(foto: Blob) {
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(this.APIKEY);
    const client = new ComputerVisionClient(cognitiveServiceCredentials, this.ENDPOINT);

    return await client.describeImageInStream(foto, { language: 'pt' }).then(retorno => {
      console.log('Descrever Imagem: ', retorno);

      return {
        descricao: retorno.captions ? retorno.captions[0].text : "",
        confianca: retorno.captions ? retorno.captions[0].confidence : "",
        tags: retorno.tags ? retorno.tags : [],
        tipo: 'descrever'
      }
    });
  }

  async tagsImagem(foto: Blob) {
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(this.APIKEY);
    const client = new ComputerVisionClient(cognitiveServiceCredentials, this.ENDPOINT);

    return await client.tagImageInStream(foto, { language: 'pt' }).then(retorno => {
      console.log('Tags Imagem: ', retorno);

      return {
        tags: retorno.tags,
        tipo: 'tags'
      }
    });
  }

  async deteccaoFacial(foto: Blob) {
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(this.APIKEY);
    const client = new FaceClient(cognitiveServiceCredentials, this.ENDPOINT);

    return await client.face.detectWithStream(foto,
      {
        detectionModel: 'detection_01',
        recognitionModel: 'recognition_04',
        returnFaceAttributes: ['age', 'gender', 'headPose', 'smile', 'facialHair', 'glasses', 'emotion', 'hair',
          'makeup', 'occlusion', 'accessories', 'blur', 'exposure', 'qualityForRecognition']
      }
    ).then(retorno => {
      console.log('Detecção de Face: ', retorno);

      return retorno.map(face => ({
        atributos: face.faceAttributes,
        posicao: face.faceRectangle,
      }));
    });
  }
  async getBlob(foto: Foto) {
    // Busca o arquivo no File System
    const file = await this.readFile(foto);
    // Converte o arquivo para Blob
    const response = await fetch(file);
    // Retorna o Blob
    return await response.blob();
  }

  private async readFile(foto: Foto) {
    // If running on the web...
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      const readFile = await Filesystem.readFile({
        path: foto.filepath,
        directory: Directory.Data,
      });

      // Web platform only: Load the photo as base64 data
      foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }

    return foto.webviewPath as string;
}
